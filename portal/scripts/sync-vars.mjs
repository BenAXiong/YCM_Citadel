import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_DIR = path.resolve(__dirname, '../components/views/kilang');
const TARGET_FILE = path.resolve(__dirname, '../components/views/kilang/components/VariableMap.tsx');

const VAR_PATTERN = /--kilang-[\w-]+/g;
const MANIFEST = {};

// Helper to categorize variables
const getGroup = (name) => {
  if (name.includes('-tier-')) return 'node';
  if (name.includes('-text') || name.includes('-logo') || name.includes('-metric')) return 'text';
  if (name.includes('-border') || name.includes('-glass') || name.includes('-scrollbar')) return 'border';
  return 'surface';
};

function scan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scan(fullPath);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.css')) {
      if (entry.name === 'VariableMap.tsx' || entry.name === 'sync-vars.mjs') continue;
      
      const content = fs.readFileSync(fullPath, 'utf-8');
      const matches = content.match(VAR_PATTERN);
      if (matches) {
        const relPath = path.relpath ? path.relative(BASE_DIR, fullPath) : fullPath.replace(BASE_DIR + path.sep, '');
        matches.forEach(m => {
          if (!MANIFEST[m]) MANIFEST[m] = { count: 0, files: new Set(), group: getGroup(m) };
          MANIFEST[m].count++;
          MANIFEST[m].files.add(relPath);
        });
      }
    }
  }
}

console.log('🔍 Auditing Kilang Design System variables...');
scan(BASE_DIR);

// Format for VariableMap.tsx
const manifestEntries = Object.entries(MANIFEST)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([name, data]) => {
    const files = JSON.stringify(Array.from(data.files).sort());
    return `  "${name}": { group: '${data.group === 'node' ? (name.includes('fill') ? 'surface' : name.includes('border') ? 'border' : 'text') : data.group}', count: ${data.count}, files: ${files} }`;
  });

const manifestCode = `const VARIABLE_MANIFEST: Record<string, { count: number, files: string[], group: 'surface' | 'border' | 'text' }> = {\n${manifestEntries.join(',\n')}\n};`;

console.log(`📝 Updating ${TARGET_FILE}...`);
let content = fs.readFileSync(TARGET_FILE, 'utf-8');
content = content.replace(/const VARIABLE_MANIFEST: Record<string, \{ count: number, files: string\[\], group: 'surface' \| 'border' \| 'text' \}> = \{[\s\S]*?\};/, manifestCode);

fs.writeFileSync(TARGET_FILE, content);
console.log('✅ Update complete! Run "npm run dev" to see changes in the UI.');
