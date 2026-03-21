'use client';

import React from 'react';
import { THEME_PRESETS } from '../../kilangConstants';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const PresetBand = ({ 
  currentTheme, 
  dispatch, 
  state 
}: { 
  currentTheme: string; 
  dispatch: any; 
  state: any;
}) => {
  return (
    <div className="w-full h-[100px] bg-black border-b border-white/10 flex items-center px-6 overflow-x-auto no-scrollbar gap-6 shrink-0 relative">
      <div className="absolute inset-0 bg-white/[0.02] pointer-events-none" />
      {THEME_PRESETS.map((t) => (
        <button
          key={t.id}
          onClick={() => {
            dispatch({ 
              type: 'SYNC_HOLISTIC_THEME', 
              theme: t.id, 
              layoutConfig: {
                ...t.config,
                theme: t.id // Ensure theme ID is explicitly set
              },
              branding: {
                logoStyles: state.logoStyles,
                logoSettings: {
                  ...state.logoSettings,
                  [state.landingVersion || 2]: {
                    ...state.logoSettings[state.landingVersion || 2],
                    glowColor: t.color
                  }
                },
                landingVersion: state.landingVersion
              }
            });
          }}
          className={`flex flex-col items-center gap-1.5 group relative transition-all ${currentTheme === t.id ? 'scale-110 px-2' : 'opacity-40 hover:opacity-100'}`}
        >
           {/* Original Glow Styling */}
           <div className="relative w-12 h-12 flex items-center justify-center">
            <div 
              className={`absolute inset-0 blur-2xl rounded-full transition-all duration-500 scale-150 ${currentTheme === t.id ? 'opacity-90' : 'opacity-0 scale-50 group-hover:opacity-40'}`} 
              style={{ backgroundColor: t.color }} 
            />
            <div 
              className={`w-12 h-12 rounded-full flex items-center justify-center bg-black/20 backdrop-blur-md transition-all duration-300 ${currentTheme === t.id ? 'shadow-[0_0_30px_rgba(255,255,255,0.05)]' : ''}`}
            >
              <img 
                src="/kilang/kilang_5_nobg_noring2.png" 
                className={`w-8 h-8 transition-all duration-500 ${currentTheme === t.id ? 'brightness-150 scale-110' : 'brightness-50 grayscale group-hover:grayscale-0 group-hover:brightness-100'}`}
                style={{ filter: currentTheme === t.id ? `drop-shadow(0 0 8px ${t.color})` : 'none' }}
                alt=""
              />
            </div>
          </div>
          <span className={`text-[9px] font-black uppercase tracking-widest transition-all ${currentTheme === t.id ? 'text-white' : 'text-white/20 group-hover:text-white'}`}>
            {t.label}
          </span>
        </button>
      ))}
    </div>
  );
};
