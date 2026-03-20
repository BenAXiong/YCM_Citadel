import React from 'react';
import { ChevronRight, Copy, Check } from 'lucide-react';

interface ChainInscriptionProps {
  linearPath: string[];
  exporting: boolean;
  moveChainToCanvas: boolean;
  handleCopyChain: (path: string[]) => void;
  copiedChain: boolean;
}

export const ChainInscription: React.FC<ChainInscriptionProps> = ({
  linearPath,
  exporting,
  moveChainToCanvas,
  handleCopyChain,
  copiedChain,
}) => {
  if (linearPath.length === 0 || exporting || !moveChainToCanvas) return null;

  return (
    <div 
      className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-bottom-4 duration-500 pointer-events-auto group"
      onMouseEnter={(e) => e.stopPropagation()}
    >
      <div className="bg-[var(--kilang-bg)]/90 backdrop-blur-2xl border border-[var(--kilang-primary)]/30 px-8 py-4 rounded-[20px] shadow-[var(--kilang-shadow-primary)] flex items-center gap-3 relative">
        {linearPath.map((word: string, idx: number) => (
          <React.Fragment key={word}>
            <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${idx === linearPath.length - 1 ? 'text-[var(--kilang-primary)]' : 'text-[var(--kilang-text-muted)]'}`}>
              {word}
            </span>
            {idx < linearPath.length - 1 && (
              <ChevronRight className="w-3 h-3 text-[var(--kilang-border-std)]" />
            )}
          </React.Fragment>
        ))}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); handleCopyChain(linearPath); }}
        className="p-2 rounded-xl bg-[var(--kilang-bg)]/80 backdrop-blur-xl border border-[var(--kilang-border-std)] text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)] transition-all opacity-0 group-hover:opacity-100 shadow-[var(--kilang-shadow-primary)]"
        title="Copy Path"
      >
        {copiedChain ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
};
