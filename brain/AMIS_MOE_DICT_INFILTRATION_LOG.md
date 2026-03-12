# 📝 Infiltration Progress & Discovery Log: Amis MOE Dict

## 📅 2026-03-12: Full-Scale Infiltration Complete

### 🏆 Milestone: 63,813 Entries Harvested
We have successfully completed the full-scale infiltration of the `g0v/amis-moedict` repository.
*   **Safolu (s)**: 57,627 entries (Amis-Chinese).
*   **Poinsot (p)**: 6,085 entries (Amis-English-Chinese triangulation).
*   **Manoel Fey (m)**: 101 entries (Amis-French). *Note: Previously misidentified as Wu Ming-yi.*
*   **Strategy**: Persistent Git-object retrieval using `git show`. This bypasses Windows filesystem character limitations and allows for 100% coverage of the 50,000 spectral files.

### 🪟 Shadow Visualization
As requested, a dedicated exploration tool has been added to the Portal's research toolkit to visualize the MOE data without fumbling with the primary UI.
*   **Tool**: `MOE_SHADOW_ARCHIVE` tab in the Tools Overlay.
*   **Features**: Real-time keyword search across AB and ZH/EN definitions for all 63k entries.
*   **Integrity**: This tool directly queries the `amis_moe_test.db`, ensuring the Sovereign Master DB remains isolated.

---

## 🔱 The Golden Triangle (Next Steps)

We are now ready to begin the **Triple-Verification** process to extract the most authoritative "souls" into our new **Golden Triangle** core.

*   [x] Full-scale harvest of all dictionaries (s, m, p).
*   [x] **Phase 12: Mirroring** -> Replicated `amis.moedict.tw` UI in the Portal. Deciphered the Triple-F delimiter system (`U+FFF9`, `U+FFFA`, `U+FFFB`).
*   [ ] Semantic deduplication against our existing 230k sentences using the `logic_hash` pipeline.
*   [ ] Enrichment of Master ILRDF with MOE English definitions via Poinsot triangulation.
*   [ ] Integration into the Portal search endpoint (Pending UI Approval).

---

## 🛠️ Historical Progress

### 🔄 Technical Workaround: The "Ghost" Checkout
*   **Snag**: Filenames with characters like `:` (invalid on Windows).
*   **Solution**: Switched to `git show HEAD:{path}`.

### 🧪 Initial Harvest: 40 Entries
*   **Harvester**: `tmp/amis_moe_harvester.py`.
*   **Validation**: Correct parsing of `￹`, `￺`, `￻` delimiters.
