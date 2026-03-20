'use client';

import React, { useState, useRef } from 'react';
import { Languages, Palette } from 'lucide-react';
import { useKilangContext } from '../../KilangContext';

export const QuickActions = () => {
  const { state, dispatch, toggleUiLang } = useKilangContext();
  const { showThemeBar } = state;
  const [isPaletteHovered, setIsPaletteHovered] = useState(false);
  const paletteHoverTimeoutRef = useRef<any>(null);

  return (
    <div className="flex items-center gap-1.5 mr-6 relative">
      <button
        onClick={toggleUiLang}
        className="p-2 hover:bg-[var(--kilang-ctrl-bg)] rounded-full transition text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)] active:scale-90"
        title="Toggle UI Language"
      >
        <Languages className="w-4 h-4" />
      </button>
      <div
        className="relative flex items-center h-10"
        onMouseEnter={() => {
          if (paletteHoverTimeoutRef.current) clearTimeout(paletteHoverTimeoutRef.current);
          setIsPaletteHovered(true);
        }}
        onMouseLeave={() => {
          paletteHoverTimeoutRef.current = setTimeout(() => {
            setIsPaletteHovered(false);
          }, 1000); // 1s grace period
        }}
      >
        <button
          onClick={() => dispatch({ type: 'SET_UI', showThemeBar: true, themeBarTab: 'themes', sidebarTab: 'styling' })}
          className={`p-2 hover:bg-[var(--kilang-ctrl-bg)] rounded-full transition active:scale-90 ${showThemeBar ? 'bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)]' : 'text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)]'}`}
          title="Aesthetics & Themes"
        >
          <Palette className="w-4 h-4" />
        </button>

        {/* Palette Hover Dropdown (Horizontal) - No Container Styling */}
        <div className={`absolute left-full ml-1 flex items-center gap-2.5 p-1 transition-all duration-300 origin-left z-[100] ${isPaletteHovered ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-90 -translate-x-2 pointer-events-none'}`}>
          {[
            { color: '#3b82f6', label: 'Kakarayan', id: 'kakarayan', glow: 'rgba(59,130,246,0.5)' },
            { color: '#10b981', label: 'Papah', id: 'papah', glow: 'rgba(16,185,129,0.5)' },
            { color: '#6366f1', label: 'Ngidan', id: 'ngidan', glow: 'rgba(99,102,241,0.5)' }
          ].map((t, idx) => (
            <button
              key={idx}
              onClick={() => dispatch({ type: 'SET_UI', showThemeBar: true, themeBarTab: 'themes', theme: t.id })}
              className="w-12 h-12 flex items-center justify-center transition-all active:scale-95 group/item relative shrink-0"
              title={t.label}
            >
              {/* Dynamic Glow behind the logo */}
              <div
                className="absolute inset-2 blur-lg opacity-30 group-hover/item:opacity-60 transition-all duration-500 rounded-full z-0"
                style={{ backgroundColor: t.color }}
              />

              <div
                className="w-[38px] h-[38px] relative z-10 flex items-center justify-center"
                style={{ filter: `drop-shadow(0 0 12px ${t.glow}) brightness(1.1) contrast(1.1)` }}
              >
                <img
                  src="/kilang/Kilang_5_nobg.png"
                  alt=""
                  className="w-full h-full object-contain drop-shadow-lg"
                  style={{ opacity: 1 }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
