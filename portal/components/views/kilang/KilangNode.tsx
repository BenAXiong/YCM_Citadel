'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Zap, TreePine, GitCommit, GitBranch, Circle, Flower2, Sprout, Boxes, ExternalLink } from 'lucide-react';
import { useKilangContext } from './KilangContext';

interface WordTooltipProps {
  word: string;
  children: React.ReactNode;
  dictCode?: string;
  id?: string;
  summaryCache: Record<string, string[]>;
  fetchSummary: (word: string) => Promise<void>;
  className?: string;
  side?: 'top' | 'right';
  showTooltip?: boolean;
  accentBorderWidth?: number;
}

export const WordTooltip = ({
  word,
  children,
  dictCode,
  id,
  summaryCache,
  fetchSummary,
  className = "relative inline-block",
  side = 'top',
  showTooltip = true,
  accentBorderWidth = 6
}: WordTooltipProps) => {
  const { state, dispatch } = useKilangContext();
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<any>(null);
  const cacheKey = word.toLowerCase();

  const effectiveShowTooltip = showTooltip && state.showTreeTooltips && state.tooltipMode === 'hover';

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleEnter = () => {
    if (!effectiveShowTooltip) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // DWELL SYSTEM: Only trigger if the user stays for 150ms
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        if (side === 'right') {
          setCoords({ top: rect.top + rect.height / 2, left: rect.right + 16 });
        } else {
          setCoords({ top: rect.top - 16, left: rect.left + rect.width / 2 });
        }
      }
      setIsHovered(true);
      fetchSummary(word);
    }, 150);
  };

  const handleLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsHovered(false), 200);
  };

  const tooltipContent = isHovered && createPortal(
    <div
      onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current); setIsHovered(true); }}
      onMouseLeave={handleLeave}
      className={`fixed w-80 bg-[var(--kilang-tooltip-bg)] backdrop-blur-3xl border border-[var(--kilang-tooltip-border)] shadow-[0_0_80px_rgba(0,0,0,0.9)] rounded-[var(--kilang-radius-lg)] p-6 transition-all z-[99999] pointer-events-auto text-left leading-normal border-b-[var(--kilang-border-w-accent)] border-b-[var(--kilang-tooltip-accent)] animate-in fade-in duration-200 ${side === 'right'
        ? 'translate-x-0 -translate-y-1/2'
        : '-translate-x-1/2 -translate-y-full'
        }`}
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        borderBottomWidth: `${accentBorderWidth}px`
      }}
    >
      <div className="flex flex-col gap-1 mb-4 border-b border-[var(--kilang-border-std)] pb-3">
        <div className="flex items-center justify-between text-normal">
          <span className="text-2xl font-black text-[var(--kilang-primary-text)] tracking-tighter uppercase">{word}</span>
          <div className="flex items-center gap-2">
            {dictCode && <span className="text-[10px] font-mono text-[var(--kilang-primary-text)] bg-[var(--kilang-primary-bg)]/10 px-2 py-0.5 rounded-full uppercase">{dictCode}</span>}
            <button
               onClick={(e) => {
                 e.preventDefault();
                 e.stopPropagation();
                 const nextMode = state.tooltipMode === 'hover' ? 'fixed' : 'hover';
                 dispatch({
                   type: 'SET_UI',
                   canvasSelectedNode: nextMode === 'fixed' ? word : null,
                   tooltipMode: nextMode
                 });
               }}
               className={`p-1 rounded-md transition-all group/mode ${state.tooltipMode === 'fixed' && state.canvasSelectedNode === word ? 'bg-[var(--kilang-accent)]/20 text-[var(--kilang-accent-text)]' : 'bg-[var(--kilang-primary-bg)]/10 text-[var(--kilang-primary-text)]/50 hover:text-[var(--kilang-primary-text)]'}`}
               title={state.tooltipMode === 'hover' ? "Switch to Fixed Mode" : "Switch to Hover Mode"}
            >
               <ExternalLink className={`w-4 h-4 transition-transform ${state.tooltipMode === 'fixed' && state.canvasSelectedNode === word ? 'scale-110' : 'group-hover/mode:scale-110'}`} />
            </button>
          </div>
        </div>
        <div className="h-0.5 w-16 bg-[var(--kilang-primary-bg)]" />
      </div>
      <div className="space-y-4 max-h-[250px] overflow-y-auto custom-scrollbar pr-2 leading-relaxed">
        {summaryCache[cacheKey] === undefined ? (
          <div className="flex items-center gap-2 italic text-[var(--kilang-primary-text)]/50 text-xs font-mono">
            <div className="w-2 h-2 bg-[var(--kilang-primary-bg)] rounded-full animate-pulse" />
            DECODING SEMANTIC CORE...
          </div>
        ) : (
          summaryCache[cacheKey].map((def: string, idx: number) => (
            <div key={idx} className="flex gap-3">
              <span className="text-[var(--kilang-primary)] font-black text-xs mt-1">{idx + 1}.</span>
              <div className="text-sm text-[var(--kilang-text)] opacity-80 font-medium">{def}</div>
            </div>
          ))
        )}
      </div>
      <div
        className={`absolute w-4 h-4 bg-[var(--kilang-bg)] border-[var(--kilang-tooltip-border)] rotate-45 ${side === 'right'
          ? 'right-full top-1/2 -translate-y-1/2 translate-x-1/2 border-l border-b'
          : 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2 border-r border-b'
          }`}
      />
    </div>,
    document.body
  );

  return (
    <div ref={triggerRef} id={id} className={className} onMouseEnter={effectiveShowTooltip ? handleEnter : undefined} onMouseLeave={effectiveShowTooltip ? handleLeave : undefined}>
      {children}
      {effectiveShowTooltip && tooltipContent}
    </div>
  );
};

