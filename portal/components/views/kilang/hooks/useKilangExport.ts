'use client';

import { getForestBoundingBox, generateTreeString, getActiveHighlightChain, normalizeWord } from '../kilangUtils';

interface UseKilangExportProps {
  state: any;
  dispatch: (action: any) => void;
  nodeMap: any;
  treeRef: React.RefObject<HTMLDivElement | null>;
}

export const useKilangExport = ({
  state,
  dispatch,
  nodeMap,
  treeRef
}: UseKilangExportProps) => {
  const handleExport = async () => {
    const { selectedRoot } = state;
    if (!selectedRoot) return;
    
    const { 
      mode, 
      format, 
      textFormat, 
      textContent, 
      includeDefinitions, 
      includeSentences, 
      background, 
      area, 
      resolution, 
      margin 
    } = state.exportSettings;
    
    dispatch({ type: 'SET_UI', exporting: true });

    try {
      if (mode === 'text') {
        const { rootData, canvasSelectedNode } = state;
        const derivatives = rootData?.derivatives || [];
        const activeNode = canvasSelectedNode || selectedRoot;
        
        let exportData: any[] = [];
        let filterSet: Set<string> | undefined = undefined;

        if (textContent === 'kilang') {
          exportData = [
            { word_ab: selectedRoot, isRoot: true },
            ...derivatives
          ];
        } else {
          filterSet = getActiveHighlightChain(activeNode, derivatives, selectedRoot);
          exportData = derivatives.filter((d: any) => filterSet!.has(normalizeWord(d.word_ab) || ''));
          if (filterSet.has(normalizeWord(selectedRoot) || '')) {
             exportData.unshift({ word_ab: selectedRoot, isRoot: true });
          }
        }

        let blob: Blob;
        let filename: string;

        if (textFormat === 'json') {
          const finalJson = exportData.map(node => {
            const newNode = { ...node };
            if (!includeDefinitions) delete (newNode as any).definition;
            if (!includeSentences) delete (newNode as any).sentences;
            return newNode;
          });
            
          blob = new Blob([JSON.stringify(finalJson, null, 2)], { type: 'application/json' });
          filename = `kilang-${selectedRoot.toLowerCase()}-${textContent}-${new Date().getTime()}.json`;
        } else {
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

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        
      } else {
        if (!treeRef.current) return;
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
          options.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--kilang-bg-base').trim() || '#020617';
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

  return { handleExport };
};
