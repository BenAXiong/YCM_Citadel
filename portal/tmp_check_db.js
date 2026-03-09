
const Database = require('better-sqlite3');
const path = require('path');

const GLID_FAMILIES = {
    "01": ["南勢阿美語", "秀姑巒阿美語", "海岸阿美語", "馬蘭阿美語", "恆春阿美語", "阿美語"],
    "02": ["賽考利克泰雅語", "澤敖利泰雅語", "汶水泰雅語", "萬大泰雅語", "賽考利克太魯閣語", "斯卡羅泰雅語", "泰雅語"],
    "03": ["南排灣語", "中排灣語", "北排灣語", "東排灣語", "排灣語"],
    "04": ["卓群布農語", "卡群布農語", "丹群布農語", "巒群布農語", "郡群布農語", "布農語"],
    "05": ["南王卑南語", "知本卑南語", "西群卑南語", "建和卑南語", "卑南語"],
    "06": ["霧台魯凱語", "茂林魯凱語", "多納魯凱語", "東魯凱語", "萬山魯凱語", "大武魯凱語", "魯凱語"],
    "07": ["鄒語"],
    "08": ["賽夏語"],
    "09": ["雅美語"],
    "10": ["邵語"],
    "11": ["噶瑪蘭語"],
    "12": ["太魯閣語"],
    "13": ["撒奇萊雅語"],
    "14": ["德固達雅賽德克語", "都達賽德克語", "德鹿谷賽德克語", "都達語", "賽德克語", "德鹿谷語", "德固達雅語"],
    "15": ["拉阿魯哇語"],
    "16": ["卡那卡那富語"],
};

// Map each dialect name to its GLID
const DIALECT_TO_GLID = {};
for (const [glid, dialects] of Object.entries(GLID_FAMILIES)) {
    for (const d of dialects) {
        DIALECT_TO_GLID[d] = glid;
    }
}

const dbPath = path.resolve(__dirname, '../export/games_master.db');
const db = new Database(dbPath, { readonly: true });

console.log(`Checking DB at: ${dbPath}`);

const rows = db.prepare(`
    SELECT s.id, s.zh, s.ab, s.glid, o.dialect_name, o.source, o.level, o.category
    FROM sentences s
    JOIN occurrences o ON s.id = o.sentence_id
    LIMIT 200000
`).all();

let mismatches = 0;
for (const row of rows) {
    const expectedGlid = row.glid;
    const actualGlid = DIALECT_TO_GLID[row.dialect_name];

    if (actualGlid && expectedGlid !== actualGlid && expectedGlid !== 'UNKNOWN') {
        if (mismatches < 50) {
            console.log(`[MISMATCH] SID: ${row.id} Expected [${expectedGlid}] Got Dialect: ${row.dialect_name} (belongs to [${actualGlid}]) Source: ${row.source}`);
            console.log(`  ZH: ${row.zh}`);
            console.log(`  AB: ${row.ab}`);
        }
        mismatches++;
    }
}

console.log(`Total CROSS-FAMILY mismatches found in first 200k rows: ${mismatches}`);
