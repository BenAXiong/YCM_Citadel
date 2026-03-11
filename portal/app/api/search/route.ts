import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import { GLID_NAMES, GLID_FAMILIES } from '@/lib/dialects';
import { GENERIC_MAPPINGS } from '@/lib/mappings';
import geometryData from '@/lib/corpus_geometry.json';
import { DICT_SOURCES, VS1_SOURCES, VS2_SOURCES } from '@/lib/sources';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get('mode') || 'VS-1';

        // Deep Repair for Klokah Audio URLs
        const repairAudioUrl = (row: any) => {
            if (!row.audio_url || !row.audio_url.includes('klokah.tw')) return row.audio_url;
            
            // Standard migration
            let url = row.audio_url.replace('file.klokah.tw', 'web.klokah.tw').replace('http://', 'https://');
            
            // SPECIAL REPAIR: Dialogue and Essay often have "truncated" URLs in the DB
            // e.g. /sound/529922.mp3 instead of /text/sound/34045/529922.mp3
            if ((row.source === 'essay' || row.source === 'dialogue') && !url.includes('/text/')) {
                // Try to extract Context ID from original_uuid (e.g. essay_ES11201_34045_0)
                const parts = (row.original_uuid || "").split('_');
                // The context ID is usually the second to last part
                const contextId = parts.length >= 3 ? parts[parts.length - 2] : null;

                if (contextId && /^\d+$/.test(contextId)) {
                    // Extract sentence ID from URL (e.g. 529922)
                    const sMatch = url.match(/\/sound\/(\d+)\.mp3/);
                    if (sMatch && sMatch[1]) {
                        return `https://web.klokah.tw/text/sound/${contextId}/${sMatch[1]}.mp3`;
                    }
                }
            }
            return url;
        };

        // Quick helper to pivot our data where row.ab becomes an object with { text, audio }
        // Helper 1: Pivot by Chinese (ZH) literals (Standard for VS-1)
        const pivotData = (rows: any[]) => {
            const pivot: Record<string, {
                zh: string;
                dialects: Record<string, { text: string; audio?: string; source: string; level?: string; category?: string; inferred?: boolean }[]>
            }> = {};

            for (const row of rows) {
                if (!pivot[row.zh]) {
                    pivot[row.zh] = { zh: row.zh, dialects: {} };
                }

                // Dialect name is now clean from the Forge/Distiller
                let dName = (row.dialect_name || "UNKNOWN").trim();
                let isInferred = false;
                let targets = [dName];

                if (GENERIC_MAPPINGS[dName]) {
                    targets = [GENERIC_MAPPINGS[dName]];
                    isInferred = true;
                } else if (row.glid) {
                    const familyName = GLID_NAMES[row.glid];
                    const isFamily = dName === familyName || dName.replace('語', '族') === familyName;
                    if (isFamily && GLID_FAMILIES[row.glid]) {
                        targets = GLID_FAMILIES[row.glid];
                        isInferred = true;
                    }
                }

                for (const d of targets) {
                    if (!pivot[row.zh].dialects[d]) pivot[row.zh].dialects[d] = [];
                    if (!pivot[row.zh].dialects[d].find((x) => x.text === row.ab)) {
                        pivot[row.zh].dialects[d].push({
                            text: row.ab,
                            audio: repairAudioUrl(row) || undefined,
                            source: row.source || 'UNK',
                            level: row.level,
                            category: row.category,
                            inferred: isInferred
                        });
                    }
                }
            }
            return Object.values(pivot).map(p => ({ zh: p.zh, ...p.dialects }));
        };

        // Helper 2: Pivot by Structural Geometry (UUID-based for VS-3)
        const pivotGeometryData = (rows: any[]) => {
            const pivot: Record<string, {
                zh: string;
                dialects: Record<string, { text: string; audio?: string; source: string; level?: string; category?: string; inferred?: boolean }[]>
            }> = {};

            for (const row of rows) {
                const parts = (row.original_uuid || "").split('_');
                const orderIndex = parts[parts.length - 1];
                const sourcePrefix = parts[0];
                
                let geoId = `${sourcePrefix}_${orderIndex}`;

                if (!pivot[geoId]) {
                    pivot[geoId] = { zh: row.zh, dialects: {} };
                }

                let dName = (row.dialect_name || "UNKNOWN").trim();
                let isInferred = false;
                let targets: string[] = [];

                // Multi-target Expansion Logic
                // If the name matches a GLID family (e.g. '阿美語'), expand to ALL its sub-dialects
                const matchingGlid = Object.entries(GLID_NAMES).find(([_, name]) => name === dName || name.replace('族', '語') === dName)?.[0];
                
                if (matchingGlid && GLID_FAMILIES[matchingGlid]) {
                    targets = GLID_FAMILIES[matchingGlid];
                    isInferred = true;
                } else if (GENERIC_MAPPINGS[dName]) {
                    // Fallback to GENERIC_MAPPINGS (which might be a single target)
                    targets = [GENERIC_MAPPINGS[dName]];
                    isInferred = true;
                } else {
                    targets = [dName];
                }

                for (const d of targets) {
                    if (!pivot[geoId].dialects[d]) pivot[geoId].dialects[d] = [];
                    // Ensure we don't add duplicate text for the same dialect+pivot
                    if (!pivot[geoId].dialects[d].find((x) => x.text === row.ab)) {
                        pivot[geoId].dialects[d].push({
                            text: row.ab,
                            audio: repairAudioUrl(row) || undefined,
                            source: row.source || 'UNK',
                            level: row.level,
                            category: row.category,
                            inferred: isInferred
                        });
                    }
                }
            }
            return Object.values(pivot).map(p => ({ zh: p.zh, ...p.dialects }));
        };

        if (mode === 'VS-2') {
            const level = searchParams.get('level') || '1';
            const lesson = searchParams.get('lesson') || '1';

            const db = getDb();
            const blessedValues = VS2_SOURCES.map(s => s.value).filter(v => v !== 'ALL');
            const placeholders = blessedValues.map(() => '?').join(',');
            
            const sql = `
                SELECT s.zh, s.ab, o.dialect_name, s.glid, o.audio_url, o.source, o.level, o.category, o.original_uuid
                FROM sentences s
                JOIN occurrences o ON s.id = o.sentence_id
                WHERE o.level = ? AND (o.category LIKE ? OR o.category LIKE ?)
                AND o.source IN (${placeholders})
                LIMIT 2500
            `;
            const lessonLike = `%lesson ${lesson}%`;
            const classLike = `%class ${lesson}%`;
            const params = [String(level), lessonLike, classLike, ...blessedValues];

            const stmt = db.prepare(sql);
            const rows = stmt.all(...params) as any[];
            const results = pivotData(rows);

            return NextResponse.json({ results: results });
        } else if (mode === 'VS-3') {
            const titleZh = searchParams.get('category'); // Now receiving the Chinese Title
            const sourceFilter = searchParams.get('module') || 'essay';
            if (!titleZh) return NextResponse.json({ results: [] });

            const db = getDb();
            
            // If it's a structural source (nine_year, twelve, grmpts), we search by exact category
            if (['nine_year', 'twelve', 'grmpts'].includes(sourceFilter)) {
                let sql = `
                    SELECT s.zh, s.ab, o.dialect_name, s.glid, o.audio_url, o.source, o.level, o.category, o.original_uuid
                    FROM sentences s
                    JOIN occurrences o ON s.id = o.sentence_id
                    WHERE o.source = ? AND o.category = ?
                `;
                let params: any[] = [sourceFilter, titleZh];

                if (sourceFilter === 'grmpts') {
                    const patternLevel = searchParams.get('level') || '1';
                    sql += ` AND o.level = ?`;
                    params.push(String(patternLevel));
                }

                sql += ` ORDER BY CAST(SUBSTR(o.original_uuid, INSTR(o.original_uuid, '_') + 1) AS INTEGER) ASC`;
                
                const stmt = db.prepare(sql);
                const rows = stmt.all(...params) as any[];
                return NextResponse.json({ results: pivotGeometryData(rows) });
            }

            // For Narrative sources (essay, dialogue), we align by the pre-computed sequential alignment
            const sourceKey = sourceFilter as 'essay' | 'dialogue';
            const entries = (geometryData as any)[sourceKey] || [];
            const entry = entries.find((e: any) => e.title_zh === titleZh);
            
            if (!entry || !entry.alignment) {
                return NextResponse.json({ results: [] });
            }

            const tids = Object.values(entry.alignment);
            if (tids.length === 0) return NextResponse.json({ results: [] });

            const placeholders = tids.map(() => '?').join(',');
            const sql = `
                SELECT s.zh, s.ab, o.dialect_name, s.glid, o.audio_url, o.source, o.level, o.category, o.original_uuid
                FROM sentences s
                JOIN occurrences o ON s.id = o.sentence_id
                WHERE o.source = ? AND o.category IN (${placeholders})
                ORDER BY CAST(SUBSTR(o.original_uuid, INSTR(o.original_uuid, '_') + 1) AS INTEGER) ASC
            `;
            const rows = db.prepare(sql).all(sourceFilter, ...tids) as any[];
            return NextResponse.json({ results: pivotGeometryData(rows) });
        } else if (mode === 'DICT') {
            const q = searchParams.get('q') || '';
            const levelFilter = searchParams.get('level') || 'ALL';
            const genreFilter = searchParams.get('genre') || 'ALL';
            const moduleFilter = searchParams.get('module') || 'ALL';
            const strict = searchParams.get('strict') === 'true';
            
            if (!q) return NextResponse.json({ results: [] });

            const db = getDb();
            const pattern = `%${q}%`;

            console.log(`[DICT_DEBUG] query="${q}" level="${levelFilter}" genre="${genreFilter}" strict=${strict}`);
            
            try {
                const dialectFilter = searchParams.get('dialects') || '';
                
                // 1. Get headwords - Prioritize exact or start matches
                let wordsSql = `
                    SELECT id, word_ab as ab, word_ch as zh, dialect_name, glid, source 
                    FROM ilrdf_vocabulary 
                    WHERE (word_ab = ? OR word_ch = ? OR word_ab LIKE ? OR word_ch LIKE ?)
                `;
                const wordsParams: any[] = [q, q, `${q}%`, `${q}%` ];

                if (dialectFilter) {
                    const dNames = dialectFilter.split(',');
                    const placeholders = dNames.map(() => '?').join(',');
                    wordsSql += ` AND dialect_name IN (${placeholders})`;
                    wordsParams.push(...dNames);
                }

                if (strict) {
                    wordsSql += ` AND source LIKE '%學習詞表%'`;
                }

                wordsSql += ` ORDER BY (word_ab = ?) DESC, LENGTH(word_ab) ASC LIMIT 50`;
                wordsParams.push(q);
                
                const words = db.prepare(wordsSql).all(...wordsParams) as any[];
                
                // 2. Map examples from ALL sources for each word found (Global Examples are ALWAYS on)
                const results = words.map((w: any) => {
                    try {
                        // NO HYBRID MATCHING: We matching only on the Aboriginal text (s.ab)
                        // This prevents semantic noise from Chinese matches that don't contain the target word.
                        const abPattern = `%${w.ab.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}%`;
                        
                        let exSql = `
                            SELECT DISTINCT s.zh, s.ab, o.dialect_name, o.audio_url, o.source, o.level, o.category, o.original_uuid
                            FROM sentences s 
                            JOIN occurrences o ON s.id = o.sentence_id 
                            WHERE s.ab LIKE ? AND o.dialect_name = ?
                        `;
                        const params: any[] = [abPattern, w.dialect_name];

                        // NO DIALECT FALLBACK: Data is granular enough to stay strictly within w.dialect_name.

                        if (levelFilter !== 'ALL') {
                            exSql += ` AND o.level = ?`;
                            params.push(levelFilter);
                        }

                        if (moduleFilter === 'ALL') {
                            const blessedValues = DICT_SOURCES.map(s => s.value).filter(v => v !== 'ALL');
                            const placeholders = blessedValues.map(() => '?').join(',');
                            exSql += ` AND o.source IN (${placeholders})`;
                            params.push(...blessedValues);
                        } else {
                            const mods = moduleFilter.split(',');
                            const placeholders = mods.map(() => '?').join(',');
                            exSql += ` AND o.source IN (${placeholders})`;
                            params.push(...mods);
                        }

                        // Genre Filtering
                        if (genreFilter !== 'ALL') {
                            const genres = genreFilter.split(',');
                            const genreClauses: string[] = [];
                            genres.forEach(g => {
                                if (g === 'News') genreClauses.push("o.source LIKE '%讀報%' OR o.category LIKE '%讀報%'");
                                if (g === 'Curriculum') genreClauses.push("o.source LIKE '%九階%' OR o.category LIKE '%九階%' OR o.source LIKE '%十二年%'");
                                if (g === 'Conversation') genreClauses.push("o.source LIKE '%會話%' OR o.category LIKE '%會話%'");
                                if (g === 'Culture') genreClauses.push("o.source LIKE '%文化%' OR o.category LIKE '%文化%'");
                                if (g === 'Literature') genreClauses.push("o.source LIKE '%閱讀%' OR o.category LIKE '%閱讀%'");
                            });
                            if (genreClauses.length > 0) {
                                exSql += ` AND (${genreClauses.join(' OR ')})`;
                            }
                        }

                        exSql += ` ORDER BY LENGTH(s.ab) ASC LIMIT 10`; 
                        const rawExamples = db.prepare(exSql).all(...params) as any[];
                        const examples = rawExamples.map(ex => ({
                            ...ex,
                            audio_url: repairAudioUrl(ex)
                        }));
                        return { 
                            ...w, 
                            audio_url: repairAudioUrl(w),
                            examples 
                        };
                    } catch (exErr) {
                        return { ...w, examples: [] };
                    }
                });

                return NextResponse.json({ results });
            } catch (err: any) {
                console.error(`[DICT_DEBUG] Query failed: ${err.message}`);
                return NextResponse.json({ error: err.message, results: [] }, { status: 500 });
            }
        } else {
            // VS-1 Mode
            let q = searchParams.get('q') || '';
            const moduleFilter = searchParams.get('module') || 'ALL';

            if (!q || q.length < 1) {
                return NextResponse.json({ results: [] });
            }

            // Advanced Search: Convert * to %
            const db = getDb();
            let sqlParams: any[] = [];

            // Check for strict search with quotes
            const isStrict = q.startsWith('"') && q.endsWith('"');
            const innerQ = isStrict ? q.slice(1, -1) : q;

            // Advanced Search: Convert * to % for standard LIKE
            // But if we have REGEXP we can do more.
            const searchPattern = innerQ.replace(/\*/g, '.*');

            const selectedModules = moduleFilter === 'ALL' ? [] : moduleFilter.split(',');

            let klokahSql = "";
            let klokahParams: any[] = [];

            if (isStrict) {
                const regexPattern = `(^|[^a-zA-Z0-9'’\\u00C0-\\u017F])${innerQ}([^a-zA-Z0-9'’\\u00C0-\\u017F]|$)`;
                klokahSql = `
                    SELECT s.zh, s.ab, o.dialect_name, s.glid, o.audio_url, o.source, o.level, o.category, o.original_uuid
                    FROM sentences s
                    JOIN occurrences o ON s.id = o.sentence_id
                    WHERE (s.zh REGEXP ? OR s.ab REGEXP ?)
                `;
                klokahParams = [regexPattern, regexPattern];
            } else {
                const likePattern = `%${innerQ.replace(/\*/g, '%')}%`;
                klokahSql = `
                    SELECT s.zh, s.ab, o.dialect_name, s.glid, o.audio_url, o.source, o.level, o.category, o.original_uuid
                    FROM sentences s
                    JOIN occurrences o ON s.id = o.sentence_id
                    WHERE (s.zh LIKE ? OR s.ab LIKE ?)
                `;
                klokahParams = [likePattern, likePattern];
            }

            if (moduleFilter === 'ALL') {
                const blessedValues = VS1_SOURCES.map(s => s.value).filter(v => v !== 'ALL' && v !== 'ILRDF');
                const placeholders = blessedValues.map(() => '?').join(',');
                klokahSql += ` AND o.source IN (${placeholders})`;
                klokahParams.push(...blessedValues);
            } else if (selectedModules.length > 0) {
                // Filter out ILRDF as it's handled separately
                const kModules = selectedModules.filter(m => m !== 'ILRDF' && m !== 'ALL');
                if (kModules.length > 0) {
                    const placeholders = kModules.map(() => '?').join(',');
                    klokahSql += ` AND o.source IN (${placeholders})`;
                    klokahParams.push(...kModules);
                } else {
                    // Force zero results for Klokah table if only ILRDF was selected
                    klokahSql += ` AND 1=0`;
                }
            }

            let ilrdfSql = "";
            let ilrdfParams: any[] = [];
            const includeIlrdf = moduleFilter === 'ALL' || selectedModules.includes('ILRDF');

            if (includeIlrdf) {
                if (isStrict) {
                    const regexPattern = `(^|[^a-zA-Z0-9'’\\u00C0-\\u017F])${innerQ}([^a-zA-Z0-9'’\\u00C0-\\u017F]|$)`;
                    ilrdfSql = `
                        SELECT word_ch as zh, word_ab as ab, dialect_name, NULL as glid, NULL as audio_url, 'ILRDF' as source, NULL as level, NULL as category
                        FROM ilrdf_vocabulary
                        WHERE (word_ch REGEXP ? OR word_ab REGEXP ?)
                    `;
                    ilrdfParams = [regexPattern, regexPattern];
                } else {
                    const likePattern = `%${innerQ.replace(/\*/g, '%')}%`;
                    ilrdfSql = `
                        SELECT word_ch as zh, word_ab as ab, dialect_name, NULL as glid, NULL as audio_url, 'ILRDF' as source, NULL as level, NULL as category
                        FROM ilrdf_vocabulary
                        WHERE (word_ch LIKE ? OR word_ab LIKE ?)
                    `;
                    ilrdfParams = [likePattern, likePattern];
                }
            }

            let finalSql = "";
            if (includeIlrdf && klokahSql) {
                finalSql = `SELECT * FROM (${klokahSql} UNION ALL ${ilrdfSql}) LIMIT 10000`;
                sqlParams = [...klokahParams, ...ilrdfParams];
            } else if (includeIlrdf) {
                finalSql = `${ilrdfSql} LIMIT 10000`;
                sqlParams = ilrdfParams;
            } else {
                finalSql = `${klokahSql} LIMIT 10000`;
                sqlParams = klokahParams;
            }

            const stmt = db.prepare(finalSql);
            const rows = stmt.all(...sqlParams) as any[];
            const results = pivotData(rows);

            return NextResponse.json({ results: results });
        }
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
