'use client';

import React from 'react';

interface KilangLandingProps {
  version: 1 | 2 | 3;
  logoStyle?: 'original' | 'square' | 'round';
  logoSettings: { scale: number; radius: number; xOffset: number; opacity: number; glowIntensity: number; glowColor: string };
  stats: any;
  deepRoots: string[];
  fetchRootDetails: (root: string) => Promise<void>;
}

export const KilangLanding = ({ 
  version, 
  logoStyle = 'original',
  logoSettings,
  stats, 
  deepRoots, 
  fetchRootDetails 
}: KilangLandingProps) => {
  const logoUrl = '/kilang/Kilang_5_nobg.png';

  // CSS classes for logo treatments
  const getLogoClass = (base: string) => {
    let classes = base;
    if (logoStyle === 'square' || logoStyle === 'round') {
      classes += ' aspect-square object-cover';
    }
    return classes;
  };

  const logoStyleAttr = logoStyle === 'round' 
    ? { clipPath: `circle(${logoSettings.radius}% at 50% 50%)`, transform: `scale(${logoSettings.scale})`, opacity: logoSettings.opacity }
    : { transform: `scale(${logoSettings.scale})`, opacity: logoSettings.opacity };

  const glowStyle = {
    filter: `drop-shadow(0 0 ${logoSettings.glowIntensity * 100}px ${logoSettings.glowColor})`
  };

  const commonButtons = (
    <div className="relative z-20 space-y-6 max-w-md mx-auto pointer-events-auto">
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 opacity-60 text-center">Semantic Forest Entry Points</div>
          <div className="flex flex-wrap justify-center gap-2.5">
            {(stats?.top_roots || []).slice(0, 6).map((r: any) => (
              <button 
                key={r.root} 
                onClick={() => fetchRootDetails(r.root)} 
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[11px] font-black hover:bg-blue-600/20 text-white/60 transition-all hover:text-white hover:border-blue-500/30 active:scale-95 shadow-lg backdrop-blur-sm"
              >
                {r.root}
              </button>
            ))}
          </div>
        </div>

        {deepRoots.length > 0 && (
          <div className="space-y-3">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 opacity-60 text-center">Deep Morphological Chains</div>
            <div className="flex flex-wrap justify-center gap-2.5">
              {deepRoots.map((root) => (
                <button 
                  key={root} 
                  onClick={() => fetchRootDetails(root)} 
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[11px] font-black hover:bg-emerald-600/20 text-white/60 transition-all hover:text-white hover:border-emerald-500/30 active:scale-95 shadow-lg backdrop-blur-sm"
                >
                  {root}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

    if (version === 1) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-20 text-center relative overflow-hidden bg-gradient-to-b from-[#020617] to-[#0f172a]/20">
        <div className="relative z-10 mb-12 group transition-all duration-700 animate-peaceful-float pause-on-hover">
          <div className="absolute inset-0 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" style={{ backgroundColor: logoSettings.glowColor }} />
          <img 
            src={logoUrl} 
            alt="Kilang Logo" 
            className={getLogoClass("w-48 h-48 lg:w-64 lg:h-64 object-contain group-hover:scale-105 transition-transform duration-700 invert-x pointer-events-none")}
            style={{ ...logoStyleAttr, ...glowStyle }}
          />
        </div>
        {commonButtons}
        
        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        </div>
      </div>
    );
  }

  if (version === 2) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-20 text-center relative overflow-hidden bg-[#1e293b]">
        {/* Background Logo Layer (Behind Content) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <img 
            src={logoUrl} 
            alt="Kilang Logo Background" 
            className={getLogoClass("w-full h-full object-contain transition-all duration-1000 animate-in fade-in duration-1000")}
            style={logoStyleAttr}
          />
        </div>
        
        {/* Content Layer (In Front) */}
        <div className="relative z-10">
          <h1 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-[0.5em] mb-12 opacity-80 flex items-center justify-center">
             - KILANG -
          </h1>
          {commonButtons}
        </div>
      </div>
    );
  }

  if (version === 3) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-20 text-center relative overflow-hidden bg-gradient-to-b from-[#0f172a] to-[#1e293b]/30">
        <div className="relative z-10 mb-12">
          <h1 className="text-5xl lg:text-7xl font-black text-white uppercase tracking-[0.6em] opacity-40 mb-12 block mix-blend-overlay">
             KILANG
          </h1>
          {commonButtons}
        </div>

        <div className="absolute left-0 top-0 bottom-0 w-1/4 flex items-center justify-start pointer-events-none overflow-hidden z-[100]" 
             style={{ transform: `translateX(${logoSettings.xOffset}px)` }}>
          <img 
            src={logoUrl} 
            className={getLogoClass("h-full w-auto object-contain -translate-x-1/2 scale-110")}
            style={logoStyleAttr}
          />
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/4 flex items-center justify-end pointer-events-none overflow-hidden z-[100]"
             style={{ transform: `translateX(${-logoSettings.xOffset}px)` }}>
          <img 
            src={logoUrl} 
            className={getLogoClass("h-full w-auto object-contain translate-x-1/2 scale-110")}
            style={logoStyleAttr}
          />
        </div>
      </div>
    );
  }

  return null;
};
