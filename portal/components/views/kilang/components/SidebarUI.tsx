'use client';

import React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

/* Helper Components */
interface SidebarSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export const SidebarSlider = ({ label, value, min, max, step, unit, disabled, onChange }: SidebarSliderProps) => (
  <div className={`space-y-2 transition-all duration-300 ${disabled ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-[var(--kilang-text-muted)]/40">
      <span className="text-[var(--kilang-primary-text)]/60">{label}</span>
      <span className="font-mono">{value}{unit}</span>
    </div>
    <input
      type="range"
      min={min} max={max} step={step}
      value={value ?? min ?? 0}
      disabled={disabled}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1 bg-[var(--kilang-border-std)] rounded-lg appearance-none cursor-pointer accent-[var(--kilang-primary)] hover:accent-[var(--kilang-primary-text)] transition-all"
    />
  </div>
);

export const InlineSidebarSlider = ({ label, value, min, max, step, unit, disabled, onChange }: SidebarSliderProps) => (
  <div className={`flex items-center gap-2 transition-all duration-300 ${disabled ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--kilang-primary-text)]/60 min-w-16 whitespace-nowrap">{label}</span>
    <input
      type="range"
      min={min} max={max} step={step}
      value={value ?? min ?? 0}
      disabled={disabled}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="flex-1 h-1 bg-[var(--kilang-border-std)] rounded-lg appearance-none cursor-pointer accent-[var(--kilang-primary)] hover:accent-[var(--kilang-primary-text)] transition-all"
    />
    <span className="text-[8px] font-mono text-[var(--kilang-text-muted)] w-10 text-right shrink-0">{value}{unit}</span>
  </div>
);

interface ColorPickerProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}

export const ColorPicker = ({ label, value, onChange }: ColorPickerProps) => (
  <div className="space-y-2">
    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--kilang-text-muted)]">{label}</span>
    <div className="flex items-center gap-3 bg-[var(--kilang-background-secondary)] p-2 rounded-xl border border-[var(--kilang-border)]">
      <input
        type="color"
        value={value ?? '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="w-6 h-6 bg-transparent border-none rounded cursor-pointer"
      />
    </div>
  </div>
);

interface CollapsibleSectionProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  isCollapsed?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
}

export const CollapsibleSection = ({ id, label, icon, isCollapsed, onToggle, children }: CollapsibleSectionProps) => (
  <section className="space-y-4">
    <div
      onClick={onToggle}
      className="flex items-center justify-between group cursor-pointer select-none"
    >
      <div className="flex items-center gap-2.5">
        <div className="text-[var(--kilang-primary-text)] group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--kilang-text-muted)] group-hover:text-[var(--kilang-text)] transition-colors">
          {label}
        </span>
      </div>
      <div className="text-[var(--kilang-text-muted)]/40 group-hover:text-[var(--kilang-text)] transition-colors">
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </div>
    </div>
    {!isCollapsed && (
      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
        {children}
      </div>
    )}
  </section>
);
