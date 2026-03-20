import fs from 'fs';
import path from 'path';

const SUMMARY_PATH = 'components/views/kilang/variable_summary.json';
const THEME_BAR_PATH = 'components/views/kilang/components/ThemeBar.tsx';

function verify() {
  console.log('🧪 Starting Design System Sync Verification...\n');

  if (!fs.existsSync(SUMMARY_PATH)) {
    console.error('❌ Error: variable_summary.json not found. Run audit first.');
    return;
  }

  const summary = JSON.parse(fs.readFileSync(SUMMARY_PATH, 'utf-8'));
  const foundVars = Object.keys(summary).filter(v => v.startsWith('--kilang-'));

  const themeBarContent = fs.readFileSync(THEME_BAR_PATH, 'utf-8');
  
  // Extract THEME_VARS array content more robustly
  const startIndex = themeBarContent.indexOf('export const THEME_VARS = [');
  if (startIndex === -1) {
    console.error('❌ Error: Could not find start of THEME_VARS in ThemeBar.tsx');
    return;
  }
  
  const endIndex = themeBarContent.indexOf('];', startIndex);
  if (endIndex === -1) {
    console.error('❌ Error: Could not find end of THEME_VARS in ThemeBar.tsx');
    return;
  }

  const arrayContent = themeBarContent.substring(startIndex, endIndex);
  
  // Use regex to find all quoted strings
  const registeredVars = [...arrayContent.matchAll(/['"](--kilang-.*?)['"]/g)].map(m => m[1]);

  const missingFromThemeBar = foundVars.filter(v => !registeredVars.includes(v));
  const extraInThemeBar = registeredVars.filter(v => !foundVars.includes(v));

  console.log(`📊 Statistics:`);
  console.log(`   - Found in Audit: ${foundVars.length}`);
  console.log(`   - Registered in ThemeBar: ${registeredVars.length}`);
  console.log('');

  if (missingFromThemeBar.length === 0) {
    console.log('✅ ALL AUDITED VARIABLES ARE REGISTERED IN THEMEBAR.');
  } else {
    console.warn(`⚠️  MISSING VARIABLES (${missingFromThemeBar.length}):`);
    missingFromThemeBar.forEach(v => console.log(`   - ${v}`));
  }

  if (extraInThemeBar.length > 0) {
    console.log(`\nℹ️  REGISTERED BUT NOT FOUND IN CODE (${extraInThemeBar.length}):`);
    extraInThemeBar.forEach(v => console.log(`   - ${v} (Likely deprecated or future-proofing)`));
  }
}

verify();
