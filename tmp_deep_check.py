import sqlite3

conn = sqlite3.connect('data/amis_moe_test.db')
cursor = conn.cursor()

def check(word):
    cursor.execute("SELECT word_ab, stem FROM moe_entries WHERE word_ab = ?", (word,))
    print(f"Results for '{word}':", cursor.fetchall())

check('pakanaikoren')
check('mipapipatainian')
check('ipakanaikoren')
check('pakaikoren')
check('kaikoren')
check('ikoren')
check('ikor')

print("\nSearching for stems matching 'pakanaikoren' or 'ikoren'")
cursor.execute("SELECT word_ab, stem FROM moe_entries WHERE stem IN ('pakanaikoren', 'ikoren', 'kaikoren', 'kanaikoren')")
print(cursor.fetchall())

conn.close()
