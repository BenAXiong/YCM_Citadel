import sqlite3
import re
from collections import defaultdict

def normalize_text(text):
    if not text: return ""
    # Strip everything except letters and numbers
    return re.sub(r'[^a-zA-Z0-9\u4e00-\u9fa5]', '', text).lower()

def get_comprehensive_report(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Get all sources
    cur.execute("SELECT DISTINCT source FROM occurrences")
    sources = [row[0] for row in cur.fetchall()]
    print(f"Sources: {sources}")

    # Get GLIDs
    cur.execute("SELECT DISTINCT glid FROM sentences")
    glids = [row[0] for row in cur.fetchall()]

    for glid in sorted(glids):
        # Get Group Name
        cur.execute("SELECT group_name FROM dialects WHERE glid = ?", (glid,))
        res = cur.fetchone()
        g_name = res[0] if res else "Unknown"
        
        # Get all Grmpts sentences for this GLID
        cur.execute("""
            SELECT s.ab, s.zh 
            FROM sentences s
            JOIN occurrences o ON s.id = o.sentence_id
            WHERE s.glid = ? AND o.source = 'grmpts'
        """, (glid,))
        grmpts_set = set()
        for ab, zh in cur.fetchall():
            grmpts_set.add((normalize_text(ab), normalize_text(zh)))
        
        total_grmpts = len(grmpts_set)
        if total_grmpts == 0: continue
        
        print(f"\n## GLID {glid} - {g_name} ({total_grmpts} unique sentences)")
        
        # Get all sub-dialects for this GLID
        cur.execute("""
            SELECT DISTINCT o.dialect_name
            FROM occurrences o
            JOIN sentences s ON o.sentence_id = s.id
            WHERE s.glid = ? AND o.source != 'grmpts'
        """, (glid,))
        dialects = [row[0] for row in cur.fetchall()]
        
        if len(dialects) <= 1:
            print(f"| {glid} | {g_name} | N/A (single dialect family) |")
            continue

        results = []
        for dialect in dialects:
            cur.execute("""
                SELECT s.ab, s.zh
                FROM sentences s
                JOIN occurrences o ON s.id = o.sentence_id
                WHERE s.glid = ? AND o.dialect_name = ? AND o.source != 'grmpts'
            """, (glid, dialect))
            
            matches = 0
            seen = set()
            for ab, zh in cur.fetchall():
                key = (normalize_text(ab), normalize_text(zh))
                if key in grmpts_set and key not in seen:
                    matches += 1
                    seen.add(key)
            
            rate = (matches / total_grmpts) * 100
            results.append((dialect, matches, rate))
        
        results.sort(key=lambda x: x[2], reverse=True)
        print("| Sub-Dialect | Matches | Purity % |")
        print("| :--- | :---: | :---: |")
        for d, m, r in results:
            print(f"| {d} | {m} | {r:.2f}% |")

    conn.close()

if __name__ == "__main__":
    get_comprehensive_report("export/ycm_master.db")
