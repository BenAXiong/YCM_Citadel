'use client';

import React from 'react';
import { Search, Filter, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { WordTooltip } from './KilangNode';

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
  summaryCache: Record<string, string[]>;
  fetchSummary: (word: string) => Promise<void>;
  isCollapsed: boolean;
  onToggle: () => void;
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
  FILTER_BUCKETS,
  summaryCache,
  fetchSummary,
  isCollapsed,
  onToggle
}: KilangSidebarProps) => {
  if (isCollapsed) {
    return (
      <aside className="w-16 border-r border-white/5 flex flex-col items-center py-6 kilang-glass-panel transition-all duration-300">
        <button
          onClick={onToggle}
          className="p-3 rounded-xl bg-white/5 border border-white/10 text-kilang-text-muted hover:text-white hover:bg-blue-600/20 hover:border-blue-500/50 transition-all shadow-lg"
          title="Expand Filters"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="mt-8 flex flex-col items-center gap-6">
          <Search className="w-5 h-5 text-kilang-text-muted/40" />
          <Filter className="w-5 h-5 text-kilang-text-muted/40" />
          <div className="h-px w-8 bg-white/5" />
          <div className="[writing-mode:vertical-lr] text-[10px] font-black text-kilang-text-muted/30 uppercase tracking-[0.4em] rotate-180">
            Tree Registry
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-96 border-r border-white/5 flex flex-col kilang-glass-panel transition-all duration-300 relative overflow-y-auto custom-scrollbar no-scrollbar">
      <button
        onClick={onToggle}
        className="absolute -right-4 top-10 w-8 h-8 rounded-full bg-[#1e293b] border border-white/10 flex items-center justify-center text-kilang-text-muted hover:text-white hover:border-blue-500 shadow-xl z-[60] transition-all group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:scale-110 transition-transform" />
      </button>

      {/* 1. Sticky Header Controls */}
      <div className="p-6 space-y-4 sticky top-0 bg-[#0f172a]/95 backdrop-blur-xl z-50 border-b border-white/5 shadow-xl">
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
          <button onClick={() => setBranchFilter('all')} title="Show all roots regardless of branch count" className={`py-2 rounded-lg border text-[10px] font-black ${branchFilter === 'all' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-kilang-text-muted'}`}>ANY</button>
          {FILTER_BUCKETS.map((bucket) => (
            <button key={bucket.label} onClick={() => setBranchFilter(bucket.label)} title={`Show roots with ${bucket.label} branches`} className={`py-2 rounded-lg border text-[10px] font-black flex flex-col items-center justify-center ${branchFilter === bucket.label ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-kilang-text-muted'}`}><span>{bucket.label}</span><span className="text-[8px] opacity-60 mt-0.5">({bucketHits[bucket.label] || 0})</span></button>
          ))}
        </div>
      </div>

      {/* 2. Scrollable Word List */}
      <div className="px-6 py-6 space-y-2">
        {filteredRoots.map((r, i) => (
          <WordTooltip
            key={i}
            word={r.root}
            summaryCache={summaryCache}
            fetchSummary={fetchSummary}
            className="w-full block relative"
          >
            <div onClick={() => fetchRootDetails(r.root)} className={`px-4 py-2.5 rounded-xl watering-can-cursor transition-all border flex items-center justify-between group ${selectedRoot === r.root ? 'bg-blue-600/20 border-blue-500/50' : 'bg-white/5 border-white/5 hover:border-white/20'}`}>
              <span className="text-[13px] font-bold text-white uppercase tracking-tight">{r.root}</span>
              <span className="text-xs font-black text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md">{r.count}</span>
            </div>
          </WordTooltip>
        ))}
      </div>
    </aside>
  );
};
