'use client';

import React from 'react';
import { useKilangContext } from '../../KilangContext';

export const HeaderLogo = () => {
  const { dispatch } = useKilangContext();

  return (
    <button
      onClick={() => dispatch({ type: 'SET_ROOT', root: null })}
      className="flex items-center gap-3 group cursor-pointer hover:opacity-80 active:scale-95 transition-all outline-none"
    >
      <div className="w-8 h-8 relative flex items-center justify-center group-hover:scale-110 transition-all duration-300">
        <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--kilang-primary),transparent_80%)] blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        <img
          src="/kilang/Kilang_5_nobg_noring2.png"
          alt="Kilang Logo"
          className="w-full h-full object-contain drop-shadow-[0_0_15px_var(--kilang-primary)]"
        />
      </div>
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-[var(--kilang-logo-text)] tracking-[0.2em] leading-none uppercase">KILANG</span>
          <span className="text-[8px] font-black text-[var(--kilang-primary-text)] bg-[color-mix(in_srgb,var(--kilang-primary-bg),transparent_90%)] px-1.5 py-0.5 rounded uppercase tracking-widest border border-[color-mix(in_srgb,var(--kilang-primary-border),transparent_80%)]">BETA</span>
        </div>
        <span className="text-[8px] font-black text-[var(--kilang-text-muted)] uppercase tracking-widest mt-1 hidden sm:inline-block">MORPHO-ENGINE</span>
      </div>
    </button>
  );
};
