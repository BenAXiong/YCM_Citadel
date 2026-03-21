'use client';

import React from 'react';
import { Layout, Share2, Scaling, Package, Layers } from 'lucide-react';
import { SectionHeader } from './Shared';

interface TreePanelProps {
  tsState: any;
  tsActions: any;
  dispatch: any;
  layoutConfig: any;
  dense?: boolean;
}

export const TreePanel = ({
  tsState,
  tsActions,
  dispatch,
  layoutConfig,
  dense = false
}: TreePanelProps) => {
  const { expandedSections } = tsState;
  const { toggleSection } = tsActions;

  const renderControl = (key: string, label: string, min: number, max: number, step: number, unit: string = '') => (
    <div key={key} className="flex items-center justify-between py-2 px-4 group hover:bg-white/[0.02] transition-all border-b border-white/5 last:border-0">
      <span className={`${dense ? 'text-[9px]' : 'text-[10px]'} font-black uppercase tracking-widest text-white/50 group-hover:text-white/80 transition-colors`}>{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={(layoutConfig as any)[key] || 0}
          onChange={(e) => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { [key]: parseFloat(e.target.value) } })}
          className="w-16 h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-zinc-500"
        />
        <span className="w-8 text-right text-[9px] font-mono text-white/30 truncate">
          {(layoutConfig as any)[key]}
          {unit && <span className="text-[7px] ml-0.5 opacity-40">{unit}</span>}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-1">
      {/* Layout Section */}
      <SectionHeader 
        id="layout" 
        label="Layout" 
        icon={Layout} 
        isExpanded={expandedSections.has('layout')}
        onToggle={toggleSection}
        dense={dense}
      />
      {expandedSections.has('layout') && (
        <div className="bg-white/[0.03] border-b border-white/10">
          {renderControl('rootGap', 'Root Gap', 10, 300, 10, 'px')}
          {renderControl('interTierGap', 'Tier Gap', 20, 500, 10, 'px')}
          {renderControl('interRowGap', 'Row Gap', 5, 200, 5, 'px')}
          <div className="flex items-center justify-between py-2 px-4 border-b border-white/5">
            <span className="text-[9px] font-black uppercase text-white/30">Mode</span>
            <button
              onClick={() => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { spacingMode: layoutConfig.spacingMode === 'even' ? 'log' : 'even' } })}
              className={`px-2 py-1 rounded text-[9px] font-black uppercase ${layoutConfig.spacingMode === 'log' ? 'bg-white text-black' : 'text-white/40 hover:bg-white/5'}`}
            >
              {layoutConfig.spacingMode === 'even' ? 'Even' : 'Log'}
            </button>
          </div>
        </div>
      )}

      {/* Geometry Section */}
      <SectionHeader 
        id="geometry" 
        label="Geometry" 
        icon={Package} 
        isExpanded={expandedSections.has('geometry')}
        onToggle={toggleSection}
        dense={dense}
      />
      {expandedSections.has('geometry') && (
        <div className="bg-white/[0.03] border-b border-white/10">
          {renderControl('nodeSize', 'Scale', 0.2, 3, 0.1, 'x')}
          {renderControl('nodeWidth', 'Width', 40, 300, 10, 'px')}
          {renderControl('nodePaddingY', 'Padding Y', 2, 40, 2, 'px')}
          {renderControl('branchBorderWidth', 'Outline', 0, 10, 1, 'px')}
        </div>
      )}

      {/* Connectors Section */}
      <SectionHeader 
        id="connectors" 
        label="Connectors" 
        icon={Share2} 
        isExpanded={expandedSections.has('connectors')}
        onToggle={toggleSection}
        dense={dense}
      />
      {expandedSections.has('connectors') && (
        <div className="bg-white/[0.03] border-b border-white/10">
          {renderControl('lineWidth', 'Stroke', 0, 15, 1, 'px')}
          {renderControl('lineTension', 'Tension', 0, 2, 0.1)}
          {renderControl('lineOpacity', 'Opacity', 0, 1, 0.05)}
        </div>
      )}
    </div>
  );
};
