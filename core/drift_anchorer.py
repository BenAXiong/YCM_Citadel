import sqlite3
import json
from collections import defaultdict

# The 16 official GLID family groups — used to filter cross-family noise
# Only drift between dialects of the SAME family is linguistically meaningful
GLID_FAMILIES = {
    "01": ["南勢阿美語", "秀姑巒阿美語", "海岸阿美語", "馬蘭阿美語", "恆春阿美語"],
    "02": ["賽考利克泰雅語", "澤敖利泰雅語", "汶水泰雅語", "萬大泰雅語", "賽考利克太魯閣語", "斯卡羅泰雅語"],
    "03": ["南排灣語", "中排灣語", "北排灣語", "東排灣語"],
    "04": ["卓群布農語", "卡群布農語", "丹群布農語", "巒群布農語", "郡群布農語"],
    "05": ["南王卑南語", "知本卑南語", "西群卑南語", "建和卑南語"],
    "06": ["霧台魯凱語", "茂林魯凱語", "多納魯凱語", "東魯凱語", "萬山魯凱語", "大武魯凱語"],
    "07": ["鄒語"],
    "08": ["賽夏語"],
    "09": ["雅美語"],
    "10": ["邵語"],
    "11": ["噶瑪蘭語"],
    "12": ["太魯閣語"],
    "13": ["撒奇萊雅語"],
    "14": ["德固達雅賽德克語", "都達賽德克語", "德鹿谷賽德克語"],
    "15": ["拉阿魯哇語"],
    "16": ["卡那卡那富語"],
}

# Build reverse lookup
DIALECT_TO_GLID = {}
for glid, dialects in GLID_FAMILIES.items():
    for d in dialects:
        DIALECT_TO_GLID[d] = glid


def filter_noise(matrix_path):
    """Remove cross-family pairs from the drift matrix."""
    with open(matrix_path, "r", encoding="utf-8") as f:
        matrix = json.load(f)
    
    filtered = {}
    cross_family_removed = 0
    for d1, partners in matrix.items():
        glid1 = DIALECT_TO_GLID.get(d1)
        filtered[d1] = {}
        for d2, rules in partners.items():
            glid2 = DIALECT_TO_GLID.get(d2)
            if glid1 and glid2 and glid1 == glid2:
                filtered[d1][d2] = rules
            else:
                cross_family_removed += 1
        if not filtered[d1]:
            del filtered[d1]
    
    print(f"Cross-family pairs removed: {cross_family_removed}")
    print(f"Intra-family pairs kept: {sum(len(v) for v in filtered.values())}")
    return filtered


def anchor_to_morphemes(db_path, filtered_matrix, min_count=8):
    """For each drift rule, find the actual word pairs that triggered it."""
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Load all nine_year sentences grouped by zh and dialect
    cur.execute("""
        SELECT s.zh, s.ab, o.dialect_name
        FROM sentences s
        JOIN occurrences o ON s.id = o.sentence_id
        WHERE o.source = 'nine_year'
    """)
    
    zh_map = defaultdict(lambda: defaultdict(str))
    for zh, ab, d_name in cur.fetchall():
        zh_map[zh][d_name] = ab.strip().lower()
    
    # For each intra-family rule, find the word pairs
    word_map = defaultdict(lambda: defaultdict(lambda: defaultdict(set)))
    # word_map[d1][d2][rule] = {(word_d1, word_d2), ...}
    
    for d1, partners in filtered_matrix.items():
        for d2, rules in partners.items():
            for zh, dialects in zh_map.items():
                if d1 not in dialects or d2 not in dialects: continue
                words1 = dialects[d1].split()
                words2 = dialects[d2].split()
                if len(words1) != len(words2): continue
                for w1, w2 in zip(words1, words2):
                    c1 = w1.strip(".,!?;:'\"")
                    c2 = w2.strip(".,!?;:'\"")
                    if c1 == c2 or len(c1) != len(c2) or not c1: continue
                    for i, (ch1, ch2) in enumerate(zip(c1, c2)):
                        if ch1 != ch2:
                            rule = f"{ch1}->{ch2}"
                            if rule in rules and rules[rule] >= min_count:
                                word_map[d1][d2][rule].add((c1, c2))
    
    # Serialize and clean up
    output = {}
    for d1, partners in word_map.items():
        output[d1] = {}
        for d2, rules in partners.items():
            output[d1][d2] = {}
            for rule, pairs in rules.items():
                # Convert sets to sorted unique lists
                output[d1][d2][rule] = sorted(list(pairs))[:20]  # top 20 examples
    
    conn.close()
    return output


def summarize(anchored, filtered_matrix):
    """Print a readable summary of the key drift laws."""
    print("\n=== PHONETIC DRIFT LAWS (Intra-Family, Anchored) ===\n")
    for d1 in sorted(anchored.keys()):
        for d2, rules in anchored[d1].items():
            for rule, pairs in rules.items():
                count = filtered_matrix.get(d1, {}).get(d2, {}).get(rule, 0)
                examples = " | ".join([f"{p[0]}/{p[1]}" for p in pairs[:4]])
                print(f"  {d1} → {d2}  [{rule}] (n={count}): {examples}")


if __name__ == "__main__":
    matrix_path = "export/phonetic_drift_matrix.json"
    db_path = "export/ycm_master.db"
    
    print("Step 1: Filtering cross-family noise...")
    filtered = filter_noise(matrix_path)
    
    with open("export/phonetic_drift_filtered.json", "w", encoding="utf-8") as f:
        json.dump(filtered, f, ensure_ascii=False, indent=2)
    print(f"Saved filtered matrix → export/phonetic_drift_filtered.json")
    
    print("\nStep 2: Anchoring rules to morpheme pairs...")
    anchored = anchor_to_morphemes(db_path, filtered)
    
    with open("export/phonetic_drift_anchored.json", "w", encoding="utf-8") as f:
        json.dump(anchored, f, ensure_ascii=False, indent=2)
    print(f"Saved anchored morphemes → export/phonetic_drift_anchored.json")
    
    summarize(anchored, filtered)
