'use client';

import React, { useState, useMemo, useRef } from 'react';
import './Kilang.css';

// Modular components
import { KilangDesktopLayout } from './kilang/KilangDesktopLayout';
import { KilangMobileLayout } from './kilang/KilangMobileLayout';
import { useIsMobile } from '@/hooks/useIsMobile';

// Data Logic
  import { useKilang } from './kilang/useKilang';
  import { getForestBoundingBox, generateTreeString, getActiveHighlightChain, normalizeWord } from './kilang/kilangUtils';
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
    { id: 'ALL', label: 'MoE (all)', tooltip: 'Ministry of Education Amis Dictionary (Consolidated). Merges all selected authoritative sources into a single morphological view.' },
    { id: 'p', label: '蔡中涵 (p)', tooltip: 'Standard Modern Amis Dictionary by Safolu (蔡中涵). The primary repository for modern Amis usage and standardized definitions.' },
    { id: 'm', label: '吳明義 (m)', tooltip: 'MoE Amis Dictionary by Wu Ming-yi (吳明義). Specialized Chinese definitions focusing on dialectal variations and cultural nuances.' },
    { id: 's', label: '學習詞表 (s)', tooltip: 'Pedagogical: 9-Year & 12-Year Curriculum Word List. Foundational vocabulary used in standardized indigenous language education.' },
    { id: 'a', label: '原住民族 (a)', tooltip: 'Council of Indigenous Peoples (CIP) Glossary. Official administrative and cultural terminology compiled by the Council.' },
    { id: 'old-s', label: 'Old-S (Legacy)', tooltip: 'Legacy archival data from earlier MOE collections. Preserved for comparative linguistic and historical analysis.' },
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
    if (!selectedRoot) return;
    const { mode, format, textFormat, textContent, includeDefinitions, includeSentences, background, area, resolution, margin } = state.exportSettings;
    
    dispatch({ type: 'SET_UI', exporting: true });

    try {
      if (mode === 'text') {
        const { rootData, canvasSelectedNode } = state;
        const derivatives = rootData?.derivatives || [];
        const activeNode = canvasSelectedNode || selectedRoot;
        
        // 1. Determine Content (Filter & Root)
        let exportData: any[] = [];
        let exportRoot = selectedRoot;
        let filterSet: Set<string> | undefined = undefined;

        if (textContent === 'kilang') {
          exportData = [
            { word_ab: selectedRoot, isRoot: true }, // Simple root entry for structure
            ...derivatives
          ];
        } else {
          // chain: focuses on focal path + subtree
          filterSet = getActiveHighlightChain(activeNode, derivatives, selectedRoot);
          exportData = derivatives.filter((d: any) => filterSet!.has(normalizeWord(d.word_ab) || ''));
          // Add root if it's part of the chain
          if (filterSet.has(normalizeWord(selectedRoot) || '')) {
             exportData.unshift({ word_ab: selectedRoot, isRoot: true });
          }
        }

        // 2. Format
        let blob: Blob;
        let filename: string;

        if (textFormat === 'json') {
          // JSON formatting: optionally filter out meta if clean export requested? 
          // For now, respect includeDefinitions by either mapping or keeping raw
          const finalJson = exportData.map(node => {
            const newNode = { ...node };
            if (!includeDefinitions) delete (newNode as any).definition;
            if (!includeSentences) delete (newNode as any).sentences;
            return newNode;
          });
            
          blob = new Blob([JSON.stringify(finalJson, null, 2)], { type: 'application/json' });
          filename = `kilang-${selectedRoot.toLowerCase()}-${textContent}-${new Date().getTime()}.json`;
        } else {
          // TXT formatting: ASCII Tree
          const treeStr = generateTreeString(
            derivatives, 
            selectedRoot, 
            '', 
            true, 
            0, 
            filterSet, 
            null, 
            includeDefinitions,
            includeSentences
          );
          
          blob = new Blob([treeStr], { type: 'text/plain' });
          filename = `kilang-${selectedRoot.toLowerCase()}-${textContent}-${new Date().getTime()}.txt`;
        }

        // Trigger Download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        
      } else {
        // IMAGE MODE
        if (!treeRef.current) return;
        // Small delay to ensure UI updates
        await new Promise(resolve => setTimeout(resolve, 500));

        const forestInner = document.getElementById('kilang-forest-inner');
        const container = treeRef.current;
        const targetElement = forestInner || container; 
        
        const options: any = {
          pixelRatio: resolution,
          quality: 1,
          cacheBust: true,
          skipAutoScale: true,
        };

        if (background === 'white') options.backgroundColor = '#ffffff';
        else if (background === 'black') options.backgroundColor = '#000000';
        else if (background === 'origin') {
          options.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--kilang-bg').trim() || '#020617';
        }
        else if (background === 'transparent') options.backgroundColor = null;

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
        } else {
          const { scale, isFit, fitTransform } = state;
          const scrollX = container.scrollLeft;
          const scrollY = container.scrollTop;
          const PADDING_OFFSET = 128; 
          
          options.width = container.clientWidth;
          options.height = container.clientHeight;
          
          const currentTransform = isFit
            ? `translate(${fitTransform.x}px, ${fitTransform.y}px) scale(${fitTransform.scale})`
            : `scale(${scale})`;
            
          options.style = {
            transformOrigin: '0 0',
            transform: `translate(${PADDING_OFFSET - scrollX}px, ${PADDING_OFFSET - scrollY}px) ${currentTransform}`,
            borderRadius: '0',
            background: options.backgroundColor || 'transparent',
            width: '4000px',
            height: '4000px'
          };
        }

        const { toPng, toSvg } = await import('html-to-image');
        const dataUrl = format === 'svg' 
          ? await toSvg(targetElement!, options)
          : await toPng(targetElement!, options);

        const link = document.createElement('a');
        link.download = `kilang-${selectedRoot.toLowerCase()}-${area}-${new Date().getTime()}.${format}`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try a different setting.');
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
