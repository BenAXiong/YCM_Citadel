import sqlite3
import json
import os
from collections import Counter

def analyze_from_db():
    db_path = 'data/amis_moe_test.db'
    if not os.path.exists(db_path):
        print("DB not found")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 1. Load all words and their stems
    print("Loading all words from DB...")
    cursor.execute("SELECT word_ab, stem FROM moe_entries")
    rows = cursor.fetchall()
    
    all_words = set()
    word_to_stem = {}
    stem_to_derivatives = {}
    
    for word_ab, stem in rows:
        w = word_ab.lower().strip()
        all_words.add(w)
        if stem:
            s = stem.lower().strip()
            if s and s != w:
                word_to_stem[w] = s
                if s not in stem_to_derivatives:
                    stem_to_derivatives[s] = set()
                stem_to_derivatives[s].add(w)
                all_words.add(s)

    # 2. Calculate family counts and top roots
    # We define a root as a word that has derivatives but is not itself a derivative
    all_stems = set(stem_to_derivatives.keys())
    all_derivatives = set(word_to_stem.keys())
    roots = sorted(list(all_stems - all_derivatives))
    
    # We need to calculate VIRTUAL TIERS within each family
    # because the DB stem is often "flat" (e.g. pakanaikoren -> ikor)
    # The UI rebuilds the hierarchy by checking if a longer word contains a shorter one in the same family.
    
    memo_family = {}
    word_virtual_depths = {}

    def get_full_family_and_depths(r):
        if r in memo_family: return memo_family[r]
        
        # Get all words associated with this root (recursively)
        family_members = set()
        visited = {r}
        stack = [r]
        while stack:
            curr = stack.pop()
            for d in stem_to_derivatives.get(curr, set()):
                if d not in visited:
                    visited.add(d)
                    family_members.add(d)
                    stack.append(d)
        
        # Now infer virtual hierarchy within this family
        # Sort members by length to find nested chains
        sorted_members = sorted(list(family_members), key=lambda x: len(x))
        family_hierarchy = {m: 2 for m in sorted_members} # Base depth is 2 (direct from root)
        
        # Virtual Root (the primary root) is tier 1
        word_virtual_depths[r] = 1
        
        for i in range(len(sorted_members)):
            for j in range(i):
                shorter = sorted_members[j]
                longer = sorted_members[i]
                if shorter in longer:
                    # 'longer' follows 'shorter' in the hierarchy
                    new_depth = family_hierarchy[shorter] + 1
                    if new_depth > family_hierarchy[longer]:
                        family_hierarchy[longer] = new_depth
        
        for m, d in family_hierarchy.items():
            word_virtual_depths[m] = d
            
        memo_family[r] = family_members
        return family_members

    top_roots = []
    print("Rebuilding virtual hierarchies and calculating depths...")
    for r in roots:
        f = get_full_family_and_depths(r)
        top_roots.append({"root": r, "count": len(f)})
    
    # Also handle isolated words or roots that weren't in any family (Tier 1)
    for w in all_words:
        if w not in word_virtual_depths:
            word_virtual_depths[w] = 1

    top_roots.sort(key=lambda x: x["count"], reverse=True)

    # 3. Stats based on virtual depths
    max_depth = max(word_virtual_depths.values()) if word_virtual_depths else 0
    depth_distribution = Counter(word_virtual_depths.values())
    
    # 4. Distribution of branching
    branch_counts = [r["count"] for r in top_roots]
    branching_dist = Counter(branch_counts)
    max_branches = max(branch_counts) if branch_counts else 0
    full_branching_dist = {str(i): int(branching_dist[i]) for i in range(max_branches + 1) if branching_dist[i] > 0}

    # 5. Build Deep Examples (Chains)
    deep_examples = {}
    sorted_words_by_depth = sorted(word_virtual_depths.keys(), key=lambda x: word_virtual_depths[x], reverse=True)
    
    seen_chains = set()
    for w in sorted_words_by_depth[:200]: # Look at deepest candidates
        if len(deep_examples) >= 10: break
        
        # Build chain backwards from leaf to root
        chain = [w]
        curr = w
        
        # We need to find the "parent" we assigned in the virtual hierarchy
        # Or find the root this word belongs to
        found_chain = False
        potential_ancestors = sorted([a for a in word_virtual_depths if a in w and len(a) < len(w)], key=lambda x: len(x), reverse=True)
        
        # Simple backtrace: find largest substring that is a valid entry and has depth = depth-1
        current_depth = word_virtual_depths[w]
        curr_word = w
        while current_depth > 1:
            best_parent = None
            for a in potential_ancestors:
                if word_virtual_depths.get(a) == current_depth - 1:
                    best_parent = a
                    break
            
            if best_parent:
                chain.append(best_parent)
                curr_word = best_parent
                current_depth -= 1
                potential_ancestors = sorted([a for a in word_virtual_depths if a in curr_word and len(a) < len(curr_word)], key=lambda x: len(x), reverse=True)
            else:
                break
        
        if len(chain) >= 4: # Encourage long chains
            path_key = ">".join(chain[::-1])
            if path_key not in seen_chains:
                # Use the last item in chain (the root) as key
                root_key = chain[-1]
                deep_examples[root_key] = chain[::-1]
                seen_chains.add(path_key)

    report = {
        "summary": {
            "total_roots": len(roots),
            "max_depth": int(max_depth),
            "max_branches": int(max_branches),
            "total_words": len(all_words),
            "average_branching": round(float(sum(branch_counts)/len(roots)), 2) if roots else 0.0,
            "std_dev": 0
        },
        "distribution": full_branching_dist,
        "depth_distribution": {str(k): int(v) for k, v in sorted(depth_distribution.items())},
        "deep_examples": deep_examples,
        "top_roots": top_roots
    }

    output_path = 'portal/public/data/moe_kilang_stats.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"Report synced from DB to {output_path}")
    conn.close()

if __name__ == "__main__":
    analyze_from_db()
