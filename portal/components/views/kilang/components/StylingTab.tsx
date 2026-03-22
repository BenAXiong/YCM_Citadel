'use client';

import React from 'react';
import { 
  Settings2, SlidersHorizontal, PencilLine, Scaling, Maximize2, RotateCcw, 
  Trash2, Zap, ZapOff, Layers 
} from 'lucide-react';
import { SidebarSlider, InlineSidebarSlider, ColorPicker, CollapsibleSection } from './SidebarUI';
import { useSidebar } from '../SidebarContext';

interface StylingTabProps {
  updateConfig: (config: any) => void;
  updateVariable: (name: string, value: string) => void;
}

export const StylingTab = ({ updateConfig, updateVariable }: StylingTabProps) => {
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
        {id === 'spacing' && (
          <div className="flex gap-6 pb-4">
            <div className="flex-1 flex items-center justify-between gap-2">
              <span className="text-[8px] font-black uppercase tracking-widest text-[var(--kilang-primary-text)]/80 whitespace-nowrap">Mode</span>
              <button 
                onClick={() => updateConfig({ spacingMode: layoutConfig.spacingMode === 'even' ? 'log' : 'even' })} 
                className={`px-2 py-1 rounded-lg border transition-all ${layoutConfig.spacingMode === 'log' ? 'bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)] shadow-lg' : 'text-[var(--kilang-text-muted)] hover:bg-[var(--kilang-ctrl-bg)] hover:text-[var(--kilang-text)]'}`}
              >
                <span className="text-[8px] font-black uppercase">{layoutConfig.spacingMode === 'even' ? 'Even' : 'Log'}</span>
              </button>
            </div>
            <div className="flex-1 flex items-center justify-between gap-2">
              <span className="text-[8px] font-black uppercase tracking-widest text-[var(--kilang-primary-text)]/80 whitespace-nowrap">Coupled</span>
              <button 
                onClick={() => updateConfig({ coupleGaps: !layoutConfig.coupleGaps })} 
                className={`px-2 py-1 rounded-lg border transition-all ${layoutConfig.coupleGaps ? 'bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)] shadow-lg' : 'text-[var(--kilang-text-muted)] hover:bg-[var(--kilang-ctrl-bg)] hover:text-[var(--kilang-text)]'}`}
              >
                <span className="text-[8px] font-black uppercase">{layoutConfig.coupleGaps ? 'Yes' : 'No'}</span>
              </button>
            </div>
          </div>
        )}
        {controls.map((control, idx) => {
          if (Array.isArray(control)) {
            return (
              <div key={idx} className="flex gap-4">
                {control.map((c: any) => (
                  <div key={c.key} className="flex-1">
                    <SidebarSlider
                      label={c.label}
                      value={layoutConfig[c.key as keyof typeof layoutConfig] as number}
                      min={c.min}
                      max={c.max}
                      step={c.step}
                      unit={c.unit}
                      disabled={c.disabled}
                      onChange={(v: number) => c.onChangeOverride ? c.onChangeOverride(v) : updateConfig({ [c.key]: v })}
                    />
                  </div>
                ))}
              </div>
            );
          }
          return (
            <InlineSidebarSlider
              key={control.key}
              label={control.label}
              value={layoutConfig[control.key as keyof typeof layoutConfig] as number}
              min={control.min}
              max={control.max}
              step={control.step}
              unit={control.unit}
              disabled={control.disabled}
              onChange={(v: number) => control.onChangeOverride ? control.onChangeOverride(v) : updateConfig({ [control.key]: v })}
            />
          );
        })}
      </div>
    </CollapsibleSection>
  );

  return (
    <div className="px-3 pt-6 pb-2 animate-in fade-in slide-in-from-left-4 duration-500 space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--kilang-primary-text)]" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--kilang-logo-text)]">Presets</h3>
          </div>
          <button
            onClick={() => dispatch({ type: 'RESET_LAYOUT_CONFIG' })}
            className="p-1.5 rounded-lg hover:bg-[var(--kilang-ctrl-bg)] text-[var(--kilang-text-muted)] transition-all hover:text-[var(--kilang-text)]"
            title="Reset Defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="flex-1 aspect-[4/3] bg-[var(--kilang-bg-base)]/40 border border-[var(--kilang-border-std)] rounded-xl flex items-center justify-center group cursor-pointer hover:border-[var(--kilang-primary-border)] transition-all"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--kilang-primary)]/20 group-hover:bg-[var(--kilang-primary)] transition-all" />
            </div>
          ))}
        </div>
      </div>

      {renderSection('spacing', 'Layout Spacing', <SlidersHorizontal className="w-3.5 h-3.5" />, [
        [
          { label: 'Root X (%)', key: 'anchorX', min: 0, max: 100, step: 1, unit: '%' },
          { label: 'Root Y (%)', key: 'anchorY', min: 0, max: 100, step: 1, unit: '%' },
        ],
        [
          { label: 'Tier (H)', key: 'interTierGap', min: 10, max: 600, step: 10, unit: 'px' },
          { label: 'Row (V)', key: 'interRowGap', min: 10, max: 600, step: 5, unit: 'px' },
        ],
        { label: '0-1 Gap', key: 'rootGap', min: 0, max: 600, step: 10, unit: 'px', disabled: layoutConfig.coupleGaps },
      ])}

      {renderSection('paths', 'SVG Connection Styling', <PencilLine className="w-3.5 h-3.5" />, [
        [
          { label: 'Gap X', key: 'lineGapX', min: -100, max: 300, step: 5, unit: 'px' },
          { label: 'Gap Y', key: 'lineGapY', min: -100, max: 300, step: 5, unit: 'px' },
        ],
        [
          { label: 'Line Thickness', key: 'lineWidth', min: 0.5, max: 12, step: 0.1, unit: 'px' },
          { label: 'Line Opacity', key: 'lineOpacity', min: 0, max: 1, step: 0.05, unit: '', 
            onChangeOverride: (v: number) => {
              updateConfig({ lineOpacity: v });
              updateVariable('--kilang-link-opacity', v.toString());
            }
          },
        ],
        { label: 'Line Curvature', key: 'lineTension', min: 0, max: 2, step: 0.1, unit: 'x' },
        [
          { label: 'Dash Pattern', key: 'lineDashArray', min: 0, max: 30, step: 1, unit: 'px' },
          { label: 'Flow Speed', key: 'lineFlowSpeed', min: 0, max: 10, step: 0.5, unit: 'x' },
        ],
      ])}

      {renderSection('geometry', 'Node Geometry', <Scaling className="w-3.5 h-3.5" />, [
        { label: 'Size', key: 'nodeSize', min: 0.5, max: 2, step: 0.1, unit: 'x' },
        [
          { label: 'Word Width', key: 'nodeWidth', min: 80, max: 250, step: 5, unit: 'px' },
          { label: 'Vert Padding', key: 'nodePaddingY', min: 4, max: 32, step: 1, unit: 'px' },
        ],
      ])}




      <div className="pb-20" />
    </div>
  );
};
