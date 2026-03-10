import sqlite3
import re
from collections import defaultdict

def normalize_ab(text):
    if not text: return ""
    return re.sub(r'[^a-zA-Z0-9]', '', text).lower()

def normalize_zh(text):
    if not text: return ""
    return re.sub(r'[^\u4e00-\u9fa5]', '', text)

def analyze_matching_dimensions(db_path, glid):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Grmpts data
    cur.execute("""
        SELECT s.ab, s.zh FROM sentences s 
        JOIN occurrences o ON s.id = o.sentence_id 
        WHERE s.glid = ? AND o.source = 'grmpts'
    """, (glid,))
    g_rows = cur.fetchall()
    
    grmpts_zh = set(normalize_zh(row[1]) for row in g_rows)
    grmpts_ab = set(normalize_ab(row[0]) for row in g_rows)
    grmpts_soul = set((normalize_ab(row[0]), normalize_zh(row[1])) for row in g_rows)
    
    # All other data
    cur.execute("""
        SELECT s.ab, s.zh FROM sentences s 
        JOIN occurrences o ON s.id = o.sentence_id 
        WHERE s.glid = ? AND o.source != 'grmpts'
    """, (glid,))
    other_rows = cur.fetchall()
    
    match_zh = set()
    match_ab = set()
    match_soul = set()
    
    for ab, zh in other_rows:
        nab = normalize_ab(ab)
        nzh = normalize_zh(zh)
        if nzh in grmpts_zh: match_zh.add(nzh)
        if nab in grmpts_ab: match_ab.add(nab)
        if (nab, nzh) in grmpts_soul: match_soul.add((nab, nzh))
        
    print(f"--- Analysis for GLID {glid} ---")
    print(f"Total Unique Grmpts Patterns: {len(grmpts_soul)}")
    print(f"Identical ZH Matches: {len(match_zh)}")
    print(f"Identical AB Matches: {len(match_ab)}")
    print(f"Identical SOUL (AB+ZH) Matches: {len(match_soul)}")
    
    conn.close()

if __name__ == "__main__":
    analyze_matching_dimensions("export/ycm_master.db", '01')
