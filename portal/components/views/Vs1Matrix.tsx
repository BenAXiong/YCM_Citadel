"use client";

import React from 'react';
import { Check, Copy, Volume2 } from "lucide-react";
import { getDialectName } from "@/lib/dialects";
import { getSourceLabel } from "@/lib/utils";
import { Sentence, UILang, UIStrings } from "@/types";

interface Vs1MatrixProps {
  pagedResults: Sentence[];
  filteredResults: Sentence[];
  displayColumns: string[];
  displayLimit: number;
  setDisplayLimit: (val: number | ((prev: number) => number)) => void;
  uiLang: UILang;
  s: UIStrings;
  handleCopy: (text: string, id: string) => void;
  copiedId: string | null;
  playAudio: (url: string) => void;
  getRowText: (r: any) => string;
  getColText: (col: string) => string;
}

export default function Vs1Matrix({
  pagedResults,
  filteredResults,
  displayColumns,
  displayLimit,
  setDisplayLimit,
  uiLang,
  s,
  handleCopy,
  copiedId,
  playAudio,
  getRowText,
  getColText
}: Vs1MatrixProps) {
  return (
    <div className="inline-block min-w-full pb-32">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-[var(--bg-panel)] border-b border-[var(--border-dark)]">
            <th className="px-5 py-6 border-r border-[var(--border-dark)] text-[var(--accent)] font-mono text-lg font-black tracking-tight sticky top-0 left-0 z-20 shadow-[4px_0_10px_rgba(0,0,0,0.3)] min-w-[320px] bg-[var(--bg-panel)] text-left uppercase border-l border-[var(--border-dark)]">
              {s.semantics}
            </th>
            {displayColumns.map(col => (
              <th key={col} className="px-5 py-6 text-[var(--text-main)] font-mono text-lg font-black tracking-tight sticky top-0 z-10 shadow-sm min-w-[200px] bg-[var(--bg-panel)] border-r border-[var(--border-dark)] last:border-r-0">
                <div className="flex items-center justify-between group">
                  <span>{getDialectName(col, uiLang)}</span>
                  <button onClick={() => handleCopy(getColText(col), `col-${col}`)} className="opacity-0 group-hover:opacity-100 transition p-1.5 hover:bg-[var(--bg-highlight)] rounded-full">
                    {copiedId === `col-${col}` ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-dark)]">
          {pagedResults.map((r, idx) => (
            <tr key={idx} className="hover:bg-[var(--bg-sub)] transition-colors group/row">
              <td className="px-4 py-3 text-[var(--text-main)] border-r border-[var(--border-dark)] font-sans sticky left-0 z-10 bg-[var(--bg-deep)] group-hover/row:bg-[var(--bg-sub)]">
                <div className="flex items-start justify-between min-h-[1.5rem] group/cell">
                  <div className="flex flex-col">
                    <span className="text-wrap max-w-[280px]">{r.zh}</span>
                  </div>
                  <button onClick={() => handleCopy(getRowText(r), `row-${idx}`)} className="opacity-0 group-hover/row:opacity-100 transition p-1 hover:bg-[var(--bg-panel)] rounded">
                    {copiedId === `row-${idx}` ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </td>
              {displayColumns.map(col => (
                <td key={col} className="px-4 py-3 text-[var(--text-sub)] align-top font-mono text-[13px] border-r border-[var(--border-dark)] last:border-r-0">
                  {r[col]?.map((item: any, i: number) => (
                    <div key={i} className="flex flex-col mb-4 last:mb-0 group/item p-2 hover:bg-[var(--bg-panel)] rounded transition border border-transparent hover:border-[var(--border-light)] relative">
                      <div className="flex items-start justify-between">
                        <span className="flex-1 text-wrap max-w-md group-hover/item:text-[var(--text-main)] transition-colors leading-relaxed">
                          {item.text}
                        </span>
                        <div className="flex space-x-1 opacity-0 group-hover/item:opacity-100 transition ml-2">
                          <button onClick={() => handleCopy(item.text, `c-${idx}-${col}-${i}`)} title="Copy this variant" className="p-1 hover:bg-[var(--bg-highlight)] rounded border border-transparent hover:border-[var(--border-light)]">
                            {copiedId === `c-${idx}-${col}-${i}` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                          {item.audio && <button onClick={() => playAudio(item.audio)} title="Play this variant" className="p-1 hover:bg-[var(--bg-highlight)] rounded border border-transparent hover:border-[var(--border-light)] hover:text-[var(--accent)]"><Volume2 className="w-3 h-3" /></button>}
                        </div>
                      </div>
                      <div className="absolute -bottom-0.5 right-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none z-10 scale-90 origin-bottom-right">
                        <span className="text-[7px] font-mono tracking-tighter uppercase px-1.5 py-0.5 bg-[var(--bg-panel)] rounded text-[var(--accent)] border border-[var(--border-dark)] shadow-sm">
                          {item.inferred && "*"}
                          {getSourceLabel(item.source?.replace(/^\*+/, ''))} {item.level ? `L${item.level}` : ''} {item.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {filteredResults.length > displayLimit && (
        <div className="flex justify-center pt-8 pb-32">
          <button
            onClick={() => setDisplayLimit(d => d + 100)}
            className="px-12 py-3 border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-glow)] rounded-full transition-all font-mono text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(0,0,0,0.2)]"
          >
            {uiLang === 'en' ? 'Load More Results' : '加載更多結果'}
          </button>
        </div>
      )}
    </div>
  );
}
