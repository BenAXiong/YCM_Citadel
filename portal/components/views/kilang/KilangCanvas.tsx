'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Activity, RefreshCw, TreePine } from 'lucide-react';
import { KilangNode } from './KilangNode';

interface LineageCanvasProps {
  root: string;
  derivatives: any[];
  layoutMode: 'vertical' | 'horizontal';
  isFit: boolean;
  scale: number;
}

const LineageCanvas = ({ root, derivatives, layoutMode = 'vertical', isFit, scale }: LineageCanvasProps) => {
  const [paths, setPaths] = useState<string[]>([]);
  const containerRef = useRef<SVGSVGElement>(null);
  const effectiveZoom = isFit ? 0.5 : scale;

  const calculatePaths = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newPaths: string[] = [];
    const getCenter = (id: string, containerRect: DOMRect) => {
      const cleanId = `v3-node-${id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const el = document.getElementById(cleanId);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const cx = (rect.left + rect.width / 2 - containerRect.left) / effectiveZoom;
      const cy = (rect.top + rect.height / 2 - containerRect.top) / effectiveZoom;
      return { x: cx, y: cy };
    };
    derivatives.forEach(d => {
      const target = getCenter(d.word_ab, containerRect);
      const source = getCenter(d.parentWord || root, containerRect);
      if (source && target) {
        if (layoutMode === 'vertical') {
          const midY = (source.y + target.y) / 2;
          newPaths.push(`M ${source.x} ${source.y} C ${source.x} ${midY} ${target.x} ${midY} ${target.x} ${target.y}`);
        } else {
          const midX = (source.x + target.x) / 2;
          newPaths.push(`M ${source.x} ${source.y} C ${midX} ${source.y} ${midX} ${target.y} ${target.x} ${target.y}`);
        }
      }
    });
    setPaths(newPaths);
  };

  useEffect(() => {
    calculatePaths();
    const timer = setTimeout(() => {
      requestAnimationFrame(calculatePaths);
    }, 500);
    const interval = setInterval(calculatePaths, 32);
    window.addEventListener('resize', calculatePaths);
    const observer = new MutationObserver(calculatePaths);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener('resize', calculatePaths);
      observer.disconnect();
    };
  }, [derivatives, root, effectiveZoom, layoutMode]);

  return (
    <svg ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none z-0">
      <defs>
        <linearGradient id="lineageGradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#6366f1" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      {paths.map((d, i) => (
        <path key={i} d={d} stroke="url(#lineageGradient)" strokeWidth="1.5" fill="none" className="transition-all duration-700 opacity-20 hover:opacity-100" />
      ))}
    </svg>
  );
};

interface KilangCanvasProps {
  selectedRoot: string | null;
  rootData: any;
  layoutMode: 'h1' | 'h2' | 'v1' | 'v2';
  isFit: boolean;
  scale: number;
  treeRef: React.RefObject<HTMLDivElement | null>;
  fetchRootDetails: (root: string) => Promise<void>;
  summaryCache: Record<string, string[]>;
  fetchSummary: (word: string) => Promise<void>;
  stats: any;
}

export const KilangCanvas = ({
  selectedRoot,
  rootData,
  layoutMode,
  isFit,
  scale,
  treeRef,
  fetchRootDetails,
  summaryCache,
  fetchSummary,
  stats
}: KilangCanvasProps) => {
  return (
    <main className="flex-1 overflow-hidden relative">
      <div className="h-full flex flex-col">
        <div className="p-4" />
        <div className="flex-1 p-8 pt-4 overflow-hidden flex flex-col">
          <div className="flex-1 kilang-glass-panel rounded-3xl overflow-hidden relative flex flex-col border border-white/10 shadow-2xl">
            {selectedRoot ? (
              <div ref={treeRef} className="flex-1 overflow-auto custom-scrollbar p-16 bg-[#020617]/40 relative flex flex-col items-center">
                {rootData?.error ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                      <Activity className="w-8 h-8" />
                    </div>
                    <div className="text-red-500 font-mono text-sm tracking-widest uppercase">Forest Poisoned</div>
                    <div className="text-red-400/60 text-[10px] font-mono italic max-w-xs text-center">{rootData.errorMessage}</div>
                  </div>
                ) : rootData?.loading ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4"><RefreshCw className="w-10 h-10 text-blue-500 animate-spin opacity-50" /><div className="animate-pulse text-blue-500 font-mono italic text-xs tracking-widest uppercase">Blooming forest...</div></div>
                ) : (
                  <div
                    className={`min-h-[1000px] flex transition-all duration-700 origin-center ${isFit ? '!justify-center !items-center !p-0' : (layoutMode.startsWith('v') ? 'flex-col items-center pt-24 pb-96' : 'flex-row items-center py-32 pl-40 pr-96')} gap-12 w-full relative`}
                    style={{ transform: isFit ? 'scale(0.5)' : `scale(${scale})` }}
                  >
                    <LineageCanvas root={selectedRoot} derivatives={rootData?.derivatives || []} layoutMode={layoutMode.startsWith('h') ? 'horizontal' : 'vertical'} isFit={isFit} scale={scale} />
                    {layoutMode === 'v1' ? (
                      <>
                        {[10, 9, 8, 7, 6, 5, 4, 3, 2].map(tier => {
                          const rawItems = rootData?.derivatives?.filter((d: any) => d.tier === tier) || [];
                          if (rawItems.length === 0) return null;
                          const tierItems = [...rawItems].sort((a, b) => a.sortPath.localeCompare(b.sortPath));
                          return (
                            <div key={tier} className="w-full flex flex-col items-center gap-10">
                              <div className="flex flex-wrap justify-center gap-6 relative z-10">{tierItems.map((d: any) => <KilangNode key={d.word_ab} word={d.word_ab} dictCode={d.dict_code?.toUpperCase()} tier={d.tier} summaryCache={summaryCache} fetchSummary={fetchSummary} />)}</div>
                              <div className="h-6 w-px bg-white/5" />
                            </div>
                          );
                        })}
                        <div className="relative z-50 shrink-0 mb-32"><KilangNode word={selectedRoot} isRoot={true} summaryCache={summaryCache} fetchSummary={fetchSummary} /></div>
                      </>
                    ) : layoutMode === 'h1' ? (
                      <>
                        <div className={`relative z-50 shrink-0 ${isFit ? 'mr-10' : 'mr-20'}`}><KilangNode word={selectedRoot} isRoot={true} summaryCache={summaryCache} fetchSummary={fetchSummary} /></div>
                        {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(tier => {
                          const rawItems = rootData?.derivatives?.filter((d: any) => d.tier === tier) || [];
                          if (rawItems.length === 0) return null;
                          const tierItems = [...rawItems].sort((a, b) => a.sortPath.localeCompare(b.sortPath));
                          return (
                            <div key={tier} className="flex h-full items-center">
                              <div className={`${isFit ? 'w-10' : 'w-20'} h-px bg-white/10`} />
                              <div className="flex flex-col items-start gap-4">{tierItems.map((d: any) => <KilangNode key={d.word_ab} word={d.word_ab} dictCode={d.dict_code?.toUpperCase()} tier={d.tier} summaryCache={summaryCache} fetchSummary={fetchSummary} />)}</div>
                            </div>
                          );
                        })}
                      </>
                    ) : layoutMode === 'h2' ? (
                      <div className="flex items-center gap-24 py-10 relative pr-64">
                        <div className="shrink-0">
                          <KilangNode word={selectedRoot} isRoot={true} summaryCache={summaryCache} fetchSummary={fetchSummary} />
                        </div>
                        <div className="grid grid-cols-[repeat(10,240px)] gap-x-12 relative" style={{ gridTemplateRows: `repeat(${Math.max(1, ...rootData?.derivatives?.map((d: any) => d.treeRow) || [0]) + 1}, 80px)` }}>
                          {rootData?.derivatives?.map((d: any) => (
                            <div key={d.word_ab} className="relative" style={{ gridColumn: d.tier - 1, gridRow: (d.treeRow ?? 0) + 1 }}><KilangNode word={d.word_ab} dictCode={d.dict_code?.toUpperCase()} tier={d.tier} summaryCache={summaryCache} fetchSummary={fetchSummary} /></div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-24 py-10 relative pb-64">
                        <div className="shrink-0 mb-12">
                          <KilangNode word={selectedRoot} isRoot={true} summaryCache={summaryCache} fetchSummary={fetchSummary} />
                        </div>
                        <div className="grid grid-rows-[repeat(10,100px)] gap-y-12 relative" style={{ gridTemplateColumns: `repeat(${Math.max(1, ...rootData?.derivatives?.map((d: any) => d.treeRow) || [0]) + 1}, 240px)` }}>
                          {rootData?.derivatives?.map((d: any) => (
                            <div key={d.word_ab} className="relative flex items-center justify-center" style={{ gridRow: d.tier - 1, gridColumn: (d.treeRow ?? 0) + 1 }}>
                              <KilangNode word={d.word_ab} dictCode={d.dict_code?.toUpperCase()} tier={d.tier} summaryCache={summaryCache} fetchSummary={fetchSummary} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-20 text-center space-y-8">
                <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
                  <TreePine className="w-12 h-12 text-blue-500/40" />
                </div>
                <div className="max-w-md space-y-4">
                  <h3 className="text-2xl font-black text-white uppercase tracking-widest">Semantic Root Forest</h3>
                  <p className="text-kilang-text-muted leading-relaxed">Select a root from the left panel to visualize its morphological evolution and semantic growth patterns.</p>
                  <div className="flex flex-wrap justify-center gap-2 pt-4">
                    {stats?.top_roots.slice(0, 5).map((r: any) => (
                      <button key={r.root} onClick={() => fetchRootDetails(r.root)} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black hover:bg-white/10 text-white/60">
                        {r.root}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
