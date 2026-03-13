import sqlite3

conn = sqlite3.connect('data/amis_moe_test.db')
cursor = conn.cursor()

cursor.execute("SELECT word_ab, stem FROM moe_entries WHERE word_ab LIKE '%pakanaikoren%'")
print("Search word_ab:", cursor.fetchall())

cursor.execute("SELECT word_ab, stem FROM moe_entries WHERE word_ab LIKE '%pakanaik%'")
print("Search paka-...", cursor.fetchall())

conn.close()
