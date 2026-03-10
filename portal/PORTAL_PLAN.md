# YC Portal: Implementation Plan

## 🎯 Mission
Build a **web-based research portal** for the Yincumin Citadel database — shareable, interactive, multi-platform.

## 🏛️ Architecture Decision


### The Stack: Next.js (via `/portal`)
| Layer | Tech | Reason |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) | Modern, SSR+SSG, great for data-heavy dashboards |
| **Styling** | Tailwind CSS | Rapid, design-token based |
| **Charts** | Recharts / D3.js | Heatmaps, bar charts for drift matrix |
| **Data API** | SQLite via `better-sqlite3` (local) or FastAPI (served) | Direct query from the Citadel DB |
| **Search** | Full-text SQLite + future: ChromaDB vector index | Keyword now, semantic later |
| **Hosting** | Vercel (frontend) + Railway/Fly.io (API if needed) | Free tiers, zero-ops |

## 📁 Structure
```
Content_Klokah/
├── portal/                   ← The web portal lives here
│   ├── app/                  ← Next.js App Router
│   │   ├── page.tsx          ← Home / Search
│   │   ├── explorer/         ← VS-1 style dialect explorer
│   │   ├── drift/            ← Phonetic drift heatmap
│   │   └── syllabus/         ← VS-2 style lesson view
│   ├── lib/
│   │   └── db.ts             ← SQLite query helpers
│   ├── public/
│   └── package.json
└── export/
    └── ycm_master.db         ← Shared DB (both portal and GUI)
```

## 🗺️ Feature Roadmap

### Phase 1 (MVP — Replicate GUI) - DONE
- [x] Global AB/ZH search with dialect columns
- [x] Filter sidebar (family groups, toggleable)
- [x] Source realm filter (KLOKAH / ILRDF)
- [x] Full pivot toggle (Show Full Only)
- [x] Collapsible sidebar & resizable layout

### Phase 2 (Next-Gen) - DONE
- [x] Phonetic Drift Heatmap (WIP - Integrated into Tools)
- [x] Audio playback handled with try-catch
- [x] Tooltip/Pill on items: shows source, level, unit
- [x] Recent search history persistence
- [x] UI Language toggle (EN/ZH)
- [x] Theme persistence (Matrix, YCM, etc.)

### Phase 3 (Dictionary & Comparative Mode) - IN PROGRESS
- [ ] **Dictionary View Tab**: Integrated ILRDF/Klokah word explorer.
- [ ] **VS-3 Mode**: "Comparative Dialogue" for long-form content (Essays/Dialogues).

### Phase 4 (Semantic & Standardisation)
- [ ] **Standardized Phonetic Normalization**: Implement the "Use Standardized Spelling" toggle.
- [ ] Vector search via ChromaDB
- [ ] EN column when Rosetta data available
- [ ] ILRDF vocabulary tab integrated with Klokah search API

### Phase 5 (Reliability & Deployment)
- [x] **Deployment**: Finalize Vercel/Fly.io strategy.
- [ ] **DB Tests**: Extensive automated checks for wiring integrity.
- [ ] **Lazy Loading / Virtual Scroll**: For queries returning >1000 items.

### Phase 6 (Data Quality)
- [ ] **Inference Audit**: Resolve Family-level generic labels using a strict attribution mapping.
- [ ] **Traceability Tags**: Mark inferred/doctored data with `*` or `[i]` tags.

## 📋 Logs
- [2026-03-10] **Phase 10 Alignment**: Implemented Structural Metadata Alignment plan. Renamed UI source tags for readability (e.g., `nine_year` -> `NINE`).
- [2026-03-10] **Source Controller**: Replaced dropdown with "Fancy Toggle Bar" supporting multi-source selection.
- [2026-03-09] UI Polish: Resizable sidebar, results count, improved multi-source display.
- [2026-03-07] Portal plan drafted. Stack: Next.js + SQLite + Recharts.
- [2026-03-07] Phonetic Drift Heatmap identified as Phase 2 priority visualization.
- [2026-03-07] Scaffolding complete: `npx create-next-app` executed and Next.js 14 baseline installed.

## 🏷️ UI Source Metadata Rename Trace
| Internal ID | UI Label | Realm |
|---|---|---|
| `nine_year` | **NINE** | Klokah |
| `twelve` | **TWELVE** | Klokah |
| `grmpts` | **GRAMMAR** | Klokah |
| `essay` | **ESSAYS** | Klokah |
| `dialogue` | **DIALOGUE** | Klokah |
| `ILRDF` | **DICT** | ILRDF |
| `vocabulary_stc`| **STC_VOCAB** | Klokah (Legacy) |

## 🧬 Data Traceability Strategy
To resolve "generic family" labels without losing data provenance:
1. **The 'Inferred' Column**: Add an `is_inferred` (boolean) and `original_dialect_label` (text) to the `occurrences` table.
2. **Strict Mapping**: Create a `master_mapping.json` that maps (Source + Category) to a sub-dialect.
3. **The Resolve Script**: Run a master rewrite that updates `dialect_name` based on the mapping but preserves the original generic label in `original_dialect_label`.
4. **UI Indication**: The portal will display inferred results with a subtle `*` or `(inferred)` suffix in the source pill.
