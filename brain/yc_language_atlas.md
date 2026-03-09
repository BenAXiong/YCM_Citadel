# Klokah Language Atlas: GLID System

This document is the "Rosetta Stone" for the Klokah Data Lake. It maps the official Ministry of Education (MOE) numbering to our internal **Global Language IDs (GLID)** and tracks the naming inconsistencies (drift) found in the site's various modules.

## 🗝️ How to Read the IDs
*   **GLID (01-16)**: The Primary Language Group (e.g., Amis, Atayal).
*   **Official ID (1-43)**: The specific sub-dialect used in the Nine/Twelve-Year Curriculum.

---

## 🗺️ The Master Mapping Table

| GLID | Group (ZH) | Sub-Dialects (Sample) | Official IDs (Nine/Twelve) | Variants Detected in Metadata |
| :--- | :--- | :--- | :--- | :--- |
| **01** | 阿美語 | 南勢, 海岸, 馬蘭, 秀姑巒, 恆春 | 1, 2, 3, 4, 32 | 阿美語, 海岸阿美語, Amis, 南勢阿美語 族語短文, é˜¿ç¾Ž... |
| **02** | 泰雅語 | 賽考利克, 澤敖利, 汶水, 萬大, 四季 | 5, 6, 7, 8, 9, 31 | 泰雅語, Squliq, Atayal, 汶水泰雅語 族語短文... |
| **03** | 排灣語 | 北, 中, 南, 東 | 12, 13, 14, 15 | 排灣語, Paiwan, 北排灣語 族語短文... |
| **04** | 布農語 | 卓, 卡, 丹, 巒, 郡 | 16, 17, 18, 19, 20 | 布農語, Bunun, 卓群布農語 族語短文... |
| **05** | 卑南語 | 南王, 知本, 西群, 建和, 初鹿 | 21, 22, 23, 30, 41 | 卑南語, Puyuma, 南王卑南語 族語短文... |
| **06** | 魯凱語 | 東, 霧台, 大武, 多納, 茂林, 萬山 | 24, 25, 26, 27, 28, 33 | 魯凱語, Rukai, 霧台魯凱語, 霧臺魯凱語... |
| **07** | 鄒語 | 鄒語 | 10 | 鄒語, Tsou, 鄒語 族語短文 |
| **08** | 賽夏語 | 賽夏語 | 11 | 賽夏語, Saisiyat, 賽夏語 族語短文 |
| **09** | 雅美語 | 雅美語 (蘭嶼) | 42 | 雅美語, Yami, Tao, 蘭嶼雅美語 |
| **10** | 邵語 | 邵語 | 29 | 邵語, Thao, 邵語 族語短文 |
| **11** | 噶瑪蘭語 | 噶瑪蘭語 | 34 | 噶瑪蘭語, Kavalan, 噶瑪蘭語 族語短文 |
| **12** | 太魯閣語 | 太魯閣語 | 35 | 太魯閣語, Truku, 太魯閣語 族語短文 |
| **13** | 撒奇萊雅語 | 撒奇萊雅語 | 43 | 撒奇萊雅語, Sakizaya, 撒奇萊雅語 族語短文 |
| **14** | 賽德克語 | 德固達雅, 都達, 德鹿谷 | 36, 37, 38 | 賽德克語, Seediq, 德路固語, 都達語... |
| **15** | 拉阿魯哇語 | 拉阿魯哇語 | 39 | 拉阿魯哇語, Hla'alua, 拉阿魯哇語 族語短文 |
| **16** | 卡那卡那富語 | 卡那卡那富語 | 40 | 卡那卡那富語, Kanakanavu |

---

## 🔍 Normalization Rules
To achieve the **Soul Merge**, the Distiller applies these rules in order:
1.  **Tag Discovery**: Extract `dialect` from record metadata.
2.  **Lookup**: Match against the variants in `glid_map.json`.
3.  **Defaulting**: If no match is found (e.g., bare IDs), it defaults to the Official ID mapping found in the Nine/Twelve curriculum logic.
4.  **Cleaning**: Strip redundant module suffixes like ` 族語短文` or ` 句法演練` during search but preserve them in the `source` column of the `occurrences` table.
