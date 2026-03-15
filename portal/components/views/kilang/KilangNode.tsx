'use client';

import React, { useState, useRef } from 'react';
import { Zap, TreePine, GitCommit, GitBranch, Circle, Flower2, Sprout, Boxes } from 'lucide-react';

interface WordTooltipProps {
  word: string;
  children: React.ReactNode;
  dictCode?: string;
  id?: string;
  summaryCache: Record<string, string[]>;
  fetchSummary: (word: string) => Promise<void>;
  className?: string;
}

export const WordTooltip = ({ word, children, dictCode, id, summaryCache, fetchSummary, className = "relative inline-block" }: WordTooltipProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<any>(null);
  const cacheKey = word.toLowerCase();

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsHovered(true);
    fetchSummary(word);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setIsHovered(false), 400);
  };

  return (
    <div id={id} className={className} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {children}
      <div
        onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current); setIsHovered(true); }}
        onMouseLeave={handleLeave}
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-80 bg-[#0f172a]/90 backdrop-blur-xl border border-blue-500/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl p-6 transition-all z-[2000] pointer-events-auto text-left leading-normal duration-200 border-b-4 border-b-blue-500 ${isHovered ? 'visible opacity-100 translate-y-0' : 'invisible opacity-0 translate-y-2'}`}
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
        <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 w-3 h-3 bg-[#0f172a] border-r border-b border-blue-500/30" />
      </div>
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
    rootColor: string;
    branchColor: string;
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
                backgroundColor: `${config.rootColor}33`, 
                borderColor: config.rootColor,
                boxShadow: `0 0 60px ${config.rootColor}40`,
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
              className={`transition-all text-sm group ring-1 ring-white/5 relative z-10 border flex items-center justify-center ${
                tier === 2 ? "border-blue-500/40 bg-blue-500/10 shadow-lg shadow-blue-500/10" :
                tier === 3 ? "border-indigo-500/30 bg-indigo-500/5 opacity-80 scale-95 shadow-md shadow-indigo-500/5" :
                tier === 4 ? "border-emerald-500/20 bg-emerald-500/5 opacity-60 scale-90 border-dashed" :
                "border-white/10 bg-white/5 opacity-40 scale-75"
              }`}
              style={{ 
                borderRadius: `${config.nodeRounding}px`,
                borderColor: tier === 2 ? `${config.branchColor}66` : undefined,
                backgroundColor: tier === 2 ? `${config.branchColor}1A` : undefined,
                width: `${config.nodeWidth}px`,
                paddingTop: `${config.nodePaddingY}px`,
                paddingBottom: `${config.nodePaddingY}px`
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
