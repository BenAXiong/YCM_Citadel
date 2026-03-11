"use client";

import React from 'react';
import { ChevronLeft, ChevronRight, Check, Copy, Volume2 } from "lucide-react";
import { getDialectName } from "@/lib/dialects";
import { Sentence, UILang, UIStrings } from "@/types";

interface Vs2SlideViewProps {
  filteredResults: Sentence[];
  slideIndex: number;
  setSlideIndex: (val: number | ((prev: number) => number)) => void;
  slideCols: number;
  setSlideCols: (val: number) => void;
  displayColumns: string[];
  uiLang: UILang;
  s: UIStrings;
  handleCopy: (text: string, id: string) => void;
  copiedId: string | null;
  playAudio: (url: string) => void;
}

export default function Vs2SlideView({
  filteredResults,
  slideIndex,
  setSlideIndex,
  slideCols,
  setSlideCols,
  displayColumns,
  uiLang,
  s,
  handleCopy,
  copiedId,
  playAudio
}: Vs2SlideViewProps) {
  if (filteredResults.length === 0) return null;

  return (
    <div className="w-full h-full flex flex-col p-6 animate-in fade-in zoom-in-95">
      <div className="w-full flex justify-between items-center mb-6 border-b border-[var(--border-dark)] pb-4">
        <div className="flex items-center space-x-6">
          <span className="font-mono text-sm text-[var(--text-sub)]">
            {s.sentence} {slideIndex + 1} / {filteredResults.length}
          </span>
          <div className="flex bg-[var(--bg-panel)] p-1 rounded border border-[var(--border-dark)]">
            {[1, 2, 3, 4, 5].map(v => (
              <button 
                key={v} 
                onClick={() => setSlideCols(v)} 
                className={`w-7 h-7 flex items-center justify-center rounded text-xs transition ${slideCols === v ? 'bg-[var(--accent)] text-[var(--bg-deep)] font-bold' : 'text-[var(--text-sub)] hover:bg-[var(--bg-sub)]'}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setSlideIndex(p => Math.max(0, p - 1))} className="p-2 border border-[var(--border-light)] rounded bg-[var(--bg-panel)] hover:border-[var(--accent)]"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={() => setSlideIndex(p => Math.min(filteredResults.length - 1, p + 1))} className="p-2 border border-[var(--border-light)] rounded bg-[var(--bg-panel)] hover:border-[var(--accent)]"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>
      
      <div className="text-center py-8 relative group mb-8">
        <h2 className="text-4xl font-sans font-medium">{filteredResults[slideIndex].zh}</h2>
        <button onClick={() => handleCopy(filteredResults[slideIndex].zh, 'szh')} className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition p-2 hover:bg-[var(--bg-sub)] rounded">
          {copiedId === 'szh' ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid gap-6 pr-2" style={{ gridTemplateColumns: `repeat(${slideCols}, minmax(0, 1fr))` }}>
          {displayColumns.map(col => {
            const items = filteredResults[slideIndex][col];
            if (!items || items.length === 0) return null;
            return (
              <div key={col} className="bg-[var(--bg-panel)] p-5 border border-[var(--border-light)] rounded-lg shadow-xl relative group">
                <div className="text-xs font-mono text-[var(--accent)] mb-3 tracking-widest uppercase">{getDialectName(col, uiLang)}</div>
                <div className="space-y-4">
                  {items.map((item: any, i: number) => (
                    <div key={i} className="flex flex-col">
                      <div className="text-xl leading-relaxed">{item.text}</div>
                      <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 bg-[var(--bg-sub)] rounded text-[var(--text-sub)] border border-[var(--border-dark)]">
                          {item.inferred && <span className="text-[var(--accent)] mr-1 font-bold">*</span>}{item.source} {item.level ? `L${item.level}` : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => handleCopy(items.map((x: any) => x.text).join('/'), `sc-${col}`)} className="p-1.5 bg-[var(--bg-deep)] rounded border border-[var(--border-light)]">
                    {copiedId === `sc-${col}` ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  {items[0].audio && <button onClick={() => playAudio(items[0].audio)} className="p-1.5 border border-[var(--border-light)] rounded bg-[var(--bg-deep)]"><Volume2 className="w-3.5 h-3.5" /></button>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
