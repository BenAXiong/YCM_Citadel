const sqlite = require('better-sqlite3');
const dbPath = 'C:/Users/Ben/Documents/LL/6_ycm/YCM_Citadel/data/amis_moe_test.db';
const db = new sqlite(dbPath);

console.log('Columns:');
console.log(db.prepare("PRAGMA table_info(moe_entries)").all());

console.log('Sample for fana\':');
console.log(db.prepare("SELECT * FROM moe_entries WHERE LOWER(word_ab) = 'fana\'' ").all());
