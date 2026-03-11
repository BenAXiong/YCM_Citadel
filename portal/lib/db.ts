import Database from 'better-sqlite3'; // Force reload

import path from 'path';
import fs from 'fs';

// Prevent HMR from accumulating open file connections which causes Windows locks
const globalForDb = globalThis as unknown as {
    conn: ReturnType<typeof Database> | null;
    mtime: number;
};

export function getDb() {
    const dbPath = path.join(process.cwd(), "ycm_master.db");
    
    // Auto-reload support for DEV environments
    if (process.env.NODE_ENV !== 'production') {
        try {
            const stat = fs.statSync(dbPath);
            if (globalForDb.conn && stat.mtimeMs > (globalForDb.mtime || 0)) {
                console.log("[DB] ycm_master.db modification detected. Closing stale connection.");
                globalForDb.conn.close();
                globalForDb.conn = null;
            }
            globalForDb.mtime = stat.mtimeMs;
        } catch (e) {
            // File might not exist yet
        }
    }

    if (!globalForDb.conn) {
        console.log(`[DB_DEBUG] Connecting to SQLite: ${dbPath}`);
        globalForDb.conn = new Database(dbPath, { readonly: true });
        // Add REGEXP support
        globalForDb.conn.function('REGEXP', { deterministic: true }, (regex: string, text: string) => {
            if (!text) return 0;
            const re = new RegExp(regex, 'i');
            return re.test(text) ? 1 : 0;
        });
    }
    
    return globalForDb.conn;
}
