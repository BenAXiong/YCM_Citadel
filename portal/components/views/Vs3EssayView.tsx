"use client";

import React from 'react';
import { Presentation, Filter, Volume2 } from "lucide-react";
import { getDialectName } from "@/lib/dialects";
import { getSourceLabel } from "@/lib/utils";
import { Sentence, UILang, UIStrings } from "@/types";

interface Vs3EssayViewProps {
  results: Sentence[];
  filteredResults: Sentence[];
  displayColumns: string[];
  uiLang: UILang;
  s: UIStrings;
  essayId: string;
  sourceLabel?: string;
  playAudio: (url: string) => void;
  fontSize: number;
  cardPadding: number;
  bodyPadding: number;
  fillWidth: boolean;
  cardsPerRow: number;
}

export default function Vs3EssayView({
  results,
  filteredResults,
  displayColumns,
  uiLang,
  s,
  essayId,
  sourceLabel,
  playAudio,
  fontSize,
  cardPadding,
  bodyPadding,
  fillWidth,
  cardsPerRow
}: Vs3EssayViewProps) {
  return (
    <div 
      className="w-full h-full flex flex-col items-center overflow-y-auto custom-scrollbar p-6 space-y-12 pb-64"
      style={{ paddingLeft: `${bodyPadding}px`, paddingRight: `${bodyPadding}px` }}
    >
      {/* Dynamic Title and Icon removed as requested */}

      <div className={`w-full ${fillWidth ? 'max-w-full' : 'max-w-6xl'} space-y-16 py-12`}>
        {displayColumns.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-[var(--border-dark)] rounded-3xl opacity-60 bg-[var(--bg-sub)]">
            <Filter className="w-12 h-12 mb-4 text-[var(--accent)]" />
            <div className="text-xl font-mono uppercase tracking-[0.2em]">{uiLang === 'en' ? 'SELECT_DIALECTS_TO_COMPARE' : '請選擇語底進行對照'}</div>
          </div>
        ) : (
          <div className="space-y-24">
            {results.map((r, sidx) => {
              const hasSelected = displayColumns.some(col => r[col] && r[col].length > 0);
              if (!hasSelected) return null;

              return (
                <div key={sidx} className="group/sent relative">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-black flex items-center justify-center font-mono font-black text-lg shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)] shrink-0">
                      {sidx + 1}
                    </div>
                    <div className="flex-1 flex flex-col pt-1">
                      <h3 className="text-3xl font-sans font-bold text-[var(--text-main)] leading-tight tracking-tight">
                        {r.zh}
                      </h3>
                      <div className="h-[1px] w-full bg-gradient-to-r from-[var(--accent)] to-transparent opacity-30 mt-2"></div>
                    </div>
                  </div>

                  <div 
                    className="grid gap-6"
                    style={{ 
                      gridTemplateColumns: `repeat(${typeof window !== 'undefined' && window.innerWidth < 1024 ? 1 : cardsPerRow}, minmax(0, 1fr))` 
                    }}
                  >
                    {displayColumns.map(col => {
                      const items = r[col];
                      if (!items || items.length === 0) return null;
                      return (
                        <div 
                          key={col} 
                          onClick={() => items[0]?.audio && playAudio(items[0].audio)}
                          style={{ padding: `${cardPadding}px` }}
                          className={`bg-[var(--bg-panel)] rounded-xl border border-[var(--border-dark)] shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden group/card border-t border-t-transparent hover:border-t-[var(--accent)] ${items[0]?.audio ? 'cursor-pointer active:scale-[0.98]' : ''}`}
                        >
                          <div className="absolute top-2 right-3 opacity-30 group-hover/card:opacity-100 transition-opacity">
                            <span className="text-[9px] font-mono tracking-widest text-[var(--accent)] uppercase font-black">
                              {getDialectName(col, uiLang)}
                            </span>
                          </div>
                          
                          <div className="space-y-4 pt-2">
                            {items.map((item: any, i: number) => (
                              <div key={i} className="flex flex-col space-y-2">
                                <div 
                                  className="font-medium leading-relaxed text-[var(--text-main)] tracking-wide"
                                  style={{ fontSize: `${fontSize}px` }}
                                >
                                  {item.text}
                                </div>
                                {item.audio && (
                                  <div className="flex items-center space-x-2 text-[var(--accent)] opacity-0 group-hover/card:opacity-100 transition-opacity">
                                    <Volume2 className="w-3 h-3" />
                                    <span className="text-[8px] font-mono uppercase tracking-tighter">Click to play</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {displayColumns.length > 0 && !displayColumns.some(col => results.some(r => r[col])) && (
               <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-[var(--border-dark)] rounded-3xl opacity-60 bg-[var(--bg-sub)]">
                <Filter className="w-12 h-12 mb-4 text-orange-400" />
                <div className="text-xl font-mono uppercase tracking-[0.2em]">{uiLang === 'en' ? 'NO_DATA_FOR_SELECTION' : '所選語底無對應資料'}</div>
                <div className="text-xs font-mono mt-4 text-[var(--text-sub)] max-w-md text-center">
                  Found {results.length} fragments in Topic {parseInt(essayId) - 32019}, but none match your selected dialects.
                  Available in DB: {Array.from(new Set(results.flatMap(r => Object.keys(r)).filter(k => k !== 'zh'))).join(', ')}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
