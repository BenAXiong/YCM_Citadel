import React from 'react';
import { Search, Trash2, Book, Layout, LayoutList, CheckSquare, Layers, Tags, ChevronDown, Shrink, Maximize, Eye } from "lucide-react";
import { UIStrings } from "@/types";
import { DICT_SOURCES } from "@/lib/sources";

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
  dictColumns: number | "AUTO";
  setDictColumns: (val: number | "AUTO") => void;
  dictLevel: number | "ALL";
  setDictLevel: (val: number | "ALL") => void;
  dictGenres: string[];
  setDictGenres: (val: string[] | ((prev: string[]) => string[])) => void;
  dictStrict: boolean;
  setDictStrict: (val: boolean) => void;
  setToastMessage: (msg: string | null) => void;
  showFullOnly: boolean;
  setShowFullOnly: (val: boolean) => void;
  modules: string[];
  setModules: (val: string[]) => void;
  showSources: boolean;
  setShowSources: (val: boolean) => void;
  dictDensity: "standard" | "compact" | "preview";
  setDictDensity: (v: "standard" | "compact" | "preview") => void;
  [key: string]: any;
}

export default function VsDictToolbar({
  s, query, setQuery, showHistory, setShowHistory, searchHistory,
  handleHistorySelect, clearHistory, removeHistoryItem, dictResults,
  dictSource, setDictSource, dictLayout, setDictLayout, 
  dictColumns, setDictColumns, 
  dictLevel, setDictLevel,
  dictGenres, setDictGenres,
  dictStrict, setDictStrict,
  setToastMessage,
  showFullOnly, setShowFullOnly,
  modules, setModules,
  showSources, setShowSources,
  dictDensity, setDictDensity
}: VsDictToolbarProps) {
  const [isGridOpen, setIsGridOpen] = React.useState(false);
  const [isGenreOpen, setIsGenreOpen] = React.useState(false);
  const [isDensityOpen, setIsDensityOpen] = React.useState(false);
  const gridTimeout = React.useRef<any>(null);

  // Close dropdowns on outside click
  React.useEffect(() => {
    const handler = () => {
      setIsGenreOpen(false);
      setShowSources(false);
      setIsDensityOpen(false);
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [setShowSources]);

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
          <div className="flex items-center bg-[var(--bg-deep)] border border-[var(--border-dark)] rounded-full p-0.5">
            <button 
              onClick={() => setDictStrict(true)}
              className={`px-3 py-1 rounded-full font-mono text-[9px] uppercase tracking-widest transition-all ${dictStrict ? 'bg-[var(--accent)] text-black font-black shadow-lg' : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'}`}
              title="Only show formal ILRDF headwords"
            >
              Strict
            </button>
            <button 
              onClick={() => setDictStrict(false)}
              className={`px-3 py-1 rounded-full font-mono text-[9px] uppercase tracking-widest transition-all ${!dictStrict ? 'bg-[var(--accent)] text-black font-black shadow-lg' : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'}`}
              title="Show headwords distilled from all corpora"
            >
              Global
            </button>
          </div>
          
          <div className="w-[1px] h-4 bg-[var(--border-dark)] mx-1" />

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
          
          <div className="w-[1px] h-4 bg-[var(--border-dark)] mx-1" />

          <button
            onClick={() => setShowFullOnly(!showFullOnly)}
            className={`p-1.5 rounded-lg transition border ${showFullOnly ? 'bg-[var(--accent)] text-black border-black' : 'bg-[var(--bg-panel)] text-[var(--text-sub)] border-[var(--border-dark)] hover:border-[var(--accent)]'}`}
            title={s.showFull || "Show Complete Only"}
          >
            <CheckSquare className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Genre Selector */}
        <div className="flex items-center relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => { setIsGenreOpen(!isGenreOpen); setShowSources(false); }}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border font-mono text-[9px] uppercase tracking-widest transition-all duration-300 w-28 justify-center ${isGenreOpen ? 'bg-[var(--accent)] text-black border-black border-2' : 'bg-[var(--bg-panel)] text-[var(--text-sub)] border-[var(--border-dark)] hover:border-[var(--accent)]'}`}
          >
            <Tags className="w-3.5 h-3.5 shrink-0" />
            <span className="font-bold truncate">{dictGenres.includes("ALL") ? "ALL_GENRES" : `${dictGenres.length}_ACTIVE`}</span>
          </button>

          {isGenreOpen && (
            <div className="absolute top-full right-0 mt-2 p-2 bg-[var(--bg-panel)] border border-[var(--border-dark)] rounded-lg shadow-2xl z-[200] flex flex-col gap-1 min-w-[140px] animate-in slide-in-from-top-2">
              <div className="p-2 border-b border-[var(--border-dark)] text-[8px] font-mono text-[var(--text-sub)] uppercase tracking-tighter text-center">Context Filters</div>
              {['News', 'Curriculum', 'Conversation', 'Culture', 'Literature'].map(genre => {
                const isActive = dictGenres.includes(genre) || (dictGenres.includes('ALL') && genre !== 'ALL');
                return (
                  <button
                    key={genre}
                    onClick={() => {
                      setDictGenres(prev => {
                        if (prev.includes('ALL')) return [genre];
                        if (prev.includes(genre)) {
                          const next = prev.filter(g => g !== genre);
                          return next.length === 0 ? ['ALL'] : next;
                        }
                        return [...prev, genre];
                      });
                    }}
                    className={`px-3 py-1.5 rounded-md font-mono text-[9px] font-bold tracking-tighter text-left transition-all ${dictGenres.includes(genre) ? 'bg-[var(--accent)] text-black' : 'text-[var(--text-sub)] hover:bg-[var(--bg-highlight)] hover:text-[var(--text-main)]'}`}
                  >
                    {genre.toUpperCase()}
                  </button>
                );
              })}
              <button 
                onClick={() => setDictGenres(['ALL'])}
                className={`px-3 py-1.5 rounded-md font-mono text-[9px] font-bold tracking-tighter text-left transition-all ${dictGenres.includes('ALL') ? 'bg-[var(--bg-highlight)] text-[var(--accent)] border border-[var(--accent)]/30' : 'text-[var(--text-sub)] hover:bg-[var(--bg-highlight)]'}`}
              >
                ANY / ALL
              </button>
            </div>
          )}
        </div>

        {/* Level Selector */}
        <select 
          value={dictLevel}
          onChange={(e) => setDictLevel(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
          className="bg-[var(--bg-panel)] border border-[var(--border-dark)] rounded-lg text-[10px] font-mono p-1.5 focus:outline-none focus:border-[var(--accent)] text-[var(--accent)] uppercase tracking-tighter"
        >
          <option value="ALL">ALL LEVELS</option>
          {Array.from({length: 12}, (_, i) => i + 1).map(lv => (
            <option key={lv} value={lv}>LEVEL {lv}</option>
          ))}
        </select>

        <div className="w-[1px] h-4 bg-[var(--border-dark)] mx-2" />

        {/* Source Selector (Example Sentences) */}
        <div className="flex items-center relative group-sources" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => { setShowSources(!showSources); setIsGenreOpen(false); }}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border font-mono text-[9px] uppercase tracking-widest transition-all duration-300 w-28 justify-center ${showSources ? 'bg-[var(--accent)] text-black border-black border-2' : 'bg-[var(--bg-panel)] text-[var(--text-sub)] border-[var(--border-dark)] hover:border-[var(--accent)]'}`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span className="font-bold truncate">{modules.includes("ALL") ? "ALL_SENT" : `${modules.length}_SENT`}</span>
          </button>

          {showSources && (
            <div className="absolute top-full right-0 mt-2 p-2 bg-[var(--bg-panel)] border border-[var(--border-dark)] rounded-lg shadow-2xl z-[200] flex flex-col gap-1 min-w-[120px] animate-in slide-in-from-top-2">
              {DICT_SOURCES.map((m: any) => {
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
                    className={`px-3 py-1.5 rounded-md font-mono text-[9px] font-bold tracking-tighter text-left transition-all ${isActive ? 'bg-[var(--accent)] text-black' : 'text-[var(--text-sub)] hover:bg-[var(--bg-highlight)] hover:text-[var(--text-main)]'}`}
                  >
                    {m.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="w-[1px] h-4 bg-[var(--border-dark)] mx-2" />

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
                {dictColumns === "AUTO" ? "FLEX" : `${dictColumns}X`}
              </span>
            )}
          </button>

          {/* HOVER DROPDOWN */}
          {isGridOpen && (
            <div className="absolute top-full right-0 mt-2 pt-2 z-[150] animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-[var(--bg-panel)] border border-[var(--border-dark)] rounded-lg shadow-2xl overflow-hidden min-w-[80px]">
                <div className="p-2 border-b border-[var(--border-dark)] text-[8px] font-mono text-[var(--text-sub)] uppercase tracking-tighter text-center">Columns</div>
                <button
                  onClick={(e) => { e.stopPropagation(); setDictColumns("AUTO"); setDictLayout("horizontal"); }}
                  className={`w-full px-4 py-2 text-xs font-mono transition text-center hover:bg-[var(--accent)] hover:text-black ${dictColumns === "AUTO" ? 'text-[var(--accent)]' : 'text-[var(--text-sub)]'}`}
                >
                  FLEXIBLE
                </button>
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

        <div className="w-[1px] h-4 bg-[var(--border-dark)] mx-1" />

        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => { setIsDensityOpen(!isDensityOpen); setIsGenreOpen(false); setShowSources(false); }}
            className={`p-2 rounded-lg transition border flex items-center justify-center ${dictDensity !== 'standard' ? 'bg-[var(--accent)] text-black border-black' : 'bg-[var(--bg-panel)] text-[var(--text-sub)] hover:text-[var(--text-main)] border-[var(--border-dark)]'}`}
            title="Card Density"
          >
            {dictDensity === 'standard' && <Maximize className="w-4 h-4" />}
            {dictDensity === 'compact' && <Shrink className="w-4 h-4" />}
            {dictDensity === 'preview' && <Eye className="w-4 h-4" />}
          </button>

          {isDensityOpen && (
            <div className="absolute top-full right-0 mt-2 p-1.5 bg-[var(--bg-panel)] border border-[var(--border-dark)] rounded-lg shadow-2xl z-[200] flex flex-col gap-1 min-w-[110px] animate-in slide-in-from-top-2">
              <button onClick={() => { setDictDensity("standard"); setIsDensityOpen(false); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-[9px] font-bold tracking-widest ${dictDensity === 'standard' ? 'bg-[var(--accent)] text-black' : 'text-[var(--text-sub)] hover:bg-[var(--bg-highlight)]'}`}>
                <Maximize className="w-3.5 h-3.5" /> STANDARD
              </button>
              <button onClick={() => { setDictDensity("compact"); setIsDensityOpen(false); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-[9px] font-bold tracking-widest ${dictDensity === 'compact' ? 'bg-[var(--accent)] text-black' : 'text-[var(--text-sub)] hover:bg-[var(--bg-highlight)]'}`}>
                <Shrink className="w-3.5 h-3.5" /> COMPACT
              </button>
              <button onClick={() => { setDictDensity("preview"); setIsDensityOpen(false); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-[9px] font-bold tracking-widest ${dictDensity === 'preview' ? 'bg-[var(--accent)] text-black' : 'text-[var(--text-sub)] hover:bg-[var(--bg-highlight)]'}`}>
                <Eye className="w-3.5 h-3.5" /> PREVIEW
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
