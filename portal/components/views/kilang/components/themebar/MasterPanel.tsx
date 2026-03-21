'use client';

import React from 'react';
import { Sliders, Maximize, Layers, Lightbulb, Zap } from 'lucide-react';
import { RibbonGroup, VariableControl } from './Shared';

interface MasterPanelProps {
  tsState: any;
  tsHelpers: any;
  tsActions: any;
}

export const MasterPanel = ({
  tsState,
  tsHelpers,
  tsActions
}: MasterPanelProps) => {
  const { overrides, activeBulbs } = tsState;
  const { getVariableValue, getColorValue, getHonestColor } = tsHelpers;
  const { updateVariable, updateVariables, setActiveBulbs } = tsActions;

  const masters = [
    { id: 'bg', label: 'Backgrounds', type: 'color', targets: ['--kilang-bg-base', '--kilang-bg', '--kilang-card', '--kilang-primary-bg', '--kilang-secondary-bg', '--kilang-accent-bg', '--kilang-tooltip-bg', '--kilang-toast-bg', '--kilang-primary-glow', '--kilang-secondary-glow', '--kilang-accent-glow', '--kilang-overlay-bg', '--kilang-input-bg', '--kilang-ctrl-bg', '--kilang-shadow-color', '--kilang-background-secondary', '--kilang-primary', '--kilang-secondary', '--kilang-accent', '--kilang-primary-active', '--kilang-tooltip-accent', '--kilang-resizer-hover', '--kilang-resizer-active'], activeTargets: ['--kilang-ctrl-active'] },
    { id: 'border', label: 'Borders', type: 'color', targets: ['--kilang-border', '--kilang-primary-border', '--kilang-secondary-border', '--kilang-accent-border', '--kilang-tooltip-border', '--kilang-toast-border', '--kilang-glass', '--kilang-border-std', '--kilang-muted-border', '--kilang-node-border', '--kilang-scrollbar-border'], activeTargets: ['--kilang-ctrl-active-border'] },
    { id: 'text', label: 'Texts', type: 'color', targets: ['--kilang-text', '--kilang-text-muted', '--kilang-primary-text', '--kilang-secondary-text', '--kilang-accent-text', '--kilang-logo-text', '--kilang-tooltip-text', '--kilang-toast-text', '--kilang-metric-text'], activeTargets: ['--kilang-ctrl-active-text'] },
    { id: 'tree', label: 'Tree', type: 'color', targets: ['--kilang-tier-1-fill', '--kilang-tier-2-fill', '--kilang-tier-3-fill', '--kilang-tier-4-fill', '--kilang-tier-5-fill', '--kilang-tier-6-fill', '--kilang-tier-7-fill', '--kilang-tier-8-fill', '--kilang-tier-9-fill', '--kilang-tier-1-border', '--kilang-tier-2-border', '--kilang-tier-3-border', '--kilang-tier-4-border', '--kilang-tier-5-border', '--kilang-tier-6-border', '--kilang-tier-7-border', '--kilang-tier-8-border', '--kilang-tier-9-border', '--kilang-tier-1-text', '--kilang-tier-2-text', '--kilang-tier-3-text', '--kilang-tier-4-text', '--kilang-tier-5-text', '--kilang-tier-6-text', '--kilang-tier-7-text', '--kilang-tier-8-text', '--kilang-tier-9-text', '--kilang-link-start', '--kilang-link-mid', '--kilang-link-end'] }
  ];

  const structural = {
    radii: [
      { name: '--kilang-radius-sm', label: 'Small Radius', type: 'text' },
      { name: '--kilang-radius-base', label: 'Base Radius', type: 'text' },
      { name: '--kilang-radius-md', label: 'Medium Radius', type: 'text' },
      { name: '--kilang-radius-lg', label: 'Large Radius', type: 'text' },
      { name: '--kilang-radius-display', label: 'Display Radius', type: 'text' }
    ],
    weights: [
      { name: '--kilang-border-w-std', label: 'Standard Weight', type: 'text' },
      { name: '--kilang-border-w-resizer', label: 'Resizer Weight', type: 'text' }
    ]
  };

  const renderVariableRow = (v: any) => {
    const isMasterControl = (v as any).targets !== undefined;
    const varKey = (v as any).label || (v as any).name;
    const isBulbOn = !!activeBulbs[varKey];

    return (
      <div key={varKey} className="flex items-center justify-between py-2.5 px-4 group/row hover:bg-white/[0.02] transition-all border-b border-white/5 last:border-0">
        <div className="flex flex-col">
          {(v as any).label && <span className="text-[11px] font-black uppercase tracking-widest text-white/90">{(v as any).label}</span>}
          {(v as any).name && <span className={`${(v as any).label ? 'text-[8px]' : 'text-[9px]'} font-mono text-white/40 lowercase tracking-tighter`}>{(v as any).name}</span>}
          {(v as any).targets && <span className="text-[7px] font-mono text-white/20 lowercase tracking-tighter">{(v as any).targets.length} + {(v as any).activeTargets?.length || 0} targets</span>}
        </div>

        <div className="relative flex items-center gap-3">
          {isMasterControl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const nextOn = !isBulbOn;
                setActiveBulbs((prev: any) => ({ ...prev, [varKey]: nextOn }));
                if (nextOn && (v as any).activeTargets) {
                  const currentVal = getColorValue((v as any).targets[0]);
                  const mapping: Record<string, string> = {};
                  (v as any).activeTargets.forEach((t: string) => mapping[t] = currentVal);
                  updateVariables(mapping);
                }
              }}
              className={`p-1.5 rounded-lg transition-all ${isBulbOn ? 'bg-white/10 text-white shadow-lg' : 'text-white/10 hover:text-white/40'}`}
            >
              <Lightbulb className={`w-3.5 h-3.5 ${isBulbOn ? 'fill-white' : 'fill-transparent'}`} />
            </button>
          )}

          {v.type === 'color' || isMasterControl ? (
            <div className="relative w-7 h-7 flex items-center justify-center">
              <input
                type="color"
                value={getColorValue((v as any).name || (v as any).targets?.[0])}
                onChange={(e) => {
                  if ((v as any).targets) {
                    const finalTargets = [...(v as any).targets];
                    if (isBulbOn && (v as any).activeTargets) finalTargets.push(...(v as any).activeTargets);
                    const mapping: Record<string, string> = {};
                    finalTargets.forEach((t: string) => mapping[t] = e.target.value);
                    updateVariables(mapping);
                  } else {
                    updateVariable((v as any).name, e.target.value);
                  }
                }}
                className="w-full h-full bg-transparent border-0 cursor-pointer opacity-0 absolute inset-0 z-10"
              />
              <div
                className="w-7 h-7 rounded-lg border border-white/20 shadow-xl"
                style={{ backgroundColor: getHonestColor((v as any).name || (v as any).targets?.[0], overrides[(v as any).name || (v as any).targets?.[0]] || `var(${(v as any).name || (v as any).targets?.[0]})`) }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
               {((v as any).name?.includes('-radius-') || (v as any).name?.includes('-w-')) && (
                 <input
                   type="range" min="0" max="40" step="1"
                   value={parseInt(overrides[(v as any).name] || getVariableValue((v as any).name) || '0')}
                   onChange={(e) => updateVariable((v as any).name, `${e.target.value}px`)}
                   className="w-16 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
                 />
               )}
               <input
                 type="text"
                 value={overrides[(v as any).name] || (getVariableValue((v as any).name) || '').trim()}
                 onChange={(e) => updateVariable((v as any).name, e.target.value)}
                 className="w-12 bg-black/40 border border-white/5 rounded-md text-right text-[10px] text-white/80 focus:text-white px-1 font-mono outline-none focus:border-white/20"
               />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-row h-full overflow-x-auto custom-scrollbar bg-[#020202]">
      {/* COLUMN 1: MASTERS */}
      <div className="flex-1 min-w-[300px] max-w-[320px] border-r border-white/10 flex flex-col h-full shrink-0 bg-[#0a0a0a]">
        <div className="h-10 px-6 flex items-center justify-between bg-black/40 border-b border-white/5 shrink-0">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Master Presets</span>
          <Zap className="w-3.5 h-3.5 text-white/20" />
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0 pb-10">
          <RibbonGroup label="Master Tuning Controls">
            <div className="bg-white/[0.03] border-b border-white/10">
              {masters.map((m) => renderVariableRow(m))}
            </div>
          </RibbonGroup>
        </div>
      </div>

      {/* COLUMN 2: GEOMETRY */}
      <div className="flex-1 min-w-[300px] max-w-[320px] border-r border-white/10 flex flex-col h-full shrink-0 bg-[#0a0a0a]">
        <div className="h-10 px-6 flex items-center justify-between bg-black/40 border-b border-white/5 shrink-0">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Geometric Radii</span>
          <Layers className="w-3.5 h-3.5 text-white/20" />
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0 pb-10">
          <RibbonGroup label="Global Radii System">
            <div className="bg-white/[0.03] border-b border-white/10">
              {structural.radii.map((v) => renderVariableRow(v))}
            </div>
          </RibbonGroup>
        </div>
      </div>

      {/* COLUMN 3: WEIGHTS */}
      <div className="flex-1 min-w-[300px] max-w-[320px] border-r border-white/10 flex flex-col h-full shrink-0 bg-[#0a0a0a]">
        <div className="h-10 px-6 flex items-center justify-between bg-black/40 border-b border-white/5 shrink-0">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Global Scaling</span>
          <Maximize className="w-3.5 h-3.5 text-white/20" />
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0 pb-10">
          <RibbonGroup label="Global Scaling & Weights">
            <div className="bg-white/[0.03] border-b border-white/10">
              {structural.weights.map((v) => renderVariableRow(v))}
            </div>
          </RibbonGroup>
        </div>
      </div>
    </div>
  );
};
