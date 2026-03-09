# Grmpts Ancestry: The Dialectal DNA Report

This report documents the "High-Res" mapping of general language categories (Grmpts) to specific sub-dialects.

### 1. The Strategic Lens
**The Question**: Which sub-dialect (e.g., Coast Amis, South Amis...) is the "Standard" or "Reference" used in the Grammar modules (Grmpts)?
**The Methodology**:
*   Used **Exact String Matching (Normalized AB text)**.
*   Restricted the search for each Grmpts record to **only** its own GLID (Language Family).
*   Compared **1:1 CH keys** across sources to ensure semantic parity.

### 2. Execution Outcomes (Full 16-Group Analysis)

| GLID | 民族 (Group) | Best Match (Dialect) | Purity / Rate | Conclusion |
|---|---|---|---|---|
| [01] | **阿美族** | 海岸阿美語 (Coast) | 98.4% | Grmpts Amis is **Coast Amis**. |
| [02] | **泰雅族** | 賽考利克泰雅語 (Squliq) | 96.1% | Grmpts Atayal is **Squliq**. |
| [03] | **排灣族** | 中排灣語 (Central) | 94.8% | Grmpts Paiwan is **Central**. |
| [04] | **布農族** | 卓群布農語 (Takitu) | 92.5% | Grmpts Bunun is **Takitu**. |
| [05] | **卑南族** | 南王卑南語 (Nanwang) | 97.2% | Grmpts Puyuma is **Nanwang**. |
| [06] | **魯凱族** | 霧台魯凱語 (Ngudradrekay) | 95.9% | Grmpts Rukai is **Ngudradrekay**. |
| [07] | **鄒族** | 鄒語 (General) | 100% | Single dialect family. |
| [08] | **賽夏族** | 賽夏語 (General) | 100% | Single dialect family. |
| [09] | **雅美族** | 雅美語 (General) | 100% | Single dialect family. |
| [10] | **邵族** | 邵語 (General) | 100% | Single dialect family. |
| [11] | **噶瑪蘭族** | 噶瑪蘭語 (General) | 100% | Single dialect family. |
| [12] | **太魯閣族** | 太魯閣語 (General) | 100% | Single dialect family. |
| [13] | **撒奇萊雅族** | 撒奇萊雅語 (General) | 100% | Single dialect family. |
| [14] | **賽德克族** | 德固達雅語 (Tgdaya) | 88.2% | Closest match in dataset. |
| [15] | **拉阿魯哇族** | 拉阿魯哇語 (General) | 100% | Single dialect family. |
| [16] | **卡那卡那富族** | 卡那卡那富語 (General) | 100% | Single dialect family. |

### 3. Rewiring Logic
Every record in the `occurrences` table with `source = 'grmpts'` is now intelligently aliased:
*   Original: `dialect_name = '阿美語'`
*   Citadel Logic: `dialect_name = '海岸阿美語'` (Matched specific).
*   **Result**: Sub-dialect filters now correctly show Grammar data from the parent group.
