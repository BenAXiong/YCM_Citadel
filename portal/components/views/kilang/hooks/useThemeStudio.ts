'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { KilangAction, KilangState } from '../kilangReducer';
import { THEME_VARS, THEME_PRESETS } from '../kilangConstants';

interface UseThemeStudioProps {
  dispatch: React.Dispatch<KilangAction>;
  layoutConfig: KilangState['layoutConfig'];
  state: KilangState;
}

export const useThemeStudio = ({ dispatch, layoutConfig, state }: UseThemeStudioProps) => {
  // --- Core State ---
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [activeBulbs, setActiveBulbs] = useState<Record<string, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['masters']));
  const [collapsedSubsections, setCollapsedSubsections] = useState<Set<string>>(new Set());
  const [slideIndex, setSlideIndex] = useState(0);
  
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const galleryRef = useRef<HTMLDivElement | null>(null);

  // --- Derived State ---
  const landingVersion = state.landingVersion || 2;
  const logoStyle = (state.logoStyles && state.logoStyles[landingVersion]) || 'square';
  const logoSettings = (state.logoSettings && state.logoSettings[landingVersion]) || { 
    scale: 1, radius: 45, xOffset: 0, opacity: 1, glowIntensity: 0.3, glowColor: '#3b82f6' 
  };

  // --- Performance Optimization: Holistic Style Injection ---
  const applyThemeStyles = useCallback((mapping: Record<string, string>) => {
    if (typeof window === 'undefined') return;
    let styleEl = document.getElementById('kilang-studio-overrides') as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'kilang-studio-overrides';
      document.head.appendChild(styleEl);
    }

    const cssRules = Object.entries(mapping)
      .map(([name, value]) => `${name}: ${value} !important;`)
      .join(' ');
    
    styleEl.innerHTML = `:root, [data-theme] { ${cssRules} }`;
  }, []);

  // --- Helper: Resolve CSS variable to hex/raw for inputs ---
  const getVariableValue = useCallback((name: string) => {
    if (typeof window === 'undefined') return '';
    const inline = document.documentElement.style.getPropertyValue(name).trim();
    if (inline) return inline;
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '';
  }, []);

  const getColorValue = useCallback((input: string) => {
    if (typeof window === 'undefined') return '#000000';
    if (!input) return '#000000';
    
    const varName = input.startsWith('var(') 
      ? input.match(/var\((--[\w-]+)\)/)?.[1] 
      : input.startsWith('--') ? input : null;

    if (!varName) {
      if (input.startsWith('#')) return input;
      return input.startsWith('rgb') ? input : '#000000';
    }

    const val = getVariableValue(varName);
    if (val.startsWith('#')) return val;
    
    if (val.startsWith('rgb')) {
       const rgb = val.match(/\d+/g);
       if (rgb && rgb.length >= 3) {
         const hex = (n: string) => parseInt(n).toString(16).padStart(2, '0');
         return `#${hex(rgb[0])}${hex(rgb[1])}${hex(rgb[2])}`;
       }
    }
    return '#000000'; 
  }, [getVariableValue]);

  const getHonestColor = useCallback((name: string, value: string) => {
    if (name.includes('tier-1-fill')) return `color-mix(in srgb, ${value} calc(20% * var(--kilang-node-intensity)), var(--kilang-bg-base))`;
    if (name.includes('tier-2-fill')) return `color-mix(in srgb, ${value} calc(10% * var(--kilang-node-intensity)), var(--kilang-bg-base))`;
    if (name.includes('tier-') && name.includes('-fill')) return `color-mix(in srgb, ${value} calc(5% * var(--kilang-node-intensity)), var(--kilang-bg-base))`;
    return `color-mix(in srgb, ${value}, transparent calc(100% - var(${name}-opacity, 1) * 100%))`;
  }, []);

  // --- Persistence Logic: Hydration ---
  useEffect(() => {
    const themeName = layoutConfig.theme;

    // 1. Sync Gallery
    const currentIdx = THEME_PRESETS.findIndex(p => p.id === themeName);
    if (currentIdx !== -1) setSlideIndex(Math.floor(currentIdx / 3));

    // 2. Clear all existing inline overrides
    document.documentElement.setAttribute('style', '');
    const styleEl = document.getElementById('kilang-studio-overrides');
    if (styleEl) styleEl.innerHTML = '';

    const savedCSS = localStorage.getItem(`kilang-custom-theme-${themeName}`);
    const savedConfig = localStorage.getItem(`kilang-config-overrides-${themeName}`);
    const loadedOverrides: Record<string, string> = {};

    if (savedCSS) {
      try {
        const parsed = JSON.parse(savedCSS);
        Object.assign(loadedOverrides, parsed);
        // BATCH UPDATE via Style Injection
        applyThemeStyles(loadedOverrides);
      } catch (e) {}
    }
    setOverrides(loadedOverrides);

    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        dispatch({ 
          type: 'SYNC_HOLISTIC_THEME', 
          theme: themeName, 
          layoutConfig: parsed.layoutConfig, 
          branding: { 
            logoStyles: parsed.logoStyles, 
            logoSettings: parsed.logoSettings, 
            landingVersion: parsed.landingVersion 
          } 
        });
      } catch (e) {}
    } else {
      const preset = THEME_PRESETS.find(p => p.id === themeName);
      if (preset?.config) {
        dispatch({ 
          type: 'SYNC_HOLISTIC_THEME', 
          theme: themeName, 
          layoutConfig: preset.config, 
          branding: {
            logoStyles: state.logoStyles || { 1: 'square', 2: 'round', 3: 'round' },
            logoSettings: state.logoSettings && Object.keys(state.logoSettings).length > 0 ? state.logoSettings : { 
              1: { scale: 1, radius: 45, xOffset: 0, opacity: 1, glowIntensity: 0.3, glowColor: '#3b82f6' },
              2: { scale: 1, radius: 45, xOffset: 0, opacity: 1, glowIntensity: 0.3, glowColor: '#3b82f6' },
              3: { scale: 1, radius: 45, xOffset: 0, opacity: 1, glowIntensity: 0.3, glowColor: '#3b82f6' }
            },
            landingVersion: state.landingVersion || 2
          } 
        });
      }
    }
  }, [layoutConfig.theme]);

  // --- Update Actions ---
  const updateVariable = useCallback((name: string, value: string) => {
    const nextOverrides = { ...overrides, [name]: value };
    applyThemeStyles(nextOverrides);
    setOverrides(nextOverrides);
    
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      localStorage.setItem(`kilang-custom-theme-${layoutConfig.theme}`, JSON.stringify(nextOverrides));
    }, 500);
  }, [layoutConfig.theme, overrides, applyThemeStyles]);

  const updateVariables = useCallback((mapping: Record<string, string>) => {
    const nextOverrides = { ...overrides, ...mapping };
    applyThemeStyles(nextOverrides);
    setOverrides(nextOverrides);

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      localStorage.setItem(`kilang-custom-theme-${layoutConfig.theme}`, JSON.stringify(nextOverrides));
    }, 500);
  }, [layoutConfig.theme, overrides, applyThemeStyles]);

  // --- Holistic Actions (Save, Reset, Export) ---
  const handleSave = useCallback(() => {
    localStorage.setItem(`kilang-custom-theme-${layoutConfig.theme}`, JSON.stringify(overrides));
    localStorage.setItem(`kilang-config-overrides-${layoutConfig.theme}`, JSON.stringify({
      layoutConfig,
      logoStyles: state.logoStyles,
      logoSettings: state.logoSettings,
      landingVersion: state.landingVersion
    }));

    dispatch({ type: 'SET_TOAST', message: `Theme "${THEME_PRESETS.find(p => p.id === layoutConfig.theme)?.label}" Saved Successfully` });
  }, [layoutConfig, state, overrides, dispatch]);

  const handleReset = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    
    document.documentElement.setAttribute('style', '');
    const styleEl = document.getElementById('kilang-studio-overrides');
    if (styleEl) styleEl.innerHTML = '';

    const themeName = layoutConfig.theme;
    const savedCSS = localStorage.getItem(`kilang-custom-theme-${themeName}`);
    const savedConfig = localStorage.getItem(`kilang-config-overrides-${themeName}`);
    const preset = THEME_PRESETS.find(p => p.id === themeName);

    if (savedCSS) {
        const parsed = JSON.parse(savedCSS);
        setOverrides(parsed);
        applyThemeStyles(parsed);
    } else {
        setOverrides({});
    }

    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      dispatch({ 
        type: 'SYNC_HOLISTIC_THEME', 
        theme: themeName, 
        layoutConfig: parsed.layoutConfig, 
        branding: { 
            logoStyles: parsed.logoStyles, 
            logoSettings: parsed.logoSettings, 
            landingVersion: parsed.landingVersion 
        } 
      });
    } else if (preset) {
      dispatch({
        type: 'SYNC_HOLISTIC_THEME',
        theme: preset.id,
        layoutConfig: preset.config || {},
        branding: {
          logoStyles: { 1: 'square', 2: 'round', 3: 'round' },
          logoSettings: {
            1: { scale: 1, radius: 45, xOffset: 0, opacity: 1.0, glowIntensity: 0, glowColor: 'var(--kilang-primary)' },
            2: { scale: 1.35, radius: 30, xOffset: 0, opacity: 0.5, glowIntensity: 0.1, glowColor: 'var(--kilang-primary)' },
            3: { scale: 1.6, radius: 44, xOffset: -320, opacity: 0.6, glowIntensity: 0.1, glowColor: 'var(--kilang-primary)' }
          },
          landingVersion: 2
        }
      });
    }
    dispatch({ type: 'SET_TOAST', message: 'Theme Reloaded from Memory' });
  }, [layoutConfig.theme, dispatch]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSubsection = (id: string) => {
    setCollapsedSubsections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return {
    state: {
      overrides,
      activeBulbs,
      expandedSections,
      collapsedSubsections,
      slideIndex,
      landingVersion,
      logoStyle,
      logoSettings
    },
    helpers: {
      getVariableValue,
      getColorValue,
      getHonestColor
    },
    actions: {
      updateVariable,
      updateVariables,
      handleSave,
      handleReset,
      toggleSection,
      toggleSubsection,
      setActiveBulbs,
      setSlideIndex,
      setLandingVersion: (v: 1 | 2 | 3) => dispatch({ type: 'SET_UI', landingVersion: v }),
      setLogoStyle: (s: 'original' | 'square' | 'round') => dispatch({ 
        type: 'SET_UI', 
        logoStyles: { ...state.logoStyles, [landingVersion]: s } as Record<number, 'original' | 'square' | 'round'> 
      }),
      updateLogoSettings: (settings: any) => dispatch({ type: 'SET_UI', logoSettings: { ...state.logoSettings, [landingVersion]: { ...logoSettings, ...settings } } }),
      resetLogoSettings: () => dispatch({ type: 'RESET_LOGO_SETTINGS', version: landingVersion }),
      setGalleryRef: (el: HTMLDivElement | null) => { galleryRef.current = el; }
    }
  };
};
