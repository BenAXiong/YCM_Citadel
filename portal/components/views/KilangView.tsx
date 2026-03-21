'use client';

import React, { useState, useRef } from 'react';
import './Kilang.css';

// Modular components
import { KilangDesktopLayout } from './kilang/KilangDesktopLayout';
import { KilangMobileLayout } from './kilang/KilangMobileLayout';
import { ThemeBar } from './kilang/components/ThemeBar';
import { Toast } from './kilang/components/Toast';
import { useIsMobile } from '@/hooks/useIsMobile';

// Data Logic
import { useKilang } from './kilang/useKilang';
import { SidebarProvider } from './kilang/SidebarContext';
import { UILang, UIStrings } from '@/types';
import { useBroadcastSync } from './kilang/hooks/useBroadcastSync';
import { UI_STRINGS } from '@/lib/i18n';
import { KilangProvider } from './kilang/KilangContext';

// Phase 7 Hooks & Constants
import { useKilangFiltering } from './kilang/hooks/useKilangFiltering';
import { useKilangStyleSync } from './kilang/hooks/useKilangStyleSync';
import { useKilangExport } from './kilang/hooks/useKilangExport';
import { MOE_SOURCES, FILTER_BUCKETS } from './kilang/kilangConstants';

interface KilangViewProps {
  uiLang?: UILang;
  toggleUiLang?: () => void;
  s?: UIStrings;
}

export default function KilangView({ 
  uiLang = 'en', 
  toggleUiLang = () => {}, 
  s = UI_STRINGS['en'] 
}: KilangViewProps) {
  const treeRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile(1024);
  const [isStandalone, setIsStandalone] = useState(false);
  
  const {
    state,
    dispatch,
    nodeMap,
    fetchRootDetails,
    fetchSummary,
  } = useKilang();

  const {
    loading,
    selectedRoot,
    summaryCache,
    searchTerm,
    branchFilter,
    layoutConfig,
    stats,
  } = state;

  // 1. Standalone / Broadcast Logic
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('standalone=themebar')) {
      setIsStandalone(true);
    }
  }, []);

  useBroadcastSync(state, dispatch, isStandalone);

  // 2. Logic Extraction Hooks
  const { bucketHits, filteredRoots } = useKilangFiltering({ stats, searchTerm, branchFilter });
  useKilangStyleSync({ layoutConfig });
  const { handleExport } = useKilangExport({ state, dispatch, nodeMap, treeRef });

  const contextValue = React.useMemo(() => ({
    state,
    dispatch,
    nodeMap,
    fetchRootDetails,
    summaryCache,
    fetchSummary,
    handleExport,
    uiLang,
    toggleUiLang,
    s,
    filteredRoots,
    bucketHits,
    FILTER_BUCKETS,
    MOE_SOURCES,
    sourceCounts: state.sourceCounts,
    treeRef,
  }), [
    state, 
    nodeMap, 
    fetchRootDetails, 
    summaryCache, 
    fetchSummary, 
    handleExport, 
    uiLang, 
    toggleUiLang, 
    s, 
    filteredRoots, 
    bucketHits, 
    treeRef
  ]);

  const sidebarContextValue = React.useMemo(() => ({
    state,
    dispatch,
    filteredRoots,
    fetchRootDetails,
    bucketHits,
    FILTER_BUCKETS,
    summaryCache,
    fetchSummary
  }), [
    state,
    filteredRoots,
    fetchRootDetails,
    bucketHits,
    summaryCache,
    fetchSummary
  ]);

  if (isStandalone) {
    return (
      <KilangProvider value={contextValue}>
        <div data-theme={state.layoutConfig.theme}>
          <div className="fixed inset-0 bg-[#0a0a0c] flex flex-col p-0 overflow-hidden">
            <ThemeBar
              activeTab={state.themeBarTab || 'themes'}
              setActiveTab={(tab: any) => dispatch({ type: 'SET_UI', themeBarTab: tab })}
              dispatch={dispatch}
              layoutConfig={state.layoutConfig}
              state={state}
              forceShow={true}
            />
          </div>
          <Toast 
            message={state.toast} 
            onClose={() => dispatch({ type: 'SET_TOAST', message: null })} 
          />
        </div>
      </KilangProvider>
    );
  }

  return (
    <div data-theme={state.layoutConfig.theme}>
      <KilangProvider value={contextValue}>
        <SidebarProvider value={sidebarContextValue}>
          {isMobile ? (
            <KilangMobileLayout />
          ) : (
            <KilangDesktopLayout uiLang={uiLang} toggleUiLang={toggleUiLang} s={s} />
          )}

          {state.showThemeBar && (
            <ThemeBar
              activeTab={state.themeBarTab}
              setActiveTab={(tab: any) => dispatch({ type: 'SET_UI', themeBarTab: tab })}
              layoutConfig={state.layoutConfig}
              dispatch={dispatch}
              state={state}
            />
          )}

          <Toast 
            message={state.toast} 
            onClose={() => dispatch({ type: 'SET_TOAST', message: null })} 
          />

          {/* Assuming KilangDevMonitor is imported or defined elsewhere if needed */}
          {/* {state.showDevTools && <KilangDevMonitor state={state} dispatch={dispatch} />} */}
        </SidebarProvider>
      </KilangProvider>
    </div>
  );
}
