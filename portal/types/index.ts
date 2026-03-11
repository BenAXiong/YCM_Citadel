export type Theme = string;

export interface UIStrings {
  hub: string;
  all: string;
  none: string;
  search: string;
  level: string;
  lesson: string;
  stdSpelling: string;
  showFull: string;
  module: string;
  allRealms: string;
  ilrdf: string;
  nineYear: string;
  grmpts: string;
  essay: string;
  dialogue: string;
  twelve: string;
  switchMode: string;
  semantics: string;
  waitingMode1: string;
  waitingMode2: string;
  sentence: string;
  recent: string;
  clear: string;
  copied: string;
  loadMore: string;
  presets: string;
  manage: string;
  hideEmpty: string;
  dict: string;
  examples: string;
  exams: string;
  flashcards: string;
}

export type UILang = "en" | "zh";

export interface Sentence {
  id: string;
  zh: string;
  [key: string]: any;
}

export interface RawDbRow {
  [key: string]: any;
}

export interface DbInfo {
  row_count: number;
  last_updated: string;
  [key: string]: any;
}

export interface SavedFilter {
  name: string;
  dialects: string[];
}
