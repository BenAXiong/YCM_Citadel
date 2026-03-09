import os
import json
import time
import argparse
import xml.etree.ElementTree as ET
from typing import Dict, List, Any

from core.network import http_get_text, repair_mojibake
from core.processors import create_sentence_record, append_to_jsonl
from core.constants import TWELVE_DIALECTS

# Endpoint
NINE_URL = "https://web.klokah.tw/nine/php/getText.php"

def scrape_nine_year(data_dir: str, dialects: List[int] = None):
    distilled_file = os.path.join(data_dir, "distilled", "sentences.jsonl")
    dialect_ids = dialects or list(TWELVE_DIALECTS.keys())
    
    # Levels 1-9, Classes 1-10
    LEVELS = range(1, 10)
    CLASSES = range(1, 11)
    
    # Dialects skipped by the site (from learn.js)
    SKIPPED_DIALECTS = {10, 11, 29, 33}
    
    for d_id in dialect_ids:
        if d_id in SKIPPED_DIALECTS:
            continue
            
        dialect_name = TWELVE_DIALECTS.get(d_id, f"dialect_{d_id}")
        print(f"\n--- Nine-Year XML Reclamation: {dialect_name} (ID: {d_id}) ---")
        
        dialect_count = 0
        for l in LEVELS:
            for c in CLASSES:
                try:
                    xml_text = http_get_text(NINE_URL, params={"d": d_id, "l": l, "c": c})
                    if not xml_text or "<item>" not in xml_text:
                        continue
                        
                    # Fix XML formatting for parsing if needed (PHP proxy sometimes returns bare items)
                    if not xml_text.startswith("<?xml"):
                        xml_text = f"<root>{xml_text}</root>"
                    
                    root = ET.fromstring(xml_text)
                    items = root.findall(".//item")
                    
                    records = []
                    for item in items:
                        ab = repair_mojibake(item.find("text").text or "")
                        zh = repair_mojibake(item.find("chinese").text or "")
                        order = item.find("order").text or "0"
                        
                        if not ab or not zh:
                            continue
                            
                        # Audio URL pattern found in learn.js
                        audio_url = f"https://klokah.tw/nine/sound/{d_id}/{l}/{c}/{order}.mp3"
                        
                        # Word definitions are usually in <wordChinese>
                        word_zh = item.find("wordChinese").text or ""
                        words = []
                        if word_zh:
                            ab_words = ab.split()
                            zh_words = word_zh.split()
                            for i in range(min(len(ab_words), len(zh_words))):
                                words.append({"ab": ab_words[i], "zh": zh_words[i]})

                        records.append(create_sentence_record(
                            uuid=f"nine_{d_id}_{l}_{c}_{order}",
                            ab=ab, zh=zh, audio_id=f"nine_{d_id}_{l}_{c}_{order}",
                            audio_url=audio_url, source="nine_year",
                            lang_id=d_id, dialect=dialect_name,
                            level=l, category=f"Level {l} Class {c}",
                            words=words if words else None
                        ))
                    
                    if records:
                        append_to_jsonl(distilled_file, records)
                        dialect_count += len(records)
                        
                    time.sleep(0.02) # Polite delay
                except Exception as e:
                    # print(f"    [Error] L{l} C{c}: {e}")
                    continue
            
            if dialect_count > 0:
                print(f"  -> Reclaimed {dialect_count} sentences from L{l}...")
        
        print(f"  -> Total for {dialect_name}: {dialect_count} sentences.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser("Nine-Year Scraper")
    parser.add_argument("--dialects", nargs="+", type=int)
    args = parser.parse_args()
    
    base_data = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    scrape_nine_year(base_data, args.dialects)
