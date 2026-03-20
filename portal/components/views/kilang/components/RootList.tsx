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
            className={`px-4 py-2.5 rounded-xl cursor-pointer transition-all border flex items-center justify-between group/item ${selectedRoot === r.root ? `bg-[var(--kilang-ctrl-active)] border-[var(--kilang-ctrl-active)]/40 text-[var(--kilang-ctrl-active-text)] shadow-lg shadow-[var(--kilang-primary-glow)]` : 'bg-[var(--kilang-card)] border-[var(--kilang-border-std)] text-[var(--kilang-text)] hover:bg-[var(--kilang-ctrl-bg)] hover:border-[var(--kilang-border-std)]/50'}`}
          >
            <span className="text-[13px] font-bold text-[var(--kilang-text)] uppercase tracking-tight">{r.root}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); saveBookmark(r.root, 'db', null, r.count); }}
                className={`opacity-0 group-hover/item:opacity-100 p-2 rounded-lg transition-all border shadow-lg heart-cursor ${bookmarks.find(b => b.root === r.root) ? 'bg-[color-mix(in_srgb,var(--kilang-primary),transparent_80%)] border-[color-mix(in_srgb,var(--kilang-primary),transparent_50%)] text-[var(--kilang-primary)]' : 'bg-transparent border-[color-mix(in_srgb,var(--kilang-primary),transparent_80%)] text-[color-mix(in_srgb,var(--kilang-primary),transparent_60%)] hover:text-[var(--kilang-primary)] hover:border-[color-mix(in_srgb,var(--kilang-primary),transparent_50%)]'}`}
                title="Quick Save"
              >
                <Bookmark className={`w-4 h-4 ${bookmarks.find(b => b.root === r.root) ? 'fill-[var(--kilang-primary)]' : ''}`} />
              </button>
              <span className={`text-xs font-black uppercase transition-colors ${selectedRoot === r.root ? 'text-[var(--kilang-ctrl-active-text)]' : 'text-[var(--kilang-text-muted)] group-hover/item:text-[var(--kilang-primary-text)]'} bg-[var(--kilang-primary-bg)]/10 px-2 py-1 rounded-md`}>{r.count}</span>
            </div>
          </div>
        </WordTooltip>
      ))}
    </>
  );
});

RootList.displayName = 'RootList';
