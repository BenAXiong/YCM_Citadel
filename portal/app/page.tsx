"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Loader2, Hexagon, Filter, CheckSquare, Square, Layers, ChevronDown, ChevronRight, Palette, Volume2, Copy, Check, Table2, Presentation, ChevronLeft, LayoutGrid, Type, AlignLeft, Languages, MoreVertical } from "lucide-react";
import { GLID_FAMILIES, GLID_NAMES, ALL_DIALECTS, GLID_NAMES_EN, getDialectName } from "@/lib/dialects";
import { Settings, Save, Bookmark, Trash2 } from "lucide-react";

const THEMES = ["matrix", "sober", "ycm", "cidal", "rainbow"] as const;
type Theme = typeof THEMES[number];

const UI_STRINGS = {
  en: {
    hub: "YINCUMIN CITADEL",
    all: "ALL",
    none: "NONE",
    search: "Search semantic souls (AB/ZH)...",
    level: "LEVEL:",
    lesson: "LESSON:",
    stdSpelling: "Std Spelling",
    showFull: "Show Full Only",
    module: "MODULE:",
    allRealms: "ALL_REALMS",
    ilrdf: "ILRDF Base",
    nineYear: "NINE_YEAR",
    grmpts: "GRMPTS",
    essay: "ESSAY",
    twelve: "TWELVE",
    switchMode: "MODE: ",
    semantics: "SEMANTICS",
    waitingMode1: "VS-1: WAITING FOR QUERY INPUT",
    waitingMode2: "VS-2: NO DATA FOR THIS SYLLABUS CELL",
    sentence: "SENTENCE",
    recent: "RECENT SEARCHES",
    clear: "CLEAR",
    copied: "Copied to clipboard!",
    loadMore: "LOAD MORE DATA",
    presets: "D_PRESETS",
    manage: "MANAGE"
  },
  zh: {
    hub: "族語衛城",
    all: "全選",
    none: "清空",
    search: "搜尋語意靈魂 (原/中)...",
    level: "階數:",
    lesson: "課數:",
    stdSpelling: "標準化拼寫",
    showFull: "僅顯示全齊",
    module: "模組:",
    allRealms: "全界 (合併)",
    ilrdf: "語發中心 (詞彙)",
    nineYear: "九階教材",
    grmpts: "語法結構",
    essay: "短文",
    twelve: "千詞表",
    switchMode: "模式: ",
    semantics: "華語",
    waitingMode1: "VS-1: 等待查詢輸入",
    waitingMode2: "VS-2: 此教材節點無資料",
    sentence: "句子",
    recent: "最近搜尋",
    clear: "清除",
    copied: "已複製！",
    loadMore: "載入更多資料",
    presets: "篩選預設",
    manage: "管理預設"
  }
};

