# Yincumin Citadel: Data Inventory & Assessment
*Last Updated: 2026-03-06*

## 📈 Global Metrics & Definitions
*   **Gross Records (GR)**: Total count of occurrences in the database. Currently **~231,000**.
*   **Unique Semantic Souls (U-SOUL)**: Unique semantically unique sentences (ZH + Normalized AB). Currently **~145,000**.
*   **Audio Coverage**: **~96,000** audio URLs verified.
*   **Family Resolution**: 16 Language Families (GLID 01-16).
*   **Dialectal Granularity**: 42 Official Dialects.

### 📐 Master Distillation Status
*   **Global Redundancy Rate**: **37.2%** (Cross-source overlap).
*   **Reclamation Baseline**: `nine_year` and `essay` provide the most granular sub-dialect data.
*   **Ancestry Reclamation**: **Grmpts** (Grammar) is entirely merged into specific dialets. (e.g., Grmpts Amis is now mapped to **海岸阿美語**).

---

## 🌍 Family & Dialect Distribution (Post-Distillation)

| GLID | 民族 (Group) | Total Dialects | Soul Count (Est.) | Sources |
|---|---|---|---|---|
| [01] | **阿美族** | 5 | 28,500 | Grmpts, Essay, Nine, Twelve |
| [02] | **泰雅族** | 6 | 24,000 | Grmpts, Essay, Nine, Twelve |
| [03] | **排灣族** | 4 | 18,200 | Grmpts, Essay, Nine, Twelve |
| [04] | **布農族** | 5 | 16,500 | Grmpts, Essay, Nine, Twelve |
| [05] | **卑南族** | 4 | 12,300 | Grmpts, Essay, Nine, Twelve |
| [06] | **魯凱族** | 6 | 14,800 | Grmpts, Essay, Nine, Twelve |
| [07] | **鄒族** | 1 | 4,200 | Grmpts, Nine, Twelve |
| [08] | **賽夏族** | 2 | 4,800 | Grmpts, Nine, Twelve |
| [09] | **雅美族** | 1 | 3,900 | Grmpts, Nine, Twelve |
| [10] | **邵族** | 1 | 2,100 | Grmpts, Twelve |
| [11] | **噶瑪蘭族** | 1 | 3,100 | Grmpts, Twelve |
| [12] | **太魯閣族** | 1 | 4,200 | Grmpts, Nine, Twelve |
| [13] | **撒奇萊雅族** | 1 | 3,500 | Grmpts, Nine, Twelve |
| [14] | **賽德克族** | 3 | 8,900 | Grmpts, Nine, Twelve |
| [15] | **拉阿魯哇族** | 1 | 2,100 | Grmpts, Twelve |
| [16] | **卡那卡那富族** | 1 | 2,100 | Grmpts, Twelve |

---

## 🗺️ Source Intelligence
| Source | Resolution | Coverage | Status |
| :--- | :--- | :--- | :--- |
| **KLOKAH** | Sub-Dialect | 42 Dialects | **CONQUERED** |
| **ILRDF** | Lexical/Word | 42 Dialects | **SCOUTING** |
| **FILC** | Long-form | Culture/Audio | **PLANNING** |

---

## 🔍 Structural Integrity
*   **GLID System**: All 42 dialects are mapped to 16 numeric families.
*   **Triple-Lock**: Deduplication is enforced by `GLID` + `Normalized AB` + `ZH Translation`.
*   **Source Aliasing**: Sources like `grmpts` are mapped to their most biologically relevant regional variant (e.g., Amis -> Coast Amis).
