'use client';

import { useEffect, useCallback, useMemo, useReducer, useRef } from 'react';
import {
  reshapeDerivatives,
  calculateTreeRows,
  normalizeWord,
  calculateNodeMap,
  getForestBoundingBox
} from './kilangUtils';
import { MoeEntry, KilangRootData } from './KilangTypes';
import { kilangReducer, initialState, KilangState, KilangAction, MorphMode, LayoutDirection, LayoutArrangement } from './kilangReducer';

export const useKilang = () => {
  const [state, dispatch] = useReducer(kilangReducer, initialState);
  const STORAGE_KEY = 'kilang_theme_settings';

  // 0a. Initialization & Initial Load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 1024;
      const initialUI: Partial<KilangState> = {
        landingVersion: isMobile ? 1 : 2
      };

      // Load Theme & Branding
      const savedTheme = localStorage.getItem(STORAGE_KEY);
      if (savedTheme) {
        try {
          const parsed = JSON.parse(savedTheme);
          // 🛡️ Safe Merge: Prevent partial objects from wiping defaults
          if (parsed.theme) (initialUI as any).theme = parsed.theme;
          if (parsed.showThemeBar !== undefined) initialUI.showThemeBar = parsed.showThemeBar;
          if (parsed.showFloatingPalette !== undefined) initialUI.showFloatingPalette = parsed.showFloatingPalette;
          if (parsed.landingVersion) initialUI.landingVersion = parsed.landingVersion;
          
          if (parsed.logoStyles) {
            initialUI.logoStyles = { ...initialUI.logoStyles, ...parsed.logoStyles };
          }
          if (parsed.logoSettings) {
             // Merge each version explicitly
             initialUI.logoSettings = initialUI.logoSettings || { ...initialState.logoSettings };
             [1, 2, 3].forEach(v => {
               if (parsed.logoSettings[v]) {
                 initialUI.logoSettings![v] = { ...initialUI.logoSettings![v], ...parsed.logoSettings[v] };
               }
             });
          }
        } catch (e) {}
      }

      // Load Tree Config (Legacy/Structural)
      const savedTree = localStorage.getItem('kilang-tree-config');
      if (savedTree) {
        try {
          const config = JSON.parse(savedTree);
          initialUI.layoutConfig = { ...initialState.layoutConfig, ...config, theme: (initialUI as any).theme || initialState.layoutConfig.theme };
        } catch (e) {}
      }
 
      // Load Bookmarks
      const savedBookmarks = localStorage.getItem('kilang_bookmarked_trees');
      if (savedBookmarks) {
        try {
          initialUI.bookmarks = JSON.parse(savedBookmarks);
        } catch (e) {}
      }
 
      dispatch({ type: 'HYDRATE_STATE', state: initialUI });
    }
  }, []);

  // Use a Ref to track the latest state for the storage listener closure
  const latestStateRef = useRef(state);
  useEffect(() => {
    latestStateRef.current = state;
  }, [state]);

  // 0b. Persistence (Save) - GUARDED by isHydrated
  useEffect(() => {
    if (!state.isHydrated) return; // 🛡️ Prevent overwriting storage with default state before hydration

    const themeSettings = {
      landingVersion: state.landingVersion,
      logoStyles: state.logoStyles,
      logoSettings: state.logoSettings,
      showThemeBar: state.showThemeBar,
      showFloatingPalette: state.showFloatingPalette,
      theme: state.layoutConfig.theme 
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(themeSettings));
  }, [
    state.isHydrated,
    state.landingVersion, 
    state.logoStyles, 
    state.logoSettings, 
    state.showThemeBar, 
    state.showFloatingPalette, 
    state.layoutConfig.theme
  ]);
 
  // 0e. Bookmarks Persistence
  useEffect(() => {
    if (!state.isHydrated) return;
    localStorage.setItem('kilang_bookmarked_trees', JSON.stringify(state.bookmarks));
  }, [state.bookmarks, state.isHydrated]);

  // 0c. Cross-Window Syncing (Handled by useBroadcastSync)
  // 0d. Window Visibility Fix: Re-load latest from localStorage when returning to tab
  useEffect(() => {
    const handleFocus = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Only sync if there's a meaningful change (background update)
          if (parsed.theme !== state.layoutConfig.theme) {
             dispatch({ type: 'SET_UI', ...parsed });
          }
        } catch (e) {}
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [state.layoutConfig.theme]);

  // 1. Fetch Global Stats & Manifest
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', loading: true });
    const statsFile = `/data/moe_stats_${state.morphMode}.json`;
    const manifestFile = `/data/moe_manifest_${state.morphMode}.json`;

    Promise.all([
      fetch(statsFile).then(res => { if (!res.ok) throw new Error('Stats fetch failed'); return res.json(); }),
      fetch(manifestFile).then(res => { if (!res.ok) throw new Error('Manifest fetch failed'); return res.json(); }),
      fetch('/api/moe_shadow?counts=true').then(res => res.json())
    ])
      .then(([stats, manifest, countsData]) => {
        dispatch({ type: 'SET_GLOBAL_DATA', stats, manifest });
        if (countsData.counts) {
          dispatch({ type: 'SET_SOURCE_COUNTS', counts: countsData.counts, total: countsData.total });
        }
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

      // Collect all definitions for the root word specifically
      const rootDefinitions = allRows
        .filter(r => normalizeWord(r.word_ab) === normalizedRoot)
        .map(r => r.definition);
      
      const rootExamples = allRows
        .filter(r => normalizeWord(r.word_ab) === normalizedRoot && r.examples_json)
        .flatMap(r => JSON.parse(r.examples_json!));

      dispatch({
        type: 'SET_ROOT_DATA',
        data: {
          word: root,
          derivatives: derivatives,
          definitions: rootDefinitions,
          allExamples: rootExamples,
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

  // 2b. Auto-refetch when filters change
  useEffect(() => {
    // 1. Refetch Root if one is selected
    if (state.selectedRoot) {
      fetchRootDetails(state.selectedRoot);
    }
    
    // 2. Refetch Stats if source is filtered
    if (state.sourceFilter !== 'ALL') {
      fetch(`/api/moe_shadow?stats=true&source=${state.sourceFilter}&mode=${state.morphMode}`)
        .then(res => res.json())
        .then(data => {
            dispatch({ type: 'SET_GLOBAL_DATA', stats: data, manifest: state.manifest });
        })
        .catch(err => console.error("[Hook] Source-Stats Fetch Error:", err));
    } else {
        // Fallback to static JSON if ALL is selected
        const statsFile = `/data/moe_stats_${state.morphMode}.json`;
        fetch(statsFile)
            .then(res => res.json())
            .then(data => {
                dispatch({ type: 'SET_GLOBAL_DATA', stats: data, manifest: state.manifest });
            })
            .catch(err => console.error("[Hook] Global-Stats Fetch Error:", err));
    }
  }, [state.sourceFilter, state.morphMode]);

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
  
  // 2c. Fetch summary for selected node
  useEffect(() => {
    if (state.canvasSelectedNode) {
      fetchSummary(state.canvasSelectedNode);
    }
  }, [state.canvasSelectedNode, fetchSummary]);

  // 4. Derived Data (Memoized)
  const nodeMap = useMemo(() => {
    if (!state.selectedRoot || !state.rootData?.derivatives) return {};
    return calculateNodeMap(state.selectedRoot, state.rootData.derivatives, state.direction, state.arrangement, state.layoutConfig);
  }, [
    state.selectedRoot, 
    state.rootData?.derivatives, 
    state.direction, 
    state.arrangement, 
    // 🛡️ Structural Guard: Only recalculate if geometry changes, ignore theme
    state.layoutConfig.nodeSize,
    state.layoutConfig.nodeWidth,
    state.layoutConfig.nodePaddingY,
    state.layoutConfig.interTierGap,
    state.layoutConfig.interRowGap,
    state.layoutConfig.lineGapX,
    state.layoutConfig.lineGapY,
    state.layoutConfig.lineTension,
    state.layoutConfig.rootGap,
    state.layoutConfig.spacingMode,
    state.layoutConfig.anchorX,
    state.layoutConfig.anchorY
  ]);

  // 5. Auto-Fit Calculation (Anchor-Pinned Radial Fit)
  useEffect(() => {
    if (Object.keys(nodeMap).length === 0) return;

    // To solve vertical sliding, we pin the translation to the Root node's anchor.
    // We then calculate the scale based on the furthest branch to ensure everything fits.
    const rootKey = normalizeWord(state.selectedRoot) || state.selectedRoot || '';
    const rootPos = nodeMap[rootKey];
    const box = getForestBoundingBox(nodeMap);

    if (rootPos) {
      // 1. Calculate the 'Radial Extent' (furthest point from the root in each direction)
      const radialW = Math.max(rootPos.x - box.minX, box.maxX - rootPos.x) * 2;
      const radialH = Math.max(rootPos.y - box.minY, box.maxY - rootPos.y) * 2;

      // 2. Define target viewport area
      const targetW = 1200;
      const targetH = 800;

      // 3. Calculate scale based on the radial extent (ensures symmetric fit around root)
      const scaleW = targetW / Math.max(radialW, 100);
      const scaleH = targetH / Math.max(radialH, 100);
      const scale = Math.min(scaleW, scaleH, 1.2);

      // 4. Constant Translation: 0
      // We no longer move the root to 1000,1000. 
      // We keep it at its anchor position so it doesn't "travel".
      const translateX = 0;
      const translateY = 0;

      dispatch({
        type: 'SET_FIT_TRANSFORM',
        transform: { x: translateX, y: translateY, scale }
      });
    }
  }, [nodeMap, state.selectedRoot, dispatch]);

  return {
    state,
    dispatch,
    nodeMap,
    fetchRootDetails,
    fetchSummary
  };
};
