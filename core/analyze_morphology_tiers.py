import json
import subprocess
import os
from collections import Counter

def analyze_depth_and_parallel():
    repo_path = 'data/raw/extern/amis-moedict'
    
    # 1. Load all indices
    print("Loading all indices...")
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
            except:
                continue
    except Exception as e:
        print("Load failed: " + str(e))
        return

    # 2. Parallel Branching Distribution (Direct children)
    # This is the distribution of the number of words each root has
    branch_counts = [len(words) for words in stem_to_words.values() if isinstance(words, list)]
    parallel_dist = Counter(branch_counts)
    
    # 3. Layer Depth Analysis
    # Word -> Stem map
    word_to_stem = {}
    for stem, words_raw in stem_to_words.items():
        if not isinstance(words_raw, list): continue
        for item in words_raw:
            word = str(item).split('\ufffa')[0].lower()
            word_to_stem[word] = stem.lower()

    depths = {}
    for word in word_to_stem:
        chain = [word]
        c_ptr = word
        while c_ptr in word_to_stem and word_to_stem[c_ptr] != c_ptr and word_to_stem[c_ptr] not in chain:
            c_ptr = word_to_stem[c_ptr]
            chain.append(c_ptr)
        depths[word] = len(chain)

    depth_dist = Counter(depths.values())

    # 4. Reporting
    report = {
        "parallel_branching": {
            "description": "How many direct derivatives a root has (Complexity of a single node)",
            "distribution": {str(k): v for k, v in sorted(parallel_dist.items())}
        },
        "layer_depth": {
            "description": "How many steps from derivative back to core root (Morphological tiers)",
            "distribution": {str(k): v for k, v in sorted(depth_dist.items())}
        },
        "summary": {
            "total_roots": len(stem_to_words),
            "total_mapped_words": len(word_to_stem),
            "max_depth": max(depths.values()) if depths else 0,
            "max_parallel": max(branch_counts) if branch_counts else 0
        }
    }

    # Save to portal docs
    doc_path = 'brain/MORPHOLOGY_STATS.md'
    os.makedirs(os.path.dirname(doc_path), exist_ok=True)
    
    with open(doc_path, 'w', encoding='utf-8') as f:
        f.write("# Amis Morphological Distribution Report\n\n")
        f.write("## 1. Summary Statistics\n")
        f.write(f"- **Total Stems (Roots/Intermediate)**: {report['summary']['total_roots']}\n")
        f.write(f"- **Total Derivatives Mapped**: {report['summary']['total_mapped_words']}\n")
        f.write(f"- **Maximum Morphological Depth**: {report['summary']['max_depth']}\n")
        f.write(f"- **Maximum Parallel Branches**: {report['summary']['max_parallel']}\n\n")
        
        f.write("## 2. Layer Depth Distribution\n")
        f.write("Measure of tiers (how many steps from derivative to root).\n\n")
        f.write("| Depth | Frequency (Words) |\n")
        f.write("| :--- | :--- |\n")
        for k, v in sorted(depth_dist.items()):
            f.write(f"| {k} | {v} |\n")
            
        f.write("\n## 3. Parallel Branching Distribution\n")
        f.write("Measure of node complexity (how many direct children a root has).\n\n")
        f.write("| Branches | Frequency (Roots) |\n")
        f.write("| :--- | :--- |\n")
        # Group high branches for readability
        for k, v in sorted(parallel_dist.items()):
            if k <= 10 or v > 10:
                f.write(f"| {k} | {v} |\n")
        
    print(f"Report saved to {doc_path}")

if __name__ == "__main__":
    analyze_depth_and_parallel()
