# Phase 11.2: Syllabus Annexation (Data Recovery & Extension)

## 🎯 Objective
Achieve 100% structural parity across all 42 dialects for the MOE standardized curricula and expand the coverage of the Twelve-Year program to include Senior High levels.

---

## 🏗️ Target Gaps

### 1. Senior High Extension (Twelve-Year)
*   **Target**: Levels 10, 11, and 12.
*   **Endpoint**: `getTextNewTwelve.php` (The "New Twelve" module).
*   **Scope**: All 42 dialects.
*   **Total Expected Yield**: ~3,000 sentences.

### 2. Nine-Year Recovery
*   **Target**: 4 Missing Dialects identified in previous audit:
    *   四季泰雅語 (Suji Atayal) [did=10]
    *   大武魯凱語 (Dawu Rukai) [did=27]
    *   太魯閣語 (Truku) [did=35]
    *   宜蘭澤敖利泰雅語 (Yilan Squliq) [did=11]
*   **Total Expected Yield**: ~400 sentences.

---

## 🛠️ Implementation Workflow

### Step 1: Modify Scrapers
*   **`scrapers/twelve_scraper.py`**: Update to support the `getTextNewTwelve.php` endpoint for levels > 9.
*   **`scrapers/nine_scraper.py`**: Perform a targeted rerun for the missing dialect IDs.

### Step 2: The Forge Ingestion
1.  Empty `data/distilled/` temporarily to avoid duplicates (or rely on `logic_hash` merge).
2.  Run scrapers for the specific targets.
3.  Execute `python core/master_distiller.py` to bake the new souls into `ycm_master.db`.

### Step 3: Geometry Crystallization
Once the DB is 100% full, generate `portal/lib/corpus_geometry.json` containing:
*   Standardized Lesson Names (L1-12).
*   Correct TID mappings for Dialect-dependent stories (Essays/Dialogues).

---

## 🚀 Impact on VS-3
This annexation transforms VS-3 from a "fragmented reader" into a **Universal Comparative Reader**. You will be able to side-by-side compare high-school level legends and recovery dialects that were previously "ghosts" in the system.
