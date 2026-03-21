'use client';

import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Layout, 
  Aperture, 
  Type, 
  Database, 
  Save, 
  RotateCcw, 
  Share2, 
  ChevronRight, 
  ChevronLeft,
  Pin
} from 'lucide-react';
import { useThemeStudio } from '../../hooks/useThemeStudio';
import { ThemesPanel } from './ThemesPanel';
import { TreePanel } from './TreePanel';
import { BrandingPanel } from './BrandingPanel';
import { VariableMap } from '../VariableMap';

interface ThemeStudioPopoutProps {
  dispatch: any;
  layoutConfig: any;
  state: any;
}

export const ThemeStudioPopout = ({
  dispatch,
  layoutConfig,
  state
}: ThemeStudioPopoutProps) => {
  const ts = useThemeStudio({ dispatch, layoutConfig, state });
  const [activeTab, setActiveTab] = useState<'themes' | 'tree' | 'branding' | 'fonts' | 'map'>('themes');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  // Auto-hide logic
  const handleMouseEnter = () => setIsSidebarOpen(true);
  const handleMouseLeave = () => {
    if (!isPinned) setIsSidebarOpen(false);
  };

  const tabs = [
    { id: 'themes', icon: Palette, label: 'Themes' },
    { id: 'tree', icon: Layout, label: 'Tree' },
    { id: 'branding', icon: Aperture, label: 'Brand' },
    { id: 'fonts', icon: Type, label: 'Fonts' },
    { id: 'map', icon: Database, label: 'Map' }
  ] as const;

  return (
    <div 
      className="fixed inset-0 bg-[#0a0a0c] flex overflow-hidden theme-bar-bnw text-white"
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. Left Vertical Icon Bar */}
      <div 
        className="w-[48px] bg-black border-r border-white/10 flex flex-col items-center py-4 z-50 shrink-0"
        onMouseEnter={handleMouseEnter}
      >
        <div className="mb-8 opacity-20">
          <img src="/kilang/kilang_5_nobg_noring2.png" className="w-6 h-6 grayscale" alt="Logo" />
        </div>

        <div className="flex-1 flex flex-col gap-1 w-full px-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsSidebarOpen(true);
              }}
              className={`w-full aspect-square flex items-center justify-center rounded-lg transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'text-zinc-600 hover:text-white hover:bg-white/5'}`}
              title={tab.label}
            >
              <tab.icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Global Persistence Actions */}
        <div className="mt-auto flex flex-col gap-2 w-full px-2 pb-4">
          <button 
            onClick={ts.actions.handleReset}
            className="w-full aspect-square flex items-center justify-center rounded-lg text-zinc-500 hover:text-white transition-all"
            title="Reload Last Saved"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button 
            onClick={ts.actions.handleSave}
            className="w-full aspect-square flex items-center justify-center rounded-lg bg-zinc-900 border border-white/5 text-zinc-400 hover:bg-white hover:text-black transition-all"
            title="Save Studio Manifest"
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Slide-out Panel Layer */}
      <div 
        className={`absolute left-[48px] top-0 bottom-0 bg-black/95 backdrop-blur-xl border-r border-white/10 z-40 transition-all duration-300 ease-out flex flex-col ${isSidebarOpen ? 'w-[320px] opacity-100 shadow-[20px_0_50px_rgba(0,0,0,0.8)]' : 'w-0 opacity-0 pointer-events-none'}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">{activeTab} Studio</span>
          <button 
            onClick={() => setIsPinned(!isPinned)}
            className={`p-1.5 rounded-md transition-all ${isPinned ? 'bg-white text-black' : 'text-zinc-600 hover:text-white'}`}
          >
            <Pin className={`w-3 h-3 ${isPinned ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
          {activeTab === 'themes' && (
            <ThemesPanel 
              tsState={ts.state} 
              tsHelpers={ts.helpers} 
              tsActions={ts.actions} 
              dispatch={dispatch} 
              layoutConfig={layoutConfig} 
              state={state} 
              dense={true} 
            />
          )}
          {activeTab === 'tree' && (
            <TreePanel 
              tsState={ts.state} 
              tsActions={ts.actions} 
              dispatch={dispatch} 
              layoutConfig={layoutConfig} 
              dense={true} 
            />
          )}
          {activeTab === 'branding' && (
            <BrandingPanel 
              tsState={ts.state} 
              tsActions={ts.actions} 
              dense={true} 
            />
          )}
          {activeTab === 'map' && (
             <div className="px-1 scale-90 origin-top">
               <VariableMap 
                 overrides={ts.state.overrides} 
                 getVariableValue={ts.helpers.getVariableValue} 
               />
             </div>
          )}
        </div>
      </div>

      {/* 3. Main Stage / Preview (or Instruction) */}
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-24 h-24 mb-6 opacity-5 flex items-center justify-center border-2 border-white rounded-full">
          <Monitor className="w-10 h-10" />
        </div>
        <h2 className="text-[14px] font-black uppercase tracking-[0.4em] mb-4 opacity-30">Studio Active</h2>
        <p className="max-w-[180px] text-[10px] uppercase leading-relaxed tracking-widest text-zinc-600">
          Multi-Window Synchronization active. Any change here will reflect in the main portal instantly.
        </p>
        
        {/* Quick Sync / Share bar */}
        <div className="mt-auto px-6 py-4 flex items-center gap-4 border border-white/5 bg-white/[0.02] rounded-full">
           <Share2 className="w-3.5 h-3.5 text-zinc-600" />
           <span className="text-[9px] font-mono text-zinc-500 uppercase">Status: Syncing holistic</span>
        </div>
      </div>
    </div>
  );
};

const Monitor = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
);
