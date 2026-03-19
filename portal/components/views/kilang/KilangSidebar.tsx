'use client';

import React from 'react';
import { Search, Settings2, PenTool, ChevronLeft, ChevronRight, CheckCircle2, Zap } from 'lucide-react';
import { KilangState, KilangAction } from './kilangReducer';

// Hooks
import { useKilangBookmarks } from './hooks/useKilangBookmarks';
import { useCustomTree } from './hooks/useCustomTree';

// Shared Context & Types
import { SidebarProvider, useSidebar } from './SidebarContext';
import { Bookmark } from './KilangTypes';

// Components
import { ForestTab } from './components/ForestTab';
import { StylingTab } from './components/StylingTab';
import { CustomTab } from './components/CustomTab';

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

export const KilangSidebar = (props: KilangSidebarProps) => {
  return <KilangSidebarInner {...props} />;
};

const KilangSidebarInner = ({ isCollapsed, onToggle }: KilangSidebarProps) => {
  const {
    state, dispatch, filteredRoots, fetchRootDetails,
    bucketHits, FILTER_BUCKETS, summaryCache, fetchSummary,
    sidebarTab, setSidebarTab, showMyTrees, setShowMyTrees,
    toggleSection, collapsedSections
  } = useSidebar();

  const { selectedRoot, layoutConfig, rootData } = state;

  const {
    bookmarks,
    sortedBookmarks,
    toast,
    showPlusOne,
    showMinusOne,
    saveBookmark,
    togglePin,
    deleteBookmark,
    loadBookmark
  } = useKilangBookmarks(selectedRoot, rootData, dispatch);

  const containerRef = React.useRef<HTMLElement | null>(null);
  React.useEffect(() => {
    containerRef.current = document.querySelector('.kilang-container');
  }, []);

  const {
    customInput,
    setCustomInput,
    customInputDirty,
    setCustomInputDirty,
    showTips,
    setShowTips,
    onTabKeyDown,
    handlePlant
  } = useCustomTree(dispatch);
  const { sidebarWidth } = state;
  const [isResizing, setIsResizing] = React.useState(false);

  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.pageX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.pageX - startX);
      if (newWidth >= 260 && newWidth <= 600) {
        if (containerRef.current) {
          containerRef.current.style.setProperty('--sidebar-width', `${newWidth}px`);
        }
      }
    };

    const handleMouseUp = (endEvent: MouseEvent) => {
      setIsResizing(false);
      const finalWidth = startWidth + (endEvent.pageX - startX);
      const constrainedWidth = Math.max(260, Math.min(600, finalWidth));
      dispatch({ type: 'SET_SIDEBAR_WIDTH', width: constrainedWidth });

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
  }, [sidebarWidth, dispatch]);

  const updateConfig = (config: Partial<KilangState['layoutConfig']>) => {
    dispatch({ type: 'SET_LAYOUT_CONFIG', config });
  };

  if (isCollapsed) {
    return (
      <aside className="w-0 border-r-0 flex flex-col items-center py-6 kilang-glass-panel relative z-50 overflow-visible transition-all duration-300">
        {/* Sidebar Expansion Tab (Collapsed State) */}
        <button
          onClick={onToggle}
          className="absolute -right-[21px] top-[22px] w-[22px] h-[48px] rounded-r-xl rounded-l-none bg-[#1e293b] border-y border-r border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-blue-600/40 hover:border-blue-500/50 shadow-[4px_0_15px_rgba(0,0,0,0.3)] z-[100] transition-all group"
          title="Expand"
        >
          <ChevronRight className="w-4 h-4 group-hover:scale-125 transition-transform" />
        </button>

        <div className="hidden">
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
    <aside
      className={`border-r border-white/5 flex flex-col kilang-glass-panel relative z-50 overflow-visible group/sidebar ${isResizing ? '' : 'transition-all duration-300'}`}
      style={{ width: 'var(--sidebar-width)' } as React.CSSProperties}
    >
      {/* Resizer Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize z-[70] hover:bg-blue-500/30 transition-colors group-hover/sidebar:bg-white/5 active:bg-blue-500/50"
      />

      {/* Sidebar Toggle Tab (Expanded State) */}
      <button
        onClick={onToggle}
        className="absolute -right-[22px] top-[22px] w-[22px] h-[30px] rounded-r-lg rounded-l-none bg-[#1e293b] border-y border-r border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-blue-600/40 hover:border-blue-500/50 shadow-[4px_0_15px_rgba(0,0,0,0.3)] z-[100] transition-all group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:scale-125 transition-transform" />
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
          <ForestTab
            bookmarks={bookmarks}
            sortedBookmarks={sortedBookmarks}
            saveBookmark={(r, t, d, c) => saveBookmark(r, t, d, c, sidebarTab, customInputDirty)}
            togglePin={togglePin}
            deleteBookmark={deleteBookmark}
            loadBookmark={(b) => loadBookmark(b, fetchRootDetails)}
            showPlusOne={showPlusOne}
            showMinusOne={showMinusOne}
          />
        )}

        {sidebarTab === 'styling' && (
          <StylingTab
            updateConfig={updateConfig}
          />
        )}

        {sidebarTab === 'custom' && (
          <CustomTab
            showTips={showTips}
            setShowTips={setShowTips}
            customInput={customInput}
            setCustomInput={setCustomInput}
            setCustomInputDirty={setCustomInputDirty}
            onTabKeyDown={onTabKeyDown}
            handlePlant={handlePlant}
            saveBookmark={() => saveBookmark(undefined, undefined, undefined, undefined, sidebarTab, customInputDirty)}
            bookmarks={bookmarks}
            customInputDirty={customInputDirty}
          />
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
