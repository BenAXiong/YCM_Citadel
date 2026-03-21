import React from 'react';
import { 
  Minimize, 
  Minimize2, 
  Maximize,
  Maximize2, 
  Minus, 
  Plus, 
  RotateCcw, 
  ArrowRight, 
  ArrowUp, 
  LayoutGrid, 
  Rows 
} from 'lucide-react';
import { KilangExportHUD } from '../../KilangExportHUD';
import { KilangAction } from '../../kilangReducer';

interface CanvasControlsProps {
  selectedRoot: string;
  exporting: boolean;
  isFullView: boolean;
  isFit: boolean;
  setIsFit: (fit: boolean) => void;
  direction: 'horizontal' | 'vertical';
  setDirection: (d: string) => void;
  arrangement: 'flow' | 'aligned';
  setArrangement: (a: string) => void;
  scale: number;
  setScale: (s: number | ((prev: number) => number)) => void;
  moveZoomToCanvas: boolean;
  moveGrowthToCanvas: boolean;
  moveCaptureToCanvas: boolean;
  moveFullViewToCanvas: boolean;
  hideCanvasControls: boolean;
  exportSettings: any;
  showExportDropdown: boolean;
  handleExport: () => Promise<void>;
  dispatch: React.Dispatch<KilangAction>;
}

export const CanvasControls: React.FC<CanvasControlsProps> = ({
  selectedRoot,
  exporting,
  isFullView,
  isFit,
  setIsFit,
  direction,
  setDirection,
  arrangement,
  setArrangement,
  scale,
  setScale,
  moveZoomToCanvas,
  moveGrowthToCanvas,
  moveCaptureToCanvas,
  moveFullViewToCanvas,
  hideCanvasControls,
  exportSettings,
  showExportDropdown,
  handleExport,
  dispatch,
}) => {
  if (!selectedRoot || exporting) return null;

  return (
    <>
      {/* Top Left: Growth & Arrangement */}
      {moveGrowthToCanvas && !hideCanvasControls && (
        <div
          className="absolute top-6 left-6 z-[100] flex flex-col gap-3 animate-in slide-in-from-top-2 duration-300"
          onMouseEnter={(e) => e.stopPropagation()}
          onMouseMove={(e) => e.stopPropagation()}
          onMouseOver={(e) => e.stopPropagation()}
        >
          <div className="kilang-ctrl-container !bg-[var(--kilang-bg-base)]/70 backdrop-blur-xl border border-[var(--kilang-border-std)] !p-1 shadow-[var(--kilang-shadow-primary)] w-fit">
            <button
              onClick={() => setDirection('horizontal')}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${direction === 'horizontal' ? 'bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)] shadow-[var(--kilang-shadow-primary)]' : 'text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)] hover:bg-[var(--kilang-ctrl-bg)]'}`}
              title="Horizontal Growth"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDirection('vertical')}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${direction === 'vertical' ? 'bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)] shadow-[var(--kilang-shadow-primary)]' : 'text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)] hover:bg-[var(--kilang-ctrl-bg)]'}`}
              title="Vertical Growth"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-4 border-l border-[var(--kilang-border-std)] mx-1 self-center" />
            <button
              onClick={() => setArrangement('flow')}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${arrangement === 'flow' ? 'bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)] shadow-[var(--kilang-shadow-primary)]' : 'text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)] hover:bg-[var(--kilang-ctrl-bg)]'}`}
              title="Flow Arrangement"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setArrangement('aligned')}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${arrangement === 'aligned' ? 'bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)] shadow-[var(--kilang-shadow-primary)]' : 'text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)] hover:bg-[var(--kilang-ctrl-bg)]'}`}
              title="Aligned Arrangement"
            >
              <Rows className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Right: Full View Toggle (Sync with Header) */}
      {moveFullViewToCanvas && !hideCanvasControls && (
        <div
          className={`absolute z-[100] animate-in slide-in-from-top-2 duration-300 top-6 right-6`}
          onMouseEnter={(e) => e.stopPropagation()}
          onMouseMove={(e) => e.stopPropagation()}
          onMouseOver={(e) => e.stopPropagation()}
        >
          <div className="kilang-ctrl-container !bg-[var(--kilang-bg-base)]/70 backdrop-blur-xl border border-[var(--kilang-border-std)] !p-1 shadow-[var(--kilang-shadow-primary)] w-fit">
            <button
              onClick={() => dispatch({ type: 'SET_UI', isFullView: !isFullView })}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isFullView ? 'bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)] shadow-[var(--kilang-shadow-primary)]' : 'text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)] hover:bg-[var(--kilang-ctrl-bg)]'}`}
              title={isFullView ? "Exit Immersive Full View" : "Enter Immersive Full View (Hide UI)"}
            >
              {isFullView ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Left: Zoom Controls */}
      {moveZoomToCanvas && !hideCanvasControls && (
        <div 
          className="absolute bottom-6 left-6 z-[110] animate-in slide-in-from-bottom-2 duration-300"
          onMouseEnter={(e) => e.stopPropagation()}
          onMouseMove={(e) => e.stopPropagation()}
          onMouseOver={(e) => e.stopPropagation()}
        >
          <div className="kilang-ctrl-container !bg-[var(--kilang-bg-base)]/70 backdrop-blur-xl border border-[var(--kilang-border-std)] !p-1 shadow-[var(--kilang-shadow-primary)] w-fit">
            <button
              onClick={() => setIsFit(!isFit)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isFit ? 'bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)] shadow-[var(--kilang-shadow-primary)]' : 'text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)] hover:bg-[var(--kilang-ctrl-bg)]'}`}
              title={isFit ? "Expand to Actual Size" : "Fit Tree"}
            >
              {isFit ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button 
              onClick={() => { setScale((prev: number) => Math.max(0.2, (typeof prev === 'number' ? prev : 1) - 0.1)); setIsFit(false); }} 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--kilang-text-muted)] hover:text(--kilang-text)] hover:bg-[var(--kilang-ctrl-bg)] transition-all" 
              title="Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => { setScale((prev: number) => Math.min(2, (typeof prev === 'number' ? prev : 1) + 0.1)); setIsFit(false); }} 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--kilang-text-muted)] hover:text(--kilang-text)] hover:bg-[var(--kilang-ctrl-bg)] transition-all" 
              title="In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => dispatch({ type: 'RESET_TRANSFORM' })} 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--kilang-text-muted)] hover:text(--kilang-text)] hover:bg-[var(--kilang-ctrl-bg)] transition-all" 
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Right: Export HUD */}
      {moveCaptureToCanvas && !hideCanvasControls && (
        <KilangExportHUD
          exportSettings={exportSettings}
          showExportDropdown={showExportDropdown}
          exporting={exporting}
          dispatch={dispatch}
          handleExport={handleExport}
          dropdownPosition="bottom"
          align="right"
          variant="canvas"
          className="absolute bottom-6 right-6 z-[110]"
        />
      )}
    </>
  );
};
