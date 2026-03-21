'use client';

export const MOE_SOURCES = [
  { id: 'ALL', label: 'MoE (all)', tooltip: 'Ministry of Education Amis Dictionary (Consolidated). Merges all selected authoritative sources into a single morphological view.' },
  { id: 'p', label: '蔡中涵 (p)', tooltip: 'Standard Modern Amis Dictionary by Safolu (蔡中涵). The primary repository for modern Amis usage and standardized definitions.' },
  { id: 'm', label: '吳明義 (m)', tooltip: 'MoE Amis Dictionary by Wu Ming-yi (吳明義). Specialized Chinese definitions focusing on dialectal variations and cultural nuances.' },
  { id: 's', label: '學習詞表 (s)', tooltip: 'Pedagogical: 9-Year & 12-Year Curriculum Word List. Foundational vocabulary used in standardized indigenous language education.' },
  { id: 'a', label: '原住民族 (a)', tooltip: 'Council of Indigenous Peoples (CIP) Glossary. Official administrative and cultural terminology compiled by the Council.' },
  { id: 'old-s', label: 'Old-S (Legacy)', tooltip: 'Legacy archival data from earlier MOE collections. Preserved for comparative linguistic and historical analysis.' },
];

export const THEME_VARS = [
  // --- 14 SURFACES ---
  '--kilang-bg-base', '--kilang-bg', '--kilang-card', '--kilang-primary-bg', '--kilang-secondary-bg', '--kilang-accent-bg',
  '--kilang-tooltip-bg', '--kilang-toast-bg', '--kilang-primary-glow', '--kilang-secondary-glow', '--kilang-accent-glow',
  '--kilang-ctrl-active', '--kilang-overlay-bg', '--kilang-input-bg',
  '--kilang-ctrl-bg', '--kilang-shadow-color',
  '--kilang-background-secondary', '--kilang-primary', '--kilang-secondary', '--kilang-accent',
  '--kilang-primary-active', '--kilang-tooltip-accent', '--kilang-resizer-hover', '--kilang-resizer-active',
  '--kilang-radius-sm', '--kilang-radius-base', '--kilang-radius-md', '--kilang-radius-lg', '--kilang-radius-display',
  '--kilang-link-start', '--kilang-link-mid', '--kilang-link-end', '--kilang-link-opacity',

  // --- 12 BORDERS ---
  '--kilang-border', '--kilang-primary-border', '--kilang-secondary-border', '--kilang-accent-border',
  '--kilang-tooltip-border', '--kilang-toast-border', '--kilang-glass', '--kilang-border-std',
  '--kilang-ctrl-active-border', '--kilang-muted-border', '--kilang-node-border', '--kilang-scrollbar-border',
  '--kilang-shadow-primary',
  '--kilang-border-w-std', '--kilang-border-w-resizer', '--kilang-border-w-root', '--kilang-border-w-accent',

  // --- 10 TEXT ---
  '--kilang-text', '--kilang-text-muted', '--kilang-primary-text', '--kilang-secondary-text', '--kilang-accent-text',
  '--kilang-logo-text', '--kilang-ctrl-active-text', '--kilang-tooltip-text', '--kilang-toast-text', '--kilang-metric-text',

  // --- 27 TREE TIERS ---
  '--kilang-tier-1-fill', '--kilang-tier-1-border', '--kilang-tier-1-text',
  '--kilang-tier-2-fill', '--kilang-tier-2-border', '--kilang-tier-2-text',
  '--kilang-tier-3-fill', '--kilang-tier-3-border', '--kilang-tier-3-text',
  '--kilang-tier-4-fill', '--kilang-tier-4-border', '--kilang-tier-4-text',
  '--kilang-tier-5-fill', '--kilang-tier-5-border', '--kilang-tier-5-text',
  '--kilang-tier-6-fill', '--kilang-tier-6-border', '--kilang-tier-6-text',
  '--kilang-tier-7-fill', '--kilang-tier-7-border', '--kilang-tier-7-text',
  '--kilang-tier-8-fill', '--kilang-tier-8-border', '--kilang-tier-8-text',
  '--kilang-tier-9-fill', '--kilang-tier-9-border', '--kilang-tier-9-text'
];

export const FILTER_BUCKETS = [
  { label: '1', min: 1, max: 1 },
  { label: '2', min: 2, max: 2 },
  { label: '3', min: 3, max: 3 },
  { label: '4-5', min: 4, max: 5 },
  { label: '6-10', min: 6, max: 10 },
  { label: '11-20', min: 11, max: 20 },
  { label: '21-50', min: 21, max: 50 },
  { label: '51-80', min: 51, max: 80 },
  { label: '80+', min: 81, max: 1000 },
];
