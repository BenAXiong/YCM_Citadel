'use client';

import { useEffect } from 'react';
import { THEME_VARS } from '../kilangConstants';

interface UseKilangStyleSyncProps {
  layoutConfig: {
    theme: string;
    lineColor: string;
    lineColorMid: string;
    lineGradientEnd: string;
    lineWidth: number;
    lineOpacity: number;
    lineBlur: number;
    lineTension: number;
    lineDashArray: number;
    lineFlowSpeed: number;
    fontFamily: string;
    fontSize: number;
  };
}
export const useKilangStyleSync = ({ layoutConfig }: UseKilangStyleSyncProps) => {
  // --- Performance Optimization: Unified Style Injection ---
  useEffect(() => {
    const themeName = layoutConfig.theme;

    const applyHolisticStyles = () => {
      if (typeof window === 'undefined') return;

      // 1. Prepare Batch Mapping
      const mapping: Record<string, string> = {
        '--kilang-link-start': layoutConfig.lineColor,
        '--kilang-link-mid': layoutConfig.lineColorMid,
        '--kilang-link-end': layoutConfig.lineGradientEnd,
        '--kilang-link-width': `${layoutConfig.lineWidth}px`,
        '--kilang-link-opacity': layoutConfig.lineOpacity.toString(),
        '--kilang-link-blur': `${layoutConfig.lineBlur}px`,
        '--kilang-link-tension': layoutConfig.lineTension.toString(),
        '--kilang-link-dash': layoutConfig.lineDashArray.toString(),
        '--kilang-link-flow-speed': layoutConfig.lineFlowSpeed > 0 ? `${11 - layoutConfig.lineFlowSpeed}s` : '0s',
        '--kilang-font-family': layoutConfig.fontFamily,
        '--kilang-font-size': `${layoutConfig.fontSize}px`
      };

      // 2. Load theme-specific overrides from localStorage
      const saved = localStorage.getItem(`kilang-custom-theme-${themeName}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          Object.assign(mapping, parsed);
        } catch (e) {}
      }

      // 3. Inject/Update Style Tag (Unified with useThemeStudio)
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
    };

    applyHolisticStyles();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === `kilang-custom-theme-${themeName}`) {
        applyHolisticStyles();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [
    layoutConfig.theme,
    layoutConfig.lineColor,
    layoutConfig.lineColorMid,
    layoutConfig.lineGradientEnd,
    layoutConfig.lineWidth,
    layoutConfig.lineOpacity,
    layoutConfig.lineBlur,
    layoutConfig.lineTension,
    layoutConfig.lineDashArray,
    layoutConfig.lineFlowSpeed,
    layoutConfig.fontFamily,
    layoutConfig.fontSize
  ]);
};
