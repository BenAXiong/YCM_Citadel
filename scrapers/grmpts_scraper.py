import os
import re
import json
import time
import argparse
from typing import Dict, List, Any, Set
from bs4 import BeautifulSoup

from core.network import http_get, repair_mojibake
from core.processors import create_sentence_record, append_to_jsonl, sanitize_dialect_name

GRMPTS_LID_JSON = "https://web.klokah.tw/grmpts/json/{lid}.json"
READ_EMBED = "https://web.klokah.tw/text/read_embed.php"

LID_NAME_MAP: Dict[int, str] = {
    1:"阿美語",2:"泰雅語",3:"賽夏語",4:"邵語",5:"賽德克語",6:"布農語",7:"排灣語",8:"魯凱語",
    9:"太魯閣語",10:"噶瑪蘭語",11:"鄒語",12:"卑南語",13:"雅美語",14:"撒奇萊雅語",15:"卡那卡那富語",16:"拉阿魯哇語"
}

DEFAULT_AUDIO_URL_TEMPLATE = "https://file.klokah.tw/sound/{audio_id}.mp3"

def parse_read_embed(html: str) -> List[Dict[str, Any]]:
    soup = BeautifulSoup(html, "html.parser")
    main = soup.select_one("#read-main") or soup
    out = []
    
    # We select containers having `.read-play-btn` inside them
    for item in main.select("div:has(> button.read-play-btn)"):
        play_btn = item.select_one("button.read-play-btn")
        ab_div = item.select_one("div.read-sentence.Ab")
        ch_div = item.select_one("div.read-sentence.Ch")
        
        if not play_btn or not ab_div:
            continue
            
        audio_id = play_btn.get("data-value") or ""
        words = [w.get_text(strip=True) for w in ab_div.select("div.word")]
        ab = re.sub(r"\s+", " ", " ".join([w for w in words if w])).strip()
        ch = ch_div.get_text(" ", strip=True) if ch_div else ""
        
        ab = repair_mojibake(ab)
        ch = repair_mojibake(ch)
        
        if not ab and not ch:
            continue
            
        out.append({"ab": ab, "ch": ch, "audio_id": audio_id})
    return out

def get_lid_json(lid: int, raw_dir: str) -> dict:
    """Downloads or loads the master JSON for a given LID."""
    filename = os.path.join(raw_dir, f"{lid}.json")
    if os.path.exists(filename):
        with open(filename, "r", encoding="utf-8") as f:
            return json.load(f)
            
    print(f"[{lid}] Fetching master JSON...")
    r = http_get(GRMPTS_LID_JSON.format(lid=lid))
    data = r.json()
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return data

def scrape_grmpts(lids: List[int], data_dir: str):
    raw_grmpts_dir = os.path.join(data_dir, "raw", "grmpts")
    distilled_file = os.path.join(data_dir, "distilled", "sentences.jsonl")
    os.makedirs(raw_grmpts_dir, exist_ok=True)
    
    # Track which TIDs we've seen globally so we don't hammer the server for duplicates
    # Since tids are shared across languages sometimes, we map them globally.
    seen_tids: Set[int] = set()
    
    for lid in lids:
        lang_name = LID_NAME_MAP.get(lid, "Unknown")
        print(f"\n--- Processing LID {lid} ({lang_name}) ---")
        
        lid_json = get_lid_json(lid, raw_grmpts_dir)
        
        distilled_records = []
        
        # Structure is {"l1":{"t1":[tid1, tid2], "t2":[]}, "l2":...}
        for level_str, levels in lid_json.items():
            if not isinstance(levels, dict): continue
            
            try:
                # 'l1' -> 1
                level_int = int(level_str.replace("l", ""))
            except:
                level_int = 0
                
            for unit_str, raw_tids in levels.items():
                if not isinstance(raw_tids, list): continue
                
                category = unit_str # e.g. 't1'
                
                for tid in raw_tids:
                    try:
                        tid_i = int(tid)
                    except:
                        continue
                        
                    if tid_i == 0 or tid_i in seen_tids:
                        continue
                        
                    seen_tids.add(tid_i)
                    print(f"  [{lid}] Fetching TID {tid_i} (L{level_int} {category})...")
                    
                    r = http_get(READ_EMBED, params={"tid": tid_i, "mode": 1, "num": 1})
                    sentences = parse_read_embed(r.text)
                    
                    # Store Raw HTML Backup
                    with open(os.path.join(raw_grmpts_dir, f"{tid_i}.html"), "w", encoding="utf-8") as f:
                        f.write(r.text)
                        
                    for idx, s in enumerate(sentences):
                        audio_url = DEFAULT_AUDIO_URL_TEMPLATE.format(audio_id=s['audio_id']) if s['audio_id'] else ""
                        
                        record = create_sentence_record(
                            uuid=f"grmpts_{lid:02d}_{tid_i}_{idx}",
                            ab=s['ab'],
                            zh=s['ch'],
                            audio_id=s['audio_id'],
                            audio_url=audio_url,
                            source="grmpts",
                            lang_id=lid,
                            dialect=sanitize_dialect_name(lang_name),
                            category=category,
                            level=level_int
                        )
                        distilled_records.append(record)
                        
                    time.sleep(0.15)
                    
        if distilled_records:
            append_to_jsonl(distilled_file, distilled_records)
            print(f"[{lid}] Appended {len(distilled_records)} sentences to distilled model.")
        else:
            print(f"[{lid}] No new sentences found/processed.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser("GRMPTS Scraper")
    parser.add_argument("--lids", nargs="+", type=int, default=list(range(1, 17)))
    args = parser.parse_args()
    
    base_data = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    scrape_grmpts(args.lids, base_data)
