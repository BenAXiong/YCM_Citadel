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
  TrendingUp,
  ArrowRight,
  ArrowUp,
  LayoutGrid,
  Rows,
  Settings2,
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

interface CompactMetricProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  description: string;
}

const CompactMetric = ({ icon, label, value, color, description }: CompactMetricProps) => {
  const colorMap: any = { blue: 'text-blue-400', indigo: 'text-indigo-400', emerald: 'text-emerald-400', red: 'text-red-400', rose: 'text-rose-400' };

  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white/[0.02] border border-white/10 rounded-xl hover:bg-white/[0.05] transition-all shrink-0 cursor-help group/metric relative" title={description}>
      <div className={`${colorMap[color] || 'text-blue-400'} opacity-70 group-hover/metric:opacity-100 transition-opacity`}>{icon}</div>
      <div className="flex flex-col">
        <span className="text-[7px] font-black uppercase tracking-widest leading-none mb-0.5 text-kilang-text-muted">{label}</span>
        <span className={`text-sm font-black ${colorMap[color] || 'text-white'} leading-none font-mono`}>
          {value !== undefined && value !== null ? value.toLocaleString() : '---'}
        </span>
      </div>

      {/* Detailed Tooltip Overlay */}
      <div className="absolute top-full right-0 mt-2 w-48 bg-[#0f172a] border border-white/10 p-3 rounded-xl shadow-2xl opacity-0 invisible group-hover/metric:opacity-100 group-hover/metric:visible transition-all z-[9999] pointer-events-none">
        <p className="text-[10px] text-gray-400 leading-relaxed font-medium">{description}</p>
      </div>
    </div>
  );
};

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
  setMorphMode: (mode: MorphMode) => void;
  setSourceFilter: (filter: string) => void;
  setShowStatsOverlay: (show: boolean) => void;
  setDirection: (dir: LayoutDirection) => void;
  setArrangement: (arr: LayoutArrangement) => void;
  setScale: (scale: number | ((prev: number) => number)) => void;
  setIsFit: (fit: boolean) => void;
  updateLayoutConfig: (config: Partial<KilangState['layoutConfig']>) => void;
  handleExport: () => Promise<void>;
  MOE_SOURCES: Array<{ id: string; label: string }>;
  showStats: boolean;
  showDimensions: boolean;
  showDevTools: boolean;
  showFilterPanel: boolean;
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
  setMorphMode,
  setSourceFilter,
  setShowStatsOverlay,
  setDirection,
  setArrangement,
  setScale,
  setIsFit,
  updateLayoutConfig,
  handleExport,
  MOE_SOURCES,
  showStats,
  showDimensions,
  showDevTools,
  showFilterPanel,
  dispatch
}: KilangHeaderProps & { dispatch: React.Dispatch<any> }) => {
  const [showSettings, setShowSettings] = React.useState(false);

  return (
    <header className="h-16 border-b border-white/5 bg-[#020617]/80 backdrop-blur-md flex items-center justify-between px-6 z-50 shrink-0">
      <div className="flex items-center gap-6">
        {/* 1. Logo & Title */}
        <div className="flex items-center gap-3 group cursor-default">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <GitBranch className="text-white w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white tracking-[0.2em] leading-none uppercase">KILANG</span>
              <span className="text-[8px] font-black text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded uppercase tracking-widest">BETA</span>
            </div>
            <span className="text-[8px] font-black text-blue-400/60 uppercase tracking-widest mt-1">MORPHO-ENGINE</span>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-white/10 mx-1" />

        {/* 2. Morphology Mode Selector + Source Dropdown */}
        <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5 h-8 items-stretch relative">
          {(['moe', 'plus', 'star'] as const).map(mode => {
            if (mode === 'moe') {
              return (
                <div key={mode} className="relative group flex h-full">
                  <button
                    onClick={() => setMorphMode('moe')}
                    className={`px-3 h-full flex items-center justify-center rounded text-[10px] font-black tracking-widest transition-all ${morphMode === 'moe'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-kilang-text-muted hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{sourceFilter === 'ALL' || morphMode !== 'moe' ? 'MoE' : (MOE_SOURCES.find(s => s.id === sourceFilter)?.label.split(' ')[0] || 'MoE')}</span>
                      <ChevronDown className="w-2.5 h-2.5 opacity-40 shrink-0" />
                    </div>
                  </button>

                  <div className="absolute top-full left-0 mt-1 w-48 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl p-1 hidden group-hover:block z-[3000] animate-in fade-in duration-200">
                    {MOE_SOURCES.map(s => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setSourceFilter(s.id);
                          setMorphMode('moe');
                        }}
                        className={`w-full text-left px-4 py-2 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all ${sourceFilter === s.id && morphMode === 'moe' ? 'bg-blue-600 text-white' : 'text-kilang-text-muted hover:bg-white/5 hover:text-white'}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            }
            return (
              <button
                key={mode}
                onClick={() => setMorphMode(mode)}
                className={`px-3 flex items-center justify-center rounded text-[10px] font-black tracking-widest transition-all ${morphMode === mode
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-kilang-text-muted hover:bg-white/5 hover:text-white'
                  }`}
              >
                {mode === 'plus' ? 'MoE+' : 'MoE*'}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Word + Views + Zoom + Export */}
      <div className="flex-1 flex items-center justify-center px-8 border-x border-white/5 mx-6 h-full">
        {selectedRoot ? (
          <div className="flex items-center gap-6 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2.5">
                <span className="text-[8px] font-black text-kilang-text-muted uppercase tracking-widest">Growth</span>
                <div className="flex items-center gap-1 p-0.5 bg-white/5 border border-white/10 rounded-lg">
                  <button
                    onClick={() => setDirection('horizontal')}
                    className={`w-8 h-7 flex items-center justify-center rounded transition-all ${direction === 'horizontal' ? 'bg-blue-600 text-white shadow-lg' : 'text-kilang-text-muted hover:text-white hover:bg-white/5'}`}
                    title="Horizontal Growth"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDirection('vertical')}
                    className={`w-8 h-7 flex items-center justify-center rounded transition-all ${direction === 'vertical' ? 'bg-blue-600 text-white shadow-lg' : 'text-kilang-text-muted hover:text-white hover:bg-white/5'}`}
                    title="Vertical Growth"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-[8px] font-black text-kilang-text-muted uppercase tracking-widest">Pattern</span>
                <div className="flex items-center gap-1 p-0.5 bg-white/5 border border-white/10 rounded-lg">
                  <button
                    onClick={() => setArrangement('flow')}
                    className={`w-8 h-7 flex items-center justify-center rounded transition-all ${arrangement === 'flow' ? 'bg-blue-600 text-white shadow-lg' : 'text-kilang-text-muted hover:text-white hover:bg-white/5'}`}
                    title="Flow (Organized Groups)"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setArrangement('aligned')}
                    className={`w-8 h-7 flex items-center justify-center rounded transition-all ${arrangement === 'aligned' ? 'bg-blue-600 text-white shadow-lg' : 'text-kilang-text-muted hover:text-white hover:bg-white/5'}`}
                    title="Aligned (Chain Selection)"
                  >
                    <Rows className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {showDevTools && (
                <div className="flex items-center gap-1 p-0.5 bg-white/5 border border-white/10 rounded-lg">
                  <button
                    onClick={() => updateLayoutConfig({ showToolbox: !layoutConfig.showToolbox })}
                    className={`w-8 h-7 flex items-center justify-center rounded transition-all ${layoutConfig.showToolbox ? 'bg-blue-600 text-white shadow-lg' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                    title="Toggle Visual Toolbox"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="w-[1px] h-8 bg-white/5" />

            <div className="flex items-center gap-1 p-0.5 bg-white/5 border border-white/10 rounded-lg">
              <button
                onClick={() => setIsFit(!isFit)}
                className={`w-8 h-7 flex items-center justify-center rounded transition-all shadow-sm ${isFit ? 'bg-blue-600 text-white shadow-lg' : 'text-kilang-text-muted hover:text-white hover:bg-white/5'}`}
                title="Smart Fit Tree"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
              <button onClick={() => { setScale(1); setIsFit(false); }} className={`w-8 h-7 flex items-center justify-center rounded hover:bg-white/10 transition-all shadow-sm ${!isFit && scale === 1 ? 'text-blue-400' : 'text-kilang-text-muted'}`} title="Reset Zoom">
                <RotateCcw className="w-3 h-3" />
              </button>
              <button onClick={() => { setScale(prev => Math.max(0.2, (typeof prev === 'number' ? prev : 1) - 0.1)); setIsFit(false); }} className="w-8 h-7 flex items-center justify-center rounded hover:bg-white/10 text-kilang-text-muted hover:text-white transition-all shadow-sm" title="Out">
                <Minus className="w-3 h-3" />
              </button>
              <button onClick={() => { setScale(prev => Math.min(2, (typeof prev === 'number' ? prev : 1) + 0.1)); setIsFit(false); }} className="w-8 h-7 flex items-center justify-center rounded hover:bg-white/10 text-kilang-text-muted hover:text-white transition-all shadow-sm" title="In">
                <Plus className="w-3 h-3" />
              </button>
              <div className="w-[1px] h-4 bg-white/10 mx-1" />
              <button
                onClick={handleExport}
                className="w-8 h-7 flex items-center justify-center rounded text-kilang-text-muted hover:bg-blue-600 hover:text-white transition-all shadow-md"
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
      <div className="flex items-center gap-2">
        {stats && showStats && (
          <>
            <CompactMetric
              icon={<Boxes className="w-3 h-3" />}
              label="Stems"
              value={stats.summary.total_roots}
              color="blue"
              description="Total unique semantic roots identified in the database."
            />
            <CompactMetric
              icon={<Activity className="w-3 h-3" />}
              label="Branching"
              value={stats.summary.average_branching}
              color="indigo"
              description="Average number of derived forms per semantic root."
            />
            <CompactMetric
              icon={<TrendingUp className="w-3 h-3" />}
              label="Flowers"
              value={stats.summary.total_words}
              color="rose"
              description="Total vocabulary words mapped to established roots."
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

            {/* Gear Settings Button */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${showSettings ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white/5 border-white/10 text-kilang-text-muted hover:border-white/30 hover:text-white'}`}
                title="Engine Settings"
              >
                <Settings2 className="w-5 h-5" />
              </button>

              {showSettings && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl p-2 z-[4000] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-2 text-[8px] font-black text-white/30 uppercase tracking-widest border-b border-white/5 mb-1">Visibility</div>
                  <button
                    onClick={() => {
                      const nextVal = !showDevTools;
                      dispatch({ type: 'SET_UI', showDevTools: nextVal });
                      updateLayoutConfig({ showToolbox: nextVal });
                    }}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-white/5 transition-all group"
                  >
                    <span className="text-[10px] font-black uppercase text-kilang-text-muted group-hover:text-white">Dev Tools</span>
                    <div className={`w-3 h-3 rounded-full border-2 ${showDevTools ? 'bg-blue-500 border-blue-400' : 'border-white/20'}`} />
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'SET_UI', showStats: !showStats })}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-white/5 transition-all group"
                  >
                    <span className="text-[10px] font-black uppercase text-kilang-text-muted group-hover:text-white">Stats Bar</span>
                    <div className={`w-3 h-3 rounded-full border-2 ${showStats ? 'bg-indigo-500 border-indigo-400' : 'border-white/20'}`} />
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'SET_UI', showDimensions: !showDimensions })}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-white/5 transition-all group"
                  >
                    <span className="text-[10px] font-black uppercase text-kilang-text-muted group-hover:text-white">Dimensions</span>
                    <div className={`w-3 h-3 rounded-full border-2 ${showDimensions ? 'bg-rose-500 border-rose-400' : 'border-white/20'}`} />
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'SET_UI', showFilterPanel: !showFilterPanel })}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-white/5 transition-all group"
                  >
                    <span className="text-[10px] font-black uppercase text-kilang-text-muted group-hover:text-white">Filter Panel</span>
                    <div className={`w-3 h-3 rounded-full border-2 ${showFilterPanel ? 'bg-emerald-500 border-emerald-400' : 'border-white/20'}`} />
                  </button>
                </div>
              )}
            </div>

            <div className="w-8 h-10 border border-white/5 bg-white/[0.01] rounded-xl border-dashed opacity-20 ml-2" />
          </div>
        )}
      </div>
    </header>
  );
};
