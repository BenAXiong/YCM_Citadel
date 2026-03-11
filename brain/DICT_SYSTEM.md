# YCM Citadel: Dictionary System (DICT)

The Dictionary Mode is a core pillar of the YCM Citadel, designed to bridge the gap between formal linguistic documentation and practical pedagogical use.

## 🎯 Primary Goal
To provide a **Context-Aware Dictionary** where users can not only find standardized definitions but also see how those words are used across the entire indigenous language corpus (Daily News, Curriculum, Literature).

---

## 🏗️ Core Mechanism

### 1. Dual-Index Headwords (Search Logic)
The **Strict/Global toggle** in the search bar governs the "Governance" of the target word itself:
- **Strict Mode (ILRDF)**: Headwords are pulled exclusively from the official `學習詞表` (Foundation Word List). Default state.
- **Global Mode**: Includes words "distilled" from the broader corpus (Conversations, News, etc.). This captures contemporary usage not found in formal lists.

### 2. Contextual Harvesting (The "Global Pulse")
Example sentences follow a different philosophy:
- **Global Examples (Always On)**: Regardless of whether the headword is Strict or Global, example sentences are **always harvested from all available sources**.
- **AB-Only Matching**: For maximum precision, sentences are matched based on the **Aboriginal text (s.ab)** only. This prevents "ghost hits" where a sentence contains the Chinese meaning but lacks the specific target word.

---

## 🔍 Advanced Filtering
- **Genre & Level Filtering**: Multi-select genre tags and 12 pedagogical levels (1-12) refine the example corpus.
- **Sentence Source Selection**: Toggle specific curricula or narrative corpora (Essay, Dialogue, Patterns, etc.) via the Sovereign Source List.

## Discarded / Deprecated Mechanisms

The following ideas were tested and explicitly rejected to maintain architectural integrity:

1. **Smart Dialect Fallback**:
   - *Idea*: If a specific dialect (e.g. Nansi Amis) lacked examples, broaden search to general "Amis language".
   - *Rejection Reason*: The Citadel database is highly granular; dialect data is present for all entries across all sources. Fallbacks introduce "pure" dialect contamination. Data boundaries must remain strict.

2. **Hybrid / Chinese Fallback Matching**:
   - *Idea*: If a word-match fails in Aboriginal text, try matching by the Chinese definition.
   - *Rejection Reason*: Indigenous languages use complex affixation/conjugation. Matching by Chinese often yields false positives where the concept is present but the specific target word is not. Precision is prioritized over recall.

---

## 🛠️ Implementation Details

### Data Structure (`ycm_master.db`)
- `ilrdf_vocabulary`: The master index of distilled words and their original sources.
- `sentences` & `occurrences`: The raw text data used for example harvesting.

### Key Components
- **`VsDictToolbar`**: Manages the Strict/Global toggle, Genre filters (News, Literature, etc.), and Level dropdown.
- **`VsDictView`**: Handles high-density grid rendering (2-6 columns) and "horizontal vs vertical" card layouts.
- **`api/search/route.ts`**: The logic hub that handles search precision, bracket stripping (e.g. converting `在(這裡)` to `在這裡`), and source-based filtering.

---

## ⚙️ Logic Refinements
- **AB-Matching Priority**: Example sentences are prioritized based on the Tribal (AB) word match rather than the Chinese (ZH) match to avoid semantic noise.
- **Smart Dialect Matching**: Example sentences strictly match the headword's dialect. Headwords filtered bysidebar's selected dialects.
- **Sovereign Source Enforcement**: Every search is filtered by a "Blessed List" defined in `lib/sources.ts`. This prevents data anomalies or legacy fragments (like `vocabulary_stc`) from appearing in the results.
- **The "Blessed ALL" Filter**: When a user selects "ALL" in any source filter, the backend calculates the intersection of the search query and the sources defined in the Sovereign Source List. This ensures that even with no specific filter, results only come from high-quality, validated corpora.
- **Unified Labeling**: UI labels for sources (e.g., in Dictionary cards) are mapped through `lib/sources.ts` to ensure consistency between the explorer, dictionary, and syllabus.
- **Persistence**: Layout preferences (columns, vertical/horizontal mode) are saved to browser local storage.

## 🏷️ Structure Formatting (Tooltips)
To ensure immediate contextual clarity when reviewing Dictionary Cards, the original database UUIDs (e.g. `dialogue_1_63126_0`) are mathematically mapped to human-readable curriculum structures based on `corpus_geometry.json`:
- **Essays & Dialogues**: Mapped via TID to **3 Difficulties & 60 Lessons**:
  - **INTRO (初級)**: Lessons 1-20
  - **INTER (中級)**: Lessons 21-40
  - **UPPER (中高)**: Lessons 41-60
  *(Yielding formats like `UPPER L.45` or `INTRO L.12`)*
- **9-Year / 12-Year**: Parsed directly to `L.{level} C.{class}` or `L.{level} L.{lesson}`.
- **Patterns**: Maps directly to grammar units (`t{id}`).

---

## 🚀 Future Work
- **MOE_DICT Integration**: Hooking into the formal Ministry of Education API as a secondary reference source.
- **User Flashcards**: Allowing users to "Save" a dictionary card directly into their `FLASHCARDS` mode.
- **Audio Batching**: Playing multiple examples of a word sequentially for pronunciation practice.
- **Fuzzy Search**: Improving partial-word matching for indigenous roots and stems.
