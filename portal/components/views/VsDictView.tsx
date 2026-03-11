"use client";

import React from 'react';
import { Volume2, BookOpen, Quote, Info } from "lucide-react";
import { UILang, UIStrings } from "@/types";

interface VsDictViewProps {
  results: any[];
  uiLang: UILang;
  s: any;
  playAudio: (url: string) => void;
  layout?: "vertical" | "horizontal";
  columns?: number;
}

export default function VsDictView({
  results,
  uiLang,
  s,
  playAudio,
  layout = "vertical",
  columns = 2
}: VsDictViewProps) {
  if (results.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-20 opacity-40">
        <BookOpen className="w-16 h-16 mb-6 text-[var(--accent)]" />
        <p className="font-mono text-sm uppercase tracking-widest">{s.waitingMode1 || "WAITING FOR DICTIONARY QUERY"}</p>
        <p className="text-[10px] font-mono opacity-20 mt-4">API ENDPOINT: /api/search?mode=DICT</p>
      </div>
    );
  }

  const getGridCols = () => {
    if (layout === 'vertical') return 'max-w-5xl space-y-8';
    switch (columns) {
      case 2: return 'grid grid-cols-1 lg:grid-cols-2 gap-6';
      case 3: return 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6';
      case 4: return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4';
      case 5: return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3';
      case 6: return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2';
      default: return 'grid grid-cols-1 lg:grid-cols-2 gap-6';
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar p-8 pb-64">
      <div className={`mx-auto ${getGridCols()}`}>
        {results.map((item, idx) => (
          <div key={item.id || idx} className={`bg-[var(--bg-panel)] border border-[var(--border-dark)] rounded-3xl overflow-hidden shadow-2xl hover:border-[var(--accent)] transition-all group ${layout === 'horizontal' ? 'flex flex-col' : ''}`}>
            {/* Header: Headword & Meaning */}
            <div className="p-8 border-b border-[var(--border-dark)] bg-gradient-to-br from-[var(--bg-highlight)] to-transparent">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-[var(--accent)] text-black font-mono text-[10px] font-black uppercase tracking-tighter">
                      {item.dialect_name}
                    </span>
                    <span className="text-[10px] text-[var(--text-sub)] font-mono opacity-40 uppercase tracking-widest">
                      {item.source} #{item.id}
                    </span>
                  </div>
                  <h2 className="text-4xl font-black text-[var(--text-main)] tracking-tight leading-tight">
                    {item.ab}
                  </h2>
                  <p className="text-xl text-[var(--accent)] font-medium opacity-80">
                    {item.zh}
                  </p>
                </div>
                
                {item.audio_url && (
                  <button 
                    onClick={() => playAudio(item.audio_url)}
                    className="p-4 rounded-2xl bg-[var(--bg-deep)] border border-[var(--border-dark)] text-[var(--accent)] hover:scale-110 active:scale-95 transition-all shadow-lg group-hover:shadow-[var(--accent-rgb)/0.2]"
                  >
                    <Volume2 className="w-8 h-8" />
                  </button>
                )}
              </div>
            </div>

            {/* Examples Section */}
            {item.examples && item.examples.length > 0 && (
              <div className="p-8 space-y-6 bg-[var(--bg-sub)]">
                <div className="flex items-center gap-2 opacity-40">
                  <Quote className="w-4 h-4 text-[var(--accent)]" />
                  <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em]">
                    {s.examples || "Usage Examples"}
                  </span>
                </div>
                
                <div className="grid gap-4">
                  {item.examples.map((ex: any, eidx: number) => (
                    <div 
                      key={eidx} 
                      className="p-5 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-dark)] hover:border-[var(--accent)]/30 transition-colors group/ex relative overflow-hidden"
                    >
                      <div className="flex justify-between items-center gap-6 relative z-10">
                        <div className="space-y-1.5 flex-1">
                          <p className="text-lg font-bold text-[var(--text-main)] italic">
                            “{ex.ab}”
                          </p>
                          <p className="text-sm text-[var(--text-sub)] font-medium">
                            {ex.zh}
                          </p>
                        </div>
                        {ex.audio_url && (
                          <button 
                            onClick={() => playAudio(ex.audio_url)}
                            className="p-2.5 rounded-xl bg-[var(--bg-deep)] text-[var(--text-sub)] hover:text-[var(--accent)] hover:bg-[var(--bg-highlight)] transition-all"
                          >
                            <Volume2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      
                      <div className="absolute top-0 right-0 p-2 opacity-0 group-hover/ex:opacity-100 transition-opacity">
                         <span className="text-[8px] font-mono text-[var(--text-sub)] opacity-30 uppercase">{ex.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer / Meta */}
            {(!item.examples || item.examples.length === 0) && (
              <div className="px-8 py-4 bg-[var(--bg-deep)]/30 flex items-center gap-2 opacity-30">
                <Info className="w-3.5 h-3.5" />
                <span className="text-[9px] font-mono uppercase tracking-widest">No contextual examples found in corpus</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
