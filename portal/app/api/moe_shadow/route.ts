import { NextResponse } from 'next/server';
import { getMoeDb } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const db = getMoeDb();
        const { searchParams } = new URL(request.url);

        const keyword = searchParams.get('keyword');
        const dict_code = searchParams.get('dict_code');
        const mode = searchParams.get('mode') || 'plus';
        const aggregate = searchParams.get('aggregate') === 'true';
        const exact = searchParams.get('exact') === 'true';
        const sourceFilter = searchParams.get('source');
        const showCounts = searchParams.get('counts') === 'true';
        const showStats = searchParams.get('stats') === 'true';

        if (showCounts) {
            // Count total entries per dict
            const entryCounts = db.prepare(`
                SELECT dict_code, COUNT(*) as count 
                FROM moe_entries 
                GROUP BY dict_code
            `).all() as any[];
            
            // Count "Roots" (depth=1 in moe_hierarchy_moe) per dict
            // We join with moe_entries to get the dict_code because h.sources is a string list and less reliable for exact counts
            const rootCounts = db.prepare(`
                SELECT e.dict_code, COUNT(DISTINCT e.word_ab) as count
                FROM moe_entries e
                JOIN moe_hierarchy_moe h ON RTRIM(e.word_ab, '|') = h.word_ab
                WHERE h.depth = 1
                GROUP BY e.dict_code
            `).all() as any[];
            
            const totalEntries = db.prepare(`SELECT COUNT(*) as count FROM moe_entries`).get() as any;
            const totalRoots = db.prepare(`SELECT COUNT(*) as count FROM moe_hierarchy_moe WHERE depth = 1`).get() as any;
            
            const countsMap: Record<string, { r: number; e: number }> = {};
            entryCounts.forEach(c => {
                if (!countsMap[c.dict_code]) countsMap[c.dict_code] = { r: 0, e: 0 };
                countsMap[c.dict_code].e = c.count;
            });
            rootCounts.forEach(c => {
                if (!countsMap[c.dict_code]) countsMap[c.dict_code] = { r: 0, e: 0 };
                countsMap[c.dict_code].r = c.count;
            });

            return NextResponse.json({ 
                counts: countsMap,
                total: { r: totalRoots.count, e: totalEntries.count }
            });
        }

        if (showStats) {
            const tableName = mode === 'moe' ? 'moe_hierarchy_moe' :
                mode === 'star' ? 'moe_hierarchy_star' :
                    'moe_hierarchy_plus';
            
            const isFiltered = sourceFilter && sourceFilter !== 'ALL';
            const sourceWhere = isFiltered ? `AND e.dict_code = '${sourceFilter}'` : '';

            // 1. Total Roots (uncapped) for this source
            const totalRootsSql = `
                SELECT COUNT(DISTINCT h.ultimate_root) as count
                FROM ${tableName} h
                ${isFiltered ? `JOIN moe_entries e ON RTRIM(e.word_ab, '|') = h.word_ab` : ''}
                WHERE 1=1 ${sourceWhere}
            `;
            const totalRootsResult = db.prepare(totalRootsSql).get() as any;
            const totalRoots = totalRootsResult.count;

            // 2. Top Roots (for the list)
            const topRootsSql = `
                SELECT h.ultimate_root as root, COUNT(*) as count
                FROM ${tableName} h
                ${isFiltered ? `JOIN moe_entries e ON RTRIM(e.word_ab, '|') = h.word_ab` : ''}
                WHERE 1=1 ${sourceWhere}
                GROUP BY h.ultimate_root
                ORDER BY count DESC
                LIMIT 100
            `;
            const topRoots = db.prepare(topRootsSql).all() as any[];

            // 3. Depth Distribution
            const depthSql = `
                SELECT h.depth, COUNT(*) as count
                FROM ${tableName} h
                ${isFiltered ? `JOIN moe_entries e ON RTRIM(e.word_ab, '|') = h.word_ab` : ''}
                WHERE 1=1 ${sourceWhere}
                GROUP BY h.depth
            `;
            const depths = db.prepare(depthSql).all() as any[];
            const depthDist: Record<string, number> = {};
            let maxDepth = 0;
            depths.forEach(d => {
                depthDist[d.depth] = d.count;
                if (d.depth > maxDepth) maxDepth = d.depth;
            });

            // 4. Summary
            const totalWords = Object.values(depthDist).reduce((a, b) => a + b, 0);
            const averageBranching = totalRoots > 0 ? (totalWords / totalRoots).toFixed(2) : 0;

            // For global (unfiltered) stats, ensure we get the absolute max_depth from the table
            let globalMaxDepth = maxDepth;
            if (!isFiltered) {
                const globalMaxResult = db.prepare(`SELECT MAX(depth) as max_d FROM ${tableName}`).get() as any;
                globalMaxDepth = globalMaxResult.max_d || maxDepth;
            }

            return NextResponse.json({
                summary: {
                    total_roots: totalRoots,
                    total_words: totalWords,
                    max_depth: globalMaxDepth,
                    average_branching: Number(averageBranching)
                },
                top_roots: topRoots,
                depth_distribution: depthDist
            });
        }

        const tableName = mode === 'moe' ? 'moe_hierarchy_moe' :
            mode === 'star' ? 'moe_hierarchy_star' :
                'moe_hierarchy_plus';

        if (!keyword) {
            return NextResponse.json({ error: "Keyword parameter is required." }, { status: 400 });
        }

        if (aggregate) {
            // Safety: moe_hierarchy_moe has sort_path and sources. plus/star do not.
            const hasExtraColumns = (tableName === 'moe_hierarchy_moe');

            let sql = `
                WITH RECURSIVE subtree(word_ab) AS (
                    SELECT word_ab FROM ${tableName} WHERE LOWER(word_ab) = LOWER(?)
                    UNION ALL
                    SELECT h.word_ab FROM ${tableName} h JOIN subtree s ON h.parent_word = s.word_ab
                )
                SELECT e.*, h.parent_word, h.ultimate_root, h.depth as tier
                ${hasExtraColumns ? ', h.sort_path, h.sources' : ''}
                FROM subtree s
                JOIN ${tableName} h ON s.word_ab = h.word_ab
                JOIN moe_entries e ON RTRIM(e.word_ab, '|') = h.word_ab
                WHERE 1=1
            `;

            const bindParams: any[] = [keyword];
            
            /* 
            // Apply source filter if provided - DISABLED for aggregate to preserve tree integrity
            if (sourceFilter && sourceFilter !== 'ALL') {
                if (hasExtraColumns) {
                    // Optimized for moe_hierarchy_moe which has a 'sources' CSV column
                    sql += ` AND h.sources LIKE ?`;
                    bindParams.push(`%${sourceFilter}%`);
                } else {
                    // Fallback to joining with moe_entries for plus/star modes
                    sql += ` AND e.dict_code = ?`;
                    bindParams.push(sourceFilter);
                }
            }
            */

            const stmt = db.prepare(sql);
            const rows = stmt.all(...bindParams) as any[];
            
            // SECOND PASS: If rows were filtered out of the subtree, we might have disconnected nodes.
            // Morphological trees should generally remain intact. 
            // If the user is specifically inspecting a root, we should show the full lineage.
            // UNLESS the user explicitly wants to see only source-specific matches.
            // For Kilang visualizer, we prefer seeing the full tree once a root is clicked.
            
            console.log(`[API/MOE] Mode: ${mode}, Table: ${tableName}, Results: ${rows.length} for "${keyword}" (Source: ${sourceFilter || 'ALL'})`);
            return NextResponse.json({ rows });
        }

        const params: any[] = [];
        let sql = "SELECT * FROM moe_entries WHERE 1=1";

        if (keyword) {
            if (exact) {
                sql += ` AND (LOWER(word_ab) = LOWER(?) OR LOWER(RTRIM(word_ab, '|')) = LOWER(?))`;
                params.push(keyword, keyword);
            } else {
                sql += ` AND (word_ab LIKE ? OR definition LIKE ?)`;
                params.push(`%${keyword}%`);
                params.push(`%${keyword}%`);
            }
        }

        if (dict_code && dict_code !== 'ALL') {
            sql += ` AND dict_code = ?`;
            params.push(dict_code);
        }

        sql += ` ORDER BY word_ab LIMIT 500`;
        const stmt = db.prepare(sql);
        const rows = stmt.all(...params) as any[];

        return NextResponse.json({ rows });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
