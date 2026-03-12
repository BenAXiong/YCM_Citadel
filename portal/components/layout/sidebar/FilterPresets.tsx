import React from 'react';
import { Bookmark, Check, Trash2 } from "lucide-react";
import { SavedFilter, UIStrings } from "@/types";

interface FilterPresetsProps {
  s: UIStrings;
  sortedAllDialects: string[];
  standardDialects: string[];
  selectedDialects: Set<string>;
  setSelectedDialects: (val: Set<string>) => void;
  savedFilters: SavedFilter[];
  setSavedFilters: (val: SavedFilter[]) => void;
}

export function FilterPresets({
  s,
  sortedAllDialects,
  standardDialects,
  selectedDialects,
  setSelectedDialects,
  savedFilters,
  setSavedFilters
}: FilterPresetsProps) {
  const [showOptions, setShowOptions] = React.useState(false);

  return (
    <>
      <button onClick={() => setSelectedDialects(new Set(sortedAllDialects))} className="flex-1 text-[10px] py-1.5 border border-[var(--border-light)] rounded hover:bg-[var(--accent)] hover:text-black transition text-[var(--text-main)] uppercase font-bold">{s.all}</button>
      <button onClick={() => setSelectedDialects(new Set())} className="flex-1 text-[10px] py-1.5 border border-[var(--border-light)] rounded hover:bg-[var(--bg-highlight)] transition text-[var(--text-main)] uppercase font-bold">{s.none}</button>

      <div className="relative">
        <button
          onClick={() => setShowOptions(!showOptions)}
          className={`p-1.5 px-2.5 border rounded transition ${showOptions ? 'bg-[var(--accent)] text-black border-[var(--accent)]' : 'border-[var(--border-light)] text-[var(--text-sub)] hover:text-[var(--accent)]'}`}
          title="Manage Presets"
        >
          <Bookmark className="w-4 h-4" />
        </button>
        {showOptions && (
          <div
            className="absolute top-full left-0 mt-2 p-3 bg-[var(--bg-panel)] border border-[var(--border-dark)] border-t-2 border-t-[var(--accent)] rounded font-sans shadow-[0_30px_90px_rgba(0,0,0,1)] z-[9999] w-64 space-y-3 opacity-100 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="text-[10px] text-[var(--text-sub)] uppercase font-mono tracking-widest border-b border-[var(--border-dark)] pb-1 mb-2 flex justify-between items-center text-left">
              <span className="font-black text-[var(--accent)]">{s.presets}</span>
              <button onClick={() => setShowOptions(false)} className="hover:text-red-400 transition text-lg leading-none">×</button>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              <button
                onClick={() => { setSelectedDialects(new Set(standardDialects)); setShowOptions(false); }}
                className="w-full text-left p-2 hover:bg-[var(--bg-highlight)] rounded font-mono text-[10px] transition flex items-center justify-between group border border-transparent hover:border-[var(--border-light)]"
              >
                <span className="text-[var(--accent)] font-bold">STANDARD_16</span>
                <Check className="w-3 h-3 opacity-0 group-hover:opacity-100" />
              </button>
              {savedFilters.map((f: SavedFilter, i: number) => (
                <div key={i} className="flex items-center group/p bg-[var(--bg-sub)] rounded border border-transparent hover:border-[var(--border-dark)]">
                  <button
                    onClick={() => { setSelectedDialects(new Set(f.dialects)); setShowOptions(false); }}
                    className="flex-1 text-left p-2 hover:bg-[var(--bg-highlight)] rounded font-mono text-[10px] transition truncate"
                  >
                    {f.name}
                  </button>
                  <button
                    onClick={() => {
                      const next = savedFilters.filter((_, idx: number) => idx !== i);
                      setSavedFilters(next);
                    }}
                    className="p-2 text-red-400 hover:text-red-600 opacity-0 group-hover/p:opacity-100 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                const name = prompt("Enter preset name:");
                if (name) {
                  const next = [...savedFilters, { name, dialects: Array.from(selectedDialects) }];
                  setSavedFilters(next);
                }
              }}
              className="w-full text-center py-2 bg-[var(--btn-grad,var(--accent))] text-black rounded font-mono text-[10px] font-bold hover:brightness-110 active:scale-[0.98] transition-all"
            >
              + SAVE_CURRENT
            </button>
          </div>
        )}
      </div>
    </>
  );
}
