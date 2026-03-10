import sqlite3
import re
from collections import defaultdict

def normalize_ab(text):
    if not text: return ""
    # Strip all non-alphanumeric chars and lowercase
    return re.sub(r'[\s\W_]+', '', text).lower()

def normalize_zh(text):
    if not text: return ""
    # Strip common punctuation
    return re.sub(r'[，。！？、：；“”‘’（）]', '', text)

def get_comprehensive_matrix(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # 1. Get Group Names
    cur.execute("SELECT glid, group_name FROM dialects")
    glid_to_name = dict(cur.fetchall())

    # 2. Get Multi-dialect GLIDs
    cur.execute("""
        SELECT s.glid
        FROM occurrences o
        JOIN sentences s ON o.sentence_id = s.id
        GROUP BY s.glid
        HAVING COUNT(DISTINCT o.dialect_name) > 1
    """)
    multi_glids = [row[0] for row in cur.fetchall()]

    print("# Comprehensive Grmpts Ancestry Matrix (Normalized Matching)\n")

    for glid in sorted(multi_glids):
        g_name = glid_to_name.get(glid, f"GLID {glid}")
        
        # Get all Grmpts sentences
        cur.execute("""
            SELECT s.zh, s.ab
            FROM sentences s
            JOIN occurrences o ON s.id = o.sentence_id
            WHERE s.glid = ? AND o.source = 'grmpts'
        """, (glid,))
        g_rows = cur.fetchall()
        
        # Structure: (norm_zh, norm_ab) -> set of original zh
        grmpts_souls = set()
        for zh, ab in g_rows:
            grmpts_souls.add((normalize_zh(zh), normalize_ab(ab)))
        
        total_grmpts = len(grmpts_souls)
        if total_grmpts == 0: continue

        print(f"## GLID {glid} - {g_name} ({total_grmpts} unique Souls)")
        
        # Get all sub-dialects
        cur.execute("""
            SELECT DISTINCT o.dialect_name
            FROM occurrences o
            JOIN sentences s ON o.sentence_id = s.id
            WHERE s.glid = ? AND o.source != 'grmpts'
        """, (glid,))
        dialects = [row[0] for row in cur.fetchall()]
        
        results = []
        for dialect in dialects:
            cur.execute("""
                SELECT s.zh, s.ab
                FROM sentences s
                JOIN occurrences o ON s.id = o.sentence_id
                WHERE s.glid = ? AND o.dialect_name = ? AND o.source != 'grmpts'
            """, (glid, dialect))
            
            matches = 0
            seen_matches = set()
            for zh, ab in cur.fetchall():
                soul = (normalize_zh(zh), normalize_ab(ab))
                if soul in grmpts_souls and soul not in seen_matches:
                    matches += 1
                    seen_matches.add(soul)
            
            rate = (matches / total_grmpts) * 100
            results.append((dialect, matches, rate))
        
        results.sort(key=lambda x: x[2], reverse=True)
        
        print("| Sub-Dialect | Matches | Purity % |")
        print("| :--- | :---: | :---: |")
        for d, m, r in results:
            print(f"| {d} | {m} | {r:.2f}% |")
        print("\n")

    conn.close()

if __name__ == "__main__":
    get_comprehensive_matrix("export/ycm_master.db")
