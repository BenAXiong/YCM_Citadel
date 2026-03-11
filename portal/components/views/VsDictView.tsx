"use client";

import React from 'react';
import { Volume2, BookOpen, Quote, Info, ChevronDown, ChevronUp, Layers } from "lucide-react";
import { UILang, UIStrings } from "@/types";
import { SOURCES } from "@/lib/sources";

interface VsDictViewProps {
  results: any[];
  uiLang: UILang;
  s: any;
  playAudio: (url: string) => void;
  layout?: "vertical" | "horizontal";
  columns?: number | "AUTO";
  dictDensity?: "standard" | "compact" | "preview";
  selectedDialects?: Set<string>;
}

export default function VsDictView({
  results,
  uiLang,
  s,
  playAudio,
  layout = "vertical",
  columns = 2,
  dictDensity = "standard",
  selectedDialects = new Set()
}: VsDictViewProps) {
  const [expandedCards, setExpandedCards] = React.useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getSourceLabel = (val: string) => {
    return SOURCES.find(s => s.value === val)?.label || val;
  };

  if (selectedDialects.size === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-20 opacity-40">
        <Layers className="w-16 h-16 mb-6 text-[var(--accent)]" />
        <p className="font-mono text-sm uppercase tracking-widest">PLEASE SELECT DIALECTS FROM SIDEBAR</p>
        <p className="text-[10px] font-mono opacity-20 mt-4 leading-relaxed max-w-xs text-center uppercase tracking-tighter">Dictionary results are grouped by dialect. Select at least one source to view vocabulary and examples.</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-20 opacity-40">
        <BookOpen className="w-16 h-16 mb-6 text-[var(--accent)]" />
        <p className="font-mono text-sm uppercase tracking-widest">{s.waitingMode1 || "SEARCH FOR VOCABULARY"}</p>
        <p className="text-[10px] font-mono opacity-20 mt-4">API ENDPOINT: /api/search?mode=DICT</p>
      </div>
    );
  }

  const getGridCols = () => {
    if (layout === 'vertical') return 'max-w-5xl space-y-8';
    
    let colNum = columns === "AUTO" ? Math.max(1, Math.min(6, selectedDialects.size)) : columns;

    switch (colNum) {
      case 2: return 'grid grid-cols-1 lg:grid-cols-2 gap-6';
      case 3: return 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6';
      case 4: return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4';
      case 5: return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3';
      case 6: return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2';
      case 1: return 'grid grid-cols-1 gap-6';
      default: return 'grid grid-cols-1 lg:grid-cols-2 gap-6';
    }
  };

  const isCompact = dictDensity === "compact" || dictDensity === "preview";
  const isPreview = dictDensity === "preview";

  return (
    <div className={`w-full h-full overflow-y-auto custom-scrollbar ${isCompact ? 'p-2' : 'p-8'} pb-64`}>
      <div className={`mx-auto ${getGridCols()} ${isCompact ? 'gap-2' : ''}`}>
        {results.map((item, idx) => (
          <div key={item.id || idx} className={`bg-[var(--bg-panel)] border border-[var(--border-dark)] rounded-2xl shadow-xl hover:border-[var(--accent)]/50 transition-all group ${layout === 'horizontal' ? 'flex flex-col' : ''} relative ${isPreview ? 'overflow-visible mb-3' : 'overflow-hidden'}`}>
            {/* Header: Headword & Meaning */}
            <div className={`${isCompact ? 'p-3' : 'p-6'} border-b border-[var(--border-dark)] bg-gradient-to-br from-[var(--bg-highlight)] to-transparent rounded-t-2xl relative ${isPreview && !expandedCards[item.id] ? 'rounded-b-2xl border-b-0' : ''}`}>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-[var(--accent)] text-black font-mono text-[9px] font-black uppercase tracking-tighter">
                      {item.dialect_name}
                    </span>
                    <span className="text-[9px] text-[var(--text-sub)] font-mono opacity-40 uppercase tracking-widest bg-[var(--bg-deep)] px-1 rounded">
                      {getSourceLabel(item.source)} #{item.id}
                    </span>
                  </div>
                  <h2 className={`${isCompact ? 'text-xl' : 'text-3xl'} font-black text-[var(--text-main)] tracking-tight leading-none pt-2`}>
                    {item.ab}
                  </h2>
                  <p className={`${isCompact ? 'text-sm' : 'text-lg'} text-[var(--accent)] font-bold opacity-80`}>
                    {item.zh}
                  </p>
                </div>

                {item.audio_url && (
                  <button
                    onClick={() => playAudio(item.audio_url)}
                    className={`${isCompact ? 'p-2 rounded-xl' : 'p-4 rounded-2xl'} bg-[var(--bg-deep)] border border-[var(--border-dark)] text-[var(--accent)] hover:scale-110 active:scale-95 transition-all shadow-lg group-hover:shadow-[var(--accent-rgb)/0.2]`}
                  >
                    <Volume2 className={isCompact ? "w-5 h-5" : "w-8 h-8"} />
                  </button>
                )}
              </div>

              {/* Preview Toggle Chevron (Centered at bottom border of header) */}
              {isPreview && item.examples && item.examples.length > 0 && (
                <button 
                  onClick={() => toggleExpand(item.id)}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-6 h-6 bg-[var(--bg-panel)] border border-[var(--border-dark)] rounded-full flex items-center justify-center text-[var(--text-sub)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all z-20 shadow-md"
                >
                  {expandedCards[item.id] ? <ChevronUp className="w-3" /> : <ChevronDown className="w-3" />}
                </button>
              )}
            </div>

            {/* Examples Section */}
            {item.examples && item.examples.length > 0 && (!isPreview || expandedCards[item.id]) && (
              <div className={`${isCompact ? 'p-2 space-y-2' : 'p-5 space-y-4'} bg-[var(--bg-sub)] border-t border-[var(--border-dark)]`}>
                <div className={`${isCompact ? 'grid gap-1.5' : 'grid gap-3'}`}>
                  {item.examples.slice(0, (!isPreview && !expandedCards[item.id]) ? 3 : undefined).map((ex: any, eidx: number) => (
                    <div
                      key={eidx}
                      className={`${isCompact ? 'p-2' : 'p-4'} rounded-xl bg-[var(--bg-panel)] border border-[var(--border-dark)] hover:border-[var(--accent)]/30 transition-colors group/ex relative overflow-hidden`}
                    >
                      <div className="flex justify-between items-center gap-4 relative z-10">
                        <div className="space-y-1 flex-1">
                          <p className="text-base font-bold text-[var(--text-main)] italic leading-tight">
                            “{ex.ab}”
                          </p>
                          <p className="text-xs text-[var(--text-sub)] font-medium">
                            {ex.zh}
                          </p>
                        </div>
                        {ex.audio_url && (
                          <button
                            onClick={() => playAudio(ex.audio_url)}
                            className="p-2 rounded-lg bg-[var(--bg-deep)] text-[var(--text-sub)] hover:text-[var(--accent)] hover:bg-[var(--bg-highlight)] transition-all"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="absolute top-0 right-0 p-1.5 opacity-100 flex gap-1.5">
                        {ex.level && <span className="text-[7px] font-mono bg-[var(--accent)] text-black px-1 rounded-sm font-bold">LV.{ex.level}</span>}
                        <span className="text-[7px] font-mono text-[var(--accent)] bg-[var(--bg-deep)] border border-[var(--accent)]/20 px-1 rounded-sm uppercase tracking-tighter">
                          {getSourceLabel(ex.source || ex.category)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {!isPreview && item.examples.length > 3 && (
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="w-full py-2 bg-[var(--bg-deep)] border border-[var(--border-dark)] rounded-lg text-[9px] font-mono text-[var(--text-sub)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-all flex items-center justify-center gap-2 uppercase tracking-widest font-bold"
                  >
                    {expandedCards[item.id] ? (
                      <><ChevronUp className="w-3 h-3" /> Show Less</>
                    ) : (
                      <><ChevronDown className="w-3 h-3" /> Show {item.examples.length - 3} More Sentences</>
                    )}
                  </button>
                )}
              </div>
            )}


            {/* Footer / Meta */}
            {!isPreview && (!item.examples || item.examples.length === 0) && (
              <div className="px-8 py-4 bg-[var(--bg-deep)]/30 flex items-center gap-2 opacity-30">
                <Info className="w-3.5 h-3.5" />
                <span className="text-[9px] font-mono uppercase tracking-widest">No example sentences found</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
