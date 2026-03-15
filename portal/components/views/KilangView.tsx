'use client';

import React, { useState, useMemo, useRef } from 'react';
import { toPng } from 'html-to-image';
import './Kilang.css';

// Modular components
import { KilangHeader } from './kilang/KilangHeader';
import { KilangSidebar } from './kilang/KilangSidebar';
import { KilangCanvas } from './kilang/KilangCanvas';
import { StatsOverlay } from './kilang/StatsOverlay';

// Data Logic
import { useKilang } from './kilang/useKilang';

export default function KilangView() {
  const treeRef = useRef<HTMLDivElement>(null);
  const {
    state,
    dispatch,
    nodeMap,
    fetchRootDetails,
    fetchSummary,
  } = useKilang();

  const {
    stats,
    loading,
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
    exporting
  } = state;

  const MOE_SOURCES = [
    { id: 'ALL', label: 'ALL SOURCES' },
    { id: 's', label: 'Tsai (s)' },
    { id: 'p', label: 'Pangcah (p)' },
    { id: 'm', label: 'MoE Mac (m)' },
  ];

  const FILTER_BUCKETS = [
    { label: '1', min: 1, max: 1 },
    { label: '2', min: 2, max: 2 },
    { label: '3', min: 3, max: 3 },
    { label: '4-5', min: 4, max: 5 },
    { label: '6-10', min: 6, max: 10 },
    { label: '11-20', min: 11, max: 20 },
    { label: '21-50', min: 21, max: 50 },
    { label: '51-80', min: 51, max: 80 },
    { label: '80+', min: 81, max: 1000 },
  ];

  const bucketHits = useMemo(() => {
    if (!stats) return {};
    const hits: Record<string, number> = {};
    FILTER_BUCKETS.forEach(bucket => {
      hits[bucket.label] = stats.top_roots.filter((r: any) => r.count >= bucket.min && r.count <= bucket.max).length;
    });
    return hits;
  }, [stats]);

  const filteredRoots = useMemo(() => {
    if (!stats) return [];
    let roots = stats.top_roots;

    if (searchTerm) {
      roots = roots.filter((r: any) => r.root.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (branchFilter !== 'all') {
      const bucket = FILTER_BUCKETS.find(b => b.label === branchFilter);
      if (bucket) {
        roots = roots.filter((r: any) => r.count >= bucket.min && r.count <= bucket.max);
      }
    }

    const uniqueRoots = new Map();
    roots.forEach((r: any) => {
      const low = r.root.toLowerCase();
      if (!uniqueRoots.has(low) || r.count > uniqueRoots.get(low).count) {
        uniqueRoots.set(low, r);
      }
    });

    return Array.from(uniqueRoots.values()).sort((a, b) => a.count - b.count);
  }, [stats, searchTerm, branchFilter]);

  const handleExport = async () => {
    if (!treeRef.current || !selectedRoot) return;
    dispatch({ type: 'SET_UI', exporting: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const dataUrl = await toPng(treeRef.current, {
        backgroundColor: '#020617',
        quality: 1,
        pixelRatio: 2,
        style: {
          borderRadius: '0',
          transform: 'scale(1)',
          transformOrigin: '0 0'
        }
      });
      const link = document.createElement('a');
      link.download = `kilang-${selectedRoot.toLowerCase()}-${direction}-${arrangement}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      dispatch({ type: 'SET_UI', exporting: false });
    }
  };

  if (loading) {
    return (
      <div className="kilang-container flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-blue-500 font-bold tracking-widest uppercase">Growing the Kilang...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="kilang-container flex flex-col h-screen overflow-hidden">
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
        setMorphMode={(m) => dispatch({ type: 'SET_CONFIG', morphMode: m as any })}
        setSourceFilter={(s) => dispatch({ type: 'SET_CONFIG', sourceFilter: s })}
        setShowStatsOverlay={(v) => dispatch({ type: 'SET_UI', showStatsOverlay: v })}
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
        showStats={state.showStats}
        showDevTools={state.showDevTools}
        showFilterPanel={state.showFilterPanel}
        dispatch={dispatch}
      />

      <div className="flex-1 flex overflow-hidden">
        {state.showFilterPanel && (
          <KilangSidebar
            searchTerm={searchTerm}
            setSearchTerm={(s) => dispatch({ type: 'SET_UI', searchTerm: s })}
            branchFilter={branchFilter}
            setBranchFilter={(b) => dispatch({ type: 'SET_UI', branchFilter: b })}
            filteredRoots={filteredRoots}
            selectedRoot={selectedRoot}
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
          dispatch={dispatch}
        />
      </div>

      <StatsOverlay
        showStatsOverlay={showStatsOverlay}
        setShowStatsOverlay={(v) => dispatch({ type: 'SET_UI', showStatsOverlay: v })}
        stats={stats}
        visibleChainsCount={visibleChainsCount}
        setVisibleChainsCount={(c) => {
          const val = typeof c === 'function' ? c(visibleChainsCount) : c;
          dispatch({ type: 'SET_UI', visibleChainsCount: val });
        }}
        fetchRootDetails={fetchRootDetails}
      />
    </div>
  );
}
