# 🤖 AGENT.md: Operational Instructions & Project Context

This file serves as the primary entry point for any AI agent interacting with the Yincumin Citadel repository.

## 🧠 The Master Index
Before any broad research or sweeping modifications, you **MUST** read the [**BRAIN_MAP.md**](file:///c:/Users/Ben\Documents/LL/6_ycm/YCM_Citadel/brain/BRAIN_MAP.md).

## 🏛️ Project Context & Architecture
The Yincumin Citadel is a high-fidelity research portal for 42 Indigenous Taiwanese dialects. 

*   **Philosopy**: Headless Data Pipeline. We never "store" UI state locally; we derive it from the **Sovereign Source** (`export/ycm_master.db`).
*   **Audio**: We do **not** store media assets locally. All audio is streamed via remote CDN URLs stored in the `occurrences` table.
*   **The "Soul" Concept**: A unique semantic thought is defined by the triplet `(GLID, AB_Text, ZH_Text)`. One soul can have many pedagogical "occurrences".

## 🛠️ Global Constraints & Best Practices
1.  **Database Path**: The primary SQLite DB is located at `export/ycm_master.db`. 
2.  **Git LFS**: The `.db` file is an LFS asset. Do not attempt direct file-handle reading in CI/CD (Vercel); use the `curl` build-bypass in `portal/package.json`.
3.  **Data Integrity vs. Normalization**:
    *   **Normalization (Mapping Table)**: Mapping variant names (like "Amis" to "Nanshi Amis") via GLID is the standard.
    *   **Data Doctoring (Surgical Fixes)**: Fixing actual mistakes in the source text (like spelling errors) should be handled at the `master_distiller` layer or via a dedicated `mappings.ts` override, **never** by blindly editing the raw JSON files.
4.  **Schema Consistency**: All new imports must adhere to the schema in `data_spec.md`.

## ⚠️ What Not to Overlook
*   **Mojibake**: The Klokah source is plagued with encoding errors. Always use the rescue decoding logic in `core/processors.py`.
*   **Source Data Pollution**: Beware of "Hengchun Amis" lessons actually serving "Bunun" text, or other cross-language injections from the source CMS. See `klokah_data_pollution_issue.md` for current coverage.
*   **Phonetic Variants**: The "Standardized Spelling" feature in the Portal is a **display-layer transformation**, not an underlying database rewrite.

## 🏗️ Portal Architecture & Component Hygiene
1.  **Avoid God Components**: No component should exceed 500 lines. If a file is growing large, extract logic into:
    *   **Custom Hooks**: For state management and side effects (e.g., `usePersistedState`, `useClickOutside`).
    *   **Sub-components**: For distinct UI sections (e.g., `Header`, `TopToolbar`, `VsXView`).
2.  **Shared Types**: Use the central `portal/types/index.ts` for domain-specific interfaces to avoid circular dependencies and re-definitions.
3.  **Client-Side Logic**: Keep heavy data processing (like normalization or massive table filtering) isolated in `useMemo` or dedicated utilities in `lib/`.
4.  **Theming**: Maintain themes in `portal/app/globals.css` using CSS variables to ensure consistency across the portal.

## ✍️ Documentation Stewardship
To maintain a high-resolution "Bwain", you must adhere to these hierarchy rules:
1. **The Master Index**: Always update [**BRAIN_MAP.md**](file:///c:/Users/Ben/Documents/LL/6_ycm/YCM_Citadel/brain/BRAIN_MAP.md) when adding/removing docs.
2. **Sub-Spec Linking**: If a specialized plan (e.g., `P9_plan_vocab_integration.md`) is created, it **MUST** be linked under its associated Phase in [**plan_conquest.md**](file:///c:/Users/Ben/Documents/LL/6_ycm/YCM_Citadel/brain/plan_conquest.md).
3. **Consistency**: Ensure terminology (GLID, Soul, Dominion) remains consistent across all documents.
4. **Continuous Logging**: Agents **MUST** maintain a trace of structural changes in the relevant plan logs (e.g., `PORTAL_PLAN.md`, `AGENT.md`) to ensure session-to-session continuity.

## 🔬 Reproducible Research & Audits
When performing data audits (Phase 10), adhere to these standards:
1. **Script-First**: Never perform manual tallying. Create a diagnostic script (e.g., `core/audit_db.py`).
2. **Artifact Persistence**: Report finding summaries directly into the assigned Audit document (e.g., `P10_reproducible_data_audit.md`).
3. **Fidelity over Cleaning**: Identify and document corruption before proposing fixes. "Seeing is better than assuming."

## 🛁 The Sanity Rituals (Anti-Stale Policy)
To prevent "ghost bugs" where data doesn't match the code, follow these rituals:
1.  **Rule Change -> Redistill**: If you modify `core/processors.py` (e.g., cleaning rules), you **MUST** immediately run `python core/master_distiller.py`.
2.  **Redistill -> Portal Sync**: The portal uses a local copy of the DB. After any distillation, run: `cp export/ycm_master.db portal/ycm_master.db`.
3.  **Audit First**: If the portal shows "Nothing Found" for a known key, run a direct `sqlite3` query on the `export/` DB to see if the data actually exist or if it's a naming mismatch.

## 🔄 Required Task Workflow
Every time you create or rename a document in `brain/`, you **MUST** follow this ritual:
1.  **Sync Brain Map**: Add/Update entry in `BRAIN_MAP.md`.
2.  **Sync Conquest Plan**: Link the sub-spec under its relative Phase in `plan_conquest.md`.
3.  **Cross-Validation**: Check if the new info contradicts `data_spec.md`.
