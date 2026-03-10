# Yincumin Citadel: Content Map & Inventory Status

This document serves as the master source of truth for "What data do we have, where is it, and how does it work?". It combines high-level inventory metrics with deep-dive technical findings from site scouting.

## � Contents
1. [Global Metrics](#-global-metrics)
2. [Dominion Status (Corpus Breakdown)](#-dominion-status-corpus-breakdown)
3. [Family & Dialect Distribution](#-family--dialect-distribution)
4. [Corpus Metadata & Sources](#-corpus-metadata--sources)
5. [Klokah Site Architecture](#-klokah-site-architecture)
6. [Unexplored Content Veins](#-unexplored-content-veins)

---

## �📈 Global Metrics
*   **Gross Records (GR)**: Total count of occurrences in the database. Currently **~231,000**.
*   **Unique Semantic Souls (U-SOUL)**: Unique semantically unique sentences (ZH + Normalized AB). Currently **~145,000**.
*   **Audio Coverage**: **~96,000** audio URLs verified (Remote CDN).
*   **Family Resolution**: 16 Language Families (GLID 01-16).
*   **Dialectal Granularity**: 42 Official Dialects.
*   **Global Redundancy Rate**: **37.2%** (Cross-source overlap).

---

## 🏗️ Dominion Status (Corpus Breakdown)

| Realm | Focus | Data Type | Audio (CDN) | Local Audio | Status | Typical Yield |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| **Grmpts (Grammar)** | Sentential Grammar Drills | Sentences | ✅ | 0% | 🟢 ANNEXED | ~30k sentences |
| **Essay (Cultural)** | Cultural/Traditional Stories | Prose/Dialogue | ✅ | 0% | 🟢 ANNEXED | ~100k sentences |
| **Twelve-Year** | MOE School Curriculum | Pedagogy | ✅ | 0% | 🟢 ANNEXED | ~15k sentences |
| **Nine-Year** | Foundational Literacy | Pedagogy | ✅ | 0% | 🟢 ANNEXED | ~40k sentences |
| **ILRDF (Vocab)** | Dictionary/Lexicography | Words/Entries | ✅ | 0% | 🟢 ANNEXED | ~45k words |
| **Dialogue** | Practical Situational Conversations | Contextual Pairs | ✅ | 0% | 🟢 ANNEXED | ~10k sentences |
| **Read News** | Advanced Reading Content | News Articles | ✅ | 0% | ⚪ SCOUTED | TBD |
| **Wawa (Vocab)** | Children's Vocabulary | Words/Images | ✅ | 0% | ⚪ SCOUTED | TBD |
| **Animation/Video** | Multimedia Metadata | Video/Audio | ✅ | 0% | ⚪ SCOUTED | TBD |
| **Sentence-Video** | AV Sentence Alignment | Video Clips | ✅ | 0% | ⚪ SCOUTED | TBD |
| **MOE Syllabi** | Curriculum Framework | Lesson Tags | N/A | N/A | ⚪ SCOUTED | TBD |

> **Audio Status**: **Remote-Only**. Systems rely on `audio_url` in the database for direct streaming from Klokah/ILRDF CDNs. Local audio has been purged to minimize repository overhead.

---

## 🌍 Family & Dialect Distribution
The following distribution utilizes the GLID mapping logic defined in the [**Klokah Atlas**](klokah_atlas.md).

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

## 🏛️ Corpus Metadata & Sources

### 1. GRMPTS (Grammatical Structure) - Klokah
*   **Focus**: Syntactic patterns (active/passive, focus systems).
*   **Resolution**: Language Family (16 Groups), mapped to regional variants.
*   **Source**: `web.klokah.tw/grmpts/json/{lid}.json`

### 2. ESSAY (Indigenous Language Essays) - Klokah
*   **Focus**: Reading comprehension, traditional ecological knowledge.
*   **Resolution**: Sub-Dialect (42+ Dialects).
*   **Source**: `web.klokah.tw/essay/php/getEssay.php?tid={tid}`

### 3. TWELVE (MOE Twelve-Year Curriculum) - Klokah
*   **Focus**: Standardized school curriculum grades 1-12.
*   **Resolution**: Dialect (42 Dialects).
*   **Source**: `web.klokah.tw/twelve/php/getTextNew.php?d={D}&l={L}&c={C}`

### 4. NINE (Legacy Nine-Year Curriculum) - Klokah
*   **Focus**: Foundational literacy for younger students.
*   **Resolution**: Dialect (42 Dialects).
*   **Source**: `web.klokah.tw/nine/php/getText.php?d={D}&l={L}&c={C}`

### 5. ILRDF Glossary (Vocab Hub)
*   **Focus**: Lexicography and lexical variation.
*   **Content**: Word + CH-Meaning + Level (1-9) + Phonetic Meta + Image Meta.
*   **Source**: [glossary.ilrdf.org.tw](https://glossary.ilrdf.org.tw/resources)

### 6. DIALOGUE (Situational Scenarios) - Klokah
*   **Focus**: Practical, everyday communicative competence.
*   **Resolution**: Dialect (42 Dialects).
*   **Source**: `web.klokah.tw/dialogue/php/getDiaData.php?tid={TID}`

### 7. VOCABULARY_STC (Pattern Practice Sentences) - Klokah ⚠ INCOMPLETE
*   **DB Source Value**: `vocabulary_stc`
*   **Focus**: Vocabulary in sentence context ("Pattern Practice" sentences paired with word lists).
*   **Content**: Short sentences for each vocabulary category (e.g., 01數字計量, 04人物...).
*   **Resolution**: Dialect (limited — only dialects with TID in `STC_MAPPING`).
*   **Current Status**: **475 rows only** — partial scrape via `vocabulary_scraper.py`. Too small to be useful. Excluded from all portal filters until a full re-scrape is completed.
*   **Scraper**: `scrapers/vocabulary_scraper.py` — also harvests word-level dictionary entries into `distilled/dictionary.jsonl` (not yet in master DB).
*   **Source**: `web.klokah.tw/vocabulary/php/getSentence.php?tid={TID}` (sentences) + `web.klokah.tw/vocabulary/php/getWords.php?did={D}&cate={CATE}` (words)
*   **Action Required**: Full dialect × category re-scrape before integrating into the DB.

---

## ⚙️ Klokah Site Architecture

This section records the intrinsic behaviors of the Klokah content delivery system discovered during Phase 1-8 scraping.

### 1. Data Structure Idiosyncrasies
*   **TID (Text ID) Reuse / Deduplication**: The website extensively reuses the same texts (`tid`) across different levels and categories. For example, a basic sentence used in "Level 1 Category 1" might reappear in "Level 2 Category 1". 
    *   **Scraping Rule**: Always maintain a global set of `seen_tids` across the scope of a single language dialect to prevent downloading the same sentence multiple times.
*   **Word-Level Breakdown (The `data-value` field)**: In structures like `read_embed.php`, sentences are wrapped in AB (Aboriginal) and CH (Chinese) divs. The Aboriginal words are further wrapped in `<div class="word" data-value="">`. 
    *   **Finding**: The `data-value` is usually **empty**. The website relies on spacing to separate words, but does not embed dictionary mapping IDs inside the sentence view itself. If you want word-to-word translations in the future, it will require an independent NLP alignment step or scraping a dedicated "Dictionary/Vocabulary" page.

### 2. Audio Architecture
*   **Template**: Audio URLs consistently follow the pattern `https://file.klokah.tw/sound/{audio_id}.mp3`.
*   **File Volumes**: Because audio IDs are numeric (and sometimes alphanumeric/sequential), scraping an entire language can yield thousands of standard mp3s.
*   **Storage Best Practice**: To avoid OS-level file explorer lag (especially on Windows NTFS), do not dump 10,000 `.mp3` files in a single directory. The current plan shards them by the first two characters of the ID (e.g., `audio/43/43600.mp3`).

### 3. Network & Encoding Quirks (The "Mojibake" Problem)
*   **Issue**: The raw text returned from `read_embed.php` and occasionally from JSON payloads often contains garbled characters (mojibake) like `Ã`, `Â`, `â`, `å`.
*   **Cause**: The Klokah server occasionally reads legacy Big5 or Latin1-encoded data from its database but serves it over HTTP with a UTF-8 header, leading to double-encoding.
*   **Solution**: Always apply a rescue decoding step. Logic: `s.encode("latin1", errors="strict").decode("utf-8", errors="strict")`. (This is embedded in `core/network.py`).

### 4. API Inventory (Discovered Endpoints)
1.  **Grammar Master JSON**: `https://web.klokah.tw/grmpts/json/{lid}.json`
2.  **Sentence Embed Data**: `https://web.klokah.tw/text/read_embed.php?tid={tid}&mode=1&num=1`
3.  **Essay Read Page**: `https://web.klokah.tw/essay/read.php?tid={tid}`
4.  **Essay JSON Resource**: `https://web.klokah.tw/essay/php/getEssay.php?tid={tid}`
5.  **Dialogue Index**: `https://web.klokah.tw/dialogue/json/dialogue.json`
6.  **Dialogue Lesson Mapping**: `https://web.klokah.tw/dialogue/json/{CODE}.json` (e.g., `SN11201.json`)
7.  **Dialogue Content**: `https://web.klokah.tw/dialogue/php/getDiaData.php?tid={TID}`
8.  **Twelve-year Curriculum**: `https://web.klokah.tw/twelve/php/getTextNew.php?d={DIALECT_ID}&l={LEVEL}&c={CLASS}`
9.  **Nine-year Curriculum (XML)**: `https://web.klokah.tw/nine/php/getText.php?d={DIALECT_ID}&l={LEVEL}&c={CLASS}`
10. **Vocabulary JSON**: `https://web.klokah.tw/vocabulary/json/{lid}.json`

---

## 🗣️ Unexplored Content Veins
By analyzing the navigation and sitemap, we identified several other reservoir targets:

*   **`vocabulary/` & `wawa/word.php`**: Highly structured vocabulary lists. Goldmine for building flashcards and solving the "missing word-level translation" problem.
*   **`dialogue/` & `dialogue/video/`**: Conversational pairs (A/B dialogues). Excellent for context-based study and listening comprehension.
*   **`readnews/`**: Likely contains contemporary context and more advanced vocabulary (B2/C1 equivalent). Useful for bridging the gap between beginner grammar and conversational fluency.
*   **`videoLearning/` / `sentenceVideo/`**: Sentences paired with video contexts for multimedia study.
*   **Nine/Twelve Syllabi (`/twelve/learn.php`)**: Crucial for pedagogical mapping. Allows tagging sentences as "Year 1", "Year 7", etc., based on official MOE framework.
