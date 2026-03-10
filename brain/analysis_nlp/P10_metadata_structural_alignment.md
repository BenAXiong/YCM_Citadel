# P10: Structural Alignment via Course Metadata

## 🎯 The Problem: Semantic Fragmentation
Currently, the YCM Citadel uses **Chinese (ZH) literals** as the primary anchor for merging dialectal data. While effective, it fails when:
1.  **Lexical Variation**: One dialect uses "母親" (Mother) while another uses "媽媽" (Mom).
2.  **Granularity**: Minor punctuation or auxiliary particle differences in ZH prevent a "Soul Merge".

This leads to "holes" in the matrix where data exists but isn't aligned because the ZH keys don't match exactly.

## 💡 The Proposition: Metadata-Pivot Alignment
Most of our high-quality corpora (`nine_year`, `twelve`, `grmpts`) come from structured curricula. We can use the **Course Geometry** (Level, Lesson, Category/Sentence Index) as a "Hidden Rosetta Stone" to align dialects.

### 1. Structural Fingerprints
Even if the Chinese translation varies, if two sentences share the same metadata, they are almost certainly translations of the same underlying content:
- **Source**: `nine_year`
- **Dialect A**: Amis (Level 1, Lesson 2, Sentence 3) -> "這是我媽媽。"
- **Dialect B**: Atayal (Level 1, Lesson 2, Sentence 3) -> "這是我母親。"
- **Verdict**: **STRUCTURAL MATCH**. These should be collapsed into the same semantic row.

### 2. Implementation Strategy
1.  **Metadata Extraction**: Ensure all scrapers and the distiller capture `level`, `lesson`, and `original_uuid` (or a standardized `structural_id`).
2.  **Structural Soul ID**: Generate a logic hash based on `(Source, Level, Lesson, Index)` instead of `(GLID, AB, ZH)`.
3.  **The "Ghost" Pivot**: Introduce a second pivot layer in the VS-1 view that groups by `Structural ID` first, then picks the first valid ZH string as the display header.

## 🛠️ Proposed Workflow
1.  **Audit**: Scan the DB for sentences where `original_uuid` follows a predictable pattern (e.g., `nine_1_2_3`).
2.  **Clustering**: Group occurrences by these patterns.
3.  **Verification**: Manual/Automated check: Do the ZH strings for the same Structural ID actually have high semantic similarity?
4.  **Refactoring**: Update the `distiller` to include a `structural_id` field in the `sentences` table.

## 🚀 Impact
This will effectively "glue" the matrix back together for the MOE curricula, drastically increasing the density of "fully populated" rows and exposing legitimate linguistic drift that is currently hidden by inconsistent Chinese labeling.
