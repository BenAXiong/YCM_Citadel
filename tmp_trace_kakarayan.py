import sqlite3
import json

def trace_word(word_ab):
    db_path = 'data/amis_moe_test.db'
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print(f"Tracing word: {word_ab}")
    
    # 1. Who is its stem?
    cursor.execute("SELECT stem FROM moe_entries WHERE word_ab = ?", (word_ab,))
    stems = cursor.fetchall()
    print(f"Parent Stem(s): {stems}")
    
    # 2. Who are its children?
    cursor.execute("SELECT word_ab, definition FROM moe_entries WHERE stem = ?", (word_ab,))
    children = cursor.fetchall()
    print(f"Direct Children: {len(children)}")
    for child, defn in children:
        print(f"  -> {child}: {defn}")
        
    # 3. Recursive bloom simulation
    all_seen = {word_ab.lower()}
    queue = [word_ab.lower()]
    tier = 2
    while queue:
        next_queue = []
        print(f"\nGenerations Tier {tier}:")
        for q in queue:
            cursor.execute("SELECT word_ab FROM moe_entries WHERE stem = ?", (q,))
            res = cursor.fetchall()
            for r in res:
                w = r[0].lower()
                if w not in all_seen:
                    print(f"  + {w}")
                    all_seen.add(w)
                    next_queue.push(w) if hasattr(next_queue, 'push') else next_queue.append(w)
        queue = next_queue
        tier += 1
        if tier > 5: break

    conn.close()

if __name__ == "__main__":
    trace_word("kakarayan")
    print("\n" + "="*40 + "\n")
    trace_word("karayan")
