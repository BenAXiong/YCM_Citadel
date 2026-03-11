# Phase 11: Reproducible Data Audit Plan

## 🎯 Objective
Establish a rigorous, automated, and reproducible process to verify the integrity of the Citadel Master Archive (`ycm_master.db`). This audit ensures that our refined data remains faithful to its sources and that no cross-dialectal leakage or script errors have corrupted the linguistic essence of the corpus.

## 🛠️ Audit Dimensions

### 1. Raw-to-Refined Fidelity (The "Mirror Test")
*   **Methodology**: Select a random 5% sample of `(GLID, ID)` pairs from the production database.
*   **Action**: Re-fetch or re-read the original raw data (JSON/HTML) from the `Raw Tier` and perform a byte-level comparison of the text field.
*   **Target**: 100% match (excluding intentional normalization like Mojibake repair).

### 2. Language Plausibility (The "Purity Test")
*   **Methodology**: Utilize the [**Phonetic Drift Matrix**](phonetic_drift_report.md) and known dialectal markers.
*   **Action**: Run a script that scans entries for "illegal" characters or phonetic sequences that do not exist in the assigned GLID's phonology.
    *   *Example*: A 'q' appearing in an Amis dialect that only uses 'k/h'.
    *   *Example*: Detecting Mandarin characters inside fields that should be purely Indigenous text.
*   **Detection**: Automated flagging of high-risk entries in `audit_flags` table.

### 3. Structural Consistency
*   **Methodology**: Verify mapping integrity between GLIDs and Dialect Codes.
*   **Action**: Ensure every record in `ycm_master` successfully joins with `klokah_atlas` and is assigned to a valid geographical region.

### 4. Pipeline Schema Assertions (The "Nullity Guard")
*   **Methodology**: Prevent silent scraper failures caused by upstream API schema changes (e.g., Klokah using `ch` instead of `zh` or `sn` instead of `sound`).
*   **Action**: Before any JSONL is merged into the master `occurrences` DB, the `master_distiller` must execute statistical anomaly checks:
    *   *Assert*: `AB text` is non-empty for >99% of rows per corpus.
    *   *Assert*: `ZH text` is non-empty for >95% of rows per corpus.
    *   *Assert*: `Audio URL` is well-formed (if the corpus claims audio support).
*   **Detection**: If a corpus returns 0% or suspiciously low presence of a mandatory field, the distiller triggers a **CRITICAL ABORT** and refuses to poison the database.

## 📋 Implementation Steps

### Step A: Audit CLI Tool
Develop `core/data_auditor.py` to handle the heavy lifting.
- `pip install datacompy` for relational comparison.
- Implement `verify_sample(n=1000)` command.

### Step B: The Language Validator
Modify `core/single_dialect_purity_test.py` to accept GLID as an input and apply specific phonetic constraints relative to that dialect.

### Step C: Reporting
Generate a `data_purity_index.json` after every major "Forge" run (Master Distillation).

## 📅 Timeline
- **Denylist Generation**: 2026-03-18

## 📊 Phase 11 Audit Findings (2026-03-10)

### 1. Source Integrity & Quirk Detection
- **Findings**: Detected 1 critical metadata leakage record where a dialect name (`卡那卡那富語`) occupied the `source` field.
- **Specifics**: Row ID `197598` | ZH is empty | AB is `kumumuana!...`.
- **Root Cause**: Likely a column shift in the original Klokah legacy CSV/JSON headers.
- **Action**: Implement a `SOURCE_VALIDATION_DENYLIST` in `master_distiller.py`.

### 2. Structural Metadata Coverage
- **Metric**: **100.00% Coverage** (229,590 / 229,590 records).
- **Impact**: Every single sentence in the Citadel today is traceable via `original_uuid`. This enables the "Structural Alignment" plan.

### 3. Orthographical Drift Study (Amis GLID 01)
- **Problem**: Inconsistent spelling of common markers across different pedagogical eras.
- **Data Points (Amis Family)**:
    - **Variant 'kako' (Modern)**: 1,683 occurrences. Dominates `grmpts`.
    - **Variant 'kaku' (Legacy)**: 427 occurrences. Appearing in `nine_year` and legacy `dialogue` modules.
- **Pedagogical Impact**: Searching for "I" (`kako`) may miss legacy curriculum rows spelling it as `kaku`.
- **Future Action**: The "Standardized Spelling" toggle must use a regex-based phoneme stabilizer to bridge these eras in search results.

