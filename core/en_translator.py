import sqlite3
import json
import os

def prepare_rosetta_test(db_path, count=100):
    """Fetches 100 unique sentences for translation testing."""
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Check if en_text column exists, if not add it
    try:
        cur.execute("ALTER TABLE sentences ADD COLUMN en_text TEXT")
    except sqlite3.OperationalError:
        pass # Already exists
        
    # Fetch 100 sentences from Nine-Year Curriculum
    query = """
    SELECT s.id, s.zh, s.ab, o.dialect_name, o.source
    FROM sentences s
    JOIN occurrences o ON s.id = o.sentence_id
    WHERE o.source = 'nine_year'
    LIMIT ?
    """
    cur.execute(query, (count,))
    rows = cur.fetchall()
    
    test_data = []
    for r in rows:
        test_data.append({
            "id": r[0],
            "zh": r[1],
            "ab": r[2],
            "dialect": r[3],
            "source": r[4]
        })
        
    with open("tmp_rosetta_test.json", "w", encoding="utf-8") as f:
        json.dump(test_data, f, ensure_ascii=False, indent=2)
        
    print(f"--- ROSETTA TEST PREPARED ---")
    print(f"Saved {len(test_data)} souls to tmp_rosetta_test.json")
    print(f"Proceed to translate these, then run 'apply_rosetta_test()'")
    conn.close()

def apply_rosetta_test(db_path, json_path):
    """Applies translated EN text back to the database."""
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    count = 0
    for item in data:
        if "en" in item and item["en"]:
            cur.execute("UPDATE sentences SET en_text = ? WHERE id = ?", (item["en"], item["id"]))
            count += 1
            
    conn.commit()
    print(f"--- ROSETTA TEST APPLIED ---")
    print(f"Updated {count} souls with English translations.")
    conn.close()

if __name__ == "__main__":
    db = "export/ycm_master.db"
    if not os.path.exists("tmp_rosetta_test.json"):
        prepare_rosetta_test(db)
    else:
        # Check if they have translations
        with open("tmp_rosetta_test.json", "r", encoding="utf-8") as f:
            t = json.load(f)
        if "en" in t[0]:
            apply_rosetta_test(db, "tmp_rosetta_test.json")
        else:
            print("Please add 'en' field to entries in tmp_rosetta_test.json first.")
