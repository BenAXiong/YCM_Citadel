# 📓 Project Meta-Log: Decision Ledger & Agent Evolution

This log tracks high-level architectural decisions, "Aha!" moments during debugging, and strategic shifts that affect the project's long-term health. Unlike `plan_conquest.md` (which is a roadmap), this file is an **event-stream of intent**.

---

## 📅 2026-03-11: Deep Audio Repair & Density Evolution

### 🔊 The "Audio Final Fail" Crisis
- **Problem**: Dialogue and Essay audio was structurally broken on modern Klokah servers because the database only stored the sentence ID, but the server required a 3-segment path including the `Context ID` (e.g., `text/sound/34045/529922.mp3`).
- **Discovery**: The missing `Context ID` was "hidden in plain sight" inside the `original_uuid` field (e.g., `essay_ES11201_34045_0`).
- **Solution**: Implemented `repairAudioUrl` in the Backend API. It harvests the UUID, extracts the ID, and reconstructs the full path dynamically.
- **Decision**: Fixed at the API/Portal layer instead of re-scraping/re-distilling to ensure immediate system-wide recovery.
- **Status**: ✅ Repaired for VS-1, VS-2, and DICT.

### 🔳 UI Density Revolution
- **Decision**: Replaced the primitive `compactMode` (boolean) with a tri-state `dictDensity` system: `standard`, `compact`, and `preview`.
- **Preview Mode Logic**: Implemented a "Full Tuck" approach where example sentences are hidden by default and expanded via a header-anchored sticky chevron. 
- **Flexible Grid**: Decided to allow the grid to "breathe" by linking column count directly to the number of active dialects (clamped at 1-6).
- **Aesthetic Seal**: In Preview mode, a tucked card removes its bottom border and rounds its header corners to look like a single, solid unit.

---

## 📅 2026-03-12: MOE Alignment & The Tooltip Visibility Bug

### 🔍 MOE Mirror High-Fidelity Reconstruction
- **Problem**: The MOE dictionary results were fragmented (individual rows for each definition) and lacked the "premium" recursive feel of the official site.
- **Decision**: Implemented a **Source Grouping** layer in `MoeMirrorView.tsx`. Multiple definitions for the same word from the same dictionary (e.g., Safolu `s`) are now consolidated into a single card with numbered lists.
- **Recursive Navigation**: Added a "Side-Peek" drawer for tooltips, allowing users to explore nested roots (e.g., clicking on a synonym or root inside a definition) without losing their current search position.

### 🐛 The "Ghost Tooltip" Visibility Discovery
- **Problem**: In the React/Tailwind implementation, using `animate-in fade-in` on components with `opacity-0` caused all tooltips for every word on the page to trigger their appearance animation simultaneously on mount, leading to a screen full of overlapping tooltips.
- **Logic**: Tailwind's `opacity-0` is often overridden by the starting state of `animate-fade-in`. 
- **Solution**: Shifted to a two-layered visibility guard: `invisible group-hover:visible` + `opacity-0 group-hover:opacity-100`. The `invisible` utility ensures the element is strictly omitted from the render/interaction tree until the hover state is active.
- **Verification**: Verified using `to'as` which contains 15+ linked markers; no tooltips appear until hovered.

### 🔡 Normalization over Raw Matching
- **Discovery**: The `amis-moedict` dataset uses inconsistent casing for headwords (e.g. `Mato'asay` in index vs `mato'asay` in DB).
- **Decision**: Forced all summary fetches and cache lookups to `.toLowerCase()`. This ensures that even if a sentence link is capitalized for grammar, the dictionary lookup remains robust.

---

## 📅 [TEMPLATE] 
### [Topic Title]
- **Context**: Why are we doing this?
- **Logic**: What is the non-obvious part of the solution?
- **Verification**: How did we prove it works? (e.g., tested 'nanum' with 3 dialects selected).
- **Future Debt**: Does this need to be backported to the Distiller or DB later?
