'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Palette,
  Layout,
  Type,
  X,
  Layers,
  Monitor,
  Sidebar as SidebarIcon,
  CircleDot,
  Square,
  Save,
  Share2,
  Aperture,
  RotateCcw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Database,
  Lightbulb
} from 'lucide-react';

import { KilangAction, KilangState } from '../kilangReducer';
import { VariableMap } from './VariableMap';

interface ThemeBarProps {
  show: boolean;
  onClose: () => void;
  activeTab: 'themes' | 'landing' | 'fonts' | 'map';
  setActiveTab: (tab: 'themes' | 'landing' | 'fonts' | 'map') => void;
  landingVersion: number;
  setLandingVersion: (v: 1 | 2 | 3) => void;
  logoStyle: 'original' | 'square' | 'round';
  setLogoStyle: (s: 'original' | 'square' | 'round') => void;
  logoSettings: { scale: number; radius: number; xOffset: number; opacity: number; glowIntensity: number; glowColor: string };
  updateLogoSettings: (settings: { scale?: number; radius?: number; xOffset?: number; opacity?: number; glowIntensity?: number; glowColor?: string }) => void;
  resetLogoSettings: () => void;
  dispatch: React.Dispatch<KilangAction>;
  layoutConfig: KilangState['layoutConfig'];
}

