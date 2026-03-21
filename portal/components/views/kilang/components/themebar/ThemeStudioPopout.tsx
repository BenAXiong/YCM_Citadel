'use client';

import React, { useState } from 'react';
import {
  Palette,
  Layers,
  Aperture,
  Type,
  Map as MapIcon,
  Sparkles,
  RotateCcw,
  Lightbulb,
  Wand2
} from 'lucide-react';
import { useKilangContext } from '../../KilangContext';
import { useThemeStudio } from '../../hooks/useThemeStudio';
import { ThemesPanel } from './ThemesPanel';
import { TreePanel } from './TreePanel';
import { BrandingPanel } from './BrandingPanel';
import { TypographyPanel } from './TypographyPanel';
import { MasterPanel } from './MasterPanel';
import { VariableMap } from '../VariableMap';
import { PresetBand } from './PresetBand';

export const ThemeStudioPopout = () => {
  const { state, dispatch } = useKilangContext();
  const { layoutConfig } = state;
  const [activeTab, setActiveTab] = useState<'master' | 'themes' | 'tree' | 'branding' | 'typography' | 'map'>('master');

  const themeStudio = useThemeStudio({ dispatch, layoutConfig, state });
  const {
    state: tsState,
    helpers: tsHelpers,
    actions: tsActions
  } = themeStudio;

  const sidebarTools = [
    { id: 'master', label: 'Master', icon: Wand2 },
    { id: 'themes', label: 'Themes', icon: Palette },
    { id: 'tree', label: 'Tree', icon: Layers },
    { id: 'branding', label: 'Branding', icon: Aperture },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'map', label: 'Map', icon: MapIcon },
  ] as const;

  return (
    <div className="fixed inset-0 bg-[#020202] text-white flex flex-row font-['Outfit'] select-none overflow-hidden">
      {/* PERSISTENT SIDEBAR */}
      <div className="w-[72px] bg-[#050505] border-r border-white/10 flex flex-col items-center py-6 gap-6 shrink-0 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center mb-4 group/logo hover:bg-white/10 transition-colors">
          <Aperture className="w-6 h-6 text-white/40 group-hover:text-white transition-colors animate-pulse" />
        </div>

        <div className="flex flex-col gap-3">
          {sidebarTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTab(tool.id)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all group relative ${
                activeTab === tool.id 
                  ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                  : 'text-white/20 hover:text-white hover:bg-white/5'
              }`}
            >
              <tool.icon className="w-5 h-5 shrink-0" />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[100] border border-white/20 shadow-2xl">
                {tool.label}
              </div>

              {activeTab === tool.id && (
                <div className="absolute right-[-14px] w-1 h-6 bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-4">
          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-white/10 hover:text-white hover:bg-white/5 transition-all">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MAIN STAGE */}
      <div className="flex-1 flex flex-col bg-[#0a0a0a] overflow-hidden min-w-0">
        {/* PRESET BAND */}
        <PresetBand 
          currentTheme={layoutConfig.theme} 
          dispatch={dispatch} 
          state={state} 
        />

        <div className="flex-1 relative overflow-hidden h-full">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent)] pointer-events-none" />
          
          <div className="h-full flex flex-col relative z-10">
            {activeTab === 'master' && (
              <MasterPanel 
                tsState={tsState} 
                tsActions={tsActions} 
                tsHelpers={tsHelpers} 
              />
            )}
            {activeTab === 'themes' && (
              <ThemesPanel 
                tsState={tsState} 
                tsActions={tsActions} 
                tsHelpers={tsHelpers} 
                dispatch={dispatch}
                layoutConfig={layoutConfig}
                state={state}
              />
            )}
            {activeTab === 'tree' && (
              <TreePanel 
                tsState={tsState} 
                tsActions={tsActions} 
                tsHelpers={tsHelpers}
                dispatch={dispatch}
                layoutConfig={layoutConfig}
              />
            )}
            {activeTab === 'branding' && (
              <BrandingPanel 
                tsState={tsState} 
                tsActions={tsActions} 
                dispatch={dispatch}
                layoutConfig={layoutConfig} 
              />
            )}
            {activeTab === 'typography' && (
              <TypographyPanel dispatch={dispatch} layoutConfig={layoutConfig} />
            )}
            {activeTab === 'map' && (
              <div className="p-20 flex flex-col items-center justify-center h-full gap-8 bg-[#0a0a0a]">
                <div className="w-32 h-32 bg-white/5 rounded-[3rem] flex items-center justify-center animate-pulse">
                  <Lightbulb className="w-16 h-16 text-white/10" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-[18px] font-black uppercase tracking-[0.6em] text-white">Variable Map Overflow</h2>
                  <p className="text-[11px] font-black uppercase tracking-widest text-white/20 italic">Deep Insight Visualization Coming Soon</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER STATUS */}
        <div className="h-6 border-t border-white/5 bg-black px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[7px] font-black uppercase tracking-[0.3em] text-white/20">Kilang Pro Studio v2.0</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[7px] font-mono text-emerald-500/40 uppercase tracking-widest">Multi-Window Synchronization active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
