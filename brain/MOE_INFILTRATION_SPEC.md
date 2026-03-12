# 🛠️ MOE Infiltration: Technical Specification (Phase 12A)

This document formalizes the integration of the Amis MOE Dictionary into the YCM Citadel, focusing on **Alignment A (Aggregator Model)** and a separate testing pipeline.

---

## 1. Data Source: `g0v/amis-moedict`
*   **Strategy**: Shallow Git Clone with `git show` fallback for Windows-incompatible filenames.
*   **Dictionaries**: 
    1.  **Safolu (s)**: Primary source for examples and definitions.
    2.  **Poinsot (p)**: Primary source for English-Chinese triangulation.
    3.  **Wu Ming-yi (m)**: Reserved for future monolingual (Amis-Amis) features.

---

## 2. Alignment A: The Aggregator Model
Per your directive, we will treat the MOE dictionary as a "Virtual Dialect" rather than merging it directly into specific sub-dialects (Malan/Xiuguluan).

*   **Dialect Label**: `阿美語 (MOE)`
*   **GLID**: `01`
*   **Logic**:
    *   Definitions from MOE are stored with `source = 'MOE'`.
    *   Examples are ingested into the `occurrences` table (or test equivalent) with the `MOE` source tag.
    *   This ensures the Portal can filter for "MOE-only" data or show it as a baseline alongside other dialects.

---

## 3. Testing Pipeline: The "Shadow Archive"
To avoid polluting the production `ycm_master.db`, we are using `data/amis_moe_test.db` for initial infiltration.

### Database Schema (`moe_test.db`):
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | PK | Unique entry ID |
| `dict` | TEXT | Source dictionary (s/m/p) |
| `ab` | TEXT | Headword in Aboriginal script |
| `zh_def` | TEXT | Chinese definition |
| `en_def` | TEXT | English definition (if available) |
| `examples` | JSON | Array of `{ab, zh, en}` examples |

### Conversion Pipeline:
1.  **Stage 1: Git-Object Harvest**: Iterate through `docs/*/index.json`.
2.  **Stage 2: Semantic Slicing**: Use the `￹/￺/￻` delimiters to split AB/ZH/EN content.
3.  **Stage 3: Token Validation**: Verify that the headword follows the "Sovereign Source" encoding (stripping Mojibake).

---

## 4. Current Snags & Solutions
*   **Snag**: Checkout fails on Windows for files with colons.
*   **Solution**: Use `git -C {repo} show HEAD:{path}` to read file contents directly from the git index without needing them on disk.
*   **Snag**: Redundant definitions across s/m/p dictionaries.
*   **Solution**: Deduplicate by `headword + dictionary_code` during the test ingestion.

---

## 🚀 Status
*   [x] Repository cloned (partial checkout).
*   [x] Test database initialized (`data/amis_moe_test.db`).
*   [x] Harvester script drafted (`tmp/amis_moe_harvester.py`).
*   [x] Initial 40 entries validation pass.
*   [ ] Full-scale harvest (~50,000 entries).
