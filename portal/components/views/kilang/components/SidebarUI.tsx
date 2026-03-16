'use client';

import React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

/* Helper Components */
export const SidebarSlider = ({ label, value, min, max, step, unit, disabled, onChange }: any) => (
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

export const ColorPicker = ({ label, value, onChange }: any) => (
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

export const CollapsibleSection = ({ id, label, icon, isCollapsed, onToggle, children }: any) => (
  <section className="space-y-4">
    <div
      onClick={onToggle}
      className="flex items-center justify-between group cursor-pointer select-none"
    >
      <div className="flex items-center gap-2.5">
        <div className="text-blue-400 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 group-hover:text-white transition-colors">
          {label}
        </span>
      </div>
      <div className="text-white/20 group-hover:text-white transition-colors">
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
