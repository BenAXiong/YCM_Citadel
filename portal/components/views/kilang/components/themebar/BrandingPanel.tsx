'use client';

import React, { useState } from 'react';
import { Aperture, Monitor, RotateCcw, Play, Layers, Sidebar as SidebarIcon } from 'lucide-react';
import { RibbonNav, RibbonGroup, VariableControl } from './Shared';

interface BrandingPanelProps {
  tsState: any;
  tsActions: any;
  dispatch: any;
  layoutConfig: any;
  dense?: boolean;
}

export const BrandingPanel = ({
  tsState,
  tsActions,
  dispatch,
  layoutConfig,
  dense = false
}: BrandingPanelProps) => {
  const [activeRibbon, setActiveRibbon] = useState('landing');
  const { landingVersion, logoStyle, logoSettings } = tsState;
  const { setLandingVersion, setLogoStyle, updateLogoSettings, resetLogoSettings } = tsActions;

  const ribbonTabs = [
    { id: 'landing', label: 'Landing', icon: Monitor },
    { id: 'logo', label: 'Header Logo', icon: Aperture },
    { id: 'animation', label: 'Animation', icon: RotateCcw }
  ];

  const currentSettings = logoSettings || {};

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <RibbonNav 
        tabs={ribbonTabs} 
        activeTab={activeRibbon} 
        onTabChange={setActiveRibbon} 
      />

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10 custom-scrollbar">
        {activeRibbon === 'landing' && (
          <div className="space-y-4">
            <RibbonGroup label="Landing Presets">
              <div className="grid grid-cols-3 gap-2 px-2 py-1">
                {[
                  { id: 1, label: 'Classic', desc: 'Centered.', color: '#3b82f6' },
                  { id: 2, label: 'Fill', desc: 'Ethereal.', color: '#10b981' },
                  { id: 3, label: 'Dual', desc: 'Pillars.', color: '#a855f7' }
                ].map(v => (
                  <button
                    key={v.id}
                    onClick={() => setLandingVersion(v.id as any)}
                    className={`flex flex-col items-center justify-center py-5 px-1 rounded-xl border transition-all text-center group relative overflow-hidden ${landingVersion === v.id ? 'bg-white/10 border-white/40 shadow-xl' : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/[0.08]'}`}
                  >
                    <div 
                      className={`absolute inset-0 blur-3xl opacity-0 transition-opacity ${landingVersion === v.id ? 'opacity-20' : 'group-hover:opacity-10'}`}
                      style={{ backgroundColor: v.color }}
                    />
                    
                    <div className="flex flex-col gap-1 relative z-10 w-full">
                      <div className="text-[10px] font-black uppercase tracking-tighter leading-none whitespace-nowrap overflow-hidden text-ellipsis">{v.label}</div>
                      <div className={`text-[8px] font-black uppercase tracking-widest opacity-40 leading-none mt-0.5 ${landingVersion === v.id ? 'text-white' : ''}`}>
                        {v.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </RibbonGroup>

            <RibbonGroup label="Logo Treatment">
              <div className="flex flex-col gap-4 p-2 bg-white/[0.03] rounded-2xl border border-white/5 mx-2 my-1">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'original', label: 'ORIG' },
                    { id: 'square', label: 'SQ' },
                    { id: 'round', label: 'MASK' }
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setLogoStyle(style.id as any)}
                      className={`flex items-center justify-center py-3 rounded-xl transition-all border ${logoStyle === style.id ? 'bg-white text-black border-white shadow-lg' : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'}`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">{style.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </RibbonGroup>

            <RibbonGroup label="Logo Tuning">
              <div className="flex items-center justify-between mb-3 px-3">
                 <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 italic">Configuration Set</h3>
                 <button 
                   onClick={resetLogoSettings}
                   className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all group/reset"
                 >
                    <RotateCcw className="w-4 h-4 group-hover:rotate-[-45deg] transition-transform duration-300" />
                 </button>
              </div>
              <VariableControl 
                label="Scale" 
                value={currentSettings.scale} 
                onChange={(v) => updateLogoSettings({ scale: parseFloat(v) })} 
                type="number"
                min={0.1} max={4} step={0.1}
              />
              <VariableControl 
                label="Rounding" 
                value={currentSettings.radius} 
                onChange={(v) => updateLogoSettings({ radius: parseFloat(v) })} 
                type="number"
                min={0} max={100}
              />
              {landingVersion === 3 && (
                <VariableControl 
                  label="X Offset" 
                  value={currentSettings.xOffset} 
                  onChange={(v) => updateLogoSettings({ xOffset: parseFloat(v) })} 
                  type="number"
                  min={-400} max={436}
                />
              )}
              <VariableControl 
                label="Opacity" 
                value={currentSettings.opacity} 
                onChange={(v) => updateLogoSettings({ opacity: parseFloat(v) })} 
                type="number"
                min={0} max={1} step={0.01}
              />
              {landingVersion !== 1 && (
                <VariableControl 
                  label="Glow" 
                  value={currentSettings.glowIntensity} 
                  onChange={(v) => updateLogoSettings({ glowIntensity: parseFloat(v) })} 
                  type="number"
                  min={0} max={1} step={0.01}
                />
              )}
              <VariableControl 
                label="Atmosphere" 
                value={currentSettings.glowColor || tsState.overrides['--kilang-primary-glow']} 
                onChange={(v) => {
                  updateLogoSettings({ glowColor: v });
                  tsActions.updateVariable('--kilang-primary-glow', v);
                }} 
                type="color"
              />
            </RibbonGroup>
          </div>
        )}

        {activeRibbon === 'logo' && (
          <RibbonGroup label="Header Logo">
            <div className="mx-4 mt-8 p-12 bg-white/[0.03] border border-white/10 rounded-[2.5rem] flex flex-col items-center text-center relative overflow-hidden group/header">
               <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
               <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 group-hover/header:rotate-12 transition-transform duration-500">
                  <Monitor className="w-10 h-10 text-white/20" />
               </div>
               <div className="space-y-3 relative z-10">
                  <h3 className="text-[13px] font-black uppercase tracking-[0.4em] text-white">Header Branding</h3>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest italic leading-relaxed max-w-[200px]">
                    Main Title Logo Tuning <br/> Coming Soon
                  </p>
               </div>
            </div>
          </RibbonGroup>
        )}

        {activeRibbon === 'animation' && (
          <RibbonGroup label="Animation Control">
             <div className="mx-2 mt-4 p-8 bg-white/[0.03] border border-white/5 rounded-3xl flex flex-col items-center text-center group/motion overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                
                <div className="relative w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 group-hover/motion:scale-110 transition-transform duration-700">
                   <div className="absolute inset-0 bg-white/10 rounded-full animate-ping opacity-20" />
                   <div className="absolute inset-0 border border-white/20 rounded-full animate-pulse" />
                   <RotateCcw className="w-8 h-8 text-white/40 animate-spin" style={{ animationDuration: '4s' }} />
                </div>

                <div className="space-y-2 relative z-10">
                   <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-white">Motion Engine</h3>
                   <p className="text-[10px] font-black text-white/20 uppercase tracking-widest italic">Synchronization Active</p>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4 w-full relative z-10">
                   <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-1">
                      <Play className="w-3.5 h-3.5 text-white/20" />
                      <span className="text-[8px] font-black uppercase text-white/10 tracking-widest">Physics Active</span>
                   </div>
                   <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-1">
                      <div className="w-4 h-4 rounded-full border border-dashed border-white/20 animate-spin" style={{ animationDuration: '10s' }} />
                      <span className="text-[8px] font-black uppercase text-white/10 tracking-widest">FPS Limit: 120</span>
                   </div>
                </div>

                <div className="mt-8 px-5 py-2.5 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                   Motion Engine Ready
                </div>
             </div>
          </RibbonGroup>
        )}
      </div>
    </div>
  );
};
