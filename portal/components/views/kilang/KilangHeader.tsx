'use client';

import React from 'react';
import {
  GitBranch,
  Activity,
  ChevronDown,
  RotateCcw,
  Minus,
  Plus,
  ImageIcon,
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
  Share2
} from 'lucide-react';
import { MorphMode, LayoutDirection, LayoutArrangement, KilangState } from './kilangReducer';
import { WeavingPattern } from './WeavingPattern';

// Extracted Components
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
  showPerfMonitor: boolean;
  showThemeBar: boolean;
  dispatch: any;
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
  showPerfMonitor,
  showThemeBar,
  dispatch
}: KilangHeaderProps) => {
  const [showSettings, setShowSettings] = React.useState(false);
  const [isPinned, setIsPinned] = React.useState(false);
  const [showDevSub, setShowDevSub] = React.useState(false);
  const settingsRef = React.useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = React.useRef<any>(null);

  // Auto-close on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
        setIsPinned(false);
        setShowDevSub(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-white/5 bg-[#020617]/80 backdrop-blur-md flex items-center justify-between px-3 lg:px-6 z-50 shrink-0">
      <div className="flex items-center gap-2 sm:gap-6 shrink-0">
        {/* 1. Logo & Title */}
        <button
          onClick={() => dispatch({ type: 'SET_ROOT', root: null })}
          className="flex items-center gap-3 group cursor-pointer hover:opacity-80 active:scale-95 transition-all outline-none"
        >
          <div className="w-14 h-14 relative flex items-center justify-center group-hover:scale-110 transition-all duration-300">
            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <img 
              src="/kilang/Kilang_5_nobg.png" 
              alt="Kilang Logo" 
              className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]"
            />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white tracking-[0.2em] leading-none uppercase">KILANG</span>
              <span className="text-[8px] font-black text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded uppercase tracking-widest">BETA</span>
            </div>
            <span className="text-[8px] font-black text-blue-400/60 uppercase tracking-widest mt-1 hidden sm:inline-block">MORPHO-ENGINE</span>
          </div>
        </button>

        <div className="h-4 w-[1px] bg-white/10 mx-1" />

        {/* 2. Morphology Mode Selector + Source Dropdown */}
        <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5 h-8 items-stretch relative">
          {(['moe', 'plus', 'star'] as const).map(mode => {
            if (mode === 'moe') {
              return (
                <div key={mode} className="relative group flex h-full">
                  <button
                    onClick={() => setMorphMode('moe')}
                    className={`px-3 h-full kilang-ctrl-btn text-[10px] font-black tracking-widest ${morphMode === 'moe'
                      ? 'kilang-ctrl-btn-active'
                      : 'kilang-ctrl-btn-inactive'
                      }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{sourceFilter === 'ALL' || morphMode !== 'moe' ? 'MoE' : (MOE_SOURCES.find((s: { id: string; label: string }) => s.id === sourceFilter)?.label.split(' ')[0] || 'MoE')}</span>
                      <ChevronDown className="w-2.5 h-2.5 opacity-40 shrink-0" />
                    </div>
                  </button>

                    <div className="absolute top-full left-0 mt-1 w-56 bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-1 hidden group-hover:block z-[3000] animate-in fade-in slide-in-from-top-2 duration-200">
                      {MOE_SOURCES.map((s: { id: string; label: string }) => {
                        const colors: Record<string, string> = {
                          'p': 'bg-[#3366cc]',
                          'm': 'bg-[#c07b0c]',
                          's': 'bg-[#e53e3e]',
                          'a': 'bg-[#8e44ad]',
                          'old-s': 'bg-[#718096]',
                          'ALL': 'bg-blue-600'
                        };
                        const isActive = sourceFilter === s.id && morphMode === 'moe';
                        return (
                          <button
                            key={s.id}
                            onClick={() => {
                              setSourceFilter(s.id);
                              setMorphMode('moe');
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all flex items-center gap-3 ${isActive ? `${colors[s.id] || 'bg-blue-600'} text-white shadow-lg` : 'text-kilang-text-muted hover:bg-white/5 hover:text-white'}`}
                          >
                            <div className={`w-2 h-2 rounded-full ${colors[s.id] || 'bg-white/20'} ${isActive ? 'ring-2 ring-white/30' : ''}`} />
                            <span className="flex-1">{s.label}</span>
                            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-kilang-text-muted'}`}>
                              {s.id === 'ALL' 
                                ? `${Object.values(sourceCounts).reduce((a, b: any) => a + (b.r || 0), 0).toLocaleString()}/${Object.values(sourceCounts).reduce((a, b: any) => a + (b.e || 0), 0).toLocaleString()}` 
                                : sourceCounts[s.id] 
                                    ? `${sourceCounts[s.id].r.toLocaleString()}/${sourceCounts[s.id].e.toLocaleString()}` 
                                    : '.../...'
                              }
                            </span>
                            {isActive && <div className="w-1 h-1 rounded-full bg-white animate-pulse" />}
                          </button>
                        );
                      })}
                    </div>
                </div>
              );
            }
            return (
              <button
                key={mode}
                onClick={() => setMorphMode(mode)}
                className={`px-3 kilang-ctrl-btn h-full text-[10px] font-black tracking-widest ${morphMode === mode
                  ? 'kilang-ctrl-btn-active'
                  : 'kilang-ctrl-btn-inactive'
                  }`}
              >
                {mode === 'plus' ? 'MoE+' : 'MoE*'}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Word + Views + Zoom + Export */}
      <div className="flex-1 min-w-0 flex items-center justify-center px-3 lg:px-8 border-x border-white/5 mx-2 lg:mx-6 h-full overflow-hidden">
        {selectedRoot ? (
          <div className="flex items-center gap-6 animate-in fade-in slide-in-from-top-2 duration-500 shrink-0">
            <div className="flex items-center gap-3 lg:gap-6">
              <div className="flex items-center gap-2.5">
                <span className="text-[8px] font-black text-kilang-text-muted uppercase tracking-widest hidden lg:inline-block">Growth</span>
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
                <span className="text-[8px] font-black text-kilang-text-muted uppercase tracking-widest hidden lg:inline-block">Pattern</span>
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

              {showDevTools && (
                <div className="kilang-ctrl-container">
                  <button
                    onClick={() => updateLayoutConfig({ showToolbox: !layoutConfig.showToolbox })}
                    className={`w-8 h-7 kilang-ctrl-btn ${layoutConfig.showToolbox ? 'kilang-ctrl-btn-active' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                    title="Toggle Visual Toolbox"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="w-[1px] h-8 bg-white/5" />

            <div className="kilang-ctrl-container">
              <button
                onClick={() => setIsFit(!isFit)}
                className={`w-8 h-7 kilang-ctrl-btn ${isFit ? 'kilang-ctrl-btn-active' : 'kilang-ctrl-btn-inactive'}`}
                title={isFit ? "Expand to Actual Size" : "Fit Tree"}
              >
                {isFit ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
              </button>
              <button onClick={() => { setScale((prev: number) => Math.max(0.2, (typeof prev === 'number' ? prev : 1) - 0.1)); setIsFit(false); }} className="w-8 h-7 kilang-ctrl-btn kilang-ctrl-btn-inactive shadow-sm" title="Out">
                <Minus className="w-3 h-3" />
              </button>
              <button onClick={() => { setScale((prev: number) => Math.min(2, (typeof prev === 'number' ? prev : 1) + 0.1)); setIsFit(false); }} className="w-8 h-7 kilang-ctrl-btn kilang-ctrl-btn-inactive shadow-sm" title="In">
                <Plus className="w-3 h-3" />
              </button>
              <button onClick={() => dispatch({ type: 'RESET_TRANSFORM' })} className="w-8 h-7 kilang-ctrl-btn kilang-ctrl-btn-inactive shadow-sm" title="Reset Zoom">
                <RotateCcw className="w-3 h-3" />
              </button>
              <div className="w-[1px] h-4 bg-white/10 mx-1" />
              <button
                onClick={handleExport}
                className="w-8 h-7 kilang-ctrl-btn kilang-ctrl-btn-inactive hover:kilang-ctrl-btn-active shadow-md"
                title="Export as PNG"
              >
                <ImageIcon className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <WeavingPattern />
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
              label="Span"
              value={stats.summary.max_depth}
              color="emerald"
              description="Maximum morphological depth (evolutionary layers) found."
            />
          </>
        )}

        {stats && (
          <div className="flex items-center gap-2">
            <div className="w-[1px] h-4 bg-white/10 mx-1" />

            <button
              onClick={() => setShowStatsOverlay(true)}
              className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${showStatsOverlay ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-white/5 border-white/10 text-kilang-text-muted hover:border-white/30 hover:text-white'}`}
              title="Morphology Distribution"
            >
              <Activity className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowAffixesOverlay(true)}
              className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${showAffixesOverlay ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-white/5 border-white/10 text-kilang-text-muted hover:border-white/30 hover:text-white'}`}
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
                  }, 600); // 600ms grace period
                }
              }}
            >
              <button
                onClick={() => setIsPinned(!isPinned)}
                className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${showSettings || isPinned ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-white/5 border-white/10 text-kilang-text-muted hover:border-white/30 hover:text-white'}`}
                title="Engine Settings"
              >
                <Settings2 className={`w-5 h-5 transition-transform duration-500 ${isPinned ? 'rotate-90' : 'group-hover:rotate-12'}`} />
              </button>

              {showSettings && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 z-[4000] animate-in fade-in slide-in-from-top-2 duration-200">
                  {isPinned && (
                    <div className="absolute -top-2 -right-1 flex items-center gap-1 group">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse" />
                    </div>
                  )}

                  <button
                    onClick={() => dispatch({ type: 'SET_UI', showStats: !showStats })}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-white/5 transition-all group"
                  >
                    <span className="text-[10px] font-black uppercase text-kilang-text-muted group-hover:text-white">Stats Bar</span>
                    <div className={`w-3 h-3 rounded-full border-2 transition-all ${showStats ? 'bg-indigo-500 border-indigo-400' : 'border-white/20'}`} />
                  </button>


                  {/* Dev Tools Secondary Menu */}
                  <div className="mt-2 pt-2 border-t border-white/5">
                    <button
                      onMouseEnter={() => setShowDevSub(true)}
                      className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-white/10 transition-all group bg-blue-500/5"
                    >
                      <span className="text-[10px] font-black uppercase text-blue-400 group-hover:text-blue-300">Dev Tools</span>
                      <ChevronRight className={`w-3 h-3 text-blue-400/50 transition-transform ${showDevSub ? 'rotate-90' : ''}`} />
                    </button>

                    {showDevSub && (
                      <div className="mt-1 ml-2 pl-2 border-l border-white/10 space-y-1 animate-in slide-in-from-left-2 duration-200">
                        {/* Workspace Section */}
                        <div className="px-3 pt-3 pb-1 border-b border-white/5 mb-1">
                          <span className="text-[7px] font-black uppercase text-white/30 tracking-[0.2em]">Layout & Workspaces</span>
                        </div>
                        <DevToolItem
                          label="Filter Panel"
                          goal="Toggle the left-side root navigation and search panel."
                          isOn={showFilterPanel}
                          onClick={() => dispatch({ type: 'SET_UI', showFilterPanel: !showFilterPanel })}
                        />
                        <DevToolItem
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
                        <div className="px-3 pt-3 pb-1 border-b border-white/5 mt-1 mb-1">
                          <span className="text-[7px] font-black uppercase text-white/30 tracking-[0.2em]">Performance & Spatial</span>
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
                        <div className="px-3 pt-3 pb-1 border-b border-white/5 mt-1 mb-1">
                          <span className="text-[7px] font-black uppercase text-white/30 tracking-[0.2em]">Engine Experimental</span>
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
