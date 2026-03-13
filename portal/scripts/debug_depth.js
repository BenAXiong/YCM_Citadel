const sqlite = require('better-sqlite3');
const dbPath = 'C:/Users/Ben/Documents/LL/6_ycm/YCM_Citadel/data/amis_moe_test.db';
const db = new sqlite(dbPath);

const sql = `
WITH RECURSIVE tree AS (
  SELECT word_ab, stem, 1 as depth 
  FROM moe_entries 
  WHERE stem IS NULL OR stem = ''
  
  UNION ALL
  
  SELECT e.word_ab, e.stem, t.depth + 1
  FROM moe_entries e
  JOIN tree t ON LOWER(e.stem) = LOWER(t.word_ab)
  WHERE t.depth < 10
)
SELECT MAX(depth) as max_depth, COUNT(*) as total_rows
FROM tree;
`;

console.log(db.prepare(sql).get());

const sampleSql = `
WITH RECURSIVE tree AS (
  SELECT word_ab, stem, 1 as depth 
  FROM moe_entries 
  WHERE stem IS NULL OR stem = ''
  
  UNION ALL
  
  SELECT e.word_ab, e.stem, t.depth + 1
  FROM moe_entries e
  JOIN tree t ON LOWER(e.stem) = LOWER(t.word_ab)
  WHERE t.depth < 10
)
SELECT * FROM tree WHERE depth >= 4 LIMIT 10;
`;
console.log('Sample deep rows:');
console.log(db.prepare(sampleSql).all());
