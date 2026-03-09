# Klokah Data Specification (v1.0)

To ensure mini-games can use data from different parts of the site interchangeably, every sentence must adhere to this unified schema.

## 1. The Sentence Object
Each record represents a single sentence or phrase.

```json
{
  "uuid": "grmpts_01_tid101_idx0",  // source_lid_tid_index
  "text": {
    "ab": "Kamaneng niso?",       // Aboriginal text (cleaned)
    "zh": "你好嗎？",              // Chinese translation
    "pinyin": ""                   // Optional phonetic guide
  },
  "audio": {
    "id": "A001B02",               // The Klokah audio ID
    "url": "https://...",          // Remote URL
    "local_path": "audio/A0/..."   // Relative local path (once downloaded)
  },
  "metadata": {
    "source": "grmpts",            // essay, grmpts, vocabulary, news
    "lang_id": 1,                  // 1-16
    "dialect": "馬蘭阿美語",        // Specific dialect if known
    "level": 1,                    // Difficulty (1-9 or A1/A2/etc)
    "category": "Greetings",       // Lesson or category name
    "tags": ["common", "verb"],    // Useful for game filtering
    "scrape_date": "2026-03-05"    // For tracking stale data
  }
}
```

## 2. Storage Recommendations

### A. Intermediate Storage: JSONL
Write files as `JSON Lines` (.jsonl).
*   **Why?** Thousands of sentences can be appended to a single file without corruption. You can read it line-by-line without loading the whole file into RAM.

### B. Game-Layer: SQLite
For your mini-games, convert the JSONL into a table.
*   **Table: `sentences`**
    *   Columns: `uuid`, `lang_id`, `text_ab`, `text_zh`, `audio_id`, `source`, `level`
*   **Why?** It allows complex filters like: 
    `SELECT * FROM sentences WHERE lang_id=1 AND level < 3 ORDER BY RANDOM() LIMIT 10`

### C. Audio Storage
Organize by the first two characters of the ID to avoid folders with 10,000+ files (which slows down Windows Explorer).
*   `audio/A0/A001B02.mp3`
*   `audio/A0/A001C05.mp3`
*   `audio/B1/B102D01.mp3`
