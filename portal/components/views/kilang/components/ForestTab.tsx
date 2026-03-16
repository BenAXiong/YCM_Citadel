'use client';

import React from 'react';
import { Search, Filter, XCircle, Bookmark, TreePine, Sprout, Pin } from 'lucide-react';
import { WordTooltip } from '../KilangNode';

interface ForestTabProps {
  searchTerm: string;
  branchFilter: string;
  dispatch: React.Dispatch<any>;
  filteredRoots: any[];
  fetchRootDetails: (root: string) => Promise<void>;
  summaryCache: Record<string, string[]>;
  fetchSummary: (word: string) => Promise<void>;
  showMyTrees: boolean;
  setShowMyTrees: (val: boolean) => void;
  FILTER_BUCKETS: any[];
  bucketHits: Record<string, number>;
  bookmarks: any[];
  sortedBookmarks: any[];
  selectedRoot: string | null;
  saveBookmark: any;
  togglePin: any;
  deleteBookmark: any;
  loadBookmark: any;
  showPlusOne: boolean;
  showMinusOne: boolean;
}

export const ForestTab = ({
  searchTerm,
  branchFilter,
  dispatch,
  filteredRoots,
  fetchRootDetails,
  summaryCache,
  fetchSummary,
  showMyTrees,
  setShowMyTrees,
  FILTER_BUCKETS,
  bucketHits,
  bookmarks,
  sortedBookmarks,
  selectedRoot,
  saveBookmark,
  togglePin,
  deleteBookmark,
  loadBookmark,
  showPlusOne,
  showMinusOne
}: ForestTabProps) => {
  return (
    <div className="animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="sticky top-0 z-[50] p-6 bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/5 space-y-6">
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
              {showMyTrees ? <Filter className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
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
              <button onClick={() => dispatch({ type: 'SET_UI', branchFilter: 'all' })} className={`py-2 rounded-lg border text-[10px] font-black ${branchFilter === 'all' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-kilang-text-muted'}`}>ANY</button>
              {FILTER_BUCKETS.map((bucket) => (
                <button key={bucket.label} onClick={() => dispatch({ type: 'SET_UI', branchFilter: bucket.label })} className={`py-2 rounded-lg border text-[10px] font-black flex flex-col items-center justify-center ${branchFilter === bucket.label ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-kilang-text-muted'}`}>
                  <span>{bucket.label}</span>
                  <span className="text-[8px] opacity-60 mt-0.5">({bucketHits[bucket.label] || 0})</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest px-1 animate-in slide-in-from-left-2 duration-300">
            <Bookmark className="w-3.5 h-3.5" />
            My Private Forest
          </div>
        )}
      </div>

      <div className="px-6 pb-20 space-y-2">
        {!showMyTrees ? (
          <>
            {filteredRoots.map((r, i) => (
              <WordTooltip
                key={i}
                word={r.root}
                summaryCache={summaryCache}
                fetchSummary={fetchSummary}
                className="w-full block relative"
                side="right"
              >
                <div
                  onClick={() => fetchRootDetails(r.root)}
                  className={`px-4 py-2.5 rounded-xl cursor-pointer transition-all border flex items-center justify-between group/item ${selectedRoot === r.root ? 'bg-blue-600/20 border-blue-500/50 shadow-lg shadow-blue-500/5' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                >
                  <span className="text-[13px] font-bold text-white uppercase tracking-tight">{r.root}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); saveBookmark(r.root, 'db', null, r.count); }}
                      className={`opacity-0 group-hover/item:opacity-100 p-2 rounded-lg transition-all border shadow-lg heart-cursor ${bookmarks.find(b => b.root === r.root) ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'bg-transparent border-blue-500/20 text-blue-400/40 hover:text-blue-400 hover:border-blue-500/50'}`}
                      title="Quick Save"
                    >
                      <Bookmark className={`w-4 h-4 ${bookmarks.find(b => b.root === r.root) ? 'fill-blue-400' : ''}`} />
                    </button>
                    <span className="text-xs font-black text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md">{r.count}</span>
                  </div>
                </div>
              </WordTooltip>
            ))}
          </>
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
            {bookmarks.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 border border-indigo-500/20">
                  <Bookmark className="w-5 h-5 text-indigo-400 opacity-20" />
                </div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-relaxed">Your bookmark library is empty</p>
                <p className="text-[8px] text-white/10 mt-2">Click the bookmark icon in any tree to save it here</p>
              </div>
            ) : (
              sortedBookmarks.map((b, idx) => {
                const isLastPinned = b.isPinned && (!sortedBookmarks[idx + 1] || !sortedBookmarks[idx + 1].isPinned);
                return (
                  <React.Fragment key={b.id}>
                    <WordTooltip
                      word={b.root}
                      summaryCache={summaryCache}
                      fetchSummary={fetchSummary}
                      className="w-full block relative"
                      side="right"
                    >
                      <div
                        onClick={() => loadBookmark(b)}
                        className={`group px-4 py-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${selectedRoot === b.root ? 'bg-indigo-600/20 border-indigo-500/50' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-lg min-w-[32px] text-center">{b.count || 0}</span>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-white uppercase tracking-tight">{b.root}</span>
                              {b.type === 'custom' && (
                                <span className="text-[7px] px-1.5 py-0.5 rounded font-black uppercase bg-blue-500/20 text-blue-400">
                                  custom
                                </span>
                              )}
                            </div>
                            <span className="text-[7px] font-mono text-white/20">{new Date(b.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => togglePin(b.id, e)}
                            className={`p-1.5 rounded-lg transition-all ${b.isPinned ? 'text-yellow-500 bg-yellow-500/10' : 'text-white/10 hover:text-white/40 opacity-0 group-hover:opacity-100'}`}
                            title={b.isPinned ? "Unpin" : "Pin to Top"}
                          >
                            <Pin className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => deleteBookmark(b.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-white/10 hover:text-red-400 transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </WordTooltip>
                    {isLastPinned && sortedBookmarks.length > idx + 1 && (
                      <div className="py-4 px-1">
                        <div className="h-px w-full bg-white/10" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
