# 🕸️ The Kilang Morphological Engine (The Weaver)

## 🎯 Goal
The **Kilang Engine** (named after the Amis word for "Weaver") is designed to visualize and analyze the complex morphological relationships of the Amis language. Its primary objective is to transform a flat list of dictionary entries into a deep, hierarchical graph that reveals how words evolve from core semantic roots through layers of affixation and reduplication.

### Key Objectives:
1.  **Deep Lineage Exploration**: Reveal word origins up to 8+ levels of derivation.
2.  **Cross-Source Integrity**: Synchronize data from multiple dictionaries (蔡中涵, 吳明義, etc.) while maintaining distinct morphological "views."
3.  **Statistical Visibility**: Provide real-time analysis of branching factors, word distribution, and evolutionary span.
4.  **Affix Intelligence**: Automatically detect and categorize prefixes, suffixes, and infixes used in each derivation step.

---

## 🛠️ Methodology

### 1. Hierarchy Construction (The Three Modes)
The engine supports three distinct morphological logic modes, each with its own builder script in `portal/scripts/`:

| Mode | Builder Script | Logic |
| :--- | :--- | :--- |
| **STRICT (MOE)** | `moe_builder_strict.js` | **Gold Standard.** Only trusts explicit "stem" tags in the official MOEDICT. |
| **PLUS** | `moe_builder_plus.js` | **Heuristic.** Fills dictionary gaps using substring matching and prefix/suffix priority logic. |
| **STAR** | `moe_builder_star.js` | **Experimental.** Aggressive matching for deep pattern discovery. |

### 2. The "Gold Standard" Synchronization
A critical discovery during development was the **"Parting Ways"** issue. 
- **The Problem**: Pre-built static JSON manifests (`moe_manifest_*.json`) were generating deep, recursive hierarchies (7-8 levels), but the dynamic database tables used for source filtering were accidentally flattened (max depth 4) due to a script error.
- **The Fix**: The `sync_db_from_json.js` utility was developed to treat the pre-built JSONs as the "Gold Standard," injecting their deep morphological chains back into the SQLite database.
- **Outcome**: The database now supports the same 7-8 level depth as the visualization layer, ensuring perfect synchronicity between the Tree View and the Stats Overlay.

### 3. Data Extraction & Subtree Fetching
To handle deep trees efficiently without overloading the frontend, the API (`/api/moe_shadow`) uses **Recursive Common Table Expressions (CTE)**:
```sql
WITH RECURSIVE subtree(word_ab) AS (
    SELECT word_ab FROM moe_hierarchy_moe WHERE LOWER(word_ab) = LOWER(?)
    UNION ALL
    SELECT h.word_ab FROM moe_hierarchy_moe h JOIN subtree s ON h.parent_word = s.word_ab
)
SELECT e.*, h.parent_word, h.ultimate_root, h.depth as tier...
```
This ensures that selecting an intermediate word (e.g., `pakamaro'`) correctly fetches **every downstream branch**, no matter how deep.

### 4. Dynamic Stats Calculation
When a user filters by a specific dictionary source (e.g., `p` for 蔡中涵), the engine dynamically recalculates the entire stats platform:
- **Total Roots**: The unique semantic heads present in that source.
- **Max Depth (Span)**: The furthest evolutionary layer appearing in that specific dictionary.
- **Branching Factor**: The ratio of words to roots, indicating the dictionary's morphological density.

---

## 📊 Outcomes & Examples

### 1. Deep Morphological Chains
The engine successfully reconstructs extreme chains that were previously invisible in flat dictionary views.
**Example: Root `aro'` (to sit/stay)**
1.  `aro'` (Level 1)
2.  `maro'` (Level 2)
3.  `kamaro'` (Level 3)
4.  `pakamaro'` (Level 4)
5.  `pipakamaro'` (Level 5)
6.  `sapipakamaro'` (Level 6)
7.  `sapipakamaro'aw` (Level 7)

### 2. Source-Specific Insights
By leveraging the `sync_db_from_json.js` logic, we can now compare dictionary "thickness" at a glance:
- **蔡中涵 (p)**: Highly productive, focusing on ancestral roots and direct derivations.
- **吳明義 (m)**: Deeply granular, often capturing specialized complex forms.

### 3. Visual Parity
The **Kilang View** (The Canvas) and the **Stats View** (The Overlay) are now 100% aligned. A root that shows a distribution of "8 levels" in the stats will consistently render all 8 tiers in the interactive tree.

---

## 🚀 Implications for Later Development
- **Expansion to 16 Languages**: The "Weaver" pattern (Root -> Branch -> Flower) is language-agnostic. It can be applied to any agglutinative language in the Citadel (Atayal, Bunun, etc.) by swapping the builder heuristics.
- **Automated Affix Learning**: The statistics gathered on affix frequency (e.g., how often `saka-` is used vs `mi-`) will inform future AI-driven grammar assistants.
- **Data Integrity Auditing**: The discrepancy between "Official Stems" and "Heuristic Links" creates a roadmap for lexicographers to fix missing relationships in the source data.
