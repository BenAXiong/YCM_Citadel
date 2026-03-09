# Klokah Content Map & Harvest Status

This map tracks the status of data "mining" operations across the Klokah domain.

### Legend
*   🟢 **Annexed**: Fully harvested into `sentences.jsonl`.
*   🌊 **Annexing**: Rapid multi-threaded acquisition in progress.
*   💀 **Planning**: Analyzing structure for final distillation.

## 🏗️ Dominion Status
| Realm | Content | Status | Yield |
| :--- | :--- | :--- | :--- |
| **Grmpts** | Sentential Grammar Drills | 🟢 ANNEXED | ~30k sentences |
| **Essay** | Cultural Stories (Readings) | 🟢 ANNEXED | ~100k sentences |
| **Twelve-Year** | Basic Education Curriculum | 🟢 ANNEXED | ~15k sentences |
| **Nine-Year** | Primary Curriculum (XML) | 🟢 ANNEXED | ~40k sentences |
| **Vocabulary** | Dictionary & Word Lists | 🟢 ANNEXED | ~45k words |
| **Dialogue** | Situational Conversations | 🟢 ANNEXED | ~10k sentences |
| **Audio** | Mp3 Voice Assets | 🌊 ANNEXING | 96k files / ~5GB |

## 🗣️ Communication & Media
*   🎯 `/wawa/word.php` (Children's Vocabulary) - *Simplified vocab data.*
*   ⚪ `/readnews/` (News) - *Advanced reading content.*
*   ⚪ `/animation/` & `/video/` - *Media-heavy, metadata mining potential.*
*   ⚪ `/sentenceVideo/` - *Sentences with associated video IDs.*

*   ❌ `/search/` & `/multiSearch/` - *Interactive only.*
*   ❌ `/member/` - *User login logic.*
*   ❌ `/news/` - *Site general announcements.*
*   ⚪ `/classroom/` / `/livetutorial/` - *Educational portal links.*
*   ❌ `/creativeCommons/` / `/privacy/` - *Legal docs.*

---

## 📝 Technical Debt / Reclamation
*   **Audio Harvest**: (Pending) Batch downloading of all discovered `audio_id` keys.
*   **Cross-Check**: Verify overlapping TIDs between `/twelve/` and `/grmpts/`.
