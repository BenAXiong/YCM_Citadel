import sqlite3

conn = sqlite3.connect('data/amis_moe_test.db')
cursor = conn.cursor()

# Search for anything containing 'ikor'
cursor.execute("SELECT word_ab, stem FROM moe_entries WHERE word_ab LIKE '%ikor%' OR stem LIKE '%ikor%'")
results = cursor.fetchall()
for r in results:
    print(r)

conn.close()
