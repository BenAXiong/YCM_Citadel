import json
import os
import argparse
from collections import defaultdict

def align_syllabus(level: int, lesson: int, data_dir: str):
    distilled_file = os.path.join(data_dir, "distilled", "sentences.jsonl")
    
    if not os.path.exists(distilled_file):
        print(f"Error: Database not found at {distilled_file}")
        return

    # dialect -> [sentences]
    lessons_map = defaultdict(list)
    
    lesson_str = f"Level {level} Lesson {lesson}"
    
    with open(distilled_file, "r", encoding="utf-8") as f:
        for line in f:
            try:
                record = json.loads(line)
                meta = record["metadata"]
                
                # Check if this record matches the syllabus coordinates
                if str(meta.get("level")) == str(level) and str(meta.get("category")) == lesson_str:
                     dialect = meta["dialect"]
                     lessons_map[dialect].append({
                         "ab": record["text"]["ab"],
                         "zh": record["text"]["zh"]
                     })
            except:
                continue

    if not lessons_map:
        print(f"No records found for Level {level} / Lesson {lesson}.")
        return

    print(f"=== SYLLABUS ALIGNMENT: Level {level}, Lesson {lesson} ===")
    
    # We find the max number of sentences in any dialect to balance the "rows"
    max_rows = max(len(s) for s in lessons_map.values())
    
    for i in range(max_rows):
        print(f"\n[Sentence Set {i+1}]")
        for dia, sentences in sorted(lessons_map.items()):
            if i < len(sentences):
                s = sentences[i]
                print(f"  {dia:20} | {s['ab']}")
                print(f"  {' ' * 20} | {s['zh']}")
        print("-" * 60)

if __name__ == "__main__":
    parser = argparse.ArgumentParser("Syllabus Aligner")
    parser.add_argument("--level", type=int, required=True)
    parser.add_argument("--lesson", type=int, required=True)
    args = parser.parse_args()
    
    base_data = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    align_syllabus(args.level, args.lesson, base_data)
