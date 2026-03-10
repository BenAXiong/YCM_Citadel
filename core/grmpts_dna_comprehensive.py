import sqlite3
import re
from collections import defaultdict

def normalize_ab(text):
    if not text: return ""
    # Strip everything except characters to match core linguistic DNA
    return re.sub(r'[^a-zA-Z0-9]', '', text).lower()

def get_real_ancestry_report(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # 1. Map all Grmpts AB patterns
    cur.execute("""
        SELECT s.glid, s.ab
        FROM sentences s
        JOIN occurrences o ON s.id = o.sentence_id
        WHERE o.source = 'grmpts'
    """)
    grmpts_by_glid = defaultdict(set)
    for glid, ab in cur.fetchall():
        if ab:
            grmpts_by_glid[glid].add(normalize_ab(ab))
            
    # 2. Get Group Names
    cur.execute("SELECT glid, group_name FROM dialects")
    glid_to_name = dict(cur.fetchall())

    results_output = []
    
    for glid in sorted(grmpts_by_glid.keys()):
        g_name = glid_to_name.get(glid, f"GLID {glid}")
        grmpts_patterns = grmpts_by_glid[glid]
        total_grmpts = len(grmpts_patterns)
        
        # Get all dialects in this family
        cur.execute("""
            SELECT DISTINCT o.dialect_name 
            FROM occurrences o
            JOIN sentences s ON o.sentence_id = s.id
            WHERE s.glid = ? AND o.source != 'grmpts'
        """, (glid,))
        dialects = [row[0] for row in cur.fetchall()]
        
        dialect_matches = []
        for d in dialects:
            cur.execute("""
                SELECT s.ab
                FROM sentences s
                JOIN occurrences o ON s.id = o.sentence_id
                WHERE s.glid = ? AND o.dialect_name = ? AND o.source != 'grmpts'
            """, (glid, d))
            
            matches = 0
            seen_source = set()
            for ab, in cur.fetchall():
                norm = normalize_ab(ab)
                if norm in grmpts_patterns and norm not in seen_source:
                    matches += 1
                    seen_source.add(norm)
            
            rate = (matches / total_grmpts) * 100 if total_grmpts > 0 else 0
            dialect_matches.append((d, matches, rate))
            
        dialect_matches.sort(key=lambda x: x[2], reverse=True)
        results_output.append({
            'glid': glid,
            'name': g_name,
            'total': total_grmpts,
            'matches': dialect_matches
        })
        
    conn.close()
    return results_output

if __name__ == "__main__":
    report_data = get_real_ancestry_report("export/ycm_master.db")
    print("# LITERAL ANCESTRY MATCH REPORT")
    for group in report_data:
        print(f"\n## {group['glid']} - {group['name']} ({group['total']} unique patterns)")
        for d, m, r in group['matches']:
            print(f"| {d:<30} | {m:>5} matches | {r:>6.2f}% |")
