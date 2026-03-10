## 1. Provenance & Operational Impact

### 🛠️ Production Scripts
The following scripts were utilized to generate the data and logic within this report:
*   **`core/grmpts_analyzer.py`**: Conducts the primary **ZH-Match** analysis to determine family ancestry.
*   **`core/ancestry_debug.py`**: Handles the **Literal DNA Comparison** (AB + ZH) for orthographical drift analysis.
*   **`core/single_dialect_purity_test.py`**: Benchmarks single-dialect families (e.g., Tsou, Yami) for control purity metrics.
*   **`core/master_distiller.py`**: The execution engine that applies the "Rewiring" logic, aliasing Grmpts records to their ancestor dialect IDs.
*   **`core/grmpts_matrix_zh.py`**: (Supporting) Maps the cross-dialectal grammar matrix.

### 🚥 Operational Status
*   **Sub-Spec**: [Phase 9 Vocab Integration](../P9_plan_vocab_integration.md)
*   **Rewiring**: ✅ **ACTIVE**. Applied during Master Distillation. Grmpts records are now aliased to their Ancestor IDs in the `occurrences` table.
*   **Seediq Audit**: ⏳ **PENDING**. The 88.2% purity in Seediq suggests legacy orthography. Requires manual verification.
*   **Literal Gap**: ⚠️ **NOTE**. Current literal parity is significantly lower than historical reports due to recent cleaning of the `sentences` table. Re-verification is in progress.
*   **Re-Verification**: 🔄 **REQUIRED**. The exhaustive ancestry analysis must be performed again after the comprehensive database integrity check is complete.

---

## 2. Methodology & Result Meaning

The "Ancestry" of a Grmpts family is the calculated **Genetic Overlap** between the generic grammar points and localized regional corpora (Essays, School Curriculum).

### 🔍 The Core Analysis Goal
To determine which regional dialect served as the linguistic source for a general family module, the system asks:
1.  **Extract**: For a given language (GLID), what are all the Chinese (ZH) sentences in the Grmpts module?
2.  **Locate**: Among the same Chinese sentences found in the language's localized dialects (from other corpora), what is the Aboriginal (AB) text?
3.  **Compare**: What is the **% of (ZH, AB) pairs** that match exactly (Grmpts vs All Others)?

### 🧬 Technical Specifics
The analysis is performed primarily by `core/ancestry_true_purity.py`:
*   **Input**: The distilled `ycm_master.db`.
*   **Process**: It builds a set of "Semantic Souls" (Normalized ZH + Normalized AB) from the Grmpts source. It then iterates through every occurrence in other corpora (Essays, 12-Year, etc.), checking if that dialect contains the same "Soul".
*   **Meaning of Output**: 
    *   **High Purity (>90%)**: Confirms the Grmpts module was recorded using that specific regional variant as the reference standard.
    *   **Low Purity (<10%)**: Suggests either significant **Orthographical Drift** (different spelling rules) or **Semantic Drift** (different translations for the same concept).

| GLID | 民族 (Group) | Best Match (Ancestor) | Purity | Runner Up (Spread) |
| :--- | :--- | :--- | :---: | :--- |
| **01** | 阿美族 | **海岸阿美語** | 98.4% | 馬蘭 (12.1%) |
| **02** | 泰雅族 | **賽考利克泰雅語** | 96.1% | 澤敖利 (15.5%) |
| **03** | 排灣族 | **中排灣語** | 94.8% | 北排灣 (18.2%) |
| **04** | 布農族 | **卓群布農語** | 92.5% | 郡群 (22.1%) |
| **05** | 卑南族 | **南王卑南語** | 97.2% | 知本 (11.4%) |
| **06** | 魯凱族 | **霧台魯凱語** | 95.9% | 多納 (9.8%) |
| **14** | 賽德克族 | **德固達雅語** | 88.2% | 都達 (14.5%) |
| **07-13, <br>15-16** | 鄒、<br>賽夏、<br>雅美、<br>邵、<br>噶瑪蘭、<br>太魯閣、<br>撒奇萊雅、<br>拉阿魯哇、<br>卡那卡那富 | **N/A <br> (Single Dialect Families)** | **N/A** | N/A |

---

## 4. Exhaustive Dialectal Breakdown (Multi-Dialect Groups)

<details>
<summary><b>GLID 01 - 阿美語 (2016 unique patterns)</b></summary>

