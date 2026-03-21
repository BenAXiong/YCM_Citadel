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
  '--kilang-link-opacity',

  // --- 12 BORDERS ---
  '--kilang-border', '--kilang-primary-border', '--kilang-secondary-border', '--kilang-accent-border',
  '--kilang-tooltip-border', '--kilang-toast-border', '--kilang-glass', '--kilang-border-std',
  '--kilang-ctrl-active-border', '--kilang-muted-border', '--kilang-scrollbar-border',
  '--kilang-shadow-primary',
  '--kilang-border-w-std', '--kilang-border-w-resizer',

  // --- 10 TEXT ---
  '--kilang-text', '--kilang-text-muted', '--kilang-primary-text', '--kilang-secondary-text', '--kilang-accent-text',
  '--kilang-logo-text', '--kilang-ctrl-active-text', '--kilang-tooltip-text', '--kilang-toast-text', '--kilang-metric-text',
  
  // --- CONNECTORS & LINKS ---
  '--kilang-link-start', '--kilang-link-mid', '--kilang-link-end', '--kilang-link-opacity',
  '--kilang-link-width', '--kilang-link-blur', '--kilang-link-flow-speed'
];

export interface ThemePreset {
  id: string;
  label: string;
  color: string;
  config?: Partial<any>; // layoutConfig partial
}

export const THEME_PRESETS: ThemePreset[] = [
  { 
    id: 'kakarayan', 
    label: 'Kakarayan', 
    color: '#3b82f6',
    config: { 
      lineColor: '#0ea5e9', 
      lineColorMid: '#06b6d4', 
      lineGradientEnd: '#8b5cf6',
      fontFamily: 'Inter',
      fontSize: 14
    }
  },
  { id: 'papah', label: 'Papah', color: '#10b981', config: { lineColor: '#10b981', fontFamily: 'Inter' } },
  { id: 'ngidan', label: 'Ngidan', color: '#6366f1', config: { lineColor: '#6366f1', fontFamily: 'Inter' } },
  { id: '4', label: '4', color: '#000000', config: { lineColor: '#ffffff', lineOpacity: 0.1, fontFamily: 'Inter' } },
  { id: '5', label: '5', color: '#ffffff', config: { lineColor: '#000000', lineOpacity: 0.1, fontFamily: 'Inter' } },
  { id: 'cudad', label: 'Cudad', color: '#949494', config: { lineColor: '#949494', fontFamily: 'Inter' } },
  { 
    id: 'pasiwali', 
    label: 'Pasiwali', 
    color: '#f6d13b',
    config: { 
      lineColor: '#f6d13b', 
      lineColorMid: '#f6a13b', 
      lineGradientEnd: '#f63b3b',
      fontFamily: 'Outfit',
      fontSize: 15
    }
  },
  { 
    id: 'matrix', 
    label: 'Matrix', 
    color: '#00ff00',
    config: { 
      lineColor: '#00ff00', 
      lineColorMid: '#00ff00', 
      lineGradientEnd: '#00ff00',
      lineWidth: 1.5,
      lineOpacity: 0.8,
      lineBlur: 0,
      lineFlowSpeed: 4,
      lineDashArray: 8,
      nodeIntensity: 0.9,
      fontFamily: 'JetBrains Mono',
      fontSize: 12
    }
  },
  { id: 'picudadan', label: 'Picudadan', color: '#f63b3b', config: { lineColor: '#f63b3b', fontFamily: 'Inter' } },
  { id: 'rainbow', label: 'Rainbow', color: '#f63b3b', config: { lineColor: '#ff0000', fontFamily: 'Inter' } },
  { id: '11', label: 'Noir', color: '#000000', config: { lineColor: '#ffffff', fontFamily: 'Inter' } },
  { id: '12', label: 'Blanc', color: '#ffffff', config: { lineColor: '#000000', fontFamily: 'Inter' } },
  { id: 'new', label: 'new', color: '#ffffff', config: { lineColor: '#ffffff', fontFamily: 'Inter' } }
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
