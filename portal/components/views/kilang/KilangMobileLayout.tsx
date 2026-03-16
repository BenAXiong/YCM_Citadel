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
  Info
} from 'lucide-react';
import { KilangState, KilangAction } from './kilangReducer';
import { KilangCanvas } from './KilangCanvas';
import { StatsOverlay } from './StatsOverlay';

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
  handleExport: () => Promise<void>;
  treeRef: React.RefObject<HTMLDivElement | null>;
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
  handleExport,
  treeRef,
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
    searchTerm,
  } = state;

  return (
    <div className="kilang-container flex flex-col h-screen overflow-hidden bg-[#020617] text-white">
      {/* 1. Mobile Header */}
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-[#0a0f1e]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSearch(true)}
            className="p-2 rounded-lg bg-white/5 text-blue-400 hover:bg-white/10 active:scale-95 transition-all"
          >
            <Search className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none">Kilang</span>
            <span className="text-xs font-bold text-white truncate max-w-[120px]">
              {selectedRoot || 'Select Root'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
             onClick={() => dispatch({ type: 'SET_TRANSFORM', isFit: !isFit })}
             className={`p-2 rounded-lg active:scale-95 transition-all ${isFit ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-white/60'}`}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
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
          dispatch={dispatch}
        />

        {/* Floating Quick Stats */}
        {selectedRoot && (
           <div className="absolute bottom-6 left-4 right-4 pointer-events-none">
             <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex items-center justify-between pointer-events-auto shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <Zap className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Branches</div>
                    <div className="text-sm font-black text-white">{rootData?.length || 0} nodes populated</div>
                  </div>
                </div>
                <button 
                  onClick={() => dispatch({ type: 'SET_UI', showStatsOverlay: true })}
                  className="px-3 py-1.5 rounded-lg bg-white/5 text-[10px] font-black text-white/60 uppercase tracking-widest border border-white/5"
                >
                  Full Stats
                </button>
             </div>
           </div>
        )}
      </div>

      {/* 3. Search Overlay (Full Screen) */}
      {showSearch && (
        <div className="fixed inset-0 z-[100] bg-[#020617] flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-300">
          <header className="h-14 border-b border-white/5 flex items-center px-4 gap-4">
            <button 
              onClick={() => setShowSearch(false)}
              className="p-2 -ml-2 text-white/40 hover:text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                autoFocus
                type="text"
                placeholder="Search ultimate roots..."
                value={searchTerm}
                onChange={(e) => dispatch({ type: 'SET_UI', searchTerm: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
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
                      ? 'bg-blue-600/20 border-blue-500/50 text-white' 
                      : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-bold tracking-tight">{r.root}</span>
                    <span className="text-[10px] opacity-40 uppercase font-black">{r.ultimate_root || 'UNKNOWN ROOT'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-white/10 px-2 py-1 rounded-md">{r.count}</span>
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
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm" onClick={() => setShowSettings(false)}>
          <div 
            className="absolute bottom-0 left-0 right-0 bg-[#0a0f1e] border-t border-white/10 rounded-t-[32px] p-6 pb-12 animate-in slide-in-from-bottom duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
            
            <h2 className="text-xl font-black mb-6 flex items-center gap-3">
              <Settings2 className="w-5 h-5 text-blue-500" />
              Engine Settings
            </h2>

            <div className="space-y-6">
              {/* Morph Mode */}
              <section>
                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Morphology Mode</div>
                <div className="grid grid-cols-3 gap-2">
                  {['moe', 'plus', 'star'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => dispatch({ type: 'SET_CONFIG', morphMode: mode as any })}
                      className={`py-3 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all ${
                        morphMode === mode 
                          ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20' 
                          : 'bg-white/5 border-white/5 text-white/40'
                      }`}
                    >
                      {mode === 'moe' ? 'MoE' : mode === 'plus' ? 'MoE+' : 'MoE*'}
                    </button>
                  ))}
                </div>
              </section>

              {/* Layout Control */}
              <section>
                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Layout & Direction</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => dispatch({ type: 'SET_LAYOUT', direction: direction === 'vertical' ? 'horizontal' : 'vertical' as any })}
                    className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3"
                  >
                    <LayoutGrid className={`w-5 h-5 ${direction === 'vertical' ? 'rotate-90' : ''} transition-transform text-blue-400`} />
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-bold uppercase tracking-widest">Axis</span>
                      <span className="text-[10px] opacity-40 uppercase">{direction}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'SET_LAYOUT', arrangement: arrangement === 'aligned' ? 'flow' : 'aligned' as any })}
                    className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3"
                  >
                    <Layers className="w-5 h-5 text-blue-400" />
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-bold uppercase tracking-widest">Flow</span>
                      <span className="text-[10px] opacity-40 uppercase">{arrangement}</span>
                    </div>
                  </button>
                </div>
              </section>

              {/* Actions */}
              <section className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => {
                    dispatch({ type: 'SET_TRANSFORM', isFit: true });
                    setShowSettings(false);
                  }}
                  className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3"
                >
                  <RotateCcw className="w-5 h-5 text-white/40" />
                  <span className="text-xs font-bold uppercase tracking-widest">Reset View</span>
                </button>
                <button 
                  onClick={() => {
                    handleExport();
                    setShowSettings(false);
                  }}
                  className="p-4 rounded-xl bg-blue-600 border border-blue-400 flex items-center gap-3 text-white"
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
        setShowStatsOverlay={(v) => dispatch({ type: 'SET_UI', showStatsOverlay: v })}
        stats={stats}
        visibleChainsCount={state.visibleChainsCount}
        setVisibleChainsCount={(c) => {
          const val = typeof c === 'function' ? c(state.visibleChainsCount) : c;
          dispatch({ type: 'SET_UI', visibleChainsCount: val });
        }}
        fetchRootDetails={fetchRootDetails}
        summaryCache={summaryCache}
        fetchSummary={fetchSummary}
        manifest={state.manifest}
      />
    </div>
  );
};
