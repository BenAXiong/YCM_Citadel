export type MorphMode = 'moe' | 'plus' | 'star';
export type LayoutDirection = 'horizontal' | 'vertical';
export type LayoutArrangement = 'aligned' | 'flow';

import { RootStats, KilangRootData } from './KilangTypes';

const ANCHOR_DEFAULTS = {
  horizontal: { x: 2000, y: 2000 },
  vertical: { x: 2000, y: 2000 }
};

export interface KilangState {
  // Global Data
  stats: any | null;
  manifest: any | null;
  loading: boolean;

  // Selection & Tree Data
  selectedRoot: string | null;
  rootData: any | null;
  summaryCache: Record<string, string[]>;
  sourceCounts: Record<string, { r: number; e: number }>;
  sidebarWidth: number;
  customData: any[] | null;

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
  showAffixesOverlay: boolean;
  visibleChainsCount: number;
  exporting: boolean;
  showDevTools: boolean;
  showStats: boolean;
  showDimensions: boolean;
  showPerfMonitor: boolean;
  showFilterPanel: boolean;
  sidebarCollapsed: boolean;
  sidebarTab: 'forest' | 'styling' | 'custom';
  fitTransform: { x: number; y: number; scale: number };
  canvasHoverNode: string | null;
  canvasSelectedNode: string | null;
  resetToken: number;
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
    anchorX: number;
    anchorY: number;
    // Tier Aesthetics (Fill & Border)
    tier1Fill: string; tier1Border: string;
    tier2Fill: string; tier2Border: string;
    tier3Fill: string; tier3Border: string;
    tier4Fill: string; tier4Border: string;
    tier5Fill: string; tier5Border: string;
    tier6Fill: string; tier6Border: string;
    tier7Fill: string; tier7Border: string;
    tier8Fill: string; tier8Border: string;
    tier9Fill: string; tier9Border: string;
    spacingMode: 'even' | 'log';
    rootGap: number;
    coupleGaps: boolean;
    lineWidth: number;
  };
}

export type KilangAction =
  | { type: 'SET_GLOBAL_DATA'; stats: any; manifest: any }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ROOT'; root: string }
  | { type: 'SET_ROOT_DATA'; data: any }
  | { type: 'SET_SUMMARY'; word: string; definitions: string[] }
  | { type: 'SET_SOURCE_COUNTS'; counts: Record<string, { r: number; e: number }>; total: { r: number; e: number } }
  | { type: 'SET_CUSTOM_DATA'; data: any | null }
  | { type: 'SET_CONFIG'; morphMode?: MorphMode; sourceFilter?: string }
  | { type: 'SET_LAYOUT'; direction?: LayoutDirection; arrangement?: LayoutArrangement }
  | { type: 'SET_TRANSFORM'; scale?: number; isFit?: boolean }
  | { type: 'SET_FIT_TRANSFORM'; transform: { x: number; y: number; scale: number } }
  | { type: 'SET_LAYOUT_CONFIG'; config: Partial<KilangState['layoutConfig']> }
  | { type: 'RESET_LAYOUT_CONFIG' }
  | { type: 'SET_UI'; searchTerm?: string; branchFilter?: string | 'all'; showStatsOverlay?: boolean; showAffixesOverlay?: boolean; visibleChainsCount?: number; exporting?: boolean; showDevTools?: boolean; showStats?: boolean; showDimensions?: boolean; showPerfMonitor?: boolean; showFilterPanel?: boolean; sidebarCollapsed?: boolean; sidebarTab?: 'forest' | 'styling' | 'custom' }
  | { type: 'SET_CANVAS_HOVER'; node: string | null }
  | { type: 'SET_CANVAS_SELECT'; node: string | null }
  | { type: 'SET_SIDEBAR_WIDTH'; width: number }
  | { type: 'RESET_TRANSFORM' };

