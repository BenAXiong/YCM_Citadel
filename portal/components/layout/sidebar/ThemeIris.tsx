import React from 'react';
import { Palette } from "lucide-react";
import { Theme } from "@/types";

interface ThemeIrisProps {
  theme: Theme;
  cycleTheme: () => void;
  setTheme: (val: Theme) => void;
  setPreviewTheme: (val: Theme | null) => void;
  setPreviewColors: (val: Record<string, string> | null) => void;
  setCustomColors: (val: Record<string, string>) => void;
  customColors: Record<string, string>;
  savedThemes: Array<{ name: string, colors: Record<string, string> }>;
  THEMES_ORDER: string[];
  THEME_FULL_COLORS: Record<string, Record<string, string>>;
  showThemePicker: boolean;
  setShowThemePicker: (val: boolean) => void;
  setShowCustomEditor: (val: boolean) => void;
  pickerTimeout: React.MutableRefObject<NodeJS.Timeout | null>;
}

export function ThemeIris({
  theme,
  cycleTheme,
  setTheme,
  setPreviewTheme,
  setPreviewColors,
  setCustomColors,
  customColors,
  savedThemes,
  THEMES_ORDER,
  THEME_FULL_COLORS,
  showThemePicker,
  setShowThemePicker,
  setShowCustomEditor,
  pickerTimeout
}: ThemeIrisProps) {
  return (
    <>
      <div
        className="relative"
        onMouseEnter={() => {
          if (pickerTimeout.current) clearTimeout(pickerTimeout.current);
          setShowThemePicker(true);
        }}
        onMouseLeave={() => {
          pickerTimeout.current = setTimeout(() => {
            setShowThemePicker(false);
            setShowCustomEditor(false);
          }, 700);
        }}
      >
        <button
          onClick={cycleTheme}
          className="p-1.5 hover:bg-[var(--bg-highlight)] rounded-full transition text-[var(--accent)] hover:scale-125 z-50 relative group/pal"
        >
          <Palette className="w-4 h-4 drop-shadow-[0_0_8px_var(--accent-glow)]" />
          {/* MATCHING TOOLTIP FOR PALETTE */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/pal:opacity-100 pointer-events-none transition-opacity duration-300 delay-[600ms] flex flex-col items-center">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,1)] text-[var(--accent)]">
              {theme}
            </span>
          </div>
        </button>

        {showThemePicker && (
          <div className="absolute top-1/2 right-1/2 -translate-y-1/2 translate-x-1/2 pointer-events-none z-[9998]">
            <svg width="0" height="0" className="absolute">
              <defs>
                <clipPath id="hex-clip" clipPathUnits="objectBoundingBox">
                  <path d="M0.5,0 L0.933,0.25 L0.933,0.75 L0.5,1 L0.067,0.75 L0.067,0.25 Z" />
                </clipPath>
              </defs>
            </svg>
            {(() => {
              const radius = 95;
              interface ThemeItem { id: string; type: 'basic' | 'user' | 'maker'; colors: Record<string, string> };
              const items: ThemeItem[] = [
                ...THEMES_ORDER.map(t => ({ id: t, type: 'basic', colors: THEME_FULL_COLORS[t] } as ThemeItem)),
                ...savedThemes.map(t => ({ id: t.name, type: 'user', colors: t.colors } as ThemeItem)),
                { id: 'custom', type: 'maker', colors: customColors } as ThemeItem
              ];

              return items.map((item, idx) => {
                const angleDeg = (180 / (items.length - 1)) * idx;
                const angleRad = (angleDeg * Math.PI) / 180;
                const x = radius * Math.cos(angleRad);
                const y = radius * Math.sin(angleRad);

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.type === 'user' && item.colors) {
                        setTheme(item.id);
                        setCustomColors(item.colors);
                      } else {
                        setTheme(item.id);
                      }
                      if (item.id === 'custom') setShowCustomEditor(true);
                    }}
                    onMouseEnter={() => {
                      if (item.type === 'user' && item.colors) {
                        setPreviewTheme(item.id);
                        setPreviewColors(item.colors);
                      } else if (item.type === 'maker') {
                        setPreviewTheme('custom');
                        setPreviewColors(customColors);
                        setShowCustomEditor(true);
                      } else {
                        setPreviewTheme(item.id);
                      }
                    }}
                    onMouseLeave={() => {
                      setPreviewTheme(null);
                      setPreviewColors(null);
                    }}
                    className="absolute pointer-events-auto group/theme transition-all duration-500 animate-in fade-in zoom-in-50 -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${x}px`,
                      top: `${y}px`,
                      transitionDelay: `${idx * 40}ms`,
                      // Programmatic radial move on hover
                      '--out-x': `${Math.cos(angleRad) * 20}px`,
                      '--out-y': `${Math.sin(angleRad) * 20}px`,
                    } as React.CSSProperties}
                  >
                    <div className="relative group/hex transition-all duration-300 transform-gpu group-hover/theme:scale-150 group-hover/theme:translate-x-[var(--out-x)] group-hover/theme:translate-y-[var(--out-y)]">
                      <svg viewBox="0 0 100 100" className="w-12 h-12 overflow-visible">
                        <defs>
                          <linearGradient id={`grad-${idx}-${item.id.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            {/* SMOOTH GRADIENT: DOMINANT ACCENT TO DARK EDGE */}
                            <stop offset="0%" stopColor={item.colors['--accent']} stopOpacity="0.8" />
                            <stop offset="80%" stopColor={item.colors['--accent']} stopOpacity="0.5" />
                            <stop offset="100%" stopColor={item.colors['--bg-deep']} />
                          </linearGradient>
                          <filter id={`glow-${idx}-${item.id.replace(/\s+/g, '-')}`}>
                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                            <feMerge>
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>

                        {/* OUTER BORDER / GLOW TRACE - PERFECT HEXAGON (REGULAR) */}
                        <path
                          d="M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z"
                          fill="transparent"
                          stroke={item.colors['--accent']}
                          strokeWidth={theme === item.id ? "6" : "2"}
                          strokeOpacity={theme === item.id ? "1" : "0.3"}
                          className="transition-all duration-500"
                          filter={theme === item.id ? `url(#glow-${idx}-${item.id.replace(/\s+/g, '-')})` : ''}
                        />

                        {/* THEME PREVIEW CONTENT */}
                        <path
                          d="M50 4 L89.3 26.5 L89.3 73.5 L50 96 L10.7 73.5 L10.7 26.5 Z"
                          fill={`url(#grad-${idx}-${item.id.replace(/\s+/g, '-')})`}
                          stroke={item.colors['--accent']}
                          strokeWidth="1"
                          className="transition-all duration-300"
                        />
                      </svg>
                    </div>

                    {/* RADIAL TOOLTIP */}
                    <div
                      className="absolute opacity-0 group-hover/theme:opacity-100 pointer-events-none transition-opacity duration-300 delay-[600ms] flex flex-col items-center"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -50%) translate(${radius * 0.45 * Math.cos(angleRad)}px, ${radius * 0.45 * Math.sin(angleRad)}px)`,
                      }}
                    >
                      <span
                        className="text-[10px] font-mono font-bold uppercase tracking-widest whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,1)]"
                        style={{ color: item.colors['--accent'] }}
                      >
                        {item.id}
                      </span>
                    </div>
                  </button>
                );
              });
            })()}
          </div>
        )}
      </div>
    </>
  );
}
