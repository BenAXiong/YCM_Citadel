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
}

export const KilangDimensionsOverlay = ({
  viewPos,
  treeRef,
  showDimensions,
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
    </div>
  );
};
