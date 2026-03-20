'use client';

export const MOE_SOURCES = [
  { id: 'ALL', label: 'MoE (all)', tooltip: 'Ministry of Education Amis Dictionary (Consolidated). Merges all selected authoritative sources into a single morphological view.' },
  { id: 'p', label: '蔡中涵 (p)', tooltip: 'Standard Modern Amis Dictionary by Safolu (蔡中涵). The primary repository for modern Amis usage and standardized definitions.' },
  { id: 'm', label: '吳明義 (m)', tooltip: 'MoE Amis Dictionary by Wu Ming-yi (吳明義). Specialized Chinese definitions focusing on dialectal variations and cultural nuances.' },
  { id: 's', label: '學習詞表 (s)', tooltip: 'Pedagogical: 9-Year & 12-Year Curriculum Word List. Foundational vocabulary used in standardized indigenous language education.' },
  { id: 'a', label: '原住民族 (a)', tooltip: 'Council of Indigenous Peoples (CIP) Glossary. Official administrative and cultural terminology compiled by the Council.' },
  { id: 'old-s', label: 'Old-S (Legacy)', tooltip: 'Legacy archival data from earlier MOE collections. Preserved for comparative linguistic and historical analysis.' },
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
