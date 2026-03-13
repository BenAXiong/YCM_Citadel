import sqlite3
import json

conn = sqlite3.connect('data/amis_moe_test.db')
cursor = conn.cursor()
cursor.execute("SELECT word_ab, stem FROM moe_entries")
rows = cursor.fetchall()

mapping = {}
for w, s in rows:
    w_low = w.lower().strip()
    if s:
        s_low = s.lower().strip()
        if s_low and s_low != w_low:
            mapping[w_low] = s_low

# Iterative depth find for each word
max_d = 0
for w in mapping:
    curr = w
    chain = [w]
    while curr in mapping and mapping[curr] != curr and mapping[curr] not in chain:
        curr = mapping[curr]
        chain.append(curr)
    
    if len(chain) > max_d:
        max_d = len(chain)
        print(f"Found chain of {max_d}: {'>'.join(chain[::-1])}")

conn.close()
