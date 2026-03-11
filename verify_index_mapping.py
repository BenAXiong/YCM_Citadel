import sqlite3

db = sqlite3.connect("export/ycm_master.db")

def get_first_zh(category):
    row = db.execute("""
        SELECT s.zh FROM occurrences o 
        JOIN sentences s ON o.sentence_id = s.id 
        WHERE o.category = ? 
        AND (o.original_uuid LIKE '%_1' OR o.original_uuid LIKE '%_0')
        LIMIT 1
    """, (category,)).fetchone()
    return row[0] if row else "NONE"

# Test Amis Ambiance
dialects = ["南勢阿美語", "秀姑巒阿美語", "海岸阿美語", "馬蘭阿美語", "恆春阿美語"]
structure = {
    "南勢阿美語": ["34045", "34046", "34047"],
    "海岸阿美語": ["34093", "34094", "34095"],
    "馬蘭阿美語": ["34141", "34142", "34143"]
}

for d, ids in structure.items():
    print(f"\n{d}:")
    for tid in ids:
        print(f"  {tid} -> {get_first_zh(tid)}")

