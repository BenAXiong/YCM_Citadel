import json
import subprocess
import os

def debug_count(target):
    repo_path = 'data/raw/extern/amis-moedict'
    cmd_ls = ['git', '-C', repo_path, 'ls-tree', '-r', '--name-only', 'HEAD', 'docs/*/stem-words.json']
    files = subprocess.check_output(cmd_ls).decode('utf-8').splitlines()
    
    stem_to_words = {}
    for f in files:
        read_cmd = ['git', '-C', repo_path, 'show', 'HEAD:' + f]
        data = json.loads(subprocess.check_output(read_cmd).decode('utf-8'))
        stem_to_words.update(data)
    
    stem_lookup = {k.lower(): [str(item).split('\ufffa')[0].lower() for item in v] 
                   for k, v in stem_to_words.items() if isinstance(v, list)}
    
    memo = {}
    def get_family(s):
        s = s.lower()
        if s in memo: return memo[s]
        family = set()
        for child in stem_lookup.get(s, []):
            if child != s:
                family.add(child)
                family.update(get_family(child))
        memo[s] = family
        return family

    f = get_family(target)
    print(f"Family for {target} ({len(f)}): {sorted(list(f))}")

if __name__ == "__main__":
    debug_count("'ciw")
    debug_count("'eciw")
