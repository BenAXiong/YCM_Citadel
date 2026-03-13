'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Book, 
  Globe, 
  Grid, 
  Settings as SettingsIcon, 
  HelpCircle as HelpIcon, 
  Bookmark, 
  Share2,
  X,
  Maximize2,
  Minimize2,
  ChevronRight,
  FlaskConical,
  ArrowRight,
  MoreHorizontal,
  Info
} from 'lucide-react';

interface MoeEntry {
  id: number;
  dict_code: string;
  word_ab: string;
  definition: string;
  examples_json: string;
  dialect_name: string;
  glid: string;
  stem?: string;
}

export default function MoeMirrorView() {
  // Main Page State
  const [searchTerm, setSearchTerm] = useState("to'as");
  const [results, setResults] = useState<any[]>([]);
  const [selectedWord, setSelectedWord] = useState("to'as");
  const [entries, setEntries] = useState<MoeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Peek State
  const [peekWord, setPeekWord] = useState<string | null>(null);
  const [isPeekOpen, setIsPeekOpen] = useState(false);
  const [peekEntries, setPeekEntries] = useState<MoeEntry[]>([]);
  const [isPeekLoading, setIsPeekLoading] = useState(false);

  // Summary Cache
  const [summaryCache, setSummaryCache] = useState<Record<string, string[]>>({});

  // Fetch results list for the sidebar
  const fetchSidebarResults = async (term: string) => {
    try {
      const res = await fetch(`/api/moe_shadow?keyword=${encodeURIComponent(term)}`);
      const data = await res.json();
      const uniqueWords = Array.from(new Set((data.rows || []).map((r: any) => r.word_ab)));
      setResults(uniqueWords.map(w => {
        const matching = data.rows.find((r: any) => r.word_ab === w);
        return {
          word: w,
          summary: matching ? matching.definition : ""
        };
      }));
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch all dictionary entries for the selected word
  const fetchSelectedEntries = async (word: string, isPeek = false) => {
    if (isPeek) setIsPeekLoading(true);
    else setIsLoading(true);
    
    try {
      const res = await fetch(`/api/moe_shadow?keyword=${encodeURIComponent(word)}&aggregate=true`);
      const data = await res.json();
      const filtered = data.rows || [];
      
      if (isPeek) setPeekEntries(filtered);
      else setEntries(filtered);
    } catch (e) {
      console.error(e);
    }
    
    if (isPeek) setIsPeekLoading(false);
    else setIsLoading(false);
  };

  const fetchSummary = async (word: string) => {
    const key = word.toLowerCase();
    if (summaryCache[key]) return;
    try {
      const res = await fetch(`/api/moe_shadow?keyword=${encodeURIComponent(word)}&aggregate=true`);
      const data = await res.json();
      const wordEntries = data.rows || [];
      if (wordEntries.length > 0) {
        setSummaryCache(prev => ({ 
          ...prev, 
          [key]: wordEntries.map((r: any) => r.definition)
        }));
      } else {
        setSummaryCache(prev => ({ ...prev, [key]: ["No definition found."] }));
      }
    } catch (e) {
      setSummaryCache(prev => ({ ...prev, [key]: ["Error loading definition."] }));
    }
  };

  useEffect(() => {
    fetchSidebarResults(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (selectedWord) {
      fetchSelectedEntries(selectedWord);
    }
  }, [selectedWord]);

  useEffect(() => {
    if (peekWord) {
      fetchSelectedEntries(peekWord, true);
    }
  }, [peekWord]);

  const renderSectionHeader = (code: string, isPeekMode = false) => {
    let title = "Dictionary Source";
    let bgColor = "bg-gray-600";
    
    switch (code) {
      case 's':
        title = "蔡中涵大辭典";
        bgColor = "bg-[#3366cc]";
        break;
      case 'm':
        title = "吳明義阿美族語辭典";
        bgColor = "bg-[#c07b0c]";
        break;
      case 'old-s':
        title = "學習詞表－海岸阿美語";
        bgColor = "bg-[#e53e3e]";
        break;
      case 'a':
        title = "原住民族語言線上辭典";
        bgColor = "bg-[#8e44ad]";
        break;
      case 'p':
        title = "方敏英英字典 (Poinsot)";
        bgColor = "bg-green-600";
        break;
      default:
        title = "其他辭典";
        bgColor = "bg-slate-700";
    }

    return (
      <div className={`${bgColor} text-white px-4 py-2 ${isPeekMode ? 'text-[10px]' : 'text-sm'} font-bold flex justify-between items-center rounded-t-sm shadow-sm`}>
        <span>{title}</span>
        <div className="flex gap-4 opacity-80">
            <Share2 className={isPeekMode ? "w-3 h-3" : "w-3.5 h-3.5"} />
        </div>
      </div>
    );
  };

  const parseExamples = (jsonStr: string) => {
    try {
      if (!jsonStr || jsonStr === "[]") return null;
      const examples = JSON.parse(jsonStr);
      return (
        <div className="mt-3 space-y-2 border-l-2 border-slate-100 pl-4 bg-slate-50/50 p-3 rounded-r-lg">
          {examples.map((ex: any, i: number) => (
            <div key={i} className="text-sm">
              <div className="text-blue-700 font-medium">{renderTextWithLinks(ex.ab)}</div>
              <div className="text-slate-500 mt-0.5">{ex.zh}</div>
            </div>
          ))}
        </div>
      );
    } catch (e) { return null; }
  };

  const renderDefinition = (text: string, isSmall = false) => {
    const hasSyn = text.includes(" 同 ");
    const [mainText, synList] = hasSyn ? text.split(" 同 ") : [text, ""];
    return (
      <div className="flex flex-col flex-1">
        <div className={`${isSmall ? 'text-sm' : 'text-xl'} text-gray-800 font-medium leading-relaxed`}>
          {renderTextWithLinks(mainText)}
        </div>
        {synList && (
          <div className="mt-3 bg-slate-50 border-l-4 border-slate-200 p-3 rounded-r-lg shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-black text-white bg-slate-400 px-1.5 py-0.5 rounded uppercase tracking-wider">同</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synonyms</span>
            </div>
            <div className="text-slate-600 italic text-sm pl-0.5">
              {renderTextWithLinks(synList)}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTextWithLinks = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(`[^~]+~)/g);
    
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('~')) {
        const fullContent = part.slice(1, -1);
        let linkTarget = fullContent;
        let displayText = fullContent;
        
        if (fullContent.includes('`')) {
            const innerParts = fullContent.split('`');
            displayText = innerParts.join('');
            linkTarget = innerParts[1];
        }

        return (
          <MoeLink 
            key={i}
            linkTarget={linkTarget}
            displayText={displayText}
            summaryCache={summaryCache}
            fetchSummary={fetchSummary}
            onPeek={(word: string) => {
              setPeekWord(word);
              setIsPeekOpen(true);
            }}
          />
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Sub-component to isolate tooltip state
  const MoeLink = ({ linkTarget, displayText, summaryCache, fetchSummary, onPeek }: any) => {
    const [isHovered, setIsHovered] = useState(false);
    const timeoutRef = useRef<any>(null);
    const cacheKey = linkTarget.toLowerCase();

    const handleEnter = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsHovered(true);
      fetchSummary(linkTarget);
    };

    const handleLeave = () => {
      timeoutRef.current = setTimeout(() => {
        setIsHovered(false);
      }, 400);
    };

    return (
      <span 
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onClick={(e) => {
          e.stopPropagation();
          onPeek(linkTarget);
        }}
        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors decoration-blue-300 decoration-1 underline-offset-2 relative group/link"
      >
        {displayText}
        {/* RICH TOOLTIP - High Fidelity Replication - Growing Upwards with Grace Period */}
        <div 
          onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current); setIsHovered(true); }}
          onMouseLeave={handleLeave}
          className={`absolute bottom-full left-0 mb-3 w-80 bg-white border border-gray-200 shadow-[0_-20px_60px_rgba(0,0,0,0.15),0_20px_60px_rgba(0,0,0,0.1)] rounded-2xl p-6 transition-all z-[1000] pointer-events-auto text-left duration-200 ${
            isHovered ? 'visible opacity-100 translate-y-0' : 'invisible opacity-0 translate-y-2'
          }`}
        >
          <div className="flex flex-col gap-1 mb-4 border-b border-gray-200 pb-3">
             <span className="text-2xl font-bold text-gray-900 tracking-tight">{linkTarget}</span>
             <div className="h-0.5 w-16 bg-gray-200" />
          </div>
          
          <div className="space-y-4 max-h-[250px] overflow-y-auto custom-scrollbar pr-2 overflow-x-visible">
            {summaryCache[cacheKey] === undefined ? (
               <div className="flex items-center gap-2 italic text-gray-400 text-sm">
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                 讀取中...
               </div>
            ) : (
              summaryCache[cacheKey].map((def: string, idx: number) => (
                <div key={idx} className="flex gap-3">
                  <span className="text-blue-500 font-bold min-w-[1.2rem] text-sm leading-relaxed">{idx + 1}.</span>
                  {renderDefinition(def, true)}
                </div>
              ))
            )}
          </div>
          
          <div className="absolute top-full left-8 -translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r border-b border-gray-200" />
        </div>
      </span>
    );
  };

  const groupEntries = (items: MoeEntry[]) => {
    const order = ['s', 'm', 'old-s', 'a', 'p'];
    const grouped = items.reduce((acc, entry) => {
      if (!acc[entry.dict_code]) acc[entry.dict_code] = [];
      acc[entry.dict_code].push(entry);
      return acc;
    }, {} as Record<string, MoeEntry[]>);

    return Object.entries(grouped).sort((a, b) => {
      const idxA = order.indexOf(a[0]);
      const idxB = order.indexOf(b[0]);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });
  };

  return (
    <div className="flex h-full bg-[#f0f2f5] overflow-hidden rounded-none">
      {/* SIDEBAR */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-inner">
        <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="relative group">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜尋..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-black focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          {results.length > 0 ? (
            results.map((res, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedWord(res.word)}
                className={`px-4 py-3 cursor-pointer border-b border-gray-50 flex justify-between transition-colors ${selectedWord === res.word ? 'bg-blue-50/50 border-r-4 border-r-blue-500' : 'hover:bg-gray-50'}`}
              >
                <div className="font-medium text-gray-900 group-hover:text-blue-600">{res.word}</div>
                <div className="text-[11px] text-gray-400 text-right truncate max-w-[120px]" title={res.summary}>
                  {res.summary}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-400 text-sm italic font-mono uppercase tracking-widest opacity-50">
              No results found
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f0f2f5]">
        {/* TOP NAV BAR - MOE STYLE */}
        <div className="h-10 bg-[#2c3e50] flex items-center px-4 gap-4 text-white/80 text-xs font-medium">
            <div className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors bg-white/10 px-3 py-1.5 rounded">
                <Globe className="w-3.5 h-3.5" />
                <span>法語版</span>
            </div>
            <div className="hover:text-white cursor-pointer px-2 transition-colors opacity-40 italic font-mono">Offline Mode Research</div>
            <div className="hover:text-white cursor-pointer px-2 transition-colors">相關資訊</div>
            <div className="ml-auto flex items-center gap-4">
                <Grid className="w-4 h-4" />
                <SettingsIcon className="w-4 h-4" />
                <HelpIcon className="w-4 h-4" />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar pb-96">
          {selectedWord ? (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-visible">
              {/* HEADWORD HEADER */}
              <div className="flex items-center justify-between pb-6 border-b border-gray-200">
                <div className="flex items-baseline gap-4">
                  <h1 className="text-4xl font-bold text-gray-800 tracking-tight">{selectedWord}</h1>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500"><Bookmark className="w-5 h-5" /></button>
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500"><Share2 className="w-5 h-5" /></button>
                </div>
              </div>

              {/* DICTIONARY SECTIONS */}
              {isLoading ? (
                <div className="flex items-center justify-center p-24">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : entries.length > 0 ? (
                groupEntries(entries).map(([code, dictEntries]: [string, MoeEntry[]], idx: number) => (
                    <div key={idx} className="bg-white rounded shadow-md border border-gray-100 hover:shadow-lg transition-all relative z-[1] overflow-visible">
                      {renderSectionHeader(code)}
                      <div className="p-6 space-y-6 overflow-visible">
                        {dictEntries.map((entry: MoeEntry, eIdx: number) => (
                           <div key={eIdx} className="space-y-4">
                             <div className="flex flex-col gap-1">
                                <div className="flex gap-4">
                                  <span className="text-blue-600 font-bold text-lg leading-relaxed">{eIdx + 1}.</span>
                                  {renderDefinition(entry.definition)}
                                </div>
                                {entry.stem && entry.stem !== entry.word_ab && (
                                  <div className="ml-9 text-xs text-gray-400 font-medium">
                                    （詞幹：<span className="text-blue-500 hover:underline cursor-pointer" onClick={() => setSelectedWord(entry.stem || "")}>{entry.stem}</span>）
                                  </div>
                                )}
                                {entry.word_ab !== selectedWord && (
                                  <div className="ml-9 text-[10px] uppercase tracking-wider text-gray-400 font-bold mt-1">
                                    From Entry: <span className="text-gray-600">{entry.word_ab}</span>
                                  </div>
                                )}
                             </div>
                             {parseExamples(entry.examples_json)}
                           </div>
                        ))}
                      </div>
                    </div>
                ))
              ) : (
                    <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-dashed border-gray-200 font-medium">
                      找不到 "{selectedWord}" 的詳細辭典內容。
                    </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-40 text-gray-400 space-y-4">
              <Book className="w-20 h-20" />
              <div className="text-xl font-mono tracking-widest uppercase italic">請從左側選擇單字</div>
            </div>
          )}
        </div>
      </div>

      <div 
        className={`fixed top-0 right-0 h-full bg-white shadow-2xl transition-all duration-500 z-[401] overflow-visible border-l border-gray-200 flex flex-col ${isPeekOpen ? 'w-[500px] translate-x-0' : 'w-0 translate-x-full'}`}
      >
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-blue-500" />
            <h2 className="text-lg font-bold text-gray-800 tracking-tight">{peekWord} <span className="text-[10px] font-mono text-gray-400 font-normal ml-2 tracking-widest">PREVIEW</span></h2>
          </div>
          <div className="flex gap-1">
            <button 
                onClick={() => {
                    setSelectedWord(peekWord!);
                    setIsPeekOpen(false);
                }}
                className="p-1.5 hover:bg-blue-500 hover:text-white rounded-lg transition-colors text-blue-500 flex items-center gap-1 text-[10px] font-bold"
                title="Navigate to full entry"
            >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>GO TO ROOT</span>
            </button>
            <button 
                onClick={() => setIsPeekOpen(false)} 
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
            >
                <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-50/30">
          {isPeekLoading ? (
             <div className="h-64 flex items-center justify-center">
               <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
             </div>
          ) : peekEntries.length > 0 ? (
            groupEntries(peekEntries).map(([code, dictEntries]: [string, MoeEntry[]], idx: number) => (
              <div key={idx} className="bg-white rounded border border-gray-200 shadow-sm overflow-visible">
                {renderSectionHeader(code, true)}
                <div className="p-6 space-y-6">
                    {dictEntries.map((entry: MoeEntry, eIdx: number) => (
                        <div key={eIdx} className="space-y-4">
                            <div className="flex gap-3">
                                <span className="text-blue-500 font-bold text-sm leading-relaxed">{eIdx + 1}.</span>
                                {renderDefinition(entry.definition, true)}
                            </div>
                            {parseExamples(entry.examples_json)}
                        </div>
                    ))}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-400 text-xs italic">
              找不到 "{peekWord}" 的 Preview 內容
            </div>
          )}
        </div>
        
        <div className="p-4 bg-white border-t border-gray-100 text-[9px] text-gray-400 text-center font-mono uppercase tracking-[0.3em]">
          End of Preview
        </div>
      </div>
    </div>
  );
}
