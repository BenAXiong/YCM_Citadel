'use client';

import React from 'react';
import { Palette, Lightbulb, Zap, ZapOff, RotateCcw } from 'lucide-react';
import { THEME_PRESETS } from '../../kilangConstants';
import { SectionHeader, VariableControl } from './Shared';

interface ThemesPanelProps {
  tsState: any;
  tsHelpers: any;
  tsActions: any;
  dispatch: any;
  layoutConfig: any;
  state: any;
  dense?: boolean;
}

export const ThemesPanel = ({
  tsState,
  tsHelpers,
  tsActions,
  dispatch,
  layoutConfig,
  state,
  dense = false
}: ThemesPanelProps) => {
  const { overrides, activeBulbs, expandedSections, slideIndex } = tsState;
  const { getVariableValue, getColorValue, getHonestColor } = tsHelpers;
  const { 
    toggleSection, 
    updateVariable, 
    updateVariables, 
    setActiveBulbs, 
    setSlideIndex, 
    setGalleryRef 
  } = tsActions;

  const itemsPerSlide = dense ? 5 : 3;
  const totalSlides = Math.ceil(THEME_PRESETS.length / itemsPerSlide);

  return (
    <div className="space-y-1">
      {/* Presets Gallery (Simplified for Panel) */}
      <div className="p-4 bg-white/[0.02] border-b border-white/5">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4">Presets</h3>
        <div className="flex flex-wrap gap-4 justify-center">
          {THEME_PRESETS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                dispatch({ 
                  type: 'SYNC_HOLISTIC_THEME', 
                  theme: t.id, 
                  layoutConfig: t.config,
                  branding: {
                    logoStyles: state.logoStyles,
                    logoSettings: state.logoSettings,
                    landingVersion: state.landingVersion
                  }
                });
              }}
              className="flex flex-col items-center gap-2 group w-12"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${layoutConfig.theme === t.id ? 'scale-110 border-2 border-white' : 'opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0'}`}>
                <div className="absolute inset-0 blur-lg opacity-20 rounded-full" style={{ backgroundColor: t.color }} />
                <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: t.color }} />
              </div>
              <span className="text-[7px] font-black uppercase tracking-tighter text-white/40 group-hover:text-white truncate w-full text-center">
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Surface Master Section */}
      <SectionHeader 
        id="masters" 
        label="Master Controls" 
        icon={Zap} 
        isExpanded={expandedSections.has('masters')}
        onToggle={toggleSection}
        dense={dense}
      />
      {expandedSections.has('masters') && (
        <div className="bg-white/[0.03]">
           {[
            { label: 'Backgrounds', type: 'color', targets: ['--kilang-bg-base', '--kilang-bg', '--kilang-card', '--kilang-primary-bg', '--kilang-secondary-bg', '--kilang-accent-bg', '--kilang-tooltip-bg', '--kilang-toast-bg', '--kilang-overlay-bg', '--kilang-input-bg', '--kilang-ctrl-bg', '--kilang-shadow-color', '--kilang-background-secondary', '--kilang-primary', '--kilang-secondary', '--kilang-accent'], activeTargets: ['--kilang-ctrl-active'] },
            { label: 'Borders', type: 'color', targets: ['--kilang-border', '--kilang-primary-border', '--kilang-secondary-border', '--kilang-accent-border', '--kilang-tooltip-border', '--kilang-toast-border', '--kilang-glass', '--kilang-border-std', '--kilang-muted-border', '--kilang-node-border', '--kilang-scrollbar-border'], activeTargets: ['--kilang-ctrl-active-border'] },
            { label: 'Texts', type: 'color', targets: ['--kilang-text', '--kilang-text-muted', '--kilang-primary-text', '--kilang-secondary-text', '--kilang-accent-text', '--kilang-logo-text', '--kilang-tooltip-text', '--kilang-toast-text', '--kilang-metric-text'], activeTargets: ['--kilang-ctrl-active-text'] }
          ].map((m) => {
            const isBulbOn = !!activeBulbs[m.label];
            return (
              <div key={m.label} className="p-1 border-b border-white/5">
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">{m.label}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const nextOn = !isBulbOn;
                        setActiveBulbs((prev: any) => ({ ...prev, [m.label]: nextOn }));
                      }}
                      className="p-1"
                    >
                      <Lightbulb className={`w-3.5 h-3.5 ${isBulbOn ? 'text-white fill-white/20' : 'text-zinc-800'}`} />
                    </button>
                    <input
                      type="color"
                      value={getColorValue(m.targets[0])}
                      onChange={(e) => {
                        const finalTargets = [...m.targets];
                        if (isBulbOn && m.activeTargets) finalTargets.push(...m.activeTargets);
                        const mapping: Record<string, string> = {};
                        finalTargets.forEach(t => mapping[t] = e.target.value);
                        updateVariables(mapping);
                      }}
                      className="w-5 h-5 bg-transparent border-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
