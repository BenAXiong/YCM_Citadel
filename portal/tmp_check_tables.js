const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'data', 'amis_moe_test.db');
const db = new Database(dbPath, { readonly: true });
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log(JSON.stringify(tables, null, 2));
