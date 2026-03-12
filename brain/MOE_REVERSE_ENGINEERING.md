# Amis MOE Dictionary: Exhaustive Findings & Inverse Engineering

This document details the exhaustive research performed on the `amis-moedict` repository and the official website `new-amis.moedict.tw`. These findings serve as the foundation for the high-fidelity MOE Mirror.

## 1. Repository Archeology (`amis-moedict`)

The repository is structured as a decentralized JSON database, optimized for static site generation.

### A. Dictionary Source Hierarchy
- **`docs/s/` (學習詞表 - Safolu)**: Modern dataset. Each word is a standalone JSON. Contains `stem` pointers and detailed `heteronyms`. Order in official WS: **Red (#e53e3e)**.
- **`docs/p/` (蔡中涵大辭典 - Poinsot)**: Historically significant, root-based. Major terms like `mato'asay` are often sub-entries of their root `to'as`. Order in official WS: **Blue (#3366cc)**.
- **`docs/m/` (吳明義阿美族語辭典)**: Monolingual (Amis-to-Amis). Order in official WS: **Yellow (#c07b0c)**.
- **`docs/a/` (原住民族語言線上辭典)**: External/Supplementary. Order in official WS: **Purple (#8e44ad)**.
- **`docs/old-s/`**: Legacy version of Safolu, often containing slightly different definitions or examples.

### B. Data Parsing Rules
- **Control Characters**: The dictionary uses specific Unicode delimiters for multilingual text:
  - `￹`: Start of the **Target Word** (Amis).
  - `￺`: Start of the **Primary Translation** (English in `p`, Chinese in others).
  - `￻`: Start of the **Secondary Translation** (Chinese in `p`).
- **Linking System**:
  - Internal links use the format `` `Headword~ ``.
  - Display overrides use `` `Display`Root~ ``.
- **Stem Mapping**: The `docs/*/index.json` files vary. Safolu's index often includes a short summary (`word￺summary`), while Poinsot's is just headwords.

## 2. Morphological Aggregation Logic

To replicate the official site's "full coverage" for words like `mato'asay`, the mirror must perform **Aggregated Stem Search**:
1.  **Direct Match**: `word_ab = keyword`.
2.  **Parent Match**: Find the `stem` of the keyword (e.g., `to'as`) and fetch it.
3.  **Sibling Match**: Find other words sharing the same `stem`.

This allows the mirror to fill the "Source P" card for `mato'asay` by pulling from the `to'as` entry, exactly as the official site does.

## 3. Implementation of High-Fidelity UI

### A. Source Ordering
To match the official site, the dictionary sources MUST be sorted in this specific order:
1.  **蔡中涵 (`p`)** - Blue
2.  **吳明義 (`m`)** - Yellow
3.  **學習詞表 (`s`)** - Red
4.  **原住民族語言 (`a`)** - Purple

### B. Tooltip Engineering
- **Visibility**: Tooltips are rendered at `z-index: 1000` to prevent clipping by neighboring cards.
- **Breathing Room**: The main view needs a significant `pb-64` (padding-bottom) so that the last card in the list can display its full tooltip without being cut by the container boundary.
- **Normalized Keying**: `summaryCache` uses lowercase normalized headwords to ensure links like `Mato'asay` and `mato'asay` share the same data.

## 4. Current State & Remaining Fixes
- [x] Correct Blue/Red source label swap.
- [x] Implement Stem-based aggregation in SQL.
- [x] Fix Search Bar text color (Black).
- [ ] Ensure Tooltips are never clipped (Container overflow update).
- [ ] Fix Synonym Link formatting in Harvester.
