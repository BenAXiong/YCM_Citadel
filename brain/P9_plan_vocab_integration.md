# ILRDF Integration: Word-Level Architecture (Phase 9)

This document outlines the technical implementation for the dictionary-scale word integration and hover-tooltip logic.

---

## 1. The Vocabulary Core
Instead of simple string matching, which fails for inflected forms (e.g., *m-iris* vs *iris*), we utilize a multi-tiered lookup system.

### A. The `vocabulary` Table
A new table in `ycm_master.db` stores the primary lexical units from ILRDF:
*   `id` (Primary Key)
*   `glid` (Language Family)
*   `dialect_id` (Dialect Specific ID)
*   `stem` (The root form)
*   `lexical_unit` (The full entry form)
*   `zh_meaning` (Traditional Chinese definition)
*   `en_meaning` (English translation, triangulated)
*   `level` (MOE level 1-9)

### B. The Mapping Strategy
To achieve high-fidelity "Hovers" in the Portal:
1.  **Direct Match**: Exact match of a token to a `lexical_unit` in the database.
2.  **Stem Stripping**: Applying known morpheme rules (Amis focus markers `m-`, `-in-`, etc.) to find the `stem` if the full word doesn't match.
3.  **Fuzzy Reference**: Using the `word_data_json` column in the `sentences` table (harvested from Nine-Year curriculum) to provide instant definitions for high-frequency pedagogy words.

---

## 2. Portal Implementation
The Research Portal uses a specialized **Lexicon-Overlay** component:
*   **Trigger**: Cursor hover over a word in any Research Table.
*   **Action**: 
    1.  Fetch word metadata from `/api/vocabulary?word={W}&glid={G}`.
    2.  Display "Quick Card": Stem, Part of Speech, and Level.
    3.  Link to "Deep View": Full dictionary entry with example sentences from other corpora.

---

## 3. Data Cleanup & Normalization
*   **The Conflict Resolver**: If ILRDF provides a different definition than the Klokah "Word-of-the-day", we prioritize ILRDF as the lexicographical authority.
*   **Dialectal Alignment**: ILRDF dialect IDs (1-42) must be precisely aligned with our master `content_intel/klokah_atlas.md` to prevent "Ghost Definitions" (definitions from one dialect appearing in another).
