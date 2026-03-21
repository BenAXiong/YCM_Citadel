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
  showThemeBar: boolean;
  showFloatingPalette: boolean;
  landingVersion: 1 | 2 | 3;
  logoStyles: Record<number, 'original' | 'square' | 'round'>;
  logoSettings: Record<number, { scale: number; radius: number; xOffset: number; opacity: number; glowIntensity: number; glowColor: string }>;
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
  rightSidebarTab: 'txt' | 'sent' | 'met';
  themeBarTab: 'themes' | 'landing' | 'fonts' | 'map';
  rightSidebarWidth: number;
  showRightSidebar: boolean;
  rightSidebarCollapsed: boolean;
  showSidebarTooltips: boolean;
  showTreeTooltips: boolean;
  isFullView: boolean;
  hideCanvasControls: boolean;
  moveFullViewToCanvas: boolean;
  exportSettings: {
    mode: 'image' | 'text';
    format: 'png' | 'svg';
    textFormat: 'txt' | 'json';
    textContent: 'kilang' | 'chain';
    includeDefinitions: boolean;
    includeSentences: boolean;
    background: 'origin' | 'white' | 'black' | 'transparent';
    area: 'window' | 'all';
    margin: 0 | 5 | 10;
    resolution: 1 | 2 | 4;
  };
  showExportDropdown: boolean;
  showTreeTab: boolean;
  moveZoomToCanvas: boolean;
  moveGrowthToCanvas: boolean;
  moveCaptureToCanvas: boolean;
  moveChainToCanvas: boolean;
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
    rootBorderWidth: number;
    accentBorderWidth: number;
    branchBorderWidth: number;
    // Tier Aesthetics (Fill & Border)
    tier1Fill: string; tier1Border: string; tier1Text: string; tier1Rounding: number;
    tier2Fill: string; tier2Border: string; tier2Text: string; tier2Rounding: number;
    tier3Fill: string; tier3Border: string; tier3Text: string; tier3Rounding: number;
    tier4Fill: string; tier4Border: string; tier4Text: string; tier4Rounding: number;
    tier5Fill: string; tier5Border: string; tier5Text: string; tier5Rounding: number;
    tier6Fill: string; tier6Border: string; tier6Text: string; tier6Rounding: number;
    tier7Fill: string; tier7Border: string; tier7Text: string; tier7Rounding: number;
    tier8Fill: string; tier8Border: string; tier8Text: string; tier8Rounding: number;
    tier9Fill: string; tier9Border: string; tier9Text: string; tier9Rounding: number;
    spacingMode: 'even' | 'log';
    rootGap: number;
    coupleGaps: boolean;
    lineWidth: number;
    lineOpacity: number;
    lineBlur: number;
    lineTension: number;
    lineDashArray: number;
    lineFlowSpeed: number;
    theme: string;
  };
  affixState: {
    showInfixes: boolean;
    showPrefixes: boolean;
    showSuffixes: boolean;
    showDuplixies: boolean;
    showFullDuplix: boolean;
    activeFilters: string[];
    filtersEnabled: boolean;
    activeModes: string[];
    statsData: Record<string, any>;
    manifests: Record<string, any>;
    selectedAffix: { affix: string; type: string } | null;
    activeTab: 'examples' | 'diffs';
    sortMode: 'count' | 'alpha';
    columnSources: Record<string, string[]>;
  };
}

