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
  Aperture
} from 'lucide-react';

interface ThemeBarProps {
  show: boolean;
  onClose: () => void;
  landingVersion: number;
  setLandingVersion: (v: 1 | 2 | 3) => void;
  logoStyle: 'original' | 'square' | 'round';
  setLogoStyle: (s: 'original' | 'square' | 'round') => void;
  logoSettings: { scale: number; radius: number; xOffset: number; opacity: number; glowIntensity: number; glowColor: string };
  updateLogoSettings: (settings: { scale?: number; radius?: number; xOffset?: number; opacity?: number; glowIntensity?: number; glowColor?: string }) => void;
}

export const ThemeBar = ({
  show,
  onClose,
  landingVersion,
  setLandingVersion,
  logoStyle,
  setLogoStyle,
  logoSettings,
  updateLogoSettings
}: ThemeBarProps) => {
  const [activeTab, setActiveTab] = React.useState<'themes' | 'landing' | 'fonts'>('landing');

  if (!show) return null;

  return (
    <div className="fixed top-16 left-0 bottom-0 w-84 z-[2000] animate-in slide-in-from-left-full duration-500">
      <div className="h-full bg-[#020617]/95 backdrop-blur-3xl border-r border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Palette className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Theme Engine</h2>
              <p className="text-[7px] font-black uppercase tracking-widest text-kilang-text-muted mt-0.5">Visual Diagnostics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg text-kilang-text-muted hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 m-4 bg-black/20 rounded-xl border border-white/5">
          {(['themes', 'landing', 'fonts'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar no-scrollbar">
          {activeTab === 'landing' && (
            <div className="space-y-8">
              {/* Landing Presets */}
              <div className="space-y-3">
                <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-400 opacity-60 ml-1">Landing Presets</h3>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: 1, label: 'Classic Logo', desc: 'Centered kiln mark on neutral focus.', icon: <Monitor className="w-4 h-4" /> },
                    { id: 2, label: 'Ethereal Fill', desc: 'Background immersion with faded mark.', icon: <Layers className="w-4 h-4" /> },
                    { id: 3, label: 'Dual Pillars', desc: 'Symmetric border-pinned architecture.', icon: <SidebarIcon className="w-4 h-4" /> }
                  ].map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setLandingVersion(v.id as any)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all group ${landingVersion === v.id ? 'bg-blue-600/10 border-blue-500/50 shadow-lg' : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${landingVersion === v.id ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-white/5 text-kilang-text-muted group-hover:text-white'}`}>
                          {v.icon}
                        </div>
                        <div>
                          <div className={`text-[10px] font-black uppercase tracking-widest transition-colors ${landingVersion === v.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{v.label}</div>
                          <div className="text-[8px] text-kilang-text-muted mt-1 leading-relaxed">{v.desc}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo Treatment */}
              <div className="space-y-3">
                <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-400 opacity-60 ml-1">Logo Treatment</h3>
                <div className="grid grid-cols-3 gap-2 p-1 bg-black/20 rounded-xl border border-white/5">
                  {[
                    { id: 'original', label: 'ORIG' },
                    { id: 'square', label: 'SQ' },
                    { id: 'round', label: 'MASK' }
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setLogoStyle(style.id as any)}
                      className={`flex items-center justify-center py-2 rounded-lg transition-all ${logoStyle === style.id ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                      <span className="text-[7px] font-black uppercase tracking-widest">{style.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo Tuning (Sliders) */}
              <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 animate-in slide-in-from-top-2 duration-300">
                
                {/* Scale */}
                <div className="flex items-center gap-3 h-6">
                  <span className="text-[7.5px] font-black uppercase tracking-widest text-white/40 w-16 shrink-0">Scale</span>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.05"
                    value={logoSettings.scale ?? 1.0}
                    onChange={(e) => updateLogoSettings({ scale: parseFloat(e.target.value) })}
                    className="flex-1 accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[7.5px] font-mono text-blue-400 w-8 text-right shrink-0">{((logoSettings.scale ?? 1.0) * 100).toFixed(0)}%</span>
                </div>

                {/* Opacity */}
                <div className="flex items-center gap-3 h-6">
                  <span className="text-[7.5px] font-black uppercase tracking-widest text-white/40 w-16 shrink-0">Opacity</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={logoSettings.opacity ?? 1.0}
                    onChange={(e) => updateLogoSettings({ opacity: parseFloat(e.target.value) })}
                    className="flex-1 accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[7.5px] font-mono text-blue-400 w-8 text-right shrink-0">{((logoSettings.opacity ?? 1.0) * 100).toFixed(0)}%</span>
                </div>

                {/* Radius */}
                {logoStyle === 'round' && (
                  <div className="flex items-center gap-3 h-6 animate-in slide-in-from-left-2 duration-300">
                    <span className="text-[7.5px] font-black uppercase tracking-widest text-white/40 w-16 shrink-0">Radius</span>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="1"
                      value={logoSettings.radius ?? 45}
                      onChange={(e) => updateLogoSettings({ radius: parseInt(e.target.value) })}
                      className="flex-1 accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-[7.5px] font-mono text-blue-400 w-8 text-right shrink-0">{(logoSettings.radius ?? 45)}%</span>
                  </div>
                )}

                {/* Glow & Color (V1 Only) */}
                {landingVersion === 1 && (
                  <>
                    <div className="flex items-center gap-3 h-6 animate-in slide-in-from-left-2 duration-300">
                      <span className="text-[7.5px] font-black uppercase tracking-widest text-white/40 w-16 shrink-0">Glow</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={logoSettings.glowIntensity ?? 0.3}
                        onChange={(e) => updateLogoSettings({ glowIntensity: parseFloat(e.target.value) })}
                        className="flex-1 accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-[7.5px] font-mono text-blue-400 w-8 text-right shrink-0">{((logoSettings.glowIntensity ?? 0.3) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-3 h-6 animate-in slide-in-from-left-2 duration-300">
                      <span className="text-[7.5px] font-black uppercase tracking-widest text-white/40 w-16 shrink-0">Tint</span>
                      <div className="flex-1 flex items-center h-full">
                        <input
                          type="color"
                          value={logoSettings.glowColor ?? '#3b82f6'}
                          onChange={(e) => updateLogoSettings({ glowColor: e.target.value })}
                          className="w-full h-2 rounded-full overflow-hidden bg-transparent border-none cursor-pointer p-0"
                        />
                      </div>
                      <span className="text-[7.5px] font-mono text-blue-400 w-8 text-right shrink-0 uppercase tracking-tighter">{(logoSettings.glowColor ?? '#3b82f6').replace('#', '')}</span>
                    </div>
                  </>
                )}

                {/* Offset (V3 Only) */}
                {landingVersion === 3 && (
                  <div className="flex items-center gap-3 h-6 animate-in slide-in-from-left-2 duration-300">
                    <span className="text-[7.5px] font-black uppercase tracking-widest text-white/40 w-16 shrink-0">Offset</span>
                    <input
                      type="range"
                      min="-200"
                      max="400"
                      step="1"
                      value={logoSettings.xOffset ?? 0}
                      onChange={(e) => updateLogoSettings({ xOffset: parseInt(e.target.value) })}
                      className="flex-1 accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-[7.5px] font-mono text-blue-400 w-8 text-right shrink-0">{(logoSettings.xOffset ?? 0)}px</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'themes' && (
            <div className="h-full flex flex-col items-center justify-center opacity-20 py-20 grayscale">
              <Palette className="w-12 h-12 mb-4" />
              <div className="text-[10px] font-black uppercase tracking-widest">System Themes</div>
              <div className="text-[8px] mt-2 italic">Coming soon...</div>
            </div>
          )}

          {activeTab === 'fonts' && (
            <div className="h-full flex flex-col items-center justify-center opacity-20 py-20 grayscale">
              <Type className="w-12 h-12 mb-4" />
              <div className="text-[10px] font-black uppercase tracking-widest">Typography</div>
              <div className="text-[8px] mt-2 italic">Coming soon...</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/[0.02] border-t border-white/5">
          <div className="flex items-center justify-center gap-4 text-[7px] font-black uppercase tracking-widest text-kilang-text-muted/40">
            <span>Core v1.0</span>
            <div className="w-1 h-1 rounded-full bg-white/10" />
            <span>Diagnostic Build</span>
          </div>
        </div>
      </div>
    </div>
  );
};
