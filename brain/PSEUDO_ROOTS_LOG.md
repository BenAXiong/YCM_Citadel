# Issue Log: Pseudo-Roots in Morphological Index

## 1. Problem Description
The current morphological index (`stem-words.json`) contains "Pseudo-Roots". These are words that are technically derivatives (evolutions) of deeper roots but are indexed as primary stems. 

**Result**: Instead of a single deep tree (Root -> Derivative -> Sub-derivative), we get fragmented pairs, making the language look shallower than it is.

## 2. Examples
- **`masamaamaan`**: Listed as a stem for `ano masamaamaan`. 
  - *Reality*: `masamaamaan` is itself a derivative of `maan`.
- **`sapimaan`**: Often listed as a stem for many sub-entries.
  - *Reality*: `sapimaan` is a complex word derived from `maan`.
- **`alomaylay`**: Acts as a root in some contexts.
  - *Reality*: Derived from `alomay`.

## 3. Root Cause
The original MoEDICT scraper/indexator breaks the recursive chain when it encounters "stable" complex forms that are used as heads in phrases. It treats these stable derivatives as their own dictionary start-points rather than traversing back to the ultimate core root.

## 4. Remediation Plan

### Phase 1: Recursive Index Reconstruction (Scripting)
- Create a script that traverses the existing `stem-words.json` keys.
- If a Key (Stem) is found inside the values (Derivatives) of another key, link them.
- Continue until every word can trace its path to a word that is NOT a derivative of anything else.

### Phase 2: Metadata Flagging
- Tag roots as either `ULTIMATE_ROOT` (no parent) or `INTERMEDIATE_STEM` (has a parent).
- In the Kilang UI, show a "Trace to Source" button for `INTERMEDIATE_STEMS`.

### Phase 3: UI Recursive Flattening
- Update `KilangView` to optionally fetch the parent recursively until the `ULTIMATE_ROOT` is reached.
- This will unify fragmented pairs into a single "True Complex Tree".

---
*Log Created: 2026-03-13*
*Status: Observed & Documented*
