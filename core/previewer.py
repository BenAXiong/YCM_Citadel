import json
import os
import argparse
from collections import defaultdict

def preview_dialects(query: str, data_dir: str):
    distilled_file = os.path.join(data_dir, "distilled", "sentences.jsonl")
    
    if not os.path.exists(distilled_file):
        print(f"Error: Database not found at {distilled_file}")
        return

    # zh -> {dialect_name: [ab_sentences]}
    pivot_map = defaultdict(lambda: defaultdict(list))
    
    print(f"Searching for overlaps around: '{query}'...")
    
    with open(distilled_file, "r", encoding="utf-8") as f:
        for line in f:
            try:
                record = json.loads(line)
                zh = record["text"]["zh"].strip()
                ab = record["text"]["ab"].strip()
                dialect = record["metadata"]["dialect"]
                
                # Check if query is in ZH or if we want to show everything (empty query)
                if query.lower() in zh.lower() or not query:
                    pivot_map[zh][dialect].append(ab)
            except:
                continue

    # Filter to cases where we have at least 2 dialects for the same ZH pivot
    matches = {zh: dia_map for zh, dia_map in pivot_map.items() if len(dia_map) > 1}
    
    if not matches:
        print("No multi-dialect matches found for this query.")
        return

    print(f"Found {len(matches)} shared meanings across dialects.\n")
    
    for zh, dialects in sorted(matches.items()):
        print(f"ZH: {zh}")
        print("-" * 40)
        for dia, abs_list in dialects.items():
            for ab in abs_list:
                print(f"  [{dia:20}] {ab}")
        print("\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser("Dialect Previewer")
    parser.add_argument("query", type=str, nargs="?", default="", help="Chinese text to search for")
    args = parser.parse_args()
    
    base_data = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    preview_dialects(args.query, base_data)
