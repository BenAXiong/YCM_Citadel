'use client';

import React from 'react';
import { Search, Filter, XCircle } from 'lucide-react';

interface KilangSidebarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  branchFilter: string;
  setBranchFilter: (filter: string) => void;
  filteredRoots: any[];
  selectedRoot: string | null;
  fetchRootDetails: (root: string) => Promise<void>;
  bucketHits: Record<string, number>;
  FILTER_BUCKETS: Array<{ label: string; min: number; max: number }>;
}

export const KilangSidebar = ({
  searchTerm,
  setSearchTerm,
  branchFilter,
  setBranchFilter,
  filteredRoots,
  selectedRoot,
  fetchRootDetails,
  bucketHits,
  FILTER_BUCKETS
}: KilangSidebarProps) => {
  return (
    <aside className="w-96 border-r border-white/5 flex flex-col kilang-glass-panel">
      <div className="p-6 space-y-4">
        <div className="relative group">
          <Search className="absolute left-3 top-3 w-4 h-4 text-kilang-text-muted group-focus-within:text-blue-500" />
          <input
            type="text"
            placeholder="Search semantic roots..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-3 text-kilang-text-muted hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-kilang-text-muted uppercase tracking-widest px-1"><Filter className="w-3.5 h-3.5" /> Filter by Number of Branches</div>
        <div className="grid grid-cols-5 gap-2">
          <button onClick={() => setBranchFilter('all')} className={`py-2 rounded-lg border text-[10px] font-black ${branchFilter === 'all' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-kilang-text-muted'}`}>ANY</button>
          {FILTER_BUCKETS.map((bucket) => (
            <button key={bucket.label} onClick={() => setBranchFilter(bucket.label)} className={`py-2 rounded-lg border text-[10px] font-black flex flex-col items-center justify-center ${branchFilter === bucket.label ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-kilang-text-muted'}`}><span>{bucket.label}</span><span className="text-[8px] opacity-60 mt-0.5">({bucketHits[bucket.label] || 0})</span></button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 space-y-2">
        {filteredRoots.map((r, i) => (
          <div key={i} onClick={() => fetchRootDetails(r.root)} className={`px-4 py-2.5 rounded-xl cursor-pointer transition-all border flex items-center justify-between group ${selectedRoot === r.root ? 'bg-blue-600/20 border-blue-500/50' : 'bg-white/5 border-white/5 hover:border-white/20'}`}>
            <span className="text-[13px] font-bold text-white uppercase tracking-tight">{r.root}</span>
            <span className="text-xs font-black text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md">{r.count}</span>
          </div>
        ))}
      </div>
    </aside>
  );
};
