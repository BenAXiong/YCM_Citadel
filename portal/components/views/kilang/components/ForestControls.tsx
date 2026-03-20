'use client';

import React from 'react';
import { Search, Filter, XCircle, Library, TreePine, Sprout } from 'lucide-react';
import { useSidebar } from '../SidebarContext';

interface ForestControlsProps {
  showPlusOne: boolean;
  showMinusOne: boolean;
}

export const ForestControls = ({ showPlusOne, showMinusOne }: ForestControlsProps) => {
  const {
    showMyTrees,
    setShowMyTrees,
    searchTerm,
    branchFilter,
    FILTER_BUCKETS,
    bucketHits,
    dispatch
  } = useSidebar();

  return (
    <div className="relative z-[50] p-6 space-y-6">
      <div className="flex gap-2">
        <div className="relative group flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-[var(--kilang-text-muted)] group-focus-within:text-[var(--kilang-text)] transition-colors" />
          <input
            type="text"
            placeholder={showMyTrees ? "Search saved roots" : "Search roots"}
            value={searchTerm}
            onChange={(e) => {
              dispatch({ type: 'SET_UI', searchTerm: e.target.value });
              if (showMyTrees) setShowMyTrees(false);
            }}
            className="w-full bg-[var(--kilang-bg-base)]/50 border border-[var(--kilang-border-std)] rounded-xl py-3 pl-10 pr-12 text-sm text-[var(--kilang-text)] placeholder:text-[var(--kilang-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--kilang-primary-glow)] focus:border-[var(--kilang-primary-border)]/40 transition-all font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => dispatch({ type: 'SET_UI', searchTerm: '' })}
              className="absolute right-3 top-3 text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)] transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMyTrees(!showMyTrees)}
            className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all hover:scale-105 active:scale-95 ${showMyTrees ? 'bg-[var(--kilang-secondary-bg)]/80 border-[var(--kilang-secondary-border)] text-[var(--kilang-secondary-text)] shadow-lg shadow-[var(--kilang-secondary-glow)]' : 'bg-[var(--kilang-primary-bg)]/80 border-[var(--kilang-primary-border)] text-[var(--kilang-primary-text)] shadow-lg shadow-[var(--kilang-primary-glow)] hover:bg-[var(--kilang-primary-bg)]'}`}
            title={showMyTrees ? "Back to Forest" : "My Trees"}
          >
            {showMyTrees ? <Filter className="w-5 h-5" /> : <Library className="w-5 h-5" />}
          </button>
          {showPlusOne && (
            <div className="absolute top-1/2 left-1/2 flex items-center gap-1 text-[var(--kilang-primary)] font-black pointer-events-none animate-bloom-pop z-[100] drop-shadow-[0_0_20px_var(--kilang-primary-glow)]">
              <TreePine className="w-5 h-5" />
              <span className="text-sm tracking-tighter self-center">+1</span>
            </div>
          )}
          {showMinusOne && (
            <div className="absolute top-1/2 left-1/2 flex items-center gap-1 text-[var(--kilang-secondary)] font-black pointer-events-none animate-bloom-pop z-[100] drop-shadow-[0_0_20px_var(--kilang-secondary-glow)]">
              <Sprout className="w-5 h-5" />
              <span className="text-sm tracking-tighter self-center">-1</span>
            </div>
          )}
        </div>
      </div>

      {!showMyTrees ? (
        <div className="space-y-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--kilang-text-muted)] uppercase tracking-widest px-1">
            <Filter className="w-3.5 h-3.5" />
            Branches Count
          </div>
          <div className="grid grid-cols-5 gap-2">
            <button
              onClick={() => dispatch({ type: 'SET_UI', branchFilter: 'all' })}
              className={`py-2 rounded-lg border text-[10px] font-black transition-all ${branchFilter === 'all' ? 'bg-[var(--kilang-ctrl-active)] border-[var(--kilang-primary-border)] text-[var(--kilang-ctrl-active-text)] shadow-lg' : 'bg-[var(--kilang-card)] border-[var(--kilang-border-std)] text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)]'}`}
            >
              ANY
            </button>
            {FILTER_BUCKETS.map((bucket) => {
              const isActive = branchFilter === bucket.label;
              return (
                <button
                  key={bucket.label}
                  onClick={() => dispatch({ type: 'SET_UI', branchFilter: bucket.label })}
                  className={`py-2 rounded-lg border text-[10px] font-black flex flex-col items-center justify-center transition-all ${isActive ? 'bg-[var(--kilang-ctrl-active)] border-[var(--kilang-primary-border)] text-[var(--kilang-ctrl-active-text)] shadow-lg' : 'bg-[var(--kilang-card)] border-[var(--kilang-border-std)] text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)]'}`}
                >
                  <span>{bucket.label}</span>
                  <span className="text-[8px] opacity-60 mt-0.5">({bucketHits[bucket.label] || 0})</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--kilang-secondary)] uppercase tracking-widest px-1 animate-in slide-in-from-left-2 duration-300">
          <Library className="w-3.5 h-3.5" />
          My Private Forest
        </div>
      )}
    </div>
  );
};
