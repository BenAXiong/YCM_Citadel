# 🕵️ Amis MOE Dict Scout Report (Phase 12+)

This document details the scouting findings for the **Amis (Pangcah) Ministry of Education Dictionary** (MOE Dict) infiltration, as part of the Phase 12 expansion of the YCM Citadel.

---

## 🏛️ Target Overview
The primary target is the digital version of the Amis-Chinese and Amis-Amis dictionaries hosted and maintained by the **g0v** community.

*   **Primary URL**: [amis.moedict.tw](https://amis.moedict.tw/)
*   **Repository**: [g0v/amis-moedict](https://github.com/g0v/amis-moedict)
*   **Version 2 API**: [new-amis.moedict.tw/api/v2/terms/{word}](https://new-amis.moedict.tw/)

---

## 🏗️ Data Architecture
The dictionary is hosted as a static site via GitHub Pages, meaning the entire database is available as raw JSON files.

### 1. The Index Files (Master Lists)
Before scraping entries, we must fetch the word indexes to know what exists:
*   **Safolu (蔡中涵) Dictionary**: [docs/s/index.json](https://raw.githubusercontent.com/g0v/amis-moedict/master/docs/s/index.json)
    *   Contains ~50,000 keyword-summary pairs.
*   **Wu Ming-yi (吳明義) Dictionary**: [docs/m/index.json](https://raw.githubusercontent.com/g0v/amis-moedict/master/docs/m/index.json)
*   **Poinsot (博利亞潘世光) Dictionary**: [docs/p/index.json](https://raw.githubusercontent.com/g0v/amis-moedict/master/docs/p/index.json)

### 2. The Entry Structure
Each word has a dedicated JSON file containing rich metadata (definitions, examples, synonyms).
*   **Pattern**: `https://raw.githubusercontent.com/g0v/amis-moedict/master/docs/{dict_code}/{word}.json`
*   **Primary Dictionary Codes**:
    *   `s`: **Safolu (蔡中涵)** - Blue Header (Primary Chinese definition)
    *   `p`: **Virginia Fey (方敏英)** - Green Header (Primary English definition)
    *   `m`: **Wu Ming-yi (吳明義)** - Orange Header (Dialect-focused Chinese definition)
        *   *Note: In some local clones, `m` may also contain Manoel Fey's French data.*

### 3. The Triple-F Delimiter System
The MOE datasets use unique Unicode control characters to delimit language segments within definition and example strings:
*   **`￹` (U+FFF9)**: Start of Aboriginal (Amis) text block.
*   **`￺` (U+FFFA)**: Start of Definition/English block.
*   **`￻` (U+FFFB)**: Start of Mandarin/Chinese block.

**Parsing Logic**:
- `Aboriginal` ￺ `Mandarin` -> Splits into two display lines.
- `Aboriginal` ￺ `English` ￻ `Mandarin` -> Splits into three display lines.

---

## 🖥️ The Mirror Mechanism (Frontend)

The `amis.moedict.tw` frontend uses a robust client-side search architecture:

1.  **Client-Side Autocomplete**: 
    *   The browser loads `docs/{dict_code}/index.json`.
    *   It uses `jQuery UI Autocomplete` to match against the `Word￺Summary` formatted keys.
    *   This allows for instantaneous search without server-side database lookups.

2.  **Sequential Rendering**:
    *   When a word is clicked, the app attempts to fetch `docs/s/{word}.json`, `docs/p/{word}.json`, and `docs/m/{word}.json`.
    *   It dynamically mounts React components for each successful fetch, resulting in the "Stacked Dictionary" view.

3.  **Color Coding & Heritage**:
    *   **Blue (`s`)**: Dedicated to Safolu's heavy Amis-Chinese work.
    *   **Orange (`m`)**: Often associated with Wu Ming-yi's dialectal research.
    *   **Green (`p`)**: Virginia Fey's work, often including English translations.

---

---

## 🛡️ Infiltration Strategy (Scraper Plan)

1.  **Stage 1: Key Extraction**
    *   Download `docs/s/index.json`.
    *   Parse the JSON array to extract clean word keys (stripping the summary text after the `￺` character).

2.  **Stage 2: Bulk Harvesting**
    *   Initialize `amis_moe_scout.py`.
    *   Iterate through word keys.
    *   Fetch raw JSON from GitHub with a small delay (0.1s) to avoid rate limits.
    *   **Normalization**: URL-encode word keys (especially those with `'` or `^`).

3.  **Stage 3: Soul Merging**
    *   Map MOE definitions to our `(GLID, AB, ZH)` soul model.
    *   Inject examples into the `occurrences` table with `source = 'MOE_DICT'`.

---

## ⚠️ Resolved & New Pitfalls

1.  **Windows Filesystem Characters (RESOLVED)**:
    *   **Problem**: Amis headwords like `to'as` or those with colons/quotes are invalid filenames on Windows.
    *   **Solution**: We bypassed the OS filesystem by using `git show HEAD:{path}` to pull blobs directly from the Git object store.

2.  **The Triple-F Delimiter System**:
    *   The data uses hidden Unicode characters (`U+FFF9`, `U+FFFA`, `U+FFFB`) as layout triggers. 
    *   **Strategy**: Our parser now converts these into a structured `examples_json` block (AB/ZH/EN) to prevent rendering as "Mojibake".

3.  **Dictionary Identity Shift**:
    *   Initial scouts misidentified `m` as Wu Ming-yi. 
    *   **Correction**: In this specific repo, `m` contains **Manoel Fey's** Amis-French data (101 high-density entries). Wu Ming-yi's data may be interleaved in larger blobs.

4.  **License Compliance**:
    *   Data is **CC BY-NC-SA 3.0**. 
    *   **Requirement**: A permanent "Source Attribution" badge must be present in any UI displaying this data.

---

## 🚀 Active Roadmap
*   [x] **Mirror View**: Phase 12 complete. Deciphered site rendering logic.
*   [ ] **The Triangulation Engine**: Automating the merge of `s` and `p` sources into "Master Souls".
*   [ ] **Phonetic Sanitization**: Removing markers (`` ` ``, `~`) for search indexing while preserving them for display.
*   [ ] **UX Lab**: Testing unified entry cards in `MOE_TEST`.
