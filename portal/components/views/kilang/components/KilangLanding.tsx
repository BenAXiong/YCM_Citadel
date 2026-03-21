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

  // Robust fallbacks for saved state gaps (prevents local storage overrides from breaking the UI)
  const settings = logoSettings || { scale: 1, radius: 45, xOffset: 0, opacity: 1, glowIntensity: 0.3, glowColor: '#3b82f6' };

  const currentOpacity = settings.opacity ?? 1.0;
  const currentScale = settings.scale ?? 1.0;
  const currentRadius = settings.radius ?? 45;

  const logoStyleAttr = logoStyle === 'round'
    ? { clipPath: `circle(${currentRadius}% at 50% 50%)`, transform: `scale(${currentScale})`, opacity: currentOpacity }
    : { transform: `scale(${currentScale})`, opacity: currentOpacity };

  const glowStyle = {
    filter: `drop-shadow(0 0 ${(settings.glowIntensity ?? 0.3) * 100}px ${settings.glowColor ?? '#3b82f6'})`
  };

  const commonButtons = (
    <div className="relative z-20 space-y-6 max-w-md mx-auto pointer-events-auto">
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--kilang-primary-text)]/60 text-center">Semantic Forest Entry Points</div>
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
      <div key="v1" className="h-full flex flex-col items-center justify-center p-20 text-center relative overflow-hidden bg-gradient-to-b from-[#020617] to-[#0f172a]/20">
        <div className="relative z-10 mb-12 group transition-all duration-700 animate-peaceful-float pause-on-hover">
          <div className="absolute inset-0 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" style={{ backgroundColor: settings.glowColor ?? '#3b82f6' }} />
          <img
            src={logoUrl}
            alt="Kilang Logo"
            className={getLogoClass("w-48 h-48 lg:w-64 lg:h-64 object-contain group-hover:scale-105 transition-transform duration-700 invert-x pointer-events-none")}
            style={{ ...logoStyleAttr, ...glowStyle }}
          />
        </div>
        <div className="mt-8">
          {commonButtons}
        </div>

        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        </div>
      </div>
    );
  }

  if (version === 2) {
    return (
      <div key="v2" className="h-full relative overflow-hidden bg-gradient-to-b from-[#020617] to-[#0f172a]/20">
        {/* Background Logo Layer (Behind Content) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <img
            src={logoUrl}
            alt="Kilang Logo Background"
            className={getLogoClass("w-full h-full object-cover transition-opacity duration-700")}
            style={logoStyleAttr}
          />
        </div>

        {/* Title Layer (Fixed Spot) */}
        <div className="absolute top-[35%] left-0 right-0 z-10 -translate-y-1/2 flex flex-col items-center pointer-events-none">
          <div className="mb-4">
            <span className="text-[10px] font-black uppercase tracking-[1em] text-blue-500/60 leading-none">
              Genetic Lexicon Engine
            </span>
          </div>

          <div className="relative px-12 py-6">
            <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full" />
            <h1 className="relative text-5xl lg:text-7xl font-thin text-white uppercase tracking-[0.8em] flex items-center justify-center translate-x-[0.4em]">
              KILANG
            </h1>
            <div className="absolute bottom-0 left-[20%] right-[20%] h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
          </div>
        </div>

        {/* Lowered Entry Points */}
        <div className="absolute bottom-32 left-0 right-0 z-20 flex justify-center">
          {commonButtons}
        </div>

        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        </div>
      </div>
    );
  }

  if (version === 3) {
    return (
      <div key="v3" className="h-full relative overflow-hidden bg-gradient-to-b from-[#0f172a] to-[#1e293b]/30">
        {/* Background Pillars */}
        <div className="absolute left-0 top-0 bottom-0 flex items-center justify-start pointer-events-none z-[100]"
          style={{ transform: `translateX(${settings.xOffset}px)` }}>
          <img
            src={logoUrl}
            className={getLogoClass("h-[80%] w-auto object-contain")}
            style={logoStyleAttr}
          />
        </div>
        <div className="absolute right-0 top-0 bottom-0 flex items-center justify-end pointer-events-none z-[100]"
          style={{ transform: `translateX(${-settings.xOffset}px)` }}>
          <img
            src={logoUrl}
            className={getLogoClass("h-[80%] w-auto object-contain")}
            style={logoStyleAttr}
          />
        </div>

        {/* Branding Title (Fixed Spot) */}
        <div className="absolute top-[30%] left-0 right-0 z-10 -translate-y-1/2 flex flex-col items-center pointer-events-none">
          <div className="relative group p-12">
            <div
              className="absolute left-1/2 top-1/2 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] animate-pulse bg-gradient-to-br from-[#7b8e45] via-[#d39a47] to-[#a04a44]"
              style={{ width: '400px', height: '400px', transform: `translate(-50%, -50%) scale(${(currentRadius * 6) / 400})`, animationDuration: '4s' }}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity duration-1000">
              <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent rotate-45" />
              <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent -rotate-45" />
            </div>

            <h1 className="relative text-7xl lg:text-9xl font-black uppercase tracking-[0.4em] scale-y-110 flex items-center justify-center translate-x-[0.2em]">
              <span
                className="absolute inset-0 bg-clip-text text-transparent bg-gradient-to-r from-[#7b8e45] via-[#d9dc1e] to-[#a04a44] blur-2xl opacity-40 animate-pulse select-none"
                style={{ animationDuration: '4s' }}
              >
                KILANG
              </span>
              <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-[#84a553] via-[#f5f593] to-[#a83d44] drop-shadow-[0_0_30px_rgba(211,154,71,0.3)]">
                KILANG
              </span>
            </h1>
          </div>
        </div>

        {/* Lowered Entry Points */}
        <div className="absolute bottom-42 left-0 right-0 z-20 flex justify-center">
          {commonButtons}
        </div>
      </div>
    );
  }

  return null;
};
