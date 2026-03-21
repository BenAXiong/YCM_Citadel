'use client';

import React from 'react';
import { Monitor, Aperture, RotateCcw } from 'lucide-react';
import { SectionHeader } from './Shared';

interface BrandingPanelProps {
  tsState: any;
  tsActions: any;
  dense?: boolean;
}

export const BrandingPanel = ({
  tsState,
  tsActions,
  dense = false
}: BrandingPanelProps) => {
  const { landingVersion, logoStyle, logoSettings, expandedSections } = tsState;
  const { toggleSection, setLandingVersion, setLogoStyle, updateLogoSettings, resetLogoSettings } = tsActions;

  return (
    <div className="space-y-1">
      <SectionHeader 
        id="landing" 
        label="Landing Presets" 
        icon={Monitor} 
        isExpanded={expandedSections.has('landing')}
        onToggle={toggleSection}
        dense={dense}
      />
      {expandedSections.has('landing') && (
        <div className="p-4 bg-white/[0.03] border-b border-white/10 grid grid-cols-3 gap-2">
          {[1, 2, 3].map(v => (
            <button
              key={v}
              onClick={() => setLandingVersion(v as any)}
              className={`py-3 rounded-xl border transition-all ${landingVersion === v ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white/40'}`}
            >
              <span className="text-[10px] font-black">{v}</span>
            </button>
          ))}
        </div>
      )}

      <SectionHeader 
        id="logo_tuning" 
        label="Logo Tuning" 
        icon={Aperture} 
        isExpanded={expandedSections.has('logo_tuning')}
        onToggle={toggleSection}
        onReset={resetLogoSettings}
        dense={dense}
      />
      {expandedSections.has('logo_tuning') && (
        <div className="bg-white/[0.03] border-b border-white/10 p-4 space-y-4">
          {/* Logo Presets */}
          <div className="grid grid-cols-3 gap-2">
            {['original', 'square', 'round'].map(s => (
              <button
                key={s}
                onClick={() => setLogoStyle(s as any)}
                className={`py-1.5 rounded-lg border text-[8px] font-black uppercase transition-all ${logoStyle === s ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white/40'}`}
              >
                {s === 'round' ? 'Mask' : s.slice(0, 4)}
              </button>
            ))}
          </div>

          {/* Sliders */}
          {[
            { key: 'opacity', label: 'Alpha', min: 0, max: 1, step: 0.1 },
            { key: 'scale', label: 'Scale', min: 0.5, max: 3, step: 0.1 },
            { key: 'radius', label: 'Radius', min: 0, max: 100, step: 1 }
          ].map(c => (
            <div key={c.key} className="flex items-center justify-between group">
              <span className="text-[9px] font-black uppercase text-white/30 group-hover:text-white/60 transition-colors">{c.label}</span>
              <div className="flex items-center gap-2">
                 <input
                  type="range"
                  min={c.min}
                  max={c.max}
                  step={c.step}
                  value={logoSettings[c.key]}
                  onChange={(e) => updateLogoSettings({ [c.key]: parseFloat(e.target.value) })}
                  className="w-16 h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-zinc-500"
                />
                <span className="w-6 text-right text-[9px] font-mono text-white/30">{logoSettings[c.key]}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
