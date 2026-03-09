# Phase 8: The Master Distillation (The Zenith Opus)

The objective is to consolidate all fragmented harvests (Grmpts, Essay, Twelve, Vocab, Nine, Dialogues) into a single, high-fidelity **Master Corpus**.

## 1. The Normalization Engine (`core/master_distiller.py`)
This script will perform the "Great Normalization" to resolve the naming drift:
- **Unified Dialect Keys**: Map all 42 variants to a fixed snake_case standard (e.g., `amis_nanshi`, `atayal_squliq`).
- **Source Reconciliation**: A single sentence record can have multiple source tags: `["essay", "nine_year", "twelve"]`.
- **Content Sanitization**: 
    - Strip mojibake that survived previous rounds.
    - Trim whitespace and resolve punctuation inconsistencies.
    - Identify and flag "Generic Placeholder" sentences (like "這是牛").

## 2. The Klokah World Index (SQLite)
Transition from text-based JSONL to a queryable Relational Database:
- **Tables**:
    - `dialects`: ID, GLID, Group, Name (ZH), Name (EN).
    - `sentences`: UUID, Script (AB), Translation (ZH), LogicDigest (for deduplication).
    - `occurrences`: SentenceID, SourceModule, Level, Lesson/Class, AudioID.
    - `dictionary`: WordAB, WordZH, DialectID, SentencesUsedIn[].

## 3. The "Distilled Evilness" Features
- **Frequency Heatmap**: Which words appear most across all 42 dialects?
- **Isogloss Analysis**: Identifying words that are identical across language groups.
- **Audio Integrity Map**: A report on exactly which sentences have missing or broken audio.

## 4. Execution Roadmap
1. **The Survey**: final scan of `sentences.jsonl` to build a mapping from "Site Dialect Name" -> "Project GLID".
2. **The Forge**: iterate through `sentences.jsonl` and build the SQLite index.
3. **The Audit**: count final unique sentences vs relative redundancy.
