const sqlite = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

/**
 * MOE BUILDER: STAR (Future Frontiers)
 * 
 * GOAL: Placeholder for advanced morphological analysis (e.g., phonetic drift anchors).
 * STRATEGY: To be defined. Currently clones the Plus manifest for structural parity.
 * 
 * OUTCOMES:
 *   - moe_manifest_star.json
 *   - moe_stats_star.json
 *   - moe_hierarchy_star (Table in DB)
 */

const dbPath = 'C:/Users/Ben/Documents/LL/6_ycm/YCM_Citadel/data/amis_moe_test.db';
const db = new sqlite(dbPath);

console.log('✨ Building STAR (Experimental) Hierarchy...');

// Clone PLUS logic for now
const manifestPathPlus = 'c:/Users/Ben/Documents/LL/6_ycm/YCM_Citadel/portal/public/data/moe_manifest_plus.json';
const statsPathPlus = 'c:/Users/Ben/Documents/LL/6_ycm/YCM_Citadel/portal/public/data/moe_stats_plus.json';

if (fs.existsSync(manifestPathPlus)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPathPlus));
  const stats = JSON.parse(fs.readFileSync(statsPathPlus));

  fs.writeFileSync('c:/Users/Ben/Documents/LL/6_ycm/YCM_Citadel/portal/public/data/moe_manifest_star.json', JSON.stringify(manifest, null, 2));
  fs.writeFileSync('c:/Users/Ben/Documents/LL/6_ycm/YCM_Citadel/portal/public/data/moe_stats_star.json', JSON.stringify(stats, null, 2));

  db.transaction(() => {
    db.prepare("DROP TABLE IF EXISTS moe_hierarchy_star").run();
    db.prepare(`
      CREATE TABLE moe_hierarchy_star (
        word_ab TEXT PRIMARY KEY,
        parent_word TEXT,
        ultimate_root TEXT,
        depth INTEGER
      )
    `).run();
    const insert = db.prepare("INSERT OR REPLACE INTO moe_hierarchy_star VALUES (?, ?, ?, ?)");
    for (const data of Object.values(manifest)) {
      insert.run(data.w, data.p, data.r, data.d);
    }
  })();
  console.log('✅ STAR Build Complete (Cloned from Plus).');
} else {
  console.log('❌ Error: Plus manifest not found. Run moe_builder_plus.js first.');
}
