import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET() {
    const dbPath = path.join(process.cwd(), "ycm_master.db");
    let stats = null;
    try {
        const s = fs.statSync(dbPath);
        stats = {
            name: "ycm_master.db",
            path: dbPath,
            size: (s.size / 1024 / 1024).toFixed(2) + " MB",
            mtime: s.mtime
        };
    } catch (e) {
        stats = { error: "DB not found at " + dbPath };
    }

    return NextResponse.json(stats);
}
