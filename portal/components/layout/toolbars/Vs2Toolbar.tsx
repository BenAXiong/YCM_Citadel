"use client";

import React from 'react';
import { Check, Layers } from "lucide-react";
import { VS2_SOURCES } from "@/lib/sources";
import { UIStrings } from "@/types";

interface Vs2ToolbarProps {
  s: UIStrings;
  level: number;
  setLevel: (val: number) => void;
  lesson: number;
  setLesson: (val: number) => void;
  modules: string[];
  setModules: (val: string[]) => void;
  showSources: boolean;
  setShowSources: (val: boolean) => void;
}

export default function Vs2Toolbar({
  s, level, setLevel, lesson, setLesson,
  modules, setModules, showSources, setShowSources
}: Vs2ToolbarProps) {
  return (
    <>
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

      <div className="relative">
        <button
          onClick={() => setShowSources(!showSources)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border font-mono text-[10px] uppercase tracking-widest transition-all duration-300 w-32 justify-center ${showSources ? 'bg-[var(--accent)] text-black border-black shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)]' : 'bg-[var(--bg-panel)] text-[var(--text-sub)] border-[var(--border-dark)] hover:border-[var(--accent)]'}`}
        >
          <Layers className="w-3.5 h-3.5 shrink-0" />
          <span className="font-black truncate">{modules.includes("ALL") ? "ALL_SOURCES" : `${modules.length}_ACTIVE`}</span>
        </button>

        {showSources && (
          <div className="absolute top-full left-0 mt-2 p-2 bg-[var(--bg-panel)] border border-[var(--border-dark)] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-[200] min-w-[200px] flex flex-col space-y-1 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-md">
            {VS2_SOURCES.map((m) => {
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
                    setShowSources(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg font-mono text-[10px] font-bold transition-all ${isActive ? 'bg-[var(--accent)] text-black' : 'text-[var(--text-sub)] hover:bg-[var(--bg-highlight)] hover:text-[var(--text-main)]'}`}
                >
                  <span>{m.label}</span>
                  {isActive && <Check className="w-3 h-3" />}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </>
  );
}
