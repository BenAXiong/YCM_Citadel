import os
import json
import time
import argparse
from typing import Dict, List, Any

from core.network import http_get_json, repair_mojibake
from core.processors import create_sentence_record, create_dictionary_record, append_to_jsonl
from core.constants import TWELVE_DIALECTS

# Endpoints
WORD_URL = "https://web.klokah.tw/vocabulary/php/getWords.php"
SENTENCE_URL = "https://web.klokah.tw/vocabulary/php/getSentence.php"
WAWA_URL = "https://web.klokah.tw/wawa/word.php"

# Mapping from Dialect ID to Sentence TID (from index.js stcArr)
STC_MAPPING = [0,29691,29713,29734,29648,29692,29699,29721,29647,29681,29649,29711,0,29722,29660,29710,29683,29671,29709,29769,29698,29682,29738,29714,29723,29743,29693,29784,29761,29700,29672,29736,29670,29766,29654,29724,29701,29792,29735,29715,29669,29702,29725,29653]

# Categorical range to probe
CATEGORIES = [f"{i:02d}" for i in range(1, 40)] # Probing 01 to 39

def scrape_vocabulary(data_dir: str, dialects: List[int] = None):
    distilled_sentences = os.path.join(data_dir, "distilled", "sentences.jsonl")
    distilled_dictionary = os.path.join(data_dir, "distilled", "dictionary.jsonl")
    raw_vocab_dir = os.path.join(data_dir, "raw", "vocabulary")
    os.makedirs(raw_vocab_dir, exist_ok=True)
    
    dialect_ids = dialects or list(TWELVE_DIALECTS.keys())
    
    for d_id in dialect_ids:
        dialect_name = TWELVE_DIALECTS.get(d_id, f"dialect_{d_id}")
        print(f"\n--- Plouging Vocabulary: {dialect_name} (ID: {d_id}) ---")
        
        # 1. Scrape Sentences (TID based)
        if d_id < len(STC_MAPPING) and STC_MAPPING[d_id] != 0:
            tid = STC_MAPPING[d_id]
            print(f"  Fetching Sentences (TID: {tid})...")
            try:
                stc_data = http_get_json(SENTENCE_URL, params={"tid": tid})
                if stc_data and isinstance(stc_data, list):
                    records = []
                    for idx, item in enumerate(stc_data):
                        ab = repair_mojibake(item.get("ab", ""))
                        zh = repair_mojibake(item.get("ch", ""))
                        sn = item.get("sn", "")
                        audio_url = f"https://web.klokah.tw/text/sound/{sn}.mp3" if sn else ""
                        
                        records.append(create_sentence_record(
                            uuid=f"vocab_stc_{d_id}_{tid}_{idx}",
                            ab=ab, zh=zh, audio_id=sn, audio_url=audio_url,
                            source="vocabulary_stc", lang_id=d_id, dialect=dialect_name,
                            category="Pattern Practice"
                        ))
                    append_to_jsonl(distilled_sentences, records)
                    print(f"    -> Appended {len(records)} sentences.")
            except: pass

        # 2. Scrape Words (Category based)
        total_words = 0
        for cate_prefix in CATEGORIES:
            # We don't know the full category name, but Klokah uses the prefix in the ID
            # Wait, the API requires the PRECISE category name in some modules?
            # Index.js says: cate = $(this).attr("data-value");
            # Let's try matching known prefixes
            pass
        
        # Optimization: Since many categories follow standard names, we can try to guess or use a smarter probe.
        # From previous AJAX, cate='01數字計量'. Notice it includes the prefix.
        
        # Actually, let's just use the categories we found in the browser.
        known_cates = [
            "01數字計量", "02代名詞與限定詞", "03疑問詞", "04人物", "05身體部位",
            "06親屬稱謂", "07穿戴服飾", "08器物與建物", "09動植物", "10自然與環境",
            "11時間、方位、地點", "12社會宗教、情感、動作", "13抽象概念及其他",
            "14數詞", "15量詞", "16連詞", "17介詞", "18副詞", "19感嘆詞", 
            "20助詞", "21否定詞", "22助動詞", "36助詞或其他"
        ]
        
        dict_records = []
        for cate in known_cates:
            try:
                words = http_get_json(WORD_URL, params={"did": d_id, "cate": cate})
                if words and isinstance(words, list):
                    for item in words:
                        ab = repair_mojibake(item.get("ab", ""))
                        zh = repair_mojibake(item.get("ch", ""))
                        en = item.get("en", "")
                        lv = item.get("lv", "")
                        n = item.get("n", "").replace("-", "_")
                        audio_url = f"https://web.klokah.tw/vocabulary/audio/word/{d_id}/{n}.mp3" if n else ""
                        
                        dict_records.append(create_dictionary_record(
                            word_id=f"voc_{d_id}_{n}",
                            ab=ab, zh=zh, en=en, audio_url=audio_url,
                            lang_id=d_id, dialect=dialect_name, category=cate, level=lv
                        ))
                time.sleep(0.05)
            except: pass
            
        if dict_records:
            append_to_jsonl(distilled_dictionary, dict_records)
            print(f"    -> Harvested {len(dict_records)} vocabulary words.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser("Vocabulary Scraper")
    parser.add_argument("--dialects", nargs="+", type=int)
    args = parser.parse_args()
    
    base_data = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    scrape_vocabulary(base_data, args.dialects)
