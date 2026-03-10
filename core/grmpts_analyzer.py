import sqlite3
from collections import defaultdict

def analyze_grmpts_ancestry(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # 1. Get all Grmpts sentences by ZH
    print("Loading Grmpts ZH...")
    cur.execute("""
        SELECT s.glid, s.zh, s.ab
        FROM sentences s
        JOIN occurrences o ON s.id = o.sentence_id
        WHERE o.source = 'grmpts'
    """)
    g_data = cur.fetchall()
    grmpts_zh_map = defaultdict(lambda: defaultdict(list))
    for glid, zh, ab in g_data:
        grmpts_zh_map[glid][zh].append(ab.strip().lower())
        
    glid_totals = {glid: len(zhs) for glid, zhs in grmpts_zh_map.items()}

    # 2. Match with other sources by ZH
    print("Matching by ZH...")
    # Results: glid -> dialect_name -> matches
    all_dialect_matches = defaultdict(lambda: defaultdict(int))
    
    cur.execute("""
        SELECT s.glid, o.dialect_name, s.zh, s.ab
        FROM sentences s
        JOIN occurrences o ON s.id = o.sentence_id
        WHERE o.source != 'grmpts'
    """)
    
    for glid, d_name, zh, ab in cur.fetchall():
        if glid in grmpts_zh_map and zh in grmpts_zh_map[glid]:
            all_dialect_matches[glid][d_name] += 1
            
    print("\n--- COMPREHENSIVE GRMPTS ANCESTRY ANALYSIS (ZH-MATCH) ---")
    for glid in sorted(glid_totals.keys()):
        cur.execute("SELECT group_name FROM dialects WHERE glid = ?", (glid,))
        res = cur.fetchone()
        g_name = res[0] if res else "Unknown"
        total = glid_totals[glid]
        print(f"\n[GLID {glid}] {g_name} (Total Unique Grmpts ZH: {total})")
        
        results = []
        for d_name, count in all_dialect_matches[glid].items():
            rate = (count / total) * 100 if total > 0 else 0
            results.append((d_name, count, rate))
        
        results.sort(key=lambda x: x[2], reverse=True)
        for d, m, r in results:
            print(f"  {d:<30} | {m:>5} matches | {r:>6.2f}%")

    conn.close()

if __name__ == "__main__":
    db = "export/ycm_master.db"
    analyze_grmpts_ancestry(db)
