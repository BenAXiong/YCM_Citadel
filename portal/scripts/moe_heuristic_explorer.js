const sqlite = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = 'C:/Users/Ben/Documents/LL/6_ycm/YCM_Citadel/data/amis_moe_test.db';
const db = new sqlite(dbPath);

/**
 * MOE HEURISTIC EXPLORER (The Searcher)
 * 
 * PURPOSE: 
 * This script is maintained for experimental discovery. It uses aggressive 
 * prefix/suffix matching to find morphological relationships that are NOT 
 * explicitly tagged in the official dictionary data.
 * 
 * USE CASE: 
 * Identifying systematic patterns or missed roots for future dictionary refinement.
 * NOT used for the production Kilang View rendering.
 */

// Load all entries once to build graph and filter
const allEntries = db.prepare("SELECT word_ab, stem FROM moe_entries WHERE word_ab != ''").all();
console.log(`Loaded ${allEntries.length} entries into memory.`);

// 1. Identify all official stems in the database
const officialStems = new Set();
const wordToDbStem = new Map();
const wordToEntry = new Map();

allEntries.forEach(e => {
  const word = (e.word_ab || '').trim().toLowerCase();
  const stemRaw = (e.stem || '').trim().toLowerCase();
  // Normalization: Amis DB stems often look like "root|"
  const stem = stemRaw.endsWith('|') ? stemRaw.slice(0, -1) : stemRaw;

  if (word && !word.includes(' ')) {
    wordToEntry.set(word, (e.word_ab || '').trim());
    if (stem && stem !== word) {
      wordToDbStem.set(word, stem);
      officialStems.add(stem);
    }
  }
});

console.log(`Initialized ${wordToEntry.size} unique words and ${officialStems.size} official stems.`);

// 4. Build Hierarchy
const depthMap = new Map();
const parentMap = new Map();
const branchCountMap = new Map();

// Sort words by length to process from shortest to longest
const sortedWords = [...wordToEntry.keys()].sort((a, b) => a.length - b.length);

console.log('Building hierarchy (Official Stem Priority)...');
for (let i = 0; i < sortedWords.length; i++) {
  const word = sortedWords[i];
  let bestParent = null;

  // PRIORITY 1: Absolute preference for the Database defined stem
  const dbStem = wordToDbStem.get(word);
  if (dbStem && wordToEntry.has(dbStem)) {
     bestParent = dbStem;
  } 

  // PRIORITY 2: Prefixes (Longest Prefix)
  if (!bestParent) {
    for (let j = i - 1; j >= 0; j--) {
       const candidate = sortedWords[j];
       if (word.startsWith(candidate) && word !== candidate) {
          bestParent = candidate;
          break; 
       }
    }
  }

  // PRIORITY 3: Suffixes (ONLY if >= 4 chars or it's an official stem)
  if (!bestParent) {
    for (let j = i - 1; j >= 0; j--) {
       const candidate = sortedWords[j];
       const isOfficial = officialStems.has(candidate);
       if ((candidate.length >= 4 || isOfficial) && word.endsWith(candidate) && word !== candidate) {
          bestParent = candidate;
          break;
       }
    }
  }

  if (bestParent) {
    parentMap.set(word, bestParent);
    depthMap.set(word, (depthMap.get(bestParent) || 1) + 1);
    
    // Increment branch count for all ancestors
    let curr = bestParent;
    while(curr) {
       branchCountMap.set(curr, (branchCountMap.get(curr) || 0) + 1);
       curr = parentMap.get(curr);
    }
  } else {
    depthMap.set(word, 1);
  }
}

const stats = {
  summary: {
    total_roots: 0,
    max_depth: 0,
    max_branches: 0,
    total_words: wordToEntry.size,
    average_branching: 0,
    std_dev: 0
  },
  distribution: {},
  depth_distribution: {},
  deep_examples: {},
  top_roots: []
};

// FINAL REFINEMENT: Define "Semantic Roots"
// 1. Official Database Stems (length >= 3) - Lexical cores.
// 2. Heads >= 4 characters that are the "ultimate ancestor" of a chain.
// This preserves legitimate 3-char roots like 'aca' (official) while 
// killing random string hijackers like 'aka', 'nga' (not official).
const semanticRoots = [...wordToEntry.keys()].filter(w => {
   if (w.length < 3) return false;
   const parent = parentMap.get(w);
   const isOfficial = officialStems.has(w);
   const isUltimate = !parent || parent.length < 3;
   
   if (isOfficial) return (branchCountMap.get(w) || 0) > 0;
   return w.length >= 4 && isUltimate && (branchCountMap.get(w) || 0) > 0;
});

stats.summary.total_roots = semanticRoots.length;

// Final Stats Calculation
wordToEntry.forEach((_, lowWord) => {
   const d = depthMap.get(lowWord);
   stats.depth_distribution[d] = (stats.depth_distribution[d] || 0) + 1;
   if (d > stats.summary.max_depth) stats.summary.max_depth = d;
});

semanticRoots.forEach(root => {
   const branches = branchCountMap.get(root) || 0;
   stats.distribution[branches] = (stats.distribution[branches] || 0) + 1;
   if (branches > stats.summary.max_branches) stats.summary.max_branches = branches;
   stats.top_roots.push({ root: wordToEntry.get(root), count: branches });
});

stats.top_roots.sort((a,b) => b.count - a.count);

// Deep Examples: Find words with highest absolute depth
const deepestWords = [...wordToEntry.keys()].sort((a, b) => depthMap.get(b) - depthMap.get(a)).slice(0, 150);
deepestWords.forEach(word => {
   const chain = [wordToEntry.get(word)];
   let curr = word;
   while(parentMap.get(curr)) {
      curr = parentMap.get(curr);
      chain.unshift(wordToEntry.get(curr));
   }
   if (chain.length >= 4) {
      const rootKey = chain[0];
      if (!stats.deep_examples[rootKey] || chain.length > stats.deep_examples[rootKey].length) {
         stats.deep_examples[rootKey] = chain;
      }
   }
});

stats.summary.average_branching = Number((semanticRoots.reduce((acc, r) => acc + (branchCountMap.get(r) || 0), 0) / semanticRoots.length).toFixed(2));

const outputPath = 'c:/Users/Ben/Documents/LL/6_ycm/YCM_Citadel/portal/public/data/moe_kilang_stats.json';
fs.writeFileSync(outputPath, JSON.stringify(stats, null, 2));

console.log('Stats updated successfully.');
console.log(`Max Depth Found: ${stats.summary.max_depth}`);
console.log(`Total Roots: ${stats.summary.total_roots}`);
