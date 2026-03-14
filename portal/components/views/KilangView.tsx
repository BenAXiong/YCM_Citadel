'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { toPng } from 'html-to-image';
import './Kilang.css';

// Modular components
import { KilangHeader } from './kilang/KilangHeader';
import { KilangSidebar } from './kilang/KilangSidebar';
import { KilangCanvas } from './kilang/KilangCanvas';
import { StatsOverlay } from './kilang/StatsOverlay';

interface RootStats {
  summary: {
    total_roots: number;
    max_depth: number;
    max_branches: number;
    total_words: number;
    average_branching: number;
    std_dev: number;
  };
  distribution: Record<string, number>;
  depth_distribution: Record<string, number>;
  deep_examples: Record<string, string[]>;
  top_roots: Array<{ root: string; count: number }>;
}

export default function KilangView() {
  const [stats, setStats] = useState<RootStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [layoutMode, setLayoutMode] = useState<'h1' | 'h2' | 'v1' | 'v2'>('h1');
  const [searchTerm, setSearchTerm] = useState('');
  const [exporting, setExporting] = useState(false);
  const [scale, setScale] = useState(1);
  const [isFit, setIsFit] = useState(false);
  const treeRef = useRef<HTMLDivElement>(null);
  const [branchFilter, setBranchFilter] = useState<string | 'all'>('all');
  const [selectedRoot, setSelectedRoot] = useState<string | null>(null);
  const [rootData, setRootData] = useState<any>(null);
  const [showStatsOverlay, setShowStatsOverlay] = useState(false);
  const [summaryCache, setSummaryCache] = useState<Record<string, string[]>>({});
  const [morphMode, setMorphMode] = useState<'moe' | 'plus' | 'star'>('moe');
  const [visibleChainsCount, setVisibleChainsCount] = useState(10);

  const [manifest, setManifest] = useState<any>(null);
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');

  const MOE_SOURCES = [
    { id: 'ALL', label: 'ALL SOURCES' },
    { id: 's', label: 'Tsai (s)' },
    { id: 'p', label: 'Pangcah (p)' },
    { id: 'm', label: 'MoE Mac (m)' },
  ];

  useEffect(() => {
    setLoading(true);
    const statsFile = `/data/moe_stats_${morphMode}.json`;
    const manifestFile = `/data/moe_manifest_${morphMode}.json`;

    fetch(statsFile)
      .then(res => {
        if (!res.ok) throw new Error('Fetch failed');
        return res.json();
      })
      .then(data => {
        setStats(data);
        return fetch(manifestFile);
      })
      .then(res => res.json())
      .then(m => {
        setManifest(m);
        setLoading(false);
        setSelectedRoot(null);
        setRootData(null);
      })
      .catch(err => {
        console.error('Stats/Manifest fetch error:', err);
        setLoading(false);
      });
  }, [morphMode]);

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

  const fetchRootDetails = async (root: string) => {
    setSelectedRoot(root);
    setRootData({ loading: true });
    try {
      const res = await fetch(`/api/moe_shadow?keyword=${encodeURIComponent(root)}&aggregate=true&mode=${morphMode}&source=${sourceFilter}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const data = await res.json();

      let allRows = data.rows || [];
      const lowRoot = root.toLowerCase().trim();

      const uniqueDerivativesMap = new Map();
      allRows.forEach((d: any) => {
        let word = d.word_ab.toLowerCase().trim();
        if (word.endsWith('|')) word = word.slice(0, -1);

        let pWord = d.parent_word ? d.parent_word.trim() : null;
        if (pWord && pWord.endsWith('|')) pWord = pWord.slice(0, -1);

        let uRoot = d.ultimate_root ? d.ultimate_root.trim() : null;
        if (uRoot && uRoot.endsWith('|')) uRoot = uRoot.slice(0, -1);

        const dRow = {
          ...d,
          word_ab: word,
          parentWord: pWord,
          ultimateRoot: uRoot,
          tier: Number(d.tier || 2),
          sortPath: d.sort_path
        };

        if (word !== lowRoot && !uniqueDerivativesMap.has(word)) {
          uniqueDerivativesMap.set(word, dRow);
        }
      });

      let derivatives = Array.from(uniqueDerivativesMap.values());

      if (!derivatives[0]?.sortPath) {
        const getAncestry = (word: any) => {
          let path = [word.word_ab.toLowerCase()];
          let curr = word;
          for (let i = 0; i < 15; i++) {
            if (!curr.parentWord) break;
            const parent = derivatives.find((p: any) => p.word_ab.toLowerCase() === curr.parentWord.toLowerCase());
            if (parent) {
              path.unshift(parent.word_ab.toLowerCase());
              curr = parent;
            } else break;
          }
          return path.join('>');
        };
        derivatives = derivatives.map((d: any) => ({ ...d, sortPath: getAncestry(d) }));
      }

      let currentRow = 0;
      const assignTreeRows = (parentWord: string, startRow: number) => {
        const pNormalized = parentWord.toLowerCase().trim();
        const children = derivatives.filter((d: any) => d.parentWord?.toLowerCase() === pNormalized);
        if (children.length === 0) return 1;

        let totalUsed = 0;
        children.forEach((child: any, i: number) => {
          const rowsForChild = assignTreeRows(child.word_ab, startRow + totalUsed);
          child.treeRow = startRow + totalUsed;
          totalUsed += rowsForChild;
        });
        return totalUsed;
      };

      assignTreeRows(lowRoot, 0);

      const parentRes = await fetch(`/api/moe_shadow?keyword=${encodeURIComponent(root)}&exact=true&mode=${morphMode}`);
      const parentData = await parentRes.json();
      const firstEntry = parentData.rows?.[0];
      let parentStem = firstEntry?.stem && firstEntry.stem.toLowerCase() !== root.toLowerCase() ? firstEntry.stem : null;
      if (parentStem && parentStem.endsWith('|')) parentStem = parentStem.slice(0, -1);

      setRootData({
        word: root,
        derivatives: derivatives,
        totalInDb: allRows.length,
        parentStem: parentStem,
        loading: false
      });
    } catch (e: any) {
      console.error("[Kilang] Bloom Error:", e);
      setRootData({
        error: true,
        errorMessage: e.message || "Unknown Error",
        loading: false
      });
    } finally {
      setRootData((prev: any) => ({ ...prev, loading: false }));
    }
  };

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
      link.download = `kilang-${selectedRoot.toLowerCase()}-${layoutMode}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const fetchSummary = async (word: string) => {
    const key = word.toLowerCase();
    if (summaryCache[key]) return;
    try {
      const res = await fetch(`/api/moe_shadow?keyword=${encodeURIComponent(word)}&exact=true&mode=${morphMode}`);
      const data = await res.json();
      const wordEntries = data.rows || [];
      if (wordEntries.length > 0) {
        setSummaryCache(prev => ({
          ...prev,
          [key]: wordEntries.map((r: any) => r.definition)
        }));
      } else {
        setSummaryCache(prev => ({ ...prev, [key]: ["No definition found."] }));
      }
    } catch (e) {
      setSummaryCache(prev => ({ ...prev, [key]: ["Error loading definition."] }));
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
        layoutMode={layoutMode}
        scale={scale}
        isFit={isFit}
        showStatsOverlay={showStatsOverlay}
        setMorphMode={setMorphMode}
        setSourceFilter={setSourceFilter}
        setShowStatsOverlay={setShowStatsOverlay}
        setLayoutMode={setLayoutMode}
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
          layoutMode={layoutMode}
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
