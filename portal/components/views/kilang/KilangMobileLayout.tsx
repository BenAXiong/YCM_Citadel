'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Settings2, 
  ChevronLeft, 
  Maximize2, 
  RotateCcw,
  LayoutGrid,
  Zap,
  Layers,
  Info,
  Languages,
  Palette,
  FileText
} from 'lucide-react';
import { KilangState, KilangAction } from './kilangReducer';
import { KilangCanvas } from './KilangCanvas';
import { StatsOverlay } from './StatsOverlay';
import { UILang, UIStrings } from '@/types';

interface KilangMobileLayoutProps {
  state: KilangState;
  dispatch: React.Dispatch<KilangAction>;
  nodeMap: any;
  fetchRootDetails: (root: string) => Promise<void>;
  fetchSummary: (word: string) => Promise<void>;
  filteredRoots: any[];
  bucketHits: Record<string, number>;
  FILTER_BUCKETS: any[];
  MOE_SOURCES: any[];
  sourceCounts: Record<string, { r: number; e: number }>;
  handleExport: () => Promise<void>;
  treeRef: React.RefObject<HTMLDivElement | null>;
  uiLang: UILang;
  toggleUiLang: () => void;
  s: UIStrings;
}

export const KilangMobileLayout = ({
  state,
  dispatch,
  nodeMap,
  fetchRootDetails,
  fetchSummary,
  filteredRoots,
  bucketHits,
  FILTER_BUCKETS,
  MOE_SOURCES,
  sourceCounts,
  handleExport,
  treeRef,
  uiLang,
  toggleUiLang,
  s,
}: KilangMobileLayoutProps) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const {
    stats,
    selectedRoot,
    rootData,
    summaryCache,
    direction,
    arrangement,
    scale,
    isFit,
    morphMode,
    sourceFilter,
    searchTerm,
  } = state;

  return (
    <div className="kilang-container flex flex-col h-screen overflow-hidden bg-[var(--kilang-bg-base)] text-[var(--kilang-text)]">
      {/* 1. Mobile Header */}
      <header className="h-14 border-b border-[var(--kilang-border-std)] flex items-center justify-between px-4 bg-[var(--kilang-bg-base)]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSearch(true)}
            className="p-2 rounded-lg bg-[var(--kilang-ctrl-bg)] text-[var(--kilang-primary)] hover:bg-[var(--kilang-ctrl-active)]/10 active:scale-95 transition-all"
          >
            <Search className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <img 
              src="/kilang/Kilang_5_nobg.png" 
              alt="Kilang" 
              className="w-11 h-11 object-contain drop-shadow-[0_0_10px_var(--kilang-primary-glow)]"
            />
            <span className="text-xs font-bold text-[var(--kilang-text)] truncate max-w-[120px]">
              {selectedRoot || 'Select Root'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
             onClick={toggleUiLang}
             className="p-2 rounded-lg bg-[var(--kilang-ctrl-bg)] text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)] hover:bg-[var(--kilang-ctrl-bg)] active:scale-95 transition-all"
             title="Toggle Language"
          >
            <Languages className="w-4 h-4" />
          </button>
          <button 
             onClick={() => dispatch({ type: 'SET_UI', showThemeBar: !state.showThemeBar })}
             className={`p-2 rounded-lg active:scale-95 transition-all ${state.showThemeBar ? 'bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)] shadow-lg shadow-[var(--kilang-primary-glow)]' : 'bg-[var(--kilang-ctrl-bg)] text-[var(--kilang-text-muted)]'}`}
             title="Aesthetics"
          >
            <Palette className="w-4 h-4" />
          </button>
          <button 
             onClick={() => dispatch({ type: 'SET_TRANSFORM', isFit: !isFit })}
             className={`p-2 rounded-lg active:scale-95 transition-all ${isFit ? 'bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)] shadow-lg shadow-[var(--kilang-primary-glow)]' : 'bg-[var(--kilang-ctrl-bg)] text-[var(--kilang-text-muted)]'}`}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg bg-[var(--kilang-ctrl-bg)] text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)] hover:bg-[var(--kilang-ctrl-bg)] active:scale-95 transition-all"
          >
            <Settings2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. Main Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        <KilangCanvas
          selectedRoot={selectedRoot}
          rootData={rootData}
          direction={direction}
          arrangement={arrangement}
          nodeMap={nodeMap}
          isFit={isFit}
          scale={scale}
          treeRef={treeRef}
          fetchRootDetails={fetchRootDetails}
          summaryCache={summaryCache}
          fetchSummary={fetchSummary}
          stats={stats}
          fitTransform={state.fitTransform}
          layoutConfig={state.layoutConfig}
          showDimensions={state.showDimensions}
          showPerfMonitor={state.showPerfMonitor}
          resetToken={state.resetToken}
          logoStyle={state.logoStyles[state.landingVersion]}
          logoSettings={state.logoSettings[state.landingVersion]}
          moveZoomToCanvas={state.moveZoomToCanvas}
          moveGrowthToCanvas={state.moveGrowthToCanvas}
          moveCaptureToCanvas={state.moveCaptureToCanvas}
          moveChainToCanvas={state.moveChainToCanvas}
          setScale={(s: number | ((prev: number) => number)) => {
            const val = typeof s === 'function' ? s(scale) : s;
            dispatch({ type: 'SET_TRANSFORM', scale: val });
          }}
          setIsFit={(f: boolean) => dispatch({ type: 'SET_TRANSFORM', isFit: f })}
          setDirection={(d: string) => dispatch({ type: 'SET_LAYOUT', direction: d as any })}
          setArrangement={(a: string) => dispatch({ type: 'SET_LAYOUT', arrangement: a as any })}
          handleExport={handleExport}
          exportSettings={state.exportSettings}
          showExportDropdown={state.showExportDropdown}
          exporting={state.exporting}
          dispatch={dispatch}
        />

        {/* Floating Quick Stats */}
        {selectedRoot && (
            <div className="absolute bottom-6 left-4 right-4 pointer-events-none">
              <div className="bg-[var(--kilang-bg-base)]/90 backdrop-blur-xl border border-[var(--kilang-border-std)] rounded-2xl p-3 flex items-center justify-between pointer-events-auto shadow-[var(--kilang-shadow-primary)]">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-[var(--kilang-primary)]/20 flex items-center justify-center border border-[var(--kilang-primary-border)]/30">
                     <Zap className="w-4 h-4 text-[var(--kilang-primary)]" />
                   </div>
                   <div>
                     <div className="text-[10px] font-black text-[var(--kilang-text-muted)] uppercase tracking-widest">Branches</div>
                     <div className="text-sm font-black text-[var(--kilang-text)]">{rootData?.length || 0} nodes populated</div>
                   </div>
                 </div>
                 <button 
                   onClick={() => dispatch({ type: 'SET_UI', showStatsOverlay: true })}
                   className="px-3 py-1.5 rounded-lg bg-[var(--kilang-ctrl-bg)] text-[10px] font-black text-[var(--kilang-text-muted)] uppercase tracking-widest border border-[var(--kilang-border-std)]"
                 >
                   Full Stats
                 </button>
              </div>
            </div>
        )}
      </div>

      {/* 3. Search Overlay (Full Screen) */}
      {showSearch && (
        <div className="fixed inset-0 z-[100] bg-[var(--kilang-bg-base)] flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-300">
          <header className="h-14 border-b border-[var(--kilang-border-std)] flex items-center px-4 gap-4">
            <button 
              onClick={() => setShowSearch(false)}
              className="p-2 -ml-2 text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)]"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--kilang-text-muted)]/40" />
              <input 
                autoFocus
                type="text"
                placeholder="Search ultimate roots..."
                value={searchTerm}
                onChange={(e) => dispatch({ type: 'SET_UI', searchTerm: e.target.value })}
                className="w-full bg-[var(--kilang-ctrl-bg)] border border-[var(--kilang-border-std)] rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[var(--kilang-primary-border)]/50 transition-all"
              />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="grid grid-cols-1 gap-2">
              {filteredRoots.slice(0, 50).map((r: any) => (
                <button
                  key={r.root}
                  onClick={() => {
                    fetchRootDetails(r.root);
                    setShowSearch(false);
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    selectedRoot === r.root 
                      ? 'bg-[var(--kilang-ctrl-active)]/20 border-[var(--kilang-primary-border)]/50 text-[var(--kilang-text)]' 
                      : 'bg-[var(--kilang-ctrl-bg)] border-[var(--kilang-border-std)] text-[var(--kilang-text-muted)] hover:bg-[var(--kilang-ctrl-active)]/10 hover:text-[var(--kilang-text)]'
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-bold tracking-tight">{r.root}</span>
                    <span className="text-[10px] opacity-40 uppercase font-black">{r.ultimate_root || 'UNKNOWN ROOT'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-[var(--kilang-ctrl-bg)] px-2 py-1 rounded-md">{r.count}</span>
                    <ChevronLeft className="w-4 h-4 opacity-20 rotate-180" />
                  </div>
                </button>
              ))}
              {filteredRoots.length === 0 && (
                <div className="py-20 text-center opacity-40">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="text-sm">No roots found matching "{searchTerm}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Settings Sheet */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] bg-[var(--kilang-bg-base)]/40 backdrop-blur-sm" onClick={() => setShowSettings(false)}>
          <div 
            className="absolute bottom-0 left-0 right-0 bg-[var(--kilang-bg-base)] border-t border-[var(--kilang-border-std)] rounded-t-[32px] p-6 pb-12 animate-in slide-in-from-bottom duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-[var(--kilang-border-std)] rounded-full mx-auto mb-8" />
            
            <h2 className="text-xl font-black mb-6 flex items-center gap-3">
              <Settings2 className="w-5 h-5 text-[var(--kilang-primary)]" />
              Engine Settings
            </h2>

            <div className="space-y-6">
              {/* Morph Mode */}
              <section>
                <div className="text-[10px] font-black text-[var(--kilang-text-muted)] uppercase tracking-widest mb-3">Morphology Mode</div>
                <div className="grid grid-cols-3 gap-2">
                  {['moe', 'plus', 'star'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => dispatch({ type: 'SET_CONFIG', morphMode: mode as any })}
                      className={`py-3 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all ${
                        morphMode === mode 
                          ? 'bg-[var(--kilang-ctrl-active)] border-[var(--kilang-primary-border)] text-[var(--kilang-ctrl-active-text)] shadow-lg shadow-[var(--kilang-primary-glow)]' 
                          : 'bg-[var(--kilang-ctrl-bg)] border-[var(--kilang-border-std)] text-[var(--kilang-text-muted)]'
                      }`}
                    >
                      {mode === 'moe' ? 'MoE' : mode === 'plus' ? 'MoE+' : 'MoE*'}
                    </button>
                  ))}
                </div>
              </section>

              {/* MOE Source Filter (Only visible if MoE mode is selected) */}
              {morphMode === 'moe' && (
                <section className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="text-[10px] font-black text-[var(--kilang-text-muted)] uppercase tracking-widest mb-3">MoE Source Filter</div>
                  <div className="flex flex-wrap gap-2">
                    {MOE_SOURCES.map((s) => {
                       const isActive = sourceFilter === s.id;
                       return (
                        <button
                          key={s.id}
                          onClick={() => dispatch({ type: 'SET_CONFIG', sourceFilter: s.id })}
                          className={`px-4 py-2 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                            isActive 
                              ? 'bg-[var(--kilang-ctrl-active)] border-[var(--kilang-primary-border)] text-[var(--kilang-ctrl-active-text)] shadow-lg shadow-[var(--kilang-primary-glow)]' 
                              : 'bg-[var(--kilang-ctrl-bg)] border-[var(--kilang-border-std)] text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)]'
                          }`}
                        >
                          <span>{s.label}</span>
                          <span className={`opacity-40 font-mono text-[8px] ${isActive ? 'text-[var(--kilang-ctrl-active-text)]' : ''}`}>
                            ({s.id === 'ALL' 
                              ? `${Object.values(sourceCounts || {}).reduce((a, b: any) => a + (b.r || 0), 0).toLocaleString()}/${Object.values(sourceCounts || {}).reduce((a, b: any) => a + (b.e || 0), 0).toLocaleString()}` 
                              : sourceCounts?.[s.id] 
                                  ? `${sourceCounts[s.id].r.toLocaleString()}/${sourceCounts[s.id].e.toLocaleString()}` 
                                  : '.../...'
                            })
                          </span>
                        </button>
                       );
                    })}
                  </div>
                </section>
              )}

              {/* Layout Control */}
              <section>
                <div className="text-[10px] font-black text-[var(--kilang-text-muted)] uppercase tracking-widest mb-3">Layout & Direction</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => dispatch({ type: 'SET_LAYOUT', direction: direction === 'vertical' ? 'horizontal' : 'vertical' as any })}
                    className="p-4 rounded-xl bg-[var(--kilang-ctrl-bg)] border border-[var(--kilang-border-std)] flex items-center gap-3"
                  >
                    <LayoutGrid className={`w-5 h-5 ${direction === 'vertical' ? 'rotate-90' : ''} transition-transform text-[var(--kilang-primary)]`} />
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-bold uppercase tracking-widest">Axis</span>
                      <span className="text-[10px] opacity-40 uppercase">{direction}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'SET_LAYOUT', arrangement: arrangement === 'aligned' ? 'flow' : 'aligned' as any })}
                    className="p-4 rounded-xl bg-[var(--kilang-ctrl-bg)] border border-[var(--kilang-border-std)] flex items-center gap-3"
                  >
                    <Layers className="w-5 h-5 text-[var(--kilang-primary)]" />
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-bold uppercase tracking-widest">Flow</span>
                      <span className="text-[10px] opacity-40 uppercase">{arrangement}</span>
                    </div>
                  </button>
                </div>
              </section>

              {/* View Options */}
              <section>
                <div className="text-[10px] font-black text-[var(--kilang-text-muted)] uppercase tracking-widest mb-3">View Options</div>
                <button
                  onClick={() => dispatch({ type: 'SET_UI', showTreeTab: !state.showTreeTab })}
                  className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                    state.showTreeTab 
                      ? 'bg-[var(--kilang-ctrl-active)]/10 border-[var(--kilang-primary-border)]/50 text-[var(--kilang-text)] shadow-lg shadow-[var(--kilang-primary-glow)]/10' 
                      : 'bg-[var(--kilang-ctrl-bg)] border-[var(--kilang-border-std)] text-[var(--kilang-text-muted)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${state.showTreeTab ? 'bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)]' : 'bg-[var(--kilang-ctrl-bg)] text-[var(--kilang-text-muted)]'}`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-bold uppercase tracking-widest text-left">Tree Tab</span>
                      <span className="text-[10px] opacity-40 uppercase text-left">Enable structural hierarchy view</span>
                    </div>
                  </div>
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors relative ${state.showTreeTab ? 'bg-[var(--kilang-primary)]' : 'bg-[var(--kilang-ctrl-bg)]'}`}>
                    <div className={`w-3 h-3 bg-[var(--kilang-text)] rounded-full transition-transform ${state.showTreeTab ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </button>
              </section>

              {/* Actions */}
              <section className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => {
                    dispatch({ type: 'RESET_TRANSFORM' });
                    setShowSettings(false);
                  }}
                  className="p-4 rounded-xl bg-[var(--kilang-ctrl-bg)] border border-[var(--kilang-border-std)] flex items-center gap-3"
                >
                  <RotateCcw className="w-5 h-5 text-[var(--kilang-text-muted)]" />
                  <span className="text-xs font-bold uppercase tracking-widest">Reset View</span>
                </button>
                <button 
                  onClick={() => {
                    handleExport();
                    setShowSettings(false);
                  }}
                  className="p-4 rounded-xl bg-[var(--kilang-ctrl-active)] border border-[var(--kilang-primary-border)] flex items-center gap-3 text-[var(--kilang-ctrl-active-text)]"
                >
                  <Info className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Export PNG</span>
                </button>
              </section>
            </div>
          </div>
        </div>
      )}

      <StatsOverlay
        showStatsOverlay={state.showStatsOverlay}
        setShowStatsOverlay={(v: boolean) => dispatch({ type: 'SET_UI', showStatsOverlay: v })}
        stats={stats}
        visibleChainsCount={state.visibleChainsCount}
        setVisibleChainsCount={(c: number | ((prev: number) => number)) => {
          const val = typeof c === 'function' ? c(state.visibleChainsCount) : c;
          dispatch({ type: 'SET_UI', visibleChainsCount: val });
        }}
        fetchRootDetails={fetchRootDetails}
        summaryCache={summaryCache}
        fetchSummary={fetchSummary}
        manifest={state.manifest}
        sourceFilter={sourceFilter}
      />
    </div>
  );
};
