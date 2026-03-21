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
  Lightbulb,
  ExternalLink,
  SlidersHorizontal,
  PencilLine,
  Scaling,
  Maximize2,
  Zap,
  ZapOff
} from 'lucide-react';

import { KilangAction, KilangState } from '../kilangReducer';
import { VariableMap } from './VariableMap';
import { THEME_VARS } from '../kilangConstants';

interface ThemeBarProps {
  show: boolean;
  onClose: () => void;
  activeTab: 'themes' | 'tree' | 'landing' | 'fonts' | 'map';
  setActiveTab: (tab: 'themes' | 'tree' | 'landing' | 'fonts' | 'map') => void;
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
  links: [] as const,
  weights: [
    { name: '--kilang-border-w-std', label: 'Standard Weight', type: 'text' },
    { name: '--kilang-border-w-resizer', label: 'Resizer Weight', type: 'text' }
  ] as const
};


export const THEME_PRESETS = [
  { id: 'kakarayan', label: 'Kakarayan', color: '#3b82f6' },
  { id: 'papah', label: 'Papah', color: '#10b981' },
  { id: 'ngidan', label: 'Ngidan', color: '#6366f1' },
  { id: 'b', label: 'b', color: '#000000ff' },
  { id: 'w', label: 'w', color: '#ffffffff' },
  { id: 'cudad', label: 'Cudad', color: '#949494ff' },
  { id: 'pasiwali', label: 'Pasiwali', color: '#f6d13bff' },
  { id: 'matrix', label: 'Matrix', color: '#11ff00ff' },
  { id: 'picudadan', label: 'Picudadan', color: '#f63b3bff' },
  { id: 'rainbow', label: 'Rainbow', color: '#f63b3bff' },
  { id: '11', label: '11', color: '#3b82f6' },
  { id: '12', label: '12', color: '#3b82f6' },
  { id: 'new', label: 'new', color: '#ffffffff' }
];

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
  const [slideIndex, setSlideIndex] = useState(0);
  const itemsPerSlide = 3;
  const totalSlides = Math.ceil(THEME_PRESETS.length / itemsPerSlide);
  const galleryRef = useRef<HTMLDivElement | null>(null);

  const setGalleryRef = (el: HTMLDivElement | null) => {
    if (galleryRef.current) {
      galleryRef.current.removeEventListener('wheel', onWheelGlobal);
    }
    
    galleryRef.current = el;
    
    if (el) {
      el.addEventListener('wheel', onWheelGlobal, { passive: false });
    }
  };

  const onWheelGlobal = (e: WheelEvent) => {
    if (!galleryRef.current) return;
    
    // Only intercept if it's primarily a vertical scroll
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      e.stopPropagation(); 
      
      galleryRef.current.scrollBy({
        left: e.deltaY * 3,
        behavior: 'auto'
      });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.offsetWidth;
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== slideIndex) setSlideIndex(newIndex);
  };

  const scrollToSlide = (index: number) => {
    if (galleryRef.current) {
      const width = galleryRef.current.offsetWidth;
      galleryRef.current.scrollTo({ left: index * width, behavior: 'smooth' });
    }
  };

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['global']));
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [collapsedSubsections, setCollapsedSubsections] = useState<Set<string>>(new Set());
  const [activeBulbs, setActiveBulbs] = useState<Record<string, boolean>>({});
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    const themedEls = document.querySelectorAll('[data-theme]');
    document.documentElement.style.setProperty(name, value);
    themedEls.forEach(el => (el as HTMLElement).style.setProperty(name, value));

    setOverrides(prev => ({ ...prev, [name]: value }));
    
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const saved = localStorage.getItem(`kilang-custom-theme-${layoutConfig.theme}`);
      let current: Record<string, string> = {};
      if (saved) {
        try { current = JSON.parse(saved); } catch (e) { }
      }
      current[name] = value;
      localStorage.setItem(`kilang-custom-theme-${layoutConfig.theme}`, JSON.stringify(current));
    }, 500);
  };

  const updateVariables = (mapping: Record<string, string>) => {
    const themedEls = document.querySelectorAll('[data-theme]');
    Object.entries(mapping).forEach(([name, value]) => {
      document.documentElement.style.setProperty(name, value);
      themedEls.forEach(el => (el as HTMLElement).style.setProperty(name, value));
    });

    setOverrides(prev => ({ ...prev, ...mapping }));

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const saved = localStorage.getItem(`kilang-custom-theme-${layoutConfig.theme}`);
      let current: Record<string, string> = {};
      if (saved) {
        try { current = JSON.parse(saved); } catch (e) { }
      }
      Object.entries(mapping).forEach(([name, value]) => { current[name] = value; });
      localStorage.setItem(`kilang-custom-theme-${layoutConfig.theme}`, JSON.stringify(current));
    }, 500);
  };

  const getHonestColor = (name: string, value: string) => {
    if (name.includes('tier-1-fill')) return `color-mix(in srgb, ${value} calc(20% * var(--kilang-node-intensity)), var(--kilang-bg-base))`;
    if (name.includes('tier-2-fill')) return `color-mix(in srgb, ${value} calc(10% * var(--kilang-node-intensity)), var(--kilang-bg-base))`;
    if (name.includes('tier-') && name.includes('-fill')) return `color-mix(in srgb, ${value} calc(5% * var(--kilang-node-intensity)), var(--kilang-bg-base))`;
    
    // Generic Opacity Detection
    const opacityVar = name + '-opacity';
    return `color-mix(in srgb, ${value}, transparent calc(100% - var(${opacityVar}, 1) * 100%))`;
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
        <Icon className={`w-4 h-4 ${expandedSections.has(id) ? 'text-white' : 'text-white/40'}`} />
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
              <ChevronRight className="w-5 h-5 text-zinc-400 animate-pulse" />
            </div>
          )}
        </button>

        <div className="grid grid-cols-6 bg-white/[0.02] border-b border-white/10">
          {(['themes', 'tree', 'landing', 'fonts', 'map'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`theme-bar-tab-btn transition-all border-b-2 py-3 ${activeTab === tab ? 'border-white text-white bg-white/[0.05]' : 'border-transparent text-white/60 hover:text-white'}`}
              title={tab === 'map' ? 'VARIABLE MAP: Exhaustive lineage of variable propagation. Use the scan script to update file occurrences after major refactoring.' : undefined}
            >
              <div className="flex flex-col items-center gap-1">
                {tab === 'themes' && <Palette className="w-3.5 h-3.5" />}
                {tab === 'tree' && <Layout className="w-3.5 h-3.5" />}
                {tab === 'landing' && <Aperture className="w-3.5 h-3.5" />}
                {tab === 'fonts' && <Type className="w-3.5 h-3.5" />}
                {tab === 'map' && <Database className="w-3.5 h-3.5" />}
                <span className="text-[7px] font-black uppercase tracking-widest">{tab}</span>
              </div>
            </button>
          ))}
          <button
            onClick={() => {
              const width = 450;
              const height = 900;
              const left = window.screen.width - width;
              const top = 0;
              window.open(`${window.location.href}${window.location.search.includes('?') ? '&' : '?'}standalone=themebar`, 'ThemeWindow', `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,menubar=no`);
            }}
            className="theme-bar-tab-btn transition-all border-b-2 border-transparent text-white/40 hover:text-white hover:bg-white/[0.05] py-3"
            title="POP OUT: Opens the theme studio in a dedicated standalone window for multi-monitor workflows."
          >
            <div className="flex flex-col items-center gap-1">
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="text-[7px] font-black uppercase tracking-widest">Pop</span>
            </div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar no-scrollbar pb-10">

          {activeTab === 'themes' && (
            <div className="animate-in fade-in duration-300">

              <div className="relative border-b border-white/5 group/gallery">
                {/* Pagination Dots (Upper Center) */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-1.5 transition-opacity duration-300 opacity-30 group-hover/gallery:opacity-100 z-30">
                  {Array.from({ length: totalSlides }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => scrollToSlide(i)}
                      className={`w-1 h-1 rounded-full transition-all duration-300 ${slideIndex === i ? 'bg-white w-2' : 'bg-white/10 hover:bg-white/30'}`}
                    />
                  ))}
                </div>

                {/* Left Arrow */}
                <button
                  onClick={() => scrollToSlide(slideIndex > 0 ? slideIndex - 1 : totalSlides - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/5 text-white/10 hover:text-white transition-all z-20"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div 
                  ref={setGalleryRef}
                  onScroll={handleScroll}
                  className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth"
                >
                  {Array.from({ length: totalSlides }).map((_, slideIdx) => (
                    <div 
                      key={slideIdx} 
                      className="w-full flex-shrink-0 flex items-center justify-center gap-6 py-8 px-6 snap-center"
                    >
                      {THEME_PRESETS.slice(slideIdx * itemsPerSlide, (slideIdx + 1) * itemsPerSlide).map((t) => (
                        <button
                          key={t.id}
                          onClick={() => dispatch({ type: 'SET_UI', theme: t.id })}
                          className="flex-shrink-0 flex flex-col items-center gap-3 group relative w-[72px]"
                        >
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${layoutConfig.theme === t.id ? 'scale-110' : 'opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0'}`}>
                            <div className="absolute inset-0 blur-xl opacity-40 rounded-full" style={{ backgroundColor: t.color }} />
                            <img
                              src="/kilang/kilang_5_nobg_noring2.png"
                              className="w-10 h-10 relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                              alt={t.label}
                            />
                          </div>
                          <span className={`text-[8px] font-black uppercase tracking-widest text-white transition-opacity text-center w-full truncate px-1 ${layoutConfig.theme === t.id ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>
                            {t.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Right Arrow */}
                <button
                  onClick={() => scrollToSlide(slideIndex < totalSlides - 1 ? slideIndex + 1 : 0)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/5 text-white/10 hover:text-white transition-all z-20"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
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
                        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
                        const themedEls = document.querySelectorAll('[data-theme]');
                        THEME_VARS.forEach(v => {
                          document.documentElement.style.removeProperty(v);
                          themedEls.forEach(el => (el as HTMLElement).style.removeProperty(v));
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
                          targets: ['--kilang-bg-base', '--kilang-bg', '--kilang-card', '--kilang-primary-bg', '--kilang-secondary-bg', '--kilang-accent-bg', '--kilang-tooltip-bg', '--kilang-toast-bg', '--kilang-primary-glow', '--kilang-secondary-glow', '--kilang-accent-glow', '--kilang-overlay-bg', '--kilang-input-bg', '--kilang-ctrl-bg', '--kilang-shadow-color', '--kilang-background-secondary', '--kilang-primary', '--kilang-secondary', '--kilang-accent', '--kilang-primary-active', '--kilang-tooltip-accent', '--kilang-resizer-hover', '--kilang-resizer-active'],
                          activeTargets: ['--kilang-ctrl-active']
                        },
                        {
                          label: 'Borders',
                          type: 'color',
                          targets: ['--kilang-border', '--kilang-primary-border', '--kilang-secondary-border', '--kilang-accent-border', '--kilang-tooltip-border', '--kilang-toast-border', '--kilang-glass', '--kilang-border-std', '--kilang-muted-border', '--kilang-node-border', '--kilang-scrollbar-border'],
                          activeTargets: ['--kilang-ctrl-active-border']
                        },
                        {
                          label: 'Texts',
                          type: 'color',
                          targets: ['--kilang-text', '--kilang-text-muted', '--kilang-primary-text', '--kilang-secondary-text', '--kilang-accent-text', '--kilang-logo-text', '--kilang-tooltip-text', '--kilang-toast-text', '--kilang-metric-text'],
                          activeTargets: ['--kilang-ctrl-active-text']
                        },
                        {
                          label: 'Tree',
                          type: 'color',
                          targets: [
                            '--kilang-tier-1-fill', '--kilang-tier-2-fill', '--kilang-tier-3-fill', '--kilang-tier-4-fill', '--kilang-tier-5-fill', '--kilang-tier-6-fill', '--kilang-tier-7-fill', '--kilang-tier-8-fill', '--kilang-tier-9-fill',
                            '--kilang-tier-1-border', '--kilang-tier-2-border', '--kilang-tier-3-border', '--kilang-tier-4-border', '--kilang-tier-5-border', '--kilang-tier-6-border', '--kilang-tier-7-border', '--kilang-tier-8-border', '--kilang-tier-9-border',
                            '--kilang-tier-1-text', '--kilang-tier-2-text', '--kilang-tier-3-text', '--kilang-tier-4-text', '--kilang-tier-5-text', '--kilang-tier-6-text', '--kilang-tier-7-text', '--kilang-tier-8-text', '--kilang-tier-9-text',
                            '--kilang-link-start', '--kilang-link-mid', '--kilang-link-end'
                          ]
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
                      group: `Weights (${groupVars.weights.length})`,
                      vars: groupVars.weights
                    },
                    {
                      group: `Text & Icons (${groupVars.texts.filter(v => v.name !== '--kilang-ctrl-active-text').length} + ${groupVars.texts.filter(v => v.name === '--kilang-ctrl-active-text').length})`,
                      vars: groupVars.texts
                    },
                    {
                      group: `Structural (${groupVars.structural.length})`,
                      vars: groupVars.structural
                    }
                  ]
                    .map((group) => (
                      <div key={`${layoutConfig.theme}-${group.group}`} className="space-y-2">
                        <button
                          onClick={() => toggleSubsection(group.group)}
                          className="w-full text-left focus:outline-none flex items-center justify-between pr-4 group/stitle"
                        >
                          <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-2 hover:text-white/60 transition-colors uppercase">{group.group}</h4>
                        </button>
                        {!collapsedSubsections.has(group.group) && (
                          <div className="bg-white/[0.03] rounded-[var(--kilang-radius-lg)] border border-white/10 overflow-hidden">
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
                                            const currentValue = overrides[(v as any).targets[0]] || (typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue((v as any).targets[0]).trim() : '');
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
                                          className={`w-3.5 h-3.5 transition-all duration-500 ${isBulbOn ? 'text-white fill-white/20 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] scale-110' : 'text-white/10 fill-transparent'}`}
                                        />
                                      </button>
                                    )}
                                    {v.type === 'color' ? (
                                      <div className="relative flex items-center gap-4">
                                        {((v as any).name?.includes('link-') || 
                                          (v as any).name?.includes('glow') || 
                                          (v as any).name?.includes('glass') || 
                                          (v as any).name?.includes('tooltip') || 
                                          (v as any).name?.includes('toast') ||
                                          (v as any).name?.includes('resizer') ||
                                          (v as any).name?.includes('border-std')) && (
                                          <div className="flex items-center gap-2 pr-2">
                                            <input
                                              type="range" min="0" max="1" step="0.01"
                                              defaultValue={overrides[(v as any).name + '-opacity'] || (typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue((v as any).name + '-opacity').trim() : '1')}
                                              onChange={(e) => updateVariable((v as any).name + '-opacity', e.target.value)}
                                              className="w-12 h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-zinc-400"
                                              title={`${(v as any).label} Intensity`}
                                            />
                                          </div>
                                        )}
                                        <div className="relative flex items-center">
                                          <input
                                            type="color"
                                            defaultValue={overrides[(v as any).name || (v as any).targets?.[0]] || (typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue((v as any).name || (v as any).targets?.[0]).trim() : '#000000')}
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
                                          <div
                                            className="w-6 h-6 rounded-lg border border-white/20 shadow-xl transition-transform group-hover:scale-110"
                                            style={{
                                              backgroundColor: getHonestColor(
                                                (v as any).name || (v as any).targets?.[0],
                                                overrides[(v as any).name || (v as any).targets?.[0]] || `var(${(v as any).name || (v as any).targets?.[0]})`
                                              )
                                            }}
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        {(v as any).name?.includes('-w-') && (
                                          <div className="flex items-center gap-1">
                                            <input
                                              type="range" min="0" max="20" step="1"
                                              value={parseInt(overrides[(v as any).name] || (typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue((v as any).name).trim() : '0'))}
                                              onChange={(e) => updateVariable((v as any).name, `${e.target.value}px`)}
                                              className="w-12 h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-zinc-400"
                                            />
                                          </div>
                                        )}
                                        <input
                                          type="text"
                                          value={overrides[(v as any).name] || (typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue((v as any).name).trim() : '')}
                                          onChange={(e) => updateVariable((v as any).name, e.target.value)}
                                          className="w-10 bg-transparent border-0 text-right text-[10px] text-white/60 focus:text-white focus:outline-none font-mono"
                                        />
                                      </div>
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
                      className={`w-full text-left py-4 px-5 rounded-2xl border transition-all group ${landingVersion === v.id ? 'bg-white/10 border-white/40 shadow-lg' : 'bg-white/[0.04] border-white/10 hover:border-white/20'}`}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${landingVersion === v.id ? 'bg-white text-black' : 'bg-white/10 text-white group-hover:bg-white/20'}`}>
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
                      className={`flex items-center justify-center py-3 rounded-xl transition-all ${logoStyle === style.id ? 'bg-white text-black shadow-lg font-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
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
                      className="flex-grow h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-zinc-400 hover:bg-white/10 transition-all"
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
                        className="flex-grow h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-zinc-400 hover:bg-white/10 transition-all"
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
                          className="flex-grow h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-zinc-400 hover:bg-white/10 transition-all"
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

          {activeTab === 'tree' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 py-4 px-2 space-y-8">
              <div className="flex items-center justify-between px-5 mb-2">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Tree Configuration</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (confirm("Reset all tree layout and aesthetic settings to defaults?")) {
                        dispatch({ type: 'RESET_LAYOUT_CONFIG' });
                      }
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all group/reset"
                    title="RESET TREE: Restores all layout, geometry, and tier aesthetics to defaults."
                  >
                    <RotateCcw className="w-3.5 h-3.5 group-hover/reset:rotate-[-45deg] transition-transform" />
                  </button>
                  <button
                    onClick={() => {
                      const config = layoutConfig;
                      localStorage.setItem('kilang-tree-config', JSON.stringify(config));
                      alert("Tree Configuration Saved!");
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all group/save"
                    title="SAVE TREE: Persists current layout and aesthetic configuration."
                  >
                    <Save className="w-3.5 h-3.5 group-hover/save:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
              {[
                {
                  id: 'spacing',
                  label: 'Layout Spacing',
                  icon: SlidersHorizontal,
                  controls: [
                    { label: 'Tier (H)', key: 'interTierGap', min: 10, max: 600, step: 10, unit: 'px' },
                    { label: 'Row (V)', key: 'interRowGap', min: 10, max: 600, step: 5, unit: 'px' },
                    { label: '0-1 Gap', key: 'rootGap', min: 0, max: 600, step: 10, unit: 'px' },
                  ]
                },
                {
                  id: 'paths',
                  label: 'SVG Connections',
                  icon: PencilLine,
                  controls: [
                    { label: 'Gap X', key: 'lineGapX', min: -100, max: 300, step: 5, unit: 'px' },
                    { label: 'Gap Y', key: 'lineGapY', min: -100, max: 300, step: 5, unit: 'px' },
                    { label: 'Thickness', key: 'lineWidth', min: 0.5, max: 12, step: 0.1, unit: 'px' },
                    { label: 'Curvature', key: 'lineTension', min: 0, max: 2, step: 0.1, unit: 'x' },
                    { label: 'Opacity', key: 'lineOpacity', min: 0, max: 1, step: 0.05, unit: '' },
                    { label: 'Blur/Glow', key: 'lineBlur', min: 0, max: 20, step: 0.5, unit: 'px' },
                    { label: 'Dash Pattern', key: 'lineDashArray', min: 0, max: 30, step: 1, unit: 'px' },
                    { label: 'Flow Speed', key: 'lineFlowSpeed', min: 0, max: 10, step: 0.5, unit: 'x' },
                  ]
                },
                {
                  id: 'geometry',
                  label: 'Node Geometry',
                  icon: Scaling,
                  controls: [
                    { label: 'Size', key: 'nodeSize', min: 0.5, max: 2, step: 0.1, unit: 'x' },
                    { label: 'Opacity', key: 'nodeOpacity', min: 0.1, max: 1, step: 0.05, unit: '' },
                    { label: 'Word Width', key: 'nodeWidth', min: 80, max: 250, step: 5, unit: 'px' },
                    { label: 'Vert Padding', key: 'nodePaddingY', min: 4, max: 32, step: 1, unit: 'px' },
                    { label: 'Root Border', key: 'rootBorderWidth', min: 0, max: 20, step: 1, unit: 'px' },
                    { label: 'Accent Border', key: 'accentBorderWidth', min: 0, max: 20, step: 1, unit: 'px' },
                  ]
                },
                {
                  id: 'anchors',
                  label: 'Root Anchor',
                  icon: Maximize2,
                  controls: [
                    { label: 'X (px)', key: 'anchorX', min: 0, max: 2000, step: 10, unit: 'px' },
                    { label: 'Y (px)', key: 'anchorY', min: 0, max: 2000, step: 10, unit: 'px' },
                  ]
                }
              ].map((section) => (
                <div key={section.id} className="space-y-3">
                  <SectionHeader
                    id={section.id}
                    label={section.label}
                    icon={section.icon}
                    actions={
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const defaults: Record<string, any> = {
                            spacing: { interTierGap: 80, interRowGap: 50, rootGap: 50, spacingMode: 'log', coupleGaps: false },
                            paths: { lineGapX: 0, lineGapY: 0, lineWidth: 3, lineOpacity: 0.4, lineBlur: 0, lineTension: 1, lineDashArray: 0, lineFlowSpeed: 0 },
                            geometry: { nodeSize: 1, nodeOpacity: 1, nodeWidth: 100, nodePaddingY: 8, showIcons: false },
                            anchors: { anchorX: 2000, anchorY: 2000 }
                          };
                          if (defaults[section.id]) {
                            dispatch({ type: 'SET_LAYOUT_CONFIG', config: defaults[section.id] });
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/20 hover:text-white transition-all"
                        title={`Reset ${section.label} to defaults`}
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    }
                  />
                  {expandedSections.has(section.id) && (
                    <div className="bg-white/[0.03] rounded-[var(--kilang-radius-lg)] border border-white/10 overflow-hidden ml-2 pr-2">
                      {section.controls.map((c) => (
                        <div key={c.key} className="flex items-center justify-between py-2.5 px-4 group hover:bg-white/[0.02] transition-all border-b border-white/5 last:border-0">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/50 group-hover:text-white/80 transition-colors">{c.label}</span>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={c.min}
                              max={c.max}
                              step={c.step}
                              value={(layoutConfig as any)[c.key] || 0}
                              onChange={(e) => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { [c.key]: parseFloat(e.target.value) } })}
                              className="w-24 h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-zinc-400 hover:bg-white/10"
                            />
                            <span className="w-8 text-right text-[10px] font-mono text-white/30 group-hover:text-white transition-opacity">
                              {(layoutConfig as any)[c.key]}
                              <span className="text-[8px] ml-0.5 opacity-40">{c.unit}</span>
                            </span>
                          </div>
                        </div>
                      ))}
                      {section.id === 'spacing' && (
                        <>
                          <div className="flex items-center justify-between py-2.5 px-4 bg-white/5 mt-1 border-t border-white/10">
                            <span className="text-[9px] font-black uppercase text-white/30">Spacing Mode</span>
                            <button 
                              onClick={() => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { spacingMode: layoutConfig.spacingMode === 'even' ? 'log' : 'even' } })} 
                              className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${layoutConfig.spacingMode === 'log' ? 'bg-white text-black' : 'text-white/40 hover:bg-white/5'}`}
                            >
                              {layoutConfig.spacingMode === 'even' ? 'Even' : 'Log'}
                            </button>
                          </div>
                          <div className="flex items-center justify-between py-2.5 px-4 bg-white/5 border-t border-white/10">
                            <span className="text-[9px] font-black uppercase text-white/30">Coupled Gaps</span>
                            <button 
                              onClick={() => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { coupleGaps: !layoutConfig.coupleGaps } })} 
                              className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${layoutConfig.coupleGaps ? 'bg-white text-black' : 'text-white/40 hover:bg-white/5'}`}
                            >
                              {layoutConfig.coupleGaps ? 'Coupled' : 'Decoupled'}
                            </button>
                          </div>
                        </>
                      )}
                      {section.id === 'geometry' && (
                        <div className="flex items-center justify-between py-2.5 px-4 bg-white/5 mt-1 border-t border-white/10">
                          <span className="text-[9px] font-black uppercase text-white/30">Tree Icons</span>
                          <button 
                            onClick={() => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { showIcons: !layoutConfig.showIcons } })} 
                            className={`flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${layoutConfig.showIcons ? 'bg-white text-black' : 'text-white/40 hover:bg-white/5'}`}
                          >
                            {layoutConfig.showIcons ? <Zap className="w-3 h-3" /> : <ZapOff className="w-3 h-3" />}
                            {layoutConfig.showIcons ? 'Visible' : 'Hidden'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              <div className="space-y-3">
                <SectionHeader 
                  id="colors" 
                  label="Nodes Colors" 
                  icon={Palette} 
                  actions={
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const tierDefaults: Record<string, any> = {};
                        for (let i = 1; i <= 9; i++) {
                          tierDefaults[`tier${i}Fill`] = `var(--kilang-tier-${i}-fill)`;
                          tierDefaults[`tier${i}Border`] = `var(--kilang-tier-${i}-border)`;
                        }
                        tierDefaults.lineColor = 'var(--kilang-primary)';
                        tierDefaults.lineColorMid = 'var(--kilang-secondary)';
                        tierDefaults.lineGradientEnd = 'var(--kilang-accent)';
                        dispatch({ type: 'SET_LAYOUT_CONFIG', config: tierDefaults });
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/20 hover:text-white transition-all"
                      title="Reset Colors to defaults"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  }
                />
                {expandedSections.has('colors') && (
                  <div className="space-y-6 ml-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex flex-col gap-6 px-2">
                       {/* Intensity & Technical Note Stack */}
                       <div className="space-y-3">
                         <div className="text-[10px] text-white/30 font-mono uppercase tracking-[0.2em] ml-1">vars(--kilang-tier-n-fill/border/text)</div>
                         <div className="flex flex-col gap-3">
                           {/* Intensity */}
                           <div className="flex items-center justify-between bg-white/5 px-4 py-3 rounded-2xl border border-white/10 group/intensity">
                              <div className="flex flex-col">
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] group-hover/intensity:text-white/80 transition-colors">Node Intensity</span>
                                <span className="text-[8px] font-mono text-white/20">--kilang-node-intensity</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono text-white/20">{overrides['--kilang-node-intensity'] || '1.0'}</span>
                                <input
                                  type="range" min="0" max="5" step="0.1"
                                  defaultValue={overrides['--kilang-node-intensity'] || (typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--kilang-node-intensity').trim() : '1')}
                                  onChange={(e) => updateVariable('--kilang-node-intensity', e.target.value)}
                                  className="w-32 h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-zinc-400 hover:bg-white/10"
                                />
                              </div>
                           </div>
                           {/* Rounding T1 */}
                           <div className="flex items-center justify-between bg-white/5 px-4 py-3 rounded-2xl border border-white/10 group/rounding-t1">
                              <div className="flex flex-col">
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] group-hover/rounding-t1:text-white/80 transition-colors">Rounding T1</span>
                                <span className="text-[8px] font-mono text-white/20">tier1Rounding</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono text-white/20">{layoutConfig.tier1Rounding}px</span>
                                <input
                                  type="range" min="0" max="100" step="1"
                                  value={layoutConfig.tier1Rounding}
                                  onChange={(e) => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { tier1Rounding: parseInt(e.target.value) } })}
                                  className="w-32 h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-zinc-400 hover:bg-white/10"
                                />
                              </div>
                           </div>
                           {/* Rounding T2+ */}
                           <div className="flex items-center justify-between bg-white/5 px-4 py-3 rounded-2xl border border-white/10 group/rounding-t2">
                              <div className="flex flex-col">
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] group-hover/rounding-t2:text-white/80 transition-colors">Rounding T2+</span>
                                <span className="text-[8px] font-mono text-white/20">tier2-9Rounding</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono text-white/20">{layoutConfig.tier2Rounding}px</span>
                                <input
                                  type="range" min="0" max="100" step="1"
                                  value={layoutConfig.tier2Rounding}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    const update: any = {};
                                    for (let t = 2; t <= 9; t++) update[`tier${t}Rounding`] = val;
                                    dispatch({ type: 'SET_LAYOUT_CONFIG', config: update });
                                  }}
                                  className="w-32 h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-zinc-400 hover:bg-white/10"
                                />
                              </div>
                           </div>
                         </div>
                       </div>

                       {/* High-Fidelity Table */}
                       <div className="overflow-hidden">
                         <table className="w-full border-collapse">
                           <thead>
                             <tr className="border-b border-white/10">
                               <th className="py-3 text-[10px] font-black uppercase text-white tracking-[0.2em] w-12 text-center">Tier</th>
                               <th className="py-3 text-[10px] font-black uppercase text-white tracking-[0.2em] text-center">Fill</th>
                               <th className="py-3 text-[10px] font-black uppercase text-white tracking-[0.2em] text-center">Border</th>
                               <th className="py-3 text-[10px] font-black uppercase text-white tracking-[0.2em] text-center">Text</th>
                             </tr>
                           </thead>
                           <tbody className="divide-y divide-white/[0.03]">
                             {/* Master "All" Row */}
                             <tr className="group/row bg-white/[0.04] transition-colors">
                               <td className="py-2 text-center">
                                 <div className="text-[10px] font-black text-white uppercase tracking-widest">
                                   All
                                 </div>
                               </td>
                               {[
                                 { key: 'allFill', type: 'fill' },
                                 { key: 'allBorder', type: 'border' },
                                 { key: 'allText', type: 'text' }
                               ].map((col, i) => (
                                 <td key={i} className="py-2 px-1 text-center">
                                   <div className="flex flex-col items-center gap-1.5">
                                     <div 
                                       className="w-8 h-8 rounded-xl border border-white/20 shadow-xl relative group/swatch overflow-hidden transition-transform hover:scale-110 active:scale-95"
                                       style={{ 
                                         backgroundColor: col.type === 'fill' 
                                           ? layoutConfig.tier1Fill 
                                           : col.type === 'border' 
                                             ? layoutConfig.tier1Border 
                                             : (overrides['--kilang-tier-1-text'] || (typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--kilang-tier-1-text').trim() : '#ffffff'))
                                       }}
                                     >
                                       <input
                                         type="color"
                                         value={
                                           (col.type === 'fill' ? layoutConfig.tier1Fill : col.type === 'border' ? layoutConfig.tier1Border : (overrides['--kilang-tier-1-text'] || (typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--kilang-tier-1-text').trim() : '#ffffff'))).startsWith('var') ? '#ffffff' : (col.type === 'fill' ? layoutConfig.tier1Fill : col.type === 'border' ? layoutConfig.tier1Border : (overrides['--kilang-tier-1-text'] || (typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--kilang-tier-1-text').trim() : '#ffffff')))
                                         }
                                         onChange={(e) => {
                                           const color = e.target.value;
                                           if (col.type === 'fill') {
                                             const update: any = {};
                                             for (let t = 1; t <= 9; t++) update[`tier${t}Fill`] = color;
                                             dispatch({ type: 'SET_LAYOUT_CONFIG', config: update });
                                           } else if (col.type === 'border') {
                                             const update: any = {};
                                             for (let t = 1; t <= 9; t++) update[`tier${t}Border`] = color;
                                             dispatch({ type: 'SET_LAYOUT_CONFIG', config: update });
                                           } else {
                                             const mapping: Record<string, string> = {};
                                             for (let t = 1; t <= 9; t++) mapping[`--kilang-tier-${t}-text`] = color;
                                             updateVariables(mapping);
                                           }
                                         }}
                                         className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                       />
                                     </div>
                                     <input
                                       type="text"
                                       placeholder="HEX"
                                       onChange={(e) => {
                                         const color = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                                         if (color.length >= 4) {
                                           if (col.type === 'fill') {
                                             const update: any = {};
                                             for (let t = 1; t <= 9; t++) update[`tier${t}Fill`] = color;
                                             dispatch({ type: 'SET_LAYOUT_CONFIG', config: update });
                                           } else if (col.type === 'border') {
                                             const update: any = {};
                                             for (let t = 1; t <= 9; t++) update[`tier${t}Border`] = color;
                                             dispatch({ type: 'SET_LAYOUT_CONFIG', config: update });
                                           } else {
                                             const mapping: Record<string, string> = {};
                                             for (let t = 1; t <= 9; t++) mapping[`--kilang-tier-${t}-text`] = color;
                                             updateVariables(mapping);
                                           }
                                         }
                                       }}
                                       className="w-14 bg-transparent border-0 text-[7px] font-mono text-white/20 text-center hover:text-white/40 focus:text-white outline-none uppercase tracking-tighter transition-colors"
                                     />
                                   </div>
                                 </td>
                               ))}
                             </tr>

                             {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((tier) => (
                               <tr key={tier} className="group/row hover:bg-white/[0.01] transition-colors">
                                 <td className="py-1.5 text-center">
                                   <div className="text-[11px] font-black text-white">
                                     {tier}
                                   </div>
                                 </td>
                                 {[
                                   { key: `tier${tier}Fill`, mode: 'config' },
                                   { key: `tier${tier}Border`, mode: 'config' },
                                   { key: `--kilang-tier-${tier}-text`, mode: 'var' }
                                 ].map((col, i) => {
                                   const val = col.mode === 'config' 
                                     ? (layoutConfig as any)[col.key] 
                                     : (overrides[col.key] || (typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue(col.key).trim() : '#ffffff'));
                                   
                                   return (
                                     <td key={i} className="py-1.5 px-1">
                                       <div className="flex flex-col items-center gap-2">
                                         <div 
                                           className="w-8 h-8 rounded-xl border border-white/10 shadow-lg relative group/swatch overflow-hidden transition-transform hover:scale-110 active:scale-95"
                                           style={{ backgroundColor: val }}
                                         >
                                           <input
                                             type="color"
                                             value={val.startsWith('var') ? (typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue(val.replace('var(', '').replace(')', '')).trim() || '#ffffff' : '#ffffff') : val}
                                             onChange={(e) => {
                                               if (col.mode === 'config') {
                                                 dispatch({ type: 'SET_LAYOUT_CONFIG', config: { [col.key]: e.target.value } });
                                               } else {
                                                 updateVariable(col.key, e.target.value);
                                               }
                                             }}
                                             className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                           />
                                           <div className="absolute inset-0 bg-white/0 group-hover/swatch:bg-white/10 transition-colors pointer-events-none" />
                                         </div>
                                         <input
                                           type="text"
                                           value={(val.startsWith('var') ? (typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue(val.replace('var(', '').replace(')', '')).trim() : val) : val).toUpperCase()}
                                           onChange={(e) => {
                                             const newVal = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                                             if (col.mode === 'config') {
                                               dispatch({ type: 'SET_LAYOUT_CONFIG', config: { [col.key]: newVal } });
                                             } else {
                                               updateVariable(col.key, newVal);
                                             }
                                           }}
                                           className="w-14 bg-transparent border-0 text-[8px] font-mono text-white/30 text-center hover:text-white/60 focus:text-white outline-none uppercase tracking-tighter transition-colors"
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
                    </div>
                    
                    <div className="p-4 bg-white/[0.05] border border-white/10 rounded-2xl space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                           <span className="text-[8px] font-black uppercase text-white/30 tracking-widest">Link Start</span>
                           <input type="color" value={layoutConfig.lineColor} onChange={(e) => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { lineColor: e.target.value } })} className="w-full h-8 rounded-lg bg-transparent cursor-pointer" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                           <span className="text-[8px] font-black uppercase text-white/30 tracking-widest">Link Mid</span>
                           <input type="color" value={layoutConfig.lineColorMid} onChange={(e) => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { lineColorMid: e.target.value } })} className="w-full h-8 rounded-lg bg-transparent cursor-pointer" />
                        </div>
                        <div className="flex flex-col gap-1.5 col-span-2">
                           <span className="text-[8px] font-black uppercase text-white/30 tracking-widest">Link End</span>
                           <input type="color" value={layoutConfig.lineGradientEnd} onChange={(e) => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { lineGradientEnd: e.target.value } })} className="w-full h-8 rounded-lg bg-transparent cursor-pointer" />
                        </div>
                      </div>
                    </div>
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
