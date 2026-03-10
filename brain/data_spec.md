# Yincumin Citadel Data Specification (v1.1)

To ensure mini-games and research tools can use data from different parts of the corpus interchangeably, every sentence and occurrence must adhere to this unified schema.

## 1. The Sentence Object (JSON/JSONL)
Each record represents a single unique "soul" (a unique semantic thought) across the entire corpus. This is used for intermediate storage and interchange between scrapers and the master database.

```json
{
  "uuid": "grmpts_01_tid101_idx0",     // source_lid_tid_index (legacy/scraped)
  "logic_hash": "a1b2c3d4e5f6...",    // MD5 of glid + ab + zh (Primary deduplication key)
  "text": {
    "ab": "Kamaneng niso?",          // Aboriginal text (cleaned/standardized)
    "zh": "你好嗎？",                 // Chinese translation
    "en": "How are you?",            // English translation (Rosetta Engine)
    "pinyin": ""                      // Optional phonetic guide
  },
  "audio": {
    "id": "A001B02",                  // The source audio ID
    "url": "https://...",             // Remote source URL
    "local_path": "audio/A0/..."      // Relative local path
  },
  "metadata": {
    "glid": "01",                    // Global Language ID (01-16)
    "dialect": "馬蘭阿美語",           // Specific sub-dialect label
    "source": "grmpts",               // essay, grmpts, nine_year, twelve, ilrdf
    "level": 1,                       // Pedagogy level (1-12)
    "category": "Greetings",          // Lesson, category, or topic name
    "is_inferred": false              // True if dialect was resolved via mapping
  }
}
```

## 2. Master Database Schema (SQLite)
The `export/ycm_master.db` uses a normalized relational structure to manage the ~230k occurrences efficiently.

### A. Table: `sentences`
Contains unique text strings. One "soul" exists here once, even if it appears in 50 different lessons.
*   `id`: Integer Primary Key
*   `glid`: Text (Language family code, e.g., '01')
*   `ab`: Text (Aboriginal script)
*   `zh`: Text (Chinese translation)
*   `en_text`: Text (English translation)
*   `logic_hash`: Text (Deduplication seed)

### B. Table: `occurrences`
Maps sentences to their various pedagogical contexts (where they were found).
*   `id`: Integer Primary Key
*   `sentence_id`: Integer (FK to `sentences.id`)
*   `source`: Text (e.g., 'twelve', 'essay')
*   `dialect_name`: Text (The specific sub-dialect label)
*   `category`: Text (Topic or Lesson title)
*   `level`: Integer (1-12)
*   `audio_url`: Text (Direct link to the media asset)
*   `original_uuid`: Text (Original scraper reference)
*   `is_inferred`: Boolean (Whether the dialect label was attributed via the mapping engine)

## 3. Persistent Storage Infrastructure

### A. SQLite & Git LFS
The master database `export/ycm_master.db` is tracked via **Git LFS** due to its size (>100MB).
*   **GitHub Hosting**: Full content is stored on GitHub's LFS media servers.
*   **Vercel Build Bypass**: Vercel CI usually ignores LFS files. To bypass this, the `portal/package.json` build script uses `curl -L` to directly download the raw DB file from the GitHub CDN into the build environment.

### B. Data Interchange: JSONL
Scrapers and intermediate processors use **JSON Lines** (.jsonl) for serialization. 
*   **File Path**: `data/distilled/sentences.jsonl`
*   **Performance**: Supports O(1) appends and incremental streaming without loading full arrays into memory.
*   **Schema**: Matches the "Sentence Object" defined in Section 1. This file acts as the "Raw Gold" stream before it is forged into the SQLite relational index.

### C. Audio Artifact Management
Audio assets follow a sharded directory structure:
*   **Pattern**: `{root}/audio/{ID_PREFIX}/{ID}.mp3`
*   **Constraint**: Sharding by the first two characters (e.g., `audio/A0/A0...`) prevents directory indexing degradation on NTFS filesystems.
*   **Status**: Currently, **local audio is purged**. The system relies on the `audio_url` in the database for remote streaming to minimize repository overhead.

## 4. Distillation & Normalization Protocol
The `core/master_distiller.py` engine performs the following sanitization rounds to convert fragmented harvests into the master corpus:

*   **Mojibake Repair**: Global scan for double-encoded UTF-8 sequences.
*   **Whitespace Neutralization**: Resolution of inconsistent spacing found in legacy XML sources.
*   **Dialect Sanitization**: Stripping administrative noise labels like `族語短文`, `朗讀短文`, and `(試辦)` from incoming dialect strings to ensure cross-corpus parity.
*   **Naming Drift Resolution**: Mapping variant names (e.g., "Amis", "Amis Cluster") to fixed project GLID/Dialect codes using `glid_map.json`.
*   **The Soul Merge**: Semantic deduplication based on `(GLID, AB_Text, ZH_Text)`.

## 5. Data Lifecycle & Information Flow

The YCM ecosystem follows a unidirectional pipeline to ensure data integrity and traceability:

1.  **Mining Phase (Scrapers)**:
    *   `scrapers/*.py` target remote endpoints (Klokah API, ILRDF JSON).
    *   **Output**: Raw JSON/XML artifacts in `data/raw/` (for auditability).
2.  **Harmonization Phase (Converters)**:
    *   Specific modules convert raw files into a unified **JSONL** stream.
    *   **Output**: `data/distilled/sentences.jsonl` (The "Interchange" format).
3.  **The Forge (Distillation)**:
    *   `core/master_distiller.py` reads the JSONL stream, applies the **Normalization Protocol**, and builds the relational index.
    *   **Output**: `export/ycm_master.db` (The "Gold" source).
4.  **Enrichment Phase (Rosetta)**:
    *   `core/en_translator.py` performs trilingual triangulation (AB+ZH -> EN).
    *   **Output**: Updates `ycm_master.db` with the `en_text` column.
5.  **Consumption Phase (Portal)**:
    *   The Next.js portal reads `ycm_master.db` to serve the interactive Research UI.
