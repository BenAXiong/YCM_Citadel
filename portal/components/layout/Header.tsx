"use client";

import React from 'react';
import { Hexagon, LayoutGrid, Settings, Trash2, User, ChevronDown, LogIn, UserPlus } from "lucide-react";
import { Theme, UILang, UIStrings } from "@/types";

interface HeaderProps {
  mode: "VS-1" | "VS-2" | "VS-3" | "DICT" | "EXAMS" | "FLASHCARDS";
  setMode: (mode: "VS-1" | "VS-2" | "VS-3" | "DICT" | "EXAMS" | "FLASHCARDS") => void;
  uiLang: UILang;
  s: UIStrings;
  isSidebarCollapsed: boolean;
  setIsToolsOpen: (val: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (val: boolean) => void;
  filterFontSize: number;
  setFilterFontSize: (val: number | ((prev: number) => number)) => void;
  theme: Theme;
  settingsTimeout: React.RefObject<any>;
  vs3FontSize: number;
  setVs3FontSize: (val: number | ((prev: number) => number)) => void;
  vs3CardPadding: number;
  setVs3CardPadding: (val: number | ((prev: number) => number)) => void;
  vs3BodyPadding: number;
  setVs3BodyPadding: (val: number | ((prev: number) => number)) => void;
}

export default function Header({
  mode,
  setMode,
  uiLang,
  s,
  isSidebarCollapsed,
  setIsToolsOpen,
  isSettingsOpen,
  setIsSettingsOpen,
  filterFontSize,
  setFilterFontSize,
  theme,
  settingsTimeout,
  vs3FontSize,
  setVs3FontSize,
  vs3CardPadding,
  setVs3CardPadding,
  vs3BodyPadding,
  setVs3BodyPadding
}: HeaderProps) {
  return (
    <header className="h-16 border-b border-[var(--border-dark)] flex items-center px-6 justify-between bg-[var(--bg-panel)] z-[105] shadow-md sticky top-0 backdrop-blur-md">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--accent)] via-[var(--accent)]/50 to-transparent"></div>
      <div className="flex items-center space-x-3 text-[var(--accent)] group cursor-pointer" onClick={() => setMode("VS-1")}>
        {isSidebarCollapsed && (
          <>
            <Hexagon className="w-6 h-6 fill-current transition-transform group-hover:rotate-12" />
            <h1 className="font-mono text-xl font-black tracking-tighter uppercase hidden md:block animate-in fade-in slide-in-from-left-4 duration-500">{s.hub}</h1>
          </>
        )}
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
        <div className="flex bg-[var(--bg-sub)] p-1 rounded-xl border border-[var(--border-dark)] shadow-inner">
          {["DICT", "EXAMS", "FLASHCARDS"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m as any)}
              className={`w-24 py-1.5 rounded-lg font-mono text-xs font-bold transition-all duration-300 ${mode === m ? 'bg-[var(--btn-grad,var(--accent))] text-black shadow-lg translate-y-[-1px]' : 'text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-[var(--bg-highlight)]'}`}
            >
              {m === "DICT" ? s.dict : m === "EXAMS" ? s.exams : m === "FLASHCARDS" ? s.flashcards : m}
            </button>
          ))}
        </div>

        <div className="w-[1px] h-6 bg-[var(--border-dark)] mx-10 opacity-50" />

        <div className="flex bg-[var(--bg-sub)] p-1 rounded-xl border border-[var(--border-dark)] shadow-inner">
          {["VS-1", "VS-2", "VS-3"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m as any)}
              className={`w-24 py-1.5 rounded-lg font-mono text-xs font-bold transition-all duration-300 ${mode === m ? 'bg-[var(--btn-grad,var(--accent))] text-black shadow-lg translate-y-[-1px]' : 'text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-[var(--bg-highlight)]'}`}
            >
              {m}
            </button>
          ))}
        </div>
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
        <div 
          className="relative"
          onMouseEnter={() => { if(settingsTimeout.current) clearTimeout(settingsTimeout.current); setIsSettingsOpen(true); }}
          onMouseLeave={() => { settingsTimeout.current = setTimeout(() => setIsSettingsOpen(false), 300); }}
        >
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-2 rounded-full transition ${isSettingsOpen ? 'bg-[var(--accent)] text-black shadow-lg translate-y-[-1px]' : 'hover:bg-[var(--bg-highlight)] text-[var(--text-sub)] hover:text-[var(--text-main)]'}`}
            title="Interface Settings"
          >
            <Settings className={`w-5 h-5 ${isSettingsOpen ? 'animate-spin-slow' : ''}`} />
          </button>
          {isSettingsOpen && (
            <div className="absolute top-full right-0 mt-3 p-5 bg-[var(--bg-panel)] border border-[var(--border-dark)] rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.9)] z-[200] w-64 space-y-5 opacity-100 backdrop-blur-2xl border-t-2 border-t-[var(--accent)] animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between border-b border-[var(--border-dark)] pb-3 mb-2">
                <div className="text-[10px] text-[var(--accent)] uppercase font-mono tracking-[0.3em] font-black">System Preferences</div>
                <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[9px] text-[var(--text-sub)] uppercase font-mono opacity-50 tracking-widest">
                  <span>Global Typography</span>
                  <span>{filterFontSize}px</span>
                </div>
                <div className="flex items-center justify-between font-mono bg-[var(--bg-sub)] rounded-xl p-1 border border-[var(--border-dark)] shadow-inner">
                  <button onClick={() => { setFilterFontSize(f => Math.max(8, Number(f) - 1)); }} className="w-10 h-10 flex items-center justify-center hover:bg-[var(--accent)] hover:text-black rounded-lg transition active:scale-90 font-black">-</button>
                  <div className="h-4 w-[1px] bg-[var(--border-dark)]" />
                  <button onClick={() => { setFilterFontSize(f => Math.min(18, Number(f) + 1)); }} className="w-10 h-10 flex items-center justify-center hover:bg-[var(--accent)] hover:text-black rounded-lg transition active:scale-90 font-black">+</button>
                </div>
              </div>

              {/* VS-3 SPECIFIC SETTINGS */}
              <div className="pt-4 border-t border-[var(--border-dark)] space-y-4">
                <div className="text-[10px] text-[var(--accent)] uppercase font-mono tracking-[0.2em] font-black">VS-3 Precision View</div>
                
                <div className="space-y-2">
                   <div className="flex items-center justify-between text-[9px] text-[var(--text-sub)] uppercase font-mono opacity-50 tracking-widest">
                    <span>Card Font</span>
                    <span>{vs3FontSize}px</span>
                  </div>
                  <div className="flex items-center justify-between font-mono bg-[var(--bg-sub)] rounded-lg p-0.5 border border-[var(--border-dark)]">
                    <button onClick={() => setVs3FontSize(f => Math.max(12, f - 1))} className="flex-1 py-1 hover:bg-[var(--accent)] hover:text-black rounded transition">-</button>
                    <button onClick={() => setVs3FontSize(f => Math.min(32, f + 1))} className="flex-1 py-1 hover:bg-[var(--accent)] hover:text-black rounded transition">+</button>
                  </div>
                </div>

                <div className="space-y-2">
                   <div className="flex items-center justify-between text-[9px] text-[var(--text-sub)] uppercase font-mono opacity-50 tracking-widest">
                    <span>Card Padding</span>
                    <span>{vs3CardPadding}px</span>
                  </div>
                  <div className="flex items-center justify-between font-mono bg-[var(--bg-sub)] rounded-lg p-0.5 border border-[var(--border-dark)]">
                    <button onClick={() => setVs3CardPadding(p => Math.max(4, p - 2))} className="flex-1 py-1 hover:bg-[var(--accent)] hover:text-black rounded transition">-</button>
                    <button onClick={() => setVs3CardPadding(p => Math.min(48, p + 2))} className="flex-1 py-1 hover:bg-[var(--accent)] hover:text-black rounded transition">+</button>
                  </div>
                </div>

                <div className="space-y-2">
                   <div className="flex items-center justify-between text-[9px] text-[var(--text-sub)] uppercase font-mono opacity-50 tracking-widest">
                    <span>Body Margin</span>
                    <span>{vs3BodyPadding}px</span>
                  </div>
                  <div className="flex items-center justify-between font-mono bg-[var(--bg-sub)] rounded-lg p-0.5 border border-[var(--border-dark)]">
                    <button onClick={() => setVs3BodyPadding(p => Math.max(0, p - 8))} className="flex-1 py-1 hover:bg-[var(--accent)] hover:text-black rounded transition">-</button>
                    <button onClick={() => setVs3BodyPadding(p => Math.min(128, p + 8))} className="flex-1 py-1 hover:bg-[var(--accent)] hover:text-black rounded transition">+</button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-dark)]">
                <button 
                  onClick={() => { if(confirm("Purge all local settings?")) { localStorage.clear(); window.location.reload(); } }}
                  className="w-full py-2.5 text-[9px] font-mono uppercase bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-all transform active:scale-95 flex items-center justify-center space-x-2 font-bold"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Factory Reset</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-[1px] h-4 bg-[var(--border-dark)] mx-1" />
        
        {/* LOGIN / USER PROFILE */}
        <div className="relative group">
          <button className="flex items-center space-x-2 p-1.5 pr-3 rounded-full bg-[var(--bg-sub)] border border-[var(--border-dark)] hover:border-[var(--accent)]/50 transition-all hover:shadow-[0_0_15px_rgba(var(--accent-rgb),0.1)]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--bg-panel)] to-[var(--bg-highlight)] border border-[var(--border-dark)] flex items-center justify-center text-[var(--accent)]">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col items-start -space-y-1 hidden sm:flex">
              <span className="text-[10px] font-mono text-[var(--text-sub)] uppercase tracking-tighter">Guest</span>
              <span className="text-[9px] font-mono text-[var(--accent)]/60">Not Logged In</span>
            </div>
            <ChevronDown className="w-3 h-3 text-[var(--text-sub)] ml-1" />
          </button>
          
          <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--bg-panel)] border border-[var(--border-dark)] rounded-xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-[200]">
            <div className="p-3 border-b border-[var(--border-dark)]">
              <p className="text-[10px] font-mono text-[var(--text-sub)] uppercase">Account</p>
            </div>
            <div className="p-1">
              <button className="w-full text-left px-3 py-2 text-xs font-mono text-[var(--text-main)] hover:bg-[var(--accent)] hover:text-black rounded-lg transition-colors flex items-center space-x-2">
                <LogIn className="w-3 h-3" />
                <span>Sign In</span>
              </button>
              <button className="w-full text-left px-3 py-2 text-xs font-mono text-[var(--text-main)] hover:bg-[var(--bg-highlight)] rounded-lg transition-colors flex items-center space-x-2">
                <UserPlus className="w-3 h-3" />
                <span>Register</span>
              </button>
            </div>
            <div className="p-1 border-t border-[var(--border-dark)] mt-1">
              <button className="w-full text-left px-3 py-2 text-xs font-mono text-[var(--text-sub)] hover:text-[var(--text-main)] transition-colors">
                Help & Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
