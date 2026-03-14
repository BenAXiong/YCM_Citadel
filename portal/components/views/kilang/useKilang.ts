'use client';

import { useEffect, useCallback, useMemo, useReducer } from 'react';
import { 
  MoeEntry, 
  KilangRootData, 
  reshapeDerivatives, 
  calculateTreeRows, 
  normalizeWord,
  calculateNodeMap 
} from './kilangUtils';
import { kilangReducer, initialState, KilangState, KilangAction } from './kilangReducer';

export type MorphMode = 'moe' | 'plus' | 'star';
export type LayoutDirection = 'horizontal' | 'vertical';
export type LayoutArrangement = 'aligned' | 'flow';

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
    return calculateNodeMap(state.selectedRoot, state.rootData.derivatives, state.direction, state.arrangement);
  }, [state.selectedRoot, state.rootData?.derivatives, state.direction, state.arrangement]);

  return {
    state,
    dispatch,
    nodeMap,
    fetchRootDetails,
    fetchSummary
  };
};
