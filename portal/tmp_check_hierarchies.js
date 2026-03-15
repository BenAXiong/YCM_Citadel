const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'data', 'amis_moe_test.db');
const db = new Database(dbPath, { readonly: true });
console.log('--- moe_hierarchy ---');
console.log(db.prepare("PRAGMA table_info(moe_hierarchy)").all());
console.log('\n--- moe_hierarchy_moe ---');
console.log(db.prepare("PRAGMA table_info(moe_hierarchy_moe)").all());
