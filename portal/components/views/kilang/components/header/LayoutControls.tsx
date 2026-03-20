'use client';

import React from 'react';
import { ArrowRight, ArrowUp, LayoutGrid, Rows, Settings2, Maximize, Minimize } from 'lucide-react';
import { useKilangContext } from '../../KilangContext';
import { LayoutDirection, LayoutArrangement, KilangState } from '../../kilangReducer';

export const LayoutControls = () => {
  const { state, dispatch } = useKilangContext();
  const { 
    selectedRoot, 
    direction, 
    arrangement, 
    showDevTools, 
    layoutConfig, 
    moveGrowthToCanvas,
    isFullView 
  } = state;

  if (!selectedRoot || moveGrowthToCanvas) return null;

  const setDirection = (dir: LayoutDirection) => dispatch({ type: 'SET_LAYOUT', direction: dir });
  const setArrangement = (arr: LayoutArrangement) => dispatch({ type: 'SET_LAYOUT', arrangement: arr });
  const updateLayoutConfig = (config: Partial<KilangState['layoutConfig']>) => dispatch({ type: 'SET_LAYOUT_CONFIG', config });
  const toggleFullView = () => dispatch({ type: 'SET_UI', isFullView: !isFullView });

  return (
    <div className="flex items-center gap-3 lg:gap-6">
      <div className="flex items-center gap-2.5">
        <span className="text-[8px] font-black text-[var(--kilang-text-muted)] uppercase tracking-widest hidden lg:inline-block">Growth</span>
        <div className="kilang-ctrl-container">
          <button
            onClick={() => setDirection('horizontal')}
            className={`w-8 h-7 kilang-ctrl-btn ${direction === 'horizontal' ? 'kilang-ctrl-btn-active' : 'kilang-ctrl-btn-inactive'}`}
            title="Horizontal Growth"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDirection('vertical')}
            className={`w-8 h-7 kilang-ctrl-btn ${direction === 'vertical' ? 'kilang-ctrl-btn-active' : 'kilang-ctrl-btn-inactive'}`}
            title="Vertical Growth"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <span className="text-[8px] font-black text-[var(--kilang-text-muted)] uppercase tracking-widest hidden lg:inline-block">Pattern</span>
        <div className="kilang-ctrl-container">
          <button
            onClick={() => setArrangement('flow')}
            className={`w-8 h-7 kilang-ctrl-btn ${arrangement === 'flow' ? 'kilang-ctrl-btn-active' : 'kilang-ctrl-btn-inactive'}`}
            title="Flow (Organized Groups)"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setArrangement('aligned')}
            className={`w-8 h-7 kilang-ctrl-btn ${arrangement === 'aligned' ? 'kilang-ctrl-btn-active' : 'kilang-ctrl-btn-inactive'}`}
            title="Aligned (Chain Selection)"
          >
            <Rows className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Full View Toggle */}
      <div className="flex items-center gap-2.5">
        <span className="text-[8px] font-black text-[var(--kilang-text-muted)] uppercase tracking-widest hidden lg:inline-block">View</span>
        <div className="kilang-ctrl-container">
          <button
            onClick={toggleFullView}
            className={`w-8 h-7 kilang-ctrl-btn ${isFullView ? 'kilang-ctrl-btn-active' : 'kilang-ctrl-btn-inactive'}`}
            title={isFullView ? "Exit Full View" : "Enter Full View"}
          >
            {isFullView ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {showDevTools && (
        <div className="kilang-ctrl-container">
          <button
            onClick={() => updateLayoutConfig({ showToolbox: !layoutConfig.showToolbox })}
            className={`w-8 h-7 kilang-ctrl-btn ${layoutConfig.showToolbox ? 'kilang-ctrl-btn-active' : 'text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)] hover:bg-[var(--kilang-ctrl-active)]/5'}`}
            title="Toggle Visual Toolbox"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
