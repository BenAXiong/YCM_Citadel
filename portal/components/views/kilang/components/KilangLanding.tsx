'use client';

import React from 'react';

interface KilangLandingProps {
  version: 1 | 2 | 3;
  logoStyle?: 'original' | 'square' | 'round';
  stats: any;
  deepRoots: string[];
  fetchRootDetails: (root: string) => Promise<void>;
}

export const KilangLanding = ({ 
  version, 
  logoStyle = 'original', 
  stats, 
  deepRoots, 
  fetchRootDetails 
}: KilangLandingProps) => {
  const logoUrl = '/kilang/Kilang_5_nobg.png';

  // CSS classes for logo treatments
  const getLogoClass = (base: string) => {
    let classes = base;
    if (logoStyle === 'square') {
      classes += ' aspect-square object-cover';
    } else if (logoStyle === 'round') {
      // Circle mask just outside the tree to erase the golden ring
      // Adjust percentage to perfectly frame the tree
      classes += ' aspect-square object-cover [clip-path:circle(45%_at_50%_50%)]';
    }
    return classes;
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
      
      <div className="pt-8 border-t border-white/5">
        <p className="text-[10px] text-kilang-text-muted leading-relaxed font-medium max-w-xs mx-auto text-center opacity-60 italic">
          Select a semantic root to begin visualizing the evolutionary growth patterns of the Amis language.
        </p>
      </div>
    </div>
  );

  if (version === 1) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-20 text-center relative overflow-hidden bg-gradient-to-b from-[#020617] to-[#0f172a]/20">
        <div className="relative z-10 mb-12 group transition-all duration-700">
          <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <img 
            src={logoUrl} 
            alt="Kilang Logo" 
            className={getLogoClass("w-48 h-48 lg:w-64 lg:h-64 object-contain drop-shadow-[0_0_50px_rgba(59,130,246,0.3)] group-hover:scale-105 transition-transform duration-700 invert-x pointer-events-none")}
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
      <div className="h-full flex flex-col items-center justify-center p-20 text-center relative overflow-hidden bg-[#020617]">
        {/* Full Window Faded Logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img 
            src={logoUrl} 
            alt="Kilang Logo Background" 
            className={getLogoClass("w-full h-full object-contain opacity-[0.05] scale-125 lg:scale-150 rotate-[15deg] transition-all duration-1000")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]/40" />
        </div>
        
        <div className="relative z-10">
          <h1 className="text-4xl lg:text-6xl font-black text-white uppercase tracking-[0.4em] mb-12 opacity-10 flex items-center gap-4">
             KIL <div className="w-12 h-1 bg-blue-500/40 rounded-full" /> ANG
          </h1>
          {commonButtons}
        </div>
      </div>
    );
  }

  if (version === 3) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-20 text-center relative overflow-hidden bg-[#020617]">
        {/* Dual Border Pillars */}
        <div className="absolute left-0 top-0 bottom-0 w-1/4 flex items-center justify-start pointer-events-none overflow-hidden">
          <img 
            src={logoUrl} 
            className={getLogoClass("h-full w-auto object-contain opacity-20 -translate-x-1/2 scale-110 blur-[2px]")}
          />
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/4 flex items-center justify-end pointer-events-none overflow-hidden">
          <img 
            src={logoUrl} 
            className={getLogoClass("h-full w-auto object-contain opacity-20 translate-x-1/2 scale-110 blur-[2px]")}
          />
        </div>

        <div className="relative z-10">
          <div className="mb-12 flex items-center justify-center gap-8 opacity-20">
             <div className="w-24 h-[1px] bg-white/40" />
             <img src={logoUrl} className={getLogoClass("w-16 h-16 object-contain")} />
             <div className="w-24 h-[1px] bg-white/40" />
          </div>
          {commonButtons}
        </div>
      </div>
    );
  }

  return null;
};
