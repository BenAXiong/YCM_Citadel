const sqlite = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = 'c:/Users/Ben/Documents/LL/6_ycm/YCM_Citadel/portal/amis_moe_test.db';
const db = new sqlite(dbPath);

const modes = ['moe', 'plus', 'star'];

console.log('🔄 Syncing Database Hierarchy Tables from Static JSON Manifests...');

modes.forEach(mode => {
    const jsonPath = `c:/Users/Ben/Documents/LL/6_ycm/YCM_Citadel/portal/public/data/moe_manifest_${mode}.json`;
    if (!fs.existsSync(jsonPath)) {
        console.warn(`[WARN] Manifest not found for mode ${mode}: ${jsonPath}`);
        return;
    }

    console.log(`- Processing ${mode}...`);
    const manifest = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const tableName = mode === 'moe' ? 'moe_hierarchy_moe' : `moe_hierarchy_${mode}`;

    db.transaction(() => {
        // Ensure table exists with correct schema
        db.prepare(`DROP TABLE IF EXISTS ${tableName}`).run();
        
        // moe hierarchy has extra columns
        if (mode === 'moe') {
            db.prepare(`
                CREATE TABLE ${tableName} (
                    word_ab TEXT PRIMARY KEY,
                    parent_word TEXT,
                    ultimate_root TEXT,
                    depth INTEGER,
                    sort_path TEXT,
                    sources TEXT
                )
            `).run();
        } else {
            db.prepare(`
                CREATE TABLE ${tableName} (
                    word_ab TEXT PRIMARY KEY,
                    parent_word TEXT,
                    ultimate_root TEXT,
                    depth INTEGER
                )
            `).run();
        }

        const entries = Object.entries(manifest);
        console.log(`  -> Injecting ${entries.length} rows into ${tableName}...`);

        if (mode === 'moe') {
            const insert = db.prepare(`INSERT INTO ${tableName} VALUES (?, ?, ?, ?, ?, ?)`);
            for (const [key, data] of entries) {
                insert.run(data.w, data.p, data.r, data.d, data.path || '', data.src || '');
            }
        } else {
            const insert = db.prepare(`INSERT INTO ${tableName} VALUES (?, ?, ?, ?)`);
            for (const [key, data] of entries) {
                insert.run(data.w, data.p, data.r, data.d);
            }
        }
    })();
    console.log(`  ✅ ${tableName} Sync Complete.`);
});

console.log('\n✨ Database Sync Complete!');
