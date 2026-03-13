# 🧪 MOE Morphological Manifest Strategy

## 🎯 Goal
To provide a stable, linguistics-first morphological index for the Kilang View that eliminates "pseudo-roots" and ensures consistent behavior between global statistics and local tree visualizations.

## 🏛️ Strategy: The Unified Manifest
Instead of calculating morphological relationships on-the-fly in the browser (which leads to heuristic drift and performance issues), we generate a **Static Truth Manifest** during the build process.

1.  **Truth over Guesswork**: Prioritize explicit dictionary stems (`stem` column) over substring heuristics.
2.  **Centralized Intelligence**: Move all parent-finding logic into a single server-side script (`moe_hierarchy_builder.js`).
3.  **Static Payload**: Ship a `moe_morph_manifest.json` file that explicitly maps every word to its **Absolute Parent** and **Ultimate Root**.

## 🛠️ Method: Multi-Priority Resolution
The manifest is built using a tiered priority system:

| Priority | Level | Logic |
| :--- | :--- | :--- |
| **1** | **Dictionary Data** | Use the `stem` provided by the MoEDICT database entries. |
| **2** | **Global Substring** | Find the longest existing headword that is a substring of the current word (min 3 chars). |
| **3** | **Trace-Back** | Recursively follow parents until a word has no parent. This word is tagged as the `Ultimate Root`. |

## 📈 Outcomes
- **Zero Discrepancy**: The Header Stats (Top Roots, Depth) now exactly match the words displayed in the Canvas View.
- **Pseudo-Root Elimination**: Grammatical prefixes like `AKA`, `NGA`, and `SAPI` are no longer classified as roots because their "children" are correctly claimed by deeper lexical roots via substring/DB-stem checks.
- **Performance**: The UI no longer needs to run recursive loops; it simply queries by `ultimate_root`.

## 📂 Deliverables
- `moe_hierarchy_builder.js`: The production manifest generator.
- `moe_heuristic_explorer.js`: Experimental script for identifying non-canonical roots.
- `moe_morph_manifest.json`: The mapping file used by the frontend.
- `moe_morph_stats.json`: The summary data for index headers.

## 🏛️ Deep Restoration Strategy (The Pivot)

Observed discrepancies (e.g., LOMA showing 88 branches in stats but a small visual tree) led to the following remediation plan:

### 1. Absolute Sync via Database Injection
To eliminate the gap between "Stats" and "Viz," the `moe_hierarchy_builder` now injects its manifest directly into a new SQLite table `moe_hierarchy`. The API and the Sidebar now query the **exact same table**, ensuring 1:1 parity between list counts and tree nodes.

### 2. Semantic Salience (Tie-Breaking)
When a word has multiple potential parents (e.g., `SAPI` vs `MAAN`), we will implement a "Salience" check. Roots with more official database children carry higher "Weight," preventing lexical families from being fragmented by coincidental substring collisions with grammatical prefixes.

### 3. Gap-Bridging & Virtual Tiers
To combat "Depth Death" caused by missing intermediate words in the dictionary:
- **Virtual Tiers**: The UI will honor the manifest depth even if a parent link is missing, rendering the node at its "True" distance from the root with a dashed connection.
- **MoE / MoE+ Toggle**: A future enhancement to allow switching between a **Strict DB-only** view and a **Heuristic Discovery** view.

---
*Last Updated: 2026-03-13*



notes to format

🕵️ "pacoos" Diagnostic Summary
My investigation of the local amis-moedict mirror and the database revealed a critical gap in our data:

What we found: The word coos (greedy) is present in the database from Source S (Tsai).
What is missing: pacoos (the causative "to make greedy") is not in the DB and is also absent from the local files.
The Root Cause: Your previous notes suggested Wu Ming-yi (Source M) contains the most comprehensive dialectal and causative forms. However, our local 

docs/m/index.json
 only contains 90 words (it should be roughly ~30,000).
Verdict: We are missing 99.7% of Source M. The word pacoos likely exists in that missing slice.
🚀 Recommendation
The "pacoos" issue isn't a bug in the code, but a data deficit. To resolve it, we need to re-run the scraper specifically for source "m" against the live MoEDICT API.

I have applied the UI changes to 

KilangView.tsx
. Shall we stop here to save credits, or would you like me to look at the scraper for Source M?