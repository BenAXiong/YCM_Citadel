'use client';

import React, { useState } from 'react';
import { 
  Palette, 
  Layers, 
  Aperture, 
  Type,
  Map as MapIcon
} from 'lucide-react';
import { useKilangContext } from '../../KilangContext';
import { useThemeStudio } from '../../hooks/useThemeStudio';
import { ThemesPanel } from './ThemesPanel';
import { TreePanel } from './TreePanel';
import { BrandingPanel } from './BrandingPanel';
import { TypographyPanel } from './TypographyPanel';
import { VariableMap } from '../VariableMap';
import { PresetBand } from './PresetBand';

export const ThemeStudioPopout = () => {
  const { state, dispatch } = useKilangContext();
  const { layoutConfig } = state;
  const [activeTab, setActiveTab] = useState<'themes' | 'tree' | 'branding' | 'typography' | 'map'>('themes');

  const themeStudio = useThemeStudio({ dispatch, layoutConfig, state });
  const { 
    state: tsState, 
    helpers: tsHelpers, 
    actions: tsActions 
  } = themeStudio;

  const sidebarTools = [
    { id: 'themes', label: 'Themes', icon: Palette },
    { id: 'tree', label: 'Tree', icon: Layers },
    { id: 'branding', label: 'Branding', icon: Aperture },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'map', label: 'Map', icon: MapIcon },
  ] as const;

  return (
    <div className="fixed inset-0 bg-[#050505] text-white flex flex-col font-sans selection:bg-white/10 overflow-hidden">
      {/* 1. TOP PRESET BAND (Original styling preserved) */}
      <PresetBand 
        currentTheme={layoutConfig.theme} 
        dispatch={dispatch} 
        state={state} 
      />

      <div className="flex-1 flex overflow-hidden">
        {/* 2. LEFT TOOLBELT (Narrow, Iconic) */}
        <div className="w-[60px] border-r border-white/10 flex flex-col items-center py-6 gap-6 bg-black/20 shrink-0">
          {sidebarTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTab(tool.id)}
              className={`group relative p-3 rounded-xl transition-all ${activeTab === tool.id ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-white/20 hover:text-white hover:bg-white/5'}`}
              title={tool.label}
            >
              <tool.icon className="w-5 h-5" />
              {activeTab === tool.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-white rounded-r-full" />
              )}
            </button>
          ))}
          
          <div className="flex-1" />
        </div>

        {/* 3. MAIN STUDIO STAGE */}
        <div className="flex-1 flex flex-col bg-[#0a0a0a] overflow-hidden">
          {activeTab === 'themes' && (
            <ThemesPanel 
              tsState={tsState} 
              tsHelpers={tsHelpers} 
              tsActions={tsActions} 
              dispatch={dispatch} 
              layoutConfig={layoutConfig}
              state={state}
            />
          )}
          {activeTab === 'tree' && (
            <TreePanel 
              tsState={tsState} 
              tsHelpers={tsHelpers}
              tsActions={tsActions} 
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
            <TypographyPanel 
              dispatch={dispatch}
              layoutConfig={layoutConfig}
            />
          )}
          {activeTab === 'map' && (
            <div className="flex-1 overflow-hidden p-6 bg-black/40">
              <VariableMap 
                overrides={tsState.overrides} 
                getVariableValue={tsHelpers.getVariableValue} 
              />
            </div>
          )}
        </div>
      </div>

      {/* 4. FOOTER STATUS */}
      <div className="h-6 border-t border-white/5 bg-black px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
           <span className="text-[7px] font-black uppercase tracking-[0.3em] text-white/20">Kilang Pro Studio v2.0</span>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[7px] font-mono text-emerald-500/40 uppercase tracking-widest">Multi-Window Synchronization active</span>
        </div>
      </div>
    </div>
  );
};
