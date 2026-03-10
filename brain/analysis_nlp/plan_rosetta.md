# EN Translation: The Rosetta Strategy & Batch Plan

This document defines the engine, methodology, and execution plan for injecting English (EN) into the Citadel.

---

## 🏛️ The Rosetta Engine
*   **Target Engine**: 
    *   **Antigravity (Gemini 1.5 Pro)**: High linguistic intelligence. Used for the **Syllabus Core** (Nine-Year) and cultural nuances.
    *   **Ollama (Local Llama 3.1 8B)**: Zero cost. Used for the bulk **Data Lake** processing (Phase 13+).
*   **Engine Mode**: **Triangulated Context** (`AB text` + `ZH Meaning` + `Dialect/Source` -> `EN`).
*   **Validation**: Semantic Triangulation. Cross-checks if AB->EN matches ZH->EN to flag hallucinations.

---

## 🧬 Phase-by-Phase Execution

### Phase 1: Syllabus Core (Alpha)
*   **Target**: **Nine-Year Curriculum** (~15,000 unique souls).
*   **Priority**: High (Primary educational foundation).
*   **Logic**: High-fidelity Antigravity pass.

### Phase 2: Structural Grammar (Beta)
*   **Target**: **Grammar Modules (Grmpts)** (~20,000 souls).
*   **Priority**: Medium-High (Syntactic patterns).
*   **Logic**: Hybrid pass (Antigravity for complex patterns, Ollama for repetition).

### Phase 3: Vocabulary Hub (Gamma)
*   **Target**: **ILRDF Vocabulary** entries.
*   *Status*: Planning.

### Phase 4: The Data Lake (Delta)
*   **Target**: Remaining ~100k records (Essays, News, Dialogue).
*   **Logic**: Primarily Ollama.

---

## 🛠️ Technical Integration
*   **Column**: `sentences.en_text`.
*   **Module**: `core/en_translator.py`.
*   **Strategy**: Batch processing via JSONL streams to avoid DB locking during long-running LLM tasks.

---

## ⚔️ Execution Logs
*   [PLAN_01: Identified 15,000 unique "souls" from the Nine-Year Syllabus as the Batch 1 target.]
*   [PLAN_02: Drafted context-injected prompting strategy for trilingual triangulation.]
