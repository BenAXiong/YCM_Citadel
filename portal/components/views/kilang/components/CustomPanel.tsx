'use client';

import React from 'react';
import { PenTool, Info, GitBranch, Library } from 'lucide-react';
import { useKilangContext } from '../KilangContext';
import { useKilangBookmarks } from '../hooks/useKilangBookmarks';
import { useCustomTree } from '../hooks/useCustomTree';

export const CustomPanel = () => {
  const { state, dispatch } = useKilangContext();
  const { showCustomPanel, selectedRoot } = state;

  const {
    bookmarks,
    saveBookmark,
  } = useKilangBookmarks(state.selectedRoot, state.rootData, dispatch, state);

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

  if (!showCustomPanel) return null;

  return (
    <div 
      className="fixed z-[200] p-4 bg-[var(--kilang-bg-base)]/80 backdrop-blur-2xl border border-[var(--kilang-border-std)] rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] animate-in slide-in-from-top-4 duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
      style={{ 
        top: '96px',
        left: 'calc(var(--sidebar-width) + 32px)',
        width: '328px'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[10px] font-black text-[var(--kilang-primary)] uppercase tracking-widest">
          <PenTool className="w-3 h-3" />
          <span>Custom Tree Architect</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTips(!showTips)}
            className={`p-1.5 rounded-lg transition-all ${showTips ? 'bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)]' : 'text-[var(--kilang-text-muted)] hover:bg-[var(--kilang-ctrl-bg)] hover:text-[var(--kilang-text)]'}`}
            title="Usage Tips"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showTips && (
        <div className="mb-4 p-3 bg-[var(--kilang-primary)]/10 border border-[var(--kilang-primary)]/20 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
          <h4 className="text-[8px] font-black uppercase tracking-widest text-[var(--kilang-primary)] mb-2">Usage Tips</h4>
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
        className="w-full h-48 bg-black/40 border border-[var(--kilang-border-std)] rounded-xl p-4 text-xs font-mono text-[var(--kilang-text)]/80 focus:outline-none focus:border-[var(--kilang-primary)]/50 transition-all placeholder:text-[var(--kilang-text-muted)]/20 custom-scrollbar"
        placeholder={"Root\n  Child 1\n    Grandchild\n  Child 2"}
        value={customInput}
        onChange={(e) => {
          setCustomInput(e.target.value);
          setCustomInputDirty(true);
        }}
        onKeyDown={onTabKeyDown}
      />

      <div className="flex gap-2 mt-4">
        <button
          onClick={handlePlant}
          className="flex-1 py-3 rounded-xl bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)] text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-[var(--kilang-shadow-primary)] active:scale-95 flex items-center justify-center gap-2"
        >
          <GitBranch className="w-3.5 h-3.5" />
          Plant Kilang
        </button>

        <button
          onClick={() => saveBookmark()}
          className={`flex-1 py-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 
            ${(bookmarks.find(b => b.root === selectedRoot) && !customInputDirty)
              ? 'bg-[var(--kilang-secondary)]/20 border-[var(--kilang-secondary)]/50 text-white shadow-lg shadow-[var(--kilang-secondary)]/10'
              : (!customInputDirty && selectedRoot)
                ? 'bg-[var(--kilang-primary)]/20 border-[var(--kilang-primary)] text-[var(--kilang-primary)] shadow-lg shadow-[var(--kilang-primary)]/10'
                : 'bg-[var(--kilang-ctrl-bg)] border-[var(--kilang-border-std)] text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)] hover:bg-[var(--kilang-ctrl-bg)]/80'}`}
        >
          <Library className={`w-3.5 h-3.5 ${(bookmarks.find(b => b.root === selectedRoot) && !customInputDirty) ? 'fill-white' : ''}`} />
          {bookmarks.find(b => b.root === selectedRoot) && !customInputDirty ? 'Saved' : 'Save Kilang'}
        </button>
      </div>
    </div>
  );
};
