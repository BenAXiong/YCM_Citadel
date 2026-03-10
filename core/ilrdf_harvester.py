import requests
import json
import time
import os
import sqlite3
import re
from collections import defaultdict

BASE = "https://glossary-api.ilrdf.org.tw"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": "https://glossary.ilrdf.org.tw/",
    "Origin": "https://glossary.ilrdf.org.tw",
    "Accept": "application/json"
}
PAGE_SIZE = 100

def get_all_dialects():
    r = requests.get(f"{BASE}/api/v1/language", headers=HEADERS, timeout=10)
    data = r.json()["data"]
    return [(int(d["language_id"]), d["language_name"]) for d in data if d["language_id"].isdigit()]

def harvest_dialect(dialect_id, dialect_name):
    page = 1
    all_words = []
    while True:
        url = f"{BASE}/api/front_end/glossary_search?word=&dialect_id={dialect_id}&fuzzy=0&page={page}"
        r = requests.get(url, headers=HEADERS, timeout=12)
        if r.status_code != 200:
            print(f"  [{dialect_name}] Page {page}: HTTP {r.status_code}")
            break
        data = r.json().get("data", {})
        items = data.get("data", [])
        total = data.get("total", 0)
        all_words.extend(items)
        print(f"  [{dialect_name}] Page {page}: +{len(items)} words ({len(all_words)}/{total})", end="\r")
        if len(all_words) >= total or not items:
            break
        page += 1
        time.sleep(0.3)
    return all_words


def ensure_table(db_path="export/ycm_master.db"):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS ilrdf_vocabulary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dialect_id INTEGER,
            dialect_name TEXT,
            glid TEXT,
            word_ab TEXT,
            word_ch TEXT,
            source TEXT,
            num INTEGER
        )
    """)
    conn.commit()
    conn.close()

def is_harvested(dialect_id, db_path="export/ycm_master.db"):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM ilrdf_vocabulary WHERE dialect_id = ?", (dialect_id,))
    cnt = cur.fetchone()[0]
    conn.close()
    return cnt > 0

def build_glid_map(db_path="export/ycm_master.db") -> dict:
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT glid, sub_dialects FROM dialects")
    d_map = {}
    for g, sub in cur.fetchall():
        for d in [s.strip() for s in sub.split(',')]:
            if d: d_map[d] = g
    conn.close()
    return d_map

def save_dialect_to_db(d_id, original_d_name, words, d_map, db_path="export/ycm_master.db"):
    if not words: return
    
    # Sanitize anomaly e.g. "都達賽德克語(南投)" -> "都達賽德克語"
    d_name = re.sub(r'\(.*?\)', '', original_d_name).strip()
    glid = d_map.get(d_name, "00")
    
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    rows = []
    for w in words:
        rows.append((
            d_id, d_name, glid,
            w.get("word_ab","").strip(), 
            w.get("word_ch","").strip(), 
            w.get("source",""), 
            w.get("num",0)
        ))
    
    cur.executemany("INSERT INTO ilrdf_vocabulary (dialect_id, dialect_name, glid, word_ab, word_ch, source, num) VALUES (?,?,?,?,?,?,?)", rows)
    conn.commit()
    conn.close()

if __name__ == "__main__":
    print("=== ILRDF LEXICAL HARVEST (Full API) ===")
    ensure_table()
    dialects = get_all_dialects()
    print(f"Found {len(dialects)} dialects to harvest\n")
    
    total = 0
    d_map = build_glid_map()
    
    for d_id, d_name in sorted(dialects):
        if is_harvested(d_id):
            print(f"[{d_id:>3}] {d_name} - Already harvested. Skipping.")
            continue
            
        print(f"\n[{d_id:>3}] Harvesting: {d_name}")
        words = harvest_dialect(d_id, d_name)
        print(f"       → {len(words)} words collected")
        save_dialect_to_db(d_id, d_name, words, d_map)
        total += len(words)
        time.sleep(0.5)
    
    print(f"\n=== HARVEST COMPLETE ===")
