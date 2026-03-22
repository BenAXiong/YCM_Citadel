'use client';

import React from 'react';
import { Library, Pin, XCircle, TreePine, Sprout } from 'lucide-react';
import { WordTooltip } from '../KilangNode';
import { useSidebar } from '../SidebarContext';

interface BookmarkLibraryProps {
  bookmarks: import('../KilangTypes').Bookmark[];
  sortedBookmarks: import('../KilangTypes').Bookmark[];
  loadBookmark: (bookmark: import('../KilangTypes').Bookmark) => void;
  togglePin: (id: string, e: React.MouseEvent) => void;
  deleteBookmark: (id: string, e: React.MouseEvent) => void;
  showPlusOne: string | null;
  showMinusOne: string | null;
}

export const BookmarkLibrary = React.memo(({ 
  bookmarks, 
  sortedBookmarks, 
  loadBookmark, 
  togglePin, 
  deleteBookmark,
  showPlusOne,
  showMinusOne
}: BookmarkLibraryProps) => {
  const {
    state,
    summaryCache,
    fetchSummary
  } = useSidebar();

  const { selectedRoot } = state;

  if (bookmarks.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center px-4">
        <div className="w-12 h-12 rounded-full bg-[var(--kilang-secondary)]/10 flex items-center justify-center mb-4 border border-[var(--kilang-secondary)]/20">
          <Library className="w-5 h-5 text-[var(--kilang-secondary)] opacity-20" />
        </div>
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-relaxed">Your bookmark library is empty</p>
        <p className="text-[8px] text-white/10 mt-2">Click the bookmark icon in any tree to save it here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
      {sortedBookmarks.map((b, idx) => {
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
                className={`group px-4 py-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between relative ${selectedRoot === b.root ? 'bg-[var(--kilang-secondary)]/20 border-[var(--kilang-secondary)]/50' : 'bg-white/5 border-white/5 hover:border-[var(--kilang-primary)]/20'}`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-[var(--kilang-primary)] bg-[var(--kilang-primary)]/10 px-2.5 py-1 rounded-lg min-w-[32px] text-center">{b.count || 0}</span>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white uppercase tracking-tight">{b.root}</span>
                      {b.type === 'custom' && (
                        <span className="text-[7px] px-1.5 py-0.5 rounded font-black uppercase bg-[var(--kilang-primary)]/20 text-[var(--kilang-primary)]">
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

                {/* Animation Pop */}
                {showPlusOne === b.root && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 text-[var(--kilang-primary)] font-black pointer-events-none animate-bloom-pop z-[100] drop-shadow-[0_0_20px_var(--kilang-primary-glow)]">
                    <TreePine className="w-5 h-5" />
                    <span className="text-sm tracking-tighter self-center">+1</span>
                  </div>
                )}
                {showMinusOne === b.root && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 text-[var(--kilang-secondary)] font-black pointer-events-none animate-bloom-pop z-[100] drop-shadow-[0_0_20px_var(--kilang-secondary-glow)]">
                    <Sprout className="w-5 h-5" />
                    <span className="text-sm tracking-tighter self-center">-1</span>
                  </div>
                )}
              </div>
            </WordTooltip>
            {isLastPinned && sortedBookmarks.length > idx + 1 && (
              <div className="py-4 px-1">
                <div className="h-px w-full bg-white/10" />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
});

BookmarkLibrary.displayName = 'BookmarkLibrary';
