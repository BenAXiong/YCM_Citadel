'use client';

import React from 'react';
import {
  Download,
  ChevronDown,
  ImageIcon,
  FileText
} from 'lucide-react';
import { KilangAction, KilangState } from './kilangReducer';

interface KilangExportHUDProps {
  exportSettings: KilangState['exportSettings'];
  showExportDropdown: boolean;
  exporting: boolean;
  dispatch: React.Dispatch<KilangAction>;
  handleExport: () => void;
  dropdownPosition?: 'top' | 'bottom';
  align?: 'left' | 'right';
  variant?: 'header' | 'canvas';
  className?: string;
}

export const KilangExportHUD = ({
  exportSettings,
  showExportDropdown,
  exporting,
  dispatch,
  handleExport,
  dropdownPosition = 'top',
  align = 'left',
  variant = 'header',
  className = ''
}: KilangExportHUDProps) => {
  const exportRef = React.useRef<HTMLDivElement>(null);

  // Auto-close export dropdown on outside click
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        dispatch({ type: 'SET_UI', showExportDropdown: false });
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dispatch]);

  const dropdownClasses = `
    absolute z-[120] p-4 text-left shadow-2xl animate-in fade-in duration-200
    ${dropdownPosition === 'top' ? 'top-full mt-2 slide-in-from-top-2' : 'bottom-full mb-3 slide-in-from-bottom-2'}
    ${align === 'left' ? 'left-0' : 'right-0'}
    ${variant === 'header' ? 'w-56 bg-[var(--kilang-bg-base)]/95 backdrop-blur-xl border border-[var(--kilang-border-std)] rounded-xl' : 'w-64 bg-[var(--kilang-bg-base)]/90 backdrop-blur-xl border border-[var(--kilang-border-std)] rounded-2xl'}
  `;

  const containerClasses = variant === 'header'
    ? 'kilang-ctrl-container !gap-0'
    : 'kilang-ctrl-container !bg-[var(--kilang-bg-base)]/70 backdrop-blur-xl border border-[var(--kilang-border-std)] !p-1 shadow-2xl w-fit !gap-0';

  const mainBtnClasses = variant === 'header'
    ? 'w-8 h-7 kilang-ctrl-btn kilang-ctrl-btn-inactive'
    : 'w-8 h-8 rounded-lg flex items-center justify-center text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)] hover:bg-[var(--kilang-ctrl-bg)] transition-all';

  const toggleBtnClasses = variant === 'header'
    ? `w-5 h-7 kilang-ctrl-btn ${showExportDropdown ? 'text-[var(--kilang-text)] bg-[var(--kilang-text)]/10' : 'kilang-ctrl-btn-inactive'}`
    : `w-5 h-8 rounded-lg flex items-center justify-center transition-all ${showExportDropdown ? 'text-[var(--kilang-text)] bg-[var(--kilang-text)]/10' : 'text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)] hover:bg-[var(--kilang-ctrl-bg)]'}`;

  return (
    <div 
      className={`group ${className || 'relative'}`} 
      ref={exportRef}
      onMouseEnter={(e) => variant === 'canvas' && e.stopPropagation()}
      onMouseMove={(e) => variant === 'canvas' && e.stopPropagation()}
      onMouseOver={(e) => variant === 'canvas' && e.stopPropagation()}
    >
      <div className={containerClasses}>
        <button
          onClick={handleExport}
          className={mainBtnClasses}
          title={`Export as ${exportSettings.format.toUpperCase()}`}
          disabled={exporting}
        >
          <Download className={variant === 'header' ? 'w-3.5 h-3.5' : 'w-3.5 h-3.5'} />
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_UI', showExportDropdown: !showExportDropdown })}
          className={toggleBtnClasses}
          title="Export Settings"
        >
          <ChevronDown className={variant === 'header' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        </button>
      </div>

      {showExportDropdown && (
        <div className={dropdownClasses}>
          <div className="space-y-4">
            {/* Mode Toggle */}
            <div className="flex bg-[var(--kilang-bg-base)]/40 rounded-xl p-1 border border-[var(--kilang-border-std)]/40">
              {(['image', 'text'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => dispatch({ type: 'SET_UI', exportSettings: { mode: m } })}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all uppercase flex items-center justify-center gap-2 ${exportSettings.mode === m ? 'bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)] shadow-lg shadow-[var(--kilang-primary-glow)] border border-[var(--kilang-primary-border)]/50' : 'text-[var(--kilang-text-muted)]/40 hover:text-[var(--kilang-text-muted)]'}`}
                >
                  {m === 'image' ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                  {m}
                </button>
              ))}
            </div>

            {exportSettings.mode === 'image' ? (
              <div className={`space-y-4 pt-1 animate-in fade-in duration-300 ${dropdownPosition === 'top' ? 'slide-in-from-top-2' : 'slide-in-from-bottom-2'}`}>
                {/* Format */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[var(--kilang-text-muted)] uppercase tracking-widest block font-mono">Image Type</label>
                  <div className="flex bg-[var(--kilang-bg-base)]/40 rounded-lg p-1 border border-[var(--kilang-border-std)]">
                    {(['png', 'svg'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => dispatch({ type: 'SET_UI', exportSettings: { format: f } })}
                        className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all uppercase ${exportSettings.format === f ? 'bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)] shadow-lg shadow-[var(--kilang-primary-glow)]' : 'text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)]'}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Area */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[var(--kilang-text-muted)] uppercase tracking-widest block font-mono">Capture Area</label>
                  <div className="grid grid-cols-2 gap-1 bg-[var(--kilang-bg-base)]/40 rounded-lg p-1 border border-[var(--kilang-border-std)]">
                    {[
                      { id: 'window', label: 'Window' },
                      { id: 'all', label: 'Full Kilang' }
                    ].map(a => (
                      <button
                        key={a.id}
                        onClick={() => dispatch({ type: 'SET_UI', exportSettings: { area: a.id as any } })}
                        className={`py-1 rounded-md text-[10px] font-bold transition-all uppercase ${exportSettings.area === a.id ? 'bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)] shadow-lg shadow-[var(--kilang-primary-glow)]' : 'text-[var(--kilang-text-muted)]/40 hover:text-[var(--kilang-text)]'}`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[var(--kilang-text-muted)] uppercase tracking-widest block font-mono">Background</label>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { id: 'origin', color: 'var(--kilang-bg, #020617)', label: 'Orig.' },
                      { id: 'white', color: '#ffffff', label: 'White' },
                      { id: 'black', color: '#000000', label: 'Black' },
                      { id: 'transparent', color: 'transparent', label: 'Trans' }
                    ].map(b => (
                      <button
                        key={b.id}
                        onClick={() => dispatch({ type: 'SET_UI', exportSettings: { background: b.id as any } })}
                        className={`group relative h-10 rounded-lg border transition-all flex items-center justify-center overflow-hidden ${exportSettings.background === b.id ? 'border-[var(--kilang-primary)] ring-1 ring-[var(--kilang-primary)]/50 shadow-lg shadow-[var(--kilang-primary-glow)]' : 'border-[var(--kilang-border-std)] hover:border-[var(--kilang-text)]/20'}`}
                        style={{ backgroundColor: b.color }}
                        title={b.label}
                      >
                        {b.id === 'transparent' && (
                          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: 'conic-gradient(#888 0.25turn, #444 0.25turn 0.5turn, #888 0.5turn 0.75turn, #444 0.75turn)', backgroundSize: '8px 8px' }} />
                        )}
                        <span className={`relative z-10 text-[8px] font-black uppercase tracking-tighter ${b.id === 'white' ? 'text-[#020617] opacity-80' : 'text-[var(--kilang-text)]'} ${exportSettings.background === b.id ? 'scale-110' : 'opacity-80'}`}>
                          {b.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality & Margin */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--kilang-text-muted)] uppercase tracking-widest block font-mono">Quality</label>
                    <select
                      value={exportSettings.resolution}
                      onChange={(e) => dispatch({ type: 'SET_UI', exportSettings: { resolution: Number(e.target.value) as any } })}
                      className="w-full h-8 bg-[var(--kilang-bg-base)]/40 border border-[var(--kilang-border-std)] rounded-lg text-[10px] font-bold text-[var(--kilang-text)] px-2 focus:border-[var(--kilang-primary-border)]/50 outline-none"
                    >
                      <option value="1">1.0x (Std)</option>
                      <option value="2">2.0x (Hi)</option>
                      <option value="4">4.0x (Ult)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--kilang-text-muted)] uppercase tracking-widest block font-mono">Margin</label>
                    <select
                      value={exportSettings.margin}
                      onChange={(e) => dispatch({ type: 'SET_UI', exportSettings: { margin: Number(e.target.value) as any } })}
                      className="w-full h-8 bg-[var(--kilang-bg-base)]/40 border border-[var(--kilang-border-std)] rounded-lg px-2 text-[10px] font-bold text-[var(--kilang-text)] focus:border-[var(--kilang-primary-border)]/50 outline-none"
                    >
                      <option value={0}>Tight</option>
                      <option value={5}>5%</option>
                      <option value={10}>10%</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`space-y-4 pt-1 animate-in fade-in duration-300 ${dropdownPosition === 'top' ? 'slide-in-from-top-2' : 'slide-in-from-bottom-2'}`}>
                {/* Data selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[var(--kilang-text-muted)] uppercase tracking-widest block font-mono">Data</label>
                  <div className="flex bg-[var(--kilang-bg-base)]/40 rounded-lg p-1 border border-[var(--kilang-border-std)]">
                    {[
                      { id: 'kilang', label: 'Full Kilang' },
                      { id: 'chain', label: 'Chain only' }
                    ].map(c => (
                      <button
                        key={c.id}
                        onClick={() => dispatch({ type: 'SET_UI', exportSettings: { textContent: c.id as any } })}
                        className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all uppercase ${exportSettings.textContent === c.id ? 'bg-[var(--kilang-secondary)] text-[var(--kilang-secondary-text)] shadow-lg shadow-[var(--kilang-secondary-glow)]' : 'text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)]'}`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content Toggles */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[var(--kilang-text-muted)] uppercase tracking-widest block font-mono">Content</label>
                  <div className="grid grid-cols-2 gap-1 bg-[var(--kilang-bg-base)]/40 rounded-lg p-1 border border-[var(--kilang-border-std)]">
                    <button
                      onClick={() => dispatch({ type: 'SET_UI', exportSettings: { includeDefinitions: !exportSettings.includeDefinitions } })}
                      className={`py-1.5 rounded-md text-[8px] font-black tracking-widest transition-all uppercase flex items-center justify-center border ${exportSettings.includeDefinitions ? 'bg-[var(--kilang-secondary)] text-[var(--kilang-secondary-text)] shadow-lg shadow-[var(--kilang-secondary-glow)] border-[var(--kilang-secondary-border)]/50' : 'bg-transparent text-[var(--kilang-text-muted)]/40 border-transparent hover:text-[var(--kilang-text-muted)]'}`}
                    >
                      Definitions
                    </button>
                    <button
                      onClick={() => dispatch({ type: 'SET_UI', exportSettings: { includeSentences: !exportSettings.includeSentences } })}
                      className={`py-1.5 rounded-md text-[8px] font-black tracking-widest transition-all uppercase flex items-center justify-center border ${exportSettings.includeSentences ? 'bg-[var(--kilang-secondary)] text-[var(--kilang-secondary-text)] shadow-lg shadow-[var(--kilang-secondary-glow)] border-[var(--kilang-secondary-border)]/50' : 'bg-transparent text-[var(--kilang-text-muted)]/40 border-transparent hover:text-[var(--kilang-text-muted)]'}`}
                    >
                      Sentences
                    </button>
                  </div>
                  <p className="text-[9px] font-medium text-[var(--kilang-text-muted)]/40 italic leading-tight px-1 mt-1">
                    You can export the full tree structure or just the current selection. Add definitions and example sentences if needed and click the download button to export, or the copy button to copy to clipboard.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
