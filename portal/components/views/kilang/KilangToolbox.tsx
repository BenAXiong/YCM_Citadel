'use client';

import React from 'react';
import { X, RotateCcw, SlidersHorizontal, PencilLine, Box, Scaling, Palette, Circle, Triangle, Zap, ZapOff, Maximize2 } from 'lucide-react';
import { KilangAction, KilangState } from './kilangReducer';

interface KilangToolboxProps {
  layoutConfig: KilangState['layoutConfig'];
  dispatch: React.Dispatch<KilangAction>;
}

export const KilangToolbox = ({ layoutConfig, dispatch }: KilangToolboxProps) => {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const [height, setHeight] = React.useState(750);
  const isResizing = React.useRef(false);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const toolboxElement = document.getElementById('kilang-toolbox');
      if (toolboxElement) {
        const rect = toolboxElement.getBoundingClientRect();
        const newHeight = e.clientY - rect.top;
        setHeight(Math.max(200, Math.min(newHeight, window.innerHeight - 100)));
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = 'default';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
  if (!layoutConfig.showToolbox) return null;

  const updateConfig = (config: Partial<KilangState['layoutConfig']>) => {
    dispatch({ type: 'SET_LAYOUT_CONFIG', config });
  };

  const resetConfig = () => {
    dispatch({ type: 'RESET_LAYOUT_CONFIG' });
  };

  const closeToolbox = () => {
    updateConfig({ showToolbox: false });
  };

  return (
    <div
      id="kilang-toolbox"
      className="absolute top-6 left-6 w-72 bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[5001] flex flex-col overflow-hidden animate-in fade-in slide-in-from-left-4 duration-500"
      style={!isCollapsed ? { height: `${height}px` } : {}}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-2">
          <Box className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Visual Toolbox</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1.5 hover:bg-white/10 rounded-lg transition-all ${isCollapsed ? 'text-blue-400 -rotate-90' : 'text-white/40 rotate-180'}`}
            title={isCollapsed ? "Expand Toolbox" : "Collapse Toolbox"}
          >
            <Triangle className="w-2.5 h-2.5 fill-current" />
          </button>
          <button
            onClick={resetConfig}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
            title="Reset Defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={closeToolbox}
            className="p-1.5 hover:bg-red-500/20 rounded-lg text-white/40 hover:text-red-400 transition-colors"
            title="Close Toolbox"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-4 space-y-6 flex-1 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-300">
          {/* 1. Spacing & Paths */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-kilang-text-muted">
              <SlidersHorizontal className="w-3 h-3" />
              <span>Layout Spacing</span>
            </div>
            <div className="space-y-3 pl-1">
              <Slider
                label="Tier (H)"
                value={layoutConfig.interTierGap}
                min={10} max={600} step={10}
                unit="px"
                onChange={(v) => updateConfig({ interTierGap: v })}
              />
              <Slider
                label="Row (V)"
                value={layoutConfig.interRowGap}
                min={10} max={600} step={5}
                unit="px"
                onChange={(v) => updateConfig({ interRowGap: v })}
              />
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-kilang-text-muted">
              <PencilLine className="w-3 h-3" />
              <span>SVG Path Twitch</span>
            </div>
            <div className="space-y-3 pl-1">
              <Slider
                label="Gap X"
                value={layoutConfig.lineGapX}
                min={-100} max={300} step={5}
                unit="px"
                onChange={(v) => updateConfig({ lineGapX: v })}
              />
              <Slider
                label="Gap Y"
                value={layoutConfig.lineGapY}
                min={-100} max={300} step={5}
                unit="px"
                onChange={(v) => updateConfig({ lineGapY: v })}
              />
            </div>
          </section>

          {/* 2. Node Geometry */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-kilang-text-muted">
              <Scaling className="w-3 h-3" />
              <span>Node Geometry</span>
            </div>
            <div className="space-y-3 pl-1">
              <Slider
                label="Size"
                value={layoutConfig.nodeSize}
                min={0.5} max={2} step={0.1}
                unit="x"
                onChange={(v) => updateConfig({ nodeSize: v })}
              />
              <Slider
                label="Rounding"
                value={layoutConfig.nodeRounding}
                min={0} max={50} step={2}
                unit="px"
                onChange={(v) => updateConfig({ nodeRounding: v })}
              />
              <Slider
                label="Opacity"
                value={layoutConfig.nodeOpacity}
                min={0.1} max={1} step={0.05}
                unit=""
                onChange={(v) => updateConfig({ nodeOpacity: v })}
              />
              <Slider
                label="Word Width"
                value={layoutConfig.nodeWidth}
                min={80} max={250} step={5}
                unit="px"
                onChange={(v) => updateConfig({ nodeWidth: v })}
              />
              <Slider
                label="Vert Padding"
                value={layoutConfig.nodePaddingY}
                min={4} max={32} step={1}
                unit="px"
                onChange={(v) => updateConfig({ nodePaddingY: v })}
              />
              <div className="flex items-center justify-between pt-2">
                <span className="text-[8px] font-black uppercase tracking-widest text-blue-400/80">Tree Icons</span>
                <button
                  onClick={() => updateConfig({ showIcons: !layoutConfig.showIcons })}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${layoutConfig.showIcons ? 'bg-blue-600/20 border-blue-500/40 text-blue-400' : 'bg-white/5 border-white/10 text-white/30 hover:border-white/30'}`}
                >
                  {layoutConfig.showIcons ? <Zap className="w-3 h-3" /> : <ZapOff className="w-3 h-3" />}
                  <span className="text-[8px] font-black uppercase">{layoutConfig.showIcons ? 'Visible' : 'Hidden'}</span>
                </button>
              </div>
            </div>
          </section>

          {/* 3. Anchors */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-kilang-text-muted">
              <Maximize2 className="w-3 h-3" />
              <span>Root anchor</span>
            </div>
            <div className="space-y-6 pl-1">
              <div className="grid grid-cols-2 gap-4">
                <Slider
                  label="X"
                  value={layoutConfig.anchorX}
                  min={0} max={2000} step={10}
                  unit="px"
                  onChange={(v) => updateConfig({ anchorX: v })}
                />
                <Slider
                  label="Y"
                  value={layoutConfig.anchorY}
                  min={0} max={2000} step={10}
                  unit="px"
                  onChange={(v) => updateConfig({ anchorY: v })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Slider
                  label="X"
                  value={Math.round((layoutConfig.anchorX / 2000) * 100)}
                  min={0} max={100} step={1}
                  unit="%"
                  onChange={(v) => updateConfig({ anchorX: (v / 100) * 2000 })}
                />
                <Slider
                  label="Y"
                  value={Math.round((layoutConfig.anchorY / 2000) * 100)}
                  min={0} max={100} step={1}
                  unit="%"
                  onChange={(v) => updateConfig({ anchorY: (v / 100) * 2000 })}
                />
              </div>
              <p className="text-[7px] text-white/20 italic leading-relaxed">Relative % is mapped to the internal 2000px forest canvas.</p>
            </div>
          </section>

          {/* 3. Colors */}
          <section className="space-y-4 pb-2">
            <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-kilang-text-muted">
              <Palette className="w-3 h-3" />
              <span>Aesthetics</span>
            </div>
            <div className="grid grid-cols-3 gap-x-2 gap-y-6 pl-1">
              <div className="space-y-2">
                <span className="text-[7px] font-black uppercase tracking-widest text-gray-400">Root</span>
                <div className="flex flex-col items-center gap-2">
                  <input
                    type="color"
                    value={layoutConfig.rootColor}
                    onChange={(e) => updateConfig({ rootColor: e.target.value })}
                    className="w-8 h-8 bg-transparent border-none rounded cursor-pointer"
                  />
                  <span className="text-[8px] font-mono text-white/40 uppercase">{layoutConfig.rootColor}</span>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[7px] font-black uppercase tracking-widest text-gray-400">Branch</span>
                <div className="flex flex-col items-center gap-2">
                  <input
                    type="color"
                    value={layoutConfig.branchColor}
                    onChange={(e) => updateConfig({ branchColor: e.target.value })}
                    className="w-8 h-8 bg-transparent border-none rounded cursor-pointer"
                  />
                  <span className="text-[8px] font-mono text-white/40 uppercase">{layoutConfig.branchColor}</span>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[7px] font-black uppercase tracking-widest text-emerald-400">Start</span>
                <div className="flex flex-col items-center gap-2">
                  <input
                    type="color"
                    value={layoutConfig.lineColor}
                    onChange={(e) => updateConfig({ lineColor: e.target.value })}
                    className="w-8 h-8 bg-transparent border-none rounded cursor-pointer"
                  />
                  <span className="text-[8px] font-mono text-white/40 uppercase">{layoutConfig.lineColor}</span>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[7px] font-black uppercase tracking-widest text-emerald-400">Mid</span>
                <div className="flex flex-col items-center gap-2">
                  <input
                    type="color"
                    value={layoutConfig.lineColorMid}
                    onChange={(e) => updateConfig({ lineColorMid: e.target.value })}
                    className="w-8 h-8 bg-transparent border-none rounded cursor-pointer"
                  />
                  <span className="text-[8px] font-mono text-white/40 uppercase">{layoutConfig.lineColorMid}</span>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[7px] font-black uppercase tracking-widest text-emerald-400">End</span>
                <div className="flex flex-col items-center gap-2">
                  <input
                    type="color"
                    value={layoutConfig.lineGradientEnd}
                    onChange={(e) => updateConfig({ lineGradientEnd: e.target.value })}
                    className="w-8 h-8 bg-transparent border-none rounded cursor-pointer"
                  />
                  <span className="text-[8px] font-mono text-white/40 uppercase">{layoutConfig.lineGradientEnd}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Resize Handle */}
      {!isCollapsed && (
        <div
          className="h-1.5 w-full bg-white/5 hover:bg-blue-500 transition-colors cursor-ns-resize absolute bottom-0 left-0"
          onMouseDown={(e) => {
            e.preventDefault();
            isResizing.current = true;
            document.body.style.cursor = 'ns-resize';
          }}
        />
      )}
    </div>
  );
};

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (val: number) => void;
}

const Slider = ({ label, value, min, max, step, unit, onChange }: SliderProps) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-blue-400/80">
      <span>{label}</span>
      <span className="font-mono">{value}{unit}</span>
    </div>
    <input
      type="range"
      min={min} max={max} step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
    />
  </div>
);
