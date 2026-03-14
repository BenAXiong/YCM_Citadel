export type MorphMode = 'moe' | 'plus' | 'star';
export type LayoutDirection = 'horizontal' | 'vertical';
export type LayoutArrangement = 'aligned' | 'flow';

import { RootStats, KilangRootData } from './kilangUtils';

export interface KilangState {
  // Global Data
  stats: any | null;
  manifest: any | null;
  loading: boolean;
  
  // Selection & Tree Data
  selectedRoot: string | null;
  rootData: any | null;
  summaryCache: Record<string, string[]>;
  
  // Configuration
  morphMode: MorphMode;
  sourceFilter: string;
  
  // Layout
  direction: LayoutDirection;
  arrangement: LayoutArrangement;
  scale: number;
  isFit: boolean;
  
  // UI State
  searchTerm: string;
  branchFilter: string | 'all';
  showStatsOverlay: boolean;
  visibleChainsCount: number;
  exporting: boolean;
  fitTransform: { x: number; y: number; scale: number };
  layoutConfig: {
    showToolbox: boolean;
    lineGapX: number;
    lineGapY: number;
    interTierGap: number;
    interRowGap: number;
    nodeSize: number;
    nodeOpacity: number;
    nodeRounding: number;
    rootColor: string;
    branchColor: string;
    lineColor: string;
    lineColorMid: string;
    lineGradientEnd: string;
    showIcons: boolean;
    nodeWidth: number;
    nodePaddingY: number;
  };
}

export type KilangAction =
  | { type: 'SET_GLOBAL_DATA'; stats: any; manifest: any }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ROOT'; root: string }
  | { type: 'SET_ROOT_DATA'; data: any }
  | { type: 'SET_SUMMARY'; word: string; definitions: string[] }
  | { type: 'SET_CONFIG'; morphMode?: MorphMode; sourceFilter?: string }
  | { type: 'SET_LAYOUT'; direction?: LayoutDirection; arrangement?: LayoutArrangement }
  | { type: 'SET_TRANSFORM'; scale?: number; isFit?: boolean }
  | { type: 'SET_FIT_TRANSFORM'; transform: { x: number; y: number; scale: number } }
  | { type: 'SET_LAYOUT_CONFIG'; config: Partial<KilangState['layoutConfig']> }
  | { type: 'RESET_LAYOUT_CONFIG' }
  | { type: 'SET_UI'; searchTerm?: string; branchFilter?: string | 'all'; showStatsOverlay?: boolean; visibleChainsCount?: number; exporting?: boolean };

export const initialState: KilangState = {
  stats: null,
  manifest: null,
  loading: true,
  selectedRoot: null,
  rootData: null,
  summaryCache: {},
  morphMode: 'moe',
  sourceFilter: 'ALL',
  direction: 'horizontal',
  arrangement: 'aligned', // Default Aligned
  scale: 1,
  isFit: false,
  searchTerm: '',
  branchFilter: 'all',
  showStatsOverlay: false,
  visibleChainsCount: 10,
  exporting: false,
  fitTransform: { x: 0, y: 0, scale: 1 },
  layoutConfig: {
    showToolbox: true,
    lineGapX: 50,
    lineGapY: 50,
    interTierGap: 100,
    interRowGap: 50,
    nodeSize: 1,
    nodeOpacity: 1,
    nodeRounding: 16,
    rootColor: '#2563eb',
    branchColor: '#3b82f6',
    lineColor: '#3b82f6',   
    lineColorMid: '#6366f1',
    lineGradientEnd: '#10b981', 
    showIcons: false,
    nodeWidth: 100,
    nodePaddingY: 8,
  },
};

export function kilangReducer(state: KilangState, action: KilangAction): KilangState {
  switch (action.type) {
    case 'SET_GLOBAL_DATA':
      return { 
        ...state, 
        stats: action.stats, 
        manifest: action.manifest, 
        loading: false,
        selectedRoot: null,
        rootData: null 
      };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_ROOT':
      return { ...state, selectedRoot: action.root, rootData: { loading: true } };
    case 'SET_ROOT_DATA':
      return { ...state, rootData: action.data };
    case 'SET_SUMMARY':
      return { 
        ...state, 
        summaryCache: { ...state.summaryCache, [action.word.toLowerCase()]: action.definitions } 
      };
    case 'SET_CONFIG':
      return { 
        ...state, 
        ...(action.morphMode && { morphMode: action.morphMode }),
        ...(action.sourceFilter && { sourceFilter: action.sourceFilter })
      };
    case 'SET_LAYOUT':
      return { 
        ...state, 
        ...(action.direction && { direction: action.direction }),
        ...(action.arrangement && { arrangement: action.arrangement })
      };
    case 'SET_TRANSFORM':
      return { 
        ...state, 
        ...(action.scale !== undefined && { scale: action.scale }),
        ...(action.isFit !== undefined && { isFit: action.isFit })
      };
    case 'SET_FIT_TRANSFORM':
      return { ...state, fitTransform: action.transform };
    case 'SET_LAYOUT_CONFIG':
      return { ...state, layoutConfig: { ...state.layoutConfig, ...action.config } };
    case 'RESET_LAYOUT_CONFIG':
      return { 
        ...state, 
        layoutConfig: initialState.layoutConfig
      };
    case 'SET_UI':
      return { ...state, ...action };
    default:
      return state;
  }
}
