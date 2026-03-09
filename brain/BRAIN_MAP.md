# 🧠 BRAIN MAP: Yincumin Citadel Knowledge Index

*Auto-updated. Last reviewed: 2026-03-07*

> Legend: 🟢 Fresh | 🟡 Aging | 🔴 Stale | ♻️ Redundant → superseded by | 📌 Live/Active

---

## 📐 Project Architecture

| File | Status | Last Updated | Description | Notes |
|---|---|---|---|---|
| `yc_project_plan.md` | 🟡 | 2026-03-06 | Master project roadmap, phases 1–8+ | Phase 8 done; needs Phase 9 (ILRDF) added |
| `constellation_smiting_plan.md` | 🟢 📌 | 2026-03-07 | Conquest targets A–D with logs | **Primary future-work doc** |
| `yc_data_spec.md` | 🟡 | 2026-03-05 | Schema spec for sentences/occurrences DB tables | May need `en_text` column added |
| `yc_technical_findings.md` | 🟡 | 2026-03-06 | Scraper discoveries, edge cases, API findings | Needs ILRDF API endpoint logged |
| `klokah_data_spec.md` | ♻️ | 2026-03-05 | Old copy of data spec | **Duplicate of `yc_data_spec.md` — delete when sure** |

---

## 📊 Data Intelligence

| File | Status | Last Updated | Description | Notes |
|---|---|---|---|---|
| `yc_data_inventory.md` | 🟢 📌 | 2026-03-07 | 16-family distribution, soul counts, source table | Updated with Chinese family names |
| `yc_language_atlas.md` | 🟡 | 2026-03-06 | GLID → Dialect name → Code mapping (42 dialects) | Rosetta Stone of the project |
| `grmpts_ancestry_report.md` | 🟢 📌 | 2026-03-07 | Grmpts → sub-dialect purity mapping (all 16 families) | Key link for DB rewiring |
| `phonetic_drift_report.md` | 🟢 📌 | 2026-03-07 | Phonetic drift laws (u/o axis, q/h split, l/r triad) | From 1,367-rule matrix |

---

## 🌐 Source Intelligence

| File | Status | Last Updated | Description | Notes |
|---|---|---|---|---|
| `yc_content_map.md` | 🟡 | 2026-03-06 | Klokah source breakdown, file patterns | May need ILRDF section added |
| `ilrdf_content_map.md` | 🟢 📌 | 2026-03-07 | ILRDF scouting report, API endpoint, data schema | **API confirmed**: `/api/front_end/glossary_search` |
| `ilrdf_smiting_plan.md` | 🟡 | 2026-03-07 | ILRDF scrape phases A–D | Partially superseded by `constellation_smiting_plan.md` |

---

## 🧬 Analysis & NLP

| File | Status | Last Updated | Description | Notes |
|---|---|---|---|---|
| `en_translation_strategy.md` | 🟢 | 2026-03-07 | EN Rosetta strategy: Ollama vs Gemini, priority phases | Batch 1 drafted |
| `en_rosetta_draft.md` | 🟢 📌 | 2026-03-07 | EN translation batch plan, prompting strategy | Schema update: `sentences.en_text` |
| `phonetic_drift_report.md` | 🟢 📌 | 2026-03-07 | Drift matrix findings + next steps | See also: `export/phonetic_drift_matrix.json` |

---

## 🏛️ History & Logs

| File | Status | Last Updated | Description | Notes |
|---|---|---|---|---|
| `yc_annihilation_map.md` | 🟡 | 2026-03-06 | Early strategic planning, pre-distillation map | Historical value; mostly superseded |
| `map_of_annihilation.md` | ♻️ | 2026-03-06 | Older copy of annihilation map | **Duplicate of `yc_annihilation_map.md`** |
| `yc_distillation_logs.md` | 🟢 | 2026-03-06 | Phase 8 Master Distillation execution logs | Completed process |
| `phase_8_master_distillation.md` | ♻️ | 2026-03-06 | Older copy of distillation logs | **Duplicate of `yc_distillation_logs.md`** |

---

## 🗑️ Cleanup Queue

| File | Action | Reason |
|---|---|---|
| `klokah_data_spec.md` | 🗑️ Delete when stable | Exact duplicate of `yc_data_spec.md` |
| `map_of_annihilation.md` | 🗑️ Delete | Duplicate of `yc_annihilation_map.md` |
| `phase_8_master_distillation.md` | 🗑️ Delete | Duplicate of `yc_distillation_logs.md` |
| `ilrdf_smiting_plan.md` | ♻️ Merge into `constellation_smiting_plan.md` | Partially redundant |

---

## 🔗 Key Cross-References

- **ILRDF API**: `GET https://glossary-api.ilrdf.org.tw/api/front_end/glossary_search?word=&dialect_id={ID}&fuzzy=0&page={N}` → 3,624 words/dialect
- **Drift Matrix**: `export/phonetic_drift_matrix.json` (1,367 rules)
- **Citadel DB**: `export/games_master.db` (~145k unique souls, 231k occurrences)
- **Portal Plan**: `portal/PORTAL_PLAN.md`
