/**
 * SOVEREIGN SOURCE LIST
 * Single source of truth for all corpora/sources in ycm_master.db.
 * The `value` must EXACTLY match the `source` field in the occurrences table.
 *
 * DB source inventory (confirmed via `SELECT DISTINCT source, count(*) FROM occurrences`):
 *   essay         | 62,175 rows  — Indigenous essay/prose by topic (Klokah /essay/)
 *   dialogue      | 53,273 rows  — Situational conversational pairs (Klokah /dialogue/)
 *   grmpts        | 31,473 rows  — Grammar structure drills (Klokah /grmpts/)
 *   nine_year     | 19,294 rows  — 9-level foundational curriculum (Klokah /nine/)
 *   twelve        | 18,809 rows  — 12-level MOE curriculum (Klokah /twelve/)
 *   vocabulary_stc|    475 rows  — Partial Klokah vocabulary scrape (/vocabulary/json/{lid}.json)
 *                                  UUIDs: vocab_stc_*. NOTE: This is NOT the ILRDF glossary.
 *                                  ILRDF is in the DB but stored in `ilrdf_vocabulary`.
 *   卡那卡那富語  |      1 row   — Data anomaly: dialect name leaked into source field.
 *
 * ILRDF Corpus (Separate Table: `ilrdf_vocabulary`):
 *   ILRDF         | 292,983 rows — Full glossary from glossary.ilrdf.org.tw.
 *
 * Flags:
 *   vs1   - multi-select pills in VS-1 search toolbar
 *   vs2   - dropdown in VS-2 syllabus toolbar
 *   vs3   - single-select in VS-3 geometry view (structural sources with sentence-level content)
 *   rawdb - shown in raw_db tool viewer
 */
export interface SourceDef {
    value: string;
    label: string;
    vs1: boolean;
    vs2: boolean;
    vs3: boolean;
    dict: boolean;
    rawdb: boolean;
}

export const SOURCES: SourceDef[] = [
    // "ALL" is a synthetic sentinel (not a real DB value) meaning "no source filter"
    { value: "ALL",           label: "ALL",          vs1: true,  vs2: true,  vs3: false, dict: true,  rawdb: true  },

    // dialogue: 53k rows. Practical situational conversational pairs from Klokah /dialogue/
    { value: "dialogue",      label: "DIALOGUE",     vs1: true,  vs2: true,  vs3: true,  dict: true,  rawdb: true  },

    // essay: 62k rows. Cultural/traditional text paragraphs organised by topic (主題). Primary VS-3 source.
    { value: "essay",         label: "ESSAY",        vs1: true,  vs2: false, vs3: true,  dict: true,  rawdb: true  },

    // grmpts: 31k rows. Grammar structure drill sentences from Klokah /grmpts/
    { value: "grmpts",        label: "PATTERNS",      vs1: true,  vs2: true,  vs3: true,  dict: true,  rawdb: true  },

    // nine_year: 19k rows. 9-level foundational literacy curriculum from Klokah /nine/
    { value: "nine_year",     label: "NINE",         vs1: true,  vs2: true,  vs3: true,  dict: true,  rawdb: true  },

    // twelve: 19k rows. 12-level MOE school curriculum from Klokah /twelve/ (中級 structure: 12 階 × 10 課)
    { value: "twelve",        label: "TWELVE",       vs1: true,  vs2: true,  vs3: true,  dict: true,  rawdb: true  },

    // ILRDF: ~292k rows. Glossary from glossary.ilrdf.org.tw. Lexicographic corpus.
    // Stored in `ilrdf_vocabulary` table natively instead of `sentences`/`occurrences`.
    { value: "ILRDF",         label: "ILRDF",        vs1: false, vs2: false, vs3: false, dict: false, rawdb: true  },
];

export const VS1_SOURCES   = SOURCES.filter(s => s.vs1);
export const VS2_SOURCES   = SOURCES.filter(s => s.vs2);
export const VS3_SOURCES   = SOURCES.filter(s => s.vs3);
export const DICT_SOURCES  = SOURCES.filter(s => s.dict);
export const RAWDB_SOURCES = SOURCES.filter(s => s.rawdb);
