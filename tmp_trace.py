import sqlite3

def trace(word, db_path='data/amis_moe_test.db'):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    current = word.lower().strip()
    chain = [current]
    
    while True:
        cursor.execute("SELECT stem FROM moe_entries WHERE word_ab = ? AND stem IS NOT NULL AND stem != '' LIMIT 1", (current,))
        row = cursor.fetchone()
        if not row:
            break
        stem = row[0].lower().strip()
        if stem == current or stem in chain:
            break
        chain.append(stem)
        current = stem
        
    print(f"Chain for {word}: {' -> '.join(chain)}")
    
    # Also check if it's a stem for others
    cursor.execute("SELECT word_ab FROM moe_entries WHERE stem = ?", (word,))
    derivatives = cursor.fetchall()
    print(f"Derivatives of {word}: {[d[0] for d in derivatives]}")
    
    conn.close()

trace('pakanaikoren')
trace('ipakanaikoren')
trace('kaikoren')
trace('ikoren')
trace('ikoren')
