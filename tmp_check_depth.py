import sqlite3
import json

conn = sqlite3.connect('data/amis_moe_test.db')
cursor = conn.cursor()

# Check hatini
cursor.execute("SELECT word_ab, stem FROM moe_entries WHERE word_ab = 'hatini'")
print("hatini:", cursor.fetchall())

# Check if anything has hatini as stem
cursor.execute("SELECT word_ab, stem FROM moe_entries WHERE stem = 'hatini'")
print("derivatives of hatini:", cursor.fetchall())

# Find max depth using a different approach: DFS
cursor.execute("SELECT word_ab, stem FROM moe_entries")
mapping = {row[0].lower().strip(): row[1].lower().strip() for row in cursor.fetchall() if row[1]}

def get_depth(w, path):
    if w not in mapping or mapping[w] == w or mapping[w] in path:
        return len(path)
    return get_depth(mapping[w], path + [mapping[w]])

max_d = 0
deepest_w = ""
for w in mapping:
    d = get_depth(w, [w])
    if d > max_d:
        max_d = d
        deepest_w = w

print(f"Max depth found: {max_d} for word {deepest_w}")
conn.close()
