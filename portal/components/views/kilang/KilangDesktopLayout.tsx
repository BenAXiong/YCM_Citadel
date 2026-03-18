'use client';

import React from 'react';
import { KilangHeader } from './KilangHeader';
import { KilangSidebar } from './KilangSidebar';
import { KilangCanvas } from './KilangCanvas';
import { ThemeBar } from './components/ThemeBar';
import { StatsOverlay } from './StatsOverlay';
import { AffixesOverlay } from './AffixesOverlay';
import { KilangState, KilangAction } from './kilangReducer';

interface KilangDesktopLayoutProps {
  state: KilangState;
  dispatch: React.Dispatch<KilangAction>;
  nodeMap: any;
  fetchRootDetails: (root: string) => Promise<void>;
  fetchSummary: (word: string) => Promise<void>;
  filteredRoots: any[];
  bucketHits: Record<string, number>;
  FILTER_BUCKETS: any[];
  MOE_SOURCES: any[];
  handleExport: () => Promise<void>;
  treeRef: React.RefObject<HTMLDivElement | null>;
}

export const KilangDesktopLayout = ({
  state,
  dispatch,
  nodeMap,
  fetchRootDetails,
  fetchSummary,
  filteredRoots,
  bucketHits,
  FILTER_BUCKETS,
  MOE_SOURCES,
  handleExport,
  treeRef,
}: KilangDesktopLayoutProps) => {
  const {
    stats,
    selectedRoot,
    rootData,
    summaryCache,
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
  } = state;

  return (
    <div 
      className="kilang-container flex flex-col h-screen overflow-hidden"
      style={{ '--sidebar-width': `${state.sidebarWidth}px` } as React.CSSProperties}
    >
      <KilangHeader
        stats={stats}
        selectedRoot={selectedRoot}
        morphMode={morphMode}
        sourceFilter={sourceFilter}
        direction={direction}
        arrangement={arrangement}
        scale={scale}
        isFit={isFit}
        showStatsOverlay={showStatsOverlay}
        showAffixesOverlay={state.showAffixesOverlay}
        setMorphMode={(m) => dispatch({ type: 'SET_CONFIG', morphMode: m as any })}
        setSourceFilter={(s) => dispatch({ type: 'SET_CONFIG', sourceFilter: s })}
        setShowStatsOverlay={(v: boolean) => dispatch({ type: 'SET_UI', showStatsOverlay: v })}
        setShowAffixesOverlay={(v: boolean) => dispatch({ type: 'SET_UI', showAffixesOverlay: v })}
        setDirection={(d) => dispatch({ type: 'SET_LAYOUT', direction: d as any })}
        setArrangement={(a) => dispatch({ type: 'SET_LAYOUT', arrangement: a as any })}
        setScale={(s) => {
          const val = typeof s === 'function' ? s(scale) : s;
          dispatch({ type: 'SET_TRANSFORM', scale: val });
        }}
        setIsFit={(f) => dispatch({ type: 'SET_TRANSFORM', isFit: f })}
        layoutConfig={state.layoutConfig}
        updateLayoutConfig={(config) => dispatch({ type: 'SET_LAYOUT_CONFIG', config })}
        handleExport={handleExport}
        MOE_SOURCES={MOE_SOURCES}
        sourceCounts={state.sourceCounts}
        showStats={state.showStats}
        showDimensions={state.showDimensions}
        showDevTools={state.showDevTools}
        showFilterPanel={state.showFilterPanel}
        showPerfMonitor={state.showPerfMonitor}
        showThemeBar={state.showThemeBar}
        dispatch={dispatch}
      />

      <div className="flex-1 flex overflow-hidden">
        {state.showFilterPanel && (
          <KilangSidebar
            state={state}
            dispatch={dispatch}
            filteredRoots={filteredRoots}
            fetchRootDetails={fetchRootDetails}
            bucketHits={bucketHits}
            FILTER_BUCKETS={FILTER_BUCKETS}
            summaryCache={summaryCache}
            fetchSummary={fetchSummary}
            isCollapsed={state.sidebarCollapsed}
            onToggle={() => dispatch({ type: 'SET_UI', sidebarCollapsed: !state.sidebarCollapsed })}
          />
        )}

        <KilangCanvas
          selectedRoot={selectedRoot}
          rootData={rootData}
          direction={direction}
          arrangement={arrangement}
          nodeMap={nodeMap}
          isFit={isFit}
          scale={scale}
          treeRef={treeRef}
          fetchRootDetails={fetchRootDetails}
          summaryCache={summaryCache}
          fetchSummary={fetchSummary}
          stats={stats}
          fitTransform={state.fitTransform}
          layoutConfig={state.layoutConfig}
          showDimensions={state.showDimensions}
          showPerfMonitor={state.showPerfMonitor}
          resetToken={state.resetToken}
          logoStyle={state.logoStyles[state.landingVersion]}
          logoSettings={state.logoSettings[state.landingVersion]}
          dispatch={dispatch}
        />
      </div>

      <StatsOverlay
        showStatsOverlay={showStatsOverlay}
        setShowStatsOverlay={(v) => dispatch({ type: 'SET_UI', showStatsOverlay: v })}
        stats={stats}
        visibleChainsCount={visibleChainsCount}
        setVisibleChainsCount={(c: number | ((prev: number) => number)) => {
          const val = typeof c === 'function' ? c(visibleChainsCount) : c;
          dispatch({ type: 'SET_UI', visibleChainsCount: val });
        }}
        fetchRootDetails={fetchRootDetails}
        summaryCache={summaryCache}
        fetchSummary={fetchSummary}
        manifest={state.manifest}
        sourceFilter={state.sourceFilter}
      />

      <AffixesOverlay
        showAffixesOverlay={state.showAffixesOverlay}
        setShowAffixesOverlay={(v) => dispatch({ type: 'SET_UI', showAffixesOverlay: v })}
        summaryCache={state.summaryCache}
        fetchSummary={fetchSummary}
      />

      <ThemeBar
        show={state.showThemeBar}
        onClose={() => dispatch({ type: 'SET_UI', showThemeBar: false })}
        landingVersion={state.landingVersion}
        setLandingVersion={(v) => dispatch({ type: 'SET_UI', landingVersion: v })}
        logoStyle={state.logoStyles[state.landingVersion]}
        logoSettings={state.logoSettings[state.landingVersion]}
        setLogoStyle={(s) => dispatch({ type: 'SET_UI', logoStyles: { [state.landingVersion]: s } })}
        updateLogoSettings={(s) => dispatch({ type: 'SET_UI', logoSettings: { [state.landingVersion]: s } })}
      />
    </div>
  );
};
