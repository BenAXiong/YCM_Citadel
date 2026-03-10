import sqlite3
import json
from collections import defaultdict

def build_drift_matrix(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # We focus on the Nine-Year Syllabus as the alignment baseline
    print("--- BUILDING PHONETIC DRIFT MATRIX (BASELINE: SYLLABUS) ---")
    
    query = """
    SELECT s.zh, s.ab, o.dialect_name, s.glid
    FROM sentences s
    JOIN occurrences o ON s.id = o.sentence_id
    WHERE o.source = 'nine_year'
    """
    cur.execute(query)
    
    # Map: zh -> { dialect: word_list }
    zh_map = defaultdict(lambda: defaultdict(list))
    for zh, ab, d_name, glid in cur.fetchall():
        zh_map[zh][d_name] = ab.lower().strip(".,!?;:").split()
        
    # Matrix: [Dialect A] -> [Dialect B] -> { [Word Root]: [Variant] }
    # To keep it manageable, we analyze character-level drift for identical roots
    drift_rules = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))
    
    for zh, dialects in zh_map.items():
        dialect_names = list(dialects.keys())
        for i in range(len(dialect_names)):
            for j in range(i + 1, len(dialect_names)):
                d1, d2 = dialect_names[i], dialect_names[j]
                words1, words2 = dialects[d1], dialects[d2]
                
                # Compare word by word if the sentence length matches
                if len(words1) == len(words2):
                    for w1, w2 in zip(words1, words2):
                        if w1 != w2 and len(w1) == len(w2):
                            # Identify the specific letter change
                            for c1, c2 in zip(w1, w2):
                                if c1 != c2:
                                    drift_rules[d1][d2][f"{c1}->{c2}"] += 1
                                    drift_rules[d2][d1][f"{c2}->{c1}"] += 1

    # Simplify and Export
    final_matrix = {}
    for d1 in drift_rules:
        final_matrix[d1] = {}
        for d2 in drift_rules[d1]:
            # Only keep rules that occur more than 5 times to filter noise
            rules = {k: v for k, v in drift_rules[d1][d2].items() if v > 5}
            if rules:
                final_matrix[d1][d2] = rules

    with open("export/phonetic_drift_matrix.json", "w", encoding="utf-8") as f:
        json.dump(final_matrix, f, ensure_ascii=False, indent=2)
    
    print(f"Matrix built. Exported to export/phonetic_drift_matrix.json")
    conn.close()

if __name__ == "__main__":
    build_drift_matrix("export/ycm_master.db")
