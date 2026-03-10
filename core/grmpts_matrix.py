import sqlite3
import re
from collections import defaultdict

def normalize(text):
    if not text: return ""
    return re.sub(r'[\s\W_]+', '', text).lower()

def get_comprehensive_ancestry(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # 1. Load GLID to Group Name mapping
    cur.execute("SELECT glid, group_name FROM dialects")
    glid_to_name = dict(cur.fetchall())

    # 2. Identify multi-dialect groups by joining occurrences with sentences
    cur.execute("""
        SELECT s.glid, COUNT(DISTINCT o.dialect_name) 
        FROM occurrences o
        JOIN sentences s ON o.sentence_id = s.id
        GROUP BY s.glid 
        HAVING COUNT(DISTINCT o.dialect_name) > 1
    """)
    multi_dialect_glids = [row[0] for row in cur.fetchall()]

    print("# Comprehensive Grmpts Ancestry Matrix\n")

    for glid in sorted(multi_dialect_glids):
        g_name = glid_to_name.get(glid, f"GLID {glid}")
        
        # Get all Grmpts sentences for this GLID
        cur.execute("""
            SELECT DISTINCT s.ab 
            FROM sentences s
            JOIN occurrences o ON s.id = o.sentence_id
            WHERE s.glid = ? AND o.source = 'grmpts'
        """, (glid,))
        grmpts_sentences = {normalize(row[0]) for row in cur.fetchall() if row[0]}
        total_grmpts = len(grmpts_sentences)
        
        if total_grmpts == 0:
            continue

        print(f"## GLID {glid} - {g_name} ({total_grmpts} unique patterns)")
        
        # Get all sub-dialects in this GLID (from non-grmpts sources)
        cur.execute("""
            SELECT DISTINCT o.dialect_name 
            FROM occurrences o
            JOIN sentences s ON o.sentence_id = s.id
            WHERE s.glid = ? AND o.source != 'grmpts'
        """, (glid,))
        dialects = [row[0] for row in cur.fetchall()]
        
        results = []
        for dialect in dialects:
            # Get all sentences for this dialect (from other sources)
            cur.execute("""
                SELECT DISTINCT s.ab
                FROM sentences s
                JOIN occurrences o ON s.id = o.sentence_id
                WHERE s.glid = ? AND o.dialect_name = ? AND o.source != 'grmpts'
            """, (glid, dialect))
            dialect_sentences = {normalize(row[0]) for row in cur.fetchall() if row[0]}
            
            # Intersection
            matches = len(grmpts_sentences.intersection(dialect_sentences))
            rate = (matches / total_grmpts) * 100
            results.append((dialect, matches, rate))
        
        # Sort by rate
        results.sort(key=lambda x: x[2], reverse=True)
        
        print("| Sub-Dialect | Matches | Purity % |")
        print("| :--- | :---: | :---: |")
        for d, m, r in results:
            print(f"| {d} | {m} | {r:.2f}% |")
        print("\n")

    conn.close()

if __name__ == "__main__":
    get_comprehensive_ancestry("export/ycm_master.db")
