"use client";

import React from 'react';
import { Volume2, BookOpen, Quote, Info, ChevronDown, ChevronUp, Layers, Copy } from "lucide-react";
import { ALL_DIALECTS } from "@/lib/dialects";
import { UILang, UIStrings } from "@/types";
import { SOURCES } from "@/lib/sources";
import geometryData from "@/lib/corpus_geometry.json";

// Map TID (from original_uuid) to the module and lesson index (0-59)
const tidToLessonMap: Record<string, { mod: string, index: number }> = {};
['essay', 'dialogue'].forEach((mod) => {
  const modData = (geometryData as any)[mod];
  if (modData) {
    modData.forEach((item: any, idx: number) => {
      Object.values(item.alignment || {}).forEach((tid: any) => {
        if (tid) {
          const cleanTid = String(tid).replace(/\D/g, '');
          if (cleanTid) {
            tidToLessonMap[cleanTid] = { mod, index: idx };
          }
        }
      });
    });
  }
});

interface VsDictViewProps {
  results: any[];
  uiLang: UILang;
  s: any;
  playAudio: (url: string) => void;
  layout?: "vertical" | "horizontal";
  columns?: number | "AUTO" | "FLEX+";
  dictDensity?: "standard" | "compact" | "preview";
  dictAlignment?: "flow" | "aligned";
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
  dictAlignment = "flow",
  selectedDialects = new Set()
}: VsDictViewProps) {
  const [expandedCards, setExpandedCards] = React.useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getSourceLabel = (val: string) => {
    return SOURCES.find(s => s.value === val)?.label || val;
  };

  const getGridCols = () => {
    if (layout === 'vertical') return 'max-w-5xl space-y-8';
    
    if (columns === "FLEX+") {
      const isCentering = selectedDialects.size < 6;
      return `flex flex-row flex-nowrap gap-4 items-start w-full min-w-full ${isCentering ? 'justify-center' : 'justify-start px-8'}`;
    }

    // New logic for 1-6 columns: Centered flexbox
    return 'flex flex-row flex-wrap gap-4 items-start justify-center w-full';
  };

  const isCompact = dictDensity === "compact" || dictDensity === "preview";
  const isPreview = dictDensity === "preview";
  const isAligned = dictAlignment === "aligned" && layout === "horizontal" && selectedDialects.size > 0;

  // Grouping for Aligned mode
  const sortedDialectsList = React.useMemo(() => {
    return Array.from(selectedDialects).sort((a, b) => {
      const idxA = ALL_DIALECTS.indexOf(a);
      const idxB = ALL_DIALECTS.indexOf(b);
      return idxA - idxB;
    });
  }, [selectedDialects]);
  const resultsByDialect = React.useMemo(() => {
    if (!isAligned) return {};
    const groups: Record<string, any[]> = {};
    sortedDialectsList.forEach(d => groups[d] = []);
    results.forEach(item => {
      if (groups[item.dialect_name]) groups[item.dialect_name].push(item);
    });
    return groups;
  }, [results, isAligned, sortedDialectsList]);

  const getColWidthStyle = () => {
    const num = columns === "AUTO" || columns === "FLEX+" 
      ? Math.max(1, selectedDialects.size) 
      : columns;
    
    // For width ratio, we cap the divisor at 6
    const effectiveNum = Math.min(6, num);
    
    let w = '100%';
    if (effectiveNum === 1) w = '33.33%';
    else if (effectiveNum === 2) w = '33.33%';
    else if (effectiveNum === 3) w = '25%';
    else if (effectiveNum === 4) w = '20%';
    else if (effectiveNum === 5) w = '20%';
    else if (effectiveNum === 6) w = '16.66%';

    if (columns === "FLEX+") {
      return { 
        minWidth: `calc(${w} - 16px)`, 
        maxWidth: `calc(${w} - 16px)`,
        flexShrink: 0
      };
    }

    return { 
      width: `calc(${w} - 16px)`,
      flexShrink: 0
    };
  };

  const getStructureInfo = (ex: any) => {
    if (!ex) return '';
    const src = (ex.source || ex.category || '').toLowerCase();
    
    if (ex.original_uuid) {
      const parts = ex.original_uuid.split('_');
      if ((src.includes('essay') || src.includes('dialogue')) && parts.length >= 3) {
        // Try to map using TID (usually the second to last part)
        const tid = parts[parts.length - 2];
        const match = tidToLessonMap[tid] || Object.values(tidToLessonMap).find(m => parts.includes(m.mod)); // Fallback scan
        let mappedFallback = tidToLessonMap[tid];
        
        // Scan parts if tid direct match failed
        if (!mappedFallback) {
          for (const p of parts) {
            if (tidToLessonMap[p]) {
              mappedFallback = tidToLessonMap[p];
              break;
            }
          }
        }

        if (mappedFallback) {
            const num = mappedFallback.index + 1;
            let diffLabel = uiLang === 'en' ? 'UPPER' : '中高';
            if (num <= 20) diffLabel = uiLang === 'en' ? 'INTRO' : '初級';
            else if (num <= 40) diffLabel = uiLang === 'en' ? 'INTER' : '中級';
            return `${diffLabel} L.${num}`;
        }
        return `${parts[1]}_${parts[2]}`;
      } else if (src.includes('nine') && parts.length >= 3) {
        return `L.${parts[1]} C.${parts[2]}`;
      } else if (src.includes('twelve') && parts.length >= 3) {
        return `L.${parts[1]} L.${parts[2]}`;
      } else if ((src.includes('grmpts') || src.includes('pattern')) && parts.length >= 2) {
        return `t${parseInt(parts[1])}`;
      }
    }

    const fallbackParts = [];
    if (src.includes('essay') || src.includes('dialogue')) {
      if (ex.unit_id) fallbackParts.push(`T.${ex.unit_id}`);
      else if (ex.category && !isNaN(Number(ex.category))) fallbackParts.push(`T.${ex.category}`);
    } else if (src.includes('nine') || src.includes('twelve')) {
      if (ex.lesson) fallbackParts.push(`L.${ex.lesson}`);
    } else if (src.includes('grmpts') || src.includes('pattern')) {
      if (ex.unit_id) fallbackParts.push(`P.${ex.unit_id}`);
    }

    if (ex.original_id) fallbackParts.push(`#${ex.original_id}`);
    if (fallbackParts.length > 0) return fallbackParts.join(' ');
    
    // Fallback for ILRDF words
    if (ex.id) return `#${ex.id}`;
    
    return '';
  };

  const getFullTooltip = (ex: any) => {
    if (!ex) return '';
    const label = getSourceLabel(ex.source || ex.category);
    const lv = ex.level ? ` | LV.${ex.level}` : '';
    const struct = getStructureInfo(ex);
    return `${label.toUpperCase()}${lv}${struct ? ` | ${struct}` : ''}`;
  };

  const renderCard = (item: any, idx: number) => {
    return (
      <div key={item.id || idx} className={`bg-[var(--bg-panel)] border border-[var(--border-dark)] rounded-2xl shadow-xl hover:border-[var(--accent)]/50 transition-all group ${layout === 'horizontal' ? 'flex flex-col' : ''} relative ${isPreview ? 'overflow-visible mb-3' : 'overflow-hidden'}`}>
        {/* Header: Headword & Meaning */}
        <div 
          className={`${isCompact ? 'p-3' : 'p-6'} border-b border-[var(--border-dark)] bg-gradient-to-br from-[var(--bg-highlight)] to-transparent rounded-t-2xl relative ${isPreview && !expandedCards[item.id] ? 'rounded-b-2xl border-b-0' : ''}`}
          title={isAligned ? getFullTooltip(item) : undefined}
        >
          <div className="flex justify-between items-start leading-tight">
            <div className="space-y-1">
              {!isAligned && (
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-[var(--accent)] text-black font-mono text-[9px] font-black uppercase tracking-tighter">
                    {item.dialect_name}
                  </span>
                  <span className="text-[9px] text-[var(--text-sub)] font-mono opacity-40 uppercase tracking-widest bg-[var(--bg-deep)] px-1 rounded flex items-center gap-1">
                    {getSourceLabel(item.source)} <span className="opacity-50">|</span> {getStructureInfo(item)}
                  </span>
                </div>
              )}
              <h2 className={`${isCompact ? 'text-xl' : 'text-3xl'} font-black text-[var(--text-main)] tracking-tight leading-none pt-2`}>
                {item.ab}
              </h2>
              <p className={`${isCompact ? 'text-sm' : 'text-lg'} text-[var(--accent)] font-bold opacity-80`}>
                {item.zh}
              </p>
            </div>

            <div className={`flex flex-col gap-2 items-center ${isCompact ? 'px-2' : 'px-4'}`}>
              <button
                onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(item.ab); }}
                className="text-[var(--text-sub)] hover:text-[var(--accent)] transition-all hover:scale-110 active:scale-95"
                title="Copy term"
              >
                <Copy className={isCompact ? "w-4 h-4" : "w-6 h-6"} />
              </button>
              {(item.audio_url || item.audio) && (
                <button
                  onClick={(e) => { e.stopPropagation(); playAudio(item.audio_url || item.audio); }}
                  className="text-[var(--accent)] hover:scale-110 active:scale-95 transition-all drop-shadow-md"
                  title="Play audio"
                >
                  <Volume2 className={isCompact ? "w-5 h-5" : "w-8 h-8"} />
                </button>
              )}
            </div>
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
                  title={isAligned ? getFullTooltip(ex) : undefined}
                >
                  <div className="flex justify-between items-center gap-4 relative z-10">
                    <div className="space-y-1 flex-1">
                      <p className="text-base font-bold text-[var(--text-main)] italic leading-tight">
                        {ex.ab}
                      </p>
                      <p className="text-xs text-[var(--text-sub)] font-medium">
                        {ex.zh}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 items-center px-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(ex.ab); }}
                        className="text-[var(--text-sub)] hover:text-[var(--accent)] transition-all hover:scale-110 active:scale-95"
                        title="Copy sentence"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {(ex.audio_url || ex.audio) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); playAudio(ex.audio_url || ex.audio); }}
                          className="text-[var(--accent)] hover:scale-110 active:scale-95 transition-all drop-shadow-md"
                          title="Play audio"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {!isAligned && (
                    <div className="absolute top-0 right-0 p-1.5 opacity-100 flex gap-1.5">
                      {ex.level && <span className="text-[7px] font-mono bg-[var(--accent)] text-black px-1 rounded-sm font-bold">LV.{ex.level}</span>}
                      {getStructureInfo(ex) && <span className="text-[7px] font-mono text-[var(--text-sub)] bg-[var(--bg-deep)] px-1 rounded-sm">{getStructureInfo(ex)}</span>}
                      <span className="text-[7px] font-mono text-[var(--accent)] bg-[var(--bg-deep)] border border-[var(--accent)]/20 px-1 rounded-sm uppercase tracking-tighter">
                        {getSourceLabel(ex.source || ex.category)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!isPreview && item.examples.length > 3 && (
              <button
                onClick={() => toggleExpand(item.id)}
                className="w-full py-2 bg-[var(--bg-deep)] border border-[var(--border-dark)] rounded-lg text-[9px] font-mono text-[var(--text-sub)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-all flex items-center justify-center gap-2 uppercase tracking-widest font-bold"
              >
                {expandedCards[item.id] ? (
                  <><ChevronUp className="w-3 h-3" /> {s.showLess}</>
                ) : (
                  <><ChevronDown className="w-3 h-3" /> {s.showMore?.replace('%n', (item.examples.length - 3).toString())}</>
                )}
              </button>
            )}
          </div>
        )}

        {/* Footer / Meta */}
        {!isPreview && (!item.examples || item.examples.length === 0) && (
          <div className="px-8 py-4 bg-[var(--bg-deep)]/30 flex items-center gap-2 opacity-30">
            <Info className="w-3.5 h-3.5" />
            <span className="text-[9px] font-mono uppercase tracking-widest">{s.noExamples}</span>
          </div>
        )}
      </div>
    );
  };

  if (selectedDialects.size === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-20 opacity-40">
        <Layers className="w-16 h-16 mb-6 text-[var(--accent)]" />
        <p className="font-mono text-sm uppercase tracking-widest">{s.selectDialects}</p>
        <p className="text-[10px] font-mono opacity-20 mt-4 leading-relaxed max-w-xs text-center uppercase tracking-tighter">
          {s.dictDesc}
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-20 opacity-40">
        <BookOpen className="w-16 h-16 mb-6 text-[var(--accent)]" />
        <p className="font-mono text-sm uppercase tracking-widest">{s.searchVocab}</p>
        <p className="text-[10px] font-mono opacity-20 mt-4">API ENDPOINT: /api/search?mode=DICT</p>
      </div>
    );
  }

  return (
    <div className={`w-full h-full overflow-auto custom-scrollbar ${isCompact ? 'p-2' : 'p-8'}`}>
      {isAligned ? (
        <div className={`${getGridCols()} items-start pr-8`}>
          {sortedDialectsList.map(dialect => (
            <div 
              key={dialect} 
              className="flex flex-col gap-4 snap-start" 
              style={getColWidthStyle()}
            >
              <div className="p-3 bg-[var(--bg-panel)] border border-[var(--border-dark)] rounded-lg text-center">
                <span className="text-[20px] font-black uppercase text-[var(--accent)] tracking-[0.2em]">{dialect}</span>
              </div>
              <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent mb-2" />
              <div className={`flex flex-col ${isCompact ? 'gap-2' : 'gap-6'}`}>
                {resultsByDialect[dialect].map((item, idx) => renderCard(item, idx))}
                {resultsByDialect[dialect].length === 0 && (
                  <div className="p-12 border border-dashed border-[var(--border-dark)] rounded-2xl flex flex-col items-center justify-center opacity-20">
                    <Info className="w-6 h-6 mb-2" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-center">{s.noResultsDialect}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`${getGridCols()} items-start pr-8`}>
          {results.map((item, idx) => (
            <div key={item.id || idx} style={layout === 'horizontal' ? getColWidthStyle() : {}}>
              {renderCard(item, idx)}
            </div>
          ))}
        </div>
      )}
      <div className="h-64" />
    </div>
  );
}
