import sqlite3
import os

db = sqlite3.connect("export/ycm_master.db")

# Find essays with the same title (first sentence) across dialects
query = """
SELECT s.zh, GROUP_CONCAT(DISTINCT o.dialect_name) as dialects, COUNT(DISTINCT o.dialect_name) as d_count
FROM occurrences o
JOIN sentences s ON o.sentence_id = s.id
WHERE o.source = 'essay' 
AND o.original_uuid LIKE '%_1' -- First sentence of the essay
GROUP BY s.zh
HAVING d_count > 1
ORDER BY d_count DESC
LIMIT 10
"""

rows = db.execute(query).fetchall()
for row in rows:
    print(f"Title: {row[0]}")
    print(f"Dialects: {row[1][:100]}...")
    print(f"Count: {row[2]}\n")
