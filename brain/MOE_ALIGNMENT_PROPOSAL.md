# 🛠️ Alignment A.I: MOE Infiltration Strategy

Per your directive, we are proceeding with **Alignment A.I (Shadow Table)** for the Amis MOE Dictionary integration. This approach prioritizes safety and isolation while providing full search capability.

---

## 🏗️ 1. Final Decision: Variant A.I (The Shadow Table)

MOE data will be semantically and physically isolated in a "Shadow Table" to avoid any accidental corruption of the "Sovereign" `ilrdf_vocabulary`.

*   **Dialect Label**: `阿美語 (MOE)`
*   **GLID**: `01` (Amis)
*   **Implementation**: A dedicated `moe_entries` table in `data/amis_moe_test.db` (for now).
*   **Discovery Logic**: In "DICT" mode, search results will perform a `UNION ALL` between the Master Vocabulary and the MOE Shadow Table.
*   **Portal UI**: **No changes** will be made to any frontend components (filters, grid, etc.) until explicitly authorized.

---

## 🔬 2. Duplicate Souls: Phonetic Overlap & Logic Hashes

Many "Souls" (words/sentences) in the MOE corpus overlap with our existing Sovereign data (ILRDF/Nine-Year Syllabus), but they use a different phonetic orthography involving backticks (`` ` ``) and tildes (`~`).

### Example: Sentence Comparison
| Source | Text |
| :--- | :--- |
| **Sovereign (Master)** | `O kasasiromaroma a mao'ripay ko saka'orip no tamtamdaw.` |
| **MOE (Safolu)** | `` `O~ `kasasiromaroma~ `a~ mao'rip`ay~ `ko~ `saka'orip~ `no~ `tamtamdaw~. `` |

### Handling duplicates:
To prevent the UI from showing the same entry twice with different punctuation, we implement a **Logic Hash**:
1.  **Normalization**: Strip markers (`` ` ``, `~`) and unify whitespace.
2.  **Comparison**: If the `logic_hash` matches an existing Sovereign entry, the MOE metadata is added as a secondary "Source Reference" rather than a new record.
3.  **Preservation**: The original MOE phonetic notation is preserved in the database for research purposes.

---

## 🌎 3. Triangulation: English-Chinese Enrichment

The **Poinsot (p)** dictionary allows for "Trilingual Triangulation" that enrich our core datasets.

### The Triangulation Matrix:
1.  **Poinsot (p)**: Provides English (`en`) and fallback Chinese (`zh`).
2.  **Safolu (s)**: Provides rich Chinese definitions (`zh`) and sentence examples.
3.  **ILRDF (Master)**: Often only has Aboriginal and Chinese.

### Enrichment Flow:
*   **Mapping**: Join `Poinsot` and `Safolu` on the headword.
*   **Enrichment**: Use Poinsot's `en` field to populate our dictionary view for words that are currently Chinese-only.
*   **Validation**: If a word exists in both MoE dictionaries AND ILRDF, it becomes a **"Gold Standard"** entry (verified by three separate authorities).

### Sample Triangulation (Entry: `ca'ang`)
*   **ILRDF**: `枝｜樹枝｜枝條`
*   **MOE Poinsot**: `branch`
*   **Resultant Soul**: `{ab: "ca'ang", zh: "樹枝", en: "branch", source: "ILRDF+MOE"}`

---

## 🚀 Status: Scaling the Harvest
I have verified the delimiter parsing (`￹`, `￺`, `￻`) and the "Ghost" Git-object retrieval. 

**Next Step**: Initiate the full-scale harvest of ~50,000 entries into the Shadow Table.

---

## 🏗️ 4. Triangulation Pipeline & UX Laboratory

We are establishing a dual-track testing environment for the "Master Soul" consolidation.

### A. The Triangulation Engine (Backend)
*   **Target**: Automated merging of `s` (Safolu) and `p` (Poinsot) records.
*   **Logic**:
    1.  **Identity Matching**: Exact headword match + `logic_hash` on definitions.
    2.  **English Injection**: If Poinsot provides an English translation for a Safolu entry, it is promoted to the **Global Metadata** for that soul.
    3.  **Gold Badge**: Entries with 3+ matching authorities (ILRDF, Safolu, Poinsot) receive the `GOLD_CORE` status bit.

### B. The UX Laboratory (`MOE_TEST`)
*   **Prototyping**: We are using the `MOE_TEST` tab to refine the **Unified Source Card**.
*   **Tests Underway**:
    *   **Phonetic Toggle**: A UI switch to hide/show the `` ` `` and `~` markers.
    *   **Source Hierarchy**: Visually distinguishing between the "Primary Soul" (Master) and "Archive References" (MOE).
    *   **Density Controls**: Testing how condensed we can make a verified entry before losing readability.
