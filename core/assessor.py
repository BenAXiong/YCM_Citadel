import json
import os
import argparse
from collections import defaultdict

def assess_database(data_dir: str):
    distilled_file = os.path.join(data_dir, "distilled", "sentences.jsonl")
    
    if not os.path.exists(distilled_file):
        print(f"Error: Database not found at {distilled_file}")
        return
        
    print(f"Scanning Database: {distilled_file}\n")
    
    total_sentences = 0
    source_counts = defaultdict(int)
    language_counts = defaultdict(int) 
    
    # Unique bodies per source
    source_unique_bodies = defaultdict(set)
    # Global unique bodies
    redundancy_tracker = defaultdict(list)
    
    with open(distilled_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line: continue
            try:
                record = json.loads(line)
                total_sentences += 1
                source = record["metadata"]["source"]
                lang = record["metadata"].get("dialect", "Unknown")
                
                source_counts[source] += 1
                language_counts[lang] += 1
                
                ab_text = record["text"]["ab"].strip().lower()
                zh_text = record["text"]["zh"].strip()
                
                unique_body_key = f"{ab_text}|{zh_text}"
                redundancy_tracker[unique_body_key].append(source)
                source_unique_bodies[source].add(unique_body_key)
            except:
                continue
            
    print(f"=== Database Stats ===")
    print(f"Total Sentences: {total_sentences}")
    
    print("\nBy Source (Total / Unique / Redundancy):")
    for src, count in source_counts.items():
        unique_c = len(source_unique_bodies[src])
        src_red = (count - unique_c) / count if count > 0 else 0
        print(f"  - {src:8}: {count:6} total | {unique_c:6} unique | {src_red:5.1%} redundancy")
        
    print("\nBy Language (Dialect):")
    # Sort by count desc
    for lang, count in sorted(language_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"  - {lang}: {count}")
    if len(language_counts) > 10: print("    ...and more")
        
    print("\n=== Redundancy Assessment ===")
    unique_bodies = len(redundancy_tracker)
    redundancy_rate = (total_sentences - unique_bodies) / total_sentences if total_sentences > 0 else 0
    
    print(f"Unique Sentence Bodies : {unique_bodies}")
    print(f"Global Redundancy Rate : {redundancy_rate:.1%}")
    
    # Find cross-pollination (sentences that exist in both 'essay' and 'grmpts')
    cross_pollinated = 0
    for key, sources in redundancy_tracker.items():
        unique_sources = set(sources)
        if len(unique_sources) > 1:
            cross_pollinated += 1
            
    print(f"Sentences appearing in multiple modules: {cross_pollinated}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser("DB Assessor")
    args = parser.parse_args()
    
    base_data = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    assess_database(base_data)
