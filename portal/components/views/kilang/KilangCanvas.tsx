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
import { useKilangStyleSync } from './hooks/useKilangStyleSync';

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
    const val = typeof s === 'function' ? s(cam.k) : s;
    const newCam = { ...cam, k: val };
    setCam(newCam);
    dispatch({ type: 'SET_TRANSFORM', canvasTransform: newCam, isFit: false });
  };

  const setIsFit = (fit: boolean) => {
    dispatch({ type: 'SET_TRANSFORM', isFit: fit });
    if (!fit) {
      // If exiting fit mode, we just stay where we are but mark as not-fit
    }
  };
  const setDirection = (d: string) => dispatch({ type: 'SET_LAYOUT', direction: d as any });
  const setArrangement = (a: string) => dispatch({ type: 'SET_LAYOUT', arrangement: a as any });
  const exportRef = React.useRef<HTMLDivElement>(null);
  const forestRef = React.useRef<HTMLDivElement>(null);
  const treeRef = React.useRef<HTMLDivElement>(null);
  const zoomDebounceRef = React.useRef<NodeJS.Timeout | null>(null);

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

  // 🚀 ROBUST LOCAL CAMERA STATE
  const [cam, setCam] = React.useState({ x: 0, y: 0, k: 1 });
  const latestCamRef = React.useRef(cam);
  React.useEffect(() => { latestCamRef.current = cam; }, [cam]);
  
  const isPanningInternal = React.useRef(false);
  const panningRef = React.useRef({ isPanning: false, startX: 0, startY: 0, initialCamX: 0, initialCamY: 0 });

  // Sync from Store on Load
  React.useLayoutEffect(() => {
    if (state.canvasTransform) {
      setCam(state.canvasTransform);
    }
  }, [state.canvasTransform]);

  // 🎡 NON-PASSIVE WHEEL LISTENER (Critical for e.preventDefault)
  React.useLayoutEffect(() => {
    const el = treeRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // 1. Zoom (Ctrl + Wheel)
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = -e.deltaY;
        const speed = 0.002;
        const newK = Math.min(Math.max(latestCamRef.current.k * (1 + delta * speed), 0.1), 3);
        
        // Focal Zoom Math: keep cursor on same world coordinates
        const rect = el.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const worldX = (mouseX - latestCamRef.current.x) / latestCamRef.current.k;
        const worldY = (mouseY - latestCamRef.current.y) / latestCamRef.current.k;
        
        const newX = mouseX - worldX * newK;
        const newY = mouseY - worldY * newK;
        
        setCam({ x: newX, y: newY, k: newK });
        return;
      }

      // 2. Pan (Shift + Wheel)
      if (e.shiftKey) {
        e.preventDefault();
        setCam(prev => ({ ...prev, x: prev.x - e.deltaY }));
        return;
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [treeRef]);

  // --- 🌳 HELPER VARIABLES (Moved up to avoid usage-before-declaration) ---
  const activeHighlightNode = value.state.canvasHoverNode || value.state.canvasSelectedNode;

  const activeHighlightChain = React.useMemo(() =>
    getActiveHighlightChain(activeHighlightNode, rootData?.derivatives, selectedRoot),
    [activeHighlightNode, rootData?.derivatives, selectedRoot]
  );

  const linearPath = React.useMemo(() =>
    getLinearPath(activeHighlightNode, rootData?.derivatives, selectedRoot),
    [activeHighlightNode, rootData?.derivatives, selectedRoot]
  );

  const forestBounds = React.useMemo(() => getForestBoundingBox(nodeMap), [nodeMap]);
  const rootPos = React.useMemo(() => nodeMap[normalizeWord(selectedRoot || '') || ''], [nodeMap, selectedRoot]);

  const deepRoots = React.useMemo(() => {
    if (!stats?.deep_examples) return [];
    const roots = Object.keys(stats.deep_examples).sort((a, b) => {
      const lenA = Array.isArray(stats.deep_examples[a]) ? stats.deep_examples[a].length : 0;
      const lenB = Array.isArray(stats.deep_examples[b]) ? stats.deep_examples[b].length : 0;
      return lenB - lenA;
    });
    return roots.slice(0, 5);
  }, [stats]);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.kilang-node')) return;
    
    isPanningInternal.current = true;
    panningRef.current = {
      isPanning: true,
      startX: e.clientX,
      startY: e.clientY,
      initialCamX: cam.x,
      initialCamY: cam.y,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!isPanningInternal.current) return;
      const dx = moveEvent.clientX - panningRef.current.startX;
      const dy = moveEvent.clientY - panningRef.current.startY;
      setCam(prev => ({
        ...prev,
        x: panningRef.current.initialCamX + dx,
        y: panningRef.current.initialCamY + dy
      }));
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      isPanningInternal.current = false;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      // Synchronize back to store at end of gesture
      dispatch({ type: 'SET_TRANSFORM', canvasTransform: latestCamRef.current, isFit: false });
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    dispatch({ type: 'SET_TRANSFORM', isFit: false });
  };

  // 📐 REDONE FIT ENGINE (Centering + Scaling)
  const triggerFit = React.useCallback(() => {
    if (!treeRef.current || !rootPos) return;
    const container = treeRef.current;
    
    // 1. Calculate the bounding box of the whole forest
    const bounds = getForestBoundingBox(nodeMap);
    const boxWidth = bounds.maxX - bounds.minX;
    const boxHeight = bounds.maxY - bounds.minY;
    
    // 2. Calculate optimal scale to fit the container (with padding)
    const padding = 100;
    const vWidth = container.clientWidth - padding;
    const vHeight = container.clientHeight - padding;
    
    const scaleX = vWidth / (boxWidth || 1);
    const scaleY = vHeight / (boxHeight || 1);
    const newK = Math.min(Math.max(Math.min(scaleX, scaleY), 0.15), 1.0);
    
    // 3. Center the forest
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    
    const newX = container.clientWidth / 2 - centerX * newK;
    const newY = container.clientHeight / 2 - centerY * newK;
    
    const newCam = { x: newX, y: newY, k: newK };
    setCam(newCam);
    dispatch({ type: 'SET_TRANSFORM', canvasTransform: newCam, isFit: true });
  }, [nodeMap, rootPos, treeRef, dispatch]);

  React.useLayoutEffect(() => {
    if (isFit && selectedRoot && !rootData?.loading) {
      triggerFit();
    }
  }, [isFit, selectedRoot, rootData?.loading, triggerFit, resetToken]);

  const [copiedChain, setCopiedChain] = React.useState(false);

  const handleCopyChain = (path: string[]) => {
    navigator.clipboard.writeText(path.join(' > '));
    setCopiedChain(true);
    setTimeout(() => setCopiedChain(false), 2000);
  };

  const isImmersive = isFullView || !selectedRoot;

  return (
    <main className="flex-1 overflow-hidden relative">
      <div className={`h-full flex flex-col overflow-hidden transition-all duration-500 ${isImmersive ? 'p-0 bg-[var(--kilang-bg-base)]' : 'p-8'}`}>
        <div className={`flex-1 overflow-hidden relative flex flex-col transition-all duration-500 ${isImmersive ? 'kilang-glass-panel-immersive' : 'kilang-glass-panel rounded-3xl border border-[var(--kilang-border-std)] shadow-[var(--kilang-shadow-primary)]'}`}>
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
            scale={cam.k}
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
            scale={cam.k}
            setScale={setScale}
            moveZoomToCanvas={moveZoomToCanvas}
            moveGrowthToCanvas={moveGrowthToCanvas}
            moveCaptureToCanvas={moveCaptureToCanvas}
            exportSettings={exportSettings}
            showExportDropdown={showExportDropdown}
            handleExport={handleExport}
            dispatch={dispatch}
            hideCanvasControls={state.hideCanvasControls}
            moveFullViewToCanvas={state.moveFullViewToCanvas}
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
                ref={forestRef}
                selectedRoot={selectedRoot || ''}
                rootData={rootData}
                nodeMap={nodeMap}
                direction={direction}
                arrangement={arrangement}
                isFit={isFit}
                scale={cam.k}
                fitTransform={fitTransform}
                layoutConfig={layoutConfig}
                activeHighlightChain={activeHighlightChain}
                summaryCache={summaryCache}
                fetchSummary={fetchSummary}
                showTreeTooltips={showTreeTooltips}
                dispatch={dispatch}
                canvasTransform={cam}
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

