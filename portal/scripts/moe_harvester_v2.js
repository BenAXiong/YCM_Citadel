const sqlite = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

/**
 * MOE HARVESTER V2: RECURSIVE DEEP SCAN
 * 
 * TARGET: Wu Ming-yi (Source M / Orange)
 * STRATEGY: Recursive prefix probing to bypass the MoEDICT "4-character search limit".
 * REASON: GitHub mirror is empty; Live Website API is the only complete source.
 */

const dbPath = 'C:/Users/Ben/Documents/LL/6_ycm/YCM_Citadel/data/amis_moe_test.db';
const db = new sqlite(dbPath);

const BASE_URL = 'https://new-amis.moedict.tw/api/v2';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

const alphabet = "abcdefghiklmnopqrstuwxy'^ ".split(""); // Custom alphabet for Amis

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 1. Recursive Index Discovery
async function discoverIndex() {
    const slugs = new Set();
    const statePath = 'moe_harvest_deep_state.json';
    let queue = [...alphabet];
    let processed = new Set();

    if (fs.existsSync(statePath)) {
        try {
            const state = JSON.parse(fs.readFileSync(statePath));
            state.slugs.forEach(s => slugs.add(s));
            queue = state.queue || queue;
            processed = new Set(state.processed || []);
            console.log(`- Resuming harvest. Found ${slugs.size} slugs. Queue size: ${queue.length}.`);
        } catch (e) {
            console.log("- State file invalid, starting fresh.");
        }
    }

    console.log('🔍 Starting Recursive Deep Scan of MoEDICT Index...');

    while (queue.length > 0) {
        const prefix = queue.shift();
        if (processed.has(prefix)) continue;

        try {
            process.stdout.write(`  - Probing: [${prefix}] ... `);
            const res = await fetch(`${BASE_URL}/searches/${encodeURIComponent(prefix)}`, {
                headers: { 'User-Agent': USER_AGENT }
            });
            
            if (!res.ok) {
                console.log(`Failed (HTTP ${res.status})`);
                continue;
            }

            const data = await res.json();
            const results = Array.isArray(data) ? data : [];
            console.log(`${results.length} matches.`);

            results.forEach(item => {
                if (item.term) slugs.add(item.term);
            });

            // If we find many results or the prefix is short, expand deeper to find hidden stems
            // The API limits results, so expansion ensures we reach the "leaf" words.
            if (results.length > 40 || prefix.length < 3) {
                for (const char of alphabet) {
                    const nextNode = prefix + char;
                    if (!processed.has(nextNode) && !queue.includes(nextNode)) {
                        queue.push(nextNode);
                    }
                }
            }

            processed.add(prefix);

            // Periodic save
            if (processed.size % 10 === 0) {
                fs.writeFileSync(statePath, JSON.stringify({
                    slugs: Array.from(slugs),
                    queue: queue,
                    processed: Array.from(processed)
                }));
            }

            await sleep(250); // Politeness limit
        } catch (err) {
            console.error(`\n  ❌ Error on prefix [${prefix}]: ${err.message}`);
            // Re-queue on network error
            queue.unshift(prefix);
            await sleep(2000);
        }
    }

    return Array.from(slugs);
}

// 2. Term Definitions Harvesting
async function harvestDefinitions(slugs) {
    console.log(`🚀 Harvesting definitions for ${slugs.length} discovered terms...`);
    
    // Check existing coverage for Wu Ming-yi
    const existing = new Set(
        db.prepare("SELECT word_ab FROM moe_entries WHERE dict_code LIKE '%吳明義%'").all().map(r => r.word_ab.toLowerCase())
    );

    const insertStmt = db.prepare(`
        INSERT INTO moe_entries (dict_code, word_ab, definition, stem, examples_json, dialect_name)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    let count = 0;
    for (const slug of slugs) {
        if (existing.has(slug.toLowerCase())) continue;

        try {
            const res = await fetch(`${BASE_URL}/terms/${encodeURIComponent(slug)}`, {
                headers: { 'User-Agent': USER_AGENT }
            });
            
            if (!res.ok) continue;
            const dataList = await res.json();
            if (!Array.isArray(dataList)) continue;

            for (const item of dataList) {
                const dictName = item.dictionary || 'Wu Ming-yi';
                // Only ingest if it matches the target (Orange Source)
                if (!dictName.includes('吳明義')) continue;

                const word = item.name || slug;
                const stemRaw = item.stem || '';
                const stem = stemRaw.trim().toLowerCase().replace(/\|$/, '');
                const definitions = (item.descriptions || []).map(d => d.content_zh || d.content).join('; ');
                
                const examples = (item.descriptions || [])
                    .filter(d => d.example || d.example_zh)
                    .map(d => ({ ab: d.example, zh: d.example_zh }));

                insertStmt.run(
                    dictName,
                    word,
                    definitions,
                    stem,
                    JSON.stringify(examples),
                    '阿美語 (Wu)'
                );
            }

            count++;
            if (count % 25 === 0) {
                console.log(`  - Collected ${count} new Source M definitions (Latest: ${slug})`);
            }
            
            await sleep(200);
        } catch (err) {
            console.error(`  ❌ Failed definition [${slug}]: ${err.message}`);
        }
    }

    console.log(`\n✅ HARVEST COMPLETE.`);
    console.log(`Total New Wu Ming-yi Entries: ${count}`);
}

async function run() {
    console.log('--- MOEDICT SOURCE M RECOVERY ENGINE ---');
    const slugs = await discoverIndex();
    await harvestDefinitions(slugs);
}

run();
