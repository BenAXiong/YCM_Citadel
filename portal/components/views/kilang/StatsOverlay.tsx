'use client';

import React from 'react';
import { Activity, Minimize2, BarChart3, TrendingUp, Link2, ChevronRight, Plus } from 'lucide-react';
import { WordTooltip } from './KilangNode';

interface StatsOverlayProps {
  showStatsOverlay: boolean;
  setShowStatsOverlay: (show: boolean) => void;
  stats: any;
  visibleChainsCount: number;
  setVisibleChainsCount: (count: number | ((prev: number) => number)) => void;
  fetchRootDetails: (root: string) => Promise<void>;
  summaryCache: Record<string, string[]>;
  fetchSummary: (word: string) => Promise<void>;
  manifest: any;
}

export const StatsOverlay = ({
  showStatsOverlay,
  setShowStatsOverlay,
  stats,
  visibleChainsCount,
  setVisibleChainsCount,
  fetchRootDetails,
  summaryCache,
  fetchSummary,
  manifest
}: StatsOverlayProps) => {
  if (!showStatsOverlay) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-12 bg-[#020617]/80 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="w-full h-full bg-[#020617]/90 border border-white/10 rounded-[40px] shadow-2xl flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-12 space-y-16">
          <div className="flex items-center justify-between border-b border-white/5 pb-8 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-widest uppercase">Morphology Distribution</h2>
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em] mt-1">Cross-lexical semantic analysis</p>
              </div>
            </div>
            <button
              onClick={() => setShowStatsOverlay(false)}
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-red-500 hover:text-white hover:border-red-400 transition-all shadow-lg"
            >
              <Minimize2 className="w-6 h-6" />
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            {/* 1: Frequency Map */}
            <div className="flex flex-col space-y-6">
              <h4 className="text-sm font-black text-indigo-400 mb-6 flex items-center gap-2 uppercase tracking-[0.2em] border-b border-indigo-500/20 pb-4">
                <BarChart3 className="w-4 h-4" /> Frequency Map
              </h4>
              <div className="flex-1 flex flex-col gap-3">
                {(() => {
                  const dist = Object.entries(stats?.distribution || {}).map(([k, v]) => ({ branches: parseInt(k), count: v as number })).filter(d => d.branches > 0).sort((a, b) => a.branches - b.branches).slice(0, 30);
                  const maxFreq = Math.max(...dist.map(d => d.count), 1);
                  return dist.map(({ branches, count }) => (
                    <div key={branches} className="flex items-center gap-4 group">
                      <div className="w-20 text-right text-[10px] font-mono text-kilang-text-muted font-bold tracking-tighter uppercase whitespace-nowrap">{branches} branches</div>
                      <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-400 font-black" style={{ width: `${(count / maxFreq) * 100}%` }} />
                      </div>
                      <div className="w-16 text-[10px] font-mono text-blue-400 font-bold">{count}</div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="flex flex-col gap-12 h-full">
              {/* 2: Vertical Depth */}
              <div className="bg-[#020617]/50 rounded-2xl p-8 border border-white/5 flex-1 flex flex-col">
                <h4 className="text-sm font-black text-blue-400 mb-6 flex items-center gap-2 uppercase tracking-[0.2em] border-b border-blue-500/20 pb-4">
                  <Activity className="w-4 h-4" /> Vertical Depth
                </h4>
                <div className="grid grid-cols-2 gap-4 flex-1 content-start">
                  {stats?.depth_distribution && Object.entries(stats.depth_distribution)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([depth, count]: any) => {
                      const depthNum = parseInt(depth);
                      const percentage = ((count / stats.summary.total_words) * 100).toFixed(1);
                      const labels: any = { 1: 'ROOTS', 2: 'LEVEL 2', 3: 'NESTED', 4: 'EVOLUTION', 5: 'COMPLEX', 6: 'DEEP', 7: 'ULTRA', 8: 'EPIC', 9: 'LEGEND' };
                      return (
                        <div key={depth} className="p-4 bg-[#0f172a]/80 rounded-[20px] border border-white/5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-black text-white/40 uppercase tracking-widest">DEPTH {depthNum}</span>
                            <span className="text-[8px] text-blue-400 font-black uppercase tracking-widest px-2 py-0.5 bg-blue-500/10 rounded-full border border-blue-500/20">{labels[depthNum] || 'HUB'}</span>
                          </div>
                          <div className="flex items-baseline justify-between gap-4">
                            <div className="text-2xl font-black text-white leading-tight tracking-tighter">{percentage}%</div>
                            <div className="text-[10px] text-kilang-text-muted font-mono font-bold whitespace-nowrap">{count.toLocaleString()} words</div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* 3: Top Roots */}
              <div className="bg-[#020617]/50 rounded-2xl p-8 border border-white/5 flex-1 flex flex-col">
                <h4 className="text-sm font-black text-emerald-400 mb-6 flex items-center gap-2 uppercase tracking-[0.2em] border-b border-emerald-500/20 pb-4">
                  <TrendingUp className="w-4 h-4" /> Top Roots
                </h4>
                <div className="grid grid-cols-3 gap-x-6 gap-y-2 flex-1 content-start">
                  {(() => {
                    const roots = stats?.top_roots.slice(0, 15) || [];
                    const rows = 5;
                    const cols = 3;
                    const reordered = [];
                    for (let r = 0; r < rows; r++) {
                      for (let c = 0; c < cols; c++) {
                        const index = r + c * rows;
                        if (index < roots.length) reordered.push({ ...roots[index], originalIndex: index });
                      }
                    }
                    return reordered.map((r, i) => (
                      <WordTooltip
                        word={r.root}
                        key={i}
                        summaryCache={summaryCache}
                        fetchSummary={fetchSummary}
                      >
                        <div onClick={() => { setShowStatsOverlay(false); fetchRootDetails(r.root); }} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10 group hover:border-blue-500 hover:bg-white/10 transition-all cursor-pointer h-full">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 min-w-[20px] rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center text-[9px] font-black">{r.originalIndex + 1}</span>
                            <span className="font-black text-white group-hover:text-blue-400 uppercase tracking-widest text-[11px] truncate">{r.root}</span>
                          </div>
                          <div className="flex items-baseline gap-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/5 group-hover:border-blue-500/20 shrink-0">
                            <span className="text-[11px] font-black text-white">{r.count}</span>
                            <span className="text-[7px] text-kilang-text-muted uppercase font-black font-mono leading-none">branches</span>
                          </div>
                        </div>
                      </WordTooltip>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#020617]/50 rounded-[40px] p-10 border border-white/5 space-y-8">
            <div className="space-y-6">
              <h4 className="text-lg font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
                <Link2 className="w-6 h-6" /> Complex Chains
              </h4>
              <div className="grid grid-cols-1 gap-8">
                {(() => {
                  const mergedChains: Record<string, string[]> = { ...(stats?.deep_examples || {}) };

                  if (manifest) {
                    const entries = Object.values(manifest);
                    if (entries.length > 0) {
                      const maxDepth = Math.max(...entries.map((e: any) => e.d), 0);
                      if (maxDepth >= 3) {
                        const deepWords = entries.filter((e: any) => e.d === maxDepth);
                        deepWords.forEach((wordObj: any) => {
                          const path: string[] = [];
                          let curr = wordObj;
                          while (curr) {
                            path.unshift(curr.w);
                            curr = manifest[curr.p];
                          }
                          const key = path.join('>');
                          if (!Object.values(mergedChains).some(c => (c as string[]).join('>') === key)) {
                            mergedChains[wordObj.w] = path;
                          }
                        });
                      }
                    }
                  }

                  const allChains = Object.entries(mergedChains)
                    .sort(([, a], [, b]) => b.length - a.length);

                  const visibleChains = allChains.slice(0, visibleChainsCount);

                  return (
                    <>
                      {visibleChains.map(([root, chain]: any) => (
                        <WordTooltip
                          word={chain[0]}
                          key={root}
                          summaryCache={summaryCache}
                          fetchSummary={fetchSummary}
                        >
                          <div onClick={() => { setShowStatsOverlay(false); fetchRootDetails(chain[0]); }} className="p-8 bg-[#0f172a]/80 rounded-[32px] border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group/chain shadow-xl space-y-6 flex items-center justify-between h-full">
                            <div className="flex items-center justify-between gap-6 flex-1">
                              <div className="flex items-center gap-2 flex-wrap min-w-0">
                                {chain.map((link: string, i: number) => (
                                  <React.Fragment key={i}>
                                    <WordTooltip
                                      word={link}
                                      summaryCache={summaryCache}
                                      fetchSummary={fetchSummary}
                                    >
                                      <div className={`px-4 py-2 rounded-xl text-[11px] font-bold font-mono border ${i === 0 ? 'bg-indigo-600 border-indigo-400 text-white' : i === chain.length - 1 ? 'bg-white/5 border-white/10 text-white/40' : 'bg-[#1e293b] border-white/5 text-white/70 group-hover/chain:text-white group-hover/chain:border-blue-500/30'}`}>
                                        {link}
                                      </div>
                                    </WordTooltip>
                                    {i < chain.length - 1 && <ChevronRight className="w-4 h-4 text-white/20 shrink-0" />}
                                  </React.Fragment>
                                ))}
                              </div>
                              <div className="px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[12px] font-black text-indigo-400 uppercase tracking-[0.2em] shrink-0">DEPTH {chain.length}</div>
                            </div>
                          </div>
                        </WordTooltip>
                      ))}

                      {allChains.length > visibleChainsCount && (
                        <div className="flex justify-center pt-8">
                          <button
                            onClick={() => setVisibleChainsCount(prev => (typeof prev === 'number' ? prev : 10) + 10)}
                            className="px-10 py-5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 rounded-[24px] text-white font-black uppercase tracking-[0.3em] transition-all shadow-xl flex items-center gap-4 group"
                          >
                            <span>Load More Chains</span>
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
