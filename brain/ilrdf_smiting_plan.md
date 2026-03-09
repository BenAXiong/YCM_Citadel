# ILRDF Glossary Conquest: The Smiting Plan

This document outlines the next target constellation: The ILRDF (Indigenous Languages Research and Development Foundation) Glossary.

### 1. The Tech Spec
*   **Target**: https://glossary.ilrdf.org.tw/resources
*   **Content Type**: Lexical units (words/lemmas) + Definitions + Example Sentences.
*   **Strategic Difference**: Unlike Klokah, which is curriculum-driven (syllabuses), ILRDF is **lexicography-driven** (dictionary). 
*   **Storage Path**: Existing `sentences.jsonl` (for example sentences) + New `export/vocabulary_master.db` table.

### 2. Implementation Methodology
1.  **Phase 1: The Scout** (`ilrdf_scout.py`). Crawl the resource structure and mapping of the 42 dialects.
2.  **Phase 2: The Harvest** (`ilrdf_harvester.py`). Extract all word listings.
3.  **Phase 3: The Integration** (`ilrdf_merger.py`). Normalizing the 16 GLIDs and merging into our `sentences` (for context) and a new `words` table.

### 3. Data Inventory (Estimated)
*   **Total Words**: ~80,000–120,000 unique records.
*   **Example Sentences**: ~40,000 new souls.
*   **Complexity**: High (includes part-of-speech tags and synonyms).

### 4. Convergence Strategy
The goal is to merge ILRDF into the same `games_master.db` to allow:
*   Word-level search in the GUI.
*   "Dictionary Tooltips": Hovering over a word in a sentence shows its ILRDF definition.
