"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Hexagon, ChevronRight, ChevronLeft } from "lucide-react";
import { GLID_FAMILIES, getDialectName } from "@/lib/dialects";
import { usePersistedState } from "@/hooks/usePersistedState";
import { Theme, UILang, SavedFilter, Sentence } from "@/types";
import { UI_STRINGS } from "@/lib/i18n";
import SidebarFilters from "@/components/layout/SidebarFilters";
import ToolsOverlay from "@/components/views/ToolsOverlay";
import Vs1Matrix from "@/components/views/Vs1Matrix";
import Vs2SlideView from "@/components/views/Vs2SlideView";
import Vs3EssayView from "@/components/views/Vs3EssayView";
import VsDictView from "@/components/views/VsDictView";
import Header from "@/components/layout/Header";
import TopToolbar from "@/components/layout/TopToolbar";
import { getSourceLabel } from "@/lib/utils";

const THEMES = ["matrix", "sober", "ycm", "cidal", "rainbow"] as const;




export default function GlobalExplorer() {
  const [uiLang, setUiLang] = usePersistedState<UILang>("yc_ui_lang", "en");
  const [mode, setMode] = useState<"VS-1" | "VS-2" | "VS-3" | "DICT" | "EXAMS" | "FLASHCARDS">("DICT");
  const [theme, setTheme] = usePersistedState<Theme>("yc_theme", "matrix");
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [dictResults, setDictResults] = useState<any[]>([]);
  const [modules, setModules] = usePersistedState<string[]>("yc_modules", ["ALL"]);
  const [showSources, setShowSources] = useState(false);
  const [level, setLevel] = useState(1);
  const [lesson, setLesson] = useState(1);
  const [standardize, setStandardize] = useState(false);
  const [showFullOnly, setShowFullOnly] = useState(false);
  const [hideEmpty, setHideEmpty] = useState(true);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [toolsTab, setToolsTab] = useState<"heatmap" | "normalization" | "rosetta" | "raw_db">("heatmap");
  const vs3SourceRef = useRef<HTMLDivElement>(null);
  // const rawDbSearchRef = useRef<HTMLDivElement>(null); // Moved to ToolsOverlay/RawDbExplorer

  const [selectedDialects, setSelectedDialects] = usePersistedState<Set<string>>("yc_selected_dialects", new Set(["南勢阿美語", "賽考利克泰雅語"]), {
    serialize: (val) => JSON.stringify(Array.from(val)),
    deserialize: (val) => new Set(JSON.parse(val))
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = usePersistedState("yc_sidebar_collapsed", false);
  const [displayLimit, setDisplayLimit] = useState(100);
  const [searchHistory, setSearchHistory] = usePersistedState<string[]>("yc_search_history", []);
  const [showHistory, setShowHistory] = useState(false);
  const [vs2View, setVs2View] = useState<"table" | "slide">("table");
  const [slideIndex, setSlideIndex] = useState(0);

  // VS-3 Specific UI settings
  const [vs3FontSize, setVs3FontSize] = usePersistedState<number>("yc_vs3_font_size", 18);
  const [vs3CardPadding, setVs3CardPadding] = usePersistedState<number>("yc_vs3_card_padding", 20);
  const [vs3BodyPadding, setVs3BodyPadding] = usePersistedState<number>("yc_vs3_body_padding", 48);
  const [vs3FillWidth, setVs3FillWidth] = usePersistedState<boolean>("yc_vs3_fill_width", false);
  const [vs3CardsPerRow, setVs3CardsPerRow] = usePersistedState<number>("yc_vs3_cards_per_row", 3);

  const [activeTab, setActiveTab] = useState<string>("SENTENCES");
  const [slideCols, setSlideCols] = useState(2);
  const [cardDesign, setCardDesign] = useState<"default" | "inline" | "floating">("default");
  const [sidebarWidth, setSidebarWidth] = usePersistedState("yc_sidebar_width", 240);
  const [filterFontSize, setFilterFontSize] = usePersistedState("yc_filter_font_size", 11);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsTimeout = useRef<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [savedFilters, setSavedFilters] = usePersistedState<SavedFilter[]>("yc_saved_filters", []);
  const [essayId, setEssayId] = useState("32020");
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [dictSource, setDictSource] = useState<"ILRDF" | "MOE">("ILRDF");
  const [dictLayout, setDictLayout] = usePersistedState<"vertical" | "horizontal">("yc_dict_layout", "vertical");
  const [dictColumns, setDictColumns] = usePersistedState<number | "AUTO">("yc_dict_columns", 2);
  const [dictLevel, setDictLevel] = usePersistedState<number | "ALL">("yc_dict_level", "ALL");
  const [dictGenres, setDictGenres] = usePersistedState<string[]>("yc_dict_genres", ["ALL"]);
  const [dictStrict, setDictStrict] = usePersistedState<boolean>("yc_dict_strict", true);
  const [dictDensity, setDictDensity] = usePersistedState<"standard" | "compact" | "preview">("yc_dict_density", "standard");
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);



  const standardDialects = useMemo(() => {
    return Object.values(GLID_FAMILIES).map(f => f[0]).filter(Boolean);
  }, []);

  const sortedAllDialects = useMemo(() => {
    return Object.entries(GLID_FAMILIES)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .flatMap(([_, d]) => d);
  }, []);

  useEffect(() => {
    try {
      fetch('/api/status').then(res => res.json()).then(setDbInfo).catch(console.error);
    } catch (e) { }
  }, []);



  const addToHistory = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== trimmed);
      const next = [trimmed, ...filtered].slice(0, 50);
      return next;
    });
  };

  const handleSearch = async () => {
    if (mode === "DICT" && (selectedDialects.size === 0 || !query.trim())) {
      setDictResults([]);
      setResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      let url = "";
      if (mode === "VS-1") {
        url = `/api/search?mode=VS-1&q=${encodeURIComponent(query)}&module=${modules.join(',')}`;
      } else if (mode === "VS-2") {
        url = `/api/search?mode=VS-2&level=${level}&lesson=${lesson}`;
      } else if (mode === "DICT") {
        url = `/api/search?mode=DICT&q=${encodeURIComponent(query)}&level=${dictLevel}&genre=${dictGenres.join(',')}&strict=${dictStrict}&dialects=${Array.from(selectedDialects).join(',')}&module=${modules.join(',')}`;
      } else if (mode === "EXAMS" || mode === "FLASHCARDS") {
        // Mocking for now as requested or until implementation
        setResults([]);
        setDictResults([]);
        setIsSearching(false);
        return;
      } else {
        url = `/api/search?mode=VS-3&category=${encodeURIComponent(essayId)}&module=${modules[0]}&level=${level}`;
      }
      const res = await fetch(url);
      const data = await res.json();

      if (mode === "DICT") {
        setDictResults(data.results || []);
        setResults([]); // Clear sentence results in DICT mode
      } else {
        setResults(data.results || []);
        setDictResults([]);
      }
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
  }, [mode, query, modules, level, lesson, standardize, essayId, dictLevel, dictGenres, dictStrict, selectedDialects]);

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



  // Click-outside for VS-3 source dropdown — use 'click' not 'mousedown'
  // so the button's own onClick fires first and sets showSources=true before this can close it.
  useEffect(() => {
    if (!showSources || mode !== 'VS-3') return;
    const handler = (e: MouseEvent) => {
      if (vs3SourceRef.current && !vs3SourceRef.current.contains(e.target as Node)) {
        setShowSources(false);
      }
    };
    // Defer listener attachment to next tick to avoid catching the opening click
    const id = setTimeout(() => document.addEventListener('click', handler), 0);
    return () => { clearTimeout(id); document.removeEventListener('click', handler); };
  }, [showSources, mode]);



  const handleHistorySelect = (q: string) => {
    setQuery(q);
    setShowHistory(false);
  };

  const clearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchHistory([]);
  };

  const removeHistoryItem = (e: React.MouseEvent, q: string) => {
    e.stopPropagation();
    setSearchHistory(prev => {
      const next = prev.filter(item => item !== q);
      localStorage.setItem("yc_search_history", JSON.stringify(next));
      return next;
    });
  };



  const cycleTheme = () => {
    const nextIdx = (THEMES.indexOf(theme) + 1) % THEMES.length;
    const next = THEMES[nextIdx];
    setTheme(next);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleUiLang = () => {
    const next = uiLang === "en" ? "zh" : "en";
    setUiLang(next);
  };
   const playAudio = (url: string) => {
    if (!url) return;

    // 0. Stop current audio if playing
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    
    // 1. Repair known broken patterns in Klokah URLs
    let finalUrl = url;
    if (url.startsWith("/")) {
      finalUrl = `https://web.klokah.tw${url}`;
    }
    finalUrl = finalUrl.replace("file.klokah.tw", "web.klokah.tw");
    if (finalUrl.startsWith("http://")) {
      finalUrl = finalUrl.replace("http://", "https://");
    }

    // Dialogue/Essay path repair
    if (finalUrl.includes("klokah.tw") && finalUrl.includes("/sound/") && !finalUrl.includes("/text/")) {
       const match = finalUrl.match(/\/sound\/(\d+)\//);
       if (match) {
         finalUrl = finalUrl.replace("/sound/", "/text/sound/");
       }
    }

    console.log(`[AUDIO_RETRY] Attempting play: ${finalUrl}`);
    const audio = new Audio(finalUrl);
    currentAudioRef.current = audio;

    audio.play().catch(err => {
      console.warn(`[AUDIO_RETRY] Primary failed for ${finalUrl}:`, err.message);
      
      // Fallback: If it has /text/sound/, try without. If not, try with.
      let secondaryUrl = "";
      if (finalUrl.includes("/text/sound/")) {
        secondaryUrl = finalUrl.replace("/text/sound/", "/sound/");
      } else if (finalUrl.includes("/sound/")) {
        secondaryUrl = finalUrl.replace("/sound/", "/text/sound/");
      }

      if (secondaryUrl && secondaryUrl !== finalUrl) {
        console.log(`[AUDIO_RETRY] Trying secondary: ${secondaryUrl}`);
        const fallbackAudio = new Audio(secondaryUrl);
        currentAudioRef.current = fallbackAudio;
        fallbackAudio.play().catch(finalErr => {
          console.error(`[AUDIO_FINAL_FAIL] fallback failed:`, finalErr.message);
          setToastMessage("Audio playback failed. Please try again later.");
          setTimeout(() => setToastMessage(null), 3000);
        });
      } else {
        setToastMessage("Audio playback failed.");
        setTimeout(() => setToastMessage(null), 3000);
      }
    });
  };

  const handleResize = (e: MouseEvent) => {
    const nextWidth = Math.max(200, Math.min(600, e.clientX));
    setSidebarWidth(nextWidth);
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
    let list = results;
    if (showFullOnly) {
      list = list.filter(r => displayColumns.every(col => r[col] && r[col].length > 0));
    }
    if (hideEmpty && displayColumns.length > 0) {
      list = list.filter(r => displayColumns.some(col => r[col] && r[col].length > 0));
    }
    return list;
  }, [results, showFullOnly, hideEmpty, displayColumns]);

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
      <SidebarFilters
        uiLang={uiLang}
        s={s}
        toggleUiLang={toggleUiLang}
        cycleTheme={cycleTheme}
        theme={theme}
        sortedAllDialects={sortedAllDialects}
        standardDialects={standardDialects}
        selectedDialects={selectedDialects}
        setSelectedDialects={setSelectedDialects}
        savedFilters={savedFilters}
        setSavedFilters={setSavedFilters}
        filterFontSize={filterFontSize}
        sidebarWidth={sidebarWidth}
        isSidebarCollapsed={isSidebarCollapsed}
        startResizing={startResizing}
        setMode={setMode as any}
      />

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

        <Header
          mode={mode}
          setMode={setMode as any}
          uiLang={uiLang}
          s={s}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsToolsOpen={setIsToolsOpen}
          isSettingsOpen={isSettingsOpen}
          setIsSettingsOpen={setIsSettingsOpen}
          filterFontSize={filterFontSize}
          setFilterFontSize={setFilterFontSize}
          theme={theme}
          settingsTimeout={settingsTimeout}
          vs3FontSize={vs3FontSize}
          setVs3FontSize={setVs3FontSize}
          vs3CardPadding={vs3CardPadding}
          setVs3CardPadding={setVs3CardPadding}
          vs3BodyPadding={vs3BodyPadding}
          setVs3BodyPadding={setVs3BodyPadding}
        />

        <TopToolbar
          uiLang={uiLang}
          s={UI_STRINGS[uiLang]}
          mode={mode}
          setMode={setMode}
          theme={theme}
          cycleTheme={cycleTheme}
          query={query}
          setQuery={setQuery}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
          searchHistory={searchHistory}
          handleHistorySelect={handleHistorySelect}
          clearHistory={clearHistory}
          removeHistoryItem={removeHistoryItem}
          results={results}
          dictResults={dictResults}
          modules={modules}
          setModules={setModules}
          showSources={showSources}
          setShowSources={setShowSources}
          level={level}
          setLevel={setLevel}
          lesson={lesson}
          setLesson={setLesson}
          standardize={standardize}
          setStandardize={setStandardize}
          showFullOnly={showFullOnly}
          setShowFullOnly={setShowFullOnly}
          essayId={essayId}
          setEssayId={setEssayId}
          vs3SourceRef={vs3SourceRef}
          vs3FontSize={vs3FontSize}
          setVs3FontSize={setVs3FontSize}
          vs3CardPadding={vs3CardPadding}
          setVs3CardPadding={setVs3CardPadding}
          vs3BodyPadding={vs3BodyPadding}
          setVs3BodyPadding={setVs3BodyPadding}
          vs3FillWidth={vs3FillWidth}
          setVs3FillWidth={setVs3FillWidth}
          vs3CardsPerRow={vs3CardsPerRow}
          setVs3CardsPerRow={setVs3CardsPerRow}
          isToolsOpen={isToolsOpen}
          setIsToolsOpen={setIsToolsOpen}
          dictSource={dictSource}
          setDictSource={setDictSource}
          dictLayout={dictLayout}
          setDictLayout={setDictLayout}
          dictColumns={dictColumns}
          setDictColumns={setDictColumns}
          dictLevel={dictLevel}
          setDictLevel={setDictLevel}
          dictGenres={dictGenres}
          setDictGenres={setDictGenres}
          dictStrict={dictStrict}
          setDictStrict={setDictStrict}
          setToastMessage={setToastMessage}
          dictDensity={dictDensity}
          setDictDensity={setDictDensity}
          hideEmpty={hideEmpty}
          setHideEmpty={setHideEmpty}
          displayLimit={displayLimit}
          setDisplayLimit={setDisplayLimit}
          filteredResults={filteredResults}
        />

        {/* TOOLS OVERLAY */}
        <ToolsOverlay
          isOpen={isToolsOpen}
          onClose={() => setIsToolsOpen(false)}
          toolsTab={toolsTab}
          setToolsTab={setToolsTab}
          handleCopy={handleCopy}
          copiedId={copiedId}
        />

        {/* CONTENT AREA */}
        <div className={`flex-1 overflow-auto custom-scrollbar relative theme-gradient-bg`}>
          {mode === "DICT" ? (
            <VsDictView 
              results={dictResults}
              uiLang={uiLang}
              s={s}
              playAudio={playAudio}
              layout={dictLayout}
              columns={dictColumns}
              dictDensity={dictDensity}
              selectedDialects={selectedDialects}
            />
          ) : mode === "EXAMS" || mode === "FLASHCARDS" ? (
            <div className="flex flex-col items-center justify-center h-full opacity-60">
              <Hexagon className="w-16 h-16 text-[var(--accent)] mb-4" />
              <div className="font-mono text-sm uppercase tracking-widest text-[var(--accent)]">
                {mode === "EXAMS" ? "EXAMS MODULE COMING SOON" : "FLASHCARDS MODULE COMING SOON"}
              </div>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-60">
              <div className="relative mb-12">
                <div className="absolute inset-0 bg-[var(--accent)] blur-3xl opacity-10 animate-pulse"></div>
                <Hexagon className="w-24 h-24 text-[var(--accent)] animate-spin-slow relative z-10" />
              </div>
              <div className="font-mono text-xs uppercase tracking-[0.4em] text-[var(--accent)] animate-pulse">
                {mode === "VS-1" ? s.waitingMode1 : s.waitingMode2}
              </div>
            </div>
          ) : mode === "VS-2" && vs2View === "slide" ? (
            <Vs2SlideView
              filteredResults={filteredResults}
              slideIndex={slideIndex}
              setSlideIndex={setSlideIndex}
              slideCols={slideCols}
              setSlideCols={setSlideCols}
              displayColumns={displayColumns}
              uiLang={uiLang}
              s={s}
              handleCopy={handleCopy}
              copiedId={copiedId}
              playAudio={playAudio}
            />
          ) : mode === "VS-3" ? (
            <Vs3EssayView
              results={results}
              filteredResults={filteredResults}
              displayColumns={displayColumns}
              uiLang={uiLang}
              s={s}
              essayId={essayId}
              sourceLabel={getSourceLabel(modules[0] || "essay")}
              playAudio={playAudio}
              fontSize={vs3FontSize}
              cardPadding={vs3CardPadding}
              bodyPadding={vs3BodyPadding}
              fillWidth={vs3FillWidth}
              cardsPerRow={vs3CardsPerRow}
            />
          ) : (
            <Vs1Matrix 
              pagedResults={pagedResults}
              filteredResults={filteredResults}
              displayColumns={displayColumns}
              displayLimit={displayLimit}
              setDisplayLimit={setDisplayLimit}
              uiLang={uiLang}
              s={s}
              handleCopy={handleCopy}
              copiedId={copiedId}
              playAudio={playAudio}
              getRowText={(r) => r.zh}
              getColText={(col) => getDialectName(col, uiLang)}
            />
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


    </div>
  );
}
