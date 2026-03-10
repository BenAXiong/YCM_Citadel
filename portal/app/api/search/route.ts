import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import { GLID_FAMILIES, GLID_NAMES } from '@/lib/dialects';
import { GENERIC_MAPPINGS } from '@/lib/mappings';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get('mode') || 'VS-1';

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
                            audio: row.audio_url || undefined,
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
                let geoId = row.zh; // Fallback
                if (parts.length >= 3) {
                    geoId = `${parts[0]}_${parts[parts.length - 2]}_${parts[parts.length - 1]}`;
                }

                if (!pivot[geoId]) {
                    pivot[geoId] = { zh: row.zh, dialects: {} };
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
                    if (!pivot[geoId].dialects[d]) pivot[geoId].dialects[d] = [];
                    if (!pivot[geoId].dialects[d].find((x) => x.text === row.ab)) {
                        pivot[geoId].dialects[d].push({
                            text: row.ab,
                            audio: row.audio_url || undefined,
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
            const sql = `
                SELECT s.zh, s.ab, o.dialect_name, s.glid, o.audio_url, o.source, o.level, o.category, o.original_uuid
                FROM sentences s
                JOIN occurrences o ON s.id = o.sentence_id
                WHERE o.level = ? AND (o.category LIKE ? OR o.category LIKE ?)
                LIMIT 2500
            `;
            const lessonLike = `%lesson ${lesson}%`;
            const classLike = `%class ${lesson}%`;
            const params = [String(level), lessonLike, classLike];

            const stmt = db.prepare(sql);
            const rows = stmt.all(...params) as any[];
            const results = pivotData(rows);

            return NextResponse.json({ results: results });
        } else if (mode === 'VS-3') {
            const category = searchParams.get('category');
            if (!category) return NextResponse.json({ results: [] });

            const db = getDb();
            const sql = `
                SELECT s.zh, s.ab, o.dialect_name, s.glid, o.audio_url, o.source, o.level, o.category, o.original_uuid
                FROM sentences s
                JOIN occurrences o ON s.id = o.sentence_id
                WHERE (o.source = 'essay' OR o.source = 'dialogue') AND o.category = ?
                ORDER BY o.original_uuid ASC
            `;
            const stmt = db.prepare(sql);
            const rows = stmt.all(category) as any[];
            const results = pivotGeometryData(rows);

            return NextResponse.json({ results: results });
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
                    SELECT s.zh, s.ab, o.dialect_name, s.glid, o.audio_url, o.source, o.level, o.category
                    FROM sentences s
                    JOIN occurrences o ON s.id = o.sentence_id
                    WHERE (s.zh REGEXP ? OR s.ab REGEXP ?)
                `;
                klokahParams = [regexPattern, regexPattern];
            } else {
                const likePattern = `%${innerQ.replace(/\*/g, '%')}%`;
                klokahSql = `
                    SELECT s.zh, s.ab, o.dialect_name, s.glid, o.audio_url, o.source, o.level, o.category
                    FROM sentences s
                    JOIN occurrences o ON s.id = o.sentence_id
                    WHERE (s.zh LIKE ? OR s.ab LIKE ?)
                `;
                klokahParams = [likePattern, likePattern];
            }

            if (selectedModules.length > 0 && !selectedModules.includes('ALL')) {
                // Filter out ILRDF as it's handled separately
                const kModules = selectedModules.filter(m => m !== 'ILRDF');
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
