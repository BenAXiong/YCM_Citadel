"use client";

import React from 'react';
import { CheckSquare, Loader2 } from "lucide-react";
import { UILang, UIStrings } from "@/types";
import Vs1Toolbar from "./toolbars/Vs1Toolbar";
import Vs2Toolbar from "./toolbars/Vs2Toolbar";
import Vs3Toolbar from "./toolbars/Vs3Toolbar";
import VsDictToolbar from "./toolbars/VsDictToolbar";

interface TopToolbarProps {
  mode: "VS-1" | "VS-2" | "VS-3" | "DICT" | "EXAMS" | "FLASHCARDS";
  uiLang: UILang;
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
  level: number;
  setLevel: (val: number) => void;
  lesson: number;
  setLesson: (val: number) => void;
  modules: string[];
  setModules: (val: string[]) => void;
  showSources: boolean;
  setShowSources: (val: boolean) => void;
  essayId: string;
  setEssayId: (val: string) => void;
  isSearching: boolean;
  showFullOnly: boolean;
  setShowFullOnly: (val: boolean) => void;
  standardize: boolean;
  setStandardize: (val: boolean) => void;
  hideEmpty: boolean;
  setHideEmpty: (val: boolean) => void;
  vs3SourceRef: React.RefObject<HTMLDivElement | null>;
  vs3FillWidth: boolean;
  setVs3FillWidth: (val: boolean) => void;
  vs3CardsPerRow: number;
  setVs3CardsPerRow: (val: number) => void;
  dictResults: any[];
  dictSource: "ILRDF" | "MOE";
  setDictSource: (val: "ILRDF" | "MOE") => void;
  dictLayout: "vertical" | "horizontal";
  setDictLayout: (val: "vertical" | "horizontal") => void;
  dictColumns: number;
  setDictColumns: (val: number) => void;
  setToastMessage: (msg: string | null) => void;
}

export default function TopToolbar({
  mode,
  uiLang,
  s,
  query,
  setQuery,
  showHistory,
  setShowHistory,
  searchHistory,
  handleHistorySelect,
  clearHistory,
  removeHistoryItem,
  filteredResults,
  level,
  setLevel,
  lesson,
  setLesson,
  modules,
  setModules,
  showSources,
  setShowSources,
  essayId,
  setEssayId,
  isSearching,
  showFullOnly,
  setShowFullOnly,
  standardize,
  setStandardize,
  hideEmpty,
  setHideEmpty,
  vs3SourceRef,
  vs3FillWidth,
  setVs3FillWidth,
  vs3CardsPerRow,
  setVs3CardsPerRow,
  dictResults,
  dictSource,
  setDictSource,
  dictLayout,
  setDictLayout,
  dictColumns,
  setDictColumns,
  setToastMessage,
}: TopToolbarProps) {
  return (
    <div className="h-14 border-b border-[var(--border-dark)] flex items-center px-4 justify-between bg-[var(--bg-sub)] z-[95] sticky top-16 backdrop-blur-md">
      <div className="flex items-center space-x-6 flex-1">
        {mode === "VS-1" && (
          <Vs1Toolbar
            s={s}
            query={query}
            setQuery={setQuery}
            showHistory={showHistory}
            setShowHistory={setShowHistory}
            searchHistory={searchHistory}
            handleHistorySelect={handleHistorySelect}
            clearHistory={clearHistory}
            removeHistoryItem={removeHistoryItem}
            filteredResults={filteredResults}
            modules={modules}
            setModules={setModules}
            showSources={showSources}
            setShowSources={setShowSources}
          />
        )}
        {mode === "VS-2" && (
          <Vs2Toolbar
            s={s}
            level={level}
            setLevel={setLevel}
            lesson={lesson}
            setLesson={setLesson}
            modules={modules}
            setModules={setModules}
            showSources={showSources}
            setShowSources={setShowSources}
          />
        )}
        {mode === "VS-3" && (
          <div className="flex items-center gap-4 w-full min-w-0 flex-1">
            <Vs3Toolbar
              uiLang={uiLang}
              s={s}
              modules={modules}
              setModules={setModules}
              showSources={showSources}
              setShowSources={setShowSources}
              essayId={essayId}
              setEssayId={setEssayId}
              vs3SourceRef={vs3SourceRef}
              level={level}
              setLevel={setLevel}
              vs3FillWidth={vs3FillWidth}
              setVs3FillWidth={setVs3FillWidth}
              vs3CardsPerRow={vs3CardsPerRow}
              setVs3CardsPerRow={setVs3CardsPerRow}
            />
          </div>
        )}

        {mode === "DICT" && (
          <VsDictToolbar
            s={s}
            query={query}
            setQuery={setQuery}
            showHistory={showHistory}
            setShowHistory={setShowHistory}
            searchHistory={searchHistory}
            handleHistorySelect={handleHistorySelect}
            clearHistory={clearHistory}
            removeHistoryItem={removeHistoryItem}
            dictResults={dictResults}
            dictSource={dictSource}
            setDictSource={setDictSource}
            dictLayout={dictLayout}
            setDictLayout={setDictLayout}
            dictColumns={dictColumns}
            setDictColumns={setDictColumns}
            setToastMessage={setToastMessage}
          />
        )}

        {isSearching && <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)] ml-2" />}
      </div>

      {(mode !== "VS-3" && mode !== "DICT" && mode !== "EXAMS" && mode !== "FLASHCARDS") && (
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

          <label className="flex items-center space-x-2 font-mono text-[10px] cursor-pointer bg-[var(--bg-panel)] border border-[var(--border-dark)] px-3 py-1 rounded hover:border-[var(--accent)] transition group">
            <div className={`w-3 h-3 flex items-center justify-center rounded-sm transition ${hideEmpty ? 'bg-[var(--accent)]' : 'bg-[var(--bg-sub)] border border-[var(--border-dark)]'}`}>{hideEmpty && <CheckSquare className="w-2.5 h-2.5 text-black" />}</div>
            <span className={`uppercase tracking-widest font-bold ${hideEmpty ? 'text-[var(--accent)]' : 'text-[var(--text-sub)] group-hover:text-[var(--text-main)]'}`}>{s.hideEmpty}</span>
            <input type="checkbox" checked={hideEmpty} onChange={(e) => setHideEmpty(e.target.checked)} className="hidden" />
          </label>
        </div>
      )}
    </div>
  );
}
