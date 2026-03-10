import sqlite3
import os

DB_PATH = "export/ycm_master.db"

def run_audit():
    if not os.path.exists(DB_PATH):
        print(f"Error: {DB_PATH} not found.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("--- 1. Source Distribution ---")
    cursor.execute("SELECT source, COUNT(*) FROM occurrences GROUP BY source ORDER BY COUNT(*) DESC")
    for row in cursor.fetchall():
        print(f"{row[0]}: {row[1]}")

    print("\n--- 2. Quirk Check (Source Leakage) ---")
    cursor.execute("SELECT id, dialect_name, sentence_id FROM occurrences WHERE source = '卡那卡那富語'")
    leaks = cursor.fetchall()
    print(f"Found {len(leaks)} leaks where source='卡那卡那富語'")
    for leak in leaks:
        cursor.execute("SELECT zh, ab FROM sentences WHERE id = ?", (leak[2],))
        s = cursor.fetchone()
        print(f"ID: {leak[0]} | Dialect: {leak[1]} | Text: {s[0]} -> {s[1]}")

    print("\n--- 3. Structural Metadata Coverage (UUIDs) ---")
    cursor.execute("SELECT COUNT(*) FROM occurrences WHERE original_uuid IS NOT NULL")
    total_uuid = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM occurrences")
    total = cursor.fetchone()[0]
    print(f"UUID Coverage: {total_uuid}/{total} ({(total_uuid/total)*100:.2f}%)")

    print("\n--- 4. Spelling Variation Study (u vs o) ---")
    # Search for 'mata' variations in Amis dialects (GLID 01)
    # common patterns: mata, mata', mata'ay
    cursor.execute("""
        SELECT s.ab, s.zh, o.source, o.dialect_name 
        FROM occurrences o 
        JOIN sentences s ON o.sentence_id = s.id 
        WHERE s.glid = '01' AND s.ab LIKE '%mata%'
        LIMIT 10
    """)
    print("Amis 'mata' variations sample:")
    for row in cursor.fetchall():
        print(f"[{row[2]}] {row[3]}: {row[0]} ({row[1]})")

    conn.close()

if __name__ == "__main__":
    run_audit()
