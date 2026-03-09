import sqlite3
from collections import defaultdict

def analyze_grmpts_ancestry(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Get all sentences that exist in both Grmpts and another source for the same ZH
    query = """
    SELECT s.glid, s.zh, s.ab, o.dialect_name, o.source
    FROM sentences s
    JOIN occurrences o ON s.id = o.sentence_id
    WHERE s.glid IN (SELECT DISTINCT glid FROM occurrences WHERE source = 'grmpts')
    """
    cur.execute(query)
    
    matches = defaultdict(lambda: defaultdict(int))
    totals = defaultdict(int)
    
    # Map raw records
    # key: (glid, zh) -> { 'grmpts': ab, 'specifics': {dialect_name: ab} }
    cross_map = defaultdict(lambda: {'grmpts': None, 'specifics': {}})
    
    for glid, zh, ab, d_name, source in cur.fetchall():
        if source == 'grmpts':
            cross_map[(glid, zh)]['grmpts'] = ab
        else:
            cross_map[(glid, zh)]['specifics'][d_name] = ab
            
    # Calculate Similarity
    for (glid, zh), data in cross_map.items():
        if not data['grmpts'] or not data['specifics']: continue
        
        g_ab = data['grmpts'].strip().lower()
        for d_name, d_ab in data['specifics'].items():
            if g_ab == d_ab.strip().lower():
                matches[glid][d_name] += 1
        totals[glid] += 1
        
    print("--- GRMPTS ANCESTRY ANALYSIS ---")
    print(f"{'GLID':<6} | {'Group':<15} | {'Best Match Dialect':<25} | {'Match Rate'}")
    print("-" * 70)
    
    for glid in sorted(matches.keys()):
        if not matches[glid]: continue
        
        # Find highest match count
        best_dia = max(matches[glid], key=matches[glid].get)
        rate = (matches[glid][best_dia] / totals[glid]) * 100
        
        # Get Group Name
        cur.execute("SELECT group_name FROM dialects WHERE glid = ?", (glid,))
        g_name = cur.fetchone()[0]
        
        print(f"{glid:<6} | {g_name:<15} | {best_dia:<25} | {rate:>.1f}%")
        
    conn.close()

if __name__ == "__main__":
    db = "export/games_master.db"
    analyze_grmpts_ancestry(db)
