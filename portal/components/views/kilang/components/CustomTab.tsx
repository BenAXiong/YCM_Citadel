import { PenTool, Info, GitBranch, Library, Search } from 'lucide-react';
import { useSidebar } from '../SidebarContext';

interface CustomTabProps {
  showTips: boolean;
  setShowTips: (val: boolean) => void;
  customInput: string;
  setCustomInput: (val: string) => void;
  setCustomInputDirty: (val: boolean) => void;
  onTabKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handlePlant: () => void;
  saveBookmark: () => void;
  bookmarks: import('../KilangTypes').Bookmark[];
  customInputDirty: boolean;
}

export const CustomTab = ({
  showTips,
  setShowTips,
  customInput,
  setCustomInput,
  setCustomInputDirty,
  onTabKeyDown,
  handlePlant,
  saveBookmark,
  bookmarks,
  customInputDirty
}: CustomTabProps) => {
  const { state, setSidebarTab, setShowMyTrees } = useSidebar();
  const { selectedRoot } = state;
  return (
    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar animate-in slide-in-from-right duration-500">
      <div className="space-y-6">
        <div className="p-4 bg-[var(--kilang-primary)]/5 border border-[var(--kilang-primary)]/20 rounded-2xl">
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
            className="w-full h-64 bg-[var(--kilang-bg-base)]/40 border border-[var(--kilang-border-std)] rounded-xl p-4 text-xs font-mono text-[var(--kilang-text)]/80 focus:outline-none focus:border-[var(--kilang-primary)]/50 transition-all placeholder:text-[var(--kilang-text-muted)]/20"
            placeholder={"Root\n  Child 1\n    Grandchild\n  Child 2"}
            value={customInput}
            onChange={(e) => {
              setCustomInput(e.target.value);
              setCustomInputDirty(true);
            }}
            onKeyDown={onTabKeyDown}
          />

          <button
            onClick={handlePlant}
            className="w-full mt-4 py-3 rounded-xl bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)] text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-[var(--kilang-shadow-primary)] active:scale-95 flex items-center justify-center gap-2"
          >
            <GitBranch className="w-3.5 h-3.5" />
            Plant Custom Tree
          </button>

          <button
            onClick={() => saveBookmark()}
            className={`w-full mt-2 py-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 
              ${(bookmarks.find(b => b.root === selectedRoot) && !customInputDirty)
                ? 'bg-[var(--kilang-secondary)]/20 border-[var(--kilang-secondary)]/50 text-white shadow-lg shadow-[var(--kilang-secondary)]/10'
                : (!customInputDirty && selectedRoot)
                  ? 'bg-[var(--kilang-primary)]/20 border-[var(--kilang-primary)] text-[var(--kilang-primary)] shadow-lg shadow-[var(--kilang-primary)]/10'
                  : 'bg-[var(--kilang-ctrl-bg)] border-[var(--kilang-border-std)] text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)] hover:bg-[var(--kilang-ctrl-bg)]/80'}`}
          >
            <Library className={`w-3.5 h-3.5 ${(bookmarks.find(b => b.root === selectedRoot) && !customInputDirty) ? 'fill-white' : ''}`} />
            {bookmarks.find(b => b.root === selectedRoot) && !customInputDirty ? 'Saved' : 'Save Kilang'}
          </button>

          <button
            onClick={() => {
              setSidebarTab('forest');
              setShowMyTrees(true);
            }}
            className="w-full mt-2 py-3 rounded-xl border border-[var(--kilang-border-std)] bg-[var(--kilang-ctrl-bg)] text-[var(--kilang-text-muted)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--kilang-ctrl-bg)]/80 hover:text-[var(--kilang-text)] transition-all flex items-center justify-center gap-2"
          >
            <Library className="w-3.5 h-3.5" />
            Go to Forest
          </button>
        </div>
      </div>
    </div>
  );
};
