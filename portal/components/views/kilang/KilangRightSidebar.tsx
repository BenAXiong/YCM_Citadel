'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useKilangContext } from './KilangContext';
import { MetaPanel } from './components/sidebar/MetaPanel';

interface KilangRightSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const KilangRightSidebar = ({ isCollapsed, onToggle }: KilangRightSidebarProps) => {
  const { state, dispatch } = useKilangContext();
  const { 
    rightSidebarTab, 
    rightSidebarWidth, 
    canvasSelectedNode, 
    rootData, 
    selectedRoot, 
    showTreeTab, 
    summaryCache 
  } = state;

  const handleResize = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.pageX;
    const startWidth = rightSidebarWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = startX - moveEvent.pageX;
      const newWidth = Math.max(260, Math.min(600, startWidth + delta));
      dispatch({ type: 'SET_UI', rightSidebarWidth: newWidth });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
  }, [rightSidebarWidth, dispatch]);

  const setTab = (tab: 'txt' | 'sent' | 'met') => {
    dispatch({ type: 'SET_UI', rightSidebarTab: tab });
  };

  return (
    <aside
      className={`relative h-full flex flex-col kilang-glass-panel transition-all duration-300 ease-in-out z-50 ${isCollapsed ? 'w-0 border-l-0 overflow-visible' : 'border-l border-[var(--kilang-border-std)] overflow-visible'}`}
      style={{ width: isCollapsed ? '0px' : `${rightSidebarWidth}px` }}
    >
      {/* Resize Handle */}
      {!isCollapsed && (
        <div
          onMouseDown={handleResize}
          className="absolute left-0 top-0 w-1 h-full cursor-col-resize hover:bg-[var(--kilang-primary)]/50 transition-colors z-50"
        />
      )}

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className={`absolute ${isCollapsed ? '-left-[21px]' : '-left-[22px]'} top-[22px] w-[22px] h-[30px] rounded-l-lg rounded-r-none flex items-center justify-center bg-[var(--kilang-bg-base)] border-y border-l border-[var(--kilang-border-std)] text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)] hover:bg-[var(--kilang-primary)]/20 hover:border-[var(--kilang-primary)]/50 shadow-[-4px_0_15px_var(--kilang-shadow-color)] z-[100] transition-all group`}
        title={isCollapsed ? "Expand" : "Collapse"}
      >
        {isCollapsed ? (
          <ChevronLeft className="w-4 h-4 group-hover:scale-125 transition-transform" />
        ) : (
          <ChevronRight className="w-4 h-4 group-hover:scale-125 transition-transform" />
        )}
      </button>

      {/* Main Content Area */}
      {!isCollapsed && (
        <MetaPanel
          rightSidebarTab={rightSidebarTab}
          setTab={setTab}
          showTreeTab={showTreeTab}
          canvasSelectedNode={canvasSelectedNode}
          selectedRoot={selectedRoot}
          rootData={rootData}
          summaryCache={summaryCache}
          dispatch={dispatch}
        />
      )}

      {isCollapsed && (
        <div className="hidden" />
      )}
    </aside>
  );
};
