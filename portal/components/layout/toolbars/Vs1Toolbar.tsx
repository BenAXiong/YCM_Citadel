"use client";

import React from 'react';
import { Search, Trash2, Layers } from "lucide-react";
import { VS1_SOURCES } from "@/lib/sources";
import { UIStrings } from "@/types";

interface Vs1ToolbarProps {
  s: UIStrings;
  query: string;
  setQuery: (val: string) => void;
  showHistory: boolean;
  setShowHistory: (val: boolean) => void;
  searchHistory: string[];
  handleHistorySelect: (q: string) => void;
  clearHistory: (e: React.MouseEvent) => void;
  removeHistoryItem: (e: React.MouseEvent, q: string) => void;
  filteredResults: any[];
  modules: string[];
  setModules: (val: string[]) => void;
  showSources: boolean;
  setShowSources: (val: boolean) => void;
}

export default function Vs1Toolbar({
  s, query, setQuery, showHistory, setShowHistory, searchHistory,
  handleHistorySelect, clearHistory, removeHistoryItem, filteredResults,
  modules, setModules, showSources, setShowSources
}: Vs1ToolbarProps) {
  return (
    <>
      <div className="flex items-center w-full max-w-sm relative group" onClick={(e) => { e.stopPropagation(); setShowHistory(true); }}>
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-sub)] group-focus-within:text-[var(--accent)] transition" />
        <input
          type="text" placeholder={s.search} value={query}
          onChange={(e) => { setQuery(e.target.value); setShowHistory(true); }}
          onFocus={() => setShowHistory(true)}
          className="w-full bg-[var(--bg-panel)] border border-[var(--border-dark)] rounded-lg py-1.5 pl-9 pr-20 text-[12px] font-mono focus:outline-none focus:border-[var(--accent)] transition text-[var(--text-main)] shadow-inner"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[9px] text-[var(--text-sub)] pointer-events-none opacity-50 uppercase tracking-tighter">
          {filteredResults.length} R_HITS
        </div>

        {showHistory && searchHistory.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-panel)] border border-[var(--border-dark)] rounded shadow-2xl max-h-64 overflow-y-auto z-[120] divide-y divide-[var(--border-dark)]">
            <div className="sticky top-0 bg-[var(--bg-panel)] p-2 flex justify-between items-center text-[9px] text-[var(--text-sub)] font-mono z-10 border-b border-[var(--border-dark)] uppercase tracking-widest">
              <span>{s.recent}</span>
              <button onClick={clearHistory} className="hover:text-[var(--accent)] transition">{s.clear}</button>
            </div>
            {searchHistory.map((h, i) => (
              <div key={i} className="group flex items-center justify-between px-3 py-2 text-xs font-mono text-[var(--text-main)] hover:bg-[var(--bg-sub)] transition cursor-pointer" onClick={(e) => { e.stopPropagation(); handleHistorySelect(h); }}>
                <span className="truncate flex-1">{h}</span>
                <button onClick={(e) => removeHistoryItem(e, h)} className="p-1 rounded-full text-[var(--text-sub)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-2.5 h-2.5" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 relative">
        <button
          onClick={() => setShowSources(!showSources)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border font-mono text-[10px] uppercase tracking-widest transition-all duration-300 w-32 justify-center ${showSources ? 'bg-[var(--accent)] text-black border-black shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)]' : 'bg-[var(--bg-panel)] text-[var(--text-sub)] border-[var(--border-dark)] hover:border-[var(--accent)]'}`}
        >
          <Layers className="w-3.5 h-3.5 shrink-0" />
          <span className="font-black truncate">{modules.includes("ALL") ? "ALL_SOURCES" : `${modules.length}_ACTIVE`}</span>
        </button>

        {showSources && (
          <div className="flex items-center space-x-1 animate-in slide-in-from-left-2 duration-300">
            <div className="w-[2px] h-4 bg-[var(--border-dark)] mx-1" />
            {VS1_SOURCES.map((m) => {
              const isActive = modules.includes(m.value);
              return (
                <button
                  key={m.value}
                  onClick={() => {
                    let next: string[];
                    if (m.value === "ALL") {
                      next = ["ALL"];
                    } else {
                      const withoutAll = modules.filter(x => x !== "ALL");
                      if (isActive) {
                        next = withoutAll.filter(x => x !== m.value);
                        if (next.length === 0) next = ["ALL"];
                      } else {
                        next = [...withoutAll, m.value];
                      }
                    }
                    setModules(next);
                  }}
                  className={`px-3 py-1 rounded-full font-mono text-[9px] font-black tracking-tighter border transition-all duration-300 ${isActive ? 'bg-[var(--accent)] text-black border-transparent shadow-lg' : 'bg-transparent text-[var(--text-sub)] border-[var(--border-dark)] hover:border-[var(--text-main)]'}`}
                >
                  {m.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </>
  );
}
