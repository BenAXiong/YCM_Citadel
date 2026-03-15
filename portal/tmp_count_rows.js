const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'data', 'amis_moe_test.db');
const db = new Database(dbPath, { readonly: true });
const tables = ['moe_hierarchy', 'moe_hierarchy_moe', 'moe_hierarchy_plus', 'moe_hierarchy_star'];
tables.forEach(table => {
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get().count;
    console.log(`${table}: ${count}`);
});
