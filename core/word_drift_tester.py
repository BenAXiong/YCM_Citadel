import sqlite3
import json
from collections import defaultdict

def test_word_drift(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # We look for the same Chinese meaning (ZH) where the Aboriginal word (AB) varies slightly
    # Specifically looking for the wacu/waco pattern in Amis
    print("--- PHONETIC DRIFT TEST: AMIS [wacu vs waco] ---")
    
    query = """
    SELECT s.zh, s.ab, o.dialect_name
    FROM sentences s
    JOIN occurrences o ON s.id = o.sentence_id
    WHERE s.glid = '01' AND (s.ab LIKE '%wacu%' OR s.ab LIKE '%waco%')
    """
    cur.execute(query)
    
    results = defaultdict(set)
    for zh, ab, d_name in cur.fetchall():
        # Tag the word found
        word = "wacu" if "wacu" in ab.lower() else "waco"
        results[d_name].add(word)
        
    for d_name, words in sorted(results.items()):
        print(f"Dialect: {d_name:<20} | Found: {', '.join(words)}")

    print("\n--- BROAD ANALYTICS: -u vs -o DRIFT ---")
    # Let's find common words that end in u in some dialects and o in others for the same ZH
    query = """
    SELECT s.zh, s.ab, o.dialect_name
    FROM sentences s
    JOIN occurrences o ON s.id = o.sentence_id
    WHERE s.glid = '01'
    """
    cur.execute(query)
    
    drift_map = defaultdict(lambda: defaultdict(list))
    for zh, ab, d_name in cur.fetchall():
        words = ab.lower().split()
        for w in words:
            clean = w.strip(".,!?;:")
            if clean.endswith('u') or clean.endswith('o'):
                root = clean[:-1]
                if len(root) > 2:
                    drift_map[zh][root].append((clean, d_name))
                    
    # Look for cases where the same ZH + same root has both -u and -o
    found_drifts = 0
    for zh, roots in drift_map.items():
        for root, variations in roots.items():
            ends = {v[0][-1] for v in variations}
            if 'u' in ends and 'o' in ends:
                print(f"Semantic Context: {zh}")
                for word, dia in variations:
                    print(f"  -> {word:<12} ({dia})")
                found_drifts += 1
                if found_drifts > 5: break
        if found_drifts > 5: break

    conn.close()

if __name__ == "__main__":
    db = "export/ycm_master.db"
    test_word_drift(db)
