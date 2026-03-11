# Yincumin Citadel: Master Project Conquest Plan

## 🏛️ Project Philosophy
Shift from **GUI-centric tools** to a **Headless Data Pipeline**.
*   **Raw Tier**: Save exact responses from Klokah (JSON/HTML) for auditability.
*   **Distilled Tier**: Transform raw data into a unified, machine-readable format optimized for study.
*   **Game Tier**: Export specific subsets (e.g., SQLite) for use in web or mobile apps.

---

## 🏗️ Master Directive (Project Phases)

### Phase 1–5: Data Reclamation (DONE)
*   **Phase 1-2**: Grammar (Grmpts) and Essays (ES codes) fully harvested.
*   **Phase 3-4**: MOE Nine/Twelve-Year Curriculum framework integration.
*   **Phase 5**: Vocabulary & ILRDF Dictionary base secured.
*   **Relevant Docs**: [Data Spec](data_spec.md)

### Phase 6: Media Strategy (DONE)
*   **Purge**: Local `.mp3` assets removed to optimize repository.
*   **Streaming**: All consumers now utilize direct CDN URLs (Klokah/ILRDF).

### Phase 7: Multi-Lingual Interface (LIVE)
*   **Matrix v2.2**: side-by-side dialectal comparison.
*   **Heatmaps**: Phonetic drift visualization across the Amis, Bunun, and Puyuma axes.
*   **Relevant Docs**: [Portal Plan](../portal/PORTAL_PLAN.md)

### Phase 8: The Master Distillation (The Forge) ✅
This phase transitioned the project from raw text files to a queryable Relational Archive.
Note: Originally Phase 8, this roadmap defined our transition to data sovereignty. It ensured that we didn't just "scrape" data, but "conquered" it into a standardized relational form. The core logic of GLID mapping and Semantic Soul Merging remains the foundation of all current work.
*   **Mojibake Repair**: Global scan for double-encoded UTF-8 sequences.
*   **The Soul Merge**: Semantic deduplication based on `(GLID, AB, ZH)`.
*   **The Citadel Archive**: Transition to `ycm_master.db`.
*   **Relevant Docs**: [Klokah Atlas](content_intel/klokah_atlas.md)

### Phase 9: ILRDF Integration (IN PROGRESS)
*   **ILRDF Glossary Extension**: Full dictionary extraction for 42 dialects to enable word-level tooltips.
    *   [x] Initial scouting and XLSX analysis.
    *   [x] Hybrid scraper strategy implementation (`ilrdf_harvester.py`).
    *   [x] Local SQLite DB integration (`ilrdf_vocabulary` table).
    *   [x] Normalization of 16 GLIDs and merging into master corpus.
    *   [ ] Portal integration: Word-level search and "Dictionary Hover" tooltips.
*   **Sub-Spec**: [Phase 9 Vocab Integration](P9_plan_vocab_integration.md)

### Phase 10: Portal Architecture Refactor (The Great Componentization) (DONE)
*   [x] Break down monolithic 1,400+ line `page.tsx` into maintainable, highly cohesive components.
*   [x] Extract `localStorage` logic and API calls into custom React hooks (`usePersistedState`, `useRawDbQuery`).
*   [x] Separate UI views (VS-1, VS-2, VS-3, Raw DB) into dedicated module files in `components/views/`.
*   [x] Isolate heavily repeated UI shells (Sidebar, Navbar) into `components/layout/`.
*   [x] Centralize TypeScript definitions into `types/index.ts`.
*   [x] Sub-Spec: [**Portal Refactoring Plan**](P10_portal_refactor_plan.md)

### Phase 11: Data Quality (IN PROGRESS)
*   [x] **Dialect Label Sanitization**: Implemented Tier 1 & 2 noise stripping (`族語短文`) to ensure cross-course name parity.
*   [ ] **Corpus Structure/Geometry Documentation**: Build an exhaustive map of the structural geometry (levels × lessons × units) for each corpus source.
    *   [ ] Enumerate every `(source, dialect, level, category)` tuple present in the DB via SQL audit.
    *   [ ] Document expected geometry for each source (e.g. `twelve`: 12 階 × 10 課, `nine_year`: 9 階 × N 課).
    *   [ ] Identify missing cells (dialect × level combos with zero rows) and flag as scraping gaps.
    *   [ ] Export a machine-readable `corpus_geometry.json` for use in the portal's VS-3 and VS-2 views.
    *   [ ] Link findings to [Structural Alignment Plan](analysis_nlp/P11_metadata_structural_alignment.md).
*   [ ] **Data Purity Campaign**: Scrubbing the cross-language pollution identified in the [**Data Pollution Report**](analysis_nlp/klokah_data_pollution_issue.md).
    *   [ ] Build automated tests for wiring/alignment DB integrity.
    *   [ ] Study spelling discrepancies across corpora for the same dialects (e.g. u/o variations).
*   [ ] **The Rosetta Pass**: Injecting English (EN) into the core corpus. [**Rosetta Plan**](analysis_nlp/plan_rosetta.md)
    *   [ ] Build automated cross-reference script against ILRDF vocab.
    *   [ ] Implement surgical denylist/override in `lib/mappings.ts`.
*   [ ] **Reproducible Data Audit**: Final verification of database content exactitude. [**Audit Plan**](analysis_nlp/P11_reproducible_data_audit.md)
    *   [ ] Establish automated raw-to-db fidelity checks.
    *   [ ] Implement language plausibility/purity scan across 42 dialects.
    *   [ ] **Implement Pipeline Nullity Guard**: Add statistical schema assertions (preventing empty `zh` or `audio_url` ingestion) to `master_distiller` to prevent silent scraper failures.

### Phase 12: Advanced NLP & Phonetic Forge (PLANNING)
*   **Phonetic Forge**: Map phonetic correspondences (e.g., `kako` vs `kaku`) and semantic drift.
    *   [x] Build drift matrix from Nine-Year Syllabus. [Report](analysis_nlp/phonetic_drift_report.md)
    *   [x] Identify primary axes (Amis u/o, Bunun q/h, Puyuma l/r/b/v).
    *   [ ] Implement "Standardized Spelling" auto-transcription toggle (VS-1).

### Phase 13 & Beyond: Cultural Immersion
*   **FILC Archive Retrieval**: Digital Library harvest (Essays, Stories, Podcasts).
*   **Legislation Vault**: Modern policy and administrative term extraction.
