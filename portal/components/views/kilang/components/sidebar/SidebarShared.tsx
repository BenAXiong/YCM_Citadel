'use client';

import React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { normalizeWord } from '../../kilangUtils';

// --- CollapsibleSection ---

interface CollapsibleSectionProps {
  title: string;
  id: string;
  icon?: any;
  isCollapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const CollapsibleSection = ({ 
  title, 
  id,
  icon: Icon, 
  isCollapsed, 
  onToggle, 
  children, 
  action,
  className = ""
}: CollapsibleSectionProps) => (
  <section className={`mb-6 border border-[var(--kilang-border-std)] rounded-2xl bg-[var(--kilang-bg-base)]/50 overflow-hidden shadow-[var(--kilang-shadow-primary)] ${className}`}>
    <div
      onClick={onToggle}
      className={`flex items-center justify-between group cursor-pointer select-none px-4 py-3 transition-colors ${isCollapsed ? 'hover:bg-[var(--kilang-ctrl-bg)]' : 'bg-[var(--kilang-bg-base)]/50 border-b border-[var(--kilang-border-std)] hover:bg-[var(--kilang-ctrl-bg)]'}`}
    >
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="text-[var(--kilang-primary-text)] group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-text)] transition-colors">
          {title}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {action}
        <div className="text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-text)] transition-colors">
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </div>
    </div>
    {!isCollapsed && (
      <div className="animate-in fade-in slide-in-from-top-2 duration-300 p-4 bg-[var(--kilang-bg-base)]/40 font-mono text-[10px] overflow-x-auto custom-scrollbar max-h-[500px]">
        {children}
      </div>
    )}
  </section>
);

// --- SentenceItem ---

export const SentenceItem = ({ ex, focusWord }: { ex: any, focusWord: string }) => {
  const parseAmis = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(`[^~]+~)/);
    const lowFocus = normalizeWord(focusWord);

    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('~')) {
        const word = part.slice(1, -1);
        const isMatch = normalizeWord(word) === lowFocus;
        return <span key={i} className={isMatch ? "text-[var(--kilang-primary-text)] font-bold drop-shadow-[0_0_8px_var(--kilang-primary-glow)]" : ""}>{word}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="p-3 bg-[var(--kilang-bg-base)]/40 rounded-xl border border-[var(--kilang-border-std)] flex flex-col gap-2 group/sent transition-all hover:bg-[var(--kilang-ctrl-active)]/5">
      <div className="text-[16px] text-[var(--kilang-text)] leading-relaxed font-sans">
        {parseAmis(ex.ab)}
      </div>
      <div className="space-y-1 pl-2 border-l border-[var(--kilang-border-std)]">
        {ex.zh && <div className="text-[15px] text-[var(--kilang-secondary-text)] opacity-60 leading-tight">{ex.zh}</div>}
        {ex.en && <div className="text-[11px] text-[var(--kilang-text-muted)] italic leading-tight">{ex.en}</div>}
      </div>
    </div>
  );
};
