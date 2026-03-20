'use client';

import React from 'react';
import { Filter } from 'lucide-react';

interface FilterPanelProps {
  branchFilter: string;
  FILTER_BUCKETS: any[];
  bucketHits: Record<string, number>;
  dispatch: (action: any) => void;
}

export const FilterPanel = ({ 
  branchFilter, 
  FILTER_BUCKETS, 
  bucketHits, 
  dispatch 
}: FilterPanelProps) => {
  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      <div className="flex items-center gap-2 text-xs font-bold text-[var(--kilang-text-muted)] uppercase tracking-widest px-1">
        <Filter className="w-3.5 h-3.5" />
        Branches Count
      </div>
      <div className="grid grid-cols-5 gap-2">
        <button
          onClick={() => dispatch({ type: 'SET_UI', branchFilter: 'all' })}
          className={`py-2 rounded-lg border text-[10px] font-black transition-all ${branchFilter === 'all' ? 'bg-[var(--kilang-ctrl-active)] border-[var(--kilang-primary-border)] text-[var(--kilang-ctrl-active-text)] shadow-[var(--kilang-shadow-primary)]' : 'bg-[var(--kilang-card)] border-[var(--kilang-border-std)] text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)]'}`}
        >
          ANY
        </button>
        {FILTER_BUCKETS.map((bucket) => {
          const isActive = branchFilter === bucket.label;
          return (
            <button
              key={bucket.label}
              onClick={() => dispatch({ type: 'SET_UI', branchFilter: bucket.label })}
              className={`py-2 rounded-lg border text-[10px] font-black flex flex-col items-center justify-center transition-all ${isActive ? 'bg-[var(--kilang-ctrl-active)] border-[var(--kilang-primary-border)] text-[var(--kilang-ctrl-active-text)] shadow-[var(--kilang-shadow-primary)]' : 'bg-[var(--kilang-card)] border-[var(--kilang-border-std)] text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)]'}`}
            >
              <span>{bucket.label}</span>
              <span className="text-[8px] opacity-60 mt-0.5">({bucketHits[bucket.label] || 0})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
