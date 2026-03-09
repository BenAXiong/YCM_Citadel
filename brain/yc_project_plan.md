# Klokah Content Downloader: Project Plan

## 1. Project Philosophy
Shift from **GUI-centric tools** to a **Headless Data Pipeline**.
*   **Raw Tier**: Save exact responses from Klokah (JSON/HTML) for auditability.
*   **Distilled Tier**: Transform raw data into a unified, machine-readable format optimized for study.
*   **Game Tier**: Export specific subsets (e.g., CSV/SQLite) for use in web or mobile apps.

## 2. Proposed Directory Structure
```text
/Content_Klokah
│
├── core/                   # Shared logic (networking, cleansers, types)
│   ├── network.py          # Requests + Retries
│   └── processors.py       # Mojibake fixes, text normalization
│
├── scrapers/               # Module-specific scraping logic
│   ├── grmpts_scraper.py   # 句法演練 logic
│   ├── essay_scraper.py    # 族語短文 logic
│   └── word_scraper.py     # (Future) 單詞 logic
│
├── data/
│   ├── raw/                # UNTOUCHED files from server
│   │   ├── grmpts/         # Organized by lid
│   │   └── essay/          # Organized by ES-code
│   │
│   └── distilled/          # THE MASTER STORE
│       ├── sentences.jsonl # One sentence per line (The "Gold" data)
│       └── metadata.json   # Maps lid/dialect/category names
│
├── archive/                # Deprecated GUIs and old scripts
└── export/                 # Ready-to-use data for your games
    └── games_master.db     # SQLite database for fast queries
```

## 3. Phase-by-Phase Execution

### Phase 1: The Foundation (Current Task)
*   Finalize `core.network` and `core.processors`.
*   Archive the GUI and standalone batch scripts to maintain a clean workspace.
*   Implement `scrapers/grmpts_scraper.py` using the new unified structure.

### Phase 2: Completion of Existing Data
*   Download all 16 languages for "Grammar Points" (GRMPTS).
*   Download all available "Essays" (ES codes).
*   **Distillation**: Run a processor script that reads every JSON/HTML file and writes a single `sentences.jsonl` entry for every unique sentence found.

### Phase 3: New Content Scouting
*   Identify other high-value pages (e.g., "Word of the Day", "Conversations", "News").
*   Build scrapers for these new structures using the same `core` logic.

### Phase 4: Nine/Twelve Framework Integration
*   Investigate and map the `/nine/` (Nine-Year Curriculum) and `/twelve/` (Twelve-Year Basic Education) endpoints. 
*   These are likely the core structural curricula defined by the Ministry of Education.
*   Extract the syllabus mappings so that raw sentences can be tagged with official MOE difficulty tiers or lesson names.

### Phase 5: Media Acquisition & Vocabulary Mapping
*   **Audio**: Batch download all referenced `.mp3` files based on the `audio_id` entries in `sentences.jsonl`. Organize audio by source or by first 2 characters of ID for filesystem performance.
*   **Dictionary Base**: Scrape the `/vocabulary/` and `/wawa/word.php` endpoints to create a unified `dictionary.jsonl`.
*   **Word-Level Tagging**: Run an overlapping script that checks sentences against the dictionary to automatically generate word-level definitions, bypassing the empty `data-value` attributes on the website.

### Current Status
- [x] **Phase 1: Grmpts (Grammar)** ✅
- [x] **Phase 2: Essay (Short Stories)** ✅
- [x] **Phase 3: Twelve-Year Curriculum (MOE)** ✅
- [x] **Phase 4: Nine-Year Curriculum** - 🟢 **COMPLETE (DATA RECLAIMED)**
- [x] **Phase 5: Vocabulary & Dictionary** - 🟢 **COMPLETE**
- [x] **Phase 6: Audio Downloader & Asset Mapping** - 🌊 **IN PROGRESS**
- [x] **Phase 7: Language Comparison UI (Matrix)** - 🚀 **LIVE (Matrix v2.2)**
- [x] **Phase 8: The Master Distillation** - 🟢 **COMPLETE (SQL SECURED)**

### Phase 6: Content Progression Assessment & DB Validation
Once the database is complete, utilize analysis modules to validate and optimize language study:
*   **Redundancy Assessor (`core/assessor.py`)**: Run checks to identify volume of duplicate sentences crossing over between modules.
    *   *Criterion*: Primary matching is on Aboriginal text (AB) within a dialect to ensure uniqueness in flashcard decks.
*   **Lexical Density & Pacing**: Calculate new-word introduction rates to predict study fatigue.

### Phase 7: Language & Dialectal Comparison
*   **Parallel Analysis**: Use Chinese translations (ZH) as a pivot to enable side-by-side visualization of different dialects.
*   **Cross-Dialect Mapping**: Identify how the "same" thought is expressed across the 16 languages to help comparative linguistics study.

### Phase 8: The Master Distiller (The Zenith Opus) ✅
*   **The Triple-Lock Soul Merge**: Completed. Merged ~80,000 redundant records across all sources using Aboriginal + Chinese + GLID hashing.
*   **Sovereign Database**: Created `export/games_master.db` with queryable tables for Dialects, Sentences, and Occurrences.
*   **The Atlas**: Created `klokah_language_atlas.md` to document the naming drift resolutions.
