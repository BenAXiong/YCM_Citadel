"use client";

import React from 'react';
import { Hexagon, Languages, Square } from "lucide-react";
import { GLID_FAMILIES } from "@/lib/dialects";
import { UILang, SavedFilter, UIStrings, Theme } from "@/types";
import { DialectTree } from './sidebar/DialectTree';
import { FilterPresets } from './sidebar/FilterPresets';
import { ThemeCustomEditor } from './sidebar/ThemeCustomEditor';
import { ThemeIris } from './sidebar/ThemeIris';

interface SidebarFiltersProps {
  uiLang: UILang;
  s: UIStrings;
  toggleUiLang: () => void;
  cycleTheme: () => void;
  theme: Theme;
  previewTheme: Theme | null;
  setTheme: (val: Theme) => void;
  setPreviewTheme: (val: Theme | null) => void;
  setPreviewColors: (val: Record<string, string> | null) => void;
  customColors: Record<string, string>;
  setCustomColors: (val: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
  savedThemes: Array<{ name: string, colors: Record<string, string> }>;
  setSavedThemes: (val: Array<{ name: string, colors: Record<string, string> }> | ((prev: Array<{ name: string, colors: Record<string, string> }>) => Array<{ name: string, colors: Record<string, string> }>)) => void;
  sortedAllDialects: string[];
  standardDialects: string[];
  selectedDialects: Set<string>;
  setSelectedDialects: (val: Set<string>) => void;
  savedFilters: SavedFilter[];
  setSavedFilters: (val: SavedFilter[]) => void;
  filterFontSize: number;
  sidebarWidth: number;
  isSidebarCollapsed: boolean;
  startResizing: () => void;
  setMode: (mode: any) => void;
}

export default function SidebarFilters({
  uiLang,
  s,
  toggleUiLang,
  cycleTheme,
  theme,
  previewTheme,
  setTheme,
  setPreviewTheme,
  setPreviewColors,
  customColors,
  setCustomColors,
  savedThemes,
  setSavedThemes,
  sortedAllDialects,
  standardDialects,
  selectedDialects,
  setSelectedDialects,
  savedFilters,
  setSavedFilters,
  filterFontSize,
  sidebarWidth,
  isSidebarCollapsed,
  startResizing,
  setMode
}: SidebarFiltersProps) {
  const [showThemePicker, setShowThemePicker] = React.useState(false);
  const [showCustomEditor, setShowCustomEditor] = React.useState(false);
  const pickerTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({});

  const THEMES_ORDER = ["sober", "cidal", "ycm", "matrix", "rainbow"];
  const THEME_FULL_COLORS: Record<string, Record<string, string>> = {
    matrix: { '--bg-deep': '#080808', '--bg-panel': '#111', '--accent': '#00ff88', '--text-main': '#e0e0e0' },
    sober: { '--bg-deep': '#121212', '--bg-panel': '#1e1e1e', '--accent': '#00bcd4', '--text-main': '#fff' },
    ycm: { 
      '--bg-deep': '#0a0808', 
      '--bg-panel': '#141212', 
      '--accent': '#f39200', 
      '--text-main': '#fcfcfc',
      '--multi-1': '#E4141A', // Red
      '--multi-2': '#94C12C'  // Green
    },
    // ycm_legacy: { '--bg-deep': '#0a0e0a', '--bg-panel': '#121812', '--accent': '#ff8c00', '--text-main': '#f0f4f0' },
    cidal: { '--bg-deep': '#1a1a14', '--bg-panel': '#25251d', '--accent': '#ffcc33', '--text-main': '#fff5e6' },
    rainbow: { '--bg-deep': '#050510', '--bg-panel': '#0a0a1a', '--accent': '#ff00ff', '--text-main': '#ffffff' },
  };

  React.useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    for (const [glid, dialects] of Object.entries(GLID_FAMILIES)) {
      if (dialects.some(d => selectedDialects.has(d))) {
        initialExpanded[glid] = true;
      }
    }
    setExpandedGroups(prev => ({ ...initialExpanded, ...prev }));
  }, [selectedDialects]);
  const toggleGroupExpand = (glid: string) => {
    setExpandedGroups(prev => ({ ...prev, [glid]: !prev[glid] }));
  };

  if (isSidebarCollapsed) return (
    <aside style={{ width: 0 }} className="flex-shrink-0 border-r border-[var(--border-dark)] bg-[var(--bg-panel)] flex flex-col h-full z-20 transition-all duration-300 relative" />
  );

  return (
    <aside
      style={{ width: sidebarWidth }}
      className={`flex-shrink-0 border-r border-[var(--border-dark)] bg-[var(--bg-panel)] flex flex-col h-full z-[110] shadow-xl transition-all duration-300 relative overflow-visible`}
    >
      <div
        onMouseDown={startResizing}
        className="absolute -right-1 top-0 bottom-0 w-2 cursor-col-resize z-30 hover:bg-[var(--accent)] transition-colors opacity-0 hover:opacity-100"
      />
      <div className="absolute inset-0 bg-[var(--bg-deep)] pointer-events-none opacity-50"></div>
      <div className="p-4 border-b border-[var(--border-dark)] flex flex-col space-y-4 relative z-[50]" style={{ overflow: 'visible' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[var(--accent)] cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setMode("VS-1")}>
            <Hexagon className="w-5 h-5 fill-current" />
            <h1 className="font-mono text-xs tracking-widest font-black uppercase">{s.hub}</h1>
          </div>
          <div className="flex space-x-1 items-center relative">
            <button onClick={toggleUiLang} className="p-1.5 hover:bg-[var(--bg-highlight)] rounded-full transition text-[var(--text-sub)] hover:text-[var(--text-main)]" title="Toggle UI Language"><Languages className="w-3.5 h-3.5" /></button>
            <div
              className="relative"
            >
              <ThemeIris
                theme={theme}
                cycleTheme={cycleTheme}
                setTheme={setTheme}
                setPreviewTheme={setPreviewTheme}
                setPreviewColors={setPreviewColors}
                setCustomColors={setCustomColors as any}
                customColors={customColors}
                savedThemes={savedThemes}
                THEMES_ORDER={THEMES_ORDER}
                THEME_FULL_COLORS={THEME_FULL_COLORS}
                showThemePicker={showThemePicker}
                setShowThemePicker={setShowThemePicker}
                setShowCustomEditor={setShowCustomEditor}
                pickerTimeout={pickerTimeout}
              />

              {/* CUSTOM THEME EDITOR - POSITIONED TO THE RIGHT */}
              {showCustomEditor && (theme === 'custom' || !THEMES_ORDER.includes(theme) || previewTheme === 'custom') && (
                <ThemeCustomEditor
                  theme={theme}
                  previewTheme={previewTheme}
                  customColors={customColors}
                  setCustomColors={setCustomColors}
                  setShowCustomEditor={setShowCustomEditor}
                  setShowThemePicker={setShowThemePicker}
                  setTheme={setTheme}
                  THEMES_ORDER={THEMES_ORDER}
                  setSavedThemes={setSavedThemes}
                  pickerTimeout={pickerTimeout}
                />
              )}
            </div>
          </div>
        </div>

        <div className="p-3 border-b border-[var(--border-dark)] flex space-x-2 font-mono relative items-center z-[120]" style={{ overflow: 'visible' }}>
          <FilterPresets
            s={s}
            sortedAllDialects={sortedAllDialects}
            standardDialects={standardDialects}
            selectedDialects={selectedDialects}
            setSelectedDialects={setSelectedDialects}
            savedFilters={savedFilters}
            setSavedFilters={setSavedFilters}
          />
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

      <div className="overflow-y-auto flex-1 p-2 relative z-0 custom-scrollbar-left" dir="rtl">
        <DialectTree
          uiLang={uiLang}
          selectedDialects={selectedDialects}
          setSelectedDialects={setSelectedDialects}
          expandedGroups={expandedGroups}
          toggleGroupExpand={toggleGroupExpand}
          filterFontSize={filterFontSize}
        />
      </div>
    </aside>
  );
}
