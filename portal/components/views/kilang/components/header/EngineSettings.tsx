'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Settings2, Activity, Layers, Info, ChevronRight, Eye, Share2 } from 'lucide-react';
import { useKilangContext } from '../../KilangContext';
import { DevToolItem } from '../DevToolItem';
import { KilangState } from '../../kilangReducer';

export const EngineSettings = () => {
  const { state, dispatch } = useKilangContext();
  const { 
    showStatsOverlay, 
    showAffixesOverlay, 
    showStats, 
    showDimensions, 
    showPerfMonitor, 
    showFilterPanel, 
    showRightSidebar, 
    showSidebarTooltips, 
    showTreeTooltips, 
    showTreeTab, 
    showThemeBar, 
    showDevTools,
    moveZoomToCanvas,
    moveGrowthToCanvas,
    moveCaptureToCanvas,
    moveChainToCanvas,
    layoutConfig
  } = state;

  const [showSettings, setShowSettings] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [showDevSub, setShowDevSub] = useState(false);
  const [showViewSub, setShowViewSub] = useState(false);
  const [showShareSub, setShowShareSub] = useState(false);
  const [showHowToSub, setShowHowToSub] = useState(false);

  const settingsRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<any>(null);

  const setShowStatsOverlay = (show: boolean) => dispatch({ type: 'SET_UI', showStatsOverlay: show });
  const setShowAffixesOverlay = (show: boolean) => dispatch({ type: 'SET_UI', showAffixesOverlay: show });
  const updateLayoutConfig = (config: Partial<KilangState['layoutConfig']>) => dispatch({ type: 'SET_LAYOUT_CONFIG', config });

  // Auto-close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
        setIsPinned(false);
        setShowDevSub(false);
        setShowViewSub(false);
        setShowShareSub(false);
        setShowHowToSub(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-4">
      <div className="w-[1px] h-4 bg-[var(--kilang-border)] mx-1" />

      <button
        onClick={() => setShowStatsOverlay(true)}
        className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${showStatsOverlay ? 'bg-[var(--kilang-ctrl-active)] border-[var(--kilang-ctrl-active)]/40 text-[var(--kilang-ctrl-active-text)] shadow-[var(--kilang-shadow-primary)]' : 'bg-[var(--kilang-bg-base)]/40 border-[var(--kilang-border-std)] text-[var(--kilang-text-muted)] hover:border-[var(--kilang-primary-border)] hover:text-[var(--kilang-text)]'}`}
        title="Morphology Distribution"
      >
        <Activity className="w-5 h-5" />
      </button>

      <button
        onClick={() => setShowAffixesOverlay(true)}
        className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${showAffixesOverlay ? 'bg-[var(--kilang-ctrl-active)] border-[var(--kilang-ctrl-active)]/40 text-[var(--kilang-ctrl-active-text)] shadow-[var(--kilang-shadow-primary)]' : 'bg-[var(--kilang-bg-base)]/40 border-[var(--kilang-border-std)] text-[var(--kilang-text-muted)] hover:border-[var(--kilang-primary-border)] hover:text-[var(--kilang-text)]'}`}
        title="Affixes Analysis"
      >
        <Layers className="w-5 h-5" />
      </button>

      {/* Gear Settings Button */}
      <div
        ref={settingsRef}
        className="relative"
        onMouseEnter={() => {
          if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          setShowSettings(true);
        }}
        onMouseLeave={() => {
          if (!isPinned) {
            hoverTimeoutRef.current = setTimeout(() => {
              setShowSettings(false);
              setShowDevSub(false);
              setShowViewSub(false);
              setShowShareSub(false);
              setShowHowToSub(false);
            }, 600); // 600ms grace period
          }
        }}
      >
        <button
          onClick={() => setIsPinned(!isPinned)}
          className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${showSettings || isPinned ? 'bg-[var(--kilang-ctrl-active)] border-[var(--kilang-ctrl-active)]/40 text-[var(--kilang-ctrl-active-text)] shadow-[0_0_15px_var(--kilang-primary-glow)]' : 'bg-[var(--kilang-bg-base)]/40 border-[var(--kilang-border-std)] text-[var(--kilang-text-muted)] hover:border-[var(--kilang-primary-border)] hover:text-[var(--kilang-text)]'}`}
          title="Engine Settings"
        >
          <Settings2 className={`w-5 h-5 transition-transform duration-500 ${isPinned ? 'rotate-90' : 'group-hover:rotate-12'}`} />
        </button>

        {showSettings && (
          <div className="absolute top-full right-0 mt-2 w-56 bg-[var(--kilang-bg-base)]/95 backdrop-blur-2xl border border-[var(--kilang-border-std)] rounded-xl shadow-[var(--kilang-shadow-primary)] p-2 z-[4000] animate-in fade-in slide-in-from-top-2 duration-200">
            {isPinned && (
              <div className="absolute -top-2 -right-1 flex items-center gap-1 group">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse" />
              </div>
            )}
            
            {/* How to Kilang Secondary Menu */}
            <div className="mb-1">
              <button
                onClick={() => setShowHowToSub(!showHowToSub)}
                className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-[var(--kilang-ctrl-bg)] transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-primary)]" />
                  <span className="text-[10px] font-black uppercase text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-text)]">How to Kilang</span>
                </div>
                <ChevronRight className={`w-3 h-3 text-[var(--kilang-text-muted)] transition-transform ${showHowToSub ? 'rotate-90' : ''}`} />
              </button>

              {showHowToSub && (
                <div className="mt-1 ml-2 pl-2 border-l border-[var(--kilang-border-std)] space-y-1 animate-in slide-in-from-left-2 duration-200">
                  <div className="relative group/tooltip-instr">
                    <button className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg hover:bg-[var(--kilang-ctrl-bg)] transition-all group">
                      <span className="text-[9px] font-black uppercase text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-text)]">Instructions</span>
                      <div className="text-[8px] text-[var(--kilang-primary)]/50 group-hover:text-[var(--kilang-primary)]">?</div>
                    </button>
                    <div className="absolute right-full mr-4 top-0 w-48 bg-black/99 backdrop-blur-md border border-[var(--kilang-border-std)] rounded-lg p-2.5 shadow-[var(--kilang-shadow-primary)] z-[5000] invisible group-hover/tooltip-instr:visible opacity-0 group-hover/tooltip-instr:opacity-100 transition-all scale-95 group-hover/tooltip-instr:scale-100 origin-right">
                      <div className="text-[9px] text-[var(--kilang-text-muted)] leading-relaxed italic">
                        "Kilang is a generative language forest. Explore the derivatives, analyze the affixes, and export your findings using the capture tools."
                      </div>
                    </div>
                  </div>

                  <div className="relative group/tooltip">
                    <button className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg hover:bg-[var(--kilang-ctrl-bg)] transition-all group">
                      <span className="text-[9px] font-black uppercase text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-text)]">Main Shortcuts</span>
                      <div className="text-[8px] text-[var(--kilang-primary)]/50 group-hover:text-[var(--kilang-primary)]">?</div>
                    </button>
                    <div className="absolute right-full mr-4 top-0 w-48 bg-black/99 backdrop-blur-md border border-[var(--kilang-border-std)] rounded-lg p-2.5 shadow-[var(--kilang-shadow-primary)] z-[5000] invisible group-hover/tooltip:visible opacity-0 group-hover/tooltip:opacity-100 transition-all scale-95 group-hover/tooltip:scale-100 origin-right">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center border-b border-[var(--kilang-border-std)] pb-1.5 mb-1.5">
                          <span className="text-[7.5px] font-black uppercase text-[var(--kilang-primary)] tracking-wider">Canvas Interaction</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px]"><span className="text-[var(--kilang-text-muted)]/60 font-bold uppercase tracking-tight">Scroll</span><span className="text-[var(--kilang-text)] font-mono bg-[var(--kilang-text)]/5 px-1 rounded">Y-Scroll</span></div>
                        <div className="flex justify-between items-center text-[9px]"><span className="text-[var(--kilang-text-muted)]/60 font-bold uppercase tracking-tight">Ctrl + Scroll</span><span className="text-[var(--kilang-text)] font-mono bg-[var(--kilang-text)]/5 px-1 rounded">Zoom</span></div>
                        <div className="flex justify-between items-center text-[9px]"><span className="text-[var(--kilang-text-muted)]/60 font-bold uppercase tracking-tight">Right Click</span><span className="text-[var(--kilang-text)] font-mono bg-[var(--kilang-text)]/5 px-1 rounded">Pan</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* View Secondary Menu */}
            <div className="mb-1">
              <button
                onClick={() => setShowViewSub(!showViewSub)}
                className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-[var(--kilang-ctrl-bg)] transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-primary)]" />
                  <span className="text-[10px] font-black uppercase text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-text)]">View</span>
                </div>
                <ChevronRight className={`w-3 h-3 text-[var(--kilang-text-muted)] transition-transform ${showViewSub ? 'rotate-90' : ''}`} />
              </button>

              {showViewSub && (
                <div className="mt-1 ml-2 pl-2 border-l border-[var(--kilang-border-std)] space-y-1 animate-in slide-in-from-left-2 duration-200">
                  <button onClick={() => dispatch({ type: 'SET_UI', showStats: !showStats })} className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-[var(--kilang-ctrl-bg)] transition-all group">
                    <span className="text-[10px] font-black uppercase text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-text)]">Stats Bar</span>
                    <div className={`w-2 h-2 rounded-full border transition-all ${showStats ? 'bg-[var(--kilang-primary)] border-[var(--kilang-primary-border)] shadow-[0_0_8px_var(--kilang-primary-glow)]' : 'border-[var(--kilang-border-std)]'}`} />
                  </button>
                  <button onClick={() => dispatch({ type: 'SET_UI', showSidebarTooltips: !showSidebarTooltips })} className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-[var(--kilang-ctrl-bg)] transition-all group">
                    <span className="text-[10px] font-black uppercase text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-text)]">Sidebar Tooltips</span>
                    <div className={`w-2 h-2 rounded-full border transition-all ${showSidebarTooltips ? 'bg-[var(--kilang-primary)] border-[var(--kilang-primary-border)] shadow-[0_0_8px_var(--kilang-primary-glow)]' : 'border-[var(--kilang-border-std)]'}`} />
                  </button>
                  <button onClick={() => dispatch({ type: 'SET_UI', showTreeTooltips: !showTreeTooltips })} className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-[var(--kilang-ctrl-bg)] transition-all group">
                    <span className="text-[10px] font-black uppercase text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-text)]">Tree Tooltips</span>
                    <div className={`w-2 h-2 rounded-full border transition-all ${showTreeTooltips ? 'bg-[var(--kilang-primary)] border-[var(--kilang-primary-border)] shadow-[0_0_8px_var(--kilang-primary-glow)]' : 'border-[var(--kilang-border-std)]'}`} />
                  </button>
                  <button onClick={() => dispatch({ type: 'SET_UI', moveZoomToCanvas: !moveZoomToCanvas })} className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-[var(--kilang-ctrl-bg)] transition-all group">
                    <span className="text-[10px] font-black uppercase text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-text)]">Zoom Controls</span>
                    <div className={`w-2 h-2 rounded-full border transition-all ${moveZoomToCanvas ? 'bg-[var(--kilang-primary)] border-[var(--kilang-primary-border)]/50 shadow-[0_0_8px_var(--kilang-primary-glow)]' : 'border-[var(--kilang-border-std)]'}`} />
                  </button>
                </div>
              )}
            </div>

            {/* Share Secondary Menu */}
            <div className="mb-1">
              <button
                onClick={() => setShowShareSub(!showShareSub)}
                className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-[var(--kilang-ctrl-bg)] transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Share2 className="w-3.5 h-3.5 text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-primary)]" />
                  <span className="text-[10px] font-black uppercase text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-text)]">Share</span>
                </div>
                <ChevronRight className={`w-3 h-3 text-[var(--kilang-text-muted)] transition-transform ${showShareSub ? 'rotate-90' : ''}`} />
              </button>
              {showShareSub && (
                <div className="mt-1 ml-2 pl-2 border-l border-[var(--kilang-border-std)] space-y-1 animate-in slide-in-from-left-2 duration-200">
                  <button className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg hover:bg-[var(--kilang-ctrl-bg)] transition-all group"><span className="text-[9px] font-black uppercase text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-text)]">Share Page</span></button>
                  <button className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg hover:bg-[var(--kilang-ctrl-bg)] transition-all group"><span className="text-[9px] font-black uppercase text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-text)]">Share Kilang</span></button>
                </div>
              )}
            </div>

            {/* Dev Tools Secondary Menu */}
            <div className="mt-2 pt-2 border-t border-[var(--kilang-border-std)]">
              <button
                onClick={() => setShowDevSub(!showDevSub)}
                className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-[var(--kilang-ctrl-bg)] transition-all group bg-[var(--kilang-primary)]/5"
              >
                <span className="text-[10px] font-black uppercase text-[var(--kilang-primary)] group-hover:text-[var(--kilang-primary-text)]">Dev Tools</span>
                <ChevronRight className={`w-3 h-3 text-[var(--kilang-primary)]/50 transition-transform ${showDevSub ? 'rotate-90' : ''}`} />
              </button>

              {showDevSub && (
                <div className="mt-1 ml-2 pl-2 border-l border-[var(--kilang-border-std)] space-y-1 animate-in slide-in-from-left-2 duration-200">
                  <div className="px-3 pt-3 pb-1 border-b border-[var(--kilang-border-std)] mb-1">
                    <span className="text-[7px] font-black uppercase text-[var(--kilang-text-muted)] tracking-[0.2em]">Layout & Workspaces</span>
                  </div>
                  <DevToolItem label="Filter Panel" goal="Toggle root navigation." isOn={showFilterPanel} onClick={() => dispatch({ type: 'SET_UI', showFilterPanel: !showFilterPanel })} />
                  <DevToolItem label="Explorer Panel" goal="Toggle right sidebar." isOn={showRightSidebar} onClick={() => dispatch({ type: 'SET_UI', showRightSidebar: !showRightSidebar })} />
                  <DevToolItem label="Theme Bar" goal="Toggle theme settings." isOn={showThemeBar} onClick={() => dispatch({ type: 'SET_UI', showThemeBar: !showThemeBar })} />
                  <DevToolItem label="Visual Toolbox" goal="Manual layout adjustment." isOn={layoutConfig.showToolbox} onClick={() => updateLayoutConfig({ showToolbox: !layoutConfig.showToolbox })} />
                  
                  <div className="px-3 pt-3 pb-1 border-b border-[var(--kilang-border-std)] mt-1 mb-1">
                    <span className="text-[7px] font-black uppercase text-[var(--kilang-text-muted)] tracking-[0.2em]">Performance & Spatial</span>
                  </div>
                  <DevToolItem label="Dimensions" goal="Show view tables." isOn={showDimensions} onClick={() => dispatch({ type: 'SET_UI', showDimensions: !showDimensions })} />
                  <DevToolItem label="Perf Monitor" goal="Monitor frame rate (FPS)." isOn={showPerfMonitor} onClick={() => dispatch({ type: 'SET_UI', showPerfMonitor: !showPerfMonitor })} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
