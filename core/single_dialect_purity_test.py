import sqlite3
import re
from collections import defaultdict

def normalize_ab(text):
    if not text: return ""
    return re.sub(r'[^a-zA-Z0-9]', '', text).lower()

def normalize_zh(text):
    if not text: return ""
    return re.sub(r'[^\u4e00-\u9fa5]', '', text)

def purity_test_single_dialects(db_path, target_glids):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    results = []
    
    for glid in target_glids:
        # Get all Grmpts Souls for this GLID
        cur.execute("""
            SELECT s.ab, s.zh
            FROM sentences s
            JOIN occurrences o ON s.id = o.sentence_id
            WHERE s.glid = ? AND o.source = 'grmpts'
        """, (glid,))
        g_rows = cur.fetchall()
        grmpts_souls = set((normalize_ab(ab), normalize_zh(zh)) for ab, zh in g_rows)
        total_grmpts = len(grmpts_souls)
        
        if total_grmpts == 0: continue
        
        # Get Group Name
        cur.execute("SELECT group_name FROM dialects WHERE glid = ?", (glid,))
        group_name = cur.fetchone()[0]
        
        # Get all sub-dialects for this family
        cur.execute("""
            SELECT DISTINCT o.dialect_name
            FROM occurrences o
            JOIN sentences s ON o.sentence_id = s.id
            WHERE s.glid = ? AND o.source != 'grmpts'
        """, (glid,))
        dialects = [row[0] for row in cur.fetchall()]
        
        for dialect in dialects:
            cur.execute("""
                SELECT s.ab, s.zh
                FROM sentences s
                JOIN occurrences o ON s.id = o.sentence_id
                WHERE s.glid = ? AND o.dialect_name = ? AND o.source != 'grmpts'
            """, (glid, dialect))
            
            matches = 0
            seen_source = set()
            for ab, zh in cur.fetchall():
                soul = (normalize_ab(ab), normalize_zh(zh))
                if soul in grmpts_souls and soul not in seen_source:
                    matches += 1
                    seen_source.add(soul)
            
            rate = (matches / total_grmpts) * 100
            results.append((group_name, dialect, matches, total_grmpts, rate))
            
    conn.close()
    return results

if __name__ == "__main__":
    # GLID 07 is Tsou, GLID 09 is Yami (Tao)
    test_results = purity_test_single_dialects("export/ycm_master.db", ['07', '09'])
    
    print("--- Single Dialect Purity % Test (Semantic Soul Matching) ---")
    print("| Family | Dialect | Matches | Total Patterns | Purity % |")
    print("| :--- | :--- | :---: | :---: | :---: |")
    for group, dialect, matches, total, rate in test_results:
        print(f"| {group} | {dialect} | {matches} | {total} | {rate:.2f}% |")
