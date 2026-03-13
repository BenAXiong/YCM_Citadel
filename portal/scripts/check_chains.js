const sqlite = require('better-sqlite3');
const dbPath = 'C:/Users/Ben/Documents/LL/6_ycm/YCM_Citadel/data/amis_moe_test.db';
const db = new sqlite(dbPath);

function findLongestChain(word, depth = 1) {
    const children = db.prepare("SELECT word_ab FROM moe_entries WHERE LOWER(stem) = ?").all(word.toLowerCase());
    if (children.length === 0) return { depth, chain: [word] };
    
    let maxSub = { depth: 0, chain: [] };
    for (const child of children) {
        const sub = findLongestChain(child.word_ab, depth + 1);
        if (sub.depth > maxSub.depth) maxSub = sub;
    }
    return { depth: maxSub.depth, chain: [word, ...maxSub.chain] };
}

console.log('Longest chain for sawad:');
console.log(findLongestChain('sawad'));

console.log('Longest chain for kaen:');
console.log(findLongestChain('kaen'));
