'use client';

import React, { useState } from 'react';
import { Aperture, Monitor, RotateCcw, Play, Layers, Sidebar as SidebarIcon, Dices, Copy, Check } from 'lucide-react';
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
  const { landingVersion, logoStyle, logoSettings } = tsState;
  const { setLandingVersion, setLogoStyle, updateLogoSettings, resetLogoSettings } = tsActions;

  const [copied, setCopied] = useState(false);

  const handleCopyConfig = () => {
    const config = {
      threadPeriod: layoutConfig.threadPeriod,
      threadLength: layoutConfig.threadLength,
      threads: layoutConfig.threads
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentSettings = logoSettings || {};

  return (
    <div className="flex flex-row h-full overflow-x-auto custom-scrollbar bg-[#020202]">
      {/* COLUMN 1: LANDING */}
      <div className="flex-1 min-w-[300px] max-w-[320px] border-r border-white/10 flex flex-col h-full shrink-0 bg-[#0a0a0a]">
        <div className="h-10 px-6 flex items-center justify-between bg-black/40 border-b border-white/5 shrink-0">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Landing Experience</span>
          <button 
            onClick={() => setLandingVersion(2)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/10 hover:text-white transition-all group/reset"
            title="Reset Landing Version"
          >
            <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-[-45deg] transition-all" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-1 pb-10">
          <RibbonGroup label="Landing Presets">
            <div className="grid grid-cols-3 gap-2 px-1 py-1">
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
            <div className="flex flex-col gap-4 p-2 bg-white/[0.03] rounded-2xl border border-white/5 mx-1 my-1">
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
      </div>

      {/* COLUMN 2: HEADER LOGO */}
      <div className="flex-1 min-w-[300px] max-w-[320px] border-r border-white/10 flex flex-col h-full shrink-0 bg-[#0a0a0a]">
        <div className="h-10 px-6 flex items-center justify-between bg-black/40 border-b border-white/5 shrink-0">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Identity Asset</span>
          <button 
            onClick={() => {
              resetLogoSettings();
              setLogoStyle('original');
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/10 hover:text-white transition-all group/reset"
            title="Reset Identity Settings"
          >
            <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-[-45deg] transition-all" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-1 pb-10">
          <RibbonGroup label="Header Logo Tuning">
            <div className="mx-2 mt-4 p-8 bg-white/[0.03] border border-white/10 rounded-[2rem] flex flex-col items-center text-center relative overflow-hidden group/header">
               <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
               <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-6 group-hover/header:rotate-12 transition-transform duration-500">
                  <Monitor className="w-8 h-8 text-white/20" />
               </div>
               <div className="space-y-3 relative z-10">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Header Branding</h3>
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest italic leading-relaxed max-w-[180px]">
                    Main Title Logo Tuning <br/> Coming Soon
                  </p>
               </div>
            </div>
          </RibbonGroup>
        </div>
      </div>

      {/* COLUMN 3: ANIMATIONS */}
      <div className="flex-1 min-w-[300px] max-w-[320px] border-r border-white/10 flex flex-col h-full shrink-0 bg-[#0a0a0a]">
        <div className="h-10 px-6 flex items-center justify-between bg-black/40 border-b border-white/5 shrink-0">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Animations</span>
          <div className="flex items-center gap-1">
            <button 
              onClick={handleCopyConfig}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/10 hover:text-white transition-all group/copy"
              title="Copy Config to Clipboard"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 group-hover:scale-110 transition-all" />
              )}
            </button>
            <button 
              onClick={() => dispatch({ type: 'RANDOMIZE_THREADS' })}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/10 hover:text-white transition-all group/random"
              title="Randomize All Threads"
            >
              <Dices className="w-3.5 h-3.5 group-hover:scale-110 group-hover:rotate-12 transition-all" />
            </button>
            <button 
              onClick={() => dispatch({ type: 'RESET_THREADS' })}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/10 hover:text-white transition-all group/reset"
              title="Reset All Threads"
            >
              <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-[-45deg] transition-all" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-1 pb-10">
          <RibbonGroup label="Global Controls">
            <VariableControl 
              label="Wavelength" 
              value={layoutConfig.threadPeriod ?? 32} 
              onChange={(v) => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { threadPeriod: parseFloat(v) } })} 
              type="number"
              min={8} max={256} step={1}
            />
            <VariableControl 
              label="Total Length" 
              value={layoutConfig.threadLength ?? 256} 
              onChange={(v) => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { threadLength: parseFloat(v) } })} 
              type="number"
              min={64} max={1200} step={4}
            />
          </RibbonGroup>

          {layoutConfig.threads?.map((thread: any, idx: number) => (
            <div key={idx} className="mb-1 border-b border-white/[0.03] transition-all last:border-0 hover:bg-white/[0.01]">
              <div className="px-5 py-1.5 flex items-center justify-between group/strand">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: thread.color }} />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 group-hover:text-white/60 transition-colors">Strand {idx + 1}</span>
                </div>
                
                <div className="relative flex items-center">
                  <input
                    type="color"
                    value={thread.color}
                    onChange={(e) => dispatch({ type: 'SET_THREAD_CONFIG', index: idx, config: { color: e.target.value } })}
                    className="w-4 h-4 bg-transparent border-0 cursor-pointer opacity-0 absolute inset-0 z-10"
                  />
                  <div
                    className="w-4 h-4 rounded border border-white/20 group-hover/strand:border-white/40 transition-all shadow-lg"
                    style={{ backgroundColor: thread.color }}
                  />
                </div>
              </div>

              <div className="pb-2 space-y-0.5">
                <VariableControl 
                  dense
                  label="Amplitude" 
                  value={thread.amplitude} 
                  onChange={(v) => dispatch({ type: 'SET_THREAD_CONFIG', index: idx, config: { amplitude: parseFloat(v) } })} 
                  type="number"
                  min={-32} max={32} step={0.5}
                />
                <VariableControl 
                  dense
                  label="Thickness" 
                  value={thread.width} 
                  onChange={(v) => dispatch({ type: 'SET_THREAD_CONFIG', index: idx, config: { width: parseFloat(v) } })} 
                  type="number"
                  min={0.2} max={10} step={0.1}
                />
                <VariableControl 
                  dense
                  label="Complexity" 
                  value={thread.complexity} 
                  onChange={(v) => dispatch({ type: 'SET_THREAD_CONFIG', index: idx, config: { complexity: parseFloat(v) } })} 
                  type="number"
                  min={0} max={40} step={1}
                />
                <VariableControl 
                  dense
                  label="Orbit" 
                  value={thread.orbit} 
                  onChange={(v) => dispatch({ type: 'SET_THREAD_CONFIG', index: idx, config: { orbit: parseFloat(v) } })} 
                  type="number"
                  min={0} max={20} step={0.1}
                />
                <VariableControl 
                  dense
                  label="Opacity" 
                  value={thread.opacity} 
                  onChange={(v) => dispatch({ type: 'SET_THREAD_CONFIG', index: idx, config: { opacity: parseFloat(v) } })} 
                  type="number"
                  min={0} max={1} step={0.05}
                />
                <VariableControl 
                  dense
                  label="Speed" 
                  value={thread.speed} 
                  onChange={(v) => dispatch({ type: 'SET_THREAD_CONFIG', index: idx, config: { speed: parseFloat(v) } })} 
                  type="number"
                  min={0.1} max={20} step={0.1}
                />
                <VariableControl 
                  dense
                  label="Phase" 
                  value={thread.phase} 
                  onChange={(v) => dispatch({ type: 'SET_THREAD_CONFIG', index: idx, config: { phase: parseFloat(v) } })} 
                  type="number"
                  min={0} max={6.28} step={0.01}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
