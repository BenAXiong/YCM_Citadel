"use client";

import React from 'react';
import { Check, Layers } from "lucide-react";
import { VS3_SOURCES } from "@/lib/sources";
import { UILang, UIStrings } from "@/types";
import geometryData from "@/lib/corpus_geometry.json";

interface Vs3ToolbarProps {
  uiLang: UILang;
  s: UIStrings;
  modules: string[];
  setModules: (val: string[]) => void;
  showSources: boolean;
  setShowSources: (val: boolean) => void;
  essayId: string;
  setEssayId: (val: string) => void;
  vs3SourceRef: React.RefObject<HTMLDivElement | null>;
  level: number;
  setLevel: (val: number) => void;
  vs3FillWidth: boolean;
  setVs3FillWidth: (val: boolean) => void;
  vs3CardsPerRow: number;
  setVs3CardsPerRow: (val: number) => void;
}

export default function Vs3Toolbar({
  uiLang, s, modules, setModules, showSources, setShowSources, essayId, setEssayId, vs3SourceRef, level, setLevel,
  vs3FillWidth, setVs3FillWidth, vs3CardsPerRow, setVs3CardsPerRow
}: Vs3ToolbarProps) {
  
  const currentModule = modules[0] || "essay";
  
  const getSourceLabelLoc = (val: string) => {
    switch(val) {
      case 'essay': return s.essay;
      case 'dialogue': return s.dialogue;
      case 'nine_year': return s.nineYear;
      case 'twelve': return s.twelve;
      case 'grmpts': return s.grmpts; // Already "Patterns" in i18n
      default: return val.toUpperCase();
    }
  };
  
  // Extract level/lesson from category string like "Level 1 Lesson 1" or "Level 1 Class 1"
  const getParts = (cat: string) => {
    const m = cat.match(/Level (\d+) (?:Lesson|Class) (\d+)/);
    if (m) return { level: m[1], lesson: m[2] };
    return { level: "1", lesson: "1" };
  };

  const { level: currentLevel, lesson: currentLesson } = getParts(essayId);

  // Reset essayId if the module changes
  React.useEffect(() => {
    if (currentModule === "essay" && !geometryData.essay.some(t => t.title_zh === essayId)) {
        setEssayId(geometryData.essay[0]?.title_zh || "");
    }
    else if (currentModule === "dialogue" && !geometryData.dialogue.some(t => t.title_zh === essayId)) {
        setEssayId(geometryData.dialogue[0]?.title_zh || "");
    }
    else if (currentModule === "nine_year" && !essayId.includes("Class")) setEssayId("Level 1 Class 1");
    else if (currentModule === "twelve" && !essayId.includes("Lesson")) setEssayId("Level 1 Lesson 1");
    else if (currentModule === "grmpts" && !essayId.startsWith("t")) setEssayId("t1");
  }, [currentModule]);

  return (
    <>
      <div ref={vs3SourceRef} className="flex-shrink-0 relative">
        <button
          onClick={() => setShowSources(!showSources)}
          className={`flex items-center space-x-3 px-4 py-2 rounded-full border font-mono text-[12px] uppercase tracking-widest transition-all duration-300 w-56 justify-center bg-[var(--accent)] text-black border-black shadow-[0_4px_15px_rgba(var(--accent-rgb),0.5)] hover:shadow-[0_8px_25px_rgba(var(--accent-rgb),0.8)] ${showSources ? 'scale-95' : ''}`}
        >
          <Layers className="w-4 h-4 shrink-0" />
          <span className="font-sans font-black truncate">{getSourceLabelLoc(currentModule)}</span>
        </button>

        {showSources && (
          <div className="absolute top-full left-0 mt-2 p-2 bg-[var(--bg-panel)] border border-[var(--border-dark)] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-[200] min-w-[220px] flex flex-col space-y-1 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-md">
            {VS3_SOURCES.map((m) => {
              const isActive = modules.includes(m.value);
              return (
                <button
                  key={m.value}
                  onClick={() => {
                    setModules([m.value]);
                    setShowSources(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg font-mono text-[11px] font-bold transition-all ${isActive ? 'bg-[var(--accent)] text-black' : 'text-[var(--text-sub)] hover:bg-[var(--bg-highlight)] hover:text-[var(--text-main)]'}`}
                >
                  <span className="font-sans">{getSourceLabelLoc(m.value)}</span>
                  {isActive && <Check className="w-3.5 h-3.5" />}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 gap-1 overflow-hidden">
        {/* Curricula: Level & Class selectors */}
        {(currentModule === "nine_year" || currentModule === "twelve") && (
          <>
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
              <span className="text-[10px] font-black text-[var(--accent)] mr-2 opacity-60 uppercase">{s.level}</span>
              {(geometryData as any)[currentModule].levels.map((lvl: string) => (
                <button
                  key={lvl}
                  onClick={() => {
                    const separator = currentModule === "nine_year" ? "Class" : "Lesson";
                    setEssayId(`Level ${lvl} ${separator} ${currentLesson}`);
                  }}
                  className={`min-w-[28px] px-2 py-0.5 rounded font-mono text-[11px] font-bold transition-all ${currentLevel === lvl
                    ? 'bg-[var(--accent)] text-black'
                    : 'border border-[var(--border-dark)] text-[var(--text-sub)] hover:border-[var(--accent)]'
                    }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
              <span className="text-[10px] font-black text-[var(--accent)] mr-2 opacity-60 uppercase">CLASS</span>
              {(geometryData as any)[currentModule].classes.map((cla: number) => (
                <button
                  key={cla}
                  onClick={() => {
                    const separator = currentModule === "nine_year" ? "Class" : "Lesson";
                    setEssayId(`Level ${currentLevel} ${separator} ${cla}`);
                  }}
                  className={`min-w-[28px] px-2 py-0.5 rounded font-mono text-[11px] font-bold transition-all ${currentLesson === String(cla)
                    ? 'bg-[var(--accent)] text-black'
                    : 'border border-[var(--border-dark)] text-[var(--text-sub)] hover:border-[var(--accent)]'
                    }`}
                >
                  {cla}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Patterns (Grammar): Level & Type selectors */}
        {currentModule === "grmpts" && (
          <>
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
              <span className="text-[11px] font-black text-[var(--accent)] mr-2 opacity-60 uppercase">{s.level}</span>
              {(geometryData as any).grmpts.levels.map((lvl: string) => (
                <button
                  key={lvl}
                  onClick={() => setLevel(parseInt(lvl))}
                  className={`min-w-[32px] px-2 py-0.5 rounded font-mono text-[11px] font-bold transition-all ${level === parseInt(lvl)
                    ? 'bg-[var(--accent)] text-black'
                    : 'border border-[var(--border-dark)] text-[var(--text-sub)] hover:border-[var(--accent)]'
                    }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
              <span className="text-[11px] font-black text-[var(--accent)] mr-2 opacity-60 uppercase">TYPE</span>
              {(geometryData as any).grmpts.types.map((tid: string) => (
                <button
                  key={tid}
                  onClick={() => setEssayId(tid)}
                  className={`min-w-[32px] px-2 py-0.5 rounded font-mono text-[11px] font-bold transition-all ${essayId === tid
                    ? 'bg-[var(--accent)] text-black'
                    : 'border border-[var(--border-dark)] text-[var(--text-sub)] hover:border-[var(--accent)]'
                    }`}
                >
                  {tid.toUpperCase()}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Narrative: Topic selector (Structured by Level) */}
        {(currentModule === "essay" || currentModule === "dialogue") && (
          <div className="flex flex-col gap-0.5 py-0.5">
             {[
               { range: [0, 19], label: uiLang === 'en' ? 'INTRO' : '初級' },
               { range: [20, 39], label: uiLang === 'en' ? 'INTER' : '中級' },
               { range: [40, 59], label: uiLang === 'en' ? 'UPPER' : '中高' }
             ].map((grp, gidx) => (
               <div key={gidx} className="flex items-center gap-3">
                 <span className="text-[10px] font-black text-[var(--accent)] opacity-50 w-12 shrink-0 leading-none">{grp.label}</span>
                 <div className="flex flex-wrap gap-1 max-h-[32px] overflow-y-auto scrollbar-none items-center">
                    {(geometryData as any)[currentModule].slice(grp.range[0], grp.range[1]+1).map((item: any) => {
                      const idx = (geometryData as any)[currentModule].indexOf(item);
                      return (
                        <button
                          key={item.title_zh}
                          onClick={() => setEssayId(item.title_zh)}
                          className={`w-5 h-4 py-0 rounded font-mono text-[10px] font-bold transition-all whitespace-nowrap leading-none flex items-center justify-center ${essayId === item.title_zh
                            ? 'bg-[var(--accent)] text-black'
                            : 'border border-[var(--border-dark)] text-[var(--text-sub)] hover:border-[var(--accent)]'
                            }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>

      {/* VS-3 PRECISION CONTROLS ON THE RIGHT */}
      <div className="flex items-center gap-3 pl-4 border-l border-[var(--border-dark)]">
        <button
          onClick={() => setVs3FillWidth(!vs3FillWidth)}
          className={`px-3 py-1.5 rounded border font-mono text-[10px] font-black transition-all ${vs3FillWidth 
            ? 'bg-[var(--accent)] text-black border-black' 
            : 'text-[var(--text-sub)] border-[var(--border-dark)] hover:border-[var(--accent)] hover:text-[var(--text-main)]'}`}
        >
          {uiLang === 'en' ? (vs3FillWidth ? 'FILL_W' : 'NARROW') : (vs3FillWidth ? '寬幅' : '窄幅')}
        </button>

        <div className="flex items-center gap-1.5 bg-[var(--bg-deep)] p-1 rounded-lg border border-[var(--border-dark)]">
          <span className="text-[9px] font-black text-[var(--accent)] px-1.5 opacity-40">ROW</span>
          {[1, 2, 3, 4, 6, 8].map(n => (
            <button
              key={n}
              onClick={() => setVs3CardsPerRow(n)}
              className={`w-6 h-6 rounded flex items-center justify-center font-mono text-[10px] font-black transition-all ${vs3CardsPerRow === n 
                ? 'bg-[var(--accent)] text-black shadow-lg' 
                : 'text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-[var(--bg-panel)]'}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
