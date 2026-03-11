import sqlite3
import os

db = sqlite3.connect("export/ycm_master.db")

print("--- Essay Meta ---")
print(db.execute("SELECT level, category, count(*) FROM occurrences WHERE source='essay' GROUP BY level, category LIMIT 20").fetchall())

print("\n--- Dialogue Meta ---")
print(db.execute("SELECT level, category, count(*) FROM occurrences WHERE source='dialogue' GROUP BY level, category LIMIT 20").fetchall())

print("\n--- Grmpts Meta ---")
rows = db.execute("SELECT DISTINCT level, category FROM occurrences WHERE source='grmpts' ORDER BY level, category").fetchall()
for r in rows:
    print(r)
