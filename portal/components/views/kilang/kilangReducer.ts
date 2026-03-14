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
  lineStyle: 'classic' | 'shrunk';
  
  // UI State
  searchTerm: string;
  branchFilter: string | 'all';
  showStatsOverlay: boolean;
  visibleChainsCount: number;
  exporting: boolean;
  fitTransform: { x: number; y: number; scale: number };
  layoutConfig: {
    lineGapX: number;
    lineGapY: number;
    interTierGap: number;
    interRowGap: number;
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
  | { type: 'TOGGLE_LINE_STYLE' }
  | { type: 'SET_LAYOUT_CONFIG'; config: Partial<KilangState['layoutConfig']> }
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
  arrangement: 'flow',
  scale: 1,
  isFit: false,
  lineStyle: 'shrunk',
  searchTerm: '',
  branchFilter: 'all',
  showStatsOverlay: false,
  visibleChainsCount: 10,
  exporting: false,
  fitTransform: { x: 0, y: 0, scale: 1 },
  layoutConfig: {
    lineGapX: 120,    // Default Shrunk
    lineGapY: 50,     // Default Shrunk
    interTierGap: 150, // Default GUTTER_H
    interRowGap: 40    // Default GUTTER_V
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
    case 'TOGGLE_LINE_STYLE': {
      const isClassic = state.lineStyle === 'classic';
      return { 
        ...state, 
        lineStyle: isClassic ? 'shrunk' : 'classic',
        layoutConfig: {
          ...state.layoutConfig,
          lineGapX: isClassic ? 120 : 60,
          lineGapY: isClassic ? 50 : 25
        }
      };
    }
    case 'SET_LAYOUT_CONFIG':
      return { ...state, layoutConfig: { ...state.layoutConfig, ...action.config } };
    case 'SET_UI':
      return { ...state, ...action };
    default:
      return state;
  }
}
