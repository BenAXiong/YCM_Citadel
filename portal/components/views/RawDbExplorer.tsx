"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Filter, Loader2, Copy, Check, Trash2, Search } from "lucide-react";
import { RAWDB_SOURCES } from "@/lib/sources";
import { GLID_NAMES } from "@/lib/dialects";
import { useClickOutside } from "@/hooks/useClickOutside";
import { usePersistedState } from "@/hooks/usePersistedState";

interface RawDbExplorerProps {
  handleCopy: (text: string, id: string) => void;
  copiedId: string | null;
  isActive: boolean;
}

export default function RawDbExplorer({ handleCopy, copiedId, isActive }: RawDbExplorerProps) {
  const [rawDbData, setRawDbData] = useState<any[]>([]);
  const [rawDbKeyword, setRawDbKeyword] = useState("");
  const [rawDbSource, setRawDbSource] = useState("ALL");
  const [isRawDbLoading, setIsRawDbLoading] = useState(false);
  const [rawDbHistory, setRawDbHistory] = usePersistedState<string[]>("yc_rawdb_history", []);
  const [showRawDbHistory, setShowRawDbHistory] = useState(false);
  const rawDbSearchRef = useRef<HTMLDivElement>(null);

  const handleFetchRawDb = async (overrideSource?: string, overrideKeyword?: string) => {
    setIsRawDbLoading(true);
    const src = overrideSource ?? rawDbSource;
    const kw = overrideKeyword ?? rawDbKeyword;
    try {
      const res = await fetch(`/api/raw_db?keyword=${encodeURIComponent(kw)}&source=${src}`);
      const data = await res.json();
      setRawDbData(data.rows || []);
      if (kw.trim().length > 0) {
        setRawDbHistory(prev => {
          const next = [kw, ...prev.filter(h => h !== kw)].slice(0, 10);
          return next;
        });
      }
    } catch (e) {
      console.error(e);
    }
    setIsRawDbLoading(false);
  };

  useEffect(() => {
    if (!isActive) return;
    const timer = setTimeout(() => {
      handleFetchRawDb();
    }, 500);
    return () => clearTimeout(timer);
  }, [rawDbKeyword, rawDbSource, isActive]);

  useClickOutside(rawDbSearchRef, () => setShowRawDbHistory(false), showRawDbHistory);

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-mono text-[var(--accent)]">RAW_DB_VIEWER</h2>
        {rawDbData.length > 0 && (
          <span className="font-mono text-[10px] px-3 py-1 rounded-full bg-[var(--bg-highlight)] border border-[var(--border-dark)] text-[var(--accent)]">
            {rawDbData.length === 500 ? '500+ HITS (capped)' : `${rawDbData.length} HITS`}
          </span>
        )}
      </div>

      <div className="flex space-x-3 items-center bg-[var(--bg-highlight)] p-3 rounded-xl border border-[var(--border-dark)]">
        <div ref={rawDbSearchRef} className="relative flex-1">
          <input
            type="text"
            placeholder="Search keyword (zh or ab)..."
            value={rawDbKeyword}
            onChange={e => setRawDbKeyword(e.target.value)}
            onFocus={() => setShowRawDbHistory(true)}
            onKeyDown={e => {
              if (e.key === 'Enter') { setShowRawDbHistory(false); handleFetchRawDb(); }
              if (e.key === 'Escape') setShowRawDbHistory(false);
            }}
            className="w-full bg-[var(--bg-panel)] border border-[var(--border-light)] p-2 rounded text-sm font-mono text-[var(--text-main)] focus:border-[var(--accent)] outline-none transition"
          />
          {showRawDbHistory && rawDbHistory.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--bg-panel)] border border-[var(--border-dark)] rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-dark)]">
                <span className="text-[9px] font-mono text-[var(--text-sub)] uppercase tracking-widest">Recent Searches</span>
                <button onClick={() => setRawDbHistory([])} className="text-[9px] font-mono text-red-400 hover:text-red-300 transition">CLEAR</button>
              </div>
              {rawDbHistory.map((h, i) => (
                <div key={i}
                  onClick={() => { setRawDbKeyword(h); setShowRawDbHistory(false); handleFetchRawDb(undefined, h); }}
                  className="w-full text-left px-3 py-2 text-xs font-mono text-[var(--text-main)] hover:bg-[var(--bg-sub)] transition flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate flex-1">{h}</span>
                  <span
                    onClick={e => { e.stopPropagation(); setRawDbHistory(prev => prev.filter((_, j) => j !== i)); }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 transition cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <select
          value={rawDbSource}
          onChange={e => setRawDbSource(e.target.value)}
          className="bg-[var(--bg-panel)] border border-[var(--border-light)] p-2 rounded text-sm font-mono focus:border-[var(--accent)] outline-none transition-all"
        >
          {RAWDB_SOURCES.map(s => (
            <option key={s.value} value={s.value}>{s.value === 'ALL' ? 'ALL SOURCES' : s.value}</option>
          ))}
        </select>
        <button onClick={() => handleFetchRawDb()} disabled={isRawDbLoading} className="px-5 py-2 bg-[var(--accent)] text-black font-bold font-mono rounded text-sm hover:opacity-80 transition flex-shrink-0">
          {isRawDbLoading ? "..." : "EXECUTE"}
        </button>
      </div>

      <div className="flex-1 overflow-auto border border-[var(--border-dark)] rounded font-mono text-xs bg-[#0F0F12] relative min-h-[400px]">
        {rawDbData.length > 0 ? (
          <table className="min-w-full text-left">
            <thead className="bg-[#1A1A24] sticky top-0 border-b border-[var(--border-dark)] shadow-md z-30">
              <tr>
                {Object.keys(rawDbData[0] || {}).map(k => (
                  <th key={k} className="p-3 text-[var(--accent)] font-mono text-[10px] uppercase tracking-tighter truncate max-w-[150px] border-r border-white/5 last:border-0">{k}</th>
                ))}
                <th className="p-3 w-12 text-[var(--text-sub)]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-dark)] text-[11px]">
              {rawDbData.map((row, i) => (
                <tr key={i} className="hover:bg-[var(--bg-highlight)] border-b border-white/5 transition-colors group/rawrow">
                  {Object.entries(row).map(([key, val]: [string, any], j) => {
                    let displayVal = val?.toString() || 'NULL';
                    if (key === 'glid' && val) {
                      displayVal = `[${val}] ${GLID_NAMES[val as keyof typeof GLID_NAMES] || ''}`;
                    }
                    return (
                      <td key={j} className="p-3 text-[var(--text-main)] max-w-[200px] truncate border-r border-white/5 last:border-0 font-mono text-[10px]" title={displayVal}>
                        {displayVal}
                      </td>
                    );
                  })}
                  <td className="p-3 text-right">
                    <button 
                      onClick={() => handleCopy(JSON.stringify(row, null, 2), `raw-${i}`)}
                      className="p-1.5 rounded bg-[var(--bg-panel)] border border-[var(--border-dark)] hover:border-[var(--accent)] text-[var(--text-sub)] hover:text-[var(--accent)] transition opacity-0 group-hover/rawrow:opacity-100"
                    >
                      {copiedId === `raw-${i}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : isRawDbLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 opacity-70 p-12 text-center">
            <Filter className="w-8 h-8 text-[var(--text-sub)]" />
            <div className="font-mono text-xs text-[var(--text-sub)] uppercase tracking-widest">
              {rawDbKeyword ? `0 HITS for "${rawDbKeyword}" in [${rawDbSource}]` : 'AWAITING QUERY'}
            </div>
            {rawDbKeyword && (
              <button onClick={() => setRawDbKeyword('')} className="px-4 py-1.5 border border-[var(--border-dark)] rounded font-mono text-[10px] hover:border-[var(--accent)] hover:text-[var(--accent)] transition">
                CLEAR KEYWORD
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
