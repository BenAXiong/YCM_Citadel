'use client';

import React, { useState, useMemo } from 'react';
import { ChevronRight, Copy, Check } from 'lucide-react';
import { useKilangContext } from '../../KilangContext';
import { getLinearPath } from '../../kilangUtils';

export const BreadcrumbPath = () => {
  const { state, dispatch } = useKilangContext();
  const { 
    selectedRoot, 
    rootData, 
    canvasHoverNode, 
    canvasSelectedNode, 
    moveChainToCanvas, 
    exporting 
  } = state;

  const [copiedChain, setCopiedChain] = useState(false);

  const activeHighlightNode = canvasHoverNode || canvasSelectedNode;
  const linearPath = useMemo(() => {
    return getLinearPath(activeHighlightNode, rootData?.derivatives || [], selectedRoot);
  }, [activeHighlightNode, rootData, selectedRoot]);

  const handleCopyChain = (path: string[]) => {
    navigator.clipboard.writeText(path.join(' > '));
    setCopiedChain(true);
    setTimeout(() => setCopiedChain(false), 2000);
  };

  if (!selectedRoot || moveChainToCanvas || linearPath.length === 0 || exporting) return null;

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-500 group">
      <div className="bg-[var(--kilang-bg-base)]/40 backdrop-blur-md border border-[var(--kilang-border)] px-6 py-2 rounded-full flex items-center gap-2.5 shadow-[var(--kilang-shadow-primary)] relative">
        {linearPath.map((word: string, idx: number) => (
          <React.Fragment key={word}>
            <span className={`text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${idx === linearPath.length - 1 ? 'text-[var(--kilang-primary-text)]' : 'text-[var(--kilang-text-muted)]'}`}>
              {word}
            </span>
            {idx < linearPath.length - 1 && (
              <ChevronRight className="w-2.5 h-2.5 text-[var(--kilang-text-muted)]" />
            )}
          </React.Fragment>
        ))}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); handleCopyChain(linearPath); }}
        className="p-1.5 rounded-lg bg-[var(--kilang-ctrl-bg)] backdrop-blur-md border border-[var(--kilang-border-std)] text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)] transition-all opacity-0 group-hover:opacity-100 shadow-[var(--kilang-shadow-primary)] shrink-0"
        title="Copy Path"
      >
        {copiedChain ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};
