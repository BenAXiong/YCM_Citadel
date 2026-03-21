import React, { useState, useRef } from 'react';
import { Languages, Palette, ExternalLink } from 'lucide-react';
import { useKilangContext } from '../../KilangContext';
import { THEME_PRESETS } from '../../kilangConstants';

export const QuickActions = () => {
  const { state, dispatch, toggleUiLang } = useKilangContext();
  const { showThemeBar } = state;
  const [isPaletteHovered, setIsPaletteHovered] = useState(false);
  const paletteHoverTimeoutRef = useRef<any>(null);

  const openThemePopout = () => {
    const width = 360;
    const height = 800;
    const left = window.screen.width - width - 50;
    const top = 50;
    window.open(
      `${window.location.origin}${window.location.pathname}?standalone=themebar`,
      'KilangThemeStudio',
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
    );
  };

  return (
    <div className="flex items-center gap-1 relative">
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
          onClick={() => dispatch({ type: 'SET_UI', showThemeBar: !showThemeBar, themeBarTab: 'themes', sidebarTab: 'styling' })}
          className={`p-2 hover:bg-[var(--kilang-ctrl-bg)] rounded-full transition active:scale-90 ${showThemeBar ? 'bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)]' : 'text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)]'}`}
          title="Aesthetics & Themes"
        >
          <Palette className="w-4 h-4" />
        </button>

        {/* Palette Hover Dropdown (Horizontal) */}
        {state.showFloatingPalette && (
          <div className={`absolute left-full ml-1 flex items-center gap-2 p-1.5 transition-all duration-300 origin-left z-[100] ${isPaletteHovered ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-90 -translate-x-2 pointer-events-none'}`}>
            <div className="flex items-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-full px-2 py-1 gap-1">
              {THEME_PRESETS.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => dispatch({ type: 'SET_UI', showThemeBar: true, themeBarTab: 'themes', theme: t.id })}
                  className="w-10 h-10 flex items-center justify-center transition-all active:scale-95 group/item relative shrink-0"
                  title={t.label}
                >
                  <div
                    className="absolute inset-2 blur-lg opacity-20 group-hover/item:opacity-50 transition-all duration-500 rounded-full z-0"
                    style={{ backgroundColor: t.color }}
                  />
                  <div
                    className="w-[30px] h-[30px] relative z-10 flex items-center justify-center opacity-60 group-hover/item:opacity-100 transition-opacity"
                    style={{ filter: `drop-shadow(0 0 8px ${t.color}44)` }}
                  >
                    <img
                      src="/kilang/Kilang_5_nobg.png"
                      alt=""
                      className={`w-full h-full object-contain ${state.layoutConfig.theme === t.id ? 'brightness-125' : 'brightness-75'}`}
                    />
                  </div>
                </button>
              ))}

              {/* Separator */}
              <div className="w-[1px] h-6 bg-white/10 mx-1" />

              {/* Popout Button - Always Last */}
              <button
                onClick={openThemePopout}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white/30 hover:text-white transition-all active:scale-90"
                title="Launch Popout Studio"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
