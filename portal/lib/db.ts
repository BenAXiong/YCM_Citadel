import Database from 'better-sqlite3'; // Force reload

import path from 'path';
import fs from 'fs';

// Prevent HMR from accumulating open file connections which causes Windows locks
const globalForDb = globalThis as unknown as {
    masterConn: ReturnType<typeof Database> | null;
    mtime: number;
};

const globalForMoeDb = globalThis as unknown as {
    moeConn: ReturnType<typeof Database> | null;
};

export function getMoeDb() {
    // Attempt to find it in the data folder relative to project root
    let dbPath = path.join(process.cwd(), "data", "amis_moe_test.db");
    
    // If not found (e.g. running from portal/), try one level up
    if (!fs.existsSync(dbPath)) {
        dbPath = path.join(process.cwd(), "..", "data", "amis_moe_test.db");
    }
    
    if (!globalForMoeDb.moeConn) {
        if (!fs.existsSync(dbPath)) {
            console.error(`[DB_ERROR] MOE Shadow DB not found at: ${dbPath}`);
            // Fallback to a dummy connection or throw to let the API handle it
            throw new Error(`MOE Shadow DB not found at: ${dbPath}`);
        }
        console.log(`[DB] Connecting to MOE Shadow: ${dbPath}`);
        globalForMoeDb.moeConn = new Database(dbPath, { readonly: true });
    }
    return globalForMoeDb.moeConn;
}

export function getDb() {
    const dbPath = path.join(process.cwd(), "ycm_master.db");
    
    // Auto-reload support for DEV environments
    if (process.env.NODE_ENV !== 'production') {
        try {
            const stat = fs.statSync(dbPath);
            if (globalForDb.masterConn && stat.mtimeMs > (globalForDb.mtime || 0)) {
                console.log("[DB] ycm_master.db modification detected. Closing stale connection.");
                globalForDb.masterConn.close();
                globalForDb.masterConn = null;
            }
            globalForDb.mtime = stat.mtimeMs;
        } catch (e) {
            // File might not exist yet
        }
    }

    if (!globalForDb.masterConn) {
        console.log(`[DB_DEBUG] Connecting to SQLite: ${dbPath}`);
        globalForDb.masterConn = new Database(dbPath, { readonly: true });
        // Add REGEXP support
        globalForDb.masterConn.function('REGEXP', { deterministic: true }, (regex: string, text: string) => {
            if (!text) return 0;
            const re = new RegExp(regex, 'i');
            return re.test(text) ? 1 : 0;
        });
    }
    
    return globalForDb.masterConn;
}
