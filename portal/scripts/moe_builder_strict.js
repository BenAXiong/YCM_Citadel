const sqlite = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

/**
 * MOE BUILDER: STRICT (The Raw Source)
 * 
 * GOAL: Generate a 1:1 reproduction of the official MoEDICT morphological data.
 * STRATEGY: Zero heuristics. Only trust the "stem" column.
 * METHOD: 
 *   1. Resolve Parent: Word -> stem (normalized).
 *   2. Resolve Ultimate Root: Recursive stem-tracing.
 *   3. If a word has no stem, it is its own Root (Depth 1).
 * OUTCOMES:
 *   - moe_manifest_strict.json
 *   - moe_stats_strict.json
 *   - moe_hierarchy_moe (Table in DB)
 */

const dbPath = 'C:/Users/Ben/Documents/LL/6_ycm/YCM_Citadel/data/amis_moe_test.db';
const db = new sqlite(dbPath);

console.log('📖 Building STRICT MOE Hierarchy (Raw Data)...');

// 1. Data Ingestion
const allEntries = db.prepare("SELECT word_ab, stem, dict_code FROM moe_entries WHERE word_ab != ''").all();
console.log(`- Loaded ${allEntries.length} entries.`);

const wordToDbStem = new Map();
const wordToEntry = new Map();
const allWordsSet = new Set();

allEntries.forEach(e => {
  const word = (e.word_ab || '').trim().toLowerCase();
  const stemRaw = (e.stem || '').trim().toLowerCase();
  const stem = stemRaw.endsWith('|') ? stemRaw.slice(0, -1) : stemRaw;

  if (word && !word.includes(' ')) {
    const cleanWord = word.endsWith('|') ? word.slice(0, -1) : word;
    wordToEntry.set(cleanWord, (e.word_ab || '').trim());
    allWordsSet.add(cleanWord);
    if (stem && stem !== cleanWord) {
      wordToDbStem.set(cleanWord, stem);
    }
  }
});

// 2. Hierarchy Building (STRICT)
const parentMap = new Map();
const depthMap = new Map();
const wordSources = new Map(); // word -> Set of dict_codes

allEntries.forEach(e => {
  const word = (e.word_ab || '').trim().toLowerCase();
  const cleanWord = word.endsWith('|') ? word.slice(0, -1) : word;
  const dCode = e.dict_code || 's';
  
  if (!wordSources.has(cleanWord)) wordSources.set(cleanWord, new Set());
  wordSources.get(cleanWord).add(dCode);
});

sortedWords = [...allWordsSet].sort((a,b) => a.length - b.length);

console.log('- Resolving chains...');

sortedWords.forEach(word => {
  const stem = wordToDbStem.get(word);
  if (stem && allWordsSet.has(stem)) {
    parentMap.set(word, stem);
  }
});

// Calculate Depth
const getDepth = (word) => {
  if (depthMap.has(word)) return depthMap.get(word);
  const parent = parentMap.get(word);
  if (!parent) {
    depthMap.set(word, 1);
    return 1;
  }
  const d = getDepth(parent) + 1;
  depthMap.set(word, d);
  return d;
};

sortedWords.forEach(w => getDepth(w));

// 3. Ultimate Root Resolution
const manifest = {};
const stats = {
  summary: { 
    total_roots: 0, 
    max_depth: 0, 
    max_branches: 0, 
    total_words: allWordsSet.size,
    average_branching: 0,
    std_dev: 0
  },
  distribution: {},
  depth_distribution: {},
  deep_examples: {},
  affixes: {}, // word -> frequency
  top_roots: []
};

const getAffixes = (word, stem) => {
  if (!stem || word === stem) return [];
  const index = word.indexOf(stem);
  
  if (index !== -1) {
    const prefix = word.slice(0, index);
    const suffix = word.slice(index + stem.length);
    const results = [];
    if (prefix) results.push(prefix + '-');
    if (suffix) results.push('-' + suffix);
    return results;
  }

  // Infix Detection (Split Match)
  // Usually infixes in Amis insert after the first phoneme (onset)
  for (let i = 1; i < stem.length; i++) {
    const s1 = stem.slice(0, i);
    const s2 = stem.slice(i);
    if (word.startsWith(s1) && word.endsWith(s2)) {
      const infix = word.slice(s1.length, word.length - s2.length);
      if (infix.length > 0) {
        return ['-' + infix + '-'];
      }
    }
  }

  return [];
};

