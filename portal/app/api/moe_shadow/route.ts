import { NextResponse } from 'next/server';
import { getMoeDb } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const db = getMoeDb();
        const { searchParams } = new URL(request.url);
        
        const keyword = searchParams.get('keyword');
        const dict_code = searchParams.get('dict_code');
        const aggregate = searchParams.get('aggregate') === 'true';
        
        console.log(`[API/MOE] Query: keyword="${keyword}", dict="${dict_code}", aggregate=${aggregate}`);
        
        if (keyword && aggregate) {
            // UNIFIED SOURCE OF TRUTH: Querying the pre-calculated hierarchy table
            const sql = `
                SELECT e.*, h.parent_word, h.ultimate_root, h.depth as tier
                FROM moe_entries e
                JOIN moe_hierarchy h ON e.word_ab = h.word_ab
                WHERE LOWER(h.ultimate_root) = LOWER(?)
            `;
            
            const stmt = db.prepare(sql);
            const rows = stmt.all(keyword) as any[];
            console.log(`[API/MOE] Manifest Sync found ${rows.length} family members for "${keyword}"`);
            return NextResponse.json({ rows });
        }

        const params: any[] = [];
        let sql = "SELECT * FROM moe_entries WHERE 1=1";

        if (keyword) {
            // Broad search for sidebar
            sql += ` AND (word_ab LIKE ? OR definition LIKE ?)`;
            params.push(`%${keyword}%`);
            params.push(`%${keyword}%`);
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
