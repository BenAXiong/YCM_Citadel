"use client";

import React from 'react';
import { Hexagon, Languages, Palette, Bookmark, Check, Trash2, Square, ChevronDown, ChevronRight, CheckSquare } from "lucide-react";
import { GLID_FAMILIES, GLID_NAMES, GLID_NAMES_EN, getDialectName } from "@/lib/dialects";
import { UILang, SavedFilter, UIStrings } from "@/types";

interface SidebarFiltersProps {
  uiLang: UILang;
  s: UIStrings;
  toggleUiLang: () => void;
  cycleTheme: () => void;
  theme: string;
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
  const [showOptions, setShowOptions] = React.useState(false);
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    for (const [glid, dialects] of Object.entries(GLID_FAMILIES)) {
      if (dialects.some(d => selectedDialects.has(d))) {
        initialExpanded[glid] = true;
      }
    }
    setExpandedGroups(prev => ({ ...initialExpanded, ...prev }));
  }, [selectedDialects]);
  const toggleDialect = (d: string) => {
    const next = new Set(selectedDialects);
    if (next.has(d)) next.delete(d);
    else next.add(d);
    setSelectedDialects(next);
  };

  const toggleGroupExpand = (glid: string) => {
    setExpandedGroups(prev => ({ ...prev, [glid]: !prev[glid] }));
  };

  const toggleAllInFamily = (glid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const familyDialects = GLID_FAMILIES[glid] || [];
    const allSelected = familyDialects.every(d => selectedDialects.has(d));
    const next = new Set(selectedDialects);
    if (allSelected) familyDialects.forEach(d => next.delete(d));
    else familyDialects.forEach(d => next.add(d));
    setSelectedDialects(next);
  };

  if (isSidebarCollapsed) return (
    <aside style={{ width: 0 }} className="flex-shrink-0 border-r border-[var(--border-dark)] bg-[var(--bg-panel)] flex flex-col h-full z-20 transition-all duration-300 relative" />
  );

  return (
    <aside
      style={{ width: sidebarWidth }}
      className={`flex-shrink-0 border-r border-[var(--border-dark)] bg-[var(--bg-panel)] flex flex-col h-full z-20 shadow-xl transition-all duration-300 relative overflow-visible`}
    >
      <div
        onMouseDown={startResizing}
        className="absolute -right-1 top-0 bottom-0 w-2 cursor-col-resize z-30 hover:bg-[var(--accent)] transition-colors opacity-0 hover:opacity-100"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--bg-panel)] pointer-events-none mix-blend-overlay"></div>
      <div className="p-4 border-b border-[var(--border-dark)] flex flex-col space-y-4 relative z-[50]" style={{ overflow: 'visible' }}>
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

        <div className="p-3 border-b border-[var(--border-dark)] flex space-x-2 font-mono relative items-center z-[120]" style={{ overflow: 'visible' }}>
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

      <div className="overflow-y-auto flex-1 p-2 relative z-0 custom-scrollbar-left" dir="rtl">
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
    </aside>
  );
}
