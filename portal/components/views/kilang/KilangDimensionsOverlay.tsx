'use client';

import React from 'react';

interface KilangDimensionsOverlayProps {
  viewPos: {
    w: number;
    h: number;
    x: number;
    y: number;
  };
  treeRef: React.RefObject<HTMLDivElement | null>;
  showDimensions: boolean;
  rootPos: { x: number; y: number } | null;
}

export const KilangDimensionsOverlay = ({
  viewPos,
  treeRef,
  showDimensions,
  rootPos,
}: KilangDimensionsOverlayProps) => {
  if (!showDimensions) return null;

  const bw = typeof window !== 'undefined' ? window.innerWidth : 0;
  const bh = typeof window !== 'undefined' ? window.innerHeight : 0;

  const header = typeof document !== 'undefined' ? document.querySelector('header') : null;
  const sidebar = typeof document !== 'undefined' ? document.querySelector('aside') || document.querySelector('[class*="Sidebar"]') : null;
  const main = treeRef.current?.closest('main');
  const canvas = treeRef.current?.closest('.kilang-glass-panel');

  const hRect = header?.getBoundingClientRect();
  const sRect = sidebar?.getBoundingClientRect();
  const mRect = main?.getBoundingClientRect();
  const cRect = canvas?.getBoundingClientRect();

  const formatPair = (rect?: DOMRect | null) => {
    if (!rect) return [['---', '---'], ['---', '---'], ['---', '---'], ['---', '---']];
    return [
      [Math.round(rect.left), Math.round(rect.top)],
      [Math.round(rect.right), Math.round(rect.top)],
      [Math.round(rect.left), Math.round(rect.bottom)],
      [Math.round(rect.right), Math.round(rect.bottom)]
    ];
  };

  const h = formatPair(hRect);
  const s = formatPair(sRect);
  const m = formatPair(mRect);
  const c = formatPair(cRect);

  const renderCoords = (coords: (string | number)[][], className = "") => (
    <>
      {coords.map((pair, i) => (
        <React.Fragment key={i}>
          <td className={`px-1 py-0.5 overflow-hidden whitespace-nowrap ${className}`}>{pair[0]}</td>
          <td className={`px-1 py-0.5 overflow-hidden whitespace-nowrap ${className}`}>{pair[1]}</td>
        </React.Fragment>
      ))}
    </>
  );

  return (
    <div className="absolute top-6 right-8 text-[9px] font-mono text-white tracking-widest pointer-events-none select-none z-0">
      <div className="mb-2 italic flex justify-between gap-4 border-b border-white/40 pb-2">
        <span>VP: {bw} x {bh} px</span>
        <span>ASPECT: {(bw / (bh || 1)).toFixed(2)}</span>
      </div>
      <table className="border-collapse text-right table-fixed w-[436px]">
        <thead>
          <tr className="border-b border-white/10 text-white/100">
            <th className="px-2 py-1 text-left font-bold italic w-[100px]">LAYER (PX)</th>
            <th colSpan={2} className="px-2 py-1 font-normal uppercase text-center border-l border-white/5">TL</th>
            <th colSpan={2} className="px-2 py-1 font-normal uppercase text-center border-l border-white/5">TR</th>
            <th colSpan={2} className="px-2 py-1 font-normal uppercase text-center border-l border-white/5">BL</th>
            <th colSpan={2} className="px-2 py-1 font-normal uppercase text-center border-l border-white/5">BR</th>
          </tr>
          <tr className="text-[7px] text-white/40 uppercase">
            <th></th>
            <th className="w-[42px] pr-1">X</th><th className="w-[42px] pr-1">Y</th>
            <th className="w-[42px] pr-1">X</th><th className="w-[42px] pr-1">Y</th>
            <th className="w-[42px] pr-1">X</th><th className="w-[42px] pr-1">Y</th>
            <th className="w-[42px] pr-1">X</th><th className="w-[42px] pr-1">Y</th>
          </tr>
        </thead>
        <tbody className="text-white">
          <tr>
            <td className="px-2 py-0.5 text-left text-white/100 border-l-2 border-indigo-500/50">HEADER</td>
            {renderCoords(h, "font-bold text-indigo-400")}
          </tr>
          {sRect && (
            <tr>
              <td className="px-2 py-0.5 text-left text-white/100 border-l-2 border-amber-500/50">SIDEBAR</td>
              {renderCoords(s, "font-bold text-amber-400")}
            </tr>
          )}
          <tr>
            <td className="px-2 py-0.5 text-left text-white/100 border-l-2 border-emerald-500/50 font-bold uppercase">Main</td>
            {renderCoords(m, "font-bold text-emerald-400")}
          </tr>
          <tr className="border-b border-white/10">
            <td className="px-2 py-0.5 text-left text-white/100 border-l-2 border-blue-500/50 font-bold uppercase">Canvas</td>
            {renderCoords(c, "font-bold text-blue-400")}
          </tr>
          <tr className="h-4" />
          <tr className="border-b border-white/10 text-white/40">
            <th className="px-2 py-1 text-left font-normal italic uppercase text-[7px]">Logicals</th>
            <th colSpan={8} className="px-2 py-1 text-right italic font-normal text-[7px] lowercase">Relative to Main Pane</th>
          </tr>
          <tr>
            <td className="px-2 py-0.5 text-left text-white/100 italic uppercase">Window</td>
            <td className="px-1 py-0.5">0</td><td className="px-1 py-0.5">0</td>
            <td className="px-1 py-0.5">{viewPos.w}</td><td className="px-1 py-0.5">0</td>
            <td className="px-1 py-0.5">0</td><td className="px-1 py-0.5">{viewPos.h}</td>
            <td className="px-1 py-0.5">{viewPos.w}</td><td className="px-1 py-0.5">{viewPos.h}</td>
          </tr>
          <tr className="border-t border-white/5">
            <td className="px-2 py-1 text-left text-whte italic font-black uppercase">Viewing World</td>
            <td className="px-1 py-0.5 text-blue-400">{-viewPos.x}</td>
            <td className="px-1 py-0.5 text-blue-400">{-viewPos.y}</td>
            <td className="px-1 py-0.5 text-blue-400">{viewPos.w - viewPos.x}</td>
            <td className="px-1 py-0.5 text-blue-400">{-viewPos.y}</td>
            <td className="px-1 py-0.5 text-blue-400">{-viewPos.x}</td>
            <td className="px-1 py-0.5 text-blue-400">{viewPos.h - viewPos.y}</td>
            <td className="px-1 py-0.5 text-blue-400">{viewPos.w - viewPos.x}</td>
            <td className="px-1 py-0.5 text-blue-400">{viewPos.h - viewPos.y}</td>
          </tr>
        </tbody>
      </table>

      {/* Blueprint Mini-map */}
      <div className="mt-6 flex flex-col gap-2">
        <div className="relative w-full aspect-square bg-[#020617]/60 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center">
          {/* Scale Overlay */}
          <div className="absolute top-3 right-3 text-[7px] uppercase opacity-50 font-black">
            Scale: 0.1x
          </div>

          {/* Legend Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-sm border border-[#f43f5e] bg-[#f43f5e]/10" />
              <span className="text-[6px] text-[#f43f5e] font-black uppercase tracking-tighter">Viewport (cRect)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-sm border border-[#3b82f6] border-dashed bg-[#3b82f6]/10" />
              <span className="text-[6px] text-[#3b82f6] font-black uppercase tracking-tighter">World (sRect)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.8)] animate-pulse" />
              <span className="text-[6px] text-blue-400 font-black uppercase tracking-tighter">Root</span>
            </div>
          </div>

          <svg width="240" height="240" viewBox="0 0 240 240" className="overflow-visible">
            {/* 1. World Canvas (sRect) - The large area moving behind */}
            <g transform={`translate(${120 - (viewPos.x * 0.1) - (viewPos.w * 0.1 / 2)}, ${120 - (viewPos.y * 0.1) - (viewPos.h * 0.1 / 2)})`}>
              {/* Massive World Box */}
              <rect 
                width={200} 
                height={200} 
                fill="#3b82f6" 
                fillOpacity="0.05" 
                stroke="#3b82f6" 
                strokeWidth="1" 
                strokeDasharray="2 2"
                className="transition-all duration-300"
              />
              {/* Root Anchor Point */}
              {rootPos && (
                <circle 
                  cx={rootPos.x * 0.1} 
                  cy={rootPos.y * 0.1} 
                  r="2" 
                  fill="#3b82f6" 
                  className="animate-pulse"
                />
              )}
            </g>

            {/* 2. Fixed Viewport (cRect) - Stationary in the UI relative to monitor */}
            <rect 
              x={120 - (viewPos.w * 0.1 / 2)} 
              y={120 - (viewPos.h * 0.1 / 2)} 
              width={viewPos.w * 0.1} 
              height={viewPos.h * 0.1} 
              fill="none" 
              stroke="#f43f5e" 
              strokeWidth="1.5"
              className="shadow-lg"
            />
            
            {/* Origin Lines / Tracking */}
            <line 
              x1="0" y1="120" x2="240" y2="120" 
              stroke="white" strokeOpacity="0.05" strokeWidth="0.5" 
            />
            <line 
              x1="120" y1="0" x2="120" y2="240" 
              stroke="white" strokeOpacity="0.05" strokeWidth="0.5" 
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
