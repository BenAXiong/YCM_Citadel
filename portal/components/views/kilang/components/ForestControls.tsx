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
    <div className="sticky top-0 z-[50] p-6 bg-transparent backdrop-blur-xl border-b border-white/5 space-y-6">
      <div className="flex gap-2">
        <div className="relative group flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-kilang-text-muted group-focus-within:text-blue-500" />
          <input
            type="text"
            placeholder={showMyTrees ? "Search saved roots" : "Search semantic roots..."}
            value={searchTerm}
            onChange={(e) => {
              dispatch({ type: 'SET_UI', searchTerm: e.target.value });
              if (showMyTrees) setShowMyTrees(false);
            }}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => dispatch({ type: 'SET_UI', searchTerm: '' })}
              className="absolute right-3 top-3 text-kilang-text-muted hover:text-white transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMyTrees(!showMyTrees)}
            className={`w-11 h-11 rounded-xl flex items-center justify-center border bg-blue-600/20 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/10 transition-all hover:bg-blue-600/30 hover:scale-105 active:scale-95`}
            title={showMyTrees ? "Back to Forest" : "My Trees"}
          >
            {showMyTrees ? <Filter className="w-5 h-5" /> : <Library className="w-5 h-5" />}
          </button>
          {showPlusOne && (
            <div className="absolute top-1/2 left-1/2 flex items-center gap-1 text-blue-400 font-black pointer-events-none animate-bloom-pop z-[100] drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]">
              <TreePine className="w-5 h-5" />
              <span className="text-sm tracking-tighter self-center">+1</span>
            </div>
          )}
          {showMinusOne && (
            <div className="absolute top-1/2 left-1/2 flex items-center gap-1 text-rose-500 font-black pointer-events-none animate-bloom-pop z-[100] drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]">
              <Sprout className="w-5 h-5" />
              <span className="text-sm tracking-tighter self-center">-1</span>
            </div>
          )}
        </div>
      </div>

      {!showMyTrees ? (
        <div className="space-y-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-xs font-bold text-kilang-text-muted uppercase tracking-widest px-1">
            <Filter className="w-3.5 h-3.5" />
            Branches Count
          </div>
          <div className="grid grid-cols-5 gap-2">
            <button
              onClick={() => dispatch({ type: 'SET_UI', branchFilter: 'all' })}
              className={`py-2 rounded-lg border text-[10px] font-black ${branchFilter === 'all' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-kilang-text-muted'}`}
            >
              ANY
            </button>
            {FILTER_BUCKETS.map((bucket) => (
              <button
                key={bucket.label}
                onClick={() => dispatch({ type: 'SET_UI', branchFilter: bucket.label })}
                className={`py-2 rounded-lg border text-[10px] font-black flex flex-col items-center justify-center ${branchFilter === bucket.label ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-kilang-text-muted'}`}
              >
                <span>{bucket.label}</span>
                <span className="text-[8px] opacity-60 mt-0.5">({bucketHits[bucket.label] || 0})</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest px-1 animate-in slide-in-from-left-2 duration-300">
          <Library className="w-3.5 h-3.5" />
          My Private Forest
        </div>
      )}
    </div>
  );
};
