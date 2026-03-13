# 📜 Yincumin Citadel: Script Log & Inventory

This document tracks all active scripts in the repository, their purposes, and their associated data realms.

## 🛠️ Data Reclamation (Scrapers)
Located in `scrapers/` — These scripts are responsible for harvesting raw content from Klokah and other sources.

| Script | Purpose | Targeting | Status |
| :--- | :--- | :--- | :--- |
| `grmpts_scraper.py` | Extracts grammatical structure JSONs. | 16 Language Families | 🟢 ACTIVE |
| `essay_scraper.py` | Scrapes cultural stories and thematic texts. | 42 Dialects | 🟢 ACTIVE |
| `nine_scraper.py` | Legacy Nine-Year Curriculum XML harvest. | 42 Dialects | 🟢 ACTIVE |
| `twelve_scraper.py` | Modern Twelve-Year Curriculum JSON harvest. | 42 Dialects | 🟢 ACTIVE |
| `dialogue_scraper.py` | Situational conversation pairs. | 42 Dialects | 🟢 ACTIVE |
| `vocabulary_scraper.py` | Word-level entries and practice sentences. | Partial (Scouting) | 🟡 INCOMPLETE |

---

## 🏗️ The Forge (Core Pipeline)
Located in `core/` — These scripts transform raw data into the unified Relational Archive.

| Script | Purpose | Key Logic |
| :--- | :--- | :--- |
| `master_distiller.py` | The master pipeline. Merges all `distilled/` JSONL files into `ycm_master.db`. | Soul Merge, GLID Mapping |
| `processors.py` | Text cleaning, sanitization, and GLID assignment logic. | GLID Resolution |
| `network.py` | Handles HTTP requests and Mojibake rescue decoding. | Encoding Correction |
| `constants.py` | Shared project-wide variables and path definitions. | Config |
| `ilrdf_harvester.py` | Hybrid scraper for the ILRDF terminology database. | Vocab Reclamation |

---

## 🔬 Audit & Diagnostics
Located in `core/` — Used to verify data integrity and detect "ghost bugs".

| Script | Purpose | Target Issues |
| :--- | :--- | :--- |
| `audit_db.py` | Scans the SQLite DB for source leaks and UUID coverage. | Data Leakage |
| `audit_reporter.py` | Generates high-level statistical reports on corpus density. | Density Gaps |
| `assessor.py` | Cross-validates database state against raw files. | Fidelity Check |
| `diag_distiller.py` | Targeted debugging for the distillation pipeline. | Merge Logic |
| `audio_tester.py` | Validates remote CDN audio URL availability. | Broke Links |
| `audio_annexer.py` | Logic for local audio backup (Legacy usage). | Asset Management |

---

## 🧬 Specialized NLP Analyzers (MoEDICT)
Located in `portal/scripts/` — Specialized logic for Amis morphological structures.

| Script | Purpose | Focus Area |
| :--- | :--- | :--- |
| `moe_hierarchy_builder.js` | **The Architect**. Builds the definitive linguistic hierarchy using DB stems and global overlap. | Unified Manifest |
| `moe_heuristic_explorer.js` | **The Explorer**. Heuristic script used to identify potential roots that may be missed by the official DB tags. | Discovery |
| `drift_matrix_builder.py` | Builds the phonetic correspondence heatmaps found in the portal. | Phonetic Drift |
| `drift_scanner.py` | Scans the corpus for specific drift anchors (u/o, q/h). | Anchor Detection |
| `drift_anchorer.py` | In-depth analysis of drift across the Amis axis. | Amis Axis |
| `grmpts_matrix.py` | Generates side-by-side grammatical comparison grids. | Syntax Parity |
| `grmpts_analyzer.py` | Analyzes morphological markers in grammar drills. | Morphology |
| `vs2_aligner.py` | Structural alignment for the Syllabus View (VS-2). | Curriculum Geometry |

---

## 🗑️ Utility & Temporary Scripts
| Script | Purpose |
| :--- | :--- |
| `ancestry_debug.py` | Debugging dialect family relationships. |
| `ancestry_true_purity.py` | Testing purity of dialect groups. |
| `match_dimension_audit.py` | Verifying multidimensional array structures. |
| `word_drift_tester.py` | Manual testing for specific word variations. |
| `en_translator.py` | Early experimentation with Rosetta Pass (EN) logic. |
