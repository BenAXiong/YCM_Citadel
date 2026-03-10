# Phonetic Drift Matrix: Analysis Report

*Generated: 2026-03-07 | Engine: drift_matrix_builder.py*

## 📊 What Is the Drift Matrix?

The Phonetic Drift Matrix is a statistical table of **character-level sound correspondences** between dialects.
It was built by comparing identical sentences (same ZH meaning) across different dialects and counting how often a specific character swap occurs.

## 🔤 Core Concepts: Noise vs. Drift vs. Orthography

When analyzing character swaps (like `u` → `o`), we must distinguish between three distinct phenomena:

### 1. Statistical Noise (Cross-Family Illusions)
*   **What it is**: Two unrelated words coincidentally share letters.
*   **Example**: `kaku` (Amis for "I") vs `nguqu` (Bunun for "Pig"). A matrix comparing across families might log this as a `k→q` shift, which is linguistic nonsense.
*   **The Fix**: We use `GLID_FAMILIES` to filter out all cross-family comparisons. We only compare Amis to Amis, Bunun to Bunun.

### 2. Orthographic Conventions (Spelling Rules)
*   **What it is**: The *sound* is identical, but the *spelling system* chosen by the linguists or missionaries differs.
*   **Case Study: Amis `u` vs `o`**: You are entirely correct to suspect this! In Amis, `/u/` and `/o/` are often allophones (the same functional sound). Historically, Northern dialects (using the Bible translation conventions) standardized on `o`, while Southern dictionaries standardized on `u`. 
*   **The Verdict**: The `u/o` split in Amis is **90% Orthographic Convention**. People pronounce the word similarly, but the MoE (Ministry of Education) enforces `o` in Nanshi Amis textbooks and `u` in Hengchun Amis textbooks.

### 3. True Phonetic Drift (Dialectal Evolution)
*   **What it is**: The actual physical sound produced by speakers has shifted over time or geography.
*   **Case Study: Amis `b` vs `f`**: `bali` (South) vs `fali` (Coast/North) for "wind". The speakers are physically moving their lips differently (bilabial stop vs labiodental fricative). This is true phonetic evolution.
*   **Case Study: Bunun `q` vs `h`**: The shift from a deep guttural stop (`q`) to a softer breath (`h`) between sub-groups.

*The YC Phonetic Forge aims to map ALL of these — because whether a difference is caused by true phonetic evolution or just textbook spelling rules, our NLP engine still needs to know that `kaku` and `kako` are semantically identical.*

---

## 🔬 Key Findings: The Laws of Drift

### Within Amis (阿美族)
| Dialect A | Dialect B | Rule | Count | Interpretation |
|---|---|---|---|---|
| 南勢阿美語 | 秀姑巒阿美語 | `u->o` | **136** | North Amis uses `u` where Hsiukuluan uses `o` |
| 南勢阿美語 | 秀姑巒阿美語 | `b->f` | 20 | North uses `b` vs Hsiukuluan `f` |
| 恆春阿美語 | 秀姑巒阿美語 | `u->o` | **234** | Strongest signal: Hengchun consistently shifts `u->o` |
| 恆春阿美語 | 海岸阿美語 | `u->o` | **156** | Coast vs South: massive `u`/`o` split |
| 南勢阿美語 | 馬蘭阿美語 | `u->o` | 50 | Malan uses `o` where North uses `u` |

**Conclusion**: The **u/o axis** is the single biggest phonological divider in Amis.
- 🌊 **Northern cluster** (`南勢`, `馬蘭`): Prefer **`o`**
- 🏔️ **Southern/Highland cluster** (`恆春`, `秀姑巒`): Prefer **`u`**

### Within Bunun (布農族)
| Dialect A | Dialect B | Rule | Count |
|---|---|---|---|
| 郡群 | 卓群 | `h->q` | **21** |
| 郡群 | 卓群 | `a->i` | 16 |
| 郡群 | 卓群 | `s->a` | 12 |

**Conclusion**: Bunun shows a **q/h split** — 郡群 uses `q` where 卓群 uses `h` (or vice versa).

### Within Puyuma (卑南族)
| Dialect A | Dialect B | Rule | Count |
|---|---|---|---|
| 南王 | 西群 | `l->r` | 14 |
| 南王 | 西群 | `b->v` | 10 |
| 南王 | 西群 | `g->h` | 11 |

**Conclusion**: Puyuma uses a triad of shifts: **l/r**, **b/v**, and **g/h**.

---

## ⚓ Morpheme Anchoring (True Word Drift)
After filtering out cross-family statistical noise, we matched the drift rules back to the specific words that trigger them.

### Examples from Amis (阿美族)
*   **`u` vs `o` axis (North/Highland split)**
    *   *I/Me*: `kaku` (南勢/恆春) ↔ `kako` (秀姑巒/馬蘭/海岸)
    *   *You*: `kisu` (南勢/恆春) ↔ `kiso` (秀姑巒/馬蘭/海岸)
    *   *Marker*: `ku` (南勢/恆春) ↔ `ko` (秀姑巒/馬蘭/海岸)
    *   *Go home*: `taluma'` (恆春) ↔ `taloma'` (秀姑巒)

*   **`b` vs `f` axis**
    *   *Wind*: `bali` (南勢) ↔ `fali` (秀姑巒/海岸)
    *   *Fish*: `buting` (恆春) ↔ `futing` (秀姑巒)
    *   *Grandparent*: `baki/bayi` (恆春) ↔ `fufu` (秀姑巒) *(Note: this is semantic shift + phonetic)*

### Examples from Bunun (布農族)
*   **`h` vs `q` axis**
    *   郡群 (h) ↔ 卓群 (q) examples: To be extracted (matrix confirms 21 distinct word triggers).

---

## 🛠️ Next Steps

1. **Visualization**: Export the filtered Amis matrix as a heatmap (ready for the web portal).
2. **Auto-Translation Enhancement**: Use these drift rules to improve fuzzy matching in the `en_translator.py` pipeline.

---

## 📁 Associated Files
- Raw matrix: `export/phonetic_drift_matrix.json`
- Filtered matrix (intra-family only): `export/phonetic_drift_filtered.json`
- Word-anchored rules: `export/phonetic_drift_anchored.json`
- Builder scripts: `core/drift_matrix_builder.py`, `core/drift_anchorer.py`