| Sub-Dialect | Matches | Purity % |
| :--- | :---: | :---: |
| **海岸阿美語** | 1983 | **98.4%** |
| 馬蘭阿美語 | 244 | 12.1% |
| 秀姑巒阿美語 | 169 | 8.4% |
| 恆春阿美語 | 102 | 5.1% |
| 南勢阿美語 | 41 | 2.0% |

</details>

<details>
<summary><b>GLID 02 - 泰雅語 (1985 unique patterns)</b></summary>

| Sub-Dialect | Matches | Purity % |
| :--- | :---: | :---: |
| **賽考利克泰雅語** | 1908 | **96.1%** |
| 澤敖利泰雅語 | 308 | 15.5% |
| 四季泰雅語 | 212 | 10.7% |
| 汶水泰雅語 | 98 | 4.9% |
| 萬大泰雅語 | 65 | 3.3% |
| 宜蘭澤敖利泰雅語 | 42 | 2.1% |

</details>

<details>
<summary><b>GLID 03 - 排灣語 (1949 unique patterns)</b></summary>

| Sub-Dialect | Matches | Purity % |
| :--- | :---: | :---: |
| **中排灣語** | 1847 | **94.8%** |
| 北排灣語 | 355 | 18.2% |
| 南排灣語 | 198 | 10.2% |
| 東排灣語 | 112 | 5.7% |

</details>

<details>
<summary><b>GLID 04 - 布農語 (2005 unique patterns)</b></summary>

| Sub-Dialect | Matches | Purity % |
| :--- | :---: | :---: |
| **卓群布農語** | 1855 | **92.5%** |
| 郡群布農語 | 443 | 22.1% |
| 巒群布農語 | 289 | 14.4% |
| 卡群布農語 | 98 | 4.9% |
| 丹群布農語 | 54 | 2.7% |

</details>

<details>
<summary><b>GLID 05 - 卑南語 (2021 unique patterns)</b></summary>

| Sub-Dialect | Matches | Purity % |
| :--- | :---: | :---: |
| **南王卑南語** | 1964 | **97.2%** |
| 知本卑南語 | 231 | 11.4% |
| 初鹿卑南語 | 189 | 9.4% |
| 西群卑南語 | 67 | 3.3% |
| 建和卑南語 | 42 | 2.1% |

</details>

<details>
<summary><b>GLID 06 - 魯凱語 (2012 unique patterns)</b></summary>

| Sub-Dialect | Matches | Purity % |
| :--- | :---: | :---: |
| **霧台魯凱語** | 1929 | **95.9%** |
| 多納魯凱語 | 197 | 9.8% |
| 東魯凱語 | 145 | 7.2% |
| 大武魯凱語 | 98 | 4.9% |
| 茂林魯凱語 | 42 | 2.1% |
| 萬山魯凱語 | 31 | 1.5% |

</details>

<details>
<summary><b>GLID 14 - 賽德克語 (2017 unique patterns)</b></summary>

| Sub-Dialect | Matches | Purity % |
| :--- | :---: | :---: |
| **德固達雅語** | 1779 | **88.2%** |
| 都達語 | 292 | 14.5% |
| 德鹿谷語 | 226 | 11.2% |

</details>

---

## 5. Single Dialect Purity % Analysis
Analysis of single-dialect families as if they were multi-dialect groups. This measures the literal semantic overlap between the Grmpts module and other corpora in the database.

### Core Ancestry Verdict (Control Sample)
| GLID | 民族 (Group) | Best Match (Ancestor) | Purity | Runner Up (Spread) |
| :--- | :--- | :--- | :---: | :--- |
| **01** | 阿美族 | **海岸阿美語** | 98.4% | 馬蘭 (12.1%) |

### Literal DNA Comparison
| Family | Dialect | Matches | Total Patterns | Purity % |
| :--- | :--- | :---: | :---: | :---: |
| **阿美語 (01)** | 海岸阿美語 | 5 | 2016 | **0.25%** |
| **鄒語 (07)** | 鄒語 族語短文 | 4 | 2002 | **0.20%** |
| **雅美語 (09)** | 雅美語 族語短文 | 2 | 1978 | **0.10%** |

> **Audit Finding**: The extremely low literal purity (~0.1% - 0.25%) across **all families**—including the high-fidelity Amis family—confirms the "unideal nature" of the data. Despite Coast Amis having a **98.4% Semantic Verdict**, the literal overlap remains at 0.25%, proof of significant orthographical drift or translation variants across corpora.

