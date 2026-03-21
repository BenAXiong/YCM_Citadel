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

  const setScale = (s: number | ((prev: number) => number)) => {
    const val = typeof s === 'function' ? s(scale) : s;
    dispatch({ type: 'SET_TRANSFORM', scale: val });
  };
  const setIsFit = (f: boolean) => dispatch({ type: 'SET_TRANSFORM', isFit: f });
  const setDirection = (d: string) => dispatch({ type: 'SET_LAYOUT', direction: d as any });
  const setArrangement = (a: string) => dispatch({ type: 'SET_LAYOUT', arrangement: a as any });

  return (
    <div 
      className="kilang-container flex flex-col h-screen overflow-hidden"
      style={{ 
        '--sidebar-width': `${(state.sidebarCollapsed || isFullView) ? 0 : state.sidebarWidth}px`,
        '--right-sidebar-width': `${(state.rightSidebarCollapsed || isFullView) ? 0 : state.rightSidebarWidth}px`
      } as React.CSSProperties}
    >
      {!isFullView && (
        <KilangHeader />
      )}

      <div className="flex-1 flex overflow-hidden">
        {state.showFilterPanel && !isFullView && (
          <KilangSidebar
            isCollapsed={state.sidebarCollapsed}
            onToggle={() => dispatch({ type: 'SET_UI', sidebarCollapsed: !state.sidebarCollapsed })}
          />
        )}

        <KilangCanvas />

        {state.showRightSidebar && !isFullView && (
          <KilangRightSidebar
            isCollapsed={state.rightSidebarCollapsed}
            onToggle={() => dispatch({ type: 'SET_UI', rightSidebarCollapsed: !state.rightSidebarCollapsed })}
          />
        )}
      </div>

      {state.showStatsOverlay && <StatsOverlay />}
      {state.showAffixesOverlay && <AffixesOverlay />}
    </div>
  );
};
