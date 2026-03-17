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
  scale: number;
  isFit: boolean;
  fitTransform: { x: number; y: number; scale: number };
  forestBounds: { minX: number; minY: number; maxX: number; maxY: number } | null;
}

export const KilangDimensionsOverlay = ({
  viewPos,
  treeRef,
  showDimensions,
  rootPos,
  scale,
  isFit,
  fitTransform,
  forestBounds,
}: KilangDimensionsOverlayProps) => {
  const [hRect, setHRect] = React.useState<DOMRect | null>(null);
  const [sRect, setSRect] = React.useState<DOMRect | null>(null);
  const [mRect, setMRect] = React.useState<DOMRect | null>(null);
  const [cRect, setCRect] = React.useState<DOMRect | null>(null);
  const [win, setWin] = React.useState({ w: 0, h: 0 });

  React.useLayoutEffect(() => {
    if (!showDimensions) return;
    const update = () => {
      setHRect(document.querySelector('header')?.getBoundingClientRect() || null);
      setSRect(document.querySelector('aside')?.getBoundingClientRect() || null);
      
      // Main row represents the workspace container
      const workspace = treeRef.current?.closest('main');
      setMRect(workspace?.getBoundingClientRect() || null);

      // Window row represents the view portal (the glass panel frame)
      const portal = treeRef.current?.closest('.kilang-glass-panel');
      setCRect(portal?.getBoundingClientRect() || null);
      
      setWin({ w: window.innerWidth, h: window.innerHeight });
    };
    update();
    window.addEventListener('resize', update);
    const t = setInterval(update, 500);
    return () => {
      window.removeEventListener('resize', update);
      clearInterval(t);
    };
  }, [treeRef, showDimensions]);

  if (!showDimensions) return null;

  const scaleFactor = 0.05;

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
        <span>VP: {win.w} x {win.h} px</span>
        <span>ASPECT: {(win.w / (win.h || 1)).toFixed(2)}</span>
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
            <td className="px-2 py-0.5 text-left text-white/100 border-l-2 border-red-500/50 font-bold uppercase">Window</td>
            {renderCoords(c, "font-bold text-red-400")}
          </tr>
          <tr className="h-4" />
          <tr className="border-b border-white/10 text-white/40">
            <th className="px-2 py-1 text-left font-normal italic uppercase text-[7px]">Logicals</th>
            <th colSpan={8} className="px-2 py-1 text-right italic font-normal text-[7px] lowercase">Relative to Window</th>
          </tr>
          <tr>
            <td className="px-2 py-0.5 text-left text-white/100 italic uppercase">Canvas</td>
            <td className="px-1 py-0.5 text-blue-400">{-viewPos.x}</td>
            <td className="px-1 py-0.5 text-blue-400">{-viewPos.y}</td>
            <td className="px-1 py-0.5 text-blue-400">{4000 - viewPos.x}</td>
            <td className="px-1 py-0.5 text-blue-400">{-viewPos.y}</td>
            <td className="px-1 py-0.5 text-blue-400">{-viewPos.x}</td>
            <td className="px-1 py-0.5 text-blue-400">{4000 - viewPos.y}</td>
            <td className="px-1 py-0.5 text-blue-400">{4000 - viewPos.x}</td>
            <td className="px-1 py-0.5 text-blue-400">{4000 - viewPos.y}</td>
          </tr>
          <tr className="border-t border-white/5">
            <td className="px-2 py-1 text-left text-white italic font-black uppercase tracking-tighter shrink-0">Tree</td>
            {forestBounds ? (
              <>
                <td className="px-1 py-0.5 text-purple-400">{Math.round(forestBounds.minX - viewPos.x)}</td>
                <td className="px-1 py-0.5 text-purple-400">{Math.round(forestBounds.minY - viewPos.y)}</td>
                <td className="px-1 py-0.5 text-purple-400">{Math.round(forestBounds.maxX - viewPos.x)}</td>
                <td className="px-1 py-0.5 text-purple-400">{Math.round(forestBounds.minY - viewPos.y)}</td>
                <td className="px-1 py-0.5 text-purple-400">{Math.round(forestBounds.minX - viewPos.x)}</td>
                <td className="px-1 py-0.5 text-purple-400">{Math.round(forestBounds.maxY - viewPos.y)}</td>
                <td className="px-1 py-0.5 text-purple-400">{Math.round(forestBounds.maxX - viewPos.x)}</td>
                <td className="px-1 py-0.5 text-purple-400">{Math.round(forestBounds.maxY - viewPos.y)}</td>
              </>
            ) : (
              <td colSpan={8} className="text-center italic opacity-40">Calculating bounds...</td>
            )}
          </tr>
        </tbody>
      </table>

      {/* Blueprint Mini-map */}
      <div className="mt-6 flex flex-col gap-2 relative z-10 pointer-events-auto">
        <div className="relative w-full aspect-square bg-[#020617]/60 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center">
          {/* Scale Overlay */}
          <div className="absolute top-3 right-3 text-[7px] uppercase opacity-50 font-black">
            Scale: {scaleFactor}x
          </div>

          {/* Legend Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
            {/* Window Context */}
            <div className="flex flex-col gap-1.5 border-b border-white/5 pb-2 mb-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-2 border border-blue-400" />
                <span className="text-[8px] text-blue-400 font-black uppercase tracking-tighter">Viewport</span>
              </div>
              {/* Layout Regional Context */}
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-1.5 bg-[#818cf8]/60" />
                <span className="text-[8px] text-[#818cf8] font-black uppercase tracking-tighter font-mono opacity-100">Header</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-1.5 bg-[#fbbf24]/60" />
                <span className="text-[8px] text-[#fbbf24] font-black uppercase tracking-tighter font-mono opacity-100">Sidebar</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-1.5 bg-[#34d399]/60" />
                <span className="text-[8px] text-[#34d399] font-black uppercase tracking-tighter font-mono opacity-100">Main</span>
              </div>
            </div>

            {/* Forest Extent */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-2 border border-dashed border-[#3b82f6] bg-[#3b82f6]/5" />
              <span className="text-[8px] text-blue-400 font-black uppercase tracking-tighter">Canvas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-2 border border-[#f43f5e]" />
              <span className="text-[8px] text-[#f43f5e] font-black uppercase tracking-tighter">Window</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-2 border border-[#a855f7] bg-[#a855f7]/10" />
              <span className="text-[8px] text-[#a855f7] font-black uppercase tracking-tighter">Forest</span>
            </div>
            {/* Origin: Roota location*/}
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)] animate-pulse" />
              <span className="text-[8px] text-blue-400 font-black uppercase tracking-tighter">Root</span>
            </div>
          </div>

          <svg width="240" height="240" viewBox="0 0 240 240" className="overflow-visible">
            {(() => {
              const vX = 120 - (win.w * scaleFactor / 2);
              const vY = 120 - (win.h * scaleFactor / 2);

              const getRelRect = (rect?: DOMRect | null, color?: string) => {
                if (!rect) return null;
                return (
                  <rect
                    x={vX + rect.left * scaleFactor}
                    y={vY + rect.top * scaleFactor}
                    width={rect.width * scaleFactor}
                    height={rect.height * scaleFactor}
                    fill={color}
                    fillOpacity="0.05"
                    stroke={color}
                    strokeOpacity="0.1"
                    strokeWidth="0.5"
                    className="transition-all duration-500"
                  />
                );
              };

              return (
                <g>
                  {/* Layout Components */}
                  {getRelRect(hRect, "#818cf8")} {/* Header */}
                  {getRelRect(sRect, "#fbbf24")} {/* Sidebar */}
                  {getRelRect(mRect, "#34d399")} {/* Main Workspace */}

                  {/* World Canvas Layer */}
                  {(() => {
                    const currentScale = isFit ? fitTransform.scale : scale;

                    // The World Origin in minimap space must align with sRect.left physically
                    // Physical Offset from Viewport Left to World Left = sRect.left
                    // worldMiniX = vX + sRect.left * scaleFactor
                    // Since sRect.left = cRect.left - (viewPos.x * currentScale)
                    const worldMiniX = vX + (cRect?.left || 0) * scaleFactor - (viewPos.x * currentScale * scaleFactor);
                    const worldMiniY = vY + (cRect?.top || 0) * scaleFactor - (viewPos.y * currentScale * scaleFactor);

                    return (
                      <g transform={`translate(${worldMiniX}, ${worldMiniY})`}>
                        {/* 1. The Forest Size (Total size of tree with padding) */}
                        {forestBounds && (
                          <rect
                            x={forestBounds.minX * currentScale * scaleFactor}
                            y={forestBounds.minY * currentScale * scaleFactor}
                            width={(forestBounds.maxX - forestBounds.minX) * currentScale * scaleFactor}
                            height={(forestBounds.maxY - forestBounds.minY) * currentScale * scaleFactor}
                            fill="#a855f7"
                            fillOpacity="0.1"
                            stroke="#a855f7"
                            strokeWidth="1"
                            className="transition-all duration-300"
                          />
                        )}

                        {/* 2. The Logical World Box (scales physically in minimap just like on screen) */}
                        <rect
                          width={4000 * currentScale * scaleFactor}
                          height={4000 * currentScale * scaleFactor}
                          fill="none"
                          fillOpacity="0.05"
                          stroke="#3b82f6"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                          className="transition-all duration-300"
                        />
                        {/* The Root Anchor: Scaled to match physical screen position */}
                        {rootPos && (
                          <circle
                            cx={rootPos.x * currentScale * scaleFactor}
                            cy={rootPos.y * currentScale * scaleFactor}
                            r="2.5"
                            fill="#3b82f6"
                            className="animate-pulse shadow-[0_0_10px_rgba(59,130,246,1)]"
                          />
                        )}
                      </g>
                    );
                  })()}

                  {/* Browser Viewport Outline (The Window) */}
                  <rect
                    x={vX}
                    y={vY}
                    width={win.w * scaleFactor}
                    height={win.h * scaleFactor}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    className="opacity-40"
                  />

                  {/* The Panel Hole (cRect) - Stationary within the UI */}
                  {cRect && (
                    <rect
                      x={vX + cRect.left * scaleFactor}
                      y={vY + cRect.top * scaleFactor}
                      width={cRect.width * scaleFactor}
                      height={cRect.height * scaleFactor}
                      rx="4"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="0.5"
                      className="shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                    />
                  )}
                </g>
              );
            })()}

            {/* Stage Grid Overlay */}
            <line x1="0" y1="120" x2="240" y2="120" stroke="white" strokeOpacity="0.03" strokeWidth="0.5" />
            <line x1="120" y1="0" x2="120" y2="240" stroke="white" strokeOpacity="0.03" strokeWidth="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
};
