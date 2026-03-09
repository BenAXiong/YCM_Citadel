import json
import os
import re
import argparse
from collections import Counter
from typing import List, Dict

def tokenize(text: str) -> List[str]:
    # Basic tokenizer: lowercase and remove non-alphanumeric punctuation
    # We keep ' for some orthographies
    tokens = re.findall(r"[\w']+", text.lower())
    return tokens

def analyze_frequency(data_dir: str, top_n: int = 50, source_filter: str = None):
    distilled_file = os.path.join(data_dir, "distilled", "sentences.jsonl")
    
    if not os.path.exists(distilled_file):
        print(f"Error: Database not found at {distilled_file}")
        return

    word_counts = Counter()
    zh_counts = Counter()
    sentence_count = 0
    
    print(f"Analyzing word frequencies (Filter: {source_filter or 'None'})...")
    
    with open(distilled_file, "r", encoding="utf-8") as f:
        for line in f:
            try:
                record = json.loads(line)
                if source_filter and record["metadata"]["source"] != source_filter:
                    continue
                
                sentence_count += 1
                
                # Aboriginal tokens
                ab_tokens = tokenize(record["text"]["ab"])
                word_counts.update(ab_tokens)
                
                # Chinese tokens (simple character split for now)
                zh_text = record["text"]["zh"]
                zh_tokens = [c for c in zh_text if '\u4e00' <= c <= '\u9fff']
                zh_counts.update(zh_tokens)
                
            except:
                continue

    print(f"\nAnalyzed {sentence_count} sentences.")
    
    print(f"\n--- Top {top_n} Aboriginal Words ---")
    for word, count in word_counts.most_common(top_n):
        print(f"{word:15} | {count}")
        
    print(f"\n--- Top {top_n} Chinese Concepts (Characters) ---")
    for char, count in zh_counts.most_common(top_n):
        print(f"{char:15} | {count}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser("Word Frequency Analyzer")
    parser.add_argument("--top", type=int, default=50, help="Number of top words to show")
    parser.add_argument("--source", type=str, help="Filter by source (grmpts, essay, twelve, dialogue)")
    args = parser.parse_args()
    
    # Auto-locate data dir
    base_data = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    analyze_frequency(base_data, args.top, args.source)
