'use client';

import React from 'react';
import { KilangHeader } from './KilangHeader';
import { KilangSidebar } from './KilangSidebar';
import { KilangCanvas } from './KilangCanvas';
import { KilangRightSidebar } from './KilangRightSidebar';
import { ThemeBar } from './components/ThemeBar';
import { StatsOverlay } from './StatsOverlay';
import { AffixesOverlay } from './AffixesOverlay';
import { KilangState, KilangAction } from './kilangReducer';
import { UILang, UIStrings } from '@/types';
import { useKilangContext } from './KilangContext';

interface KilangDesktopLayoutProps {
  uiLang: UILang;
  toggleUiLang: () => void;
  s: UIStrings;
}

export const KilangDesktopLayout = ({
  uiLang,
  toggleUiLang,
  s,
}: KilangDesktopLayoutProps) => {
  const {
    state,
    dispatch,
    nodeMap,
    fetchRootDetails,
    summaryCache,
    fetchSummary,
    filteredRoots,
    bucketHits,
    FILTER_BUCKETS,
    MOE_SOURCES,
    handleExport,
    treeRef
  } = useKilangContext();

  const {
    stats,
    selectedRoot,
    rootData,
    direction,
    arrangement,
    scale,
    isFit,
    morphMode,
    sourceFilter,
    searchTerm,
    branchFilter,
    showStatsOverlay,
    visibleChainsCount,
    isFullView,
  } = state;

  const isImmersive = isFullView || !selectedRoot;

  const setScale = (s: number | ((prev: number) => number)) => {
    const val = typeof s === 'function' ? s(scale) : s;
    dispatch({ type: 'SET_TRANSFORM', scale: val });
  };
  const setIsFit = (f: boolean) => dispatch({ type: 'SET_TRANSFORM', isFit: f });
  const setDirection = (d: string) => dispatch({ type: 'SET_LAYOUT', direction: d as any });
  const setArrangement = (a: string) => dispatch({ type: 'SET_LAYOUT', arrangement: a as any });

  return (
    <div 
      className="kilang-container flex flex-col h-screen"
      style={{ 
        '--sidebar-width': `${(state.sidebarCollapsed || isImmersive) ? 0 : state.sidebarWidth}px`,
        '--right-sidebar-width': `${(state.rightSidebarCollapsed || isImmersive) ? 0 : state.rightSidebarWidth}px`
      } as React.CSSProperties}
    >
      <div className={`transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isImmersive ? '-translate-y-full opacity-0 h-0' : 'translate-y-0 opacity-100 h-16'} z-[150] shrink-0`}>
        <KilangHeader />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {state.showFilterPanel && (
          <div className={`transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isImmersive ? '-translate-x-full opacity-0 w-0' : 'translate-x-0 opacity-100'} shrink-0 relative z-50`}>
            <KilangSidebar
              isCollapsed={state.sidebarCollapsed}
              onToggle={() => dispatch({ type: 'SET_UI', sidebarCollapsed: !state.sidebarCollapsed })}
            />
          </div>
        )}

        <KilangCanvas />

        {state.showRightSidebar && (
          <div className={`transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isImmersive ? 'translate-x-full opacity-0 w-0' : 'translate-x-0 opacity-100'} shrink-0 relative z-50`}>
            <KilangRightSidebar
              isCollapsed={state.rightSidebarCollapsed}
              onToggle={() => dispatch({ type: 'SET_UI', rightSidebarCollapsed: !state.rightSidebarCollapsed })}
            />
          </div>
        )}
      </div>

      {state.showStatsOverlay && <StatsOverlay />}
      {state.showAffixesOverlay && <AffixesOverlay />}
    </div>
  );
};