export const initialState: KilangState = {
  stats: null,
  manifest: null,
  loading: true,
  selectedRoot: null,
  rootData: null,
  customData: null,
  summaryCache: {},
  sourceCounts: {},
  sidebarWidth: 328, // w-82 equivalent
  morphMode: 'plus', //strict = moe
  sourceFilter: 'ALL',
  direction: 'horizontal',
  arrangement: 'aligned', // Default Aligned
  scale: 1,
  isFit: false,
  searchTerm: '',
  branchFilter: 'all',
  showStatsOverlay: false,
  showAffixesOverlay: false,
  visibleChainsCount: 10,
  exporting: false,
  showDevTools: false,
  showStats: true,
  showDimensions: true,
  showPerfMonitor: false,
  showFilterPanel: true,
  sidebarCollapsed: false,
  sidebarTab: 'forest',
  fitTransform: { x: 0, y: 0, scale: 1 },
  canvasHoverNode: null,
  canvasSelectedNode: null,
  resetToken: 0,
  layoutConfig: {
    showToolbox: false,
    lineGapX: 0,
    lineGapY: 0,
    interTierGap: 80,
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
    anchorX: ANCHOR_DEFAULTS.horizontal.x,
    anchorY: ANCHOR_DEFAULTS.horizontal.y,
    tier1Fill: '#2563eb', tier1Border: '#3b82f6',
    tier2Fill: '#3b82f6', tier2Border: '#60a5fa',
    tier3Fill: '#6366f1', tier3Border: '#818cf8',
    tier4Fill: '#10b981', tier4Border: '#34d399',
    tier5Fill: '#f59e0b', tier5Border: '#fbbf24',
    tier6Fill: '#ec4899', tier6Border: '#f472b6',
    tier7Fill: '#8b5cf6', tier7Border: '#a78bfa',
    tier8Fill: '#06b6d4', tier8Border: '#22d3ee',
    tier9Fill: '#94a3b8', tier9Border: '#cbd5e1',
    spacingMode: 'log',
    rootGap: 50,
    coupleGaps: false,
    lineWidth: 3,
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
    case 'SET_SOURCE_COUNTS':
      const totalR = action.total.r;
      const totalE = action.total.e;
      const branching = totalR > 0 ? (totalE / totalR).toFixed(2) : 0;

      return {
        ...state,
        sourceCounts: action.counts,
        stats: state.stats ? {
          ...state.stats,
          summary: {
            ...state.stats.summary,
            total_roots: totalR,
            total_words: totalE,
            average_branching: Number(branching)
          }
        } : null
      };
    case 'SET_CUSTOM_DATA':
      return {
        ...state,
        customData: action.data,
        selectedRoot: action.data?.root || null,
        rootData: action.data
      };
    case 'SET_CONFIG':
      return {
        ...state,
        ...(action.morphMode && { morphMode: action.morphMode }),
        ...(action.sourceFilter && { sourceFilter: action.sourceFilter })
      };
    case 'SET_LAYOUT':
      if (action.direction && action.direction !== state.direction) {
        return {
          ...state,
          direction: action.direction,
          layoutConfig: {
            ...state.layoutConfig,
            anchorX: ANCHOR_DEFAULTS[action.direction].x,
            anchorY: ANCHOR_DEFAULTS[action.direction].y,
          },
          ...(action.arrangement && { arrangement: action.arrangement })
        };
      }
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
      const modeDefaults = ANCHOR_DEFAULTS[state.direction];
      return {
        ...state,
        layoutConfig: {
          ...initialState.layoutConfig,
          anchorX: modeDefaults.x,
          anchorY: modeDefaults.y
        }
      };
    case 'SET_UI':
      return { ...state, ...action };
    case 'SET_CANVAS_HOVER':
      return { ...state, canvasHoverNode: action.node };
    case 'SET_CANVAS_SELECT':
      return { ...state, canvasSelectedNode: action.node };
    case 'SET_SIDEBAR_WIDTH':
      return { ...state, sidebarWidth: action.width };
    case 'RESET_TRANSFORM':
      return {
        ...state,
        scale: 1,
        isFit: false,
        resetToken: state.resetToken + 1
      };
    default:
      return state;
  }
}
