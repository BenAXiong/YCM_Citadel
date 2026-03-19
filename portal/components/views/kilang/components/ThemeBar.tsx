'use client';

import React from 'react';
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
  Aperture,
  RotateCcw,
  ChevronDown,
  ChevronLeft
} from 'lucide-react';

import { KilangAction, KilangState } from '../kilangReducer';

interface ThemeBarProps {
  show: boolean;
  onClose: () => void;
  activeTab: 'themes' | 'landing' | 'fonts';
  setActiveTab: (tab: 'themes' | 'landing' | 'fonts') => void;
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
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set(['global', 'presets']));

  React.useEffect(() => {
    const saved = localStorage.getItem('kilang-custom-theme');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.entries(parsed).forEach(([key, val]) => {
          document.documentElement.style.setProperty(key, val as string);
        });
      } catch (e) {
        console.error('Failed to parse saved theme', e);
      }
    }
  }, []);

  const toggleSection = (id: string) => {
    const newSet = new Set(expandedSections);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedSections(newSet);
  };

  if (!show) return null;

  const SectionHeader = ({ id, label, icon: Icon }: { id: string; label: string; icon: any }) => (
    <button
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between p-5 bg-white/[0.03] hover:bg-white/[0.06] transition-all border-y border-white/5 group"
    >
      <div className="flex items-center gap-4">
        <Icon className={`w-4 h-4 ${expandedSections.has(id) ? 'text-[var(--kilang-primary)]' : 'text-white'}`} />
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white group-hover:text-white">{label}</span>
      </div>
      <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-300 ${expandedSections.has(id) ? 'rotate-180' : ''}`} />
    </button>
  );

  return (
    <div className="fixed top-16 left-0 bottom-0 w-82 z-[2000] animate-in slide-in-from-left-full duration-500 theme-bar-bnw">
      <div className="h-full flex flex-col overflow-hidden relative">
        
        {/* Collapsing Chevron - FIXED POSITIONING */}
        <button
          onClick={onClose}
          className="absolute -right-6 top-1/2 -translate-y-1/2 w-8 h-12 bg-black border border-white/10 rounded-r-xl flex items-center justify-center hover:bg-white/10 transition-all group z-[2001] shadow-2xl"
          style={{ clipPath: 'inset(-20px -20px -20px 0px)' }}
        >
          <ChevronLeft className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
        </button>

        {/* Top Labs (Enlarged & Capitalized) */}
        <div className="grid grid-cols-3 bg-white/[0.02] border-b border-white/10">
          {(['themes', 'landing', 'fonts'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`theme-bar-tab-btn transition-all border-b-2 ${activeTab === tab ? 'border-[var(--kilang-primary)] text-white bg-white/[0.05]' : 'border-transparent text-white/60 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar no-scrollbar pb-10">
          
          {activeTab === 'themes' && (
            <div className="animate-in fade-in duration-300">
              
              {/* SECTION: PRESETS (3 Circles next to each other) */}
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

              {/* SECTION: GLOBAL (COLORS) */}
              <SectionHeader id="global" label="Global" icon={Palette} />
              {expandedSections.has('global') && (
                <div className="p-5 space-y-8">
                   {/* Action Buttons */}
                   <div className="grid grid-cols-2 gap-3 mb-4">
                      <button
                        onClick={() => {
                          const vars = [
                            '--kilang-primary', '--kilang-primary-active', '--kilang-secondary', '--kilang-accent',
                            '--kilang-bg-base', '--kilang-bg', '--kilang-card', '--kilang-text', '--kilang-glass', '--kilang-border'
                          ];
                          vars.forEach(v => document.documentElement.style.removeProperty(v));
                          localStorage.removeItem('kilang-custom-theme');
                          alert('Reset to theme defaults.');
                        }}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-white/60 group-hover:rotate-[-45deg] transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Reset All</span>
                      </button>
                      <button
                        onClick={() => {
                          const vars = [
                            '--kilang-primary', '--kilang-primary-active', '--kilang-secondary', '--kilang-accent',
                            '--kilang-bg-base', '--kilang-bg', '--kilang-card', '--kilang-text', '--kilang-glass', '--kilang-border',
                            '--kilang-radius-md'
                          ];
                          const saved: Record<string, string> = {};
                          vars.forEach(v => {
                            const val = document.documentElement.style.getPropertyValue(v);
                            if (val) saved[v] = val;
                          });
                          localStorage.setItem('kilang-custom-theme', JSON.stringify(saved));
                          alert('Theme saved locally!');
                        }}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--kilang-primary)]/20 hover:bg-[var(--kilang-primary)]/30 border border-[var(--kilang-primary)]/40 transition-all"
                      >
                        <Square className="w-3.5 h-3.5 text-[var(--kilang-primary)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Save Preset</span>
                      </button>
                   </div>

                  {[
                    {
                      group: 'Core Palette',
                      vars: [
                        { name: '--kilang-primary', label: 'Primary', type: 'color' },
                        { name: '--kilang-primary-active', label: 'Active', type: 'color' },
                        { name: '--kilang-secondary', label: 'Secondary', type: 'color' },
                        { name: '--kilang-accent', label: 'Accent', type: 'color' }
                      ]
                    },
                    {
                      group: 'Environment',
                      vars: [
                        { name: '--kilang-bg-base', label: 'Base BG', type: 'color' },
                        { name: '--kilang-bg', label: 'Surface', type: 'color' },
                        { name: '--kilang-card', label: 'Card', type: 'color' }
                      ]
                    },
                    {
                      group: 'Text & Shape',
                      vars: [
                        { name: '--kilang-text', label: 'Text', type: 'color' },
                        { name: '--kilang-glass', label: 'Glass', type: 'text' },
                        { name: '--kilang-border', label: 'Border', type: 'text' },
                        { name: '--kilang-radius-md', label: 'Radius', type: 'text' }
                      ]
                    }
                  ].map((group) => (
                    <div key={group.group} className="space-y-3">
                       <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">{group.group}</h4>
                       <div className="grid grid-cols-1 gap-2">
                         {group.vars.map((v) => (
                           <div key={v.name} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/10 group hover:border-white/20 transition-all">
                              <div className="flex flex-col">
                                 <span className="text-[11px] font-bold text-white tracking-wide">{v.label}</span>
                                 <span className="text-[8px] font-mono text-white/30 lowercase tracking-tighter">{v.name}</span>
                              </div>
                              <div className="relative group">
                                {v.type === 'color' ? (
                                  <input 
                                    type="color"
                                    defaultValue={getComputedStyle(document.documentElement).getPropertyValue(v.name).trim()}
                                    onChange={(e) => document.documentElement.style.setProperty(v.name, e.target.value)}
                                    className="w-10 h-6 bg-transparent border-0 cursor-pointer opacity-0 absolute inset-0 z-10"
                                  />
                                ) : (
                                  <input 
                                    type="text"
                                    defaultValue={getComputedStyle(document.documentElement).getPropertyValue(v.name).trim()}
                                    onChange={(e) => document.documentElement.style.setProperty(v.name, e.target.value)}
                                    className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-[9px] text-white focus:outline-none focus:border-[var(--kilang-primary)]"
                                  />
                                )}
                                {v.type === 'color' && (
                                  <div className="w-8 h-8 rounded-xl border border-white/20 shadow-xl transition-transform group-hover:scale-110" style={{ backgroundColor: `var(${v.name})` }} />
                                )}
                              </div>
                           </div>
                         ))}
                       </div>
                    </div>
                  ))}
                  
                  {/* Export Button */}
                  <button
                    onClick={() => {
                        const vars = [
                            '--kilang-primary', '--kilang-primary-active', '--kilang-secondary', '--kilang-accent',
                            '--kilang-bg-base', '--kilang-bg', '--kilang-card', '--kilang-text', '--kilang-glass', '--kilang-border',
                            '--kilang-radius-md'
                          ];
                        const styles = vars.map(v => `  ${v}: ${getComputedStyle(document.documentElement).getPropertyValue(v).trim()};`).join('\n');
                        const css = `:root {\n${styles}\n}`;
                        console.log(css);
                        alert("CSS Exported to Console! You can copy it into Kilang.css.");
                    }}
                    className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all"
                  >
                    Export Custom Theme CSS
                  </button>
                </div>
              )}

              {/* SECTION: TREE (STRUCTURE) */}
              <SectionHeader id="tree" label="Tree" icon={CircleDot} />
              {expandedSections.has('tree') && (
                <div className="p-5 space-y-6">
                  {[
                    { label: 'Root Gap', value: layoutConfig.rootGap, key: 'rootGap', min: 20, max: 100 },
                    { label: 'Line Width', value: layoutConfig.lineWidth, key: 'lineWidth', min: 1, max: 8 }
                  ].map((s) => (
                    <div key={s.key} className="space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.15em] text-white">
                         <span>{s.label}</span>
                         <span className="font-mono text-[var(--kilang-primary)]">{s.value}px</span>
                      </div>
                      <input
                        type="range"
                        min={s.min}
                        max={s.max}
                        step={1}
                        value={s.value}
                        onChange={(e) => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { [s.key]: parseInt(e.target.value) } })}
                        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[var(--kilang-primary)]"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* SECTION: LOGO (HEADER LOGO CONTROLLER - BLANK FOR NOW) */}
              <SectionHeader id="logo" label="Header Logo (Controller)" icon={Square} />
              {expandedSections.has('logo') && (
                <div className="p-12 text-center text-white italic text-[11px] uppercase tracking-widest opacity-40">
                   Header Logo Controls Coming Soon
                </div>
              )}

              {/* SECTION: ANIMATION */}
              <SectionHeader id="animation" label="Animation" icon={RotateCcw} />
              {expandedSections.has('animation') && (
                <div className="p-12 text-center text-white italic text-[11px] uppercase tracking-widest opacity-40">
                  Motion Engine Ready
                </div>
              )}
            </div>
          )}

          {activeTab === 'landing' && (
            <div className="space-y-10 p-5 animate-in fade-in duration-500">
              {/* Landing Presets (Verbatim Restoration) */}
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
                      className={`w-full text-left p-6 rounded-2xl border transition-all group ${landingVersion === v.id ? 'bg-[var(--kilang-primary)]/20 border-[var(--kilang-primary)] shadow-lg' : 'bg-white/[0.04] border-white/10 hover:border-white/20'}`}
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

              {/* Logo Treatment (Verbatim Restoration) */}
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

              {/* Logo Tuning (Verbatim Restoration) */}
              <div className="space-y-6 p-6 rounded-3xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Logo Tuning</h3>
                  <button onClick={resetLogoSettings} className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-all group">
                    <RotateCcw className="w-4 h-4 group-hover:rotate-[-45deg] transition-transform duration-300" />
                  </button>
                </div>

                {[
                  { label: 'Scale', value: logoSettings.scale, key: 'scale', min: 0.5, max: 3, step: 0.05 },
                  { label: 'Opacity', value: logoSettings.opacity, key: 'opacity', min: 0, max: 1, step: 0.05 },
                  { label: 'Radius', value: logoSettings.radius, key: 'radius', min: 0, max: 100, step: 1 }
                ].map((s) => (
                  <div key={s.key} className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                       <span>{s.label}</span>
                       <span className="text-white font-mono">{s.value}</span>
                    </div>
                    <input
                      type="range"
                      min={s.min}
                      max={s.max}
                      step={s.step}
                      value={s.value}
                      onChange={(e) => updateLogoSettings({ [s.key]: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[var(--kilang-primary)]"
                    />
                  </div>
                ))}
                
                {landingVersion !== 1 && (
                  <div className="space-y-6 border-t border-white/10 pt-6 mt-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                         <span>Glow Intensity</span>
                         <span className="text-white font-mono">{(logoSettings.glowIntensity * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={logoSettings.glowIntensity}
                        onChange={(e) => updateLogoSettings({ glowIntensity: parseFloat(e.target.value) })}
                        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[var(--kilang-primary)]"
                      />
                    </div>
                    {landingVersion === 3 && (
                       <div className="space-y-3">
                         <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                            <span>X Offset</span>
                            <span className="text-white font-mono">{logoSettings.xOffset}px</span>
                         </div>
                         <input
                           type="range"
                           min="-400"
                           max="436"
                           step="1"
                           value={logoSettings.xOffset}
                           onChange={(e) => updateLogoSettings({ xOffset: parseInt(e.target.value) })}
                           className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[var(--kilang-primary)]"
                         />
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

        </div>

        {/* Footer */}
        <div className="p-6 bg-white/[0.02] border-t border-white/10">
          <div className="flex items-center justify-center gap-4 text-[9px] font-black uppercase tracking-widest text-white/20">
            <span>Core v1.0</span>
            <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
            <span>Diagnostic Build</span>
          </div>
        </div>
      </div>
    </div>
  );
};
