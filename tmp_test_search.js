const Database = require('better-sqlite3');
const path = require('path');

function testSearch(q) {
    const dbPath = path.join(__dirname, 'portal', 'ycm_master.db');
    const db = new Database(dbPath, { readonly: true });
    
    db.function('REGEXP', { deterministic: true }, (regex, text) => {
        if (!text) return 0;
        const re = new RegExp(regex, 'i');
        return re.test(text) ? 1 : 0;
    });

    const isStrict = q.startsWith('"') && q.endsWith('"');
    const innerQ = isStrict ? q.slice(1, -1) : q;
    const searchPattern = innerQ.replace(/\*/g, '.*');

    const wordSql = `
        SELECT id, word_ab as ab, word_ch as zh, dialect_name, glid, source
        FROM ilrdf_vocabulary
        WHERE word_ab REGEXP ? OR word_ch REGEXP ?
        LIMIT 50
    `;
    
    const pattern = `.*${searchPattern}.*`;
    console.log(`Testing query for "${q}" with pattern "${pattern}"`);
    
    try {
        const words = db.prepare(wordSql).all(pattern, pattern);
        console.log(`Hits: ${words.length}`);
        if (words.length > 0) {
            console.log('First hit:', words[0]);
        }
    } catch (e) {
        console.error('Query failed:', e.message);
    }
    
    db.close();
}

testSearch('itini');
testSearch('水');
