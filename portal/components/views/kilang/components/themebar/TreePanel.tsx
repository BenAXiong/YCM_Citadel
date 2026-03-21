'use client';

import React, { useState } from 'react';
import {
  Move,
  Share2,
  CircleDot,
  Layout,
  Scaling,
  Zap,
  ZapOff,
  RotateCcw,
  Palette as PaletteIcon
} from 'lucide-react';
import { RibbonNav, RibbonGroup, VariableControl } from './Shared';

interface TreePanelProps {
  tsState: any;
  tsHelpers: any;
  tsActions: any;
  dispatch: any;
  layoutConfig: any;
  dense?: boolean;
}

export const TreePanel = ({
  tsState,
  tsHelpers,
  tsActions,
  dispatch,
  layoutConfig,
  dense = false
}: TreePanelProps) => {
  const { overrides } = tsState;
  const { getVariableValue, getColorValue, getHonestColor } = tsHelpers;
  const { updateVariable, updateVariables } = tsActions;

  const tiers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="flex flex-row h-full overflow-x-auto custom-scrollbar bg-[#020202]">
      {/* COLUMN 1: LAYOUT */}
      <div className="flex-1 min-w-[300px] max-w-[320px] border-r border-white/10 flex flex-col h-full shrink-0 bg-[#0a0a0a]">
        <div className="h-10 px-6 flex items-center justify-between bg-black/40 border-b border-white/5 shrink-0">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Spatial Geometry</span>
          <button 
            onClick={() => tsActions.resetLayoutConfig(['rootGap', 'interTierGap', 'interRowGap', 'anchorX', 'anchorY', 'spacingMode', 'coupleGaps'])}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/10 hover:text-white transition-all group/reset"
            title="Reset Spatial Geometry"
          >
            <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-[-45deg] transition-all" />
          </button>
        </div>
        {/* ... rest of column 1 ... */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-1 pb-10">
          <RibbonGroup label="Spatial Gaps">
            <div className="grid grid-cols-2 gap-2 p-2 mx-1 mb-4 bg-white/[0.03] rounded-2xl border border-white/5">
              <button
                onClick={() => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { spacingMode: layoutConfig.spacingMode === 'even' ? 'log' : 'even' } })}
                className={`flex flex-col items-center justify-center py-3 rounded-xl border transition-all ${layoutConfig.spacingMode === 'log' ? 'bg-white text-black border-white shadow-lg' : 'bg-white/5 text-white/40 border-white/5 hover:border-white/10'}`}
              >
                <Layout className="w-4 h-4 mb-1" />
                <span className="text-[8px] font-black uppercase tracking-widest">{layoutConfig.spacingMode === 'even' ? 'Even Spacing' : 'Log Spacing'}</span>
              </button>
              <button
                onClick={() => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { coupleGaps: !layoutConfig.coupleGaps } })}
                className={`flex flex-col items-center justify-center py-3 rounded-xl border transition-all ${layoutConfig.coupleGaps ? 'bg-white text-black border-white shadow-lg' : 'bg-white/5 text-white/40 border-white/5 hover:border-white/10'}`}
              >
                <Scaling className="w-4 h-4 mb-1" />
                <span className="text-[8px] font-black uppercase tracking-widest">{layoutConfig.coupleGaps ? 'Gap Coupled' : 'Gap Decoupled'}</span>
              </button>
            </div>

            <VariableControl
              label="T1-T2 Root"
              value={layoutConfig.rootGap}
              onChange={(v) => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { rootGap: parseFloat(v) } })}
              type="number"
              min={0} max={600}
            />
            <VariableControl
              label="Tier Spacing (H)"
              value={layoutConfig.interTierGap}
              onChange={(v) => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { interTierGap: parseFloat(v) } })}
              type="number"
              min={10} max={600}
            />
            <VariableControl
              label="Row Spacing (V)"
              value={layoutConfig.interRowGap}
              onChange={(v) => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { interRowGap: parseFloat(v) } })}
              type="number"
              min={10} max={600}
            />
          </RibbonGroup>

          <RibbonGroup label="T1 Anchors">
            <VariableControl
              label="Anchor X"
              value={layoutConfig.anchorX}
              onChange={(v) => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { anchorX: parseFloat(v) } })}
              type="number"
              min={0} max={2000} step={10}
            />
            <VariableControl
              label="Anchor Y"
              value={layoutConfig.anchorY}
              onChange={(v) => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { anchorY: parseFloat(v) } })}
              type="number"
              min={0} max={2000} step={10}
            />
          </RibbonGroup>
        </div>
      </div>

      {/* COLUMN 2: NODES */}
      <div className="flex-1 min-w-[300px] max-w-[320px] border-r border-white/10 flex flex-col h-full shrink-0 bg-[#0a0a0a]">
        <div className="h-10 px-6 flex items-center justify-between bg-black/40 border-b border-white/5 shrink-0">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Node Characteristics</span>
          <button 
            onClick={() => {
              tsActions.resetLayoutConfig(['nodeSize', 'nodeOpacity', 'nodeWidth', 'nodePaddingY', 'showIcons', 'rootBorderWidth', 'accentBorderWidth', 'branchBorderWidth', 'tier1Rounding', 'tier2Rounding', 'tier3Rounding', 'tier4Rounding', 'tier5Rounding', 'tier6Rounding', 'tier7Rounding', 'tier8Rounding', 'tier9Rounding']);
              tsActions.resetVariables(['--kilang-node-intensity']);
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/10 hover:text-white transition-all group/reset"
            title="Reset Node Characteristics"
          >
            <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-[-45deg] transition-all" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-1 pb-10">
          <RibbonGroup label="Node Dimensions">
            <div className="flex items-center justify-between px-4 py-3 bg-white/5 mx-1 rounded-2xl border border-white/10 mb-2">
              <span className="text-[10px] font-black uppercase text-white/40">Tree Icons</span>
              <button
                onClick={() => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { showIcons: !layoutConfig.showIcons } })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${layoutConfig.showIcons ? 'bg-white text-black shadow-lg shadow-white/10 border-white' : 'bg-white/5 text-white/40 border border-white/5 hover:border-white/20'}`}
              >
                {layoutConfig.showIcons ? <Zap className="w-3 h-3" /> : <ZapOff className="w-3 h-3" />}
                {layoutConfig.showIcons ? 'Visible' : 'Hidden'}
              </button>
            </div>

            <VariableControl
              label="Size Scale"
              value={layoutConfig.nodeSize}
              onChange={(v) => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { nodeSize: parseFloat(v) } })}
              type="number"
              min={0.5} max={2} step={0.1}
            />
            <VariableControl
              label="Opacity"
              value={layoutConfig.nodeOpacity}
              onChange={(v) => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { nodeOpacity: parseFloat(v) } })}
              type="number"
              min={0.1} max={1} step={0.05}
            />
            <VariableControl
              label="Word Width"
              value={layoutConfig.nodeWidth}
              onChange={(v) => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { nodeWidth: parseFloat(v) } })}
              type="number"
              min={80} max={250} step={5}
            />
            <VariableControl
              label="Vert Padding"
              value={layoutConfig.nodePaddingY}
              onChange={(v) => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { nodePaddingY: parseFloat(v) } })}
              type="number"
              min={4} max={32} step={1}
            />
          </RibbonGroup>

          <RibbonGroup label="Complexity & Borders">
            <VariableControl
              label="Intensity"
              value={layoutConfig.nodeIntensity ?? (overrides['--kilang-node-intensity'] || '1.0')}
              onChange={(v) => {
                const val = parseFloat(v);
                dispatch({ type: 'SET_LAYOUT_CONFIG', config: { nodeIntensity: val } });
                updateVariable('--kilang-node-intensity', val.toString());
              }}
              type="number"
              min={0} max={5} step={0.1}
            />
            <VariableControl
              label="Root Border"
              value={layoutConfig.rootBorderWidth}
              onChange={(v) => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { rootBorderWidth: parseFloat(v) } })}
              type="number"
            />
            <VariableControl
              label="Accent Border"
              value={layoutConfig.accentBorderWidth}
              onChange={(v) => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { accentBorderWidth: parseFloat(v) } })}
              type="number"
            />
            <VariableControl
              label="Branch Weight"
              value={layoutConfig.branchBorderWidth}
              onChange={(v) => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { branchBorderWidth: parseFloat(v) } })}
              type="number"
            />
          </RibbonGroup>

          <RibbonGroup label="Node Rounding">
            <div className="flex flex-col gap-4 p-4 bg-white/[0.03] mx-1 rounded-2xl border border-white/5">
              <VariableControl
                label="Root (T1)"
                value={layoutConfig.tier1Rounding}
                onChange={(v) => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { tier1Rounding: parseFloat(v) } })}
                type="number"
                min={0} max={100}
                dense
              />
              <div className="h-px bg-white/5 mx-2 my-1" />
              <VariableControl
                label="Branch (T2-9)"
                value={layoutConfig.tier2Rounding}
                onChange={(v) => {
                  const val = parseFloat(v);
                  const update: any = {};
                  for (let t = 2; t <= 9; t++) update[`tier${t}Rounding`] = val;
                  dispatch({ type: 'SET_LAYOUT_CONFIG', config: update });
                }}
                type="number"
                min={0} max={100}
                dense
              />
            </div>
          </RibbonGroup>
        </div>
      </div>

      {/* COLUMN 3: PALETTE */}
      <div className="flex-1 min-w-[300px] max-w-[320px] border-r border-white/10 flex flex-col h-full shrink-0 bg-[#0a0a0a]">
        <div className="h-10 px-6 flex items-center justify-between bg-black/40 border-b border-white/5 shrink-0">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">The Tier Grid</span>
          <button 
            onClick={() => {
              const tierKeys = tiers.flatMap(t => [`tier${t}Fill`, `tier${t}Border`]);
              const tierOverides = tiers.map(t => `--kilang-tier-${t}-text`);
              tsActions.resetLayoutConfig(tierKeys);
              tsActions.resetVariables(tierOverides);
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/10 hover:text-white transition-all group/reset"
            title="Reset Tier Palette"
          >
            <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-[-45deg] transition-all" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
          <RibbonGroup label="Tier  Grid">
            <div className="overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 text-[10px] font-black uppercase text-white tracking-[0.2em] w-12 text-center">Tier</th>
                    <th className="py-3 text-[10px] font-black uppercase text-white tracking-[0.2em] text-center">Fill</th>
                    <th className="py-3 text-[10px] font-black uppercase text-white tracking-[0.2em] text-center">Border</th>
                    <th className="py-3 text-[10px] font-black uppercase text-white tracking-[0.2em] text-center">Text</th>
                    <th className="py-3 text-[10px] font-black uppercase text-[var(--kilang-accent)] tracking-[0.2em] text-center">All</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {/* Master "All" Row */}
                  <tr className="group/row bg-white/[0.04] transition-colors">
                    <td className="py-2 text-center">
                      <div className="text-[10px] font-black text-white uppercase tracking-widest">All</div>
                    </td>
                    {[
                      { type: 'fill' },
                      { type: 'border' },
                      { type: 'text' },
                      { type: 'all' }
                    ].map((col) => (
                      <td key={col.type} className="py-2 px-1 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="w-8 h-8 rounded-xl border border-white/20 shadow-xl relative group/swatch overflow-hidden transition-transform hover:scale-110 active:scale-95">
                            <input
                              type="color"
                              value={getColorValue(col.type === 'fill' ? layoutConfig.tier1Fill : col.type === 'border' ? layoutConfig.tier1Border : '--kilang-tier-1-text')}
                              onChange={(e) => {
                                const val = e.target.value;
                                const update: any = {};
                                const mapped: Record<string, string> = {};
                                tiers.forEach(t => {
                                  if (col.type === 'fill' || col.type === 'all') update[`tier${t}Fill`] = val;
                                  if (col.type === 'border' || col.type === 'all') update[`tier${t}Border`] = val;
                                  if (col.type === 'text' || col.type === 'all') mapped[`--kilang-tier-${t}-text`] = val;
                                });
                                if (Object.keys(update).length) dispatch({ type: 'SET_LAYOUT_CONFIG', config: update });
                                if (Object.keys(mapped).length) updateVariables(mapped);
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            <div
                              className="w-full h-full"
                              style={{
                                backgroundColor: col.type === 'fill'
                                  ? layoutConfig.tier1Fill
                                  : col.type === 'border'
                                    ? layoutConfig.tier1Border
                                    : (overrides['--kilang-tier-1-text'] || overrides['--kilang-accent'] || '#ffffff')
                              }}
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="HEX"
                            className="w-14 bg-transparent border-0 text-[7px] font-mono text-white/20 text-center hover:text-white/40 focus:text-white outline-none uppercase tracking-tighter transition-colors"
                            onBlur={(e) => {
                              const val = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                              if (val.length >= 4) {
                                const update: any = {};
                                const mapped: Record<string, string> = {};
                                tiers.forEach(t => {
                                  if (col.type === 'fill' || col.type === 'all') update[`tier${t}Fill`] = val;
                                  if (col.type === 'border' || col.type === 'all') update[`tier${t}Border`] = val;
                                  if (col.type === 'text' || col.type === 'all') mapped[`--kilang-tier-${t}-text`] = val;
                                });
                                if (Object.keys(update).length) dispatch({ type: 'SET_LAYOUT_CONFIG', config: update });
                                if (Object.keys(mapped).length) updateVariables(mapped);
                              }
                            }}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Tier 1-9 Rows */}
                  {tiers.map((t) => (
                    <tr key={t} className="group/row hover:bg-white/[0.01] transition-colors">
                      <td className="py-1.5 text-center">
                        <div className="text-[11px] font-black text-white">{t}</div>
                      </td>
                      {[
                        { prop: `tier${t}Fill`, type: 'fill' },
                        { prop: `tier${t}Border`, type: 'border' },
                        { prop: `--kilang-tier-${t}-text`, type: 'text' },
                        { prop: `tier${t}All`, type: 'all' }
                      ].map(col => {
                        const val = col.type === 'all'
                          ? (layoutConfig as any)[`tier${t}Fill`]
                          : col.type === 'text'
                            ? (overrides[col.prop] || (typeof window !== 'undefined' ? getVariableValue(col.prop) : '#ffffff'))
                            : (layoutConfig as any)[col.prop];

                        return (
                          <td key={col.type} className="py-1.5 px-1">
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-8 h-8 rounded-xl border border-white/10 shadow-lg relative group/swatch overflow-hidden transition-transform hover:scale-110 active:scale-95">
                                <input
                                  type="color"
                                  value={getColorValue(val)}
                                  onChange={(e) => {
                                    const color = e.target.value;
                                    if (col.type === 'all') {
                                      dispatch({ type: 'SET_LAYOUT_CONFIG', config: { [`tier${t}Fill`]: color, [`tier${t}Border`]: color } });
                                      updateVariable(`--kilang-tier-${t}-text`, color);
                                    } else if (col.type === 'text') {
                                      updateVariable(col.prop, color);
                                    } else {
                                      dispatch({ type: 'SET_LAYOUT_CONFIG', config: { [col.prop]: color } });
                                    }
                                  }}
                                  className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                                />
                                <div
                                  className="w-full h-full"
                                  style={{
                                    backgroundColor: getHonestColor(
                                      col.type === 'text' ? col.prop : `--kilang-tier-${t}-${col.type}`,
                                      getColorValue(val)
                                    )
                                  }}
                                />
                                <div className="absolute inset-0 bg-white/0 group-hover/swatch:bg-white/10 transition-colors pointer-events-none" />
                              </div>
                              <input
                                type="text"
                                defaultValue={getColorValue(val).toUpperCase()}
                                className="w-14 bg-transparent border-0 text-[8px] font-mono text-white/30 text-center hover:text-white/60 focus:text-white outline-none uppercase tracking-tighter transition-colors"
                                onBlur={(e) => {
                                  const newVal = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                                  if (newVal.length >= 4) {
                                    if (col.type === 'all') {
                                      dispatch({ type: 'SET_LAYOUT_CONFIG', config: { [`tier${t}Fill`]: newVal, [`tier${t}Border`]: newVal } });
                                      updateVariable(`--kilang-tier-${t}-text`, newVal);
                                    } else if (col.type === 'text') {
                                      updateVariable(col.prop, newVal);
                                    } else {
                                      dispatch({ type: 'SET_LAYOUT_CONFIG', config: { [col.prop]: newVal } });
                                    }
                                  }
                                }}
                              />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </RibbonGroup>
        </div>
      </div>

      {/* COLUMN 4: CONNECTORS */}
      <div className="flex-1 min-w-[320px] max-w-[420px] border-r border-white/10 flex flex-col h-full shrink-0 bg-[#0a0a0a]">
        <div className="h-10 px-6 flex items-center justify-between bg-black/40 border-b border-white/5 shrink-0">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Tree Connectors</span>
          <button 
            onClick={() => {
              tsActions.resetLayoutConfig(['lineWidth', 'lineOpacity', 'lineTension', 'lineGapX', 'lineGapY', 'lineBlur', 'lineDashArray', 'lineFlowSpeed', 'lineColor', 'lineColorMid', 'lineGradientEnd']);
              tsActions.resetVariables(['--kilang-link-width', '--kilang-link-opacity', '--kilang-link-tension', '--kilang-link-blur', '--kilang-link-dash', '--kilang-link-flow-speed', '--kilang-link-start', '--kilang-link-mid', '--kilang-link-end']);
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/10 hover:text-white transition-all group/reset"
            title="Reset Tree Connectors"
          >
            <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-[-45deg] transition-all" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-1 pb-10">
          <RibbonGroup label="Path Configuration">
            <VariableControl
              label="Width"
              value={layoutConfig.lineWidth}
              onChange={(v) => {
                const val = parseFloat(v);
                dispatch({ type: 'SET_LAYOUT_CONFIG', config: { lineWidth: val } });
                updateVariable('--kilang-link-width', `${val}px`);
              }}
              type="number"
              min={0} max={10} step={0.1}
            />
            <VariableControl
              label="Opacity"
              value={layoutConfig.lineOpacity}
              onChange={(v) => {
                const val = parseFloat(v);
                dispatch({ type: 'SET_LAYOUT_CONFIG', config: { lineOpacity: val } });
                updateVariable('--kilang-link-opacity', val.toString());
              }}
              type="number"
              min={0} max={1} step={0.05}
            />
            <VariableControl
              label="Curvature"
              value={layoutConfig.lineTension}
              onChange={(v) => {
                const val = parseFloat(v);
                dispatch({ type: 'SET_LAYOUT_CONFIG', config: { lineTension: val } });
                updateVariable('--kilang-link-tension', val.toString());
              }}
              type="number"
              min={0} max={2} step={0.1}
            />
            <VariableControl
              label="Gap X"
              value={layoutConfig.lineGapX}
              onChange={(v) => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { lineGapX: parseFloat(v) } })}
              type="number"
              min={-100} max={300} step={5}
            />
            <VariableControl
              label="Gap Y"
              value={layoutConfig.lineGapY}
              onChange={(v) => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { lineGapY: parseFloat(v) } })}
              type="number"
              min={-100} max={300} step={5}
            />
          </RibbonGroup>

          <RibbonGroup label="Visual Effects">
            <VariableControl
              label="Blur/Glow"
              value={layoutConfig.lineBlur}
              onChange={(v) => {
                const val = parseFloat(v);
                dispatch({ type: 'SET_LAYOUT_CONFIG', config: { lineBlur: val } });
                updateVariable('--kilang-link-blur', `${val}px`);
              }}
              type="number"
              min={0} max={20} step={0.5}
            />
            <VariableControl
              label="Dash Array"
              value={layoutConfig.lineDashArray}
              onChange={(v) => {
                const val = parseFloat(v);
                dispatch({ type: 'SET_LAYOUT_CONFIG', config: { lineDashArray: val } });
                updateVariable('--kilang-link-dash', val.toString());
              }}
              type="number"
              min={0} max={30} step={1}
            />
            <VariableControl
              label="Flow Speed"
              value={layoutConfig.lineFlowSpeed}
              onChange={(v) => {
                const val = parseFloat(v);
                dispatch({ type: 'SET_LAYOUT_CONFIG', config: { lineFlowSpeed: val } });
                updateVariable('--kilang-link-flow-speed', val > 0 ? `${11 - val}s` : '0s');
              }}
              type="number"
              min={0} max={10} step={0.5}
            />
          </RibbonGroup>

          <RibbonGroup label="Link Gradient">
            <div className="grid grid-cols-3 gap-3 p-4 bg-white/[0.03] mx-1 rounded-2xl border border-white/5">
              {[
                { label: 'Start', key: 'lineColor', var: '--kilang-link-start' },
                { label: 'Mid', key: 'lineColorMid', var: '--kilang-link-mid' },
                { label: 'End', key: 'lineGradientEnd', var: '--kilang-link-end' }
              ].map(col => (
                <div key={col.key} className="flex flex-col items-center gap-2 group/linkcol">
                  <span className="text-[8px] font-black uppercase text-white/30 tracking-widest">{col.label}</span>
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    <input
                      type="color"
                      value={getColorValue(layoutConfig[col.key])}
                      onChange={(e) => {
                        const color = e.target.value;
                        dispatch({ type: 'SET_LAYOUT_CONFIG', config: { [col.key]: color } });
                        updateVariable(col.var, color);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div
                      className="w-10 h-10 rounded-xl border border-white/20 shadow-xl transition-transform group-hover/linkcol:scale-110"
                      style={{ backgroundColor: getColorValue(layoutConfig[col.key]) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </RibbonGroup>
        </div>
      </div>
    </div>
  );
};