console.log('- Resolving ultimate roots...');

sortedWords.forEach(word => {
  let curr = word;
  while (parentMap.has(curr)) {
    curr = parentMap.get(curr);
  }
  const ultimateRoot = curr;
  const depth = depthMap.get(word);

  const rawP = parentMap.has(word) ? wordToEntry.get(parentMap.get(word)) : null;
  const cleanP = rawP && rawP.endsWith('|') ? rawP.slice(0, -1) : rawP;
  const rawR = wordToEntry.get(ultimateRoot);
  const cleanR = rawR && rawR.endsWith('|') ? rawR.slice(0, -1) : rawR;

  const rawW = wordToEntry.get(word);
  const cleanW = rawW && rawW.endsWith('|') ? rawW.slice(0, -1) : rawW;

  const getSortPath = (w) => {
    let p = parentMap.get(w);
    if (!p) return w;
    return getSortPath(p) + '>' + w;
  };

  manifest[word] = {
    w: cleanW,
    p: cleanP,
    r: cleanR,
    d: depth,
    path: getSortPath(word),
    src: Array.from(wordSources.get(word) || []).join(',')
  };

  stats.depth_distribution[depth] = (stats.depth_distribution[depth] || 0) + 1;
  if (depth > stats.summary.max_depth) stats.summary.max_depth = depth;

  // Affix Tracking
  if (parentMap.has(word)) {
    const stem = parentMap.get(word);
    const discovered = getAffixes(word, stem);
    discovered.forEach(a => {
      stats.affixes[a] = (stats.affixes[a] || 0) + 1;
    });
  }
});

// Branch Counts
const rootBranchCounts = new Map();
Object.values(manifest).forEach(m => {
  if (m.r !== m.w) {
    const rKey = m.r.toLowerCase();
    rootBranchCounts.set(rKey, (rootBranchCounts.get(rKey) || 0) + 1);
  }
});

stats.summary.total_roots = rootBranchCounts.size;
let totalBranches = 0;
rootBranchCounts.forEach((count, root) => {
  stats.distribution[count] = (stats.distribution[count] || 0) + 1;
  if (count > stats.summary.max_branches) stats.summary.max_branches = count;
  stats.top_roots.push({ root, count });
  totalBranches += count;
});
stats.summary.average_branching = Number((totalBranches / Math.max(1, stats.summary.total_roots)).toFixed(2));
stats.top_roots.sort((a, b) => b.count - a.count);

// 4. Generate Deep Examples (WOW Factor)
console.log('- Preparing deep chain examples...');
const deepCandidates = sortedWords.sort((a, b) => depthMap.get(b) - depthMap.get(a)).slice(0, 500);
deepCandidates.forEach(word => {
  const m = manifest[word];
  if (m.d >= 3) {
    const chain = [m.w];
    let curr = word;
    while (parentMap.has(curr)) {
      curr = parentMap.get(curr);
      chain.unshift(wordToEntry.get(curr));
    }
    const rootKey = chain[0].toLowerCase();
    if (!stats.deep_examples[rootKey] || chain.length > stats.deep_examples[rootKey].length) {
      stats.deep_examples[rootKey] = chain;
    }
  }
});

// 5. Persistence
const manifestPath = 'c:/Users/Ben/Documents/LL/6_ycm/YCM_Citadel/portal/public/data/moe_manifest_moe.json';
const statsPath = 'c:/Users/Ben/Documents/LL/6_ycm/YCM_Citadel/portal/public/data/moe_stats_moe.json';
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));

console.log('- Injecting into DB Table: moe_hierarchy_moe...');
db.transaction(() => {
  db.prepare("DROP TABLE IF EXISTS moe_hierarchy_moe").run();
  db.prepare(`
    CREATE TABLE moe_hierarchy_moe (
      word_ab TEXT PRIMARY KEY,
      parent_word TEXT,
      ultimate_root TEXT,
      depth INTEGER,
      sort_path TEXT,
      sources TEXT
    )
  `).run();
  const insert = db.prepare("INSERT OR REPLACE INTO moe_hierarchy_moe VALUES (?, ?, ?, ?, ?, ?)");
  for (const data of Object.values(manifest)) {
    insert.run(data.w, data.p, data.r, data.d, data.path, data.src);
  }
})();

console.log('✅ STRICT Build Complete.');
