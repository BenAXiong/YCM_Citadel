import sqlite3
import re
from collections import defaultdict

def normalize(text):
    if not text: return ""
    # Conservative normalization: Alphanumeric only, lowercase for AB
    # This ignores punctuation drift (?, !, ^ vs ') which is rampant in the source
    return re.sub(r'[^a-zA-Z0-9\u4e00-\u9fa5]', '', text).lower()

def run_true_purity_test(db_path, glids):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    print(f"| GLID | Dialect | Grmpts Souls | Literal Matches | True Purity % |")
    print(f"| :--- | :--- | :---: | :---: | :---: |")

    for glid in sorted(glids):
        # 1. Collect all "Souls" from Grmpts (ZH + AB pairs)
        cur.execute("""
            SELECT s.zh, s.ab
            FROM sentences s
            JOIN occurrences o ON s.id = o.sentence_id
            WHERE s.glid = ? AND o.source = 'grmpts'
        """, (glid,))
        # Key: (normalized_zh, normalized_ab)
        grmpts_souls = set((normalize(zh), normalize(ab)) for zh, ab in cur.fetchall())
        total_grmpts = len(grmpts_souls)
        
        if total_grmpts == 0: continue

        # 2. Identify all dialects for this family
        cur.execute("""
            SELECT DISTINCT o.dialect_name
            FROM occurrences o
            JOIN sentences s ON o.sentence_id = s.id
            WHERE s.glid = ? AND o.source != 'grmpts'
        """, (glid,))
        dialects = [row[0] for row in cur.fetchall()]

        dialect_results = []
        for d in dialects:
            # 3. Collect "Souls" from this dialect corpus
            cur.execute("""
                SELECT s.zh, s.ab
                FROM sentences s
                JOIN occurrences o ON s.id = o.sentence_id
                WHERE s.glid = ? AND o.dialect_name = ? AND o.source != 'grmpts'
            """, (glid, d))
            
            matches = 0
            seen_source_souls = set()
            for zh, ab in cur.fetchall():
                soul = (normalize(zh), normalize(ab))
                if soul in grmpts_souls and soul not in seen_source_souls:
                    matches += 1
                    seen_source_souls.add(soul)
            
            purity = (matches / total_grmpts * 100) if total_grmpts > 0 else 0
            dialect_results.append((d, matches, purity))
        
        # Sort by purity
        dialect_results.sort(key=lambda x: x[2], reverse=True)
        
        for d, m, p in dialect_results:
            print(f"| {glid} | {d} | {total_grmpts} | {m} | {p:.2f}% |")

    conn.close()

if __name__ == "__main__":
    # Test on Amis (01) and Seediq (14)
    run_true_purity_test("export/ycm_master.db", ["01", "14"])
