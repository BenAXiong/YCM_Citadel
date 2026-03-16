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
}

export const WordTooltip = ({
  word,
  children,
  dictCode,
  id,
  summaryCache,
  fetchSummary,
  className = "relative inline-block",
  side = 'top'
}: WordTooltipProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<any>(null);
  const cacheKey = word.toLowerCase();

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

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
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setIsHovered(false), 200);
  };

  // The tooltip content as a separate component or JSX
  const tooltipContent = isHovered && createPortal(
    <div
      onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current); setIsHovered(true); }}
      onMouseLeave={handleLeave}
      className={`fixed w-80 bg-[#0f172a]/95 backdrop-blur-3xl border border-blue-500/40 shadow-[0_0_80px_rgba(0,0,0,0.9)] rounded-[24px] p-6 transition-all z-[99999] pointer-events-auto text-left leading-normal border-b-8 border-b-blue-500 animate-in fade-in duration-200 ${side === 'right'
        ? 'translate-x-0 -translate-y-1/2'
        : '-translate-x-1/2 -translate-y-full'
        }`}
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
      }}
    >
      <div className="flex flex-col gap-1 mb-4 border-b border-white/10 pb-3">
        <div className="flex items-center justify-between text-normal">
          <span className="text-2xl font-black text-white tracking-tighter uppercase">{word}</span>
          {dictCode && <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full uppercase">{dictCode}</span>}
        </div>
        <div className="h-0.5 w-16 bg-blue-500" />
      </div>
      <div className="space-y-4 max-h-[250px] overflow-y-auto custom-scrollbar pr-2 leading-relaxed">
        {summaryCache[cacheKey] === undefined ? (
          <div className="flex items-center gap-2 italic text-blue-400/50 text-xs font-mono">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            DECODING SEMANTIC CORE...
          </div>
        ) : (
          summaryCache[cacheKey].map((def: string, idx: number) => (
            <div key={idx} className="flex gap-3">
              <span className="text-blue-500 font-black text-xs mt-1">{idx + 1}.</span>
              <div className="text-sm text-gray-300 font-medium">{def}</div>
            </div>
          ))
        )}
      </div>
      {/* Arrow */}
      <div
        className={`absolute w-4 h-4 bg-[#0f172a] border-blue-500/20 rotate-45 ${side === 'right'
          ? 'right-full top-1/2 -translate-y-1/2 translate-x-1/2 border-l border-b'
          : 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2 border-r border-b'
          }`}
      />
    </div>,
    document.body
  );

  return (
    <div ref={triggerRef} id={id} className={className} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {children}
      {tooltipContent}
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
  config: {
    nodeSize: number;
    nodeOpacity: number;
    nodeRounding: number;
    // Dynamic Tiers 1-9 Fills & Borders
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
}

export const KilangNode = ({ word, dictCode, tier = 2, isRoot = false, summaryCache, fetchSummary, config }: KilangNodeProps) => {
  const cleanId = `v3-node-${word.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  const getTierIcon = () => {
    if (isRoot) return <TreePine className="w-5 h-5 text-yellow-400 shrink-0" />;

    const iconClass = `w-3 h-3 ${tier === 2 ? 'text-blue-400' : tier === 3 ? 'text-indigo-400' : 'text-emerald-400'} shrink-0`;

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
    return (config as any)[`tier${t}${type}`] || (type === 'Fill' ? '#2563eb' : '#3b82f6');
  };

  return (
    <WordTooltip word={word} dictCode={dictCode} id={cleanId} summaryCache={summaryCache} fetchSummary={fetchSummary}>
      <div
        className="relative transition-all duration-500"
        style={{
          transform: `scale(${config.nodeSize})`,
          opacity: config.nodeOpacity
        }}
      >
        <div className={isRoot ? "kilang-root-bubble" : "kilang-branch-bubble"}>
          {isRoot ? (
            <div
              className="border-4 p-8 rounded-full shadow-[0_0_50px_rgba(59,130,246,0.5)] z-20 relative min-w-[120px] flex items-center justify-center transition-colors duration-500"
              style={{
                // Solid Alpha-Blended background using dynamic Tier 1 fill color
                backgroundColor: `color-mix(in srgb, ${getTierColor('Fill', 1)} 20%, #020617)`,
                borderColor: getTierColor('Border', 1),
                boxShadow: `0 0 60px ${getTierColor('Fill', 1)}40`,
                paddingTop: `${config.nodePaddingY * 2}px`,
                paddingBottom: `${config.nodePaddingY * 2}px`
              }}
            >
              <div className="flex items-center gap-3">
                {config.showIcons && getTierIcon()}
                <span className="text-white font-black text-2xl tracking-tighter">{word}</span>
              </div>
            </div>
          ) : (
            <div
              className="transition-all text-sm group ring-1 ring-white/5 relative z-10 border flex items-center justify-center"
              style={{
                borderRadius: `${config.nodeRounding}px`,
                // Dynamic border color with 40% alpha blend against transparency (glow look)
                borderColor: `color-mix(in srgb, ${getTierColor('Border', tier)} 40%, transparent)`,
                // Solid Alpha-Blended background for all tiers to block connection lines
                backgroundColor: `color-mix(in srgb, ${getTierColor('Fill', tier)} ${tier === 2 ? '10%' : '5%'}, #020617)`,
                width: `${config.nodeWidth}px`,
                paddingTop: `${config.nodePaddingY}px`,
                paddingBottom: `${config.nodePaddingY}px`,
                // Structural offsets per tier (removed internal opacity to maintain blocking)
                transform: tier === 3 ? 'scale(0.95)' : tier === 4 ? 'scale(0.9)' : tier >= 5 ? 'scale(0.85)' : 'none'
              }}
            >
              <div className="flex items-center gap-2">
                {config.showIcons && getTierIcon()}
                <span className="font-bold text-white group-hover:text-blue-300 transition-colors uppercase tracking-widest text-[11px] truncate">{word}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </WordTooltip>
  );
};

export const Metric = ({ label, value, color }: { label: string, value: string | number, color: string }) => {
  const colorMap: any = { blue: 'text-blue-400', red: 'text-red-400' };
  return (
    <div className="flex flex-col items-end">
      <span className="text-[10px] font-black text-kilang-text-muted uppercase tracking-[0.2em]">{label}</span>
      <span className={`text-3xl font-black ${colorMap[color]} font-mono tracking-tighter`}>{value}</span>
    </div>
  );
};
