import React from 'react';
import { Activity, RefreshCw, TreePine, ChevronRight } from 'lucide-react';
import { KilangNode } from './KilangNode';
import { normalizeWord, getForestBoundingBox } from './kilangUtils';
import { NodeMap, Derivation } from './KilangTypes';
import { useSidebar } from './SidebarContext';
import { KilangToolbox } from './KilangToolbox';
import { KilangDimensionsOverlay } from './KilangDimensionsOverlay';
import { KilangAction, KilangState } from './kilangReducer';

interface LineageCanvasProps {
  root: string;
  derivatives: any[];
  nodeMap: NodeMap;
  direction: 'horizontal' | 'vertical';
  isFit: boolean;
  scale: number;
  layoutConfig: KilangState['layoutConfig'];
  activeHighlightChain: Set<string>;
  dispatch: React.Dispatch<KilangAction>;
}

const LineageCanvas = ({ root, derivatives, nodeMap, direction, isFit, scale, layoutConfig, rootPos, activeHighlightChain, dispatch }: LineageCanvasProps & { rootPos: any }) => {
  const nodeScale = layoutConfig.nodeSize || 1;
  const isVert = direction === 'vertical';

  const ROOT_R = (isVert ? 40 : 60) * nodeScale;
  const BRANCH_W = (layoutConfig.nodeWidth / 2) * nodeScale;
  const BRANCH_H = (layoutConfig.nodePaddingY + 8) * nodeScale;

  return (
    <svg
      width="2000"
      height="2000"
      viewBox="0 0 2000 2000"
      className="absolute inset-0 pointer-events-none z-0 overflow-visible"
    >
      <defs>
        <linearGradient
          id="lineageGradient"
          gradientUnits="userSpaceOnUse"
          x1="0" y1="0" x2="2000" y2="2000"
        >
          <stop offset="0%" stopColor={layoutConfig.lineColor} stopOpacity="0.4" />
          <stop offset="50%" stopColor={layoutConfig.lineColorMid} stopOpacity="0.4" />
          <stop offset="100%" stopColor={layoutConfig.lineGradientEnd} stopOpacity="0.4" />
        </linearGradient>
      </defs>
      {derivatives.map((d: Derivation, i: number) => {
        const parentKey = d.parentWord || normalizeWord(root) || '';
        const s = nodeMap[parentKey];
        const t = nodeMap[d.word_ab];
        if (!s || !t) return null;

        const isRootSource = parentKey === normalizeWord(root);
        const isHighlighted = activeHighlightChain.has(d.word_ab) && activeHighlightChain.has(parentKey);

        let sourceX = s.x;
        let sourceY = s.y;
        let targetX = t.x;
        let targetY = t.y;

        if (direction === 'horizontal') {
          sourceX += (isRootSource ? ROOT_R : BRANCH_W) + layoutConfig.lineGapX;
          targetX -= (BRANCH_W + layoutConfig.lineGapX);
        } else {
          sourceY -= (isRootSource ? ROOT_R : BRANCH_H) + layoutConfig.lineGapY;
          targetY += (BRANCH_H + layoutConfig.lineGapY);
        }

        let pathData = '';
        if (direction === 'vertical') {
          const midY = (sourceY + targetY) / 2;
          pathData = `M ${sourceX} ${sourceY} C ${sourceX} ${midY} ${targetX} ${midY} ${targetX} ${targetY}`;
        } else {
          const midX = (sourceX + targetX) / 2;
          pathData = `M ${sourceX} ${sourceY} C ${midX} ${sourceY} ${midX} ${targetY} ${targetX} ${targetY}`;
        }

        return (
          <g
            key={i}
            className="animate-forest-bloom pointer-events-auto cursor-pointer group"
            style={{
              animationDelay: `${(d.tier - 2) * 120}ms`,
              transformOrigin: `${rootPos.x}px ${rootPos.y}px`,
            }}
            onMouseEnter={() => dispatch({ type: 'SET_CANVAS_HOVER', node: d.word_ab })}
            onMouseLeave={() => dispatch({ type: 'SET_CANVAS_HOVER', node: null })}
            onClick={(e) => {
              e.stopPropagation();
              dispatch({ type: 'SET_CANVAS_SELECT', node: d.word_ab });
            }}
          >
            {/* Outer Fat Path for Hover ease */}
            <path
              d={pathData}
              stroke="transparent"
              strokeWidth={20}
              fill="none"
            />
            <path
              d={pathData}
              stroke={isHighlighted ? layoutConfig.lineColor : "url(#lineageGradient)"}
              strokeWidth={isHighlighted ? (layoutConfig.lineWidth || 1.5) * 2 : layoutConfig.lineWidth || 1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              className={`transition-all duration-300 ${isHighlighted ? 'opacity-100 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'opacity-20 group-hover:opacity-60'}`}
            />
          </g>
        );
      })}
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
  fitTransform: { x: number; y: number; scale: number };
  layoutConfig: KilangState['layoutConfig'];
  showDimensions: boolean;
  resetToken: number;
  showPerfMonitor: boolean;
  dispatch: React.Dispatch<KilangAction>;
}

const PerformanceMonitor = () => {
  const [history, setHistory] = React.useState<number[]>([]);
  const frameCount = React.useRef(0);
  const lastTime = React.useRef(performance.now());

  React.useEffect(() => {
    let request: number;
    const loop = () => {
      frameCount.current++;
      const now = performance.now();
      if (now - lastTime.current >= 1000) {
        const currentFps = Math.round((frameCount.current * 1000) / (now - lastTime.current));
        setHistory(prev => [...prev.slice(-59), currentFps]);
        frameCount.current = 0;
        lastTime.current = now;
      }
      request = requestAnimationFrame(loop);
    };
    request = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(request);
  }, []);

  const currentFps = history[history.length - 1] || 0;
  
  // Sober: W=240, H=120 (Height x2)
  const points = history.map((val, idx) => {
    const x = idx * (240 / 59);
    const y = 120 - (Math.min(val, 60) / 60) * 120;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="absolute top-6 left-6 bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 p-4 flex flex-col gap-3 z-[9999] pointer-events-none shadow-2xl">
      <div className="flex items-baseline gap-2 px-1">
        <span className="text-3xl font-mono font-black text-white leading-none">{currentFps}</span>
        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">fps</span>
      </div>

      <div className="w-[240px] h-[120px] bg-white/5 border border-white/5 overflow-hidden">
        <svg width="240" height="120" viewBox="0 0 240 120" className="opacity-90">
          <path
            d={`M ${points}`}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* 30 FPS Warning Line */}
          <line x1="0" y1="60" x2="240" y2="60" stroke="#ef4444" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="4,4" />
          
          {/* Gradient Area Fill */}
          <path
            d={`M ${points} L 240,120 L 0,120 Z`}
            fill="url(#fpsGradient)"
            className="opacity-10"
          />
          <defs>
            <linearGradient id="fpsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

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
  stats,
  fitTransform,
  layoutConfig,
  showDimensions,
  resetToken,
  showPerfMonitor,
  dispatch
}: KilangCanvasProps) => {
  const value = useSidebar();
  const normalize = (w: string) => w.toLowerCase().trim().replace(/\|$/, '');
  const [viewPos, setViewPos] = React.useState({ x: 0, y: 0, w: 0, h: 0 });

  React.useEffect(() => {
    const el = treeRef.current;
    if (!el) return;

    const updatePos = () => {
      const container = treeRef.current;
      const canvas = container?.querySelector('[style*="width: 4000px"]');
      if (!container || !canvas) return;

      const cRect = container.getBoundingClientRect();
      const sRect = canvas.getBoundingClientRect();
      const currentScale = isFit ? fitTransform.scale : scale;

      const vp = {
        x: Math.round((cRect.left - sRect.left) / currentScale),
        y: Math.round((cRect.top - sRect.top) / currentScale),
        w: Math.round(cRect.width / currentScale),
        h: Math.round(cRect.height / currentScale)
      };

      setViewPos(prev => {
        if (prev.x === vp.x && prev.y === vp.y && prev.w === vp.w && prev.h === vp.h) return prev;
        return vp;
      });
    };

    updatePos();
    el.addEventListener('scroll', updatePos);
    window.addEventListener('resize', updatePos);

    const timer = setInterval(updatePos, 200); // Poll for transition-based moves

    return () => {
      el.removeEventListener('scroll', updatePos);
      window.removeEventListener('resize', updatePos);
      clearInterval(timer);
    };
  }, [selectedRoot, treeRef, isFit, scale, fitTransform]);

  const activeHighlightNode = value.state.canvasHoverNode || value.state.canvasSelectedNode;

  const getActiveHighlightChain = React.useMemo(() => {
    if (!activeHighlightNode || !rootData?.derivatives) return new Set<string>();

    const chain = new Set<string>();
    const derivatives = rootData.derivatives;
    const lowRoot = normalizeWord(selectedRoot || '');

    // 1. Find ancestors
    let current = activeHighlightNode;
    chain.add(current);

    while (current && current !== lowRoot) {
      const entry = derivatives.find((d: Derivation) => d.word_ab === current);
      if (entry && entry.parentWord) {
        chain.add(entry.parentWord);
        current = entry.parentWord;
      } else {
        // Must be attached to root
        if (lowRoot) chain.add(lowRoot);
        break;
      }
    }

    // 2. Find descendants
    const addDescendants = (word: string) => {
      derivatives.forEach((d: Derivation) => {
        if (d.parentWord === word && !chain.has(d.word_ab)) {
          chain.add(d.word_ab);
          addDescendants(d.word_ab);
        }
      });
    };
    addDescendants(activeHighlightNode);

    return chain;
  }, [activeHighlightNode, rootData?.derivatives, selectedRoot]);

  const getLinearPath = React.useMemo(() => {
    if (!activeHighlightNode || !rootData?.derivatives) return [];

    const path: string[] = [];
    const derivatives = rootData.derivatives;
    const lowRoot = normalizeWord(selectedRoot || '');

    let current = activeHighlightNode;
    path.push(current);

    while (current && current !== lowRoot) {
      const entry = derivatives.find((d: Derivation) => d.word_ab === current);
      if (entry && entry.parentWord) {
        path.push(entry.parentWord);
        current = entry.parentWord;
      } else {
        if (lowRoot && !path.includes(lowRoot)) path.push(lowRoot);
        break;
      }
    }

    return path.reverse();
  }, [activeHighlightNode, rootData?.derivatives, selectedRoot]);

  const deepRoots = React.useMemo(() => {
    if (!stats?.deep_examples) return [];

    // The data is Record<root, string[]>, sort by length of the evolution path
    const roots = Object.keys(stats.deep_examples).sort((a, b) => {
      const lenA = Array.isArray(stats.deep_examples[a]) ? stats.deep_examples[a].length : 0;
      const lenB = Array.isArray(stats.deep_examples[b]) ? stats.deep_examples[b].length : 0;
      return lenB - lenA;
    });

    return roots.slice(0, 5);
  }, [stats]);

  // Handle auto-centering when a root is bloomed
  React.useLayoutEffect(() => {
    if (!treeRef.current) return;

    const container = treeRef.current;
    const center = () => {
      if (!selectedRoot || rootData?.loading) return;

      const pos = nodeMap[normalizeWord(selectedRoot) || ''];
      if (!pos) return;

      // Direction-Aware Bias
      const hBias = direction === 'horizontal' ? 0.15 : 0.5;
      const vBias = direction === 'vertical' ? 0.85 : 0.5;

      // Absolute World Coordinates + 128px padding (p-32)
      // We don't multiply by scale because transform-origin is at (pos.x, pos.y)
      const scrollLeft = (pos.x + 128) - (container.clientWidth * hBias);
      const scrollTop = (pos.y + 128) - (container.clientHeight * vBias);

      container.scrollTo({
        left: scrollLeft,
        top: scrollTop,
        behavior: 'instant'
      });
    };

    center();
    window.addEventListener('resize', center);
    return () => window.removeEventListener('resize', center);
  }, [selectedRoot, rootData?.loading, isFit, resetToken, direction, arrangement]);
  // NodeMap is derived from rootData, so loading/selectedRoot covers it.

  return (
    <main className="flex-1 overflow-hidden relative">
      <div className="h-full flex flex-col p-8 overflow-hidden">
        <div className="flex-1 kilang-glass-panel rounded-3xl overflow-hidden relative flex flex-col border border-white/10 shadow-2xl">
          {showPerfMonitor && <PerformanceMonitor />}
          {/* Visual Toolbox Overlay - Pinned relative to panel */}
          {selectedRoot && (
            <>
              <KilangToolbox
                layoutConfig={layoutConfig}
                dispatch={dispatch}
              />

              {(() => {
                const forestBounds = getForestBoundingBox(nodeMap);
                return (
                  <KilangDimensionsOverlay
                    viewPos={viewPos}
                    treeRef={treeRef}
                    showDimensions={showDimensions}
                    rootPos={nodeMap[normalizeWord(selectedRoot || '') || ''] || null}
                    scale={scale}
                    isFit={isFit}
                    fitTransform={fitTransform}
                    forestBounds={forestBounds}
                  />
                );
              })()}
            </>
          )}

          {selectedRoot ? (
            <div
              ref={treeRef}
              className="flex-1 overflow-auto no-scrollbar bg-[#020617]/40 relative p-32 scroll-smooth"
              onClick={() => dispatch({ type: 'SET_CANVAS_SELECT', node: null })}
            >
              {/* 3. Primary Workspace Area */}

              {/* Error handling remains an overlay-style block */}
              {rootData?.error && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center space-y-4 bg-[#020617]/80 backdrop-blur-sm">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                    <Activity className="w-8 h-8" />
                  </div>
                  <div className="text-red-500 font-mono text-sm tracking-widest uppercase">Forest Poisoned</div>
                  <div className="text-red-400/60 text-[10px] font-mono italic max-w-xs text-center">{rootData.errorMessage}</div>
                </div>
              )}

              {/* Loading Spinner as a smooth overlay */}
              {rootData?.loading && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center space-y-4 bg-transparent pointer-events-none">
                  <RefreshCw className="w-10 h-10 text-blue-500 animate-spin opacity-50" />
                  <div className="animate-pulse text-blue-500 font-mono italic text-xs tracking-widest uppercase">Blooming forest...</div>
                </div>
              )}

              {/* THe Canvas: Stays mounted to preserve transition stability */}
              <div
                key={selectedRoot} // Trigger bloom animation on root change
                className={`relative transition-all duration-700 animate-in zoom-in-90 ${rootData?.loading ? 'opacity-30' : 'opacity-100'}`}
                style={{
                  width: '4000px',
                  height: '4000px',
                  transform: isFit
                    ? `translate(${fitTransform.x}px, ${fitTransform.y}px) scale(${fitTransform.scale})`
                    : `scale(${scale})`,
                  transformOrigin: (() => {
                    // Critical: Origin must match physical anchor to prevent zoom-sliding
                    const pos = nodeMap[normalizeWord(selectedRoot || '') || ''];
                    return pos ? `${pos.x}px ${pos.y}px` : 'center center';
                  })()
                }}
              >
                {/* 1. SVG Layer (Background) */}
                {(() => {
                  const rootPos = nodeMap[normalizeWord(selectedRoot || '') || ''];
                  if (!rootPos) return null;
                  return (
                    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                      <LineageCanvas
                        root={selectedRoot || ''}
                        derivatives={(rootData?.derivatives || []) as Derivation[]}
                        nodeMap={nodeMap}
                        direction={direction}
                        isFit={isFit}
                        scale={scale}
                        layoutConfig={layoutConfig}
                        rootPos={rootPos}
                        activeHighlightChain={getActiveHighlightChain}
                        dispatch={dispatch}
                      />
                    </div>
                  );
                })()}

                {/* 2. Nodes Layer (Foreground) */}
                <div className="absolute inset-0" style={{ zIndex: 10 }}>
                  {/* Root Node: Stable Anchor (No scale, just fade) */}
                  {(() => {
                    const pos = nodeMap[normalizeWord(selectedRoot || '') || ''];
                    if (!pos) return null;
                    return (
                      <div
                        key={`root-${selectedRoot}`}
                        className="absolute transition-all duration-500 animate-in fade-in duration-1000"
                        style={{
                          left: 0,
                          top: 0,
                          transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px)`,
                          zIndex: 20
                        }}
                      >
                        <KilangNode
                          word={selectedRoot || ''}
                          isRoot={true}
                          summaryCache={summaryCache}
                          fetchSummary={fetchSummary}
                          config={layoutConfig}
                          isHighlighted={getActiveHighlightChain.has(normalizeWord(selectedRoot || '') || '')}
                          isHovered={value.state.canvasHoverNode === normalizeWord(selectedRoot || '')}
                          onInteraction={(type: 'hover' | 'select', word: string | null) => {
                            if (type === 'hover') dispatch({ type: 'SET_CANVAS_HOVER', node: word });
                            else if (type === 'select') dispatch({ type: 'SET_CANVAS_SELECT', node: word });
                          }}
                        />
                      </div>
                    );
                  })()}

                  {/* Branches Forest: Tier-Staggered Bloom */}
                  {(() => {
                    const rootPos = nodeMap[normalizeWord(selectedRoot || '') || ''];
                    if (!rootPos) return null;
                    return (rootData?.derivatives as Derivation[])?.map((d: Derivation) => {
                      const pos = nodeMap[d.word_ab];
                      if (!pos) return null;
                      return (
                        <div
                          key={d.word_ab}
                          className="absolute transition-all duration-500"
                          style={{
                            left: 0,
                            top: 0,
                            transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px)`,
                            zIndex: 10
                          }}
                        >
                          <div
                            className="animate-forest-bloom"
                            style={{
                              animationDelay: `${(d.tier - 2) * 120}ms`,
                              transformOrigin: `${rootPos.x - pos.x}px ${rootPos.y - pos.y}px`
                            }}
                          >
                            <div className="tree-node">
                              <KilangNode
                                word={d.raw_word || d.word_ab}
                                dictCode={d.dict_code?.toUpperCase()}
                                tier={d.tier}
                                summaryCache={summaryCache}
                                fetchSummary={fetchSummary}
                                config={layoutConfig}
                                isHighlighted={getActiveHighlightChain.has(d.word_ab)}
                                isHovered={value.state.canvasHoverNode === d.word_ab}
                                onInteraction={(type: 'hover' | 'select', word: string | null) => {
                                  if (type === 'hover') dispatch({ type: 'SET_CANVAS_HOVER', node: word });
                                  else if (type === 'select') dispatch({ type: 'SET_CANVAS_SELECT', node: word });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-20 text-center space-y-8">
              <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
                <TreePine className="w-12 h-12 text-blue-500/40" />
              </div>
              <div className="max-w-md space-y-4">
                <h3 className="text-2xl font-black text-white uppercase tracking-widest">Semantic Root Forest</h3>
                <p className="text-kilang-text-muted leading-relaxed">Select a root from the left panel to visualize its morphological evolution and semantic growth patterns.</p>
                <p className="text-kilang-text-muted leading-relaxed">Custom trees can be planted and saved using the custom tab.</p>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <div className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-400 opacity-60">Top Branching</div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {(stats?.top_roots || []).slice(0, 5).map((r: any) => (
                        <button key={r.root} onClick={() => fetchRootDetails(r.root)} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black hover:bg-white/10 text-white/60 transition-all hover:text-white hover:border-blue-500/30">
                          {r.root}
                        </button>
                      ))}
                    </div>
                  </div>

                  {deepRoots.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-400 opacity-60">Top Depth</div>
                      <div className="flex flex-wrap justify-center gap-2">
                        {deepRoots.map((root) => (
                          <button key={root} onClick={() => fetchRootDetails(root)} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black hover:bg-white/10 text-white/60 transition-all hover:text-white hover:border-emerald-500/30">
                            {root}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Chain Inscription Overlay */}
          {getLinearPath.length > 0 && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-bottom-4 duration-500 pointer-events-none">
              <div className="bg-[#0f172a]/80 backdrop-blur-2xl border border-blue-500/30 px-8 py-4 rounded-[20px] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center gap-3">
                {getLinearPath.map((word: string, idx: number) => (
                  <React.Fragment key={word}>
                    <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${idx === getLinearPath.length - 1 ? 'text-blue-400' : 'text-white/40'}`}>
                      {word}
                    </span>
                    {idx < getLinearPath.length - 1 && (
                      <ChevronRight className="w-3 h-3 text-white/10" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
