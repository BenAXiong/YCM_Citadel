# ILRDF: Content Map & Scouting Report

This document outlines the harvested structure of the ILRDF Glossary (原住民族語學習詞表).

### 🏛️ The Target Structure
The ILRDF glossary is a dictionary-scale lexical archive covering **42 dialects** (16 families).

| Constellation | Source URL | Content Mapping |
| :--- | :--- | :--- |
| **ILRDF Glossary** | [glossary.ilrdf.org.tw](https://glossary.ilrdf.org.tw/resources) | Word + CH-Meaning + Level (1-9) + Audio + Image Meta |

### 🧬 Data Specification
The data is delivered via **Excel (.xlsx)** files, organized by dialect ID (e.g., `ID 01` for Nanshi Amis).

1.  **Lexical Unit**: The base Aboriginal word (Lemma).
2.  **Semantic Key**: The Traditional Chinese meaning.
3.  **Educational Metrics**: Levels 1-9 (A1 to C2 equivalent).
4.  **Phonetic Meta**: Direct links to MP3 pronunciation files.

### ⚔️ Harvest Operations
*   **The Scout**: Completed. ID Pattern identified (1-42).
*   **The Harvester**: `ilrdf_harvester.py` (To be deployed). High-speed bulk Excel download.
*   **The Integrator**: `ilrdf_merger.py` (To be deployed). Merging ILRDF lemmas into the `vocabulary` table of the YC-Citadel.

### 📜 Inventory Log
[SCN_01: Scouting via browser subagent. Confirmed 42 dialects available for direct XLS download.]
[SCN_02: Verified Excel schema matches our internal GLID mapping (Family -> Sub-dialect).]
