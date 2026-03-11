import os
import json
import time
import argparse
from typing import Dict, List, Any

from core.network import http_get_json, repair_mojibake
from core.processors import create_sentence_record, append_to_jsonl, sanitize_dialect_name
from core.constants import TWELVE_DIALECTS

# Endpoint pattern: ?d=dialect&l=level&c=class
BASE_URL_L1_L9 = "https://web.klokah.tw/twelve/php/getTextNew.php"
BASE_URL_L10_L12 = "https://web.klokah.tw/twelve/php/getTextNewTwelve.php"
AUDIO_ROOT = "https://web.klokah.tw/twelve/sound/" # Pattern: {d}/S1/{c}/{file}.mp3

def scrape_twelve(data_dir: str, dialects: List[int] = None, start_level_arg: int = 1):
    distilled_file = os.path.join(data_dir, "distilled", "sentences.jsonl")
    raw_twelve_dir = os.path.join(data_dir, "raw", "twelve")
    os.makedirs(raw_twelve_dir, exist_ok=True)
    
    dialect_ids = dialects or list(TWELVE_DIALECTS.keys())
    
    for d_id in dialect_ids:
        dialect_name = TWELVE_DIALECTS.get(d_id, f"dialect_{d_id}")
        print(f"\n--- Processing Twelve-Year Curric: {dialect_name} (ID: {d_id}) ---")
        
        start_level = start_level_arg
        
        # Iterating through 12 Levels and 10 Classes
        for level in range(start_level, 13):
            for class_num in range(1, 11):
                params = {"d": d_id, "l": level, "c": class_num}
                
                try:
                    # Fetching the lesson data
                    url = BASE_URL_L10_L12 if level >= 10 else BASE_URL_L1_L9
                    data = http_get_json(url, params=params)
                    
                    # Save Raw Json Backup
                    if data:
                        raw_filename = f"d{d_id}_l{level}_c{class_num}.json"
                        with open(os.path.join(raw_twelve_dir, raw_filename), "w", encoding="utf-8") as f:
                            json.dump(data, f, ensure_ascii=False, indent=2)
                        
                        print(f"  -> Extracted {dialect_name} L{level} C{class_num}")
                    
                    content_list = []
                    if data:
                        if isinstance(data, dict):
                            if "sentence" in data:
                                content_list = data["sentence"]
                            elif "content" in data:
                                content_list = data["content"]
                        elif isinstance(data, list):
                            content_list = data
                    
                    if not content_list:
                        continue
                        
                    for idx, item in enumerate(content_list):
                        # Twelve curriculum has 'ab', 'chinese', and word-level 'word' array
                        ab_text = repair_mojibake(item.get("ab", ""))
                        ch_text = repair_mojibake(item.get("chinese", ""))
                        
                        if not ab_text and not ch_text:
                            continue
                            
                        # Audio URLs in Twelve are full Cloudfront links in the JSON
                        audio_url = item.get("sound", "")
                        audio_id = audio_url.split('/')[-1].replace('.wav', '').replace('.mp3', '') if audio_url else ""
                        
                        word_data = None
                        if "word" in item and isinstance(item["word"], list):
                            # The NewTwelve might structure words differently, 
                            # we need to map {"ab": "...", "ch": "..."} instead of strict matching if keys differ
                            words = []
                            for w in item["word"]:
                                # some APIs return 'ch', others return 'chinese'
                                ab_w = repair_mojibake(w.get("ab", ""))
                                zh_w = repair_mojibake(w.get("ch", w.get("chinese", "")))
                                if ab_w or zh_w:
                                    words.append({"ab": ab_w, "zh": zh_w})
                            word_data = words

                        record = create_sentence_record(
                            uuid=f"twelve_{d_id}_{level}_{class_num}_{idx}",
                            ab=ab_text,
                            zh=ch_text,
                            audio_id=audio_id,
                            audio_url=audio_url,
                            source="twelve",
                            lang_id=d_id,
                            dialect=sanitize_dialect_name(dialect_name),
                            category=f"Level {level} Lesson {class_num}",
                            level=level,
                            words=word_data
                        )
                        append_to_jsonl(distilled_file, [record])
                        
                    # Slow down to avoid hammering
                    time.sleep(0.12)
                    
                except Exception as e:
                    # Skip 404s or empty lessons
                    continue

if __name__ == "__main__":
    parser = argparse.ArgumentParser("Twelve-Year Scraper")
    parser.add_argument("--dialects", nargs="+", type=int, help="Specific dialect IDs to scrape")
    parser.add_argument("--start-level", type=int, default=1, help="Start level")
    args = parser.parse_args()
    
    base_data = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    scrape_twelve(base_data, args.dialects, args.start_level)
