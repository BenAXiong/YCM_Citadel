'use client';

import React, { useState, useRef } from 'react';
import './Kilang.css';

// Modular components
import { KilangDesktopLayout } from './kilang/KilangDesktopLayout';
import { KilangMobileLayout } from './kilang/KilangMobileLayout';
import { ThemeBar } from './kilang/components/ThemeBar';
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

  if (isStandalone) {
    return (
      <div data-theme={state.layoutConfig.theme}>
        <div className="fixed inset-0 bg-[#0a0a0c] flex flex-col p-0 overflow-hidden">
          <ThemeBar
            show={true}
            onClose={() => window.close()}
            activeTab={state.themeBarTab || 'themes'}
            setActiveTab={(tab) => dispatch({ type: 'SET_UI', themeBarTab: tab })}
            landingVersion={state.landingVersion || 2}
            setLandingVersion={(v) => dispatch({ type: 'SET_UI', landingVersion: v })}
            logoStyle={state.logoStyles?.[state.landingVersion] || 'round'}
            setLogoStyle={(s) => dispatch({ type: 'SET_UI', logoStyles: { [state.landingVersion]: s } })}
            logoSettings={state.logoSettings?.[state.landingVersion] || { scale: 1, radius: 45, xOffset: 0, opacity: 1, glowIntensity: 0, glowColor: 'var(--kilang-primary)' }}
            updateLogoSettings={(settings) => dispatch({ type: 'SET_UI', logoSettings: { [state.landingVersion]: settings } })}
            resetLogoSettings={() => dispatch({ type: 'RESET_LOGO_SETTINGS', version: state.landingVersion })}
            dispatch={dispatch}
            layoutConfig={state.layoutConfig}
          />
        </div>
      </div>
    );
  }

  const contextValue = {
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
  };

  return (
    <div data-theme={state.layoutConfig.theme}>
      <KilangProvider value={contextValue}>
        <SidebarProvider value={{
          state,
          dispatch,
          filteredRoots,
          fetchRootDetails,
          bucketHits,
          FILTER_BUCKETS,
          summaryCache,
          fetchSummary
        }}>
          {isMobile ? (
            <KilangMobileLayout />
          ) : (
            <KilangDesktopLayout />
          )}

          <ThemeBar
            show={state.showThemeBar}
            onClose={() => dispatch({ type: 'SET_UI', showThemeBar: !state.showThemeBar })}
            activeTab={state.themeBarTab}
            setActiveTab={(t: 'themes' | 'landing' | 'fonts' | 'map') => dispatch({ type: 'SET_UI', themeBarTab: t })}
            landingVersion={state.landingVersion}
            setLandingVersion={(v: 1 | 2 | 3) => dispatch({ type: 'SET_UI', landingVersion: v })}
            logoStyle={state.logoStyles[state.landingVersion]}
            logoSettings={state.logoSettings[state.landingVersion]}
            setLogoStyle={(s: 'original' | 'square' | 'round') => dispatch({ type: 'SET_UI', logoStyles: { [state.landingVersion]: s } })}
            updateLogoSettings={(s: any) => dispatch({ type: 'SET_UI', logoSettings: { [state.landingVersion]: s } })}
            resetLogoSettings={() => dispatch({ type: 'RESET_LOGO_SETTINGS', version: state.landingVersion })}
            dispatch={dispatch}
            layoutConfig={state.layoutConfig}
          />
        </SidebarProvider>
      </KilangProvider>
    </div>
  );
}
