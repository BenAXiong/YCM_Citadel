# EN Rosetta: Translation Batch Plan 

This document outlines the first deployment of the English (EN) translation engine for the Yincumin Citadel.

### 🏛️ The Rosetta Engine
*   **Target Engine**: Antigravity (Gemini 1.5 Pro) for Syllabus Core; Ollama (Local) for Data Lake.
*   **Engine Mode**: Triangulated Context (AB + ZH -> EN).
*   **Priority 1**: **Nine-Year Curriculum** (All 16 families).
*   **Priority 2**: **Grammar Modules (Grmpts)**.

### 🧬 Phase 1: Syllabus Core (The 15k Souls)
We will batch the 15,000 unique sentences found in the Nine-Year Reclamation. 

1.  **The Connector** (`core/en_translator.py`).
2.  **The Prompt**: 
    ```
    Given the [Aboriginal script] in dialect [D] and its [Chinese translation] [ZH], 
    provide the high-fidelity [English translation] [EN]. 
    Cross-reference the ZH meaning to ensure semantic alignment.
    ```
3.  **The Result**: Update the `sentences` table in `export/games_master.db` with a new `en_text` column.

### ⚔️ Rosetta Logs
[PLAN_01: Identified 15,000 unique "souls" from the Nine-Year Syllabus as the Batch 1 target.]
[PLAN_02: Drafted context-injected prompting strategy for trilingual triangulation.]
