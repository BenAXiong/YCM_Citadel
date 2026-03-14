'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  MoeEntry, 
  KilangRootData, 
  reshapeDerivatives, 
  calculateTreeRows, 
  normalizeWord 
} from './kilangUtils';

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

export type MorphMode = 'moe' | 'plus' | 'star';

export const useKilangData = (morphMode: MorphMode, sourceFilter: string) => {
  const [stats, setStats] = useState<RootStats | null>(null);
  const [manifest, setManifest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoot, setSelectedRoot] = useState<string | null>(null);
  const [rootData, setRootData] = useState<any>(null);
  const [summaryCache, setSummaryCache] = useState<Record<string, string[]>>({});

  // 1. Fetch Global Stats & Manifest
  useEffect(() => {
    setLoading(true);
    const statsFile = `/data/moe_stats_${morphMode}.json`;
    const manifestFile = `/data/moe_manifest_${morphMode}.json`;

    Promise.all([
      fetch(statsFile).then(res => { if (!res.ok) throw new Error('Stats fetch failed'); return res.json(); }),
      fetch(manifestFile).then(res => { if (!res.ok) throw new Error('Manifest fetch failed'); return res.json(); })
    ])
      .then(([statsData, manifestData]) => {
        setStats(statsData);
        setManifest(manifestData);
        setLoading(false);
        setSelectedRoot(null);
        setRootData(null);
      })
      .catch(err => {
        console.error('Initial data fetch error:', err);
        setLoading(false);
      });
  }, [morphMode]);

  // 2. Fetch Root Details & Reshape
  const fetchRootDetails = useCallback(async (root: string) => {
    setSelectedRoot(root);
    setRootData({ loading: true });
    
    try {
      // Fetch derivations
      const res = await fetch(`/api/moe_shadow?keyword=${encodeURIComponent(root)}&aggregate=true&mode=${morphMode}&source=${sourceFilter}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const allRows: MoeEntry[] = data.rows || [];
      const normalizedRoot = normalizeWord(root) || root;

      // 3. Reshape using Utils
      let derivatives = reshapeDerivatives(allRows, root);
      calculateTreeRows(derivatives, normalizedRoot, 0);

      // Fetch Root Entry for parentStem
      const parentRes = await fetch(`/api/moe_shadow?keyword=${encodeURIComponent(root)}&exact=true&mode=${morphMode}`);
      const parentData = await parentRes.json();
      const firstEntry = parentData.rows?.[0];
      
      let parentStem = firstEntry?.stem && normalizeWord(firstEntry.stem) !== normalizedRoot 
        ? normalizeWord(firstEntry.stem) 
        : null;

      setRootData({
        word: root,
        derivatives: derivatives,
        totalInDb: allRows.length,
        parentStem: parentStem,
        loading: false
      });
    } catch (e: any) {
      console.error("[Kilang/Hook] Bloom Error:", e);
      setRootData({
        error: true,
        errorMessage: e.message || "Unknown Error",
        loading: false
      });
    }
  }, [morphMode, sourceFilter]);

  // 4. Word Tooltip Summaries
  const fetchSummary = useCallback(async (word: string) => {
    const key = word.toLowerCase();
    if (summaryCache[key]) return;
    
    try {
      const res = await fetch(`/api/moe_shadow?keyword=${encodeURIComponent(word)}&exact=true&mode=${morphMode}`);
      const data = await res.json();
      const wordEntries = data.rows || [];
      
      const definitions = wordEntries.length > 0 
        ? wordEntries.map((r: any) => r.definition)
        : ["No definition found."];

      setSummaryCache(prev => ({
        ...prev,
        [key]: definitions
      }));
    } catch (e) {
      setSummaryCache(prev => ({ ...prev, [key]: ["Error loading definition."] }));
    }
  }, [morphMode, summaryCache]);

  return {
    stats,
    manifest,
    loading,
    selectedRoot,
    rootData,
    summaryCache,
    fetchRootDetails,
    fetchSummary,
    setSelectedRoot
  };
};
