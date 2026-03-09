
const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, '../export/games_master.db');
const db = new Database(dbPath, { readonly: true });

const query = '如果雨停了，我可以出去嗎？';
const rows = db.prepare(`SELECT s.id, s.zh, s.ab, s.glid, o.dialect_name, o.source 
                         FROM sentences s 
                         JOIN occurrences o ON s.id = o.sentence_id 
                         WHERE s.zh = ?`).all(query);

console.log(`Results for: ${query}`);
console.log(JSON.stringify(rows, null, 2));
