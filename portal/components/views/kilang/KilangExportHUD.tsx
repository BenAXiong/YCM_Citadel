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
    ${variant === 'header' ? 'w-56 bg-[#0f172a]/99 backdrop-blur-xl border border-white/10 rounded-xl' : 'w-64 bg-[#020617]/90 backdrop-blur-xl border border-white/10 rounded-2xl'}
  `;

  const containerClasses = variant === 'header' 
    ? 'kilang-ctrl-container' 
    : 'kilang-ctrl-container !bg-[#020617]/40 backdrop-blur-md !border-white/10 !p-1 shadow-2xl w-fit';

  const mainBtnClasses = variant === 'header'
    ? 'w-8 h-7 kilang-ctrl-btn kilang-ctrl-btn-inactive'
    : 'w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all';

  const toggleBtnClasses = variant === 'header'
    ? `w-5 h-7 kilang-ctrl-btn ${showExportDropdown ? 'text-white bg-white/10' : 'kilang-ctrl-btn-inactive'}`
    : `w-5 h-8 rounded-lg flex items-center justify-center transition-all ${showExportDropdown ? 'text-white bg-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`;

  return (
    <div className={`group ${className || 'relative'}`} ref={exportRef}>
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
            <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
              {(['image', 'text'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => dispatch({ type: 'SET_UI', exportSettings: { mode: m } })}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all uppercase flex items-center justify-center gap-2 ${exportSettings.mode === m ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-blue-400/50' : 'text-white/20 hover:text-white/40'}`}
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
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block font-mono">Image Type</label>
                  <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                    {(['png', 'svg'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => dispatch({ type: 'SET_UI', exportSettings: { format: f } })}
                        className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all uppercase ${exportSettings.format === f ? 'bg-blue-500 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Area */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block font-mono">Capture Area</label>
                  <div className="grid grid-cols-2 gap-1 bg-black/40 rounded-lg p-1 border border-white/5">
                    {[
                      { id: 'window', label: 'Window' },
                      { id: 'all', label: 'Full Kilang' }
                    ].map(a => (
                      <button
                        key={a.id}
                        onClick={() => dispatch({ type: 'SET_UI', exportSettings: { area: a.id as any } })}
                        className={`py-1 rounded-md text-[10px] font-bold transition-all uppercase ${exportSettings.area === a.id ? 'bg-blue-500 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block font-mono">Background</label>
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
                        className={`group relative h-10 rounded-lg border transition-all flex items-center justify-center overflow-hidden ${exportSettings.background === b.id ? 'border-blue-500 ring-1 ring-blue-500/50 shadow-lg' : 'border-white/5 hover:border-white/20'}`}
                        style={{ backgroundColor: b.color }}
                        title={b.label}
                      >
                        {b.id === 'transparent' && (
                          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: 'conic-gradient(#888 0.25turn, #444 0.25turn 0.5turn, #888 0.5turn 0.75turn, #444 0.75turn)', backgroundSize: '8px 8px' }} />
                        )}
                        <span className={`relative z-10 text-[8px] font-black uppercase tracking-tighter ${b.id === 'white' ? 'text-[#020617] opacity-80' : 'text-white'} ${exportSettings.background === b.id ? 'scale-110' : 'opacity-80'}`}>
                          {b.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality & Margin */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block font-mono">Quality</label>
                    <select
                      value={exportSettings.resolution}
                      onChange={(e) => dispatch({ type: 'SET_UI', exportSettings: { resolution: Number(e.target.value) as any } })}
                      className="w-full h-8 bg-black/40 border border-white/10 rounded-lg text-[10px] font-bold text-white px-2 focus:border-blue-500/50 outline-none"
                    >
                      <option value="1">1.0x (Std)</option>
                      <option value="2">2.0x (Hi)</option>
                      <option value="4">4.0x (Ult)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block font-mono">Margin</label>
                    <select
                      value={exportSettings.margin}
                      onChange={(e) => dispatch({ type: 'SET_UI', exportSettings: { margin: Number(e.target.value) as any } })}
                      className="w-full h-8 bg-black/40 border border-white/10 rounded-lg px-2 text-[10px] font-bold text-white focus:border-blue-500/50 outline-none"
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
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block font-mono">Data</label>
                  <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                    {[
                      { id: 'kilang', label: 'Full Kilang' },
                      { id: 'chain', label: 'Chain only' }
                    ].map(c => (
                      <button
                        key={c.id}
                        onClick={() => dispatch({ type: 'SET_UI', exportSettings: { textContent: c.id as any } })}
                        className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all uppercase ${exportSettings.textContent === c.id ? 'bg-purple-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content Toggles */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block font-mono">Content</label>
                  <div className="space-y-1">
                    <button
                      onClick={() => dispatch({ type: 'SET_UI', exportSettings: { includeDefinitions: !exportSettings.includeDefinitions } })}
                      className={`w-full py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all uppercase flex items-center justify-between px-3 border ${exportSettings.includeDefinitions ? 'bg-purple-600/20 text-purple-400 border-purple-500/40 shadow-[0_0_10px_rgba(147,51,234,0.1)]' : 'bg-white/5 text-white/20 border-white/5 hover:border-white/10'}`}
                    >
                      <span>Definitions</span>
                      <div className={`w-1.5 h-1.5 rounded-full ${exportSettings.includeDefinitions ? 'bg-purple-500 animate-pulse' : 'bg-white/20'}`} />
                    </button>
                    <button
                      onClick={() => dispatch({ type: 'SET_UI', exportSettings: { includeSentences: !exportSettings.includeSentences } })}
                      className={`w-full py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all uppercase flex items-center justify-between px-3 border ${exportSettings.includeSentences ? 'bg-purple-600/20 text-purple-400 border-purple-500/40 shadow-[0_0_10px_rgba(147,51,234,0.1)]' : 'bg-white/5 text-white/20 border-white/5 hover:border-white/10'}`}
                    >
                      <span>Sentences</span>
                      <div className={`w-1.5 h-1.5 rounded-full ${exportSettings.includeSentences ? 'bg-purple-500 animate-pulse' : 'bg-white/20'}`} />
                    </button>
                  </div>
                  <p className="text-[9px] font-medium text-white/20 italic leading-tight px-1 mt-1">
                    Text mode exports to .json or .txt with the structure above.
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
