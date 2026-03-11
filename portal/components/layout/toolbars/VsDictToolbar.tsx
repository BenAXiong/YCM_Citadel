import React from 'react';
import { Search, Trash2, Book, Layout, LayoutList } from "lucide-react";
import { UIStrings } from "@/types";

interface VsDictToolbarProps {
  s: UIStrings;
  query: string;
  setQuery: (val: string) => void;
  showHistory: boolean;
  setShowHistory: (val: boolean) => void;
  searchHistory: string[];
  handleHistorySelect: (q: string) => void;
  clearHistory: (e: React.MouseEvent) => void;
  removeHistoryItem: (e: React.MouseEvent, q: string) => void;
  dictResults: any[];
  dictSource: "ILRDF" | "MOE";
  setDictSource: (val: "ILRDF" | "MOE") => void;
  dictLayout: "vertical" | "horizontal";
  setDictLayout: (val: "vertical" | "horizontal") => void;
  dictColumns: number;
  setDictColumns: (val: number) => void;
  setToastMessage: (msg: string | null) => void;
}

export default function VsDictToolbar({
  s, query, setQuery, showHistory, setShowHistory, searchHistory,
  handleHistorySelect, clearHistory, removeHistoryItem, dictResults,
  dictSource, setDictSource, dictLayout, setDictLayout, 
  dictColumns, setDictColumns, setToastMessage
}: VsDictToolbarProps) {
  const [isGridOpen, setIsGridOpen] = React.useState(false);
  const gridTimeout = React.useRef<any>(null);

  return (
    <div className="flex items-center w-full justify-between">
      <div className="flex items-center space-x-6 flex-1">
        <div className="flex items-center w-full max-w-sm relative group" onClick={(e) => { e.stopPropagation(); setShowHistory(true); }}>
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-sub)] group-focus-within:text-[var(--accent)] transition" />
          <input
            type="text" 
            placeholder={s.dict || "Search Dictionary..."} 
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowHistory(true); }}
            onFocus={() => setShowHistory(true)}
            className="w-full bg-[var(--bg-panel)] border border-[var(--border-dark)] rounded-lg py-1.5 pl-9 pr-24 text-[12px] font-mono focus:outline-none focus:border-[var(--accent)] transition text-[var(--text-main)] shadow-inner"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[9px] text-[var(--text-sub)] pointer-events-none opacity-50 uppercase tracking-tighter">
            {dictResults.length} W_HITS
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

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setDictSource("ILRDF")}
            className={`px-3 py-1 rounded-full font-mono text-[9px] uppercase tracking-widest border transition-all ${dictSource === "ILRDF" ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/5 shadow-[0_0_10px_rgba(var(--accent-rgb),0.1)]' : 'border-[var(--border-dark)] text-[var(--text-sub)] hover:border-[var(--text-sub)]'}`}
          >
            ILRDF_CORPUS
          </button>
          <button 
            onClick={() => {
              setToastMessage("MOE_DICT currently not available");
              setTimeout(() => setToastMessage(null), 3000);
            }}
            className={`px-3 py-1 rounded-full font-mono text-[9px] uppercase tracking-widest border transition-all ${dictSource === "MOE" ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--border-dark)] text-[var(--text-sub)] hover:border-[var(--text-sub)]'}`}
          >
            MOE_DICT
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => setDictLayout("vertical")}
          className={`p-2 rounded-lg transition ${dictLayout === "vertical" ? 'bg-[var(--accent)] text-black' : 'bg-[var(--bg-panel)] text-[var(--text-sub)] hover:text-[var(--text-main)] border border-[var(--border-dark)]'}`}
          title="Vertical List"
        >
          <LayoutList className="w-4 h-4" />
        </button>
        <div 
          className="relative inline-block"
          onMouseEnter={() => { if(gridTimeout.current) clearTimeout(gridTimeout.current); setIsGridOpen(true); }}
          onMouseLeave={() => { gridTimeout.current = setTimeout(() => setIsGridOpen(false), 300); }}
        >
          <button
            onClick={() => setDictLayout("horizontal")}
            className={`p-2 rounded-lg transition ${dictLayout === "horizontal" ? 'bg-[var(--accent)] text-black' : 'bg-[var(--bg-panel)] text-[var(--text-sub)] hover:text-[var(--text-main)] border border-[var(--border-dark)]'}`}
            title="Horizontal Grid"
          >
            <Layout className="w-4 h-4" />
            {dictLayout === "horizontal" && (
              <span className="absolute -top-1 -right-1 bg-black text-[var(--accent)] text-[8px] font-bold px-1 rounded-sm border border-[var(--accent)]">
                {dictColumns}
              </span>
            )}
          </button>

          {/* HOVER DROPDOWN */}
          {isGridOpen && (
            <div className="absolute top-full right-0 mt-2 pt-2 z-[150] animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-[var(--bg-panel)] border border-[var(--border-dark)] rounded-lg shadow-2xl overflow-hidden min-w-[80px]">
                <div className="p-2 border-b border-[var(--border-dark)] text-[8px] font-mono text-[var(--text-sub)] uppercase tracking-tighter text-center">Columns</div>
                {[2, 3, 4, 5, 6].map(num => (
                  <button
                    key={num}
                    onClick={(e) => { e.stopPropagation(); setDictColumns(num); setDictLayout("horizontal"); }}
                    className={`w-full px-4 py-2 text-xs font-mono transition text-center hover:bg-[var(--accent)] hover:text-black ${dictColumns === num ? 'text-[var(--accent)]' : 'text-[var(--text-sub)]'}`}
                  >
                    {num}X
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
