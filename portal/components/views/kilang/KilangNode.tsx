'use client';

import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Zap, TreePine, GitCommit, GitBranch, Circle, Flower2, Sprout, Boxes } from 'lucide-react';

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
  showTooltip = true
}: WordTooltipProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<any>(null);
  const cacheKey = word.toLowerCase();

  const handleEnter = () => {
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
      className={`fixed w-80 bg-[var(--kilang-tooltip-bg)] backdrop-blur-3xl border border-[var(--kilang-tooltip-border)] shadow-[0_0_80px_rgba(0,0,0,0.9)] rounded-[var(--kilang-radius-lg)] p-6 transition-all z-[99999] pointer-events-auto text-left leading-normal border-b-8 border-b-[var(--kilang-tooltip-accent)] animate-in fade-in duration-200 ${side === 'right'
        ? 'translate-x-0 -translate-y-1/2'
        : '-translate-x-1/2 -translate-y-full'
        }`}
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
      }}
    >
      <div className="flex flex-col gap-1 mb-4 border-b border-[var(--kilang-border-std)] pb-3">
        <div className="flex items-center justify-between text-normal">
          <span className="text-2xl font-black text-[var(--kilang-primary-text)] tracking-tighter uppercase">{word}</span>
          {dictCode && <span className="text-[10px] font-mono text-[var(--kilang-primary-text)] bg-[var(--kilang-primary-bg)]/10 px-2 py-0.5 rounded-full uppercase">{dictCode}</span>}
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
    <div ref={triggerRef} id={id} className={className} onMouseEnter={showTooltip ? handleEnter : undefined} onMouseLeave={showTooltip ? handleLeave : undefined}>
      {children}
      {showTooltip && tooltipContent}
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
    nodeRounding: number;
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
    const iconClass = `w-3 h-3 ${tier === 2 ? 'text-[var(--kilang-tier-2-border)]' : tier === 3 ? 'text-[var(--kilang-tier-3-border)]' : 'text-[var(--kilang-tier-4-border)]'} shrink-0`;
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
    return (config as any)[`tier${t}${type}`] || (type === 'Fill' ? `var(--kilang-tier-${t}-fill)` : `var(--kilang-tier-${t}-border)`);
  };

  return (
    <WordTooltip word={word} dictCode={dictCode} id={cleanId} summaryCache={summaryCache} fetchSummary={fetchSummary} showTooltip={showTooltip}>
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
              className={`border-4 p-8 rounded-full z-20 relative min-w-[120px] flex items-center justify-center transition-all duration-500 ${isHighlighted ? 'shadow-[0_0_80px_var(--kilang-primary-glow)]' : 'shadow-[0_0_50px_var(--kilang-primary-glow)]'}`}
              style={{
                backgroundColor: `color-mix(in srgb, ${getTierColor('Fill', 1)} ${isHighlighted ? '40%' : '20%'}, var(--kilang-bg-base))`,
                borderColor: isHighlighted ? 'var(--kilang-primary-active)' : getTierColor('Border', 1),
                boxShadow: isHighlighted ? `0 0 80px color-mix(in srgb, ${getTierColor('Fill', 1)}, transparent 50%)` : `0 0 60px color-mix(in srgb, ${getTierColor('Fill', 1)}, transparent 70%)`,
                paddingTop: `${config.nodePaddingY * 2}px`,
                paddingBottom: `${config.nodePaddingY * 2}px`
              }}
            >
              <div className="flex items-center gap-3">
                {config.showIcons && getTierIcon()}
                <span className={`text-[var(--kilang-tier-1-text)] font-black text-2xl tracking-tighter transition-all ${isHighlighted ? 'scale-110 drop-shadow-[0_0_10px_var(--kilang-primary-glow)]' : ''}`}>{word}</span>
              </div>
            </div>
          ) : (
            <div
              className={`transition-all text-sm group ring-1 relative z-10 border flex items-center justify-center ${isHighlighted ? 'ring-[var(--kilang-primary-border)]/50 shadow-[0_0_30px_var(--kilang-primary-glow)]' : 'ring-[var(--kilang-border)]'}`}
              style={{
                borderRadius: `${config.nodeRounding}px`,
                borderColor: isHighlighted 
                  ? `color-mix(in srgb, ${getTierColor('Border', tier)} 80%, white)` 
                  : `color-mix(in srgb, ${getTierColor('Border', tier)} 40%, transparent)`,
                backgroundColor: `color-mix(in srgb, ${getTierColor('Fill', tier)} ${isHighlighted ? '30%' : (tier === 2 ? '10%' : '5%')}, var(--kilang-bg-base))`,
                width: `${config.nodeWidth}px`,
                paddingTop: `${config.nodePaddingY}px`,
                paddingBottom: `${config.nodePaddingY}px`,
                transform: tier === 3 ? 'scale(0.95)' : tier === 4 ? 'scale(0.9)' : tier >= 5 ? 'scale(0.85)' : 'none'
              }}
            >
              <div className="flex items-center gap-2">
                {config.showIcons && getTierIcon()}
                <span className={`font-black uppercase tracking-widest truncate max-w-full text-center ${isRoot ? 'text-[var(--kilang-tier-1-text)]' : `text-[var(--kilang-tier-${tier}-text)] opacity-60 group-hover:opacity-100 group-hover:text-[var(--kilang-primary)]`}`}>{word}</span>
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

  return (
    prev.word === next.word &&
    prev.dictCode === next.dictCode &&
    prev.tier === next.tier &&
    prev.isRoot === next.isRoot &&
    prev.isHighlighted === next.isHighlighted &&
    prev.isHovered === next.isHovered &&
    prev.showTooltip === next.showTooltip &&
    prev.config === next.config &&
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