interface KilangNodeProps {
  word: string;
  dictCode?: string;
  tier?: number;
  isRoot?: boolean;
  summaryCache: Record<string, string[]>;
  fetchSummary: (word: string) => Promise<void>;
  isHighlighted?: boolean;
  isHovered?: boolean;
  onInteraction?: (type: 'hover' | 'select', word: string | null) => void;
  config: {
    nodeSize: number;
    nodeOpacity: number;
    tier1Rounding: number;
    tier2Rounding: number;
    tier3Rounding: number;
    tier4Rounding: number;
    tier5Rounding: number;
    tier6Rounding: number;
    tier7Rounding: number;
    tier8Rounding: number;
    tier9Rounding: number;
    tier1Fill: string; tier1Border: string;
    tier2Fill: string; tier2Border: string;
    tier3Fill: string; tier3Border: string;
    tier4Fill: string; tier4Border: string;
    tier5Fill: string; tier5Border: string;
    tier6Fill: string; tier6Border: string;
    tier7Fill: string; tier7Border: string;
    tier8Fill: string; tier8Border: string;
    tier9Fill: string; tier9Border: string;
    showIcons: boolean;
    nodeWidth: number;
    nodePaddingY: number;
    rootBorderWidth: number;
    accentBorderWidth: number;
    branchBorderWidth: number;
    nodeIntensity: number;
  };
  showTooltip?: boolean;
}

