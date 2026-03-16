import React from 'react';
import { Activity, RefreshCw, TreePine, ChevronRight } from 'lucide-react';
import { KilangNode } from './KilangNode';
import { normalizeWord } from './kilangUtils';
import { NodeMap, Derivation } from './KilangTypes';
import { useSidebar } from './SidebarContext';
import { KilangToolbox } from './KilangToolbox';
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
  dispatch: React.Dispatch<KilangAction>;
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
  stats,
  fitTransform,
  layoutConfig,
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
      const canvas = container?.querySelector('[style*="width: 2000px"]');
      if (!container || !canvas) return;

      const cRect = container.getBoundingClientRect();
      const sRect = canvas.getBoundingClientRect();
      const currentScale = isFit ? fitTransform.scale : scale;

      setViewPos({
        x: Math.round((cRect.left - sRect.left) / currentScale),
        y: Math.round((cRect.top - sRect.top) / currentScale),
        w: Math.round(cRect.width / currentScale),
        h: Math.round(cRect.height / currentScale)
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

  return (
    <main className="flex-1 overflow-hidden relative">
      <div className="h-full flex flex-col">
        <div className="p-4" />
        <div className="flex-1 p-8 pt-4 overflow-hidden flex flex-col">
          <div className="flex-1 kilang-glass-panel rounded-3xl overflow-hidden relative flex flex-col border border-white/10 shadow-2xl">
            {/* Visual Toolbox Overlay - Pinned relative to panel */}
            {selectedRoot && (
              <>
                <KilangToolbox
                  layoutConfig={layoutConfig}
                  dispatch={dispatch}
                />
                <div className="absolute top-6 right-8 text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] pointer-events-none select-none z-0 text-right">
                  2000 x 2000 px<br />
                  <div className="mt-2 text-white/10">
                    VP TL: 0, 0 px<br />
                    VP TR: {viewPos.w}, 0 px<br />
                    ASPECT: {(viewPos.w / (viewPos.h || 1)).toFixed(2)}<br />
                    CV TL: {-viewPos.x}, {-viewPos.y} px<br />
                    CV TR: {2000 - viewPos.x}, {-viewPos.y} px
                  </div>
                </div>
              </>
            )}

            {selectedRoot ? (
              <div 
                ref={treeRef} 
                className="flex-1 overflow-auto no-scrollbar bg-[#020617]/40 relative flex items-center justify-center p-32"
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
                    width: '2000px',
                    height: '2000px',
                    transform: isFit
                      ? `scale(${fitTransform.scale}) translate(${fitTransform.x}px, ${fitTransform.y}px)`
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
      </div>
    </main>
  );
};
