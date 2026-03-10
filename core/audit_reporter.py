import sqlite3
import os

DB_PATH = "export/ycm_master.db"
OUTPUT_FILE = "audit_results.txt"

def run_audit():
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        if not os.path.exists(DB_PATH):
            f.write(f"Error: {DB_PATH} not found.\n")
            return

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        f.write("--- 1. Source Distribution ---\n")
        cursor.execute("SELECT source, COUNT(*) FROM occurrences GROUP BY source ORDER BY COUNT(*) DESC")
        for row in cursor.fetchall():
            f.write(f"{row[0]}: {row[1]}\n")

        f.write("\n--- 2. Quirk Check (Source Leakage: 卡那卡那富語) ---\n")
        cursor.execute("SELECT o.id, o.dialect_name, s.zh, s.ab FROM occurrences o JOIN sentences s ON o.sentence_id = s.id WHERE o.source = '卡那卡那富語'")
        leaks = cursor.fetchall()
        f.write(f"Found {len(leaks)} leaks\n")
        for leak in leaks:
            f.write(f"ID: {leak[0]} | Dialect: {leak[1]} | ZH: {leak[2]} | AB: {leak[3]}\n")

        f.write("\n--- 3. Structural Metadata Coverage ---\n")
        cursor.execute("SELECT COUNT(*) FROM occurrences WHERE original_uuid IS NOT NULL")
        total_uuid = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM occurrences")
        total = cursor.fetchone()[0]
        f.write(f"UUID Coverage: {total_uuid}/{total} ({(total_uuid/total)*100:.2f}%)\n")

        f.write("\n--- 4. Spelling Variation Study (Amis: Orthographical Drift) ---\n")
        words = ['kako', 'kaku', 'fofo', 'fufu', 'mata']
        for w in words:
            cursor.execute("""
                SELECT COUNT(*) FROM sentences WHERE glid = '01' AND ab LIKE ?
            """, (f'%{w}%',))
            count = cursor.fetchone()[0]
            f.write(f"Word '{w}': {count} occurrences in Amis (GLID 01)\n")

        cursor.execute("""
            SELECT o.source, COUNT(*) 
            FROM occurrences o JOIN sentences s ON o.sentence_id = s.id 
            WHERE s.glid = '01' AND s.ab LIKE '%kaku%'
            GROUP BY o.source
        """)
        f.write("\nDistribution of 'kaku' (Legacy variant) by source:\n")
        for row in cursor.fetchall():
            f.write(f"{row[0]}: {row[1]}\n")

        cursor.execute("""
            SELECT o.source, COUNT(*) 
            FROM occurrences o JOIN sentences s ON o.sentence_id = s.id 
            WHERE s.glid = '01' AND s.ab LIKE '%kako%'
            GROUP BY o.source
        """)
        f.write("\nDistribution of 'kako' (Modern variant) by source:\n")
        for row in cursor.fetchall():
            f.write(f"{row[0]}: {row[1]}\n")

        conn.close()

if __name__ == "__main__":
    run_audit()
