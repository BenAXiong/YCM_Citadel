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
