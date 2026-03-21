'use client';

import React, { useState } from 'react';
import { Palette, Layers, Type, Zap, BoxSelect, Lightbulb, RotateCcw } from 'lucide-react';
import { RibbonNav, RibbonGroup, VariableControl } from './Shared';

interface ThemesPanelProps {
  tsState: any;
  tsHelpers: any;
  tsActions: any;
  dispatch: any;
  layoutConfig: any;
  state: any;
  dense?: boolean;
}

export const groupVars = {
  surfaces: [
    { name: '--kilang-bg-base', label: 'Base BG', type: 'color' },
    { name: '--kilang-bg', label: 'Surface', type: 'color' },
    { name: '--kilang-card', label: 'Card', type: 'color' },
    { name: '--kilang-primary-bg', label: 'Primary BG', type: 'color' },
    { name: '--kilang-secondary-bg', label: 'Secondary BG', type: 'color' },
    { name: '--kilang-accent-bg', label: 'Accent BG', type: 'color' },
    { name: '--kilang-tooltip-bg', label: 'Tooltip BG', type: 'color' },
    { name: '--kilang-toast-bg', label: 'Toast BG', type: 'color' },
    { name: '--kilang-primary-glow', label: 'Primary Glow', type: 'color' },
    { name: '--kilang-secondary-glow', label: 'Sec Glow', type: 'color' },
    { name: '--kilang-accent-glow', label: 'Accent Glow', type: 'color' },
    { name: '--kilang-ctrl-active', label: 'Control Active', type: 'color' },
    { name: '--kilang-overlay-bg', label: 'Overlay BG', type: 'color' },
    { name: '--kilang-input-bg', label: 'Input BG', type: 'color' },
    { name: '--kilang-ctrl-bg', label: 'Control Base', type: 'color' },
    { name: '--kilang-shadow-color', label: 'Shadow Color', type: 'color' },
    { name: '--kilang-background-secondary', label: 'BG Secondary', type: 'color' },
    { name: '--kilang-primary', label: 'Primary Base', type: 'color' },
    { name: '--kilang-secondary', label: 'Secondary Base', type: 'color' },
    { name: '--kilang-accent', label: 'Accent Base', type: 'color' },
    { name: '--kilang-primary-active', label: 'Primary Active', type: 'color' },
    { name: '--kilang-tooltip-accent', label: 'Tooltip Accent', type: 'color' },
    { name: '--kilang-resizer-hover', label: 'Resizer Hover', type: 'color' },
    { name: '--kilang-resizer-active', label: 'Resizer Active', type: 'color' }
  ] as const,
  borders: [
    { name: '--kilang-border', label: 'Global Border', type: 'color' },
    { name: '--kilang-primary-border', label: 'Primary Border', type: 'color' },
    { name: '--kilang-secondary-border', label: 'Secondary Border', type: 'color' },
    { name: '--kilang-accent-border', label: 'Accent Border', type: 'color' },
    { name: '--kilang-tooltip-border', label: 'Tooltip Border', type: 'color' },
    { name: '--kilang-toast-border', label: 'Toast Border', type: 'color' },
    { name: '--kilang-glass', label: 'Glass Effect', type: 'text' },
    { name: '--kilang-border-std', label: 'Standard Border', type: 'color' },
    { name: '--kilang-ctrl-active-border', label: 'Active Border', type: 'color' },
    { name: '--kilang-muted-border', label: 'Muted Border', type: 'color' },
    { name: '--kilang-node-border', label: 'Node Border', type: 'color' },
    { name: '--kilang-scrollbar-border', label: 'Scroll Border', type: 'color' }
  ] as const,
  texts: [
    { name: '--kilang-text', label: 'Text Main', type: 'color' },
    { name: '--kilang-text-muted', label: 'Text Muted', type: 'color' },
    { name: '--kilang-primary-text', label: 'Primary Text', type: 'color' },
    { name: '--kilang-secondary-text', label: 'Secondary Text', type: 'color' },
    { name: '--kilang-accent-text', label: 'Accent Text', type: 'color' },
    { name: '--kilang-logo-text', label: 'Logo Text', type: 'color' },
    { name: '--kilang-ctrl-active-text', label: 'Active Text', type: 'color' },
    { name: '--kilang-tooltip-text', label: 'Tooltip Text', type: 'color' },
    { name: '--kilang-toast-text', label: 'Toast Text', type: 'color' },
    { name: '--kilang-metric-text', label: 'Metric Text', type: 'color' }
  ] as const,
  structural: [
    { name: '--kilang-radius-sm', label: 'Small Radius', type: 'text' },
    { name: '--kilang-radius-base', label: 'Base Radius', type: 'text' },
    { name: '--kilang-radius-md', label: 'Medium Radius', type: 'text' },
    { name: '--kilang-radius-lg', label: 'Large Radius', type: 'text' },
    { name: '--kilang-radius-display', label: 'Display Radius', type: 'text' }
  ] as const,
  weights: [
    { name: '--kilang-border-w-std', label: 'Standard Weight', type: 'text' },
    { name: '--kilang-border-w-resizer', label: 'Resizer Weight', type: 'text' }
  ] as const
};

