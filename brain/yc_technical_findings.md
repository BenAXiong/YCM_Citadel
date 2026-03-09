# Klokah Site Architecture & Technical Findings
*Date:* March 2026

This document records the intrinsic behaviors of the Klokah content delivery system. Maintaining these insights prevents "reinventing the wheel" when designing new scrapers or debugging missing data.

## 1. Data Structure Idiosyncrasies
*   **TID (Text ID) Reuse / Deduplication:** The website extensively reuses the same texts (`tid`) across different levels and categories. For example, a basic sentence used in "Level 1 Category 1" might reappear in "Level 2 Category 1". 
    *   *Scraping Rule:* Always maintain a global set of `seen_tids` across the scope of a single language dialect to prevent downloading the same sentence multiple times.
*   **Word-Level Breakdown (The `data-value` field):** In structures like `read_embed.php`, sentences are wrapped in AB (Aboriginal) and CH (Chinese) divs. The Aboriginal words are further wrapped in `<div class="word" data-value="">`. 
    *   *Finding:* The `data-value` is usually **empty**. The website relies on spacing to separate words, but does not embed dictionary mapping IDs inside the sentence view itself. If you want word-to-word translations in the future, it will require an independent NLP alignment step or scraping a dedicated "Dictionary/Vocabulary" page.

## 2. Audio Architecture
*   **Template:** Audio URLs consistently follow the pattern `https://file.klokah.tw/sound/{audio_id}.mp3`.
*   **File Volumes:** Because audio IDs are numeric (and sometimes alphanumeric/sequential), scraping an entire language could yield thousands of standard mp3s.
*   **Storage Best Practice:** To avoid OS-level file explorer lag (especially on Windows), do not dump 10,000 `.mp3` files in a single directory. The current plan splits them by the first two characters of the ID (e.g., `audio/43/43600.mp3`).

## 3. Network & Encoding Quirks (The "Mojibake" Problem)
*   The raw text returned from `read_embed.php` and occasionally from JSON payloads often contains garbled characters (mojibake) like `Ã`, `Â`, `â`, `å`.
*   *Cause:* The Klokah server occasionally reads legacy Big5 or Latin1-encoded data from its database but serves it over HTTP with a UTF-8 header, leading to double-encoding.
*   *Solution:* Always apply a rescue decoding step. Example logic: `s.encode("latin1", errors="strict").decode("utf-8", errors="strict")`. (This has been successfully embedded in our `core/network.py` file).

## 4. Unexplored Content Veins
By analyzing the navigation and sitemap of the website, we have identified several other highly valuable data reservoirs beyond `grmpts` (Grammar) and `essay` (Short Stories):

*   **`vocabulary/` & `wawa/word.php`**: Highly structured vocabulary lists. This is a goldmine for building flashcards and would solve the "missing word-level translation" problem noted in the Essays.
*   **`dialogue/` & `dialogue/video/`**: Conversational pairs (A/B dialogues). This is excellent for context-based study and listening comprehension mini-games.
*   **`readnews/`**: Likely contains contemporary context and more advanced vocabulary (B2/C1 equivalent). Useful for bridging the gap between beginner grammar and conversational fluency.
*   **`videoLearning/` / `sentenceVideo/`**: Sentences paired with video contexts.
*   **Nine/Twelve Basic Education Syllabi (`/nine/` & `/twelve/`)**: These are crucial for pedagogical mapping. They outline the official MOE (Ministry of Education) framework, meaning we can scrape the curriculum index from `/twelve/learn.php` and use it to permanently tag our sentences as "Year 1", "Year 7", etc.

## 5. Summary of API Endpoints Discovered
1.  **Grammar Master JSON:** `https://web.klokah.tw/grmpts/json/{lid}.json`
2.  **Sentence Embed Data:** `https://web.klokah.tw/text/read_embed.php?tid={tid}&mode=1&num=1`
3.  **Essay Read Page:** `https://web.klokah.tw/essay/read.php?tid={tid}`
4.  **Essay JSON Resource:** `https://web.klokah.tw/essay/php/getEssay.php?tid={tid}`
5.  **Dialogue Index:** `https://web.klokah.tw/dialogue/json/dialogue.json`
6.  **Dialogue Lesson Mapping:** `https://web.klokah.tw/dialogue/json/{CODE}.json` (e.g., `SN11201.json`)
7.  **Dialogue Content:** `https://web.klokah.tw/dialogue/php/getDiaData.php?tid={TID}`
8.  **Twelve-year Curriculum:** `https://web.klokah.tw/twelve/php/getTextNew.php?d={DIALECT_ID}&l={LEVEL}&c={CLASS}`
9.  **Nine-year Curriculum (XML):** `https://web.klokah.tw/nine/php/getText.php?d={DIALECT_ID}&l={LEVEL}&c={CLASS}`
10. **Vocabulary JSON:** `https://web.klokah.tw/vocabulary/json/{lid}.json`
