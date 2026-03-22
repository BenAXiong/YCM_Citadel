'use client';

import React from 'react';
import { Search, Library } from 'lucide-react';
import { useSidebar } from '../SidebarContext';

interface BookmarkControlsProps {
  showPlusOne: string | null;
  showMinusOne: string | null;
}

export const BookmarkControls = ({ showPlusOne, showMinusOne }: BookmarkControlsProps) => {
  const {
    searchTerm,
    dispatch
  } = useSidebar();

  const showCustomPanel = useSidebar().showCustomPanel;

  return (
    <div className="relative z-[50] px-3 py-6 space-y-6">
      <div className="flex gap-2">
        <div className="relative group flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-[var(--kilang-text-muted)] group-focus-within:text-[var(--kilang-text)] transition-colors" />
          <input
            type="text"
            placeholder="Search saved roots"
            value={searchTerm}
            onChange={(e) => {
              dispatch({ type: 'SET_UI', searchTerm: e.target.value });
            }}
            className="w-full bg-[var(--kilang-bg-base)]/50 border border-[var(--kilang-border-std)] rounded-xl py-3 pl-10 pr-12 text-sm text-[var(--kilang-text)] placeholder:text-[var(--kilang-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--kilang-primary-glow)] focus:border-[var(--kilang-primary-border)]/40 transition-all font-medium"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => dispatch({ type: 'SET_UI', showCustomPanel: !showCustomPanel })}
            className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all hover:scale-105 active:scale-95 ${showCustomPanel ? 'bg-[var(--kilang-primary-bg)]/80 border-[var(--kilang-primary-border)] text-[var(--kilang-text)] shadow-[var(--kilang-primary-glow)]' : 'bg-[var(--kilang-secondary-bg)]/80 border-[var(--kilang-secondary-border)] text-[var(--kilang-secondary-text)] shadow-[var(--kilang-secondary-glow)]'}`}
            title="Custom Tree Builder"
          >
            <Library className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs font-bold text-[var(--kilang-secondary)] uppercase tracking-widest px-1 animate-in slide-in-from-left-2 duration-300">
        <Library className="w-3.5 h-3.5" />
        My Private Forest
      </div>
    </div>
  );
};
