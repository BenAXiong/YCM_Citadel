'use client';

import React from 'react';
import {
  GitBranch,
  Activity,
  ChevronDown,
  RotateCcw,
  Minus,
  Plus,
  Boxes,
  Maximize2,
  Minimize2,
  TrendingUp,
  ArrowRight,
  ArrowUp,
  LayoutGrid,
  Rows,
  Settings2,
  ChevronRight,
  Search,
  Info,
  Download,
  Filter,
  Layers,
  TreePine,
  Zap,
  Share2,
  Languages,
  Palette,
  Eye,
  Copy,
  Check
} from 'lucide-react';
import { MorphMode, LayoutDirection, LayoutArrangement, KilangState, KilangAction } from './kilangReducer';
import { WeavingPattern } from './WeavingPattern';
import { UILang, UIStrings } from '../../../types';
import { KilangExportHUD } from './KilangExportHUD';

// Extracted Components
import { getLinearPath, normalizeWord } from './kilangUtils';
import { Derivation } from './KilangTypes';
import { CompactMetric } from './components/CompactMetric';
import { DevToolItem } from './components/DevToolItem';


interface KilangHeaderProps {
  stats: any;
  selectedRoot: string | null;
  morphMode: MorphMode;
  sourceFilter: string;
  direction: LayoutDirection;
  arrangement: LayoutArrangement;
  scale: number;
  isFit: boolean;
  layoutConfig: KilangState['layoutConfig'];
  showStatsOverlay: boolean;
  showAffixesOverlay: boolean;
  setMorphMode: (mode: MorphMode) => void;
  setSourceFilter: (filter: string) => void;
  setShowStatsOverlay: (show: boolean) => void;
  setShowAffixesOverlay: (show: boolean) => void;
  setDirection: (dir: LayoutDirection) => void;
  setArrangement: (arr: LayoutArrangement) => void;
  setScale: (scale: number | ((prev: number) => number)) => void;
  setIsFit: (fit: boolean) => void;
  updateLayoutConfig: (config: Partial<KilangState['layoutConfig']>) => void;
  handleExport: () => Promise<void>;
  MOE_SOURCES: Array<{ id: string; label: string }>;
  sourceCounts: Record<string, { r: number; e: number }>;
  showStats: boolean;
  showDimensions: boolean;
  showDevTools: boolean;
  showFilterPanel: boolean;
  showRightSidebar: boolean;
  showPerfMonitor: boolean;
  showThemeBar: boolean;
  showTreeTab: boolean;
  moveZoomToCanvas: boolean;
  moveGrowthToCanvas: boolean;
  moveCaptureToCanvas: boolean;
  exportSettings: KilangState['exportSettings'];
  showSidebarTooltips: boolean;
  showTreeTooltips: boolean;
  dispatch: any;
  uiLang: UILang;
  toggleUiLang: () => void;
  showExportDropdown: boolean;
  exporting: boolean;
  moveChainToCanvas: boolean;
  rootData: any;
  canvasHoverNode: string | null;
  canvasSelectedNode: string | null;
  s: UIStrings;
}

