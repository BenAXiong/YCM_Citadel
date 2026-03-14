import { Activity, RefreshCw, TreePine } from 'lucide-react';
import { KilangNode } from './KilangNode';
import { NodeMap } from './kilangUtils';

interface LineageCanvasProps {
  root: string;
  derivatives: any[];
  nodeMap: NodeMap;
  direction: 'horizontal' | 'vertical';
  isFit: boolean;
  scale: number;
}

const LineageCanvas = ({ root, derivatives, nodeMap, direction, isFit, scale }: LineageCanvasProps) => {
  const normalize = (w: string) => w.toLowerCase().trim().replace(/\|$/, '');
  
  const paths = derivatives.map(d => {
    const s = nodeMap[d.parentWord || normalize(root)];
    const t = nodeMap[d.word_ab];
    if (!s || !t) return null;

    const sourceX = direction === 'horizontal' ? s.x + 120 : s.x;
    const sourceY = direction === 'horizontal' ? s.y : s.y + 50;
    const targetX = direction === 'horizontal' ? t.x - 120 : t.x;
    const targetY = direction === 'horizontal' ? t.y : t.y - 50;

    if (direction === 'vertical') {
      const midY = (sourceY + targetY) / 2;
      return `M ${sourceX} ${sourceY} C ${sourceX} ${midY} ${targetX} ${midY} ${targetX} ${targetY}`;
    } else {
      const midX = (sourceX + targetX) / 2;
      return `M ${sourceX} ${sourceY} C ${midX} ${sourceY} ${midX} ${targetY} ${targetX} ${targetY}`;
    }
  }).filter(Boolean) as string[];

  return (
    <svg 
      width="2000" 
      height="2000" 
      viewBox="0 0 2000 2000"
      className="absolute inset-0 pointer-events-none z-0 overflow-visible"
    >
      <defs>
        <linearGradient id="lineageGradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#6366f1" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      {paths.map((d, i) => (
        <path 
          key={i} 
          d={d} 
          stroke="url(#lineageGradient)" 
          strokeWidth="1.5" 
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none" 
          className="transition-all duration-700 opacity-20 hover:opacity-100" 
        />
      ))}
    </svg>
  );
};

interface KilangCanvasProps {
  selectedRoot: string | null;
  rootData: any;
  direction: 'horizontal' | 'vertical';
  arrangement: 'aligned' | 'flow';
  nodeMap: NodeMap;
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
  direction,
  arrangement,
  nodeMap,
  isFit,
  scale,
  treeRef,
  fetchRootDetails,
  summaryCache,
  fetchSummary,
  stats
}: KilangCanvasProps) => {
  const normalize = (w: string) => w.toLowerCase().trim().replace(/\|$/, '');

  return (
    <main className="flex-1 overflow-hidden relative">
      <div className="h-full flex flex-col">
        <div className="p-4" />
        <div className="flex-1 p-8 pt-4 overflow-hidden flex flex-col">
          <div className="flex-1 kilang-glass-panel rounded-3xl overflow-hidden relative flex flex-col border border-white/10 shadow-2xl">
            {selectedRoot ? (
              <div ref={treeRef} className="flex-1 overflow-auto custom-scrollbar bg-[#020617]/40 relative flex items-center justify-center p-32">
                {rootData?.error ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                      <Activity className="w-8 h-8" />
                    </div>
                    <div className="text-red-500 font-mono text-sm tracking-widest uppercase">Forest Poisoned</div>
                    <div className="text-red-400/60 text-[10px] font-mono italic max-w-xs text-center">{rootData.errorMessage}</div>
                  </div>
                ) : rootData?.loading ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4">
                    <RefreshCw className="w-10 h-10 text-blue-500 animate-spin opacity-50" />
                    <div className="animate-pulse text-blue-500 font-mono italic text-xs tracking-widest uppercase">Blooming forest...</div>
                  </div>
                ) : (
                  <div
                    className="relative transition-all duration-700"
                    style={{ 
                      width: '2000px', 
                      height: '2000px', 
                      transform: isFit ? 'scale(0.5)' : `scale(${scale})`,
                      transformOrigin: 'center center'
                    }}
                  >
                    {/* SVG Layer */}
                    <LineageCanvas 
                      root={selectedRoot} 
                      derivatives={rootData?.derivatives || []} 
                      nodeMap={nodeMap} 
                      direction={direction} 
                      isFit={isFit} 
                      scale={scale} 
                    />

                    {/* Nodes Layer - Absolutely Positioned */}
                    <div className="absolute inset-0">
                      {/* Root Node */}
                      {(() => {
                        const pos = nodeMap[normalize(selectedRoot)];
                        if (!pos) return null;
                        return (
                          <div 
                            className="absolute transition-all duration-700"
                            style={{ 
                              left: 0, 
                              top: 0, 
                              transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px)` 
                            }}
                          >
                            <KilangNode word={selectedRoot} isRoot={true} summaryCache={summaryCache} fetchSummary={fetchSummary} />
                          </div>
                        );
                      })()}

                      {/* Derivative Nodes */}
                      {rootData?.derivatives?.map((d: any) => {
                        const pos = nodeMap[d.word_ab];
                        if (!pos) return null;
                        return (
                          <div 
                            key={d.word_ab} 
                            className="absolute transition-all duration-700"
                            style={{ 
                              left: 0, 
                              top: 0, 
                              transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px)` 
                            }}
                          >
                            <KilangNode 
                              word={d.word_ab} 
                              dictCode={d.dict_code?.toUpperCase()} 
                              tier={d.tier} 
                              summaryCache={summaryCache} 
                              fetchSummary={fetchSummary} 
                            />
                          </div>
                        );
                      })}
                    </div>
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
