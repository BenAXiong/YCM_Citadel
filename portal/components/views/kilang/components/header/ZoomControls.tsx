'use client';

import React from 'react';
import { Minus, Plus, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';
import { useKilangContext } from '../../KilangContext';

export const ZoomControls = () => {
  const { state, dispatch } = useKilangContext();
  const { scale, isFit, moveZoomToCanvas, selectedRoot } = state;

  if (!selectedRoot || moveZoomToCanvas) return null;

  const setScale = (s: number | ((prev: number) => number)) => {
    const val = typeof s === 'function' ? s(scale) : s;
    dispatch({ type: 'SET_TRANSFORM', scale: val });
  };
  const setIsFit = (fit: boolean) => dispatch({ type: 'SET_TRANSFORM', isFit: fit });

  return (
    <>
      <div className="w-[1px] h-8 bg-[var(--kilang-border)]" />
      <div className="kilang-ctrl-container">
        <button
          onClick={() => setIsFit(!isFit)}
          className={`w-8 h-7 kilang-ctrl-btn ${isFit ? 'kilang-ctrl-btn-active' : 'kilang-ctrl-btn-inactive'}`}
          title={isFit ? "Expand to Actual Size" : "Fit Tree"}
        >
          {isFit ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
        </button>
        <button 
          onClick={() => { setScale((prev) => Math.max(0.2, prev - 0.1)); setIsFit(false); }} 
          className="w-8 h-7 kilang-ctrl-btn kilang-ctrl-btn-inactive shadow-[var(--kilang-shadow-primary)]/20" 
          title="Out"
        >
          <Minus className="w-3 h-3" />
        </button>
        <button 
          onClick={() => { setScale((prev) => Math.min(2, prev + 0.1)); setIsFit(false); }} 
          className="w-8 h-7 kilang-ctrl-btn kilang-ctrl-btn-inactive shadow-[var(--kilang-shadow-primary)]/20" 
          title="In"
        >
          <Plus className="w-3 h-3" />
        </button>
        <button 
          onClick={() => dispatch({ type: 'RESET_TRANSFORM' })} 
          className="w-8 h-7 kilang-ctrl-btn kilang-ctrl-btn-inactive shadow-[var(--kilang-shadow-primary)]/20" 
          title="Reset Zoom"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>
    </>
  );
};
