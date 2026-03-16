'use client';

import { useEffect, useCallback, useMemo, useReducer } from 'react';
import { 
  MoeEntry, 
  KilangRootData, 
  reshapeDerivatives, 
  calculateTreeRows, 
  normalizeWord,
  calculateNodeMap,
  getForestBoundingBox 
} from './kilangUtils';
import { kilangReducer, initialState, KilangState, KilangAction, MorphMode, LayoutDirection, LayoutArrangement } from './kilangReducer';

export const useKilang = () => {
  const [state, dispatch] = useReducer(kilangReducer, initialState);

  // 1. Fetch Global Stats & Manifest
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', loading: true });
    const statsFile = `/data/moe_stats_${state.morphMode}.json`;
    const manifestFile = `/data/moe_manifest_${state.morphMode}.json`;

    Promise.all([
      fetch(statsFile).then(res => { if (!res.ok) throw new Error('Stats fetch failed'); return res.json(); }),
      fetch(manifestFile).then(res => { if (!res.ok) throw new Error('Manifest fetch failed'); return res.json(); })
    ])
      .then(([stats, manifest]) => {
        dispatch({ type: 'SET_GLOBAL_DATA', stats, manifest });
      })
      .catch(err => {
        console.error('Initial data fetch error:', err);
        dispatch({ type: 'SET_LOADING', loading: false });
      });
  }, [state.morphMode]);

  // 2. Fetch Root Details & Reshape
  const fetchRootDetails = useCallback(async (root: string) => {
    dispatch({ type: 'SET_ROOT', root });
    
    try {
      const res = await fetch(`/api/moe_shadow?keyword=${encodeURIComponent(root)}&aggregate=true&mode=${state.morphMode}&source=${state.sourceFilter}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const allRows: MoeEntry[] = data.rows || [];
      const normalizedRoot = normalizeWord(root) || root;

      let derivatives = reshapeDerivatives(allRows, root);
      calculateTreeRows(derivatives, normalizedRoot, 0);

      const parentRes = await fetch(`/api/moe_shadow?keyword=${encodeURIComponent(root)}&exact=true&mode=${state.morphMode}`);
      const parentData = await parentRes.json();
      const firstEntry = parentData.rows?.[0];
      
      let parentStem = firstEntry?.stem && normalizeWord(firstEntry.stem) !== normalizedRoot 
        ? normalizeWord(firstEntry.stem) 
        : null;

      // Calculate auto-width for nodes based on the longest word in the tree
      const words = [normalizedRoot, ...allRows.map(r => normalizeWord(r.word_ab) || '')];
      const maxChars = Math.max(...words.map(w => w.length));
      const autoWidth = Math.max(120, (maxChars * 11) + 40); // 11px per char + padding for icons/spacing

      dispatch({ type: 'SET_LAYOUT_CONFIG', config: { nodeWidth: autoWidth } });

      dispatch({
        type: 'SET_ROOT_DATA',
        data: {
          word: root,
          derivatives: derivatives,
          totalInDb: allRows.length,
          parentStem: parentStem,
          loading: false
        }
      });
    } catch (e: any) {
      console.error("[Kilang/Hook] Bloom Error:", e);
      dispatch({
        type: 'SET_ROOT_DATA',
        data: {
          error: true,
          errorMessage: e.message || "Unknown Error",
          loading: false
        }
      });
    }
  }, [state.morphMode, state.sourceFilter]);

  // 3. Word Tooltip Summaries
  const fetchSummary = useCallback(async (word: string) => {
    const key = word.toLowerCase();
    if (state.summaryCache[key]) return;
    
    try {
      const res = await fetch(`/api/moe_shadow?keyword=${encodeURIComponent(word)}&exact=true&mode=${state.morphMode}`);
      const data = await res.json();
      const wordEntries = data.rows || [];
      
      const definitions = wordEntries.length > 0 
        ? wordEntries.map((r: any) => r.definition)
        : ["No definition found."];

      dispatch({ type: 'SET_SUMMARY', word, definitions });
    } catch (e) {
      dispatch({ type: 'SET_SUMMARY', word, definitions: ["Error loading definition."] });
    }
  }, [state.morphMode, state.summaryCache]);

  // 4. Derived Data (Memoized)
  const nodeMap = useMemo(() => {
    if (!state.selectedRoot || !state.rootData?.derivatives) return {};
    return calculateNodeMap(state.selectedRoot, state.rootData.derivatives, state.direction, state.arrangement, state.layoutConfig);
  }, [state.selectedRoot, state.rootData?.derivatives, state.direction, state.arrangement, state.layoutConfig]);

  // 5. Auto-Fit Calculation
  useEffect(() => {
    if (Object.keys(nodeMap).length === 0) return;
    
    const box = getForestBoundingBox(nodeMap);
    const treeW = box.maxX - box.minX;
    const treeH = box.maxY - box.minY;
    
    // Target a viewport area of roughly 1200x800 for fitting
    const targetW = 1200;
    const targetH = 800;
    
    const scaleW = targetW / Math.max(treeW, 100);
    const scaleH = targetH / Math.max(treeH, 100);
    const scale = Math.min(scaleW, scaleH, 1.2); // Limit max auto-scale
    
    const treeCenterX = (box.minX + box.maxX) / 2;
    const treeCenterY = (box.minY + box.maxY) / 2;
    
    // Displacement from the forest center (1000, 1000)
    const translateX = 1000 - treeCenterX;
    const translateY = 1000 - treeCenterY;

    dispatch({ 
      type: 'SET_FIT_TRANSFORM', 
      transform: { x: translateX, y: translateY, scale } 
    });
  }, [nodeMap]);

  return {
    state,
    dispatch,
    nodeMap,
    fetchRootDetails,
    fetchSummary
  };
};
