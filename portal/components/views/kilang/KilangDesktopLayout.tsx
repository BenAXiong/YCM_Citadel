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
  uiLang: UILang;
  toggleUiLang: () => void;
  s: UIStrings;
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
  uiLang,
  toggleUiLang,
  s,
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
      style={{ '--sidebar-width': `${state.sidebarCollapsed ? 0 : state.sidebarWidth}px` } as React.CSSProperties}
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
        setDirection={setDirection}
        setArrangement={setArrangement}
        setScale={setScale}
        setIsFit={setIsFit}
        layoutConfig={state.layoutConfig}
        updateLayoutConfig={(config) => dispatch({ type: 'SET_LAYOUT_CONFIG', config })}
        handleExport={handleExport}
        MOE_SOURCES={MOE_SOURCES}
        sourceCounts={state.sourceCounts}
        showStats={state.showStats}
        showDimensions={state.showDimensions}
        showDevTools={state.showDevTools}
        showFilterPanel={state.showFilterPanel}
        showRightSidebar={state.showRightSidebar}
        showPerfMonitor={state.showPerfMonitor}
        showThemeBar={state.showThemeBar}
        showZoomIndicator={state.showZoomIndicator}
        moveZoomToCanvas={state.moveZoomToCanvas}
        moveGrowthToCanvas={state.moveGrowthToCanvas}
        moveCaptureToCanvas={state.moveCaptureToCanvas}
        exportSettings={state.exportSettings}
        dispatch={dispatch}
        uiLang={uiLang}
        toggleUiLang={toggleUiLang}
        s={s}
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
          showZoomIndicator={state.showZoomIndicator}
          moveZoomToCanvas={state.moveZoomToCanvas}
          moveGrowthToCanvas={state.moveGrowthToCanvas}
          moveCaptureToCanvas={state.moveCaptureToCanvas}
          setScale={setScale}
          setIsFit={setIsFit}
          setDirection={setDirection}
          setArrangement={setArrangement}
          handleExport={handleExport}
          exportSettings={state.exportSettings}
          exporting={state.exporting}
          dispatch={dispatch}
        />

        {state.showRightSidebar && (
          <KilangRightSidebar
            state={state}
            dispatch={dispatch}
            nodeMap={nodeMap}
            isCollapsed={state.rightSidebarCollapsed}
            onToggle={() => dispatch({ type: 'SET_UI', rightSidebarCollapsed: !state.rightSidebarCollapsed })}
          />
        )}
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
        activeTab={state.themeBarTab}
        setActiveTab={(t) => dispatch({ type: 'SET_UI', themeBarTab: t })}
        landingVersion={state.landingVersion}
        setLandingVersion={(v) => dispatch({ type: 'SET_UI', landingVersion: v })}
        logoStyle={state.logoStyles[state.landingVersion]}
        logoSettings={state.logoSettings[state.landingVersion]}
        setLogoStyle={(s) => dispatch({ type: 'SET_UI', logoStyles: { [state.landingVersion]: s } })}
        updateLogoSettings={(s) => dispatch({ type: 'SET_UI', logoSettings: { [state.landingVersion]: s } })}
        resetLogoSettings={() => dispatch({ type: 'RESET_LOGO_SETTINGS', version: state.landingVersion })}
      />
    </div>
  );
};
