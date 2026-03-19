'use client';

import React, { useState, useMemo, useRef } from 'react';
import './Kilang.css';

// Modular components
import { KilangDesktopLayout } from './kilang/KilangDesktopLayout';
import { KilangMobileLayout } from './kilang/KilangMobileLayout';
import { useIsMobile } from '@/hooks/useIsMobile';

// Data Logic
import { useKilang } from './kilang/useKilang';
import { getForestBoundingBox } from './kilang/kilangUtils';
import { SidebarProvider } from './kilang/SidebarContext';
import { UILang, UIStrings } from '@/types';

interface KilangViewProps {
  uiLang: UILang;
  toggleUiLang: () => void;
  s: UIStrings;
}

export default function KilangView({ uiLang, toggleUiLang, s }: KilangViewProps) {
  const treeRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile(1024); // Tablet/Mobile threshold
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
    summaryCache,
    direction,
    arrangement,
    searchTerm,
    branchFilter,
  } = state;

  const MOE_SOURCES = [
    { id: 'ALL', label: 'ALL SOURCES' },
    { id: 'p', label: '蔡中涵 (p)' },
    { id: 'm', label: '吳明義 (m)' },
    { id: 's', label: '學習詞表 (s)' },
    { id: 'a', label: '原住民族 (a)' },
    { id: 'old-s', label: 'Old-S (Legacy)' },
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
    const { format, background, area, resolution, margin } = state.exportSettings;
    
    dispatch({ type: 'SET_UI', exporting: true });

    try {
      // Small delay to ensure UI updates
      await new Promise(resolve => setTimeout(resolve, 500));

      const forestInner = document.getElementById('kilang-forest-inner');
      const container = treeRef.current;
      const targetElement = forestInner || container; // Always prefer the inner content if available
      
      console.log('--- Export Debug ---');
      console.log('Area:', area, 'Format:', format, 'Resolution:', resolution);
      console.log('Target:', targetElement?.id || 'container');
      
      const options: any = {
        pixelRatio: resolution,
        quality: 1,
        cacheBust: true,
        skipAutoScale: true,
      };

      // Handle Background
      if (background === 'white') options.backgroundColor = '#ffffff';
      else if (background === 'black') options.backgroundColor = '#000000';
      else if (background === 'origin') {
        options.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--kilang-bg').trim() || '#020617';
      }
      else if (background === 'transparent') options.backgroundColor = null;

      // Handle Area & Transformation
      if (area === 'all' && forestInner) {
        const bounds = getForestBoundingBox(nodeMap);
        const padding = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) * (margin / 100);
        
        options.width = (bounds.maxX - bounds.minX) + (padding * 2);
        options.height = (bounds.maxY - bounds.minY) + (padding * 2);
        
        options.style = {
          transformOrigin: '0 0',
          transform: `translate(${-bounds.minX + padding}px, ${-bounds.minY + padding}px) scale(1)`,
          borderRadius: '0',
          background: options.backgroundColor || 'transparent',
          width: '4000px',
          height: '4000px'
        };
        
        console.log('Full View - Bounds:', bounds, 'Output:', options.width, 'x', options.height);
      } else {
        // Window View - Must capture the inner forest but clipped to the container's viewport
        // The container has p-32 (128px) padding, which offsets the target forestInner.
        const { scale, isFit, fitTransform } = state;
        const scrollX = container.scrollLeft;
        const scrollY = container.scrollTop;
        const PADDING_OFFSET = 128; // p-32 in Tailwind
        
        options.width = container.clientWidth;
        options.height = container.clientHeight;
        
        const currentTransform = isFit
          ? `translate(${fitTransform.x}px, ${fitTransform.y}px) scale(${fitTransform.scale})`
          : `scale(${scale})`;
          
        options.style = {
          transformOrigin: '0 0',
          // We shift the content by the negative scroll position PLUS the container's padding
          transform: `translate(${PADDING_OFFSET - scrollX}px, ${PADDING_OFFSET - scrollY}px) ${currentTransform}`,
          borderRadius: '0',
          background: options.backgroundColor || 'transparent',
          width: '4000px',
          height: '4000px'
        };
        
        console.log('Window View - Scroll:', scrollX, scrollY, 'Scale:', scale, 'Padding:', PADDING_OFFSET);
      }

      // Import toSvg if needed (assuming html-to-image provides it)
      const { toPng, toSvg } = await import('html-to-image');
      const dataUrl = format === 'svg' 
        ? await toSvg(targetElement!, options)
        : await toPng(targetElement!, options);

      const link = document.createElement('a');
      link.download = `kilang-${selectedRoot.toLowerCase()}-${area}-${new Date().getTime()}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try a smaller area or lower resolution.');
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

  const layoutProps = {
    state,
    dispatch,
    nodeMap,
    fetchRootDetails,
    fetchSummary,
    filteredRoots,
    bucketHits,
    FILTER_BUCKETS,
    MOE_SOURCES,
    sourceCounts: state.sourceCounts,
    handleExport,
    treeRef,
    uiLang,
    toggleUiLang,
    s,
  };

  return (
    <SidebarProvider value={{
      state,
      dispatch,
      filteredRoots,
      fetchRootDetails,
      bucketHits,
      FILTER_BUCKETS,
      summaryCache,
      fetchSummary
    }}>
      {isMobile ? (
        <KilangMobileLayout {...layoutProps} />
      ) : (
        <KilangDesktopLayout {...layoutProps} />
      )}
    </SidebarProvider>
  );
}