export const ThemesPanel = ({
  tsState,
  tsHelpers,
  tsActions,
  dispatch,
  layoutConfig,
  state,
  dense = false
}: ThemesPanelProps) => {
  const { overrides, activeBulbs } = tsState;
  const { getVariableValue, getColorValue, getHonestColor } = tsHelpers;
  const { updateVariable, updateVariables, setActiveBulbs } = tsActions;

  const masters = [
    { id: 'bg', label: 'Backgrounds', type: 'color', targets: ['--kilang-bg-base', '--kilang-bg', '--kilang-card', '--kilang-primary-bg', '--kilang-secondary-bg', '--kilang-accent-bg', '--kilang-tooltip-bg', '--kilang-toast-bg', '--kilang-primary-glow', '--kilang-secondary-glow', '--kilang-accent-glow', '--kilang-overlay-bg', '--kilang-input-bg', '--kilang-ctrl-bg', '--kilang-shadow-color', '--kilang-background-secondary', '--kilang-primary', '--kilang-secondary', '--kilang-accent', '--kilang-primary-active', '--kilang-tooltip-accent', '--kilang-resizer-hover', '--kilang-resizer-active'], activeTargets: ['--kilang-ctrl-active'] },
    { id: 'border', label: 'Borders', type: 'color', targets: ['--kilang-border', '--kilang-primary-border', '--kilang-secondary-border', '--kilang-accent-border', '--kilang-tooltip-border', '--kilang-toast-border', '--kilang-glass', '--kilang-border-std', '--kilang-muted-border', '--kilang-node-border', '--kilang-scrollbar-border'], activeTargets: ['--kilang-ctrl-active-border'] },
    { id: 'text', label: 'Texts', type: 'color', targets: ['--kilang-text', '--kilang-text-muted', '--kilang-primary-text', '--kilang-secondary-text', '--kilang-accent-text', '--kilang-logo-text', '--kilang-tooltip-text', '--kilang-toast-text', '--kilang-metric-text'], activeTargets: ['--kilang-ctrl-active-text'] },
    { id: 'tree', label: 'Tree', type: 'color', targets: ['--kilang-tier-1-fill', '--kilang-tier-2-fill', '--kilang-tier-3-fill', '--kilang-tier-4-fill', '--kilang-tier-5-fill', '--kilang-tier-6-fill', '--kilang-tier-7-fill', '--kilang-tier-8-fill', '--kilang-tier-9-fill', '--kilang-tier-1-border', '--kilang-tier-2-border', '--kilang-tier-3-border', '--kilang-tier-4-border', '--kilang-tier-5-border', '--kilang-tier-6-border', '--kilang-tier-7-border', '--kilang-tier-8-border', '--kilang-tier-9-border', '--kilang-tier-1-text', '--kilang-tier-2-text', '--kilang-tier-3-text', '--kilang-tier-4-text', '--kilang-tier-5-text', '--kilang-tier-6-text', '--kilang-tier-7-text', '--kilang-tier-8-text', '--kilang-tier-9-text', '--kilang-link-start', '--kilang-link-mid', '--kilang-link-end'] }
  ];

  const renderVariableRow = (v: any, index: number, sectionId: string) => {
    const isMasterControl = (v as any).targets !== undefined;
    const varKey = (v as any).label || (v as any).name;
    const isBulbOn = !!activeBulbs[varKey];
    const isNodeGroup = sectionId === 'masters' && (v as any).label === 'Tree';
    const isTierEnd = isNodeGroup && (index + 1) % 3 === 0 && index !== 11; // 11 is last of tree color sets

    return (
      <div key={varKey} className={`flex items-center justify-between py-2.5 px-4 group/row hover:bg-white/[0.02] transition-all border-b ${isTierEnd ? 'border-white/30 border-b-[2px]' : 'border-white/5 last:border-0'}`}>
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
            <div className="relative flex items-center gap-4">
              {/* Inline Opacity Slider logic for specific types */}
              {((v as any).name?.includes('link-') || (v as any).name?.includes('glow') || (v as any).name?.includes('glass') || (v as any).name?.includes('tooltip') || (v as any).name?.includes('toast') || (v as any).name?.includes('resizer') || (v as any).name?.includes('border-std')) && (
                <div className="flex items-center gap-2 pr-2 border-r border-white/10">
                  <input
                    type="range" min="0" max="1" step="0.01"
                    value={overrides[(v as any).name + "-opacity"] || getVariableValue((v as any).name + "-opacity").trim() || "1"}
                    onChange={(e) => updateVariable((v as any).name + '-opacity', e.target.value)}
                    className="w-12 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
                  />
                </div>
              )}
              
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
            </div>
          ) : (
            <div className="flex items-center gap-2">
               {/* Structural Weight/Radius combiners */}
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
      {/* COLUMN 1: SURFACES */}
      <div className="flex-1 min-w-[300px] max-w-[320px] border-r border-white/10 flex flex-col h-full shrink-0 bg-[#0a0a0a]">
        <div className="h-10 px-6 flex items-center justify-between bg-black/40 border-b border-white/5 shrink-0">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">UI Surfaces</span>
          <button 
            onClick={() => tsActions.resetVariables(groupVars.surfaces.map(v => v.name))}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/10 hover:text-white transition-all group/reset"
            title="Reset Surfaces & Glows"
          >
            <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-[-45deg] transition-all" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0 pb-10">
          <RibbonGroup label="UI Surfaces & Glows">
            <div className="bg-white/[0.03] border-b border-white/10">
               {groupVars.surfaces.map((v, i) => renderVariableRow(v, i, 'surfaces'))}
            </div>
          </RibbonGroup>
        </div>
      </div>

      {/* COLUMN 2: BORDERS */}
      <div className="flex-1 min-w-[300px] max-w-[320px] border-r border-white/10 flex flex-col h-full shrink-0 bg-[#0a0a0a]">
        <div className="h-10 px-6 flex items-center justify-between bg-black/40 border-b border-white/5 shrink-0">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Outlines & Glass</span>
          <button 
            onClick={() => tsActions.resetVariables(groupVars.borders.map(v => v.name))}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/10 hover:text-white transition-all group/reset"
            title="Reset Outlines & Glass"
          >
            <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-[-45deg] transition-all" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0 pb-10">
          <RibbonGroup label="Outlines & Glass Filters">
            <div className="bg-white/[0.03] border-b border-white/10">
               {groupVars.borders.map((v, i) => renderVariableRow(v, i, 'borders'))}
            </div>
          </RibbonGroup>
        </div>
      </div>

      {/* COLUMN 3: TEXTS */}
      <div className="flex-1 min-w-[300px] max-w-[320px] border-r border-white/10 flex flex-col h-full shrink-0 bg-[#0a0a0a]">
        <div className="h-10 px-6 flex items-center justify-between bg-black/40 border-b border-white/5 shrink-0">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Typography Colors</span>
          <button 
            onClick={() => tsActions.resetVariables(groupVars.texts.map(v => v.name))}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/10 hover:text-white transition-all group/reset"
            title="Reset Typography Colors"
          >
            <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-[-45deg] transition-all" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0 pb-10">
          <RibbonGroup label="Typography & Elements">
            <div className="bg-white/[0.03] border-b border-white/10">
               {groupVars.texts.map((v, i) => renderVariableRow(v, i, 'texts'))}
            </div>
          </RibbonGroup>
        </div>
      </div>
    </div>
  );
};
