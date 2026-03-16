'use client';

import React from 'react';
import { Search, Filter, XCircle, ChevronLeft, ChevronRight, Settings2, PenTool, LayoutPanelLeft, Box, RotateCcw, SlidersHorizontal, PencilLine, Scaling, Palette, Zap, ZapOff, Maximize2, Info, Bookmark, Pin, CheckCircle2, GitBranch } from 'lucide-react';
import { WordTooltip } from './KilangNode';
import { KilangState, KilangAction } from './kilangReducer';
import { normalizeWord } from './kilangUtils';

interface KilangSidebarProps {
  state: KilangState;
  dispatch: React.Dispatch<KilangAction>;
  filteredRoots: any[];
  fetchRootDetails: (root: string) => Promise<void>;
  bucketHits: Record<string, number>;
  FILTER_BUCKETS: Array<{ label: string; min: number; max: number }>;
  summaryCache: Record<string, string[]>;
  fetchSummary: (word: string) => Promise<void>;
  isCollapsed: boolean;
  onToggle: () => void;
}

const STORAGE_KEY = 'kilang_bookmarked_trees';

export const KilangSidebar = ({
  state,
  dispatch,
  filteredRoots,
  fetchRootDetails,
  bucketHits,
  FILTER_BUCKETS,
  summaryCache,
  fetchSummary,
  isCollapsed,
  onToggle
}: KilangSidebarProps) => {
  const { searchTerm, branchFilter, sidebarTab, selectedRoot, layoutConfig, rootData } = state;
  const [showTips, setShowTips] = React.useState(false);
  const [showMyTrees, setShowMyTrees] = React.useState(false);
  const [bookmarks, setBookmarks] = React.useState<any[]>([]);
  const [toast, setToast] = React.useState<{ message: string, type: 'success' | 'info' } | null>(null);
  const [customInput, setCustomInput] = React.useState("Lamit\n  Ca'ang 1\n    Losay 1\n  Ca'ang 2\n    Losay 2\n      Varu\n        Udal\n  Ca'ang 3");
  const [customInputDirty, setCustomInputDirty] = React.useState(false);

  // Load bookmarks on mount
  React.useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse bookmarks", e);
      }
    }
  }, []);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const saveBookmark = (rootOverride?: string, typeOverride?: 'db' | 'custom', dataOverride?: any, countOverride?: number) => {
    const rootToSave = rootOverride || selectedRoot;
    if (!rootToSave) {
      if (sidebarTab === 'custom') {
        showNotification('Plant your Kilang first!', 'info');
      }
      return;
    }
    
    // Safety check for custom data
    const isCustom = typeOverride === 'custom' || 
                   (rootData?.derivatives?.[0]?.dict_code === 'CUSTOM' && rootToSave === selectedRoot) ||
                   (dataOverride?.derivatives?.[0]?.dict_code === 'CUSTOM') ||
                   (sidebarTab === 'custom' && rootToSave === selectedRoot);

    if (isCustom && !rootData?.derivatives?.length && !dataOverride) {
      showNotification('Plant your Kilang first!', 'info');
      return;
    }

    if (isCustom && customInputDirty) {
      showNotification('Plant your modified Kilang first!', 'info');
      return;
    }
    
    const existing = bookmarks.find(b => b.root === rootToSave);
    const newBookmark = {
      id: existing?.id || Date.now().toString(),
      root: rootToSave,
      type: isCustom ? 'custom' : 'db',
      data: isCustom ? (dataOverride || (rootToSave === selectedRoot ? rootData : null)) : null,
      timestamp: new Date().toISOString(),
      count: countOverride ?? (rootToSave === selectedRoot ? rootData?.derivatives?.length : 0),
      isPinned: existing?.isPinned || false
    };

    const updated = [newBookmark, ...bookmarks.filter(b => b.root !== rootToSave)];
    setBookmarks(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    showNotification(`${isCustom ? 'Custom Kilang' : 'Kilang'} saved to Library`);
    if (!rootOverride) setShowMyTrees(true);
  };

  const togglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = bookmarks.map(b => b.id === id ? { ...b, isPinned: !b.isPinned } : b);
    setBookmarks(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const sortedBookmarks = [...bookmarks].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const loadBookmark = (bookmark: any) => {
    if (bookmark.type === 'custom' && bookmark.data) {
      dispatch({ type: 'SET_CUSTOM_DATA', data: bookmark.data });
    } else {
      fetchRootDetails(bookmark.root);
    }
  };

  const setSidebarTab = (tab: 'forest' | 'styling' | 'custom') => {
    dispatch({ type: 'SET_UI', sidebarTab: tab });
  };

  const updateConfig = (config: Partial<KilangState['layoutConfig']>) => {
    dispatch({ type: 'SET_LAYOUT_CONFIG', config });
  };

  if (isCollapsed) {
    return (
      <aside className="w-16 border-r border-white/5 flex flex-col items-center py-6 kilang-glass-panel transition-all duration-300">
        <button
          onClick={onToggle}
          className="p-3 rounded-xl bg-white/5 border border-white/10 text-kilang-text-muted hover:text-white hover:bg-blue-600/20 hover:border-blue-500/50 transition-all shadow-lg"
          title="Expand Forest"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="mt-8 flex flex-col items-center gap-6">
          <button onClick={() => { onToggle(); setSidebarTab('forest'); }} className={`p-2 rounded-lg transition-all ${sidebarTab === 'forest' ? 'text-blue-400 bg-blue-500/10' : 'text-kilang-text-muted/40 hover:text-white'}`}>
            <Search className="w-5 h-5" />
          </button>
          <button onClick={() => { onToggle(); setSidebarTab('styling'); }} className={`p-2 rounded-lg transition-all ${sidebarTab === 'styling' ? 'text-blue-400 bg-blue-500/10' : 'text-kilang-text-muted/40 hover:text-white'}`}>
            <Settings2 className="w-5 h-5" />
          </button>
          <button onClick={() => { onToggle(); setSidebarTab('custom'); }} className={`p-2 rounded-lg transition-all ${sidebarTab === 'custom' ? 'text-blue-400 bg-blue-500/10' : 'text-kilang-text-muted/40 hover:text-white'}`}>
            <PenTool className="w-5 h-5" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-96 border-r border-white/5 flex flex-col kilang-glass-panel transition-all duration-300 relative overflow-hidden">
      <button
        onClick={onToggle}
        className="absolute -right-4 top-10 w-8 h-8 rounded-full bg-[#1e293b] border border-white/10 flex items-center justify-center text-kilang-text-muted hover:text-white hover:border-blue-500 shadow-xl z-[60] transition-all group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:scale-110 transition-transform" />
      </button>

      {/* Tab Switcher */}
      <div className="flex border-b border-white/5 bg-[#0f172a]/50 p-1 m-4 rounded-2xl">
        <button
          onClick={() => setSidebarTab('forest')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sidebarTab === 'forest' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
        >
          <Search className="w-3.5 h-3.5" />
          Forest
        </button>
        <button
          onClick={() => setSidebarTab('styling')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sidebarTab === 'styling' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
        >
          <Settings2 className="w-3.5 h-3.5" />
          Styling
        </button>
        <button
          onClick={() => setSidebarTab('custom')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sidebarTab === 'custom' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
        >
          <PenTool className="w-3.5 h-3.5" />
          Custom
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar no-scrollbar">
        {sidebarTab === 'forest' && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            {/* 1. Header Controls */}
            <div className="p-6 pt-0 space-y-6">
              <div className="flex gap-2">
                <div className="relative group flex-1">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-kilang-text-muted group-focus-within:text-blue-500" />
                  <input
                    type="text"
                    placeholder="Search semantic roots..."
                    value={searchTerm}
                    onChange={(e) => {
                      dispatch({ type: 'SET_UI', searchTerm: e.target.value });
                      if (showMyTrees) setShowMyTrees(false);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => dispatch({ type: 'SET_UI', searchTerm: '' })}
                      className="absolute right-3 top-3 text-kilang-text-muted hover:text-white transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowMyTrees(!showMyTrees)}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center border bg-blue-600/20 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/10 transition-all hover:bg-blue-600/30 hover:scale-105 active:scale-95`}
                  title={showMyTrees ? "Back to Forest" : "My Trees"}
                >
                  {showMyTrees ? <Filter className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                </button>
              </div>

              {!showMyTrees ? (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 text-xs font-bold text-kilang-text-muted uppercase tracking-widest px-1">
                    <Filter className="w-3.5 h-3.5" />
                    Branches Count
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    <button onClick={() => dispatch({ type: 'SET_UI', branchFilter: 'all' })} className={`py-2 rounded-lg border text-[10px] font-black ${branchFilter === 'all' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-kilang-text-muted'}`}>ANY</button>
                    {FILTER_BUCKETS.map((bucket) => (
                      <button key={bucket.label} onClick={() => dispatch({ type: 'SET_UI', branchFilter: bucket.label })} className={`py-2 rounded-lg border text-[10px] font-black flex flex-col items-center justify-center ${branchFilter === bucket.label ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-kilang-text-muted'}`}>
                        <span>{bucket.label}</span>
                        <span className="text-[8px] opacity-60 mt-0.5">({bucketHits[bucket.label] || 0})</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest px-1 animate-in slide-in-from-left-2 duration-300">
                  <Bookmark className="w-3.5 h-3.5" />
                  My Private Forest
                </div>
              )}
            </div>

            <div className="px-6 pb-20 space-y-2">
              {!showMyTrees ? (
                <>
                  {filteredRoots.map((r, i) => (
                    <WordTooltip
                      key={i}
                      word={r.root}
                      summaryCache={summaryCache}
                      fetchSummary={fetchSummary}
                      className="w-full block relative"
                    >
                      <div className={`px-4 py-2.5 rounded-xl watering-can-cursor transition-all border flex items-center justify-between group/item ${selectedRoot === r.root ? 'bg-blue-600/20 border-blue-500/50 shadow-lg shadow-blue-500/5' : 'bg-white/5 border-white/5 hover:border-white/20'}`}>
                        <span className="text-[13px] font-bold text-white uppercase tracking-tight" onClick={() => fetchRootDetails(r.root)}>{r.root}</span>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); saveBookmark(r.root, 'db', null, r.count); }}
                            className={`opacity-0 group-hover/item:opacity-100 p-2 rounded-lg transition-all border shadow-lg ${bookmarks.find(b => b.root === r.root) ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'bg-transparent border-blue-500/20 text-blue-400/40 hover:text-blue-400 hover:border-blue-500/50'}`}
                            title="Quick Save"
                          >
                            <Bookmark className={`w-4 h-4 ${bookmarks.find(b => b.root === r.root) ? 'fill-blue-400' : ''}`} />
                          </button>
                          <span className="text-xs font-black text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md" onClick={() => fetchRootDetails(r.root)}>{r.count}</span>
                        </div>
                      </div>
                    </WordTooltip>
                  ))}
                </>
              ) : (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                  {bookmarks.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                      <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 border border-indigo-500/20">
                        <Bookmark className="w-5 h-5 text-indigo-400 opacity-20" />
                      </div>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-relaxed">Your bookmark library is empty</p>
                      <p className="text-[8px] text-white/10 mt-2">Click the bookmark icon in any tree to save it here</p>
                    </div>
                  ) : (
                    sortedBookmarks.map((b, idx) => {
                      const isLastPinned = b.isPinned && (!sortedBookmarks[idx + 1] || !sortedBookmarks[idx + 1].isPinned);
                      return (
                        <React.Fragment key={b.id}>
                          <WordTooltip
                            word={b.root}
                            summaryCache={summaryCache}
                            fetchSummary={fetchSummary}
                            className="w-full block relative"
                          >
                            <div 
                              onClick={() => loadBookmark(b)}
                              className={`group px-4 py-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${selectedRoot === b.root ? 'bg-indigo-600/20 border-indigo-500/50' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                            >
                              <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-lg min-w-[32px] text-center">{b.count || 0}</span>
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-black text-white uppercase tracking-tight">{b.root}</span>
                                    {b.type === 'custom' && (
                                      <span className="text-[7px] px-1.5 py-0.5 rounded font-black uppercase bg-blue-500/20 text-blue-400">
                                        custom
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[7px] font-mono text-white/20">{new Date(b.timestamp).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={(e) => togglePin(b.id, e)}
                                  className={`p-1.5 rounded-lg transition-all ${b.isPinned ? 'text-yellow-500 bg-yellow-500/10' : 'text-white/10 hover:text-white/40 opacity-0 group-hover:opacity-100'}`}
                                  title={b.isPinned ? "Unpin" : "Pin to Top"}
                                >
                                  <Pin className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={(e) => deleteBookmark(b.id, e)}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-white/10 hover:text-red-400 transition-all"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </WordTooltip>
                          {isLastPinned && sortedBookmarks.length > idx + 1 && (
                            <div className="py-4 px-1">
                              <div className="h-px w-full bg-white/10" />
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {sidebarTab === 'styling' && (
          <div className="p-6 animate-in fade-in slide-in-from-left-4 duration-500 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-blue-400" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Visual Styling</h3>
              </div>
              <button
                onClick={() => dispatch({ type: 'RESET_LAYOUT_CONFIG' })}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 transition-all hover:text-white"
                title="Reset Defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Spacing */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/30">
                <SlidersHorizontal className="w-3 h-3" />
                <span>Layout Spacing</span>
              </div>
              <div className="space-y-4 pl-1">
                <SidebarSlider label="Tier (H)" value={layoutConfig.interTierGap} min={10} max={600} step={10} unit="px" onChange={(v: number) => updateConfig({ interTierGap: v })} />
                <SidebarSlider label="Row (V)" value={layoutConfig.interRowGap} min={10} max={600} step={5} unit="px" onChange={(v: number) => updateConfig({ interRowGap: v })} />
                <SidebarSlider label="0-1 Gap" value={layoutConfig.coupleGaps ? layoutConfig.interTierGap : layoutConfig.rootGap} min={0} max={600} step={10} unit="px" disabled={layoutConfig.coupleGaps} onChange={(v: number) => updateConfig({ rootGap: v })} />

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[8px] font-black uppercase tracking-widest text-blue-400/80">Spacing Mode</span>
                  <button onClick={() => updateConfig({ spacingMode: layoutConfig.spacingMode === 'even' ? 'log' : 'even' })} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${layoutConfig.spacingMode === 'log' ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400' : 'bg-white/5 border-white/10 text-white/30 hover:border-white/30'}`}>
                    <span className="text-[8px] font-black uppercase">{layoutConfig.spacingMode === 'even' ? 'Even' : 'Log'}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[8px] font-black uppercase tracking-widest text-blue-400/80">Coupled Gaps</span>
                  <button onClick={() => updateConfig({ coupleGaps: !layoutConfig.coupleGaps })} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${layoutConfig.coupleGaps ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-400' : 'bg-white/5 border-white/10 text-white/30 hover:border-white/30'}`}>
                    <span className="text-[8px] font-black uppercase">{layoutConfig.coupleGaps ? 'Coupled' : 'Decoupled'}</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Path Twitch */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/30">
                <PencilLine className="w-3 h-3" />
                <span>SVG Path Twitch</span>
              </div>
              <div className="grid grid-cols-2 gap-4 pl-1">
                <SidebarSlider label="Gap X" value={layoutConfig.lineGapX} min={-100} max={300} step={5} unit="px" onChange={(v: number) => updateConfig({ lineGapX: v })} />
                <SidebarSlider label="Gap Y" value={layoutConfig.lineGapY} min={-100} max={300} step={5} unit="px" onChange={(v: number) => updateConfig({ lineGapY: v })} />
              </div>
            </section>

            {/* Geometry */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/30">
                <Scaling className="w-3 h-3" />
                <span>Node Geometry</span>
              </div>
              <div className="space-y-4 pl-1">
                <div className="grid grid-cols-2 gap-4">
                  <SidebarSlider label="Size" value={layoutConfig.nodeSize} min={0.5} max={2} step={0.1} unit="x" onChange={(v: number) => updateConfig({ nodeSize: v })} />
                  <SidebarSlider label="Rounding" value={layoutConfig.nodeRounding} min={0} max={50} step={2} unit="px" onChange={(v: number) => updateConfig({ nodeRounding: v })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <SidebarSlider label="Opacity" value={layoutConfig.nodeOpacity} min={0.1} max={1} step={0.05} unit="" onChange={(v: number) => updateConfig({ nodeOpacity: v })} />
                  <SidebarSlider label="Word Width" value={layoutConfig.nodeWidth} min={80} max={250} step={5} unit="px" onChange={(v: number) => updateConfig({ nodeWidth: v })} />
                </div>
                <SidebarSlider label="Vert Padding" value={layoutConfig.nodePaddingY} min={4} max={32} step={1} unit="px" onChange={(v: number) => updateConfig({ nodePaddingY: v })} />

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[8px] font-black uppercase tracking-widest text-blue-400/80">Tree Icons</span>
                  <button onClick={() => updateConfig({ showIcons: !layoutConfig.showIcons })} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${layoutConfig.showIcons ? 'bg-blue-600/20 border-blue-500/40 text-blue-400' : 'bg-white/5 border-white/10 text-white/30 hover:border-white/30'}`}>
                    {layoutConfig.showIcons ? <Zap className="w-3 h-3" /> : <ZapOff className="w-3 h-3" />}
                    <span className="text-[8px] font-black uppercase">{layoutConfig.showIcons ? 'Visible' : 'Hidden'}</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Anchors */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/30">
                <Maximize2 className="w-3 h-3" />
                <span>Root Anchor</span>
              </div>
              <div className="space-y-4 pl-1">
                <div className="grid grid-cols-2 gap-4">
                  <SidebarSlider label="X (px)" value={layoutConfig.anchorX} min={0} max={2000} step={10} unit="px" onChange={(v: number) => updateConfig({ anchorX: v })} />
                  <SidebarSlider label="Y (px)" value={layoutConfig.anchorY} min={0} max={2000} step={10} unit="px" onChange={(v: number) => updateConfig({ anchorY: v })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <SidebarSlider label="X (%)" value={Math.round((layoutConfig.anchorX / 2000) * 100)} min={0} max={100} step={1} unit="%" onChange={(v: number) => updateConfig({ anchorX: (v / 100) * 2000 })} />
                  <SidebarSlider label="Y (%)" value={Math.round((layoutConfig.anchorY / 2000) * 100)} min={0} max={100} step={1} unit="%" onChange={(v: number) => updateConfig({ anchorY: (v / 100) * 2000 })} />
                </div>
              </div>
            </section>

            {/* Aesthetics */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/30">
                <Palette className="w-3 h-3" />
                <span>Aesthetics</span>
              </div>
              <div className="grid grid-cols-2 gap-4 pl-1">
                <ColorPicker label="Root" value={layoutConfig.rootColor} onChange={(v: string) => updateConfig({ rootColor: v })} />
                <ColorPicker label="Branch" value={layoutConfig.branchColor} onChange={(v: string) => updateConfig({ branchColor: v })} />
                <ColorPicker label="Line Start" value={layoutConfig.lineColor} onChange={(v: string) => updateConfig({ lineColor: v })} />
                <ColorPicker label="Line Mid" value={layoutConfig.lineColorMid} onChange={(v: string) => updateConfig({ lineColorMid: v })} />
                <ColorPicker label="Line End" value={layoutConfig.lineGradientEnd} onChange={(v: string) => updateConfig({ lineGradientEnd: v })} />
              </div>
            </section>

            <div className="pb-20" />
          </div>
        )}

        {sidebarTab === 'custom' && (
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar animate-in slide-in-from-right duration-500">
            <div className="space-y-6">
              <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                    <PenTool className="w-3 h-3" />
                    <span>Custom Tree Architect</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowTips(!showTips)}
                      className={`p-1.5 rounded-lg transition-all ${showTips ? 'bg-blue-500/20 text-blue-400' : 'text-white/20 hover:text-white/40'}`}
                      title="Usage Tips"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {showTips && (
                  <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                    <h4 className="text-[8px] font-black uppercase tracking-widest text-blue-400 mb-2">Usage Tips</h4>
                    <ul className="text-[8px] text-white/50 space-y-1 list-disc pl-3 leading-relaxed">
                      <li>First line is the Root node</li>
                      <li>Indent children words to link them to parents</li>
                      <li>Click 'Plant' to override current view</li>
                      <li>Switch tabs to adjust spacing of your custom forest</li>
                    </ul>
                  </div>
                )}
                
                <p className="text-[9px] text-white/40 leading-relaxed italic mb-4">
                  Type your root first, then derivative words on new lines. Use spaces or tab to define branching hierarchy.
                </p>

                <textarea
                  className="w-full h-64 bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-mono text-white/80 focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/10"
                  placeholder={"Root\n  Child 1\n    Grandchild\n  Child 2"}
                  value={customInput}
                  onChange={(e) => {
                    setCustomInput(e.target.value);
                    setCustomInputDirty(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Tab') {
                      e.preventDefault();
                      const target = e.target as HTMLTextAreaElement;
                      const start = target.selectionStart;
                      const end = target.selectionEnd;

                      const newVal = customInput.substring(0, start) + "  " + customInput.substring(end);
                      setCustomInput(newVal);
                      setCustomInputDirty(true);
                      
                      // Wait for re-render to set selection
                      setTimeout(() => {
                        target.selectionStart = target.selectionEnd = start + 2;
                      }, 0);
                    }
                  }}
                />

                <button
                  onClick={() => {
                    if (!customInput) return;
                    setCustomInputDirty(false);
                    const lines = customInput.split('\n').filter(l => l.trim().length > 0);
                    if (lines.length === 0) return;

                    const root = lines[0].trim();
                    const normalizedRoot = normalizeWord(root);
                    const derivatives: any[] = [];
                    const stack: { word: string, normalized: string, indent: number }[] = [
                      { word: root, normalized: normalizedRoot!, indent: -1 }
                    ];

                    for (let i = 1; i < lines.length; i++) {
                      const line = lines[i];
                      const indent = line.search(/\S/);
                      const rawWord = line.trim();
                      const normalizedWordStr = normalizeWord(rawWord);

                      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
                        stack.pop();
                      }

                      const parentObj = stack[stack.length - 1];
                      const tier = stack.length;

                      derivatives.push({
                        word_ab: normalizedWordStr,
                        raw_word: rawWord, // keep raw for display if needed
                        parentWord: parentObj.normalized,
                        tier: tier,
                        dict_code: 'CUSTOM'
                      });

                      stack.push({ word: rawWord, normalized: normalizedWordStr!, indent });
                    }

                    dispatch({
                      type: 'SET_CUSTOM_DATA',
                      data: { root, derivatives } as any
                    });
                  }}
                  className="w-full mt-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  Plant Custom Tree
                </button>

                <button
                  onClick={() => saveBookmark()}
                  className={`w-full mt-2 py-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 
                    ${(bookmarks.find(b => b.root === selectedRoot) && !customInputDirty)
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/10' 
                      : (!customInputDirty && selectedRoot)
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/10'
                        : 'bg-white/5 border-white/10 text-white/20 hover:text-white/40 hover:bg-white/10'}`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${(bookmarks.find(b => b.root === selectedRoot) && !customInputDirty) ? 'fill-white' : ''}`} />
                  {bookmarks.find(b => b.root === selectedRoot) && !customInputDirty ? 'Saved' : 'Save Kilang'}
                </button>

                <button
                  onClick={() => setSidebarTab('forest')}
                  className="w-full mt-2 py-3 rounded-xl border border-white/5 bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-3.5 h-3.5" />
                  Go to Forest
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {toast && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[99999] animate-in slide-in-from-bottom-8 duration-500">
          <div className={`flex items-center gap-6 px-10 py-6 bg-[#0f172a]/95 backdrop-blur-3xl border rounded-[32px] shadow-[0_0_100px_rgba(0,0,0,0.8)] border-b-8 transition-all ${toast.type === 'success' ? 'border-blue-500/40 border-b-blue-500/60' : 'border-indigo-500/40 border-b-indigo-500/60'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center animate-bounce ${toast.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-indigo-500/10 border border-indigo-500/20'}`}>
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              ) : (
                <Zap className="w-8 h-8 text-indigo-400" />
              )}
            </div>
            <span className="text-xs font-black text-white uppercase tracking-[0.3em]">{toast.message}</span>
          </div>
        </div>
      )}
    </aside>
  );
};

/* Helper Components */
const SidebarSlider = ({ label, value, min, max, step, unit, disabled, onChange }: any) => (
  <div className={`space-y-2 transition-all duration-300 ${disabled ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-white/40">
      <span className="text-blue-400/60">{label}</span>
      <span className="font-mono">{value}{unit}</span>
    </div>
    <input
      type="range"
      min={min} max={max} step={step}
      value={value ?? min ?? 0}
      disabled={disabled}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
    />
  </div>
);

const ColorPicker = ({ label, value, onChange }: any) => (
  <div className="space-y-2">
    <span className="text-[7px] font-black uppercase tracking-widest text-white/30">{label}</span>
    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
      <input
        type="color"
        value={value ?? '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="w-6 h-6 bg-transparent border-none rounded cursor-pointer"
      />
    </div>
  </div>
);
