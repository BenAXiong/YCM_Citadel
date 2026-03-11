import sqlite3
import json
import os
from collections import defaultdict

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "export", "ycm_master.db")
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "portal", "lib", "corpus_geometry.json")

def generate_geometry():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    geometry = {
        "nine_year": {},
        "twelve": {},
        "essay": {},
        "dialogue": {},
        "grmpts": {}
    }
    
    # 1. Geometry for nine_year & twelve (Structural)
    for source in ["nine_year", "twelve"]:
        cursor.execute(f"SELECT DISTINCT level FROM occurrences WHERE source='{source}' ORDER BY CAST(level AS INTEGER)")
        levels = [row[0] for row in cursor.fetchall() if row[0]]
        
        geometry[source] = {
            "levels": levels,
            "classes": list(range(1, 11))
        }

    # 2. Geometry for Grmpts (Patterns)
    cursor.execute("SELECT DISTINCT level FROM occurrences WHERE source='grmpts' ORDER BY CAST(level AS INTEGER)")
    grm_levels = [row[0] for row in cursor.fetchall() if row[0]]
    cursor.execute("SELECT DISTINCT category FROM occurrences WHERE source='grmpts' ORDER BY CAST(SUBSTR(category, 2) AS INTEGER)")
    grm_types = [row[0] for row in cursor.fetchall() if row[0]]
    geometry["grmpts"] = {
        "levels": grm_levels,
        "types": grm_types
    }
        
    # 2. Geometry for essay & dialogue (Narrative Sequential Alignment)
    for source in ["essay", "dialogue"]:
        # Get all dialects and their IDs for this source
        cursor.execute(f"SELECT DISTINCT dialect_name, category FROM occurrences WHERE source='{source}' ORDER BY dialect_name, category")
        rows = cursor.fetchall()
        
        dialect_map = defaultdict(list)
        for d, tid in rows:
            if tid and tid not in dialect_map[d]:
                dialect_map[d].append(tid)
        
        # Klokah narrative sources have a fixed structure (e.g. 72 lessons per dialect)
        # We find the max number of lessons among all dialects to define the geometry range
        max_len = 0
        if dialect_map:
            max_len = max(len(tids) for tids in dialect_map.values())
        
        topics = []
        for i in range(max_len):
            alignment = {}
            # We also try to grab a sample title from any dialect that has this index
            sample_zh = f"Topic {i+1}"
            for d, tids in dialect_map.items():
                if i < len(tids):
                    tid = tids[i]
                    alignment[d] = tid
            
            topics.append({
                "index": i,
                "title_zh": sample_zh,
                "alignment": alignment
            })
        
        geometry[source] = topics

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(geometry, f, ensure_ascii=False, indent=2)
        
    print(f"Geometry crystallized to {OUTPUT_PATH}")

if __name__ == "__main__":
    generate_geometry()
