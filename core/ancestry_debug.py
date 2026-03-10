import sqlite3
import re
from collections import defaultdict

def normalize(text):
    if not text: return ""
    # Strip everything except characters (ignore case, spaces, punctuation)
    return re.sub(r'[^a-zA-Z0-9\u4e00-\u9fa5]', '', text).lower()

def run_actual_ancestry_check(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Get all unique Grmpts sentences per GLID
    cur.execute("""
        SELECT s.glid, s.ab, s.zh 
        FROM sentences s
        JOIN occurrences o ON s.id = o.sentence_id
        WHERE o.source = 'grmpts'
    """)
    g_raw = cur.fetchall()
    grmpts_by_glid = defaultdict(set) # glid -> set of normalized (ab, zh)
    for glid, ab, zh in g_raw:
        grmpts_by_glid[glid].add((normalize(ab), normalize(zh)))
        
    print("--- ACTUAL ANCESTRY MATCH (Literal Overlap) ---")
    
    for glid in sorted(grmpts_by_glid.keys()):
        total = len(grmpts_by_glid[glid])
        if total == 0: continue
        
        # Get Group Name
        cur.execute("SELECT group_name FROM dialects WHERE glid = ?", (glid,))
        res = cur.fetchone()
        g_name = res[0] if res else f"GLID {glid}"
        
        # Get all sub-dialects for this family
        cur.execute("""
            SELECT DISTINCT o.dialect_name 
            FROM occurrences o
            JOIN sentences s ON o.sentence_id = s.id
            WHERE s.glid = ? AND o.source != 'grmpts'
        """, (glid,))
        dialects = [row[0] for row in cur.fetchall()]
        
        print(f"\n[GLID {glid}] {g_name} ({total} unique patterns)")
        
        results = []
        for d in dialects:
            # Get all other sentences for this dialect
            cur.execute("""
                SELECT s.ab, s.zh
                FROM sentences s
                JOIN occurrences o ON s.id = o.sentence_id
                WHERE s.glid = ? AND o.dialect_name = ? AND o.source != 'grmpts'
            """, (glid, d))
            
            matches = 0
            seen_source = set()
            for ab, zh in cur.fetchall():
                soul = (normalize(ab), normalize(zh))
                if soul in grmpts_by_glid[glid] and soul not in seen_source:
                    matches += 1
                    seen_source.add(soul)
            
            rate = (matches / total) * 100
            results.append((d, matches, rate))
            
        results.sort(key=lambda x: x[2], reverse=True)
        for d, m, r in results:
            print(f"  {d:<30} | {m:>5} matches | {r:>6.2f}%")
            
    conn.close()

if __name__ == "__main__":
    run_actual_ancestry_check("export/ycm_master.db")
