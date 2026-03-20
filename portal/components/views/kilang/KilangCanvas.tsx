import React from 'react';
import { Activity, RefreshCw, TreePine, ChevronRight, Minimize2, Maximize2, Minus, Plus, RotateCcw, ArrowRight, ArrowUp, LayoutGrid, Rows, Copy, Check, Monitor, Maximize, Minimize } from 'lucide-react';
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
import { useKilangContext } from './KilangContext';

// Extracted Components
import { PerformanceMonitor } from './components/PerformanceMonitor';
import { LineageCanvas } from './components/LineageCanvas';
import { KilangLanding } from './components/KilangLanding';
import { KilangExportHUD } from './KilangExportHUD';

// New Canvas Components
import { ForestView } from './components/canvas/ForestView';
import { CanvasControls } from './components/canvas/CanvasControls';
import { CanvasOverlays } from './components/canvas/CanvasOverlays';
import { ChainInscription } from './components/canvas/ChainInscription';

interface KilangCanvasProps {}

export const KilangCanvas = () => {
  const {
    state,
    dispatch,
    nodeMap,
    fetchRootDetails,
    summaryCache,
    fetchSummary,
    handleExport,
    treeRef,
  } = useKilangContext();

  const {
    selectedRoot,
    rootData,
    direction,
    arrangement,
    isFit,
    scale,
    stats,
    fitTransform,
    layoutConfig,
    showDimensions,
    resetToken,
    showPerfMonitor,
    landingVersion,
    logoStyles,
    logoSettings: stateLogoSettings,
    moveZoomToCanvas,
    moveGrowthToCanvas,
    moveCaptureToCanvas,
    moveChainToCanvas,
    exportSettings,
    showExportDropdown,
    exporting,
    showTreeTooltips = true,
    isFullView = false,
  } = state;

  const logoStyle = logoStyles[landingVersion];
  const logoSettings = stateLogoSettings[landingVersion];

  const setScale = (s: number | ((prev: number) => number)) => {
    const val = typeof s === 'function' ? s(scale) : s;
    dispatch({ type: 'SET_TRANSFORM', scale: val });
  };
  const setIsFit = (fit: boolean) => dispatch({ type: 'SET_TRANSFORM', isFit: fit });
  const setDirection = (d: string) => dispatch({ type: 'SET_LAYOUT', direction: d as any });
  const setArrangement = (a: string) => dispatch({ type: 'SET_LAYOUT', arrangement: a as any });
  const exportRef = React.useRef<HTMLDivElement>(null);

  // Keyboard shortcuts (Esc to exit Full View)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullView) {
        dispatch({ type: 'SET_UI', isFullView: false });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullView, dispatch]);

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

  const latestStateRef = React.useRef({ scale, isFit, fitTransform });
  React.useEffect(() => {
    latestStateRef.current = { scale, isFit, fitTransform };
  }, [scale, isFit, fitTransform]);

  React.useEffect(() => {
    const el = treeRef.current;
    if (!el) return;

    const updatePos = () => {
      const container = treeRef.current;
      const canvas = container?.querySelector('[style*="width: 4000px"]');
      if (!container || !canvas) return;

      const cRect = container.getBoundingClientRect();
      const sRect = canvas.getBoundingClientRect();
      const { isFit: curFit, fitTransform: curFitTrans, scale: curScale } = latestStateRef.current;
      const currentScale = curFit ? curFitTrans.scale : curScale;

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
      const fineTuningFactor = e.altKey ? 0.1 : 1.0;

      if (e.ctrlKey) {
        e.preventDefault();
        const container = treeRef.current;
        if (!container) return;

        // Current metrics
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Mouse position in world coordinates (at current scale)
        const { isFit: curFit, fitTransform: curFitTrans, scale: curScale } = latestStateRef.current;
        const currentScale = curFit ? curFitTrans.scale : curScale;
        const worldX = (mouseX + container.scrollLeft) / currentScale;
        const worldY = (mouseY + container.scrollTop) / currentScale;

        // Calculate next scale with fine-tuning factor
        const zoomSpeed = 0.0012;
        const delta = -e.deltaY * zoomSpeed * fineTuningFactor;
        const nextScale = Math.min(Math.max(currentScale + delta, 0.1), 3);

        if (nextScale === currentScale) return;

        // Apply scale change immediately to state
        dispatch({ type: 'SET_TRANSFORM', scale: nextScale, isFit: false });

        // Calculate and apply scroll adjustment
        const nextScrollLeft = (worldX * nextScale) - mouseX;
        const nextScrollTop = (worldY * nextScale) - mouseY;

        container.scrollTo({
          left: nextScrollLeft,
          top: nextScrollTop,
          behavior: 'auto'
        });
      } else if (e.altKey) {
        // Fine-tuned Panning
        e.preventDefault();
        const container = treeRef.current;
        if (container) {
          if (e.shiftKey) {
            // Fine Horizontal
            container.scrollLeft += e.deltaY * fineTuningFactor;
          } else {
            // Fine Vertical
            container.scrollTop += e.deltaY * fineTuningFactor;
          }
        }
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
  }, [treeRef, dispatch, selectedRoot]);

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

      const currentScale = isFit ? fitTransform.scale : scale;
      const hBias = direction === 'horizontal' ? 0.15 : 0.5;
      const vBias = direction === 'vertical' ? 0.85 : 0.5;

      const scrollLeft = (pos.x * currentScale) - (container.clientWidth * hBias);
      const scrollTop = (pos.y * currentScale) - (container.clientHeight * vBias);

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

  const [copiedChain, setCopiedChain] = React.useState(false);

  const handleCopyChain = (path: string[]) => {
    navigator.clipboard.writeText(path.join(' > '));
    setCopiedChain(true);
    setTimeout(() => setCopiedChain(false), 2000);
  };

  const forestBounds = React.useMemo(() => getForestBoundingBox(nodeMap), [nodeMap]);
  const rootPos = React.useMemo(() => nodeMap[normalizeWord(selectedRoot || '') || ''], [nodeMap, selectedRoot]);

  return (
    <main className="flex-1 overflow-hidden relative">
      <div className={`h-full flex flex-col overflow-hidden transition-all duration-500 ${isFullView ? 'p-0 bg-[var(--kilang-bg-base)]' : 'p-8'}`}>
        <div className={`flex-1 overflow-hidden relative flex flex-col transition-all duration-500 ${isFullView ? 'kilang-glass-panel-immersive' : 'kilang-glass-panel rounded-3xl border border-[var(--kilang-border-std)] shadow-[var(--kilang-shadow-primary)]'}`}>
          {/* Overlays Layer */}
          <CanvasOverlays
            showPerfMonitor={showPerfMonitor}
            exporting={exporting}
            selectedRoot={selectedRoot || ''}
            layoutConfig={layoutConfig}
            dispatch={dispatch}
            viewPos={viewPos}
            treeRef={treeRef as React.RefObject<HTMLDivElement>}
            showDimensions={showDimensions}
            rootPos={rootPos || null}
            scale={scale}
            isFit={isFit}
            fitTransform={fitTransform}
            forestBounds={forestBounds}
          />

          {/* Controls Layer */}
          <CanvasControls
            selectedRoot={selectedRoot || ''}
            exporting={exporting}
            isFullView={isFullView}
            isFit={isFit}
            setIsFit={setIsFit}
            direction={direction}
            setDirection={setDirection}
            arrangement={arrangement}
            setArrangement={setArrangement}
            scale={scale}
            setScale={setScale}
            moveZoomToCanvas={moveZoomToCanvas}
            moveGrowthToCanvas={moveGrowthToCanvas}
            moveCaptureToCanvas={moveCaptureToCanvas}
            exportSettings={exportSettings}
            showExportDropdown={showExportDropdown}
            handleExport={handleExport}
            dispatch={dispatch}
          />

          {/* Core Content Layer */}
          {selectedRoot ? (
            <div
              ref={treeRef}
              className="flex-1 overflow-auto no-scrollbar bg-[var(--kilang-bg-base)]/40 relative p-32 scroll-smooth"
              onClick={() => dispatch({ type: 'SET_CANVAS_SELECT', node: null })}
            >
              {/* Status Indicators */}
              {rootData?.error && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center space-y-4 bg-[var(--kilang-bg-base)]/80 backdrop-blur-sm">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                    <Activity className="w-8 h-8" />
                  </div>
                  <div className="text-red-500 font-mono text-sm tracking-widest uppercase">Forest Poisoned</div>
                  <div className="text-red-400/60 text-[10px] font-mono italic max-w-xs text-center">{rootData.errorMessage}</div>
                </div>
              )}

              {rootData?.loading && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center space-y-4 bg-transparent pointer-events-none">
                  <RefreshCw className="w-10 h-10 text-[var(--kilang-primary)] animate-spin opacity-50" />
                  <div className="animate-pulse text-[var(--kilang-primary)] font-mono italic text-xs tracking-widest uppercase">Blooming forest...</div>
                </div>
              )}

              {/* The Tree */}
              <ForestView
                selectedRoot={selectedRoot || ''}
                rootData={rootData}
                nodeMap={nodeMap}
                direction={direction}
                arrangement={arrangement}
                isFit={isFit}
                scale={scale}
                fitTransform={fitTransform}
                layoutConfig={layoutConfig}
                activeHighlightChain={activeHighlightChain}
                summaryCache={summaryCache}
                fetchSummary={fetchSummary}
                showTreeTooltips={showTreeTooltips}
                dispatch={dispatch}
              />
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

          {/* Chain Inscription Layer */}
          <ChainInscription
            linearPath={linearPath}
            exporting={exporting}
            moveChainToCanvas={moveChainToCanvas}
            handleCopyChain={handleCopyChain}
            copiedChain={copiedChain}
          />
        </div>
      </div>
    </main>
  );
};

