import sqlite3
import json
import subprocess
import os

def update_stems():
    db_path = 'data/amis_moe_test.db'
    repo_path = 'data/raw/extern/amis-moedict'
    
    print("Loading stem-words.json...")
    try:
        cmd = ['git', '-C', repo_path, 'show', 'HEAD:docs/s/stem-words.json']
        raw_out = subprocess.check_output(cmd).decode('utf-8')
        stem_to_words = json.loads(raw_out)
    except Exception as e:
        print("Error loading stem-words via git: " + str(e))
        return
    
    conn = sqlite3.connect(db_path)
    curr = conn.cursor()
    
    # word -> stem map
    word_to_stem = {}
    for stem, items in stem_to_words.items():
        if not isinstance(items, list):
            continue
        for item in items:
            # item is "word\ufffa"
            parts = str(item).split('\ufffa')
            word = parts[0].lower()
            word_to_stem[word] = stem.lower()
    
    print("Total mappings found: " + str(len(word_to_stem)))
    
    print("Updating database...")
    batch = []
    count = 0
    total = len(word_to_stem)
    
    for word, stem in word_to_stem.items():
        batch.append((str(stem), str(word)))
        if len(batch) >= 1000:
            curr.executemany("UPDATE moe_entries SET stem = ? WHERE word_ab = ?", batch)
            count = count + len(batch)
            print("Updated " + str(count) + "/" + str(total) + "...")
            batch = []
    
    if batch:
        curr.executemany("UPDATE moe_entries SET stem = ? WHERE word_ab = ?", batch)
        count = count + len(batch)
        
    conn.commit()
    conn.close()
    print("Database stems updated successfully. Total updated: " + str(count))

if __name__ == "__main__":
    update_stems()
