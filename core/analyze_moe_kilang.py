import json
import os
import glob
from collections import defaultdict, Counter

def analyze_complex_stems():
    repo_path = r'data\raw\extern\amis-moedict'
    s_dir = os.path.join(repo_path, 'docs', 's')
    
    # Mapping: word -> stem
    word_to_stem = {}
    
    # We use glob but remain aware of illegal chars. 
    # Since we are on Windows, we'll use a mix of glob and git check if needed.
    # But for a general survey, glob should get most.
    print("Reading docs/s/*.json...")
    json_files = glob.glob(os.path.join(s_dir, "*.json"))
    
    for jf in json_files:
        try:
            with open(jf, 'r', encoding='utf-8') as f:
                data = json.load(f)
                word = data.get('t', '').lower()
                stem = data.get('stem', '').lower()
                if word and stem:
                    word_to_stem[word] = stem
        except:
            continue

    print(f"Mapped {len(word_to_stem)} word-to-stem relationships.")

    # 1. Investigate branching depth (Complex Branching)
    # Does any word's stem have its own stem?
    depths = {}
    for word in word_to_stem:
        chain = [word]
        curr = word
        while curr in word_to_stem and word_to_stem[curr] != curr and word_to_stem[curr] not in chain:
            curr = word_to_stem[curr]
            chain.append(curr)
        depths[word] = len(chain)
    
    max_depth = max(depths.values()) if depths else 0
    deepest_chains = [w for w, d in depths.items() if d == max_depth]
    
    print(f"Max morphological depth found: {max_depth}")
    
    # 2. Complete Distribution of Branches
    # Root -> List of Children
    root_to_children = defaultdict(list)
    for word, stem in word_to_stem.items():
        if stem:
            root_to_children[stem].append(word)
    
    branch_counts = [len(children) for children in root_to_children.values()]
    distribution = Counter(branch_counts)
    
    # Fill in zeros for completeness if requested, but roots not in stem-words have 0.
    # Let's just create a sorted list of frequencies.
    max_branches = max(branch_counts) if branch_counts else 0
    full_dist = {i: distribution.get(i, 0) for i in range(max_branches + 1)}
    
    # 3. Export
    report = {
        "summary": {
            "total_stems": len(root_to_children),
            "max_depth": max_depth,
            "max_branches": max_branches,
            "total_mapped_words": len(word_to_stem)
        },
        "distribution": full_dist,
        "deep_examples": {w: [w] + [] for w in deepest_chains[:5]}, # Placeholder for chain expansion
        "top_roots": sorted([{"root": r, "count": len(c)} for r, c in root_to_children.items()], key=lambda x: x["count"], reverse=True)[:50]
    }
    
    # Resolve chains for deep examples
    for w in report["deep_examples"]:
        chain = [w]
        curr = w
        while curr in word_to_stem and word_to_stem[curr] != curr and word_to_stem[curr] not in chain:
            curr = word_to_stem[curr]
            chain.append(curr)
        report["deep_examples"][w] = chain

    output_path = 'portal/public/data/moe_kilang_stats.json'
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"Report saved to {output_path}")

if __name__ == "__main__":
    analyze_complex_stems()
