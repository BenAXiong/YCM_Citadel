import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const db = getDb();
        const { searchParams } = new URL(request.url);
        
        const source = searchParams.get('source');
        const keyword = searchParams.get('keyword');
        const dialect_name = searchParams.get('dialect_name');
        const sentence_id = searchParams.get('sentence_id');
        
        const params: any[] = [];
        let sql = "";

        if (source === 'ILRDF') {
            sql = `
                SELECT 
                    id as sentence_id,
                    glid,
                    word_ch as zh,
                    word_ab as ab,
                    dialect_name,
                    'ILRDF' as source,
                    source as category,
                    '—' as level,
                    'vocab_' || id as original_uuid
                FROM ilrdf_vocabulary
                WHERE 1=1
            `;

            if (keyword) {
                sql += ` AND (word_ch LIKE ? OR word_ab LIKE ?)`;
                params.push(`%${keyword}%`);
                params.push(`%${keyword}%`);
            }

            if (dialect_name) {
                sql += ` AND dialect_name LIKE ?`;
                params.push(`%${dialect_name}%`);
            }
        } else {
            sql = `
                SELECT 
                    s.id as sentence_id,
                    s.glid,
                    s.zh,
                    s.ab,
                    o.dialect_name,
                    o.source,
                    o.category,
                    o.level,
                    o.original_uuid
                FROM occurrences o 
                JOIN sentences s ON o.sentence_id = s.id
                WHERE 1=1
            `;

            if (sentence_id) {
                sql += ` AND s.id = ?`;
                params.push(parseInt(sentence_id));
            }

            if (keyword) {
                sql += ` AND (s.zh LIKE ? OR s.ab LIKE ?)`;
                params.push(`%${keyword}%`);
                params.push(`%${keyword}%`);
            }

            if (source && source !== 'ALL') {
                sql += ` AND o.source = ?`;
                params.push(source);
            }

            if (dialect_name) {
                sql += ` AND o.dialect_name LIKE ?`;
                params.push(`%${dialect_name}%`);
            }
        }

        sql += ` LIMIT 500`;

        const stmt = db.prepare(sql);
        const rows = stmt.all(...params) as any[];

        return NextResponse.json({ rows });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
