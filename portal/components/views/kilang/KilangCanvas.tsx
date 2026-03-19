import React from 'react';
import { Activity, RefreshCw, TreePine, ChevronRight, Minimize2, Maximize2, Minus, Plus, RotateCcw, ArrowRight, ArrowUp, LayoutGrid, Rows } from 'lucide-react';
import { KilangNode } from './KilangNode';
import {
  normalizeWord,
  getForestBoundingBox,
  getActiveHighlightChain,
  getLinearPath
} from './kilangUtils';
import { NodeMap, Derivation } from './KilangTypes';
import { useSidebar } from './SidebarContext';
import { KilangToolbox } from './KilangToolbox';
import { KilangDimensionsOverlay } from './KilangDimensionsOverlay';
import { KilangAction, KilangState } from './kilangReducer';

// Extracted Components
import { PerformanceMonitor } from './components/PerformanceMonitor';
import { LineageCanvas } from './components/LineageCanvas';
import { KilangLanding } from './components/KilangLanding';
import { KilangExportHUD } from './KilangExportHUD';

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
  logoStyle: 'original' | 'square' | 'round';
  logoSettings: { scale: number; radius: number; xOffset: number; opacity: number; glowIntensity: number; glowColor: string };
  showZoomIndicator: boolean;
  moveZoomToCanvas: boolean;
  moveGrowthToCanvas: boolean;
  moveCaptureToCanvas: boolean;
  setScale: (s: number | ((prev: number) => number)) => void;
  setIsFit: (fit: boolean) => void;
  setDirection: (d: string) => void;
  setArrangement: (a: string) => void;
  handleExport: () => void;
  exportSettings: KilangState['exportSettings'];
  showExportDropdown: boolean;
  exporting: boolean;
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
  showDimensions,
  resetToken,
  showPerfMonitor,
  logoStyle,
  logoSettings,
  showZoomIndicator,
  moveZoomToCanvas,
  moveGrowthToCanvas,
  moveCaptureToCanvas,
  setScale,
  setIsFit,
  setDirection,
  setArrangement,
  handleExport,
  exportSettings,
  showExportDropdown,
  exporting,
  dispatch
}: KilangCanvasProps) => {
  const exportRef = React.useRef<HTMLDivElement>(null);

  // Auto-close export dropdown on outside click
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        dispatch({ type: 'SET_UI', showExportDropdown: false });
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dispatch]);
  const value = useSidebar();
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

    const onWheel = (e: WheelEvent) => {
      if (e.altKey) {
        e.preventDefault();
        const container = treeRef.current;
        if (!container) return;

        // Current metrics
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Mouse position in world coordinates (at current scale)
        const currentScale = isFit ? fitTransform.scale : scale;
        const worldX = (mouseX + container.scrollLeft) / currentScale;
        const worldY = (mouseY + container.scrollTop) / currentScale;

        // Calculate next scale
        const zoomSpeed = 0.001;
        const delta = -e.deltaY * zoomSpeed;
        const nextScale = Math.min(Math.max(currentScale + delta, 0.1), 3);

        if (nextScale === currentScale) return;

        // Apply scale change immediately to state
        dispatch({ type: 'SET_TRANSFORM', scale: nextScale, isFit: false });

        // Calculate and apply scroll adjustment
        const nextScrollLeft = (worldX * nextScale) - mouseX;
        const nextScrollTop = (worldY * nextScale) - mouseY;

        container.scrollLeft = nextScrollLeft;
        container.scrollTop = nextScrollTop;
      }
    };

    updatePos();
    el.addEventListener('scroll', updatePos);
    el.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', updatePos);

    const timer = setInterval(updatePos, 200); // Poll for transition-based moves

    return () => {
      el.removeEventListener('scroll', updatePos);
      el.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', updatePos);
      clearInterval(timer);
    };
  }, [selectedRoot, treeRef, isFit, scale, fitTransform, dispatch]);

  const activeHighlightNode = value.state.canvasHoverNode || value.state.canvasSelectedNode;

  const activeHighlightChain = React.useMemo(() =>
    getActiveHighlightChain(activeHighlightNode, rootData?.derivatives, selectedRoot),
    [activeHighlightNode, rootData?.derivatives, selectedRoot]
  );

  const linearPath = React.useMemo(() =>
    getLinearPath(activeHighlightNode, rootData?.derivatives, selectedRoot),
    [activeHighlightNode, rootData?.derivatives, selectedRoot]
  );

  const deepRoots = React.useMemo(() => {
    if (!stats?.deep_examples) return [];

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

      const hBias = direction === 'horizontal' ? 0.15 : 0.5;
      const vBias = direction === 'vertical' ? 0.85 : 0.5;

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
  }, [selectedRoot, rootData?.loading, isFit, resetToken, direction, arrangement, nodeMap]);

  const forestBounds = React.useMemo(() => getForestBoundingBox(nodeMap), [nodeMap]);
  const rootPos = React.useMemo(() => nodeMap[normalizeWord(selectedRoot || '') || ''], [nodeMap, selectedRoot]);

  return (
    <main className="flex-1 overflow-hidden relative">
      <div className="h-full flex flex-col p-8 overflow-hidden">
        <div className="flex-1 kilang-glass-panel rounded-3xl overflow-hidden relative flex flex-col border border-white/10 shadow-2xl">
          {showPerfMonitor && !exporting && <PerformanceMonitor />}

          {(moveGrowthToCanvas || showZoomIndicator) && !exporting && selectedRoot && (
            <div className="absolute top-6 left-6 z-[100] flex flex-col gap-3 animate-in slide-in-from-top-2 duration-300">
              {moveGrowthToCanvas && (
                <div className="flex flex-col gap-2">
                  <div className="kilang-ctrl-container !bg-[#020617]/40 backdrop-blur-md !border-white/10 !p-1 shadow-2xl w-fit">
                    <button
                      onClick={() => setDirection('horizontal')}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${direction === 'horizontal' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                      title="Horizontal Growth"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDirection('vertical')}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${direction === 'vertical' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                      title="Vertical Growth"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-[1px] h-4 bg-white/10 mx-1 self-center" />
                    <button
                      onClick={() => setArrangement('flow')}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${arrangement === 'flow' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                      title="Flow Arrangement"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setArrangement('aligned')}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${arrangement === 'aligned' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                      title="Aligned Arrangement"
                    >
                      <Rows className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {showZoomIndicator && (
                <div className="px-3 py-1.5 bg-[#020617]/40 backdrop-blur-md rounded-xl border border-white/10 shadow-xl flex items-center gap-2 group self-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">Level</span>
                    <span className="text-[12px] font-mono font-black text-blue-400">
                      {isFit ? (fitTransform.scale * 100).toFixed(0) : (scale * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {moveZoomToCanvas && selectedRoot && !exporting && (
            <div className="absolute top-6 right-6 z-[100] animate-in slide-in-from-top-2 duration-300">
              <div className="kilang-ctrl-container !bg-[#020617]/40 backdrop-blur-md !border-white/10 !p-1 shadow-2xl w-fit">
                <button
                  onClick={() => setIsFit(!isFit)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isFit ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                  title={isFit ? "Expand to Actual Size" : "Fit Tree"}
                >
                  {isFit ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => { setScale((prev: number) => Math.max(0.2, (typeof prev === 'number' ? prev : 1) - 0.1)); setIsFit(false); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all" title="Out">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => { setScale((prev: number) => Math.min(2, (typeof prev === 'number' ? prev : 1) + 0.1)); setIsFit(false); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all" title="In">
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => dispatch({ type: 'RESET_TRANSFORM' })} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all" title="Reset Zoom">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {moveCaptureToCanvas && selectedRoot && !exporting && (
            <KilangExportHUD
              exportSettings={exportSettings}
              showExportDropdown={showExportDropdown}
              exporting={exporting}
              dispatch={dispatch}
              handleExport={handleExport}
              dropdownPosition="bottom"
              align="left"
              variant="canvas"
              className="absolute bottom-6 left-6 z-[110]"
            />
          )}

          {selectedRoot && !exporting && (
            <>
              <KilangToolbox
                layoutConfig={layoutConfig}
                dispatch={dispatch}
              />

              <KilangDimensionsOverlay
                viewPos={viewPos}
                treeRef={treeRef}
                showDimensions={showDimensions}
                rootPos={rootPos || null}
                scale={scale}
                isFit={isFit}
                fitTransform={fitTransform}
                forestBounds={forestBounds}
              />
            </>
          )}

          {selectedRoot ? (
            <div
              ref={treeRef}
              className="flex-1 overflow-auto no-scrollbar bg-[#020617]/40 relative p-32 scroll-smooth"
              onClick={() => dispatch({ type: 'SET_CANVAS_SELECT', node: null })}
            >
              {rootData?.error && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center space-y-4 bg-[#020617]/80 backdrop-blur-sm">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                    <Activity className="w-8 h-8" />
                  </div>
                  <div className="text-red-500 font-mono text-sm tracking-widest uppercase">Forest Poisoned</div>
                  <div className="text-red-400/60 text-[10px] font-mono italic max-w-xs text-center">{rootData.errorMessage}</div>
                </div>
              )}

              {rootData?.loading && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center space-y-4 bg-transparent pointer-events-none">
                  <RefreshCw className="w-10 h-10 text-blue-500 animate-spin opacity-50" />
                  <div className="animate-pulse text-blue-500 font-mono italic text-xs tracking-widest uppercase">Blooming forest...</div>
                </div>
              )}

              <div
                id="kilang-forest-inner"
                key={selectedRoot}
                className="relative"
                style={{
                  width: '4000px',
                  height: '4000px',
                  transform: isFit
                    ? `translate(${fitTransform.x}px, ${fitTransform.y}px) scale(${fitTransform.scale})`
                    : `scale(${scale})`,
                  transformOrigin: rootPos ? `${rootPos.x}px ${rootPos.y}px` : 'center center'
                }}
              >
                {/* 1. SVG Layer (Background) */}
                {rootPos && (
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
                      activeHighlightChain={activeHighlightChain}
                      dispatch={dispatch}
                    />
                  </div>
                )}

                {/* 2. Nodes Layer (Foreground) */}
                <div className="absolute inset-0" style={{ zIndex: 10 }}>
                  {/* Root Node */}
                  {rootPos && (
                    <div
                      key={`root-${selectedRoot}`}
                      className="absolute transition-all duration-500 animate-in fade-in duration-1000"
                      style={{
                        left: 0,
                        top: 0,
                        transform: `translate(-50%, -50%) translate(${rootPos.x}px, ${rootPos.y}px)`,
                        zIndex: 20
                      }}
                    >
                      <KilangNode
                        word={selectedRoot || ''}
                        isRoot={true}
                        summaryCache={summaryCache}
                        fetchSummary={fetchSummary}
                        config={layoutConfig}
                        isHighlighted={activeHighlightChain.has(normalizeWord(selectedRoot || '') || '')}
                        isHovered={value.state.canvasHoverNode === normalizeWord(selectedRoot || '')}
                        onInteraction={(type: 'hover' | 'select', word: string | null) => {
                          if (type === 'hover') dispatch({ type: 'SET_CANVAS_HOVER', node: word });
                          else if (type === 'select') dispatch({ type: 'SET_CANVAS_SELECT', node: word });
                        }}
                      />
                    </div>
                  )}

                  {/* Branches Forest */}
                  {(rootData?.derivatives as Derivation[])?.map((d: Derivation) => {
                    const pos = nodeMap[d.word_ab];
                    if (!pos || !rootPos) return null;
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
                              isHighlighted={activeHighlightChain.has(d.word_ab)}
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
                  })}
                </div>
              </div>
            </div>
          ) : (
            <KilangLanding
              version={value.state.landingVersion || 1}
              logoStyle={logoStyle}
              logoSettings={logoSettings}
              stats={stats}
              deepRoots={deepRoots}
              fetchRootDetails={fetchRootDetails}
            />
          )}

          {/* Chain Inscription Overlay */}
          {linearPath.length > 0 && !exporting && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-bottom-4 duration-500 pointer-events-none">
              <div className="bg-[#0f172a]/80 backdrop-blur-2xl border border-blue-500/30 px-8 py-4 rounded-[20px] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center gap-3">
                {linearPath.map((word: string, idx: number) => (
                  <React.Fragment key={word}>
                    <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${idx === linearPath.length - 1 ? 'text-blue-400' : 'text-white/40'}`}>
                      {word}
                    </span>
                    {idx < linearPath.length - 1 && (
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

