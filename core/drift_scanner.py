import json
from collections import Counter
import os

def identify_variants(data_path):
    variants = Counter()
    if not os.path.exists(data_path):
        print(f"File not found: {data_path}")
        return
        
    print(f"Scanning {data_path} for dialectal drift...")
    with open(data_path, "r", encoding="utf-8") as f:
        for line in f:
            try:
                r = json.loads(line)
                dia = r["metadata"].get("dialect", "UNKNOWN")
                variants[dia] += 1
            except: continue
            
    print("\n--- DETECTED DRIFT VARIANTS ---")
    for variant, count in variants.most_common():
        print(f"{variant:<25} | {count:>6} records")

if __name__ == "__main__":
    db = "data/distilled/sentences.jsonl"
    identify_variants(db)