export const KilangHeader = ({
  stats,
  selectedRoot,
  morphMode,
  sourceFilter,
  direction,
  arrangement,
  scale,
  isFit,
  layoutConfig,
  showStatsOverlay,
  showAffixesOverlay,
  setMorphMode,
  setSourceFilter,
  setShowStatsOverlay,
  setShowAffixesOverlay,
  setDirection,
  setArrangement,
  setScale,
  setIsFit,
  updateLayoutConfig,
  handleExport,
  MOE_SOURCES,
  sourceCounts,
  showStats,
  showDimensions,
  showDevTools,
  showFilterPanel,
  showRightSidebar,
  showPerfMonitor,
  showThemeBar,
  showTreeTab,
  showExportDropdown,
  exporting,
  moveZoomToCanvas,
  moveGrowthToCanvas,
  moveCaptureToCanvas,
  exportSettings,
  dispatch,
  uiLang,
  toggleUiLang,
  moveChainToCanvas,
  rootData,
  canvasHoverNode,
  canvasSelectedNode,
  showSidebarTooltips,
  showTreeTooltips,
  s
}: KilangHeaderProps) => {
  const [showSettings, setShowSettings] = React.useState(false);
  const [isPinned, setIsPinned] = React.useState(false);
  const [showDevSub, setShowDevSub] = React.useState(false);
  const [showViewSub, setShowViewSub] = React.useState(false);
  const [showShareSub, setShowShareSub] = React.useState(false);
  const [showHowToSub, setShowHowToSub] = React.useState(false);
  const [isPaletteHovered, setIsPaletteHovered] = React.useState(false);
  const [copiedChain, setCopiedChain] = React.useState(false);

  const settingsRef = React.useRef<HTMLDivElement>(null);
  const exportRef = React.useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = React.useRef<any>(null);
  const paletteHoverTimeoutRef = React.useRef<any>(null);

  // Auto-close on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
        setIsPinned(false);
        setShowDevSub(false);
        setShowViewSub(false);
        setShowShareSub(false);
        setShowHowToSub(false);
      }
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        dispatch({ type: 'SET_UI', showExportDropdown: false });
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dispatch]);

  const handleCopyChain = (path: string[]) => {
    navigator.clipboard.writeText(path.join(' > '));
    setCopiedChain(true);
    setTimeout(() => setCopiedChain(false), 2000);
  };

  const activeHighlightNode = canvasHoverNode || canvasSelectedNode;
  const linearPath = React.useMemo(() => {
    return getLinearPath(activeHighlightNode, rootData?.derivatives || [], selectedRoot);
  }, [activeHighlightNode, rootData, selectedRoot]);

  return (
    <header className="h-16 border-b border-[var(--kilang-border)] bg-[var(--kilang-bg-base)]/80 backdrop-blur-md flex items-center justify-between pl-0 pr-3 lg:pr-8 z-[150] shrink-0">
      <div className="flex items-center shrink-0 h-full">
        {/* Logo, Title & Discreet Icons Wrapper (Synced with Sidebar Width) */}
        <div
          className="shrink-0 flex items-center h-full"
          style={{ width: 'var(--sidebar-width, 328px)', paddingLeft: 'clamp(0.75rem, 2vw, 1.5rem)' }}
        >
          <button
            onClick={() => dispatch({ type: 'SET_ROOT', root: null })}
            className="flex items-center gap-3 group cursor-pointer hover:opacity-80 active:scale-95 transition-all outline-none"
          >
            <div className="w-8 h-8 relative flex items-center justify-center group-hover:scale-110 transition-all duration-300">
              <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--kilang-primary),transparent_80%)] blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <img
                src="/kilang/Kilang_5_nobg_noring2.png"
                alt="Kilang Logo"
                className="w-full h-full object-contain drop-shadow-[0_0_15px_var(--kilang-primary)]"
              />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-[var(--kilang-logo-text)] tracking-[0.2em] leading-none uppercase">KILANG</span>
                <span className="text-[8px] font-black text-[var(--kilang-primary-text)] bg-[color-mix(in_srgb,var(--kilang-primary-bg),transparent_90%)] px-1.5 py-0.5 rounded uppercase tracking-widest border border-[color-mix(in_srgb,var(--kilang-primary-border),transparent_80%)]">BETA</span>
              </div>
                <span className="text-[8px] font-black text-[var(--kilang-text-muted)] uppercase tracking-widest mt-1 hidden sm:inline-block">MORPHO-ENGINE</span>
              </div>
            </button>

          <div className="flex-1" />

          {/* Discreet Icons (Calqued from Citadel) */}
          <div className="flex items-center gap-1.5 mr-6 relative">
            <button
              onClick={toggleUiLang}
              className="p-2 hover:bg-[var(--kilang-ctrl-bg)] rounded-full transition text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)] active:scale-90"
              title="Toggle UI Language"
            >
              <Languages className="w-4 h-4" />
            </button>
            <div
              className="relative flex items-center h-10"
              onMouseEnter={() => {
                if (paletteHoverTimeoutRef.current) clearTimeout(paletteHoverTimeoutRef.current);
                setIsPaletteHovered(true);
              }}
              onMouseLeave={() => {
                paletteHoverTimeoutRef.current = setTimeout(() => {
                  setIsPaletteHovered(false);
                }, 1000); // 1s grace period
              }}
            >
              <button
                onClick={() => dispatch({ type: 'SET_UI', showThemeBar: true, themeBarTab: 'themes', sidebarTab: 'styling' })}
                className={`p-2 hover:bg-[var(--kilang-ctrl-bg)] rounded-full transition active:scale-90 ${showThemeBar ? 'bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)]' : 'text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)]'}`}
                title="Aesthetics & Themes"
              >
                <Palette className="w-4 h-4" />
              </button>

              {/* Palette Hover Dropdown (Horizontal) - No Container Styling */}
              <div className={`absolute left-full ml-1 flex items-center gap-2.5 p-1 transition-all duration-300 origin-left z-[100] ${isPaletteHovered ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-90 -translate-x-2 pointer-events-none'}`}>
                {[
                  { color: '#3b82f6', label: 'Kakarayan', id: 'kakarayan', glow: 'rgba(59,130,246,0.5)' },
                  { color: '#10b981', label: 'Papah', id: 'papah', glow: 'rgba(16,185,129,0.5)' },
                  { color: '#6366f1', label: 'Ngidan', id: 'ngidan', glow: 'rgba(99,102,241,0.5)' }
                ].map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => dispatch({ type: 'SET_UI', showThemeBar: true, themeBarTab: 'themes', theme: t.id })}
                    className="w-12 h-12 flex items-center justify-center transition-all active:scale-95 group/item relative shrink-0"
                    title={t.label}
                  >
                    {/* Dynamic Glow behind the logo */}
                    <div
                      className="absolute inset-2 blur-lg opacity-30 group-hover/item:opacity-60 transition-all duration-500 rounded-full z-0"
                      style={{ backgroundColor: t.color }}
                    />

                    <div
                      className="w-[38px] h-[38px] relative z-10 flex items-center justify-center"
                      style={{ filter: `drop-shadow(0 0 12px ${t.glow}) brightness(1.1) contrast(1.1)` }}
                    >
                      <img
                        src="/kilang/Kilang_5_nobg.png"
                        className="w-full h-full object-contain drop-shadow-lg"
                        style={{ opacity: 1 }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="w-[1px] h-4 bg-[var(--kilang-border-std)] ml-4" />
        </div>

        {/* 2. Metrics & Basic Controls with extra padding */}
        <div className="flex items-center gap-3 lg:gap-8 pl-10 pr-2 h-full">
          {/* Consolidated Source & Mode Dropdown */}
          <div className="relative group flex h-8 bg-[var(--kilang-ctrl-bg)] border border-[var(--kilang-border-std)] rounded-lg p-0.5 items-stretch">
            <button
              className="px-3 h-full kilang-ctrl-btn text-[10px] font-black tracking-widest flex items-center gap-2 group/btn text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)]"
              title="Select Morphological Source & Mode"
            >
              <div className="flex items-center gap-1.5 min-w-[60px] justify-between">
                <span>
                  {morphMode === 'moe' 
                    ? (sourceFilter === 'ALL' ? 'MoE (all)' : (MOE_SOURCES.find(s => s.id === sourceFilter)?.label.split(' ')[0] || 'MoE'))
                    : (morphMode === 'plus' ? 'Kilang' : 'Kilang+')
                  }
                </span>
                <ChevronDown className="w-2.5 h-2.5 opacity-40 shrink-0 group-hover/btn:scale-110 transition-transform" />
              </div>
            </button>

            {/* CONSOLIDATED DROPDOWN MENU */}
            <div className="absolute top-full left-0 mt-1 w-64 bg-[var(--kilang-bg-base)]/95 backdrop-blur-xl border border-[var(--kilang-border-std)] rounded-xl shadow-[var(--kilang-shadow-primary)] p-1.5 hidden group-hover:block z-[3000] animate-in fade-in slide-in-from-top-2 duration-200">
              {/* SECTION: MoE (ALL) */}
              <div className="relative group/tip">
                <button
                  onClick={() => { setSourceFilter('ALL'); setMorphMode('moe'); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-[12px] font-black tracking-[0.1em] uppercase transition-all flex items-center gap-3 mb-1 ${sourceFilter === 'ALL' && morphMode === 'moe' ? 'bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)] shadow-[var(--kilang-shadow-primary)]' : 'text-[var(--kilang-text-muted)] hover:bg-[var(--kilang-ctrl-active)]/5 hover:text-[var(--kilang-text)]'}`}
                >
                  <div className={`w-2 h-2 rounded-full ${sourceFilter === 'ALL' && morphMode === 'moe' ? 'bg-[var(--kilang-text)] ring-2 ring-[var(--kilang-primary-glow)]' : 'bg-[var(--kilang-primary)]'}`} />
                  <span className="flex-1">MoE (all)</span>
                  {sourceFilter === 'ALL' && morphMode === 'moe' && <div className="w-1 h-1 rounded-full bg-[var(--kilang-text)] animate-pulse" />}
                </button>
                {/* Fixed Tooltip */}
                <div className="absolute left-full ml-2 top-0 w-48 bg-[var(--kilang-bg-base)]/90 backdrop-blur-xl border border-[var(--kilang-border-std)] rounded-lg p-2.5 shadow-[var(--kilang-shadow-primary)] z-[5000] invisible group-hover/tip:visible opacity-0 group-hover/tip:opacity-100 transition-all scale-95 group-hover/tip:scale-100 origin-left">
                  <div className="text-[9px] text-[var(--kilang-text-muted)] leading-relaxed font-sans normal-case tracking-normal">
                    Ministry of Education Amis Dictionary (Consolidated). Merges all selected authoritative sources into a single morphological view.
                  </div>
                </div>
              </div>

              <div className="h-[1px] bg-[var(--kilang-border)] my-1 mx-2" />

              {/* SECTION: MoE SPECIFIC DICS */}
              <div className="space-y-0.5">
                {MOE_SOURCES.filter((s: any) => s.id !== 'ALL').map((s: any) => {
                  const colors: Record<string, string> = {
                    'p': 'bg-[#3366cc]',
                    'm': 'bg-[#c07b0c]',
                    's': 'bg-[#e53e3e]',
                    'a': 'bg-[#8e44ad]',
                    'old-s': 'bg-[#718096]'
                  };
                  const isActive = sourceFilter === s.id && morphMode === 'moe';
                  return (
                    <div key={s.id} className="relative group/tip">
                      <button
                        onClick={() => { setSourceFilter(s.id); setMorphMode('moe'); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-black tracking-widest uppercase transition-all flex items-center gap-3 ${isActive ? `bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)] shadow-[var(--kilang-shadow-primary)]` : 'text-[var(--kilang-text-muted)] hover:bg-[var(--kilang-ctrl-active)]/5 hover:text-[var(--kilang-text)]'}`}
                      >
                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[var(--kilang-ctrl-active-text)] ring-2 ring-[var(--kilang-ctrl-active-text)]/30' : 'bg-[var(--kilang-ctrl-bg)]'}`} />
                        <span className="flex-1">{s.label}</span>
                        <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${isActive ? 'bg-[var(--kilang-ctrl-active-text)]/20 text-[var(--kilang-ctrl-active-text)]' : 'bg-[var(--kilang-ctrl-bg)] text-[var(--kilang-text-muted)]'}`}>
                          {sourceCounts[s.id] ? `${sourceCounts[s.id].r.toLocaleString()}/${sourceCounts[s.id].e.toLocaleString()}` : '.../...'}
                        </span>
                      </button>
                      {/* Dynamic Tooltip */}
                      {s.tooltip && (
                        <div className="absolute left-full ml-2 top-0 w-48 bg-[var(--kilang-bg-base)]/90 backdrop-blur-xl border border-[var(--kilang-border-std)] rounded-lg p-2.5 shadow-[var(--kilang-shadow-primary)] z-[5000] invisible group-hover/tip:visible opacity-0 group-hover/tip:opacity-100 transition-all scale-95 group-hover/tip:scale-100 origin-left">
                          <div className="text-[9px] text-[var(--kilang-text-muted)] leading-relaxed font-sans normal-case tracking-normal">
                            {s.tooltip}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="h-[1px] bg-[var(--kilang-border-std)] mt-2 mb-1 mx-2" />

              {/* SECTION: ADVANCED MODES (KILANG) */}
              <div className="space-y-0.5">
                <div className="relative group/tip">
                  <button
                    onClick={() => setMorphMode('plus')}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-[12px] font-black tracking-[0.1em] uppercase transition-all flex items-center gap-3 ${morphMode === 'plus' ? 'bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)] shadow-[var(--kilang-shadow-primary)]' : 'text-[var(--kilang-text-muted)] hover:bg-[var(--kilang-ctrl-active)]/5 hover:text-[var(--kilang-text)]'}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${morphMode === 'plus' ? 'bg-[var(--kilang-ctrl-active-text)] ring-2 ring-[var(--kilang-ctrl-active-text)]/30' : 'bg-[var(--kilang-secondary)]'}`} />
                    <span className="flex-1">Kilang</span>
                    {morphMode === 'plus' && <div className="w-1 h-1 rounded-full bg-[var(--kilang-ctrl-active-text)] animate-pulse" />}
                  </button>
                  <div className="absolute left-full ml-2 top-0 w-48 bg-black/90 backdrop-blur-xl border border-[var(--kilang-border-std)] rounded-lg p-2.5 shadow-2xl z-[5000] invisible group-hover/tip:visible opacity-0 group-hover/tip:opacity-100 transition-all scale-95 group-hover/tip:scale-100 origin-left">
                    <div className="text-[9px] text-[var(--kilang-text-muted)] leading-relaxed font-sans normal-case tracking-normal">
                      ENHANCED: Uses heuristic substring matching to bridge gaps in the official dictionary, revealing denser morphological clusters.
                    </div>
                  </div>
                </div>

                <div className="relative group/tip">
                  <button
                    onClick={() => setMorphMode('star')}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-[12px] font-black tracking-[0.1em] uppercase transition-all flex items-center gap-3 ${morphMode === 'star' ? 'bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)] shadow-[var(--kilang-shadow-primary)]' : 'text-[var(--kilang-text-muted)] hover:bg-[var(--kilang-ctrl-active)]/5 hover:text-[var(--kilang-text)]'}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${morphMode === 'star' ? 'bg-[var(--kilang-ctrl-active-text)] ring-2 ring-[var(--kilang-ctrl-active-text)]/30' : 'bg-[var(--kilang-accent)]'}`} />
                    <span className="flex-1">Kilang+</span>
                    {morphMode === 'star' && <div className="w-1 h-1 rounded-full bg-[var(--kilang-ctrl-active-text)] animate-pulse" />}
                  </button>
                  <div className="absolute left-full ml-2 top-0 w-48 bg-black/90 backdrop-blur-xl border border-[var(--kilang-border-std)] rounded-lg p-2.5 shadow-2xl z-[5000] invisible group-hover/tip:visible opacity-0 group-hover/tip:opacity-100 transition-all scale-95 group-hover/tip:scale-100 origin-left">
                    <div className="text-[9px] text-white/70 leading-relaxed font-sans normal-case tracking-normal">
                      EXPERIMENTAL: Dialectal triangulation and phonetic law matching (e.g. u/o drift). High-connectivity exploratory mode.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Word + Views + Zoom + Export */}
      <div className="flex-1 min-w-0 flex items-center justify-center px-3 lg:px-8 mx-2 lg:mx-6 h-full">
        {selectedRoot ? (
          <div className="flex items-center gap-6 animate-in fade-in slide-in-from-top-2 duration-500 shrink-0">
            <div className="flex items-center gap-3 lg:gap-6">
              {!moveGrowthToCanvas && (
                <>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[8px] font-black text-[var(--kilang-text-muted)] uppercase tracking-widest hidden lg:inline-block">Growth</span>
                    <div className="kilang-ctrl-container">
                      <button
                        onClick={() => setDirection('horizontal')}
                        className={`w-8 h-7 kilang-ctrl-btn ${direction === 'horizontal' ? 'kilang-ctrl-btn-active' : 'kilang-ctrl-btn-inactive'}`}
                        title="Horizontal Growth"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDirection('vertical')}
                        className={`w-8 h-7 kilang-ctrl-btn ${direction === 'vertical' ? 'kilang-ctrl-btn-active' : 'kilang-ctrl-btn-inactive'}`}
                        title="Vertical Growth"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-[8px] font-black text-[var(--kilang-text-muted)] uppercase tracking-widest hidden lg:inline-block">Pattern</span>
                    <div className="kilang-ctrl-container">
                      <button
                        onClick={() => setArrangement('flow')}
                        className={`w-8 h-7 kilang-ctrl-btn ${arrangement === 'flow' ? 'kilang-ctrl-btn-active' : 'kilang-ctrl-btn-inactive'}`}
                        title="Flow (Organized Groups)"
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setArrangement('aligned')}
                        className={`w-8 h-7 kilang-ctrl-btn ${arrangement === 'aligned' ? 'kilang-ctrl-btn-active' : 'kilang-ctrl-btn-inactive'}`}
                        title="Aligned (Chain Selection)"
                      >
                        <Rows className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {showDevTools && (
                <div className="kilang-ctrl-container">
                  <button
                    onClick={() => updateLayoutConfig({ showToolbox: !layoutConfig.showToolbox })}
                    className={`w-8 h-7 kilang-ctrl-btn ${layoutConfig.showToolbox ? 'kilang-ctrl-btn-active' : 'text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)] hover:bg-[var(--kilang-ctrl-active)]/5'}`}
                    title="Toggle Visual Toolbox"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {!moveZoomToCanvas && (
              <>
                <div className="w-[1px] h-8 bg-[var(--kilang-border)]" />
                <div className="kilang-ctrl-container">
                  <button
                    onClick={() => setIsFit(!isFit)}
                    className={`w-8 h-7 kilang-ctrl-btn ${isFit ? 'kilang-ctrl-btn-active' : 'kilang-ctrl-btn-inactive'}`}
                    title={isFit ? "Expand to Actual Size" : "Fit Tree"}
                  >
                    {isFit ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                  </button>
                  <button onClick={() => { setScale((prev: number) => Math.max(0.2, (typeof prev === 'number' ? prev : 1) - 0.1)); setIsFit(false); }} className="w-8 h-7 kilang-ctrl-btn kilang-ctrl-btn-inactive shadow-[var(--kilang-shadow-primary)]/20" title="Out">
                    <Minus className="w-3 h-3" />
                  </button>
                  <button onClick={() => { setScale((prev: number) => Math.min(2, (typeof prev === 'number' ? prev : 1) + 0.1)); setIsFit(false); }} className="w-8 h-7 kilang-ctrl-btn kilang-ctrl-btn-inactive shadow-[var(--kilang-shadow-primary)]/20" title="In">
                    <Plus className="w-3 h-3" />
                  </button>
                  <button onClick={() => dispatch({ type: 'RESET_TRANSFORM' })} className="w-8 h-7 kilang-ctrl-btn kilang-ctrl-btn-inactive shadow-[var(--kilang-shadow-primary)]/20" title="Reset Zoom">
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </>
            )}

            {!moveCaptureToCanvas && (
              <KilangExportHUD
                exportSettings={exportSettings}
                showExportDropdown={showExportDropdown}
                exporting={exporting}
                dispatch={dispatch}
                handleExport={handleExport}
                dropdownPosition="top"
                align="left"
                variant="header"
                className="relative ml-2 pl-4 border-l border-[var(--kilang-border)] hidden lg:block"
              />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <WeavingPattern />
          </div>
        )}

        {selectedRoot && !moveChainToCanvas && linearPath.length > 0 && !exporting && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-500 group">
            <div className="bg-[var(--kilang-bg-base)]/40 backdrop-blur-md border border-[var(--kilang-border)] px-6 py-2 rounded-full flex items-center gap-2.5 shadow-[var(--kilang-shadow-primary)] relative">
              {linearPath.map((word: string, idx: number) => (
                <React.Fragment key={word}>
                  <span className={`text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${idx === linearPath.length - 1 ? 'text-[var(--kilang-primary-text)]' : 'text-[var(--kilang-text-muted)]'}`}>
                    {word}
                  </span>
                  {idx < linearPath.length - 1 && (
                    <ChevronRight className="w-2.5 h-2.5 text-[var(--kilang-text-muted)]" />
                  )}
                </React.Fragment>
              ))}
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); handleCopyChain(linearPath); }}
              className="p-1.5 rounded-lg bg-[var(--kilang-ctrl-bg)] backdrop-blur-md border border-[var(--kilang-border-std)] text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)] transition-all opacity-0 group-hover:opacity-100 shadow-[var(--kilang-shadow-primary)] shrink-0"
              title="Copy Path"
            >
              {copiedChain ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* 4. Stats Cards */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {stats && showStats && (
          <>
            <CompactMetric
              icon={<TrendingUp className="w-3 h-3" />}
              label="Flowers"
              value={stats.summary.total_words}
              color="rose"
              description="Total vocabulary words mapped to established roots."
            />
            <CompactMetric
              icon={<Boxes className="w-3 h-3" />}
              label="Stems"
              value={stats.summary.total_roots}
              color="blue"
              description="Total unique semantic roots identified in the database."
            />
            <CompactMetric
              icon={<GitBranch className="w-3 h-3" />}
              label="Branching"
              value={stats.summary.average_branching}
              color="indigo"
              description="Average number of derived forms per semantic root."
            />
            <CompactMetric
              icon={<Maximize2 className="w-3 h-3" />}
              label="Max. span"
              value={stats.summary.max_depth}
              color="emerald"
              description="Maximum morphological depth (evolutionary layers) found."
            />
          </>
        )}

        {stats && (
          <div className="flex items-center gap-4">
            <div className="w-[1px] h-4 bg-[var(--kilang-border)] mx-1" />

            <button
              onClick={() => setShowStatsOverlay(true)}
              className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${showStatsOverlay ? 'bg-[var(--kilang-ctrl-active)] border-[var(--kilang-ctrl-active)]/40 text-[var(--kilang-ctrl-active-text)] shadow-[var(--kilang-shadow-primary)]' : 'bg-[var(--kilang-bg-base)]/40 border-[var(--kilang-border-std)] text-[var(--kilang-text-muted)] hover:border-[var(--kilang-primary-border)] hover:text-[var(--kilang-text)]'}`}
              title="Morphology Distribution"
            >
              <Activity className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowAffixesOverlay(true)}
              className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${showAffixesOverlay ? 'bg-[var(--kilang-ctrl-active)] border-[var(--kilang-ctrl-active)]/40 text-[var(--kilang-ctrl-active-text)] shadow-[var(--kilang-shadow-primary)]' : 'bg-[var(--kilang-bg-base)]/40 border-[var(--kilang-border-std)] text-[var(--kilang-text-muted)] hover:border-[var(--kilang-primary-border)] hover:text-[var(--kilang-text)]'}`}
              title="Affixes Analysis"
            >
              <Layers className="w-5 h-5" />
            </button>

            {/* Gear Settings Button */}
            <div
              ref={settingsRef}
              className="relative"
              onMouseEnter={() => {
                if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                setShowSettings(true);
              }}
              onMouseLeave={() => {
                if (!isPinned) {
                  hoverTimeoutRef.current = setTimeout(() => {
                    setShowSettings(false);
                    setShowDevSub(false);
                    setShowViewSub(false);
                    setShowShareSub(false);
                    setShowHowToSub(false);
                  }, 600); // 600ms grace period
                }
              }}
            >
              <button
                onClick={() => setIsPinned(!isPinned)}
                className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${showSettings || isPinned ? 'bg-[var(--kilang-ctrl-active)] border-[var(--kilang-ctrl-active)]/40 text-[var(--kilang-ctrl-active-text)] shadow-[0_0_15px_var(--kilang-primary-glow)]' : 'bg-[var(--kilang-bg-base)]/40 border-[var(--kilang-border-std)] text-[var(--kilang-text-muted)] hover:border-[var(--kilang-primary-border)] hover:text-[var(--kilang-text)]'}`}
                title="Engine Settings"
              >
                <Settings2 className={`w-5 h-5 transition-transform duration-500 ${isPinned ? 'rotate-90' : 'group-hover:rotate-12'}`} />
              </button>

              {showSettings && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-[var(--kilang-bg-base)]/95 backdrop-blur-2xl border border-[var(--kilang-border-std)] rounded-xl shadow-[var(--kilang-shadow-primary)] p-2 z-[4000] animate-in fade-in slide-in-from-top-2 duration-200">
                  {isPinned && (
                    <div className="absolute -top-2 -right-1 flex items-center gap-1 group">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse" />
                    </div>
                  )}
                  {/* How to Kilang Secondary Menu */}
                  <div className="mb-1">
                    <button
                      onClick={() => setShowHowToSub(!showHowToSub)}
                      className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-[var(--kilang-ctrl-bg)] transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <Info className="w-3.5 h-3.5 text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-primary)]" />
                        <span className="text-[10px] font-black uppercase text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-text)]">How to Kilang</span>
                      </div>
                      <ChevronRight className={`w-3 h-3 text-[var(--kilang-text-muted)] transition-transform ${showHowToSub ? 'rotate-90' : ''}`} />
                    </button>

                    {showHowToSub && (
                      <div className="mt-1 ml-2 pl-2 border-l border-[var(--kilang-border-std)] space-y-1 animate-in slide-in-from-left-2 duration-200">
                        <div className="relative group/tooltip-instr">
                          <button className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg hover:bg-[var(--kilang-ctrl-bg)] transition-all group">
                            <span className="text-[9px] font-black uppercase text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-text)]">Instructions</span>
                            <div className="text-[8px] text-[var(--kilang-primary)]/50 group-hover:text-[var(--kilang-primary)]">?</div>
                          </button>

                          {/* Tooltip Content */}
                          <div className="absolute right-full mr-4 top-0 w-48 bg-black/99 backdrop-blur-md border border-[var(--kilang-border-std)] rounded-lg p-2.5 shadow-[var(--kilang-shadow-primary)] z-[5000] invisible group-hover/tooltip-instr:visible opacity-0 group-hover/tooltip-instr:opacity-100 transition-all scale-95 group-hover/tooltip-instr:scale-100 origin-right">
                            <div className="text-[9px] text-[var(--kilang-text-muted)] leading-relaxed italic">
                              "Kilang is a generative language forest. Explore the derivatives, analyze the affixes, and export your findings using the capture tools."
                            </div>
                          </div>
                        </div>

                        <div className="relative group/tooltip">
                          <button className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg hover:bg-[var(--kilang-ctrl-bg)] transition-all group">
                            <span className="text-[9px] font-black uppercase text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-text)]">Main Shortcuts</span>
                            <div className="text-[8px] text-[var(--kilang-primary)]/50 group-hover:text-[var(--kilang-primary)]">?</div>
                          </button>

                          {/* Tooltip Content */}
                          <div className="absolute right-full mr-4 top-0 w-48 bg-black/99 backdrop-blur-md border border-[var(--kilang-border-std)] rounded-lg p-2.5 shadow-[var(--kilang-shadow-primary)] z-[5000] invisible group-hover/tooltip:visible opacity-0 group-hover/tooltip:opacity-100 transition-all scale-95 group-hover/tooltip:scale-100 origin-right">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center border-b border-[var(--kilang-border-std)] pb-1.5 mb-1.5">
                                <span className="text-[7.5px] font-black uppercase text-[var(--kilang-primary)] tracking-wider">Canvas Interaction</span>
                              </div>
                              <div className="flex justify-between items-center text-[9px]">
                                <span className="text-[var(--kilang-text-muted)]/60 font-bold uppercase tracking-tight">Scroll</span>
                                <span className="text-[var(--kilang-text)] font-mono bg-[var(--kilang-text)]/5 px-1 rounded">Y-Scroll</span>
                              </div>
                              <div className="flex justify-between items-center text-[9px]">
                                <span className="text-[var(--kilang-text-muted)]/60 font-bold uppercase tracking-tight">Ctrl + Scroll</span>
                                <span className="text-[var(--kilang-text)] font-mono bg-[var(--kilang-text)]/5 px-1 rounded">Zoom</span>
                              </div>
                              <div className="flex justify-between items-center text-[9px]">
                                <span className="text-[var(--kilang-text-muted)]/60 font-bold uppercase tracking-tight">Right Click</span>
                                <span className="text-[var(--kilang-text)] font-mono bg-[var(--kilang-text)]/5 px-1 rounded">Pan</span>
                              </div>

                              <div className="pt-2 mt-2 border-t border-[var(--kilang-border-std)] space-y-2">
                                <div className="flex justify-between items-center text-[9px]">
                                  <span className="text-[var(--kilang-primary)] font-black uppercase tracking-widest text-[7px]">Precision (Alt)</span>
                                </div>
                                <div className="flex justify-between items-center text-[9px]">
                                  <span className="text-[var(--kilang-text-muted)]/60 font-bold uppercase tracking-tight">Alt + Scroll</span>
                                  <span className="text-[var(--kilang-text)] font-mono bg-[var(--kilang-text)]/5 px-1 rounded">Fine V</span>
                                </div>
                                <div className="flex justify-between items-center text-[9px]">
                                  <span className="text-[var(--kilang-text-muted)]/60 font-bold uppercase tracking-tight">Alt+Shift+Sch</span>
                                  <span className="text-[var(--kilang-text)] font-mono bg-[var(--kilang-text)]/5 px-1 rounded">Fine H</span>
                                </div>
                                <div className="flex justify-between items-center text-[9px]">
                                  <span className="text-[var(--kilang-text-muted)]/60 font-bold uppercase tracking-tight">Alt+Ctrl+Sch</span>
                                  <span className="text-[var(--kilang-text)] font-mono bg-[var(--kilang-text)]/5 px-1 rounded">Fine Zoom</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* View Secondary Menu */}
                  <div className="mb-1">
                      <button
                        onClick={() => setShowViewSub(!showViewSub)}
                        className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-[var(--kilang-ctrl-bg)] transition-all group"
                      >
                      <div className="flex items-center gap-2">
                        <Eye className="w-3.5 h-3.5 text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-primary)]" />
                        <span className="text-[10px] font-black uppercase text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-text)]">View</span>
                      </div>
                      <ChevronRight className={`w-3 h-3 text-[var(--kilang-text-muted)] transition-transform ${showViewSub ? 'rotate-90' : ''}`} />
                    </button>

                    {showViewSub && (
                      <div className="mt-1 ml-2 pl-2 border-l border-[var(--kilang-border-std)] space-y-1 animate-in slide-in-from-left-2 duration-200">
                        <button
                          onClick={() => dispatch({ type: 'SET_UI', showStats: !showStats })}
                          className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-[var(--kilang-ctrl-bg)] transition-all group"
                        >
                          <span className="text-[10px] font-black uppercase text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-text)]">Stats Bar</span>
                          <div className={`w-2 h-2 rounded-full border transition-all ${showStats ? 'bg-[var(--kilang-primary)] border-[var(--kilang-primary-border)] shadow-[0_0_8px_var(--kilang-primary-glow)]' : 'border-[var(--kilang-border-std)]'}`} />
                        </button>


                        <button
                          onClick={() => dispatch({ type: 'SET_UI', showSidebarTooltips: !showSidebarTooltips })}
                          className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-[var(--kilang-ctrl-bg)] transition-all group"
                        >
                          <span className="text-[10px] font-black uppercase text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-text)]">Sidebar Tooltips</span>
                          <div className={`w-2 h-2 rounded-full border transition-all ${showSidebarTooltips ? 'bg-[var(--kilang-primary)] border-[var(--kilang-primary-border)] shadow-[0_0_8px_var(--kilang-primary-glow)]' : 'border-[var(--kilang-border-std)]'}`} />
                        </button>

                        <button
                          onClick={() => dispatch({ type: 'SET_UI', showTreeTooltips: !showTreeTooltips })}
                          className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-[var(--kilang-ctrl-bg)] transition-all group"
                        >
                          <span className="text-[10px] font-black uppercase text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-text)]">Tree Tooltips</span>
                          <div className={`w-2 h-2 rounded-full border transition-all ${showTreeTooltips ? 'bg-[var(--kilang-primary)] border-[var(--kilang-primary-border)] shadow-[0_0_8px_var(--kilang-primary-glow)]' : 'border-[var(--kilang-border-std)]'}`} />
                        </button>

                        <button
                          onClick={() => dispatch({ type: 'SET_UI', moveZoomToCanvas: !moveZoomToCanvas })}
                          className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-[var(--kilang-ctrl-bg)] transition-all group"
                        >
                          <span className="text-[10px] font-black uppercase text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-text)]">Zoom Controls</span>
                          <div className={`w-2 h-2 rounded-full border transition-all ${moveZoomToCanvas ? 'bg-[var(--kilang-primary)] border-[var(--kilang-primary-border)]/50 shadow-[0_0_8px_var(--kilang-primary-glow)]' : 'border-[var(--kilang-border-std)]'}`} />
                        </button>

                        <button
                          onClick={() => dispatch({ type: 'SET_UI', moveGrowthToCanvas: !moveGrowthToCanvas })}
                          className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-[var(--kilang-ctrl-bg)] transition-all group"
                        >
                          <span className="text-[10px] font-black uppercase text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-text)]">Growth & Pattern</span>
                          <div className={`w-2 h-2 rounded-full border transition-all ${moveGrowthToCanvas ? 'bg-[var(--kilang-primary)] border-[var(--kilang-primary-border)]/50 shadow-[0_0_8px_var(--kilang-primary-glow)]' : 'border-[var(--kilang-border-std)]'}`} />
                        </button>

                        <button
                          onClick={() => dispatch({ type: 'SET_UI', moveCaptureToCanvas: !moveCaptureToCanvas })}
                          className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-[var(--kilang-ctrl-bg)] transition-all group"
                        >
                          <span className="text-[10px] font-black uppercase text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-text)]">Capture</span>
                          <div className={`w-2 h-2 rounded-full border transition-all ${moveCaptureToCanvas ? 'bg-[var(--kilang-primary)] border-[var(--kilang-primary-border)]/50 shadow-[0_0_8px_var(--kilang-primary-glow)]' : 'border-[var(--kilang-border-std)]'}`} />
                        </button>

                        <button
                          onClick={() => dispatch({ type: 'SET_UI', moveChainToCanvas: !moveChainToCanvas })}
                          className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-[var(--kilang-ctrl-bg)] transition-all group"
                        >
                          <span className="text-[10px] font-black uppercase text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-text)]">Chain Overlay</span>
                          <div className={`w-2 h-2 rounded-full border transition-all ${moveChainToCanvas ? 'bg-[var(--kilang-primary)] border-[var(--kilang-primary-border)]/50 shadow-[0_0_8px_var(--kilang-primary-glow)]' : 'border-[var(--kilang-border-std)]'}`} />
                        </button>

                      </div>
                    )}
                  </div>

                  {/* Share Secondary Menu */}
                  <div className="mb-1">
                    <button
                      onClick={() => setShowShareSub(!showShareSub)}
                      className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-[var(--kilang-ctrl-bg)] transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <Share2 className="w-3.5 h-3.5 text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-primary)]" />
                        <span className="text-[10px] font-black uppercase text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-text)]">Share</span>
                      </div>
                      <ChevronRight className={`w-3 h-3 text-[var(--kilang-text-muted)] transition-transform ${showShareSub ? 'rotate-90' : ''}`} />
                    </button>

                    {showShareSub && (
                      <div className="mt-1 ml-2 pl-2 border-l border-[var(--kilang-border-std)] space-y-1 animate-in slide-in-from-left-2 duration-200">
                        <button className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg hover:bg-[var(--kilang-ctrl-bg)] transition-all group">
                          <span className="text-[9px] font-black uppercase text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-text)]">Share Page</span>
                        </button>
                        <button className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg hover:bg-[var(--kilang-ctrl-bg)] transition-all group">
                          <span className="text-[9px] font-black uppercase text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-text)]">Share Kilang</span>
                        </button>
                        <button className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg hover:bg-[var(--kilang-ctrl-bg)] transition-all group">
                          <span className="text-[9px] font-black uppercase text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-text)]">Share Chain</span>
                        </button>
                      </div>
                    )}
                  </div>


                  {/* Dev Tools Secondary Menu */}
                  <div className="mt-2 pt-2 border-t border-[var(--kilang-border-std)]">
                    <button
                      onClick={() => setShowDevSub(!showDevSub)}
                      className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-[var(--kilang-ctrl-bg)] transition-all group bg-[var(--kilang-primary)]/5"
                    >
                      <span className="text-[10px] font-black uppercase text-[var(--kilang-primary)] group-hover:text-[var(--kilang-primary-text)]">Dev Tools</span>
                      <ChevronRight className={`w-3 h-3 text-[var(--kilang-primary)]/50 transition-transform ${showDevSub ? 'rotate-90' : ''}`} />
                    </button>

                    {showDevSub && (
                      <div className="mt-1 ml-2 pl-2 border-l border-[var(--kilang-border-std)] space-y-1 animate-in slide-in-from-left-2 duration-200">
                        {/* Workspace Section */}
                        <div className="px-3 pt-3 pb-1 border-b border-[var(--kilang-border-std)] mb-1">
                          <span className="text-[7px] font-black uppercase text-[var(--kilang-text-muted)] tracking-[0.2em]">Layout & Workspaces</span>
                        </div>
                        <DevToolItem
                          label="Filter Panel"
                          goal="Toggle the left-side root navigation and search panel."
                          isOn={showFilterPanel}
                          onClick={() => dispatch({ type: 'SET_UI', showFilterPanel: !showFilterPanel })}
                        />
                        <DevToolItem
                          label="Explorer Panel"
                          goal="Toggle the right-side data inspection and property view panel."
                          isOn={showRightSidebar}
                          onClick={() => dispatch({ type: 'SET_UI', showRightSidebar: !showRightSidebar })}
                        />
                        <DevToolItem
                          label="Tree Tab"
                          goal="Toggle the visibility of the primary structural 'Tree' tab in the Explorer panel."
                          isOn={showTreeTab}
                          onClick={() => dispatch({ type: 'SET_UI', showTreeTab: !showTreeTab })}
                        />                        <DevToolItem
                          label="Theme Bar"
                          goal="Toggle the visual aesthetics and landing view customization panel."
                          isOn={showThemeBar}
                          onClick={() => dispatch({ type: 'SET_UI', showThemeBar: !showThemeBar })}
                        />
                        <DevToolItem
                          label="Visual Toolbox"
                          goal="Enable the floating control panel for manual layout property tuning."
                          isOn={showDevTools}
                          onClick={() => {
                            const nextVal = !showDevTools;
                            dispatch({ type: 'SET_UI', showDevTools: nextVal });
                            updateLayoutConfig({ showToolbox: nextVal });
                          }}
                        />

                        {/* Diagnostics Section */}
                        <div className="px-3 pt-3 pb-1 border-b border-[var(--kilang-border-std)] mt-1 mb-1">
                          <span className="text-[7px] font-black uppercase text-[var(--kilang-text-muted)] tracking-[0.2em]">Performance & Spatial</span>
                        </div>
                        <DevToolItem
                          label="Dimensions"
                          goal="Show viewport and canvas logical coordinate tables for spatial diagnostics."
                          isOn={showDimensions}
                          onClick={() => dispatch({ type: 'SET_UI', showDimensions: !showDimensions })}
                        />
                        <DevToolItem
                          label="Perf Monitor"
                          goal="Monitor real-time engine performance and frame rate (FPS)."
                          isOn={showPerfMonitor}
                          onClick={() => dispatch({ type: 'SET_UI', showPerfMonitor: !showPerfMonitor })}
                        />

                        {/* Experimental Section */}
                        <div className="px-3 pt-3 pb-1 border-b border-[var(--kilang-border-std)] mt-1 mb-1">
                          <span className="text-[7px] font-black uppercase text-[var(--kilang-text-muted)] tracking-[0.2em]">Engine Experimental</span>
                        </div>
                        <DevToolItem
                          label="Gravity Debug"
                          goal="[Disabled] Visualize row/tier bounding boxes and spatial constraints."
                          isPlaceholder
                        />
                        <DevToolItem
                          label="Skeleton Mode"
                          goal="[Disabled] Hide node semantics to visualize raw graph architecture."
                          isPlaceholder
                        />
                        <DevToolItem
                          label="Node Inspector"
                          goal="[Disabled] Deep-inspect raw JSON metadata of hovered forest nodes."
                          isPlaceholder
                        />
                        <DevToolItem
                          label="State Snapshot"
                          goal="[Disabled] Capture current layout/zoom/config for development reproduction."
                          isPlaceholder
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>



          </div>
        )}
      </div>
    </header>
  );
};