export const ThemeBar = ({
  show,
  onClose,
  activeTab,
  setActiveTab,
  landingVersion,
  setLandingVersion,
  logoStyle,
  setLogoStyle,
  logoSettings,
  updateLogoSettings,
  resetLogoSettings,
  dispatch,
  layoutConfig
}: ThemeBarProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['global']));
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [collapsedSubsections, setCollapsedSubsections] = useState<Set<string>>(new Set());
  const [activeBulbs, setActiveBulbs] = useState<Record<string, boolean>>({});
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const groupVars = {
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
      { name: '--kilang-shadow-color', label: 'Shadow Color', type: 'color' }
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
    ] as const
  };

  const tierVars = [
    { name: '--kilang-tier-1-fill', type: 'color' },
    { name: '--kilang-tier-1-border', type: 'color' },
    { name: '--kilang-tier-1-text', type: 'color' },
    { name: '--kilang-tier-2-fill', type: 'color' },
    { name: '--kilang-tier-2-border', type: 'color' },
    { name: '--kilang-tier-2-text', type: 'color' },
    { name: '--kilang-tier-3-fill', type: 'color' },
    { name: '--kilang-tier-3-border', type: 'color' },
    { name: '--kilang-tier-3-text', type: 'color' },
    { name: '--kilang-tier-4-fill', type: 'color' },
    { name: '--kilang-tier-4-border', type: 'color' },
    { name: '--kilang-tier-4-text', type: 'color' },
    { name: '--kilang-tier-5-fill', type: 'color' },
    { name: '--kilang-tier-5-border', type: 'color' },
    { name: '--kilang-tier-5-text', type: 'color' },
    { name: '--kilang-tier-6-fill', type: 'color' },
    { name: '--kilang-tier-6-border', type: 'color' },
    { name: '--kilang-tier-6-text', type: 'color' },
    { name: '--kilang-tier-7-fill', type: 'color' },
    { name: '--kilang-tier-7-border', type: 'color' },
    { name: '--kilang-tier-7-text', type: 'color' },
    { name: '--kilang-tier-8-fill', type: 'color' },
    { name: '--kilang-tier-8-border', type: 'color' },
    { name: '--kilang-tier-8-text', type: 'color' },
    { name: '--kilang-tier-9-fill', type: 'color' },
    { name: '--kilang-tier-9-border', type: 'color' },
    { name: '--kilang-tier-9-text', type: 'color' }
  ];

  const THEME_VARS = [
    // --- 14 SURFACES ---
    '--kilang-bg-base', '--kilang-bg', '--kilang-card', '--kilang-primary-bg', '--kilang-secondary-bg', '--kilang-accent-bg',
    '--kilang-tooltip-bg', '--kilang-toast-bg', '--kilang-primary-glow', '--kilang-secondary-glow', '--kilang-accent-glow',
    '--kilang-ctrl-active', '--kilang-overlay-bg', '--kilang-input-bg',
    '--kilang-ctrl-bg', '--kilang-shadow-color',

    // --- 12 BORDERS ---
    '--kilang-border', '--kilang-primary-border', '--kilang-secondary-border', '--kilang-accent-border',
    '--kilang-tooltip-border', '--kilang-toast-border', '--kilang-glass', '--kilang-border-std',
    '--kilang-ctrl-active-border', '--kilang-muted-border', '--kilang-node-border', '--kilang-scrollbar-border',
    '--kilang-shadow-primary',

    // --- 10 TEXT ---
    '--kilang-text', '--kilang-text-muted', '--kilang-primary-text', '--kilang-secondary-text', '--kilang-accent-text',
    '--kilang-logo-text', '--kilang-ctrl-active-text', '--kilang-tooltip-text', '--kilang-toast-text', '--kilang-metric-text',

    // --- 27 TREE TIERS ---
    '--kilang-tier-1-fill', '--kilang-tier-1-border', '--kilang-tier-1-text',
    '--kilang-tier-2-fill', '--kilang-tier-2-border', '--kilang-tier-2-text',
    '--kilang-tier-3-fill', '--kilang-tier-3-border', '--kilang-tier-3-text',
    '--kilang-tier-4-fill', '--kilang-tier-4-border', '--kilang-tier-4-text',
    '--kilang-tier-5-fill', '--kilang-tier-5-border', '--kilang-tier-5-text',
    '--kilang-tier-6-fill', '--kilang-tier-6-border', '--kilang-tier-6-text',
    '--kilang-tier-7-fill', '--kilang-tier-7-border', '--kilang-tier-7-text',
    '--kilang-tier-8-fill', '--kilang-tier-8-border', '--kilang-tier-8-text',
    '--kilang-tier-9-fill', '--kilang-tier-9-border', '--kilang-tier-9-text'
  ];

  // Theme-Specific Persistence Logic
  useEffect(() => {
    const themeName = layoutConfig.theme;

    // 1. Clear all existing inline overrides first
    const themedEl = document.querySelector('[data-theme]');
    THEME_VARS.forEach(v => {
      document.documentElement.style.removeProperty(v);
      if (themedEl) (themedEl as HTMLElement).style.removeProperty(v);
    });

    // 2. Load theme-specific overrides
    const saved = localStorage.getItem(`kilang-custom-theme-${themeName}`);
    const loadedOverrides: Record<string, string> = {};
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.entries(parsed).forEach(([key, val]) => {
          document.documentElement.style.setProperty(key, val as string);
          if (themedEl) (themedEl as HTMLElement).style.setProperty(key, val as string);
          loadedOverrides[key] = val as string;
        });
      } catch (e) {
        console.error(`Failed to parse saved theme for ${themeName}`, e);
      }
    }
    setOverrides(loadedOverrides);
  }, [layoutConfig.theme]);

  const updateVariable = (name: string, value: string) => {
    document.documentElement.style.setProperty(name, value);
    const themedEl = document.querySelector('[data-theme]');
    if (themedEl) (themedEl as HTMLElement).style.setProperty(name, value);

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setOverrides(prev => ({ ...prev, [name]: value }));
      const saved = localStorage.getItem(`kilang-custom-theme-${layoutConfig.theme}`);
      let current: Record<string, string> = {};
      if (saved) {
        try { current = JSON.parse(saved); } catch (e) { }
      }
      current[name] = value;
      localStorage.setItem(`kilang-custom-theme-${layoutConfig.theme}`, JSON.stringify(current));
    }, 100);
  };

  const updateVariables = (mapping: Record<string, string>) => {
    const themedEl = document.querySelector('[data-theme]');
    Object.entries(mapping).forEach(([name, value]) => {
      document.documentElement.style.setProperty(name, value);
      if (themedEl) (themedEl as HTMLElement).style.setProperty(name, value);
    });

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setOverrides(prev => ({ ...prev, ...mapping }));
      const saved = localStorage.getItem(`kilang-custom-theme-${layoutConfig.theme}`);
      let current: Record<string, string> = {};
      if (saved) {
        try { current = JSON.parse(saved); } catch (e) { }
      }
      Object.entries(mapping).forEach(([name, value]) => { current[name] = value; });
      localStorage.setItem(`kilang-custom-theme-${layoutConfig.theme}`, JSON.stringify(current));
    }, 100);
  };

  const toggleSection = (id: string) => {
    const newSet = new Set(expandedSections);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedSections(newSet);
  };

  const toggleSubsection = (id: string) => {
    const newSet = new Set(collapsedSubsections);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setCollapsedSubsections(newSet);
  };

  const SectionHeader = ({ id, label, icon: Icon, actions }: { id: string; label: string; icon: any; actions?: React.ReactNode }) => (
    <div className="w-full flex items-center justify-between bg-white/[0.03] border-y border-white/5 group/header hover:bg-white/[0.06] transition-all">
      <button
        onClick={() => toggleSection(id)}
        className="flex-grow flex items-center gap-4 py-3 px-5 text-left"
      >
        <Icon className={`w-4 h-4 ${expandedSections.has(id) ? 'text-[var(--kilang-primary)]' : 'text-white'}`} />
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white group-hover:text-white">{label}</span>
      </button>

      <div className="flex items-center gap-2 pr-4">
        {actions}
        <button onClick={() => toggleSection(id)} className="p-1 hover:bg-white/10 rounded-lg transition-all ml-1">
          <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-300 ${expandedSections.has(id) ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );

  return (
    <div className={`fixed top-16 left-0 bottom-0 w-82 z-[2000] transition-transform duration-500 theme-bar-bnw ${show ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="h-full flex flex-col relative">

        <button
          onClick={onClose}
          className="absolute -right-8 top-[90%] -translate-y-1/2 w-8 h-12 bg-black border border-white/10 rounded-r-xl flex items-center justify-center hover:bg-white/10 transition-all group z-[2001] shadow-2xl"
        >
          {show ? (
            <ChevronLeft className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          ) : (
            <div className="flex flex-col items-center gap-0.5">
              <ChevronRight className="w-5 h-5 text-[var(--kilang-primary)] animate-pulse" />
            </div>
          )}
        </button>

        <div className="grid grid-cols-4 bg-white/[0.02] border-b border-white/10">
          {(['themes', 'landing', 'fonts', 'map'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`theme-bar-tab-btn transition-all border-b-2 py-3 ${activeTab === tab ? 'border-[var(--kilang-primary)] text-white bg-white/[0.05]' : 'border-transparent text-white/60 hover:text-white'}`}
              title={tab === 'map' ? 'VARIABLE MAP: Exhaustive lineage of variable propagation. Use the scan script to update file occurrences after major refactoring.' : undefined}
            >
              <div className="flex flex-col items-center gap-1">
                {tab === 'themes' && <Palette className="w-3.5 h-3.5" />}
                {tab === 'landing' && <Aperture className="w-3.5 h-3.5" />}
                {tab === 'fonts' && <Type className="w-3.5 h-3.5" />}
                {tab === 'map' && <Database className="w-3.5 h-3.5" />}
                <span className="text-[7px] font-black uppercase tracking-widest">{tab}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar no-scrollbar pb-10">

          {activeTab === 'themes' && (
            <div className="animate-in fade-in duration-300">

              <div className="p-6 flex items-center justify-center gap-6 border-b border-white/5">
                {[
                  { id: 'kakarayan', label: 'Kakarayan', color: '#3b82f6' },
                  { id: 'papah', label: 'Papah', color: '#10b981' },
                  { id: 'ngidan', label: 'Ngidan', color: '#6366f1' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => dispatch({ type: 'SET_UI', theme: t.id })}
                    className="flex flex-col items-center gap-3 group relative"
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${layoutConfig.theme === t.id ? 'scale-110' : 'opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0'}`}>
                      <div className="absolute inset-0 blur-xl opacity-40 rounded-full" style={{ backgroundColor: t.color }} />
                      <img
                        src="/kilang/kilang_5_nobg_noring2.png"
                        className="w-10 h-10 relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                        alt={t.label}
                      />
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-widest text-white transition-opacity ${layoutConfig.theme === t.id ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>

              <SectionHeader
                id="global"
                label="Global"
                icon={Palette}
                actions={
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const themedEl = document.querySelector('[data-theme]');
                        THEME_VARS.forEach(v => {
                          document.documentElement.style.removeProperty(v);
                          if (themedEl) (themedEl as HTMLElement).style.removeProperty(v);
                        });
                        localStorage.removeItem(`kilang-custom-theme-${layoutConfig.theme}`);
                        setOverrides({});
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all group/reset"
                      title="RESET THEME: Wipes all inline CSS property overrides from both :root and the local [data-theme] container."
                    >
                      <RotateCcw className="w-3.5 h-3.5 group-hover/reset:rotate-[-45deg] transition-transform" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const saved: Record<string, string> = {};
                        THEME_VARS.forEach(v => {
                          const val = document.documentElement.style.getPropertyValue(v);
                          if (val) saved[v] = val;
                        });
                        localStorage.setItem(`kilang-custom-theme-${layoutConfig.theme}`, JSON.stringify(saved));
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all group/save"
                      title="SAVE THEME: Serializes current property overrides into persistent localStorage."
                    >
                      <Save className="w-3.5 h-3.5 group-hover/save:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const styles = THEME_VARS.map(v => `  ${v}: ${getComputedStyle(document.documentElement).getPropertyValue(v).trim()};`).join('\n');
                        const css = `:root {\n${styles}\n}`;
                        console.log(css);
                        alert("CSS Exported to Console!");
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all group/export"
                      title="EXPORT CSS: Aggregates current theme variables into a :root block."
                    >
                      <Share2 className="w-3.5 h-3.5 group-hover/export:scale-110 transition-transform" />
                    </button>
                  </div>
                }
              />
              {expandedSections.has('global') && (
                <div className="py-3 px-5 space-y-8">
                  {[
                    {
                      group: 'masters',
                      vars: [
                        {
                          label: 'Backgrounds',
                          type: 'color',
                          targets: ['--kilang-bg-base', '--kilang-bg', '--kilang-card', '--kilang-primary-bg', '--kilang-secondary-bg', '--kilang-accent-bg', '--kilang-tooltip-bg', '--kilang-toast-bg', '--kilang-primary-glow', '--kilang-secondary-glow', '--kilang-accent-glow', '--kilang-overlay-bg', '--kilang-input-bg', '--kilang-ctrl-bg', '--kilang-shadow-color', '--kilang-tier-1-fill', '--kilang-tier-2-fill', '--kilang-tier-3-fill', '--kilang-tier-4-fill', '--kilang-tier-5-fill', '--kilang-tier-6-fill', '--kilang-tier-7-fill', '--kilang-tier-8-fill', '--kilang-tier-9-fill'],
                          activeTargets: ['--kilang-ctrl-active']
                        },
                        {
                          label: 'Borders',
                          type: 'color',
                          targets: ['--kilang-border', '--kilang-primary-border', '--kilang-secondary-border', '--kilang-accent-border', '--kilang-tooltip-border', '--kilang-toast-border', '--kilang-glass', '--kilang-border-std', '--kilang-muted-border', '--kilang-node-border', '--kilang-scrollbar-border', '--kilang-tier-1-border', '--kilang-tier-2-border', '--kilang-tier-3-border', '--kilang-tier-4-border', '--kilang-tier-5-border', '--kilang-tier-6-border', '--kilang-tier-7-border', '--kilang-tier-8-border', '--kilang-tier-9-border'],
                          activeTargets: ['--kilang-ctrl-active-border']
                        },
                        {
                          label: 'Texts',
                          type: 'color',
                          targets: ['--kilang-text', '--kilang-text-muted', '--kilang-primary-text', '--kilang-secondary-text', '--kilang-accent-text', '--kilang-logo-text', '--kilang-tooltip-text', '--kilang-toast-text', '--kilang-metric-text', '--kilang-tier-1-text', '--kilang-tier-2-text', '--kilang-tier-3-text', '--kilang-tier-4-text', '--kilang-tier-5-text', '--kilang-tier-6-text', '--kilang-tier-7-text', '--kilang-tier-8-text', '--kilang-tier-9-text'],
                          activeTargets: ['--kilang-ctrl-active-text']
                        }
                      ]
                    },
                    {
                      group: `Surfaces (${groupVars.surfaces.filter(v => v.name !== '--kilang-ctrl-active').length} + ${groupVars.surfaces.filter(v => v.name === '--kilang-ctrl-active').length})`,
                      vars: groupVars.surfaces
                    },
                    {
                      group: `Borders & Outlines (${groupVars.borders.filter(v => v.name !== '--kilang-ctrl-active-border').length} + ${groupVars.borders.filter(v => v.name === '--kilang-ctrl-active-border').length})`,
                      vars: groupVars.borders
                    },
                    {
                      group: `Text & Icons (${groupVars.texts.filter(v => v.name !== '--kilang-ctrl-active-text').length} + ${groupVars.texts.filter(v => v.name === '--kilang-ctrl-active-text').length})`,
                      vars: groupVars.texts
                    },
                    {
                      group: `Nodes (${tierVars.length})`,
                      vars: tierVars
                    }
                  ]
                    .map((group) => (
                      <div key={`${layoutConfig.theme}-${group.group}`} className="space-y-2">
                        <button
                          onClick={() => toggleSubsection(group.group)}
                          className="w-full text-left focus:outline-none"
                        >
                          <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-2 hover:text-white/60 transition-colors uppercase">{group.group}</h4>
                        </button>
                        {!collapsedSubsections.has(group.group) && (
                          <div className="bg-white/[0.03] rounded-2xl border border-white/10 overflow-hidden">
                            {group.vars.map((v, i) => {
                              const isMasterControl = (v as any).targets !== undefined;
                              const isRowActive = isMasterControl && (v as any).targets.some((t: string) => overrides[t]);
                              const varKey = (v as any).label || (v as any).name;
                              const isBulbOn = !!activeBulbs[varKey];

                              const isNodeGroup = group.group.includes('Nodes');
                              const isTierEnd = isNodeGroup && (i + 1) % 3 === 0 && i !== group.vars.length - 1;

                              return (
                                <div key={varKey} className={`flex items-center justify-between py-2.5 px-4 group hover:bg-white/[0.02] transition-all border-b ${isTierEnd ? 'border-white/30 border-b-[2px]' : 'border-white/5 last:border-0'}`}>
                                  <div className="flex flex-col">
                                    {(v as any).label && <span className="text-[11px] font-black uppercase tracking-widest text-white/90">{(v as any).label}</span>}
                                    {(v as any).name && <span className={`${(v as any).label ? 'text-[8px]' : 'text-[9px]'} font-mono text-white/90 lowercase tracking-tighter`}>{(v as any).name}</span>}
                                    {(v as any).targets && <span className="text-[7px] font-mono text-white/30 lowercase tracking-tighter">{(v as any).targets.length} + {(v as any).activeTargets?.length || 0} targets</span>}
                                  </div>
                                  <div className="relative flex items-center gap-2">
                                    {isMasterControl && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const nextOn = !isBulbOn;
                                            setActiveBulbs(prev => ({ ...prev, [varKey]: nextOn }));

                                            // Immediate Sync: Apply current master value to active targets if turning ON
                                            if (nextOn && (v as any).activeTargets) {
                                              const currentValue = overrides[(v as any).targets[0]] || getComputedStyle(document.documentElement).getPropertyValue((v as any).targets[0]).trim();
                                              if (currentValue) {
                                                const mapping: Record<string, string> = {};
                                                (v as any).activeTargets.forEach((t: string) => mapping[t] = currentValue);
                                                updateVariables(mapping);
                                              }
                                            }
                                          }}
                                          className={`p-1 rounded-md transition-all duration-300 hover:bg-white/10 cursor-pointer`}
                                          title={isBulbOn ? `Exclude active colors from ${varKey}` : `Include active colors (tabs, buttons) in ${varKey}`}
                                        >
                                          <Lightbulb
                                            className={`w-3.5 h-3.5 transition-all duration-500 ${isBulbOn ? 'text-[var(--kilang-primary)] fill-[var(--kilang-primary)]/20 drop-shadow-[0_0_8px_var(--kilang-primary)] scale-110' : 'text-white/10 fill-transparent'}`}
                                          />
                                        </button>
                                    )}
                                    {v.type === 'color' ? (
                                      <div className="relative flex items-center">
                                        <input
                                          type="color"
                                          defaultValue={overrides[(v as any).name || (v as any).targets?.[0]] || getComputedStyle(document.documentElement).getPropertyValue((v as any).name || (v as any).targets?.[0]).trim()}
                                          onChange={(e) => {
                                            if ((v as any).targets) {
                                              const finalTargets = [...(v as any).targets];
                                              if (isBulbOn && (v as any).activeTargets) {
                                                finalTargets.push(...(v as any).activeTargets);
                                              }
                                              const mapping: Record<string, string> = {};
                                                finalTargets.forEach((t: string) => mapping[t] = e.target.value);
                                                updateVariables(mapping);
                                              } else {
                                                updateVariable((v as any).name, e.target.value);
                                              }
                                            }}
                                            className="w-full h-full bg-transparent border-0 cursor-pointer opacity-0 absolute inset-0 z-10"
                                          />
                                          <div className="w-6 h-6 rounded-lg border border-white/20 shadow-xl transition-transform group-hover:scale-110" style={{ backgroundColor: overrides[(v as any).name || (v as any).targets?.[0]] || `var(${(v as any).name || (v as any).targets?.[0]})` }} />
                                        </div>
                                    ) : (
                                      <input
                                        type="text"
                                        defaultValue={overrides[(v as any).name] || getComputedStyle(document.documentElement).getPropertyValue((v as any).name).trim()}
                                          onChange={(e) => updateVariable((v as any).name, e.target.value)}
                                          className="w-24 bg-transparent border-0 text-right text-[10px] text-white/60 focus:text-white focus:outline-none font-mono"
                                        />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}

              <SectionHeader id="logo" label="Header Logo" icon={Square} />
              {expandedSections.has('logo') && (
                <div className="py-6 px-5 text-center text-white italic text-[11px] uppercase tracking-widest opacity-40">
                  Header Logo Controls Coming Soon
                </div>
              )}

              <SectionHeader id="animation" label="Animation" icon={RotateCcw} />
              {expandedSections.has('animation') && (
                <div className="py-6 px-5 text-center text-white italic text-[11px] uppercase tracking-widest opacity-40">
                  Motion Engine Ready
                </div>
              )}
            </div>
          )}

          {activeTab === 'landing' && (
            <div className="space-y-6 py-3 px-5 animate-in fade-in duration-500">
              <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Landing Presets</h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { id: 1, label: 'Classic Logo', desc: 'Centered kiln mark on neutral focus.', icon: <Monitor className="w-5 h-5" /> },
                    { id: 2, label: 'Ethereal Fill', desc: 'Background immersion with faded mark.', icon: <Layers className="w-5 h-5" /> },
                    { id: 3, label: 'Dual Pillars', desc: 'Symmetric border-pinned architecture.', icon: <SidebarIcon className="w-5 h-5" /> }
                  ].map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setLandingVersion(v.id as any)}
                      className={`w-full text-left py-4 px-5 rounded-2xl border transition-all group ${landingVersion === v.id ? 'bg-[var(--kilang-primary)]/20 border-[var(--kilang-primary)] shadow-lg' : 'bg-white/[0.04] border-white/10 hover:border-white/20'}`}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${landingVersion === v.id ? 'bg-[var(--kilang-primary)] text-white' : 'bg-white/10 text-white group-hover:bg-white/20'}`}>
                          {v.icon}
                        </div>
                        <div>
                          <div className="text-[12px] font-black uppercase tracking-widest text-white">{v.label}</div>
                          <div className="text-[10px] text-white/60 mt-1 leading-relaxed">{v.desc}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Logo Treatment</h3>
                <div className="grid grid-cols-3 gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/10">
                  {[
                    { id: 'original', label: 'ORIG' },
                    { id: 'square', label: 'SQ' },
                    { id: 'round', label: 'MASK' }
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setLogoStyle(style.id as any)}
                      className={`flex items-center justify-center py-3 rounded-xl transition-all ${logoStyle === style.id ? 'bg-[var(--kilang-primary)] text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">{style.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6 py-3 px-5 rounded-3xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Logo Tuning</h3>
                  <button onClick={resetLogoSettings} className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-all group">
                    <RotateCcw className="w-4 h-4 group-hover:rotate-[-45deg] transition-transform duration-300" />
                  </button>
                </div>

                {[
                  { label: 'Scale', value: logoSettings.scale.toFixed(2), key: 'scale', min: 0.5, max: 3, step: 0.05 },
                  { label: 'Opacity', value: logoSettings.opacity.toFixed(2), key: 'opacity', min: 0, max: 1, step: 0.05 },
                  { label: 'Radius', value: logoSettings.radius.toString(), key: 'radius', min: 0, max: 100, step: 1 }
                ].map((s) => (
                  <div key={s.key} className="flex items-center gap-4 group">
                    <span className="w-12 text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-white/60 transition-colors">
                      {s.label === 'Opacity' ? 'OPAC' : s.label.toUpperCase()}
                    </span>
                    <input
                      type="range"
                      min={s.min}
                      max={s.max}
                      step={s.step}
                      value={s.value}
                      onChange={(e) => updateLogoSettings({ [s.key]: parseFloat(e.target.value) })}
                      className="flex-grow h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-[var(--kilang-primary)] hover:bg-white/10 transition-all"
                    />
                    <span className="w-8 text-right text-[10px] font-mono text-white/40 group-hover:text-white transition-opacity">
                      {s.value}
                    </span>
                  </div>
                ))}

                {landingVersion !== 1 && (
                  <div className="space-y-4 border-t border-white/5 pt-4 mt-2">
                    <div className="flex items-center gap-4 group">
                      <span className="w-12 text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-white/60 transition-colors">
                        GLOW
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={logoSettings.glowIntensity}
                        onChange={(e) => updateLogoSettings({ glowIntensity: parseFloat(e.target.value) })}
                        className="flex-grow h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-[var(--kilang-primary)] hover:bg-white/10 transition-all"
                      />
                      <span className="w-8 text-right text-[10px] font-mono text-white/40 group-hover:text-white transition-opacity">
                        {(logoSettings.glowIntensity * 100).toFixed(0)}%
                      </span>
                    </div>

                    {landingVersion === 3 && (
                      <div className="flex items-center gap-4 group">
                        <span className="w-12 text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-white/60 transition-colors">
                          OFFSET
                        </span>
                        <input
                          type="range"
                          min="-400"
                          max="436"
                          step="1"
                          value={logoSettings.xOffset}
                          onChange={(e) => updateLogoSettings({ xOffset: parseInt(e.target.value) })}
                          className="flex-grow h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-[var(--kilang-primary)] hover:bg-white/10 transition-all"
                        />
                        <span className="w-8 text-right text-[10px] font-mono text-white/40 group-hover:text-white transition-opacity">
                          {logoSettings.xOffset}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'fonts' && (
            <div className="p-12 text-center text-white italic text-[11px] uppercase tracking-widest opacity-40">
              Typography Ready
            </div>
          )}

          {activeTab === 'map' && (
            <VariableMap />
          )}

        </div>
      </div>
    </div>
  );
};
