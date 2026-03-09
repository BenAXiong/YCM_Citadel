# Klokah Source Data Pollution Issue: Scope & Context

## 1. The Core Problem
While using the YCM Citadel portal (specifically the VS-1 grid view which pivots data by Chinese translation), we discovered severe cross-language data pollution. Sentences belonging to completely different language families are appearing under incorrect dialect headers.

**Confirmed Symptoms:**
- The text `Isa masnanava'a?` (which is Bunun for "Where is the teacher?") appears listed under **Hengchun Amis** (`恆春阿美語`, glid=01).
- The text `ulra i iyan i sinsi?` (which is Puyuma) appears under **Nanshi Amis** (`南勢阿美語`).
- `Icowa ko singsi no miso?` (Amis) appears correctly under **Xiuguluan Amis**, but competes with the polluted entries.

## 2. Root Cause Analysis (Source-Level Bug)
This is **NOT** a bug in our distillation pipelines, deduplication logic (`logic_hash`), or scaping logic. 
The fault lies entirely at the source: **Klokah's backend API endpoints for the Nine-Year and Twelve-Year curriculums.**

When our scraper queries Klokah's endpoint for a specific dialect ID, Klokah returns a JSON payload containing the corrupted text.
- **Example:** Fetching Nine-Year Curriculum for `d=5` (Hengchun Amis) literally returns a JSON array containing `Isa masnanava'a?`.
- The Klokah CMS administrators likely copy-pasted lesson structures and failed to link the correct dialect rows in their database for certain specific lessons.
- Because our scraper blindly trusts the API response (`"d": 5` means Hengchun Amis), these corrupted strings are ingested natively into our `games_master.db`.

## 3. Database Context (`games_master.db`)
The schema relies on two main tables:
- `sentences`: Contains the unique text (`ab` and `zh`), `glid` (group language ID, e.g., '01' for Amis), and `logic_hash` (md5 of glid + ab + zh).
- `occurrences`: Maps sentences to source contexts (`source`, `category`, `level`, `dialect_name`, `original_uuid`).

Because Klokah served Bunun text under an Amis endpoint, our database contains rows where:
- `s.glid` = '01' (Amis)
- `o.dialect_name` = '恆春阿美語' (Hengchun Amis)
- `s.ab` = 'Isa masnanava'a?' (Bunun text)

This breaks the user-facing pivot tables designed to compare Austronesian phonetic drift within the same family, as totally unrelated roots are injected seamlessly into the matrix.

## 4. Current State & Tools
- The database (`games_master.db`) contains **~229,590 occurrences**.
- We recently added a **"RAW_DB_VIEWER"** tool inside the Portal (`app/page.tsx` -> Tools Overlay -> 4th tab). The next agent can use this tool to easily search for strings like `masnanava` to see exactly which modules (`twelve`, `nine_year`, etc.) and `original_uuid` references are responsible for serving the bad data.
- The Git repository has been sterilized of oversized `.jsonl` blobs via Git LFS (`.gitattributes` tracking), so pushing to `main` is now safe.

## 5. Next Steps for the Incoming Agent
**Do not attempt to fix this via regex text-recognition or sweeping automated deletion algorithms**, as you risk dropping perfectly valid loanwords or unique morphological constructs natively meant to be there. 

Instead, look into:
1. **Building a Denylist / Override Configuration:** Inside `lib/mappings.ts`, create a hardcoded override dictionary that catches known corrupted `original_uuid` keys or specific `logic_hash` signatures and either:
   - Remaps their `glid` and `dialect_name` to the correct language.
   - Or drops them entirely from the `pivotData` search API (`app/api/search/route.ts`).
2. **Identifying the Blast Radius:** Use the Raw DB Viewer (or direct SQLite queries) to figure out if this pollution is isolated to a specific `category` or `level` (e.g., did Klokah just mess up "Level 1 Lesson 4" across the board?), and surgically mask that subset.
3. **Cross-Referencing:** Build a script to cross-reference text against the `ILRDF` vocabulary tables. If a text under "Amis" contains 90% word tokens that only exist in the "Bunun" ILRDF dictionary, flag it for manual review.
