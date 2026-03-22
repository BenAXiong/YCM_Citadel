'use client';

import React from 'react';
import { Search, XCircle } from 'lucide-react';
import { useSidebar } from '../SidebarContext';

import { FilterPanel } from './sidebar/FilterPanel';

interface ForestControlsProps {
  showPlusOne: string | null;
  showMinusOne: string | null;
}

export const ForestControls = ({ showPlusOne, showMinusOne }: ForestControlsProps) => {
  const {
    searchTerm,
    branchFilter,
    FILTER_BUCKETS,
    bucketHits,
    dispatch
  } = useSidebar();

  return (
    <div className="relative z-[50] px-3 py-6 space-y-6">
      <div className="flex gap-2">
        <div className="relative group flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-[var(--kilang-text-muted)] group-focus-within:text-[var(--kilang-text)] transition-colors" />
          <input
            type="text"
            placeholder="Search roots"
            value={searchTerm}
            onChange={(e) => {
              dispatch({ type: 'SET_UI', searchTerm: e.target.value });
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
      </div>

      <FilterPanel
        branchFilter={branchFilter}
        FILTER_BUCKETS={FILTER_BUCKETS}
        bucketHits={bucketHits}
        dispatch={dispatch}
      />
    </div>
  );
};
