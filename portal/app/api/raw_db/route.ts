import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const db = getDb();
        const { searchParams } = new URL(request.url);
        let sql = `
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
        const params: any[] = [];

        const sentence_id = searchParams.get('sentence_id');
        if (sentence_id) {
            sql += ` AND s.id = ?`;
            params.push(parseInt(sentence_id));
        }

        const keyword = searchParams.get('keyword');
        if (keyword) {
            sql += ` AND (s.zh LIKE ? OR s.ab LIKE ?)`;
            params.push(`%${keyword}%`);
            params.push(`%${keyword}%`);
        }

        const source = searchParams.get('source');
        if (source && source !== 'ALL') {
            sql += ` AND o.source = ?`;
            params.push(source);
        }

        const dialect_name = searchParams.get('dialect_name');
        if (dialect_name) {
            sql += ` AND o.dialect_name LIKE ?`;
            params.push(`%${dialect_name}%`);
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
