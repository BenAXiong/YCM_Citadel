# Map of Ultimate Annihilation (Phase 8: Master Distillation)

This document is our final blueprint for data sovereignty. We will transition from a chaotic collection of JSONL files to a surgically cleaned, normalized, and high-speed SQLite Archive.

## 1. The Cleanup Protocols (The Sanitization Pass)

### A. Mojibake Obliteration
*   **Target**: Double-encoded UTF-8 sequences (e.g., `é˜¿ç¾Žèªž`).
*   **Action**: A final global scan using the `repair_mojibake` engine to ensure all strings are "Clean UTF-8".
*   **Whitelist**: Only valid Chinese characters, Aboriginal scripts (with Latin/IPA chars), and standard punctuation shall remain.

### B. White-Space Neutralization
*   **Target**: Inconsistent spacing in Aboriginal text (often found in XML source).
*   **Action**: Normalize multiple spaces to single spaces; trim all leading/trailing invisible characters.

## 2. The Great Normalization (GLID Mapping)

We will map the site's "Naming Drift" into one immutable **Global Language ID (GLID)** system.

| GLID | Group | Target Dialect (Sample) | Site Variants Detected |
| :--- | :--- | :--- | :--- |
| **01** | 阿美語 | 南勢阿美語 | 阿美語, 南勢阿美語, Amis |
| **02** | 泰雅語 | 賽考利克泰雅語 | 泰雅語, 賽考利克, Squliq |
| **03** | 排灣語 | 北排灣語 | 排灣語, 北排灣語, Paiwan |
| ... | ... | ... | ... |

*   **Logic**: Every sentence will be tagged with a GLID. If a record has "Amis", "南勢阿美語", or "é˜¿ç¾Ž", it is force-mapped to GLID 01.

## 3. Semantic Deduplication (The Soul Merge)

We will identify the "Canonical Sentence" across all sources.
*   **Key**: `(GLID, AB_Text_Normalized, ZH_Text_Normalized)`.
*   **The Result**: A single `sentence_id` that links to multiple **Occurrences**.
    *   *Example*: Sentence "O kolong koni" exists in `essay`, `nine_year`, and `twelve_year`. One row in `sentences`, three rows in `occurrences`.

## 4. The Citadel Archive (SQLite Schema)

### Table: `languages`
*   `glid` (INTEGER, PK)
*   `group_name_zh` (TEXT)
*   `dialect_name_zh` (TEXT)
*   `iso_code` (TEXT, e.g., 'ami')

### Table: `sentences`
*   `id` (INTEGER, PK)
*   `glid` (INTEGER, FK)
*   `ab` (TEXT) - Cleaned Aboriginal script
*   `zh` (TEXT) - Cleaned Chinese translation
*   `word_data_json` (TEXT) - Word-level mappings from Nine-Year/Vocab

### Table: `source_links`
*   `sentence_id` (INTEGER, FK)
*   `source_name` (TEXT) - `essay`, `grmpts`, `nine`, etc.
*   `level` (INTEGER)
*   `lesson` (TEXT)
*   `audio_url` (TEXT)
*   `local_path` (TEXT)

## 5. Execution Steps
1.  **Mining Completion**: Verify Audio Annexation is 100%.
2.  **The Forge**: Run `master_distiller.py`.
3.  **The Audit**: Final count of "Pure Unique" vs "Redundant" records.
4.  **The Deployment**: Package the `.db` file for the final user interface.
