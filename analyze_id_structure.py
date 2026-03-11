import sqlite3
import json
import os
from collections import defaultdict

db = sqlite3.connect("export/ycm_master.db")

def analyze_structure(source):
    # Get all categories (TIDs) per dialect for a given source
    query = f"SELECT dialect_name, category FROM occurrences WHERE source = '{source}'"
    rows = db.execute(query).fetchall()
    
    dialect_to_tids = defaultdict(set)
    for d, c in rows:
        if c:
            dialect_to_tids[d].add(c)
    
    # Sort and convert to list
    result = {d: sorted(list(tids)) for d, tids in dialect_to_tids.items()}
    return result

structure = {
    "essay": analyze_structure("essay"),
    "dialogue": analyze_structure("dialogue")
}

# Write out the JSON structure for the user
output_path = "brain/analysis_nlp/corpus_id_structure.json"
os.makedirs(os.path.dirname(output_path), exist_ok=True)
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(structure, f, ensure_ascii=False, indent=2)

print(f"Structure dump complete: {output_path}")

# Quick summary analysis
essay_dialects = list(structure["essay"].keys())
if essay_dialects:
    d1 = essay_dialects[0]
    d2 = essay_dialects[1] if len(essay_dialects) > 1 else d1
    
    overlap = set(structure["essay"][d1]) & set(structure["essay"][d2])
    print(f"\nExample Essay Overlap ({d1} vs {d2}): {len(overlap)} matching IDs")
    print(f"Dialect 1 total: {len(structure['essay'][d1])}")
    print(f"Dialect 2 total: {len(structure['essay'][d2])}")

