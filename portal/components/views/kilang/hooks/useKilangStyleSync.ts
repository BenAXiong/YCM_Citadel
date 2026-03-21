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
  };
}

export const useKilangStyleSync = ({ layoutConfig }: UseKilangStyleSyncProps) => {
  // 1. Sync Layout Config to CSS Variables for SVG Tree Lines
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--kilang-link-start', layoutConfig.lineColor);
    root.style.setProperty('--kilang-link-mid', layoutConfig.lineColorMid);
    root.style.setProperty('--kilang-link-end', layoutConfig.lineGradientEnd);
    root.style.setProperty('--kilang-link-width', `${layoutConfig.lineWidth}px`);
    root.style.setProperty('--kilang-link-opacity', layoutConfig.lineOpacity.toString());
    root.style.setProperty('--kilang-link-blur', `${layoutConfig.lineBlur}px`);
    root.style.setProperty('--kilang-link-tension', layoutConfig.lineTension.toString());
    root.style.setProperty('--kilang-link-dash', layoutConfig.lineDashArray.toString());
    root.style.setProperty('--kilang-link-flow-speed', layoutConfig.lineFlowSpeed > 0 ? `${11 - layoutConfig.lineFlowSpeed}s` : '0s');
  }, [
    layoutConfig.lineColor, 
    layoutConfig.lineColorMid, 
    layoutConfig.lineGradientEnd, 
    layoutConfig.lineWidth, 
    layoutConfig.lineOpacity, 
    layoutConfig.lineBlur,
    layoutConfig.lineTension,
    layoutConfig.lineDashArray,
    layoutConfig.lineFlowSpeed
  ]);

  // 2. Real-time CSS Variable Syncing & Custom Theme Loading
  useEffect(() => {
    const applyOverrides = () => {
      const themeName = layoutConfig.theme;
      
      const root = document.documentElement;
      const themedEl = document.querySelector('[data-theme]');

      // 1. Clear all existing inline overrides first to prevent theme contamination
      THEME_VARS.forEach(v => {
        root.style.removeProperty(v);
        if (themedEl) (themedEl as HTMLElement).style.removeProperty(v);
      });

      // 2. Map standard theme data-theme attribute
      if (themedEl) themedEl.setAttribute('data-theme', themeName);

      // 3. Load theme-specific overrides from localStorage
      const saved = localStorage.getItem(`kilang-custom-theme-${themeName}`);
      if (!saved) return;
      
      try {
        const parsed = JSON.parse(saved);
        Object.entries(parsed).forEach(([key, val]) => {
          root.style.setProperty(key, val as string);
          if (themedEl) (themedEl as HTMLElement).style.setProperty(key, val as string);
        });
      } catch (e) {
        console.error('Failed to sync theme overrides:', e);
      }
    };

    applyOverrides();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === `kilang-custom-theme-${layoutConfig.theme}`) {
        applyOverrides();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [layoutConfig.theme]);
};
