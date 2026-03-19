'use client';

import React from 'react';
import { Bookmark } from 'lucide-react';
import { WordTooltip } from '../KilangNode';
import { useSidebar } from '../SidebarContext';

interface RootListProps {
  bookmarks: import('../KilangTypes').Bookmark[];
  saveBookmark: (root: string, type: 'db' | 'custom', data: any, count: number) => void;
}

export const RootList = React.memo(({ bookmarks, saveBookmark }: RootListProps) => {
  const {
    state,
    filteredRoots,
    fetchRootDetails,
    summaryCache,
    fetchSummary
  } = useSidebar();

  const { selectedRoot } = state;

  return (
    <>
      {filteredRoots.map((r, i) => (
        <WordTooltip
          key={i}
          word={r.root}
          summaryCache={summaryCache}
          fetchSummary={fetchSummary}
          className="w-full block relative"
          side="right"
          showTooltip={state.showSidebarTooltips}
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
  );
});

RootList.displayName = 'RootList';
