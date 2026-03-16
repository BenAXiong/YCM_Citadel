'use client';

import { KilangState, KilangAction } from './kilangReducer';

export interface Bookmark {
  id: string;
  root: string;
  type: 'db' | 'custom';
  data: any | null; // Detailed tree data for custom trees
  timestamp: string;
  count: number;
  isPinned: boolean;
}

export interface SidebarUIState {
  sidebarTab: 'forest' | 'styling' | 'custom';
  showMyTrees: boolean;
  searchTerm: string;
  branchFilter: string;
  collapsedSections: Record<string, boolean>;
  toast: { message: string, type: 'success' | 'info' } | null;
  animations: {
    showPlusOne: boolean;
    showMinusOne: boolean;
  };
}

export interface KilangContextProps extends SidebarUIState {
  // Reducer State
  state: KilangState;
  dispatch: React.Dispatch<KilangAction>;
  
  // UI Actions
  setSidebarTab: (tab: 'forest' | 'styling' | 'custom') => void;
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
