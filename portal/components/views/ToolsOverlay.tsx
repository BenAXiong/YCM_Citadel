"use client";

import React from 'react';
import { Square } from "lucide-react";
import RawDbExplorer from "./RawDbExplorer";

interface ToolsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  toolsTab: "heatmap" | "normalization" | "rosetta" | "raw_db";
  setToolsTab: (tab: "heatmap" | "normalization" | "rosetta" | "raw_db") => void;
  handleCopy: (text: string, id: string) => void;
  copiedId: string | null;
}

export default function ToolsOverlay({
  isOpen,
  onClose,
  toolsTab,
  setToolsTab,
  handleCopy,
  copiedId
}: ToolsOverlayProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-[var(--bg-deep)] bg-opacity-80 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-panel)] border border-[var(--border-dark)] rounded-xl shadow-2xl w-[85%] h-[85%] flex flex-col overflow-hidden relative shadow-[0_0_100px_rgba(0,0,0,0.5)]"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-[var(--bg-highlight)] rounded-full transition text-[var(--text-sub)] hover:text-[var(--text-main)] z-10"><Square className="w-5 h-5" /></button>

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
                      let weight = 0;
                      if (row === "恆春" && col === "秀姑巒") weight = 234;
                      if (row === "南勢" && col === "秀姑巒") weight = 136;
                      if (row === "恆春" && col === "海岸") weight = 156;
                      if (row === "馬蘭" && col === "南勢") weight = 50;
                      const opacity = isDiag ? 0.05 : (weight / 250);
                      return (
                        <div
                          key={col}
                          className={`p-1 border-r border-b border-[var(--border-dark)] transition-all flex items-center justify-center relative group/cell`}
                          style={{ backgroundColor: isDiag ? 'transparent' : `rgba(255, 60, 0, ${opacity})` }}
                        >
                          {!isDiag && weight > 0 && <span className="text-[10px] font-mono font-bold drop-shadow-md text-white">{weight}</span>}
                          {!isDiag && weight > 0 && (
                            <div className="absolute inset-0 z-10 opacity-0 group-hover/cell:opacity-100 bg-black/80 p-2 pointer-events-none text-[8px] flex flex-col justify-center text-left">
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
            <RawDbExplorer 
              handleCopy={handleCopy} 
              copiedId={copiedId} 
              isActive={isOpen && toolsTab === 'raw_db'} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
