'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useKilangContext } from '../../KilangContext';
import { MorphMode } from '../../kilangReducer';

export const SourceSelector = () => {
  const { state, dispatch, MOE_SOURCES } = useKilangContext();
  const { morphMode, sourceFilter, sourceCounts } = state;

  const setMorphMode = (mode: MorphMode) => dispatch({ type: 'SET_CONFIG', morphMode: mode });
  const setSourceFilter = (filter: string) => dispatch({ type: 'SET_CONFIG', sourceFilter: filter });

  return (
    <div className="flex items-center gap-3 lg:gap-8 pl-10 pr-2 h-full">
      {/* Consolidated Source & Mode Dropdown */}
      <div className="relative group flex h-8 bg-[var(--kilang-ctrl-bg)] border border-[var(--kilang-border-std)] rounded-lg p-0.5 items-stretch">
        <button
          className="px-3 h-full kilang-ctrl-btn text-[10px] font-black tracking-widest flex items-center gap-2 group/btn text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)]"
          title="Select Morphological Source & Mode"
        >
          <div className="flex items-center gap-1.5 min-w-[60px] justify-between">
            <span>
              {morphMode === 'moe' 
                ? (sourceFilter === 'ALL' ? 'MoE (all)' : (MOE_SOURCES.find((s: any) => s.id === sourceFilter)?.label.split(' ')[0] || 'MoE'))
                : (morphMode === 'plus' ? 'Kilang' : 'Kilang+')
              }
            </span>
            <ChevronDown className="w-2.5 h-2.5 opacity-40 shrink-0 group-hover/btn:scale-110 transition-transform" />
          </div>
        </button>

        {/* CONSOLIDATED DROPDOWN MENU */}
        <div className="absolute top-full left-0 mt-1 w-64 bg-[var(--kilang-bg-base)]/95 backdrop-blur-xl border border-[var(--kilang-border-std)] rounded-xl shadow-[var(--kilang-shadow-primary)] p-1.5 hidden group-hover:block z-[3000] animate-in fade-in slide-in-from-top-2 duration-200">
          {/* SECTION: MoE (ALL) */}
          <div className="relative group/tip">
            <button
              onClick={() => { setSourceFilter('ALL'); setMorphMode('moe'); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-[12px] font-black tracking-[0.1em] uppercase transition-all flex items-center gap-3 mb-1 ${sourceFilter === 'ALL' && morphMode === 'moe' ? 'bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)] shadow-[var(--kilang-shadow-primary)]' : 'text-[var(--kilang-text-muted)] hover:bg-[var(--kilang-ctrl-active)]/5 hover:text-[var(--kilang-text)]'}`}
            >
              <div className={`w-2 h-2 rounded-full ${sourceFilter === 'ALL' && morphMode === 'moe' ? 'bg-[var(--kilang-text)] ring-2 ring-[var(--kilang-primary-glow)]' : 'bg-[var(--kilang-primary)]'}`} />
              <span className="flex-1">MoE (all)</span>
              {sourceFilter === 'ALL' && morphMode === 'moe' && <div className="w-1 h-1 rounded-full bg-[var(--kilang-text)] animate-pulse" />}
            </button>
            {/* Fixed Tooltip */}
            <div className="absolute left-full ml-2 top-0 w-48 bg-[var(--kilang-bg-base)]/90 backdrop-blur-xl border border-[var(--kilang-border-std)] rounded-lg p-2.5 shadow-[var(--kilang-shadow-primary)] z-[5000] invisible group-hover/tip:visible opacity-0 group-hover/tip:opacity-100 transition-all scale-95 group-hover/tip:scale-100 origin-left">
              <div className="text-[9px] text-[var(--kilang-text-muted)] leading-relaxed font-sans normal-case tracking-normal">
                Ministry of Education Amis Dictionary (Consolidated). Merges all selected authoritative sources into a single morphological view.
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-[var(--kilang-border)] my-1 mx-2" />

          {/* SECTION: MoE SPECIFIC DICS */}
          <div className="space-y-0.5">
            {MOE_SOURCES.filter((s: any) => s.id !== 'ALL').map((s: any) => {
              const isActive = sourceFilter === s.id && morphMode === 'moe';
              return (
                <div key={s.id} className="relative group/tip">
                  <button
                    onClick={() => { setSourceFilter(s.id); setMorphMode('moe'); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-black tracking-widest uppercase transition-all flex items-center gap-3 ${isActive ? `bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)] shadow-[var(--kilang-shadow-primary)]` : 'text-[var(--kilang-text-muted)] hover:bg-[var(--kilang-ctrl-active)]/5 hover:text-[var(--kilang-text)]'}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[var(--kilang-ctrl-active-text)] ring-2 ring-[var(--kilang-ctrl-active-text)]/30' : 'bg-[var(--kilang-ctrl-bg)]'}`} />
                    <span className="flex-1">{s.label}</span>
                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${isActive ? 'bg-[var(--kilang-ctrl-active-text)]/20 text-[var(--kilang-ctrl-active-text)]' : 'bg-[var(--kilang-ctrl-bg)] text-[var(--kilang-text-muted)]'}`}>
                      {sourceCounts[s.id] ? `${sourceCounts[s.id].r.toLocaleString()}/${sourceCounts[s.id].e.toLocaleString()}` : '.../...'}
                    </span>
                  </button>
                  {/* Dynamic Tooltip */}
                  {s.tooltip && (
                    <div className="absolute left-full ml-2 top-0 w-48 bg-[var(--kilang-bg-base)]/90 backdrop-blur-xl border border-[var(--kilang-border-std)] rounded-lg p-2.5 shadow-[var(--kilang-shadow-primary)] z-[5000] invisible group-hover/tip:visible opacity-0 group-hover/tip:opacity-100 transition-all scale-95 group-hover/tip:scale-100 origin-left">
                      <div className="text-[9px] text-[var(--kilang-text-muted)] leading-relaxed font-sans normal-case tracking-normal">
                        {s.tooltip}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="h-[1px] bg-[var(--kilang-border-std)] mt-2 mb-1 mx-2" />

          {/* SECTION: ADVANCED MODES (KILANG) */}
          <div className="space-y-0.5">
            <div className="relative group/tip">
              <button
                onClick={() => setMorphMode('plus')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-[12px] font-black tracking-[0.1em] uppercase transition-all flex items-center gap-3 ${morphMode === 'plus' ? 'bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)] shadow-[var(--kilang-shadow-primary)]' : 'text-[var(--kilang-text-muted)] hover:bg-[var(--kilang-ctrl-active)]/5 hover:text-[var(--kilang-text)]'}`}
              >
                <div className={`w-2 h-2 rounded-full ${morphMode === 'plus' ? 'bg-[var(--kilang-ctrl-active-text)] ring-2 ring-[var(--kilang-ctrl-active-text)]/30' : 'bg-[var(--kilang-secondary)]'}`} />
                <span className="flex-1">Kilang</span>
                {morphMode === 'plus' && <div className="w-1 h-1 rounded-full bg-[var(--kilang-ctrl-active-text)] animate-pulse" />}
              </button>
              <div className="absolute left-full ml-2 top-0 w-48 bg-black/90 backdrop-blur-xl border border-[var(--kilang-border-std)] rounded-lg p-2.5 shadow-2xl z-[5000] invisible group-hover/tip:visible opacity-0 group-hover/tip:opacity-100 transition-all scale-95 group-hover/tip:scale-100 origin-left">
                <div className="text-[9px] text-[var(--kilang-text-muted)] leading-relaxed font-sans normal-case tracking-normal">
                  ENHANCED: Uses heuristic substring matching to bridge gaps in the official dictionary, revealing denser morphological clusters.
                </div>
              </div>
            </div>

            <div className="relative group/tip">
              <button
                onClick={() => setMorphMode('star')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-[12px] font-black tracking-[0.1em] uppercase transition-all flex items-center gap-3 ${morphMode === 'star' ? 'bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)] shadow-[var(--kilang-shadow-primary)]' : 'text-[var(--kilang-text-muted)] hover:bg-[var(--kilang-ctrl-active)]/5 hover:text-[var(--kilang-text)]'}`}
              >
                <div className={`w-2 h-2 rounded-full ${morphMode === 'star' ? 'bg-[var(--kilang-ctrl-active-text)] ring-2 ring-[var(--kilang-ctrl-active-text)]/30' : 'bg-[var(--kilang-accent)]'}`} />
                <span className="flex-1">Kilang+</span>
                {morphMode === 'star' && <div className="w-1 h-1 rounded-full bg-[var(--kilang-ctrl-active-text)] animate-pulse" />}
              </button>
              <div className="absolute left-full ml-2 top-0 w-48 bg-black/90 backdrop-blur-xl border border-[var(--kilang-border-std)] rounded-lg p-2.5 shadow-2xl z-[5000] invisible group-hover/tip:visible opacity-0 group-hover/tip:opacity-100 transition-all scale-95 group-hover/tip:scale-100 origin-left">
                <div className="text-[9px] text-white/70 leading-relaxed font-sans normal-case tracking-normal">
                  EXPERIMENTAL: Dialectal triangulation and phonetic law matching (e.g. u/o drift). High-connectivity exploratory mode.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