export type KilangAction =
  | { type: 'SET_GLOBAL_DATA'; stats: any; manifest: any }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ROOT'; root: string | null }
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
  | { type: 'SET_UI', searchTerm?: string; branchFilter?: string | 'all'; showStatsOverlay?: boolean; showAffixesOverlay?: boolean; visibleChainsCount?: number; exporting?: boolean; showDevTools?: boolean; showStats?: boolean; showDimensions?: boolean; showPerfMonitor?: boolean; showTreeTab?: boolean; showExportDropdown?: boolean; showFilterPanel?: boolean; showRightSidebar?: boolean; showThemeBar?: boolean; showFloatingPalette?: boolean; showSidebarTooltips?: boolean; showTreeTooltips?: boolean; isFullView?: boolean; hideCanvasControls?: boolean; moveFullViewToCanvas?: boolean; moveZoomToCanvas?: boolean; moveGrowthToCanvas?: boolean; moveCaptureToCanvas?: boolean; moveChainToCanvas?: boolean; theme?: string; themeBarTab?: 'themes' | 'landing' | 'fonts' | 'map'; exportSettings?: Partial<KilangState['exportSettings']>; landingVersion?: 1 | 2 | 3; logoStyles?: Record<number, 'original' | 'square' | 'round'>; logoSettings?: Record<number, Partial<KilangState['logoSettings'][number]>>; sidebarCollapsed?: boolean; rightSidebarCollapsed?: boolean; sidebarTab?: 'forest' | 'styling' | 'custom'; rightSidebarTab?: 'txt' | 'sent' | 'met'; sidebarWidth?: number; rightSidebarWidth?: number }
  | { type: 'RESET_LOGO_SETTINGS'; version: number }
  | { type: 'SET_CANVAS_HOVER'; node: string | null }
  | { type: 'SET_CANVAS_SELECT'; node: string | null }
  | { type: 'SET_SIDEBAR_WIDTH', width: number }
  | { type: 'SET_AFFIX_STATE', state: Partial<KilangState['affixState']> }
  | { type: 'SYNC_STATE', state: Partial<KilangState> }
  | { type: 'SYNC_GLOBAL_THEME', theme: string, layoutConfig: Partial<KilangState['layoutConfig']> }
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
  showThemeBar: false,
  showFloatingPalette: true,
  landingVersion: 2, // Desktop Default
  logoStyles: { 1: 'square', 2: 'round', 3: 'round' },
  logoSettings: {
    1: { scale: 1, radius: 45, xOffset: 0, opacity: 1.0, glowIntensity: 0, glowColor: 'var(--kilang-primary)' },
    2: { scale: 1.35, radius: 30, xOffset: 0, opacity: 0.5, glowIntensity: 0.1, glowColor: 'var(--kilang-primary)' },
    3: { scale: 1.6, radius: 44, xOffset: -320, opacity: 0.6, glowIntensity: 0.1, glowColor: 'var(--kilang-primary)' }
  },
  morphMode: 'plus', //strict = moe
  sourceFilter: 'ALL',
  direction: 'horizontal',
  arrangement: 'aligned', // Default Aligned
  scale: 1,
  isFit: false,
  themeBarTab: 'themes',
  searchTerm: '',
  branchFilter: 'all',
  showStatsOverlay: false,
  showAffixesOverlay: false,
  visibleChainsCount: 10,
  exporting: false,
  showDevTools: false,
  showStats: false,
  showDimensions: false,
  showPerfMonitor: false,
  showFilterPanel: true,
  sidebarCollapsed: false,
  sidebarTab: 'forest',
  rightSidebarTab: 'txt',
  rightSidebarWidth: 328,
  showRightSidebar: true,
  rightSidebarCollapsed: false,
  showSidebarTooltips: true,
  showTreeTooltips: true,
  isFullView: false,
  hideCanvasControls: false,
  moveFullViewToCanvas: true,
  exportSettings: {
    mode: 'image',
    format: 'png',
    textFormat: 'txt',
    textContent: 'kilang',
    includeDefinitions: true,
    includeSentences: false,
    background: 'origin',
    area: 'window',
    margin: 5,
    resolution: 2,
  },
  showExportDropdown: false,
  showTreeTab: true,
  moveZoomToCanvas: true,
  moveGrowthToCanvas: true,
  moveCaptureToCanvas: true,
  moveChainToCanvas: false,
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
    rootColor: 'var(--kilang-primary)',
    branchColor: 'var(--kilang-secondary)',
    lineColor: 'var(--kilang-primary)',
    lineColorMid: 'var(--kilang-secondary)',
    lineGradientEnd: 'var(--kilang-accent)',
    showIcons: false,
    nodeWidth: 100,
    nodePaddingY: 8,
    anchorX: ANCHOR_DEFAULTS.horizontal.x,
    anchorY: ANCHOR_DEFAULTS.horizontal.y,
    rootBorderWidth: 4,
    accentBorderWidth: 6,
    branchBorderWidth: 1,
    tier1Fill: 'var(--kilang-tier-1-fill)', tier1Border: 'var(--kilang-tier-1-border)', tier1Text: 'var(--kilang-tier-1-text)', tier1Rounding: 16,
    tier2Fill: 'var(--kilang-tier-2-fill)', tier2Border: 'var(--kilang-tier-2-border)', tier2Text: 'var(--kilang-tier-2-text)', tier2Rounding: 16,
    tier3Fill: 'var(--kilang-tier-3-fill)', tier3Border: 'var(--kilang-tier-3-border)', tier3Text: 'var(--kilang-tier-3-text)', tier3Rounding: 16,
    tier4Fill: 'var(--kilang-tier-4-fill)', tier4Border: 'var(--kilang-tier-4-border)', tier4Text: 'var(--kilang-tier-4-text)', tier4Rounding: 16,
    tier5Fill: 'var(--kilang-tier-5-fill)', tier5Border: 'var(--kilang-tier-5-border)', tier5Text: 'var(--kilang-tier-5-text)', tier5Rounding: 16,
    tier6Fill: 'var(--kilang-tier-6-fill)', tier6Border: 'var(--kilang-tier-6-border)', tier6Text: 'var(--kilang-tier-6-text)', tier6Rounding: 16,
    tier7Fill: 'var(--kilang-tier-7-fill)', tier7Border: 'var(--kilang-tier-7-border)', tier7Text: 'var(--kilang-tier-7-text)', tier7Rounding: 16,
    tier8Fill: 'var(--kilang-tier-8-fill)', tier8Border: 'var(--kilang-tier-8-border)', tier8Text: 'var(--kilang-tier-8-text)', tier8Rounding: 16,
    tier9Fill: 'var(--kilang-tier-9-fill)', tier9Border: 'var(--kilang-tier-9-border)', tier9Text: 'var(--kilang-tier-9-text)', tier9Rounding: 16,
    spacingMode: 'log',
    rootGap: 50,
    coupleGaps: false,
    lineWidth: 3,
    lineOpacity: 0.4,
    lineBlur: 0,
    lineTension: 1,
    lineDashArray: 0,
    lineFlowSpeed: 0,
    theme: 'kakarayan',
  },
  affixState: {
    showInfixes: true,
    showPrefixes: true,
    showSuffixes: true,
    showDuplixies: true,
    showFullDuplix: true,
    activeFilters: ['punctuation', 'custom'],
    filtersEnabled: true,
    activeModes: ['moe', 'plus'],
    statsData: {},
    manifests: {},
    selectedAffix: null,
    activeTab: 'examples',
    sortMode: 'count',
    columnSources: { moe: ['ALL'], plus: ['ALL'], star: ['ALL'] }
  }
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
    case 'RESET_LAYOUT_CONFIG': {
      const modeDefaults = ANCHOR_DEFAULTS[state.direction];
      return {
        ...state,
        layoutConfig: {
          ...initialState.layoutConfig,
          anchorX: modeDefaults.x,
          anchorY: modeDefaults.y
        }
      };
    }
    case 'RESET_LOGO_SETTINGS': {
      const logoDefaults: Record<number, any> = {
        1: { scale: 1, radius: 45, xOffset: 0, opacity: 1.0, glowIntensity: 0, glowColor: 'var(--kilang-primary)' },
        2: { scale: 1.35, radius: 30, xOffset: 0, opacity: 0.5, glowIntensity: 0.1, glowColor: 'var(--kilang-primary)' },
        3: { scale: 1.6, radius: 44, xOffset: -320, opacity: 0.6, glowIntensity: 0.1, glowColor: 'var(--kilang-primary)' }
      };
      return {
        ...state,
        logoSettings: {
          ...state.logoSettings,
          [action.version]: logoDefaults[action.version]
        }
      };
    }
    case 'SET_UI': {
      const {
        type,
        logoStyles,
        logoSettings,
        exportSettings,
        ...rest
      } = action;

      const nextLogoSettings = logoSettings
        ? { ...state.logoSettings }
        : state.logoSettings;

      if (logoSettings) {
        Object.entries(logoSettings).forEach(([ver, settings]) => {
          const v = Number(ver);
          nextLogoSettings[v] = { ...nextLogoSettings[v], ...settings };
        });
      }

      return {
        ...state,
        ...rest,
        layoutConfig: rest.theme ? { ...state.layoutConfig, theme: rest.theme } : state.layoutConfig,
        logoStyles: logoStyles ? { ...state.logoStyles, ...logoStyles } : state.logoStyles,
        logoSettings: nextLogoSettings,
        exportSettings: exportSettings ? { ...state.exportSettings, ...exportSettings } : state.exportSettings,
      };
    }
    case 'SET_CANVAS_HOVER':
      return { ...state, canvasHoverNode: action.node };
    case 'SET_CANVAS_SELECT':
      return { ...state, canvasSelectedNode: action.node };
    case 'SET_SIDEBAR_WIDTH':
      return { ...state, sidebarWidth: action.width };
    case 'SYNC_STATE':
      return { ...state, ...action.state };
    case 'SYNC_GLOBAL_THEME':
      return {
        ...state,
        layoutConfig: { ...state.layoutConfig, ...action.layoutConfig, theme: action.theme }
      };
    case 'RESET_TRANSFORM':
      return {
        ...state,
        scale: 1,
        isFit: false,
        resetToken: state.resetToken + 1
      };
    case 'SET_AFFIX_STATE':
      return {
        ...state,
        affixState: { ...state.affixState, ...action.state }
      };
    default:
      return state;
  }
}
