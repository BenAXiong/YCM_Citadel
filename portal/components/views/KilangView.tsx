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
import { useKilangData, MorphMode } from './kilang/useKilangData';

export default function KilangView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [exporting, setExporting] = useState(false);
  const [scale, setScale] = useState(1);
  const [isFit, setIsFit] = useState(false);
  const treeRef = useRef<HTMLDivElement>(null);
  const [branchFilter, setBranchFilter] = useState<string | 'all'>('all');
  const [showStatsOverlay, setShowStatsOverlay] = useState(false);
  const [morphMode, setMorphMode] = useState<MorphMode>('moe');
  const [visibleChainsCount, setVisibleChainsCount] = useState(10);
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');

  const {
    stats,
    loading,
    selectedRoot,
    rootData,
    summaryCache,
    direction,
    arrangement,
    nodeMap,
    setDirection,
    setArrangement,
    fetchRootDetails,
    fetchSummary,
    setSelectedRoot,
  } = useKilangData(morphMode, sourceFilter);

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
      hits[bucket.label] = stats.top_roots.filter(r => r.count >= bucket.min && r.count <= bucket.max).length;
    });
    return hits;
  }, [stats]);

  const filteredRoots = useMemo(() => {
    if (!stats) return [];
    let roots = stats.top_roots;

    if (searchTerm) {
      roots = roots.filter(r => r.root.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (branchFilter !== 'all') {
      const bucket = FILTER_BUCKETS.find(b => b.label === branchFilter);
      if (bucket) {
        roots = roots.filter(r => r.count >= bucket.min && r.count <= bucket.max);
      }
    }

    const uniqueRoots = new Map();
    roots.forEach(r => {
      const low = r.root.toLowerCase();
      if (!uniqueRoots.has(low) || r.count > uniqueRoots.get(low).count) {
        uniqueRoots.set(low, r);
      }
    });

    return Array.from(uniqueRoots.values()).sort((a, b) => b.count - a.count);
  }, [stats, searchTerm, branchFilter]);

  const handleExport = async () => {
    if (!treeRef.current || !selectedRoot) return;
    setExporting(true);
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
      setExporting(false);
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
        setMorphMode={(m) => setMorphMode(m as MorphMode)}
        setSourceFilter={setSourceFilter}
        setShowStatsOverlay={setShowStatsOverlay}
        setDirection={setDirection}
        setArrangement={setArrangement}
        setScale={setScale}
        setIsFit={setIsFit}
        handleExport={handleExport}
        MOE_SOURCES={MOE_SOURCES}
      />

      <div className="flex-1 flex overflow-hidden">
        <KilangSidebar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          branchFilter={branchFilter}
          setBranchFilter={setBranchFilter}
          filteredRoots={filteredRoots}
          selectedRoot={selectedRoot}
          fetchRootDetails={fetchRootDetails}
          bucketHits={bucketHits}
          FILTER_BUCKETS={FILTER_BUCKETS}
        />

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
        />
      </div>

      <StatsOverlay
        showStatsOverlay={showStatsOverlay}
        setShowStatsOverlay={setShowStatsOverlay}
        stats={stats}
        visibleChainsCount={visibleChainsCount}
        setVisibleChainsCount={setVisibleChainsCount}
        fetchRootDetails={fetchRootDetails}
      />
    </div>
  );
}