export const KilangNode = React.memo(({
  word,
  dictCode,
  tier = 2,
  isRoot = false,
  summaryCache,
  fetchSummary,
  isHighlighted = false,
  isHovered = false,
  onInteraction,
  config,
  showTooltip = true
}: KilangNodeProps) => {
  const cleanId = `v3-node-${word.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  const getTierIcon = () => {
    if (isRoot) return <TreePine className="w-5 h-5 text-[var(--kilang-accent-text)] shrink-0" />;
    const iconClass = `w-3 h-3 text-[var(--kilang-tier-${tier}-border)] shrink-0 opacity-80`;
    switch (tier) {
      case 2: return <GitCommit className={iconClass} />;
      case 3: return <GitBranch className={iconClass} />;
      case 4: return <Circle className={iconClass} />;
      case 5: return <Flower2 className={iconClass} />;
      case 6: return <Sprout className={iconClass} />;
      default: return <Boxes className={iconClass} />;
    }
  };

  const getTierColor = (type: 'Fill' | 'Border', t: number) => {
    // PREFER CSS VARIABLES: This makes theme changes instant
    return `var(--kilang-tier-${t}-${type.toLowerCase()})`;
  };

  return (
    <WordTooltip word={word} dictCode={dictCode} id={cleanId} summaryCache={summaryCache} fetchSummary={fetchSummary} showTooltip={showTooltip} accentBorderWidth={config.accentBorderWidth}>
      <div
        className={`relative cursor-pointer transition-[opacity,transform] duration-300 ${isHighlighted ? 'z-30' : isHovered ? 'z-20' : 'z-10'}`}
        style={{
          transform: `scale(${config.nodeSize * (isHighlighted ? 1.05 : isHovered ? 1.02 : 1)})`,
          opacity: config.nodeOpacity
        }}
        onMouseEnter={() => onInteraction?.('hover', word)}
        onMouseLeave={() => onInteraction?.('hover', null)}
        onClick={(e) => {
          e.stopPropagation();
          onInteraction?.('select', word);
        }}
      >
        <div className={isRoot ? "kilang-root-bubble" : "kilang-branch-bubble"}>
          {isRoot ? (
            <div
              className={`p-8 z-20 relative min-w-[120px] flex items-center justify-center transition-all duration-500 ${isHighlighted ? 'shadow-[0_0_80px_var(--kilang-primary-glow)]' : 'shadow-[0_0_50px_var(--kilang-primary-glow)]'}`}
              style={{
                borderRadius: `${config.tier1Rounding ?? 100}px`,
                backgroundColor: `color-mix(in srgb, var(--kilang-tier-1-fill) calc(20% * ${config.nodeIntensity}), var(--kilang-bg-base))`,
                borderColor: isHighlighted ? 'var(--kilang-primary-active)' : 'var(--kilang-tier-1-border)',
                borderWidth: `${config.rootBorderWidth}px`,
                borderStyle: 'solid',
                boxShadow: isHighlighted ? `0 0 80px var(--kilang-primary-glow)` : `0 0 60px color-mix(in srgb, var(--kilang-primary-glow), transparent 20%)`,
                paddingTop: `${config.nodePaddingY * 2}px`,
                paddingBottom: `${config.nodePaddingY * 2}px`
              }}
            >
              <div className="flex items-center gap-3">
                {config.showIcons && getTierIcon()}
                <span className="text-[var(--kilang-tier-1-text)] font-black text-2xl tracking-tighter transition-all">
                  {word}
                </span>
              </div>
            </div>
          ) : (
            <div
              className={`transition-all text-sm group relative z-10 flex items-center justify-center ${isHighlighted ? 'shadow-[0_0_30px_var(--kilang-primary-glow)]' : ''}`}
              style={{
                borderRadius: `${(config as any)[`tier${tier}Rounding`] ?? 16}px`,
                borderWidth: `${config.branchBorderWidth}px`,
                borderStyle: 'solid',
                borderColor: isHighlighted
                  ? `color-mix(in srgb, var(--kilang-tier-${tier}-border) 80%, white)`
                  : `color-mix(in srgb, var(--kilang-tier-${tier}-border) 40%, transparent)`,
                boxShadow: isHighlighted ? '0 0 30px var(--kilang-primary-glow)' : 'none',
                backgroundColor: `color-mix(in srgb, var(--kilang-tier-${tier}-fill) calc(${tier === 2 ? '10%' : '5%'} * ${config.nodeIntensity}), var(--kilang-bg-base))`,
                width: `${config.nodeWidth}px`,
                paddingTop: `${config.nodePaddingY}px`,
                paddingBottom: `${config.nodePaddingY}px`,
                transform: tier === 3 ? 'scale(0.95)' : tier === 4 ? 'scale(0.9)' : tier >= 5 ? 'scale(0.85)' : 'none'
              }}
            >
              <div className="flex items-center gap-2 px-4 w-full justify-center">
                {config.showIcons && getTierIcon()}
                <span className="font-black uppercase tracking-widest truncate max-w-full text-center text-[var(--kilang-tier-n-text)]" style={{ color: `var(--kilang-tier-${tier}-text)` }}>
                  {word}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </WordTooltip>
  );
}, (prev, next) => {
  const prevKey = prev.word.toLowerCase();
  const nextKey = next.word.toLowerCase();

  // DEEP VALUE COMPARISON: Ignore layoutConfig object identity if values are same
  const configDiff = 
    prev.config.nodeSize !== next.config.nodeSize ||
    prev.config.nodeOpacity !== next.config.nodeOpacity ||
    prev.config.nodeWidth !== next.config.nodeWidth ||
    prev.config.nodePaddingY !== next.config.nodePaddingY ||
    prev.config.rootBorderWidth !== next.config.rootBorderWidth ||
    prev.config.branchBorderWidth !== next.config.branchBorderWidth ||
    prev.config.tier1Rounding !== next.config.tier1Rounding ||
    prev.config.tier2Rounding !== next.config.tier2Rounding ||
    prev.config.showIcons !== next.config.showIcons;

  return (
    !configDiff &&
    prev.word === next.word &&
    prev.dictCode === next.dictCode &&
    prev.tier === next.tier &&
    prev.isRoot === next.isRoot &&
    prev.isHighlighted === next.isHighlighted &&
    prev.isHovered === next.isHovered &&
    prev.showTooltip === next.showTooltip &&
    prev.onInteraction === next.onInteraction &&
    prev.summaryCache[prevKey] === next.summaryCache[nextKey]
  );
});

export const Metric = React.memo(({ label, value, color }: { label: string, value: string | number, color: string }) => {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[9px] font-black text-[var(--kilang-text)]">{value}</span>
      <span className="text-[6px] font-black text-[var(--kilang-text-muted)] uppercase tracking-tighter leading-none">{label}</span>
    </div>
  );
});