export default function GlobalExplorer() {
  const [uiLang, setUiLang] = useState<"en" | "zh">("en");
  const [mode, setMode] = useState<"VS-1" | "VS-2" | "VS-3">("VS-1");
  const [theme, setTheme] = useState<Theme>("matrix");
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [modules, setModules] = useState("ALL");
  const [level, setLevel] = useState(1);
  const [lesson, setLesson] = useState(1);
  const [standardize, setStandardize] = useState(false);
  const [showFullOnly, setShowFullOnly] = useState(false);

  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [toolsTab, setToolsTab] = useState<"heatmap" | "normalization" | "rosetta" | "raw_db">("heatmap");
  const [rawDbData, setRawDbData] = useState<any[]>([]);
  const [rawDbKeyword, setRawDbKeyword] = useState("");
  const [rawDbSource, setRawDbSource] = useState("ALL");
  const [isRawDbLoading, setIsRawDbLoading] = useState(false);

  const [selectedDialects, setSelectedDialects] = useState<Set<string>>(new Set());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(100);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [vs2View, setVs2View] = useState<"table" | "slide">("table");
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideCols, setSlideCols] = useState(2);
  const [cardDesign, setCardDesign] = useState<"default" | "inline" | "floating">("default");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [filterFontSize, setFilterFontSize] = useState(11);
  const [showOptions, setShowOptions] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [savedFilters, setSavedFilters] = useState<{ name: string, dialects: string[] }[]>([]);
  const [essayId, setEssayId] = useState("32020");

  const standardDialects = useMemo(() => {
    return Object.values(GLID_FAMILIES).flatMap(f => f.slice(0, 16));
  }, []);

  const sortedAllDialects = useMemo(() => {
    return Object.entries(GLID_FAMILIES)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .flatMap(([_, d]) => d);
  }, []);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("yc_theme") as Theme;
      if (savedTheme && THEMES.includes(savedTheme)) setTheme(savedTheme);

      const savedLang = localStorage.getItem("yc_ui_lang") as "en" | "zh";
      if (savedLang) setUiLang(savedLang);

      const savedDialects = localStorage.getItem("yc_selected_dialects");
      if (savedDialects) {
        setSelectedDialects(new Set(JSON.parse(savedDialects)));
      } else {
        setSelectedDialects(new Set(["南勢阿美語", "賽考利克泰雅語"]));
      }

      const savedCollapsed = localStorage.getItem("yc_sidebar_collapsed");
      if (savedCollapsed) setIsSidebarCollapsed(JSON.parse(savedCollapsed));

      const savedHistory = localStorage.getItem("yc_search_history");
      if (savedHistory) setSearchHistory(JSON.parse(savedHistory));

      const savedSidebarWidth = localStorage.getItem("yc_sidebar_width");
      if (savedSidebarWidth) setSidebarWidth(Number(savedSidebarWidth));

      const savedFilterFontSize = localStorage.getItem("yc_filter_font_size");
      if (savedFilterFontSize) setFilterFontSize(Number(savedFilterFontSize));

      const savedPresets = localStorage.getItem("yc_saved_filters");
      if (savedPresets) setSavedFilters(JSON.parse(savedPresets));
    } catch (e) { }
  }, []);

  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    for (const [glid, dialects] of Object.entries(GLID_FAMILIES)) {
      if (dialects.some(d => selectedDialects.has(d))) {
        initialExpanded[glid] = true;
      }
    }
    setExpandedGroups(prev => ({ ...initialExpanded, ...prev }));
  }, [selectedDialects]);

  const addToHistory = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== trimmed);
      const next = [trimmed, ...filtered].slice(0, 50);
      localStorage.setItem("yc_search_history", JSON.stringify(next));
      return next;
    });
  };

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      let url = "";
      if (mode === "VS-1") {
        url = `/api/search?mode=VS-1&q=${encodeURIComponent(query)}&module=${modules}`;
      } else if (mode === "VS-2") {
        url = `/api/search?mode=VS-2&level=${level}&lesson=${lesson}`;
      } else {
        url = `/api/search?mode=VS-3&category=${essayId}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setResults(data.results || []);
      setSlideIndex(0);
      setDisplayLimit(100);

      if (mode === "VS-1" && query.trim().length > 1 && data.results?.length > 0) {
        addToHistory(query);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (mode === "VS-1" && query.trim().length === 0) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      handleSearch();
    }, 800);
    return () => clearTimeout(timer);
  }, [mode, query, modules, level, lesson, standardize, essayId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === "VS-2" && vs2View === "slide" && filteredResults.length > 0) {
        if (e.key === "ArrowLeft") setSlideIndex(prev => Math.max(0, prev - 1));
        else if (e.key === "ArrowRight") setSlideIndex(prev => Math.min(filteredResults.length - 1, prev + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, vs2View, slideIndex, results]);

  const handleFetchRawDb = async () => {
    setIsRawDbLoading(true);
    try {
      const res = await fetch(`/api/raw_db?keyword=${rawDbKeyword}&source=${rawDbSource}`);
      const data = await res.json();
      setRawDbData(data.rows || []);
    } catch (e) {
      console.error(e);
    }
    setIsRawDbLoading(false);
  };

  const handleHistorySelect = (q: string) => {
    setQuery(q);
    setShowHistory(false);
  };

  const clearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchHistory([]);
    localStorage.removeItem("yc_search_history");
  };

  const removeHistoryItem = (e: React.MouseEvent, q: string) => {
    e.stopPropagation();
    setSearchHistory(prev => {
      const next = prev.filter(item => item !== q);
      localStorage.setItem("yc_search_history", JSON.stringify(next));
      return next;
    });
  };

  const toggleDialect = (d: string) => {
    const next = new Set(selectedDialects);
    if (next.has(d)) next.delete(d);
    else next.add(d);
    setSelectedDialects(next);
    localStorage.setItem("yc_selected_dialects", JSON.stringify(Array.from(next)));
  };

  const toggleGroupExpand = (glid: string) => {
    setExpandedGroups(prev => ({ ...prev, [glid]: !prev[glid] }));
  };

  const toggleAllInFamily = (glid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const familyDialects = GLID_FAMILIES[glid] || [];
    const allSelected = familyDialects.every(d => selectedDialects.has(d));
    const next = new Set(selectedDialects);

    if (allSelected) {
      familyDialects.forEach(d => next.delete(d));
    } else {
      familyDialects.forEach(d => next.add(d));
    }

    setSelectedDialects(next);
    localStorage.setItem("yc_selected_dialects", JSON.stringify(Array.from(next)));
  };

  const cycleTheme = () => {
    const nextIdx = (THEMES.indexOf(theme) + 1) % THEMES.length;
    const next = THEMES[nextIdx];
    setTheme(next);
    localStorage.setItem("yc_theme", next);
  };

  const toggleSidebar = () => {
    const next = !isSidebarCollapsed;
    setIsSidebarCollapsed(next);
    localStorage.setItem("yc_sidebar_collapsed", JSON.stringify(next));
  };

  const toggleUiLang = () => {
    const next = uiLang === "en" ? "zh" : "en";
    setUiLang(next);
    localStorage.setItem("yc_ui_lang", next);
  };

  const playAudio = (url: string) => {
    if (!url) return;
    try {
      const audio = new Audio(url);
      audio.play().catch(e => console.error("Audio playback failed:", e));
    } catch (e) {
      console.error("Audio error:", e);
    }
  };

  const handleResize = (e: MouseEvent) => {
    const nextWidth = Math.max(200, Math.min(600, e.clientX));
    setSidebarWidth(nextWidth);
    localStorage.setItem("yc_sidebar_width", nextWidth.toString());
  };

  const startResizing = () => {
    window.addEventListener("mousemove", handleResize);
    window.addEventListener("mouseup", stopResizing);
    document.body.style.cursor = "col-resize";
  };

  const stopResizing = () => {
    window.removeEventListener("mousemove", handleResize);
    window.removeEventListener("mouseup", stopResizing);
    document.body.style.cursor = "default";
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setToastMessage(UI_STRINGS[uiLang].copied);
    setTimeout(() => {
      setToastMessage(null);
      setCopiedId(null);
    }, 2000);
  };

  const displayColumns = useMemo(() => {
    return Array.from(selectedDialects).sort((a, b) => {
      const idxA = sortedAllDialects.indexOf(a);
      const idxB = sortedAllDialects.indexOf(b);
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });
  }, [selectedDialects, sortedAllDialects]);

  const filteredResults = useMemo(() => {
    if (!showFullOnly) return results;
    return results.filter(r => displayColumns.every(col => r[col] && r[col].length > 0));
  }, [results, showFullOnly, displayColumns]);

  const pagedResults = useMemo(() => filteredResults.slice(0, displayLimit), [filteredResults, displayLimit]);

  const getRowText = (r: any) => {
    let t = r.zh + "\n";
    displayColumns.forEach(c => {
      if (r[c] && r[c].length > 0) {
        t += `${getDialectName(c, uiLang)}: ${r[c].map((x: any) => x.text).join(' / ')}\n`;
      }
    });
    return t;
  };

  const getColText = (col: string) => {
    return pagedResults.map(r => {
      if (r[col] && r[col].length > 0) return r[col].map((x: any) => x.text).join(' / ');
      return null;
    }).filter(Boolean).join("\n");
  };

  const s = UI_STRINGS[uiLang];

  return (
    <div className={`theme-${theme} flex h-screen w-full bg-[var(--bg-deep)] text-[var(--text-main)] font-sans overflow-hidden transition-all duration-500`}>

      {/* SIDEBAR: GLID FILTERS */}
      <aside
        style={{ width: isSidebarCollapsed ? 0 : sidebarWidth }}
        className={`flex-shrink-0 border-r border-[var(--border-dark)] bg-[var(--bg-panel)] flex flex-col h-full z-20 shadow-xl transition-all duration-300 relative overflow-visible`}
      >
        {!isSidebarCollapsed && (
          <div
            onMouseDown={startResizing}
            className="absolute -right-1 top-0 bottom-0 w-2 cursor-col-resize z-30 hover:bg-[var(--accent)] transition-colors opacity-0 hover:opacity-100"
          />
        )}
        {!isSidebarCollapsed && (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--bg-panel)] pointer-events-none mix-blend-overlay"></div>
            <div className="p-4 border-b border-[var(--border-dark)] flex flex-col space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[var(--accent)] cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setMode("VS-1")}>
                  <Hexagon className="w-5 h-5 fill-current" />
                  <h1 className="font-mono text-xs tracking-widest font-black uppercase">{s.hub}</h1>
                </div>
                <div className="flex space-x-1 items-center">
                  <button onClick={toggleUiLang} className="p-1.5 hover:bg-[var(--bg-highlight)] rounded-full transition text-[var(--text-sub)] hover:text-[var(--text-main)]" title="Toggle UI Language"><Languages className="w-3.5 h-3.5" /></button>
                  <button onClick={cycleTheme} className="p-1.5 hover:bg-[var(--bg-highlight)] rounded-full transition text-[var(--text-sub)] hover:text-[var(--text-main)]" title={`Theme: ${theme}`}><Palette className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              <div className="p-3 border-b border-[var(--border-dark)] flex space-x-2 font-mono relative items-center" style={{ overflow: 'visible' }}>
                <button onClick={() => setSelectedDialects(new Set(sortedAllDialects))} className="flex-1 text-[10px] py-1.5 border border-[var(--border-light)] rounded hover:bg-[var(--bg-highlight)] transition text-[var(--text-main)] uppercase font-bold">{s.all}</button>
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
                    <div className="fixed top-44 left-2 mt-1 p-3 bg-[var(--bg-panel)] border border-[var(--border-dark)] border-t-2 border-t-[var(--accent)] rounded font-sans shadow-[0_8px_50px_rgba(0,0,0,0.7)] z-[999] w-64 space-y-3 opacity-100">
                      <div className="text-[10px] text-[var(--text-sub)] uppercase font-mono tracking-widest border-b border-[var(--border-dark)] pb-1 mb-2 flex justify-between items-center text-left">
                        <span>{s.presets}</span>
                        <button onClick={() => setShowOptions(false)} className="hover:text-red-400 transition">×</button>
                      </div>
                      <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                        <button
                          onClick={() => { setSelectedDialects(new Set(standardDialects)); setShowOptions(false); }}
                          className="w-full text-left p-2 hover:bg-[var(--bg-highlight)] rounded font-mono text-[10px] transition flex items-center justify-between group border border-transparent hover:border-[var(--border-light)]"
                        >
                          <span className="text-[var(--accent)] font-bold">STANDARD_16</span>
                          <Check className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                        </button>
                        {savedFilters.map((f, i) => (
                          <div key={i} className="flex items-center group/p bg-[var(--bg-sub)] rounded border border-transparent hover:border-[var(--border-light)]">
                            <button
                              onClick={() => { setSelectedDialects(new Set(f.dialects)); setShowOptions(false); }}
                              className="flex-1 text-left p-2 hover:bg-[var(--bg-highlight)] rounded font-mono text-[10px] transition truncate"
                            >
                              {f.name}
                            </button>
                            <button
                              onClick={() => {
                                const next = savedFilters.filter((_, idx) => idx !== i);
                                setSavedFilters(next);
                                localStorage.setItem("yc_saved_filters", JSON.stringify(next));
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
                            localStorage.setItem("yc_saved_filters", JSON.stringify(next));
                          }
                        }}
                        className="w-full text-center py-2 bg-[var(--accent)] text-black rounded font-mono text-[10px] font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        + SAVE_CURRENT
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    const allOpen = Object.keys(GLID_FAMILIES).every(k => expandedGroups[k]);
                    const next: Record<string, boolean> = {};
                    Object.keys(GLID_FAMILIES).forEach(k => next[k] = !allOpen);
                    setExpandedGroups(next);
                  }}
                  className="p-1 px-2 text-[10px] border border-[var(--border-light)] rounded hover:bg-[var(--bg-highlight)] transition text-[var(--text-sub)] hover:text-[var(--text-main)]"
                  title="Expand/Collapse All Families"
                >
                  <Square className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-2 relative z-10 custom-scrollbar-left" dir="rtl">
              <div className="space-y-3 pr-2 w-full" dir="ltr">
                {Object.entries(GLID_FAMILIES).sort((a, b) => Number(a[0]) - Number(b[0])).map(([glid, dialects]) => {
                  const isExpanded = expandedGroups[glid];
                  const selectedCount = dialects.filter(d => selectedDialects.has(d)).length;
                  const titleName = uiLang === "zh" ? GLID_NAMES[glid] : (GLID_NAMES_EN[glid] || GLID_NAMES[glid]);
                  return (
                    <div key={glid} className="border border-[var(--border-light)] bg-[var(--bg-sub)] rounded overflow-hidden">
                      <div className="w-full flex items-center justify-between p-2 bg-[var(--bg-panel)] hover:bg-[var(--bg-highlight)] transition cursor-default">
                        <button
                          onClick={() => toggleGroupExpand(glid)}
                          className="flex items-center space-x-2 text-[var(--text-main)] truncate max-w-[200px] flex-1 text-left"
                        >
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-[var(--accent)] shrink-0" /> : <ChevronRight className="w-4 h-4 text-[var(--text-sub)] shrink-0" />}
                          <span
                            style={{ fontSize: filterFontSize }}
                            className={`font-mono font-semibold tracking-wide truncate ${selectedCount > 0 ? 'text-[var(--accent)]' : 'text-[var(--text-sub)]'}`}
                          >
                            [{glid}] {titleName}
                          </span>
                        </button>
                        {selectedCount > 0 && (
                          <button
                            onClick={(e) => toggleAllInFamily(glid, e)}
                            className="text-[10px] font-mono bg-[var(--accent)] text-[var(--bg-deep)] px-1.5 rounded hover:opacity-80 transition active:scale-95"
                            title="Toggle All in Category"
                          >
                            {selectedCount}
                          </button>
                        )}
                        {selectedCount === 0 && (
                          <button
                            onClick={(e) => toggleAllInFamily(glid, e)}
                            className="text-[10px] font-mono border border-[var(--border-dark)] text-[var(--text-sub)] px-1.5 rounded hover:border-[var(--accent)] hover:text-[var(--accent)] transition"
                          >
                            0
                          </button>
                        )}
                      </div>
                      {isExpanded && (
                        <div className="p-1 space-y-0.5 bg-[var(--bg-sub)]">
                          {dialects.map(d => (
                            <label key={d} className="flex items-center space-x-2 cursor-pointer group p-1.5 hover:bg-[var(--bg-highlight)] rounded transition" onClick={(e) => { e.preventDefault(); toggleDialect(d); }}>
                              <div className={`w-3.5 h-3.5 border flex items-center justify-center rounded-sm transition-colors shrink-0 ${selectedDialects.has(d) ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border-light)] group-hover:border-[var(--text-sub)] bg-[var(--bg-panel)]'}`}>
                                {selectedDialects.has(d) && <CheckSquare className="w-2.5 h-2.5 text-[var(--bg-deep)]" />}
                              </div>
                              <span
                                style={{ fontSize: filterFontSize }}
                                className={`truncate font-mono ${selectedDialects.has(d) ? 'text-[var(--text-main)] font-medium' : 'text-[var(--text-sub)]'} group-hover:text-[var(--text-main)] transition`}
                              >
                                {getDialectName(d, uiLang)}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative" onClick={() => setShowHistory(false)}>

        {/* Sidebar Toggle Button */}
        < button
          onClick={toggleSidebar}
          style={{ left: isSidebarCollapsed ? 0 : sidebarWidth }}
          className={`fixed top-1/2 -translate-y-1/2 z-40 p-1.5 bg-[var(--bg-panel)] border-y border-r border-[var(--border-dark)] rounded-r-md text-[var(--accent)] hover:bg-[var(--bg-sub)] shadow-xl transition-all duration-300 group`}
          title={isSidebarCollapsed ? "Expand Filters" : "Collapse Filters"}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
            {isSidebarCollapsed ? "Show Filters" : "Hide Filters"}
          </div>
        </button >

        {/* TOP BAR */}
        {/* PRIMARY HEADER */}
        <header className="h-16 border-b border-[var(--border-dark)] flex items-center px-6 justify-between bg-[var(--bg-panel)] z-[105] shadow-md sticky top-0 backdrop-blur-md border-t-4 border-t-[var(--accent)]">
          <div className="flex items-center space-x-3 text-[var(--accent)] group cursor-pointer" onClick={() => setMode("VS-1")}>
            {isSidebarCollapsed && (
              <>
                <Hexagon className="w-6 h-6 fill-current transition-transform group-hover:rotate-12" />
                <h1 className="font-mono text-xl font-black tracking-tighter uppercase hidden md:block animate-in fade-in slide-in-from-left-4 duration-500">{s.hub}</h1>
              </>
            )}
          </div>

          <div className="flex bg-[var(--bg-sub)] p-1 rounded-xl border border-[var(--border-dark)] shadow-inner">
            {["VS-1", "VS-2", "VS-3"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m as any)}
                className={`px-8 py-1.5 rounded-lg font-mono text-xs font-bold transition-all duration-300 ${mode === m ? 'bg-[var(--accent)] text-black shadow-lg translate-y-[-1px]' : 'text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-[var(--bg-highlight)]'}`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsToolsOpen(true)}
              className="p-2 hover:bg-[var(--bg-highlight)] rounded-full transition text-[var(--accent)] hover:scale-110 active:scale-95"
              title="Research Tools"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <div className="w-[1px] h-4 bg-[var(--border-dark)] mx-1" />
            <div className="relative">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 hover:bg-[var(--bg-highlight)] rounded-full transition text-[var(--text-sub)] hover:text-[var(--text-main)]"
                title="Interface Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              {showHistory && (
                <div className="absolute top-full right-0 mt-2 p-3 bg-[var(--bg-panel)] border border-[var(--border-dark)] rounded shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[130] w-48 space-y-3 opacity-100 backdrop-blur-md border-t-2 border-t-[var(--accent)]">
                  <div className="text-[10px] text-[var(--text-sub)] uppercase font-mono px-1 tracking-widest border-b border-[var(--border-dark)] pb-1 mb-2">Global Font</div>
                  <div className="flex items-center justify-between font-mono bg-[var(--bg-sub)] rounded p-2">
                    <button onClick={() => { setFilterFontSize(f => Math.max(8, f - 1)); localStorage.setItem("yc_filter_font_size", (filterFontSize - 1).toString()); }} className="px-3 hover:text-[var(--accent)] transition">-</button>
                    <span className="text-sm font-bold">{filterFontSize}px</span>
                    <button onClick={() => { setFilterFontSize(f => Math.min(18, f + 1)); localStorage.setItem("yc_filter_font_size", (filterFontSize + 1).toString()); }} className="px-3 hover:text-[var(--accent)] transition">+</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* SECONDARY TOOLBAR */}
        <div className="h-14 border-b border-[var(--border-dark)] flex items-center px-4 justify-between bg-[var(--bg-sub)] z-[95] sticky top-16 backdrop-blur-md">
          <div className="flex items-center space-x-6 flex-1">
            {mode === "VS-1" ? (
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
            ) : mode === "VS-2" ? (
              <div className="flex items-center space-x-4 font-mono text-sm">
                <div className="flex items-center space-x-2 bg-[var(--bg-panel)] border border-[var(--border-dark)] px-3 py-1 rounded-md shadow-inner transition hover:border-[var(--accent)] group">
                  <span className="text-[var(--accent)] font-black uppercase opacity-60 text-[10px] group-hover:opacity-100">{s.level}</span>
                  <input type="number" min={1} max={12} value={level} onChange={(e) => setLevel(Number(e.target.value))} className="bg-transparent w-8 text-center outline-none font-bold text-[var(--text-main)]" />
                </div>
                <div className="flex items-center space-x-2 bg-[var(--bg-panel)] border border-[var(--border-dark)] px-3 py-1 rounded-md shadow-inner transition hover:border-[var(--accent)] group">
                  <span className="text-[var(--accent)] font-black uppercase opacity-60 text-[10px] group-hover:opacity-100">{s.lesson}</span>
                  <input type="number" min={1} max={20} value={lesson} onChange={(e) => setLesson(Number(e.target.value))} className="bg-transparent w-8 text-center outline-none font-bold text-[var(--text-main)]" />
                </div>
              </div>
            ) : mode === "VS-3" ? (
              <div className="flex items-center overflow-x-auto gap-1 scrollbar-none flex-nowrap">
                {["32020", "32021", "32022", "32023", "32024", "32025", "32026", "32027", "32028", "32029", "32030", "32031", "32032", "32033", "32034", "32035", "32036", "32038", "32039", "32040", "32041", "32042", "32043"].map(id => (
                  <button
                    key={id}
                    onClick={() => setEssayId(id)}
                    className={`px-3 py-1 rounded font-mono text-[10px] font-bold whitespace-nowrap transition-all ${essayId === id
                      ? 'bg-[var(--accent)] text-black shadow-sm'
                      : 'border border-[var(--border-dark)] text-[var(--text-sub)] hover:text-[var(--text-main)] hover:border-[var(--accent)]'
                      }`}
                  >
                    主題 {parseInt(id) - 32019}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="flex items-center space-x-2">
              <select
                value={modules}
                onChange={(e) => setModules(e.target.value)}
                className="bg-[var(--bg-panel)] border border-[var(--border-dark)] rounded px-2 py-1 text-[9px] font-mono text-[var(--accent)] uppercase tracking-tighter outline-none hover:border-[var(--accent)] transition cursor-pointer"
                title="Search Source Module"
              >
                <option value="ALL">SOURCE: ALL</option>
                <option value="essay">SOURCE: ESSAY</option>
                <option value="grmpts">SOURCE: GRMPTS</option>
                <option value="dialogue">SOURCE: DIALOGUE</option>
                <option value="twelve">SOURCE: 12_KW</option>
                <option value="nine_year">SOURCE: 9_YR</option>
                <option value="ILRDF">SOURCE: ILRDF</option>
              </select>
              {isSearching && <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" />}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 font-mono text-[10px] cursor-pointer bg-[var(--bg-panel)] border border-[var(--border-dark)] px-3 py-1 rounded hover:border-[var(--accent)] transition group">
              <div className={`w-3 h-3 flex items-center justify-center rounded-sm transition ${showFullOnly ? 'bg-[var(--accent)]' : 'bg-[var(--bg-sub)] border border-[var(--border-dark)]'}`}>{showFullOnly && <CheckSquare className="w-2.5 h-2.5 text-black" />}</div>
              <span className={`uppercase tracking-widest font-bold ${showFullOnly ? 'text-[var(--accent)]' : 'text-[var(--text-sub)] group-hover:text-[var(--text-main)]'}`}>{s.showFull}</span>
              <input type="checkbox" checked={showFullOnly} onChange={(e) => setShowFullOnly(e.target.checked)} className="hidden" />
            </label>

            {mode === "VS-1" && (
              <label className="flex items-center space-x-2 font-mono text-[10px] cursor-pointer bg-[var(--bg-panel)] border border-[var(--border-dark)] px-3 py-1 rounded hover:border-[var(--accent)] transition group">
                <div className={`w-3 h-3 flex items-center justify-center rounded-sm transition ${standardize ? 'bg-[var(--accent)]' : 'bg-[var(--bg-sub)] border border-[var(--border-dark)]'}`}>{standardize && <CheckSquare className="w-2.5 h-2.5 text-black" />}</div>
                <span className={`uppercase tracking-widest font-bold ${standardize ? 'text-[var(--accent)]' : 'text-[var(--text-sub)] group-hover:text-[var(--text-main)]'}`}>{s.stdSpelling}</span>
                <input type="checkbox" checked={standardize} onChange={(e) => setStandardize(e.target.checked)} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* TOOLS OVERLAY */}
        {
          isToolsOpen && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-[var(--bg-deep)] bg-opacity-80 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setIsToolsOpen(false)}
            >
              <div
                className="bg-[var(--bg-panel)] border border-[var(--border-dark)] rounded-xl shadow-2xl w-[85%] h-[85%] flex flex-col overflow-hidden relative shadow-[0_0_100px_rgba(0,0,0,0.5)]"
                onClick={e => e.stopPropagation()}
              >
                <button onClick={() => setIsToolsOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-[var(--bg-highlight)] rounded-full transition text-[var(--text-sub)] hover:text-[var(--text-main)] z-10"><Square className="w-5 h-5" /></button>

                <div className="flex border-b border-[var(--border-dark)] bg-[var(--bg-sub)]">
                  {["heatmap", "normalization", "rosetta", "raw_db"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setToolsTab(tab as any)}
                      className={`px-8 py-4 font-mono text-xs uppercase tracking-widest transition-all ${toolsTab === tab ? 'bg-[var(--bg-panel)] text-[var(--accent)] border-b-2 border-[var(--accent)]' : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                  {toolsTab === "heatmap" && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                      <div className="flex justify-between items-end">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-mono text-[var(--accent)] font-bold italic">AMIS_PHONETIC_DRIFT_HEATMAP</h2>
                          <p className="text-[var(--text-sub)] text-sm max-w-2xl">Morpheme-anchored <code>u/o</code> & <code>b/f</code> signal strengths across Amis clusters.</p>
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] font-mono text-[var(--text-sub)]">
                          <span>Weak (0)</span>
                          <div className="w-24 h-2 rounded-full bg-gradient-to-r from-[var(--bg-sub)] via-orange-500 to-red-600"></div>
                          <span>Strong (200+)</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-6 border border-[var(--border-dark)] bg-[var(--bg-deep)] rounded-xl overflow-hidden shadow-2xl">
                        <div className="p-4 bg-[var(--bg-sub)] border-r border-b border-[var(--border-dark)]"></div>
                        {["南勢", "秀姑巒", "海岸", "馬蘭", "恆春"].map(d => (
                          <div key={d} className="p-4 bg-[var(--bg-sub)] border-b border-r border-[var(--border-dark)] font-mono text-[10px] text-center font-bold">{d}</div>
                        ))}

                        {["南勢", "秀姑巒", "海岸", "馬蘭", "恆春"].map(row => (
                          <React.Fragment key={row}>
                            <div className="p-4 bg-[var(--bg-sub)] border-r border-b border-[var(--border-dark)] font-mono text-[10px] font-bold">{row}</div>
                            {["南勢", "秀姑巒", "海岸", "馬蘭", "恆春"].map(col => {
                              const isDiag = row === col;
                              // Mocking some data from the report findings
                              let weight = 0;
                              if (row === "恆春" && col === "秀姑巒") weight = 234;
                              if (row === "南勢" && col === "秀姑巒") weight = 136;
                              if (row === "恆春" && col === "海岸") weight = 156;
                              if (row === "馬蘭" && col === "南勢") weight = 50;
                              const opacity = isDiag ? 0.05 : (weight / 250);
                              const color = weight > 100 ? 'bg-red-600' : weight > 50 ? 'bg-orange-500' : 'bg-[var(--accent)]';
                              return (
                                <div
                                  key={col}
                                  className={`p-1 border-r border-b border-[var(--border-dark)] transition-all flex items-center justify-center relative group/cell`}
                                  style={{ backgroundColor: isDiag ? 'transparent' : `rgba(255, 60, 0, ${opacity})` }}
                                >
                                  {!isDiag && weight > 0 && <span className="text-[10px] font-mono font-bold drop-shadow-md text-white">{weight}</span>}
                                  {!isDiag && weight > 0 && (
                                    <div className="absolute inset-0 z-10 opacity-0 group-hover/cell:opacity-100 bg-black/80 p-2 pointer-events-none text-[8px] flex flex-col justify-center">
                                      <div className="text-[var(--accent)] font-bold">u → o DRIFT</div>
                                      <div className="text-white">Anchors: kaku/kako, kisu/kiso, ku/ko</div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                  {toolsTab === "normalization" && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-mono text-[var(--accent)]">NORMALIZATION_ENGINE</h2>
                      <p className="text-[var(--text-sub)]">Rules-based dynamic transcription to standardize orthography.</p>
                      <div className="bg-[var(--bg-sub)] p-6 rounded-lg border border-[var(--border-light)] font-mono text-xs text-[var(--text-sub)] space-y-2">
                        <div>[RULE 1] b → f (Amis-S)</div>
                        <div>[RULE 2] u → o (Amis-N)</div>
                      </div>
                    </div>
                  )}
                  {toolsTab === "rosetta" && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-mono text-[var(--accent)]">ROSETTA_STONE_MAPPING</h2>
                      <p className="text-[var(--text-sub)]">Mapping EN semantics to Austronesian roots.</p>
                      <div className="p-12 border-2 border-dashed border-[var(--border-dark)] rounded-xl flex items-center justify-center text-[var(--text-sub)] font-mono italic">
                        ROSETTA_DATA_NOT_YET_LOADED
                      </div>
                    </div>
                  )}
                  {toolsTab === "raw_db" && (
                    <div className="space-y-6 flex flex-col h-full">
                      <h2 className="text-2xl font-mono text-[var(--accent)]">RAW_DB_VIEWER</h2>
                      <p className="text-[var(--text-sub)]">Execute low-level SELECT inquiries against master tables.</p>

                      <div className="flex space-x-4 items-center bg-[var(--bg-highlight)] p-4 rounded-xl border border-[var(--border-dark)]">
                        <input
                          type="text"
                          placeholder="Search keyword (zh or ab)..."
                          value={rawDbKeyword}
                          onChange={e => setRawDbKeyword(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleFetchRawDb()}
                          className="flex-1 bg-[var(--bg-panel)] border border-[var(--border-light)] p-2 rounded text-sm font-mono text-[var(--text-main)] w-full"
                        />
                        <select
                          value={rawDbSource} onChange={e => setRawDbSource(e.target.value)}
                          className="bg-[var(--bg-panel)] border border-[var(--border-light)] p-2 rounded text-sm font-mono"
                        >
                          <option value="ALL">ALL SOURCES</option>
                          <option value="twelve">twelve</option>
                          <option value="nine_year">nine_year</option>
                          <option value="grmpts">grmpts</option>
                          <option value="essay">essay</option>
                          <option value="dialogue">dialogue</option>
                        </select>
                        <button onClick={handleFetchRawDb} disabled={isRawDbLoading} className="px-6 py-2 bg-[var(--accent)] text-black font-bold font-mono rounded text-sm hover:opacity-80 transition flex-shrink-0">
                          {isRawDbLoading ? "QUERYING..." : "EXECUTE"}
                        </button>
                      </div>

                      <div className="flex-1 overflow-auto border border-[var(--border-dark)] rounded font-mono text-xs bg-[#0F0F12] relative min-h-[400px]">
                        {rawDbData.length > 0 ? (
                          <table className="min-w-full text-left">
                            <thead className="bg-[#1A1A24] sticky top-0 border-b border-[var(--border-dark)]">
                              <tr>
                                {Object.keys(rawDbData[0] || {}).map(k => (
                                  <th key={k} className="p-3 text-[var(--text-sub)] truncate max-w-[150px]">{k}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-dark)] text-[11px]">
                              {rawDbData.map((row, i) => (
                                <tr key={i} className="hover:bg-[var(--bg-highlight)] flex-row">
                                  {Object.values(row).map((val: any, j) => (
                                    <td key={j} className="p-3 text-[var(--text-main)] max-w-[200px] truncate" title={val?.toString()}>
                                      {val?.toString() || 'NULL'}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center opacity-30 italic">NO DATA OR AWAITING QUERY</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        }

        {/* CONTENT AREA */}
        <div className={`flex-1 overflow-auto theme-gradient-bg relative flex flex-col ${mode === "VS-3" ? "items-center" : "items-start"} custom-scrollbar w-full`}>
          {filteredResults.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center flex-col text-[var(--border-light)] opacity-50 space-y-4">
              <Filter className="w-16 h-16 drop-shadow-lg" />
              <p className="text-sm tracking-widest">{mode === "VS-1" ? s.waitingMode1 : s.waitingMode2}</p>
            </div>
          ) : mode === "VS-2" && vs2View === "slide" ? (
            <div className="w-full h-full flex flex-col p-6 animate-in fade-in zoom-in-95">
              <div className="w-full flex justify-between items-center mb-6 border-b border-[var(--border-dark)] pb-4">
                <div className="flex items-center space-x-6">
                  <span className="font-mono text-sm text-[var(--text-sub)]">{s.sentence} {slideIndex + 1} / {filteredResults.length}</span>
                  <div className="flex bg-[var(--bg-panel)] p-1 rounded border border-[var(--border-dark)]">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button key={v} onClick={() => setSlideCols(v)} className={`w-7 h-7 flex items-center justify-center rounded text-xs transition ${slideCols === v ? 'bg-[var(--accent)] text-[var(--bg-deep)] font-bold' : 'text-[var(--text-sub)] hover:bg-[var(--bg-sub)]'}`}>{v}</button>
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
          ) : mode === "VS-3" ? (
            <div className="w-full h-full flex flex-col items-center overflow-y-auto custom-scrollbar p-12 space-y-24 pb-64">
              <div className="w-full max-w-4xl flex justify-between items-center mb-4">
                <h2 className="text-4xl font-sans font-black tracking-tighter flex items-center space-x-4">
                  <Presentation className="w-10 h-10 text-[var(--accent)]" />
                  <span>{uiLang === 'en' ? 'ESSAY_PROMPT_VIEW' : '短文對話檢視'}</span>
                </h2>
                <div className="px-4 py-2 bg-[var(--bg-panel)] rounded-lg border border-[var(--border-dark)] font-mono text-[10px] text-[var(--accent)]">
                  {results.length} FRAGMENTS LOADED
                </div>
              </div>

              <div className="w-full max-w-6xl space-y-16 py-12">
                <div className="grid grid-cols-1 gap-12">
                  {displayColumns.map(col => {
                    const colTexts = results.map(r => r[col]?.[0]?.text).filter(Boolean);
                    if (colTexts.length === 0) return null;
                    return (
                      <div key={col} className="bg-[var(--bg-panel)] rounded-3xl border border-[var(--border-dark)] overflow-hidden flex flex-col shadow-2xl transition-all hover:border-[var(--accent)] group/dia">
                        <div className="bg-[var(--bg-sub)] px-8 py-6 border-b border-[var(--border-dark)] flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-sm font-mono font-black text-[var(--accent)] uppercase tracking-[0.3em]">{getDialectName(col, uiLang)}</span>
                            <span className="text-[10px] font-mono text-[var(--text-sub)] opacity-50">Dialectal Soul: {col}</span>
                          </div>
                          <button onClick={() => handleCopy(colTexts.join('\n'), `vs3-col-${col}`)} className="p-2 hover:bg-[var(--bg-highlight)] rounded-full text-[var(--accent)] transition">
                            {copiedId === `vs3-col-${col}` ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                          </button>
                        </div>
                        <div className="p-12 space-y-8 bg-gradient-to-br from-transparent to-[var(--bg-highlight)]">
                          {results.map((sentence, sIdx) => {
                            const items = sentence[col];
                            if (!items || items.length === 0) return null;
                            return (
                              <div key={sIdx} className="flex flex-col items-center group/sent">
                                <div className="text-[10px] font-mono text-[var(--text-sub)] opacity-20 mb-2 group-hover/sent:opacity-100 transition-opacity">Fragment {sIdx + 1} // {sentence.zh}</div>
                                <div className="text-3xl leading-relaxed text-center font-sans font-light text-[var(--text-main)] group-hover/sent:text-[var(--accent)] transition-colors selection:bg-[var(--accent)] selection:text-black">
                                  {items[0].text}
                                </div>
                                {items[0].audio && (
                                  <button onClick={() => playAudio(items[0].audio)} className="mt-2 p-1 text-[var(--text-sub)] hover:text-[var(--accent)] transition opacity-0 group-hover/sent:opacity-100">
                                    <Volume2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="inline-block min-w-full pb-32">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-panel)] border-b border-[var(--border-dark)]">
                    <th className="px-5 py-6 border-r border-[var(--border-dark)] text-[var(--accent)] font-mono text-lg font-black tracking-tight sticky top-0 left-0 z-20 shadow-[4px_0_10px_rgba(0,0,0,0.3)] min-w-[320px] bg-[var(--bg-panel)] text-left uppercase border-l border-[var(--border-dark)]">{s.semantics}</th>
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
                                  {item.source?.replace(/^\*+/, '')} {item.level ? `L${item.level}` : ''} {item.category}
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
                    className="px-12 py-3 border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-glow)] rounded-full transition-all font-mono text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)]"
                  >
                    {uiLang === 'en' ? 'Load More Results' : '加載更多結果'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {
          toastMessage && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[var(--bg-panel)] border border-[var(--accent)] text-[var(--accent)] px-4 py-1.5 rounded-full shadow-2xl z-50 animate-in slide-in-from-bottom-5 font-mono text-xs border-dashed">
              {toastMessage}
            </div>
          )
        }
      </main >

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border-light); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--accent); }

        .custom-scrollbar-left::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar-left::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-left::-webkit-scrollbar-thumb { background: var(--border-dark); border-radius: 10px; }
        .custom-scrollbar-left::-webkit-scrollbar-thumb:hover { background: var(--accent); }

        .theme-matrix {
          --bg-deep: #080808; --bg-panel: #111; --bg-sub: #1a1a1a;
          --bg-highlight: #222; --border-light: #333; --border-dark: #111;
          --accent: #00ff88; --accent-glow: rgba(0,255,136,0.1);
          --text-main: #e0e0e0; --text-sub: #888;
        }
        .theme-sober {
          --bg-deep: #121212; --bg-panel: #1e1e1e; --bg-sub: #252525;
          --bg-highlight: #2a2a2a; --border-light: #333; --border-dark: #111;
          --accent: #00bcd4; --accent-glow: rgba(0,188,212,0.1);
          --text-main: #fff; --text-sub: #999;
        }
        .theme-ycm {
          --bg-deep: #0a0e0a; --bg-panel: #121812; --bg-sub: #1a221a;
          --bg-highlight: #222d22; --border-light: #2d3c2d; --border-dark: #080a08;
          --accent: #ff8c00; --accent-glow: rgba(255,140,0,0.1);
          --text-main: #f0f4f0; --text-sub: #90a090;
        }
        .theme-cidal {
            --bg-deep: #1a1a14; --bg-panel: #25251d; --bg-sub: #2f2f25;
            --bg-highlight: #3a3a2d; --border-light: #4a4a3a; --border-dark: #12120e;
            --accent: #ffcc33; --accent-glow: rgba(255,204,51,0.1);
            --text-main: #fff5e6; --text-sub: #b3a890;
        }
        .theme-rainbow {
            --bg-deep: #050510; --bg-panel: #0a0a1a; --bg-sub: #111125;
            --bg-highlight: #1a1a35; --border-light: #252545; --border-dark: #00000a;
            --accent: #ff00ff; --accent-glow: rgba(255,0,255,0.1);
            --text-main: #ffffff; --text-sub: #9999cc;
        }

        .theme-matrix .theme-gradient-bg { 
            background: radial-gradient(circle at 50% 50%, #111 0%, #080808 100%); 
        }
        .theme-ycm .theme-gradient-bg { 
            background: linear-gradient(135deg, #0a0e0a 0%, #1a221a 100%); 
        }

        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div >
  );
}
