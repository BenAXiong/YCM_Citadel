# 🧪 Morphological Intelligence System (16 Languages)

This document serves as the high-level roadmap for the Citadel's **Morphological Parser**, designed to handle the complex agglutinative and focus-driven structures of the 16 Indigenous languages of Taiwan.

## 🌍 Language-Specific Blueprints

| Language | Morphological Character | Link |
| :--- | :--- | :--- |
| **Amis** | Agglutinative / Focus-Heavy. Uses prefixes (`mi-`, `ma-`, `saka-`) and suffixes (`-ay`, `-an`) to pivot focus across actor, patient, and instrument. | [Draft](morphology/AMIS_MORPHOLOGY.md) |
| **Atayal** | Infixal / Glottal. Characterized by the perfective infix `-in-` and complex word-initial consonant clusters. Focus markers (e.g., `-un`, `-an`) are highly productive. | *Pending* |
| **Bunun** | Vocalic / Prefix-Rich. Uses complex prefix chains for verbs of motion and possession; distinct vowel harmony between root and affixes. | *Pending* |
| **Paiwan** | Social / Hierarchical. Specialized prefixes for kinship and social status; robust actor-focus marking via `-em-`. | *Pending* |
| **Rukai** | Case / Noun-Centric. Unique case-marking prefixes on nouns; lacks some common Austronesian verb inflections like `-um-`. | *Pending* |
| **Puyuma** | Ergative / Person-Focus. Highly complex tracking of person and number on verbs; distinctive case-marking system. | *Pending* |
| **Tsou** | Prefix / Glide-Heavy. Extensive use of verbal prefixes and unique consonant-glide clusters (e.g., `fv`, `sz`). | *Pending* |
| **Saisiyat** | Hybrid / Contact. Morphology shows heavy influence from Atayal and Hakka; uses unique directional infixes and complex negation prefixes. | *Pending* |
| **Yami (Tao)** | Batanic / Philippine-Link. Closer to Ilocano/Tagalog; uses unique gender and status markers (e.g., `si`, `ci`). | *Pending* |
| **Thao** | Reduplicative / Iterative. Extreme reliance on partial and full reduplication for plural, continuous, and intense aspects. | *Pending* |
| **Kavalan** | Suffixal / Coastal. Focus markers often shift to suffixes; phonetic preservation of coastal Proto-Austronesian (e.g., `q` glottal stop). | *Pending* |
| **Truku** | Glottal / Tonal. Similar to Atayal but with distinct stress-based vowel shifts and glottal markers. | *Pending* |
| **Sakizaya** | Amis-Variant. Shares many Amis roots but with distinct phonological rules (e.g., `h` for Amis `'`) and unique aspectual markers. | *Pending* |
| **Seediq** | Infixal / Complex. Uses deep infixation for tense and focus; shares traits with Truku and Atayal but with unique patient-focus rules. | *Pending* |
| **Hla'alua** | Case-Dense. Highly complex set of case markers and directional prefixes; extremely rare and endangered morphological patterns. | *Pending* |
| **Kanakanavu** | Aspect-Centric. Characterized by a rich set of particles and prefixes for detailed aspectual marking (e.g., imminent vs. remote future). | *Pending* |

## 🧬 Transferable Intelligence

A key goal is to identify **Universal Austronesian Markers** (e.g., the `ma-` stative prefix or `-an` locative suffix) which appear across multiple languages with consistent semantic roles.

### Phase 5: Hyper-Token Transferability
We aim to port the `autolink.js` pattern-matching logic to **all 16 languages** in the Citadel. By generating a "Greedy Regex Pool" from the **ILRDF Master Vocabulary**, we can automatically create a **Deep Knowledge Web** where every sentence in every dialect becomes a portal to its underlying roots.

---

## 🚀 Active Research: Token-Level Anchoring

We are currently investigating the **"Hyper-Token"** marking found in the MOE Dictionary (the `` `...~ `` syntax). 

### The Match Engine (`autolink.js`)
The "Smart Match" logic behind the markers is effectively a **Longest-Match-First Regex Engine**:
1.  **Sorting**: Dictionary headwords are sorted by length (descending).
2.  **Greedy Matching**: The engine scans the text and links the longest possible match first. This is how it separates `mato'asay` (Longer match) from `to'as` (Sub-match inside it).
3.  **Non-Linguistic**: It is a purely pattern-based engine, but it mimics linguistic intelligence by prioritizing complete words over sub-roots.
4.  **Formatting**: The final output often looks like `` `surface`root~ `` where the `root` is the target for search/tooltips, while `surface` is what the user sees.

**Goal**: Port this logic to our **VS-1/VS-2** datasets to automatically link sentences to the Master Vocabulary.
