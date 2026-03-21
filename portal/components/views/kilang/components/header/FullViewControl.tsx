'use client';

import React from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { useKilangContext } from '../../KilangContext';

export const FullViewControl = () => {
  const { state, dispatch } = useKilangContext();
  const { isFullView, moveFullViewToCanvas, hideCanvasControls } = state;

  if (moveFullViewToCanvas || hideCanvasControls) return null;

  return (
    <div className="kilang-ctrl-container h-8 px-1.5 flex items-center bg-[var(--kilang-bg-base)]/40 border border-[var(--kilang-border-std)] rounded-xl">
      <button
        onClick={() => dispatch({ type: 'SET_UI', isFullView: !isFullView })}
        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${isFullView ? 'bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)] shadow-[var(--kilang-shadow-primary)]' : 'text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)] hover:bg-[var(--kilang-ctrl-bg)]'}`}
        title={isFullView ? "Exit Full View" : "Enter Immersive Full View"}
      >
        {isFullView ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
      </button>
    </div>
  );
};
