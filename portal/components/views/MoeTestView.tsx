"use client";

import React from 'react';
import { Beaker, FlaskConical } from "lucide-react";

export default function MoeTestView() {
  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-70">
      <div className="flex -space-x-2">
        <FlaskConical className="w-16 h-16 text-purple-500" />
        <Beaker className="w-16 h-16 text-purple-400 transform translate-y-4" />
      </div>
      <h2 className="text-2xl font-mono text-purple-400 font-bold uppercase tracking-tighter">MOE_UX_LAB</h2>
      <p className="font-mono text-[9px] text-[var(--text-sub)] max-w-sm text-center mb-8">
        Prototyping a "Unified Source Card" that blends Safolu, Poinsot, and Manoel data into a single semantic soul.
      </p>

      {/* SAMPLE CARD PROTOTYPE */}
      <div className="w-80 bg-[var(--bg-sub)] border border-purple-500/30 rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-700">
        <div className="p-4 bg-gradient-to-br from-purple-900/40 to-black/20 border-b border-purple-500/20">
          <div className="flex justify-between items-start">
            <h3 className="text-3xl font-bold text-white tracking-tight">'acam</h3>
            <span className="px-2 py-0.5 rounded bg-purple-500 text-black text-[9px] font-bold font-mono">GOLD CORE</span>
          </div>
          <p className="text-[10px] text-purple-300/80 font-mono mt-1 italic">Amis {"->"} Multi-Lang</p>
        </div>
        
        <div className="p-4 space-y-4">
          <section className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-cyan-400"></span>
              <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest">Safolu (ZH)</span>
            </div>
            <p className="text-sm text-white pl-3 border-l border-white/5">乾燥的蘆葦。可用於助燃。</p>
          </section>

          <section className="space-y-1 opacity-80">
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-amber-400"></span>
              <span className="text-[9px] font-mono text-amber-400 uppercase tracking-widest">Poinsot (EN)</span>
            </div>
            <p className="text-[11px] text-[var(--text-main)] pl-3 border-l border-white/5">Dry stalks useable for firewood.</p>
          </section>

          <section className="space-y-1 opacity-60">
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-pink-400"></span>
              <span className="text-[9px] font-mono text-pink-400 uppercase tracking-widest">Manoel (FR)</span>
            </div>
            <p className="text-[11px] text-[var(--text-main)] pl-3 border-l border-white/5 italic">Roseau (utilisé pour les cloisons...)</p>
          </section>
        </div>

        <div className="p-2 bg-black/40 border-t border-purple-500/10 flex justify-center">
            <button className="text-[10px] font-mono text-purple-400 hover:text-white transition uppercase tracking-widest">Run Triangulation</button>
        </div>
      </div>
    </div>
  );
}
