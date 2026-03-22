'use client';

import { KilangState, KilangAction } from './kilangReducer';

export interface MoeEntry {
  id: number;
  word_ab: string;
  definition: string;
  dict_code: string;
  stem?: string;
  parent_word?: string;
  ultimate_root?: string;
  tier?: number | string;
  sort_path?: string;
  [key: string]: any;
}

export interface Derivation extends MoeEntry {
  word_ab: string;
  parentWord: string | null;
  ultimateRoot: string | null;
  tier: number;
  sortPath: string;
  treeRow?: number;
  definitions?: string[];
  allExamples?: any[];
}

export interface KilangRootData {
  word?: string;
  root?: string;
  derivatives: Derivation[];
  totalInDb: number;
  parentStem?: string | null;
  loading: boolean;
  error?: boolean;
  errorMessage?: string;
}

export interface NodeCoordinate {
  x: number;
  y: number;
}

export type NodeMap = Record<string, NodeCoordinate>;

export interface RootStats {
  summary: {
    total_roots: number;
    max_depth: number;
    max_branches: number;
    total_words: number;
    average_branching: number;
    std_dev: number;
  };
  distribution: Record<string, number>;
  depth_distribution: Record<string, number>;
  deep_examples: Record<string, string[]>;
  top_roots: Array<{ root: string; count: number }>;
}

export interface Bookmark {
  id: string;
  root: string;
  type: 'db' | 'custom';
  data: KilangRootData | null;
  timestamp: string;
  count: number;
  isPinned: boolean;
}

export interface SidebarUIState {
  sidebarTab: 'forest' | 'styling' | 'new_mako' | 'custom';
  showMyTrees: boolean;
  showCustomPanel: boolean;
  searchTerm: string;
  branchFilter: string;
  collapsedSections: Record<string, boolean>;
  toast: { message: string, type: 'success' | 'info' } | null;
  animations: {
    showPlusOne: string | null;
    showMinusOne: string | null;
  };
  canvasHoverNode: string | null;
  canvasSelectedNode: string | null;
  tooltipMode: 'hover' | 'fixed';
}

export interface KilangContextProps extends SidebarUIState {
  // Reducer State
  state: KilangState;
  dispatch: React.Dispatch<KilangAction>;
  
  // UI Actions
  setSidebarTab: (tab: 'forest' | 'styling' | 'custom' | 'new_mako') => void;
  setShowMyTrees: (show: boolean) => void;
  toggleSection: (id: string) => void;
  
  // Data Actions
  fetchRootDetails: (root: string) => Promise<void>;
  fetchSummary: (word: string) => Promise<void>;
  
  // Derived / Shared Props
  filteredRoots: Array<{ root: string; count: number }>;
  bucketHits: Record<string, number>;
  FILTER_BUCKETS: Array<{ label: string; min: number; max: number }>;
  summaryCache: Record<string, string[]>;
}
