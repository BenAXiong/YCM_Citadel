import Database from 'better-sqlite3';
import path from 'path';

let db: ReturnType<typeof Database> | null = null;

export function getDb() {
    if (!db) {
        // use local file instead of ../export so Vercel can find it
        const dbPath = path.join(process.cwd(), "games_master.db");
        db = new Database(dbPath, { readonly: true });
        // Add REGEXP support
        db.function('REGEXP', { deterministic: true }, (regex: string, text: string) => {
            if (!text) return 0;
            const re = new RegExp(regex, 'i');
            return re.test(text) ? 1 : 0;
        });
    }
    return db;
}
