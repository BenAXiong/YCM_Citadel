import json
import os
import glob
import math
from typing import Dict, Set, Any, List, Tuple

def analyze_roots() -> None:
    repo_path = 'data/raw/extern/amis-moedict'
    # Use glob to find files, cast to list of strings for linter
    stem_files: List[str] = [str(f) for f in glob.glob(repo_path + '/docs/*/stem-words.json')]
    
    total_map: Dict[str, Set[str]] = {}
    
    print("Found " + str(len(stem_files)) + " stem-words files.")
    
    for sf in stem_files:
        try:
            with open(sf, 'r', encoding='utf-8') as f:
                data: Any = json.load(f)
                if not isinstance(data, dict):
                    continue
                for raw_stem, variants in data.items():
                    # Force stem and variants into standard types
                    stem: str = str(raw_stem)
                    if not isinstance(variants, list):
                        continue
                    
                    if stem not in total_map:
                        total_map[stem] = set()
                    
                    current_set = total_map[stem]
                    for entry in variants:
                        # Extract word before the separator ￺ (\ufffa)
                        word_str: str = str(entry).split('\ufffa')[0]
                        current_set.add(word_str)
        except Exception as e:
            print("Error reading " + str(sf) + ": " + str(e))
    
    root_keys: List[str] = sorted(list(total_map.keys()))
    if not root_keys:
        print("No data found.")
        return

    counts: List[int] = [len(total_map[r]) for r in root_keys]
    num_roots: int = len(root_keys)
    min_derivs: int = int(min(counts))
    max_derivs: int = int(max(counts))
    sum_derivs: int = int(sum(counts))
    avg_derivs: float = float(sum_derivs) / num_roots
    
    # Calculate Variance
    var_sum: float = 0.0
    for c in counts:
        var_sum += (float(c) - avg_derivs) ** 2
    variance: float = var_sum / num_roots
    std_dev: float = math.sqrt(variance)
    
    # Sorting for top roots
    items_list: List[Tuple[str, Set[str]]] = list(total_map.items())
    items_list.sort(key=lambda x: len(x[1]), reverse=True)
    
    report: Dict[str, Any] = {
        "stats": {
            "total_roots": int(num_roots),
            "min_derivatives": int(min_derivs),
            "max_derivatives": int(max_derivs),
            "average_derivatives": float(round(avg_derivs, 2)),
            "std_dev": float(round(std_dev, 2)),
            "total_derivatives_mapped": int(sum_derivs)
        },
        "top_10_roots": [
            {"root": str(r), "count": int(len(d))} for r, d in items_list[:10]
        ]
    }
    
    output_file = 'tmp/moe_root_report.json'
    if not os.path.exists('tmp'):
        os.makedirs('tmp')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print("Report saved to " + output_file)

if __name__ == "__main__":
    analyze_roots()
