const sqlite = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

/**
 * MOE BUILDER: PLUS (The Heuristic Engine)
 * 
 * GOAL: Bridge the gaps in MoEDICT using substring and prefix/suffix logic.
 * STRATEGY: Phase 1/Baseline Heuristics.
 * 
 * OUTCOMES:
 *   - moe_manifest_plus.json
 *   - moe_stats_plus.json
 *   - moe_hierarchy_plus (Table in DB)
 */

const dbPath = 'C:/Users/Ben/Documents/LL/6_ycm/YCM_Citadel/data/amis_moe_test.db';
const db = new sqlite(dbPath);

console.log('🏗️ Building MOE Morphological Manifest...');

// 1. Data Ingestion
const allEntries = db.prepare("SELECT word_ab, stem FROM moe_entries WHERE word_ab != ''").all();
console.log(`- Loaded ${allEntries.length} entries from database.`);

const wordToDbStem = new Map();
const wordToEntry = new Map();
const allWordsSet = new Set();
const officialStems = new Set();

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
      officialStems.add(stem);
    }
  }
});

// Sort words by length to ensure parents are found before children
const sortedWords = [...allWordsSet].sort((a, b) => a.length - b.length);

// 2. Hierarchy Building
const parentMap = new Map();
const depthMap = new Map();
const branchCountMap = new Map();

console.log('- Resolving parents (Lexical Priority)...');

for (let i = 0; i < sortedWords.length; i++) {
  const word = sortedWords[i];
  let parent = null;

  // PRIORITY 1: Absolute preference for the Database defined stem
  const dbStem = wordToDbStem.get(word);
  if (dbStem && allWordsSet.has(dbStem)) {
    parent = dbStem;
  }

  // PRIORITY 2: Global Overlap (Longest internal word)
  // We only run this if no DB stem exists OR if we want to bridge gap-filler words
  if (!parent) {
    // Search for longest existing word within this word
    for (let j = i - 1; j >= 0; j--) {
      const candidate = sortedWords[j];
      
      // CRITICAL: Pseudo-Root Protection
      // If a candidate is short (<=3 chars), it ONLY qualifies as a parent if:
      // a) It is an Official Stem in the database
      // b) It is at the START of the word (Prefix logic)
      const isOfficial = officialStems.has(candidate);
      const isPrefix = word.startsWith(candidate);
      
      if (candidate.length >= 3 && word.includes(candidate) && word !== candidate) {
        if (candidate.length > 3 || (isOfficial && isPrefix)) {
          parent = candidate;
          break; 
        }
      }
    }
  }

  if (parent) {
    parentMap.set(word, parent);
    depthMap.set(word, (depthMap.get(parent) || 1) + 1);
    
    // Register branch for parent
    branchCountMap.set(parent, (branchCountMap.get(parent) || 0) + 1);
  } else {
    depthMap.set(word, 1);
  }
}

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
  top_roots: []
};

console.log('- Resolving ultimate anchors...');

sortedWords.forEach(word => {
  let curr = word;
  let chain = [wordToEntry.get(word)];
  
  // Trace back to the beginning of time
  while (parentMap.has(curr)) {
    curr = parentMap.get(curr);
    chain.unshift(wordToEntry.get(curr));
  }

  const ultimateRoot = curr;
  const depth = getDepth(word);

  const rawP = parentMap.has(word) ? wordToEntry.get(parentMap.get(word)) : null;
  const cleanP = rawP && rawP.endsWith('|') ? rawP.slice(0, -1) : rawP;
  const rawR = wordToEntry.get(ultimateRoot);
  const cleanR = rawR && rawR.endsWith('|') ? rawR.slice(0, -1) : rawR;

  const rawW = wordToEntry.get(word);
  const cleanW = rawW && rawW.endsWith('|') ? rawW.slice(0, -1) : rawW;

  manifest[word] = {
    w: cleanW,
    p: cleanP,
    r: cleanR,
    d: depth
  };

  // Stats counters
  stats.depth_distribution[depth] = (stats.depth_distribution[depth] || 0) + 1;
  if (depth > stats.summary.max_depth) stats.summary.max_depth = depth;
});

// Calculate branch counts for roots only
const rootBranchCounts = new Map();
Object.values(manifest).forEach(m => {
  if (m.r !== m.w) {
    rootBranchCounts.set(m.r, (rootBranchCounts.get(m.r) || 0) + 1);
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
    // Reconstruct chain from manifest
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

// Final Output Generation
const manifestPath = 'c:/Users/Ben/Documents/LL/6_ycm/YCM_Citadel/portal/public/data/moe_manifest_plus.json';
const statsPath = 'c:/Users/Ben/Documents/LL/6_ycm/YCM_Citadel/portal/public/data/moe_stats_plus.json';

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));

// 5. Database Injection (The Single Source of Truth Sync)
console.log('- Syncing manifest to Database (moe_hierarchy_plus table)...');

db.transaction(() => {
  db.prepare("DROP TABLE IF EXISTS moe_hierarchy_plus").run();
  db.prepare(`
    CREATE TABLE moe_hierarchy_plus (
      word_ab TEXT PRIMARY KEY,
      parent_word TEXT,
      ultimate_root TEXT,
      depth INTEGER
    )
  `).run();

  const insert = db.prepare("INSERT OR REPLACE INTO moe_hierarchy_plus (word_ab, parent_word, ultimate_root, depth) VALUES (?, ?, ?, ?)");
  
  for (const [word, data] of Object.entries(manifest)) {
    insert.run(data.w, data.p, data.r, data.d);
  }
})();

console.log(`✅ Build & Sync Complete!`);
console.log(`- Manifest: ${manifestPath}`);
console.log(`- Roots found: ${stats.summary.total_roots}`);
console.log(`- Max depth: ${stats.summary.max_depth}`);
