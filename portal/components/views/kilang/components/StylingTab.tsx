'use client';

import React from 'react';
import { Settings2, RotateCcw, SlidersHorizontal, PencilLine, Scaling, Maximize2, Zap, ZapOff, Palette } from 'lucide-react';
import { SidebarSlider, ColorPicker, CollapsibleSection } from './SidebarUI';
import { useSidebar } from '../SidebarContext';

interface StylingTabProps {
  updateConfig: (config: any) => void;
}

export const StylingTab = ({ updateConfig }: StylingTabProps) => {
  const { state, dispatch, toggleSection, collapsedSections } = useSidebar();
  const { layoutConfig } = state;

  const renderSection = (id: string, label: string, icon: React.ReactNode, controls: any[]) => (
    <CollapsibleSection
      id={id}
      label={label}
      icon={icon}
      isCollapsed={collapsedSections[id]}
      onToggle={() => toggleSection(id)}
    >
      <div className="space-y-4 pl-1">
        {controls.map((control) => (
          <SidebarSlider
            key={control.key}
            label={control.label}
            value={layoutConfig[control.key as keyof typeof layoutConfig] as number}
            min={control.min}
            max={control.max}
            step={control.step}
            unit={control.unit}
            disabled={control.disabled}
            onChange={(v: number) => updateConfig({ [control.key]: v })}
          />
        ))}
        {id === 'spacing' && (
          <>
            <div className="flex items-center justify-between pt-2">
              <span className="text-[8px] font-black uppercase tracking-widest text-[var(--kilang-primary-text)]/80">Spacing Mode</span>
              <button 
                onClick={() => updateConfig({ spacingMode: layoutConfig.spacingMode === 'even' ? 'log' : 'even' })} 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${layoutConfig.spacingMode === 'log' ? 'bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)] shadow-lg' : 'text-[var(--kilang-text-muted)] hover:bg-[var(--kilang-ctrl-bg)] hover:text-[var(--kilang-text)]'}`}
              >
                <span className="text-[8px] font-black uppercase">{layoutConfig.spacingMode === 'even' ? 'Even' : 'Log'}</span>
              </button>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[8px] font-black uppercase tracking-widest text-[var(--kilang-primary-text)]/80">Coupled Gaps</span>
              <button 
                onClick={() => updateConfig({ coupleGaps: !layoutConfig.coupleGaps })} 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${layoutConfig.coupleGaps ? 'bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)] shadow-lg' : 'text-[var(--kilang-text-muted)] hover:bg-[var(--kilang-ctrl-bg)] hover:text-[var(--kilang-text)]'}`}
              >
                <span className="text-[8px] font-black uppercase">{layoutConfig.coupleGaps ? 'Coupled' : 'Decoupled'}</span>
              </button>
            </div>
          </>
        )}
        {id === 'geometry' && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-[8px] font-black uppercase tracking-widest text-[var(--kilang-primary-text)]/80">Tree Icons</span>
            <button 
              onClick={() => updateConfig({ showIcons: !layoutConfig.showIcons })} 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${layoutConfig.showIcons ? 'bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)] shadow-lg' : 'text-[var(--kilang-text-muted)] hover:bg-[var(--kilang-ctrl-bg)] hover:text-[var(--kilang-text)]'}`}
            >
              {layoutConfig.showIcons ? <Zap className="w-3 h-3" /> : <ZapOff className="w-3 h-3" />}
              <span className="text-[8px] font-black uppercase">{layoutConfig.showIcons ? 'Visible' : 'Hidden'}</span>
            </button>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );

  return (
    <div className="p-6 animate-in fade-in slide-in-from-left-4 duration-500 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-[var(--kilang-primary-text)]" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--kilang-logo-text)]">Visual Styling</h3>
        </div>
        <button
          onClick={() => dispatch({ type: 'RESET_LAYOUT_CONFIG' })}
          className="p-1.5 rounded-lg hover:bg-[var(--kilang-ctrl-bg)] text-[var(--kilang-text-muted)] transition-all hover:text-[var(--kilang-text)]"
          title="Reset Defaults"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {renderSection('spacing', 'Layout Spacing', <SlidersHorizontal className="w-3.5 h-3.5" />, [
        { label: 'Tier (H)', key: 'interTierGap', min: 10, max: 600, step: 10, unit: 'px' },
        { label: 'Row (V)', key: 'interRowGap', min: 10, max: 600, step: 5, unit: 'px' },
        { label: '0-1 Gap', key: 'rootGap', min: 0, max: 600, step: 10, unit: 'px', disabled: layoutConfig.coupleGaps },
      ])}

      {renderSection('paths', 'SVG Connection Styling', <PencilLine className="w-3.5 h-3.5" />, [
        { label: 'Gap X', key: 'lineGapX', min: -100, max: 300, step: 5, unit: 'px' },
        { label: 'Gap Y', key: 'lineGapY', min: -100, max: 300, step: 5, unit: 'px' },
        { label: 'Line Thickness', key: 'lineWidth', min: 0.5, max: 12, step: 0.1, unit: 'px' },
        { label: 'Line Curvature', key: 'lineTension', min: 0, max: 2, step: 0.1, unit: 'x' },
        { label: 'Line Opacity', key: 'lineOpacity', min: 0, max: 1, step: 0.05, unit: '' },
        { label: 'Line Glow/Blur', key: 'lineBlur', min: 0, max: 20, step: 0.5, unit: 'px' },
        { label: 'Dash Pattern', key: 'lineDashArray', min: 0, max: 30, step: 1, unit: 'px' },
        { label: 'Flow Speed', key: 'lineFlowSpeed', min: 0, max: 10, step: 0.5, unit: 'x' },
      ])}

      {renderSection('geometry', 'Node Geometry', <Scaling className="w-3.5 h-3.5" />, [
        { label: 'Size', key: 'nodeSize', min: 0.5, max: 2, step: 0.1, unit: 'x' },
        { label: 'Rounding', key: 'nodeRounding', min: 0, max: 50, step: 2, unit: 'px' },
        { label: 'Opacity', key: 'nodeOpacity', min: 0.1, max: 1, step: 0.05, unit: '' },
        { label: 'Word Width', key: 'nodeWidth', min: 80, max: 250, step: 5, unit: 'px' },
        { label: 'Vert Padding', key: 'nodePaddingY', min: 4, max: 32, step: 1, unit: 'px' },
      ])}

      {renderSection('anchors', 'Root Anchor', <Maximize2 className="w-3.5 h-3.5" />, [
        { label: 'X (px)', key: 'anchorX', min: 0, max: 2000, step: 10, unit: 'px' },
        { label: 'Y (px)', key: 'anchorY', min: 0, max: 2000, step: 10, unit: 'px' },
      ])}

      <CollapsibleSection
        id="colors"
        label="Tier Aesthetics"
        icon={<Palette className="w-3.5 h-3.5" />}
        isCollapsed={collapsedSections['colors']}
        onToggle={() => toggleSection('colors')}
      >
        <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((tier) => (
            <div key={tier} className="p-3 bg-[var(--kilang-bg-base)]/40 border border-[var(--kilang-border-std)] rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--kilang-primary-text)]">Tier {tier}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ColorPicker
                  label="Fill"
                  value={(layoutConfig as any)[`tier${tier}Fill`]}
                  onChange={(v: string) => updateConfig({ [`tier${tier}Fill`]: v } as any)}
                />
                <ColorPicker
                  label="Border"
                  value={(layoutConfig as any)[`tier${tier}Border`]}
                  onChange={(v: string) => updateConfig({ [`tier${tier}Border`]: v } as any)}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-[var(--kilang-border-std)]/40 grid grid-cols-2 gap-4 pl-1">
          <ColorPicker label="Line Start" value={layoutConfig.lineColor} onChange={(v: string) => updateConfig({ lineColor: v })} />
          <ColorPicker label="Line Mid" value={layoutConfig.lineColorMid} onChange={(v: string) => updateConfig({ lineColorMid: v })} />
          <ColorPicker label="Line End" value={layoutConfig.lineGradientEnd} onChange={(v: string) => updateConfig({ lineGradientEnd: v })} />
        </div>
      </CollapsibleSection>

      {/* Reference Note for SVG Defaults */}
      <div className="p-4 bg-[var(--kilang-primary)]/5 border border-[var(--kilang-primary-border)]/20 rounded-2xl space-y-2">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-[var(--kilang-primary)] animate-pulse" />
           <span className="text-[9px] font-black uppercase tracking-widest text-[var(--kilang-primary-text)]">Tree Connection Reference</span>
        </div>
        <p className="text-[8px] text-[var(--kilang-text-muted)] leading-relaxed italic">
          Restore the classic node-connection aesthetic:
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 opacity-60">
           <div className="flex justify-between text-[7px] font-mono"><span>Thickness:</span> <span className="text-white">3.0px</span></div>
           <div className="flex justify-between text-[7px] font-mono"><span>Opacity:</span> <span className="text-white">0.40</span></div>
           <div className="flex justify-between text-[7px] font-mono"><span>Blur/Glow:</span> <span className="text-white">0.0px</span></div>
           <div className="flex justify-between text-[7px] font-mono"><span>Gap X/Y:</span> <span className="text-white">0/0 px</span></div>
        </div>
      </div>

      <div className="pb-20" />
    </div>
  );
};
