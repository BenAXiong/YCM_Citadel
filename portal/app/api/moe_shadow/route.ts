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

        const tableName = mode === 'moe' ? 'moe_hierarchy_moe' : 
                         mode === 'star' ? 'moe_hierarchy_star' : 
                         'moe_hierarchy_plus';

        console.log(`[API/MOE] Query: keyword="${keyword}", mode="${mode}", aggregate=${aggregate}, exact=${exact}`);
        
        if (keyword && aggregate) {
            // ... [existing aggregate code]
            let sql = `
                SELECT e.*, h.parent_word, h.ultimate_root, h.depth as tier, h.sort_path
                FROM moe_entries e
                JOIN ${tableName} h ON RTRIM(e.word_ab, '|') = h.word_ab
                WHERE LOWER(h.ultimate_root) = LOWER(?)
            `;
            const bindParams: any[] = [keyword];
            if (sourceFilter && sourceFilter !== 'ALL') {
                sql += ` AND h.sources LIKE ?`;
                bindParams.push(`%${sourceFilter}%`);
            }
            const stmt = db.prepare(sql);
            const rows = stmt.all(...bindParams) as any[];
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
