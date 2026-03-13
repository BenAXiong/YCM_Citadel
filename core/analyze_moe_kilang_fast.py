import json
import subprocess
import os
from collections import Counter

def fast_analyze():
    repo_path = 'data/raw/extern/amis-moedict'
    
    print("Discovering all letter indices...")
    try:
        cmd_ls = ['git', '-C', repo_path, 'ls-tree', '-d', '--name-only', 'HEAD:docs']
        dirs = subprocess.check_output(cmd_ls).decode('utf-8').splitlines()
        
        stem_to_words = {}
        for d in dirs:
            stem_path = "docs/" + d + "/stem-words.json"
            try:
                read_cmd = ['git', '-C', repo_path, 'show', 'HEAD:' + stem_path]
                raw_out = subprocess.check_output(read_cmd).decode('utf-8')
                data = json.loads(raw_out)
                if isinstance(data, dict):
                    stem_to_words.update(data)
            except: continue 
                
    except Exception as e:
        print("Global index merge failed: " + str(e))
        return
    
    print(f"Loaded {len(stem_to_words)} total stems.")
    
    # Pre-index stem keys for fast lookup
    stem_lookup = {k.lower(): [str(item).split('\ufffa')[0].lower() for item in v] 
                   for k, v in stem_to_words.items() if isinstance(v, list)}

    # 2. Optimized Recursive Count with Memoization
    memo = {}

    def get_family(stem):
        stem = stem.lower()
        if stem in memo:
            return memo[stem]
        
        family = set()
        children = stem_lookup.get(stem, [])
        for child in children:
            if child != stem:
                family.add(child)
                # Recursively add the child's family
                family.update(get_family(child))
        
        memo[stem] = family
        return family

    print("Calculating deep branch counts (recursive DP)...")
    deep_counts = {}
    for stem_raw in stem_to_words:
        # Reset memoization for each top-level root to avoid cycle issues, 
        # but actuallycycles are rare in this data, so we can use global memo if we handle them
        # Let's use a safe BFS variant of DP
        deep_counts[stem_raw] = len(get_family(stem_raw))

    # 3. Stats & Distributions
    branch_counts = list(deep_counts.values())
    distribution = Counter(branch_counts)
    max_branches = max(branch_counts) if branch_counts else 0
    full_dist = {str(i): int(distribution.get(i, 0)) for i in range(max_branches + 1)}

    # 4. Depth Analysis
    word_to_stem = {}
    for stem, children in stem_lookup.items():
        for child in children:
            word_to_stem[child] = stem

    depths = {}
    for word in word_to_stem:
        chain = [word]
        c_ptr = word
        while c_ptr in word_to_stem and word_to_stem[c_ptr] != c_ptr and word_to_stem[c_ptr] not in chain:
            c_ptr = word_to_stem[c_ptr]
            chain.append(c_ptr)
        depths[word] = len(chain)

    report = {
        "summary": {
            "total_roots": len(stem_to_words),
            "max_depth": max(depths.values()) if depths else 0,
            "max_branches": int(max_branches),
            "total_words": len(word_to_stem),
            "average_branching": round(sum(branch_counts)/len(branch_counts), 2) if branch_counts else 0,
            "std_dev": 0
        },
        "distribution": full_dist,
        "deep_examples": {},
        "top_roots": sorted([{"root": k, "count": v} for k, v in deep_counts.items()], key=lambda x: x["count"], reverse=True)
    }

    # Deep examples
    # Collect all words at max_depth, then max_depth-1, etc. until we have enough examples
    target_examples = 50
    all_depth_words = sorted(depths.items(), key=lambda x: x[1], reverse=True)
    
    for w, d in all_depth_words:
        if len(report["deep_examples"]) >= target_examples:
            break
        if d < 4: # Stop if we reach shallow words
            break
            
        chain = [w]
        c_ptr = w
        while c_ptr in word_to_stem and word_to_stem[c_ptr] != c_ptr and word_to_stem[c_ptr] not in chain:
            c_ptr = word_to_stem[c_ptr]
            chain.append(c_ptr)
        report["deep_examples"][str(w)] = chain

    output_path = 'portal/public/data/moe_kilang_stats.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"Deep Analysis Report saved to {output_path}")

if __name__ == "__main__":
    fast_analyze()
