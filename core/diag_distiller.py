import sqlite3
import re

DB_PATH = "export/ycm_master.db"

def sanitize_dialect_name(name):
    if not name: return "UNKNOWN"
    noise = [
        r"\s*族語短文",
        r"\s*朗讀短文",
        r"\s*\(試辦\)",
        r"\s*九年一貫",
        r"\s*試辦",
    ]
    clean = name
    for pattern in noise:
        clean = re.sub(pattern, "", clean)
    return clean.strip()

def diag():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT DISTINCT dialect_name FROM occurrences WHERE dialect_name LIKE '%族語短文%' LIMIT 10")
    rows = cur.fetchall()
    print("Distinct Dialect Names with suffix in DB:")
    for r in rows:
        name = r[0]
        sanitized = sanitize_dialect_name(name)
        print(f"Original: '{name}' | Sanitized: '{sanitized}' | Equals: {name == sanitized}")
        print(f"Bytes: {name.encode('utf-8')}")
    conn.close()

if __name__ == "__main__":
    diag()
