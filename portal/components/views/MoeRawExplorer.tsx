"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, Copy, Check, Search, Database, Layers } from "lucide-react";

interface MoeRawExplorerProps {
  handleCopy: (text: string, id: string) => void;
  copiedId: string | null;
  isActive: boolean;
}

export default function MoeRawExplorer({ handleCopy, copiedId, isActive }: MoeRawExplorerProps) {
  const [data, setData] = useState<any[]>([]);
  const [keyword, setKeyword] = useState("");
  const [dictCode, setDictCode] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMoeData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/moe_shadow?keyword=${encodeURIComponent(keyword)}&dict_code=${dictCode}`);
      if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to fetch');
      }
      const result = await res.json();
      setData(result.rows || []);
    } catch (e: any) {
      console.error(e);
      setError(e.message);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isActive) return;
    const timer = setTimeout(() => {
      fetchMoeData();
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword, dictCode, isActive]);

  const renderExamples = (jsonStr: string) => {
    try {
      const examples = JSON.parse(jsonStr);
      if (!Array.isArray(examples) || examples.length === 0) return <span className="text-gray-600 italic">No examples</span>;
      return (
        <div className="space-y-1">
          {examples.map((ex, idx) => (
            <div key={idx} className="p-1.5 bg-black/40 rounded border border-white/5 text-[10px]">
              <div className="text-white">AB: {ex.ab}</div>
              {ex.zh && <div className="text-amber-200/70">ZH: {ex.zh}</div>}
              {ex.en && <div className="text-blue-200/70">EN: {ex.en}</div>}
            </div>
          ))}
        </div>
      );
    } catch (e) {
      return <span className="text-red-400">Invalid JSON</span>;
    }
  };

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-mono text-[var(--accent)] flex items-center gap-2">
          <Layers className="w-6 h-6" /> MOE_RAW_INSPECTOR
        </h2>
        {data.length > 0 && (
          <span className="font-mono text-[10px] px-3 py-1 rounded-full bg-[var(--bg-highlight)] border border-[var(--border-dark)] text-[var(--accent)]">
            {data.length === 500 ? '500+ ROWS' : `${data.length} ROWS`}
          </span>
        )}
      </div>

      <div className="flex space-x-3 items-center bg-[var(--bg-highlight)] p-3 rounded-xl border border-[var(--border-dark)]">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search raw rows..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="w-full bg-[var(--bg-panel)] border border-[var(--border-light)] p-2 rounded text-sm font-mono text-[var(--text-main)] focus:border-[var(--accent)] outline-none transition"
          />
        </div>

        <select
          value={dictCode}
          onChange={e => setDictCode(e.target.value)}
          className="bg-[var(--bg-panel)] border border-[var(--border-light)] p-2 rounded text-sm font-mono focus:border-[var(--accent)] outline-none transition-all"
        >
          <option value="ALL">ALL SOURCES</option>
          <option value="s">Safolu (s)</option>
          <option value="p">Poinsot (p)</option>
          <option value="m">Manoel Fey (m)</option>
        </select>
        
        <button onClick={fetchMoeData} disabled={isLoading} className="px-5 py-2 bg-[var(--accent)] text-black font-bold font-mono rounded text-sm hover:opacity-80 transition flex-shrink-0">
          {isLoading ? "..." : "EXECUTE"}
        </button>
      </div>

      <div className="flex-1 overflow-auto border border-[var(--border-dark)] rounded font-mono text-xs bg-[#0F0F12] relative min-h-[400px]">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-red-400 font-mono">
            <Database className="w-12 h-12 mb-4 opacity-50" />
            <div className="text-sm uppercase tracking-widest font-bold">Database Error</div>
            <div className="text-[10px] mt-2 opacity-80 max-w-sm">{error}</div>
          </div>
        ) : data.length > 0 ? (
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-[#1A1A24] sticky top-0 border-b border-[var(--border-dark)] z-30 shadow-lg">
              <tr>
                {Object.keys(data[0]).map(key => (
                  <th key={key} className="p-3 text-[var(--accent)] text-[10px] uppercase border-r border-white/5 last:border-0">{key}</th>
                ))}
                <th className="p-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-dark)] text-[11px]">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-[var(--bg-highlight)] transition-colors group/moerow">
                  {Object.entries(row).map(([key, val]: [string, any], j) => (
                    <td key={j} className="p-3 border-r border-white/5 last:border-0 align-top">
                      {key === 'examples_json' ? (
                        <div className="max-w-md w-[400px] overflow-auto">
                          {renderExamples(val)}
                        </div>
                      ) : key === 'dict_code' ? (
                        <span className="px-2 py-0.5 rounded bg-cyan-900/30 text-cyan-400 font-bold border border-cyan-400/20">{val}</span>
                      ) : key === 'word_ab' ? (
                        <span className="text-white font-bold text-lg leading-tight block mb-1">{val}</span>
                      ) : (
                        <div className="max-w-[300px] max-h-[200px] overflow-auto text-[var(--text-main)]">
                          {val?.toString() || <span className="opacity-20">NULL</span>}
                        </div>
                      )}
                    </td>
                  ))}
                  <td className="p-3 text-right sticky right-0 bg-transparent group-hover/moerow:bg-[var(--bg-highlight)] transition-colors shadow-[-10px_0_10px_rgba(0,0,0,0.5)]">
                    <button 
                      onClick={() => handleCopy(JSON.stringify(row, null, 2), `moe-${i}`)}
                      className="p-1.5 rounded bg-[var(--bg-panel)] border border-[var(--border-dark)] hover:border-[var(--accent)] text-[var(--text-sub)] hover:text-[var(--accent)] transition opacity-0 group-hover/moerow:opacity-100"
                    >
                      {copiedId === `moe-${i}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-70 p-12 text-center">
            <Search className="w-8 h-8 text-[var(--text-sub)] mb-2" />
            <div className="font-mono text-xs text-[var(--text-sub)] uppercase tracking-widest">
              AWAITING RAW FETCH
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
