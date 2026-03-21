'use client';

import React from 'react';
import { ChevronDown, RotateCcw } from 'lucide-react';

export const SectionHeader = ({ 
  id, 
  label, 
  icon: Icon, 
  isExpanded, 
  onToggle, 
  onReset,
  dense = false
}: { 
  id: string; 
  label: string; 
  icon: any; 
  isExpanded: boolean; 
  onToggle: (id: string) => void;
  onReset?: () => void;
  dense?: boolean;
}) => (
  <div className={`w-full flex items-center justify-between bg-white/[0.03] border-y border-white/5 group/header hover:bg-white/[0.06] transition-all ${dense ? 'py-1' : ''}`}>
    <button
      onClick={() => onToggle(id)}
      className={`flex-grow flex items-center gap-4 px-5 text-left ${dense ? 'py-2' : 'py-3'}`}
    >
      <Icon className={`w-4 h-4 ${isExpanded ? 'text-white' : 'text-white/40'}`} />
      <span className={`${dense ? 'text-[10px]' : 'text-[11px]'} font-black uppercase tracking-[0.2em] text-white group-hover:text-white`}>{label}</span>
    </button>

    <div className="flex items-center gap-2 pr-4">
      {onReset && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReset();
          }}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/20 hover:text-white transition-all"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      )}
      <button onClick={() => onToggle(id)} className="p-1 hover:bg-white/10 rounded-lg transition-all ml-1">
        <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
    </div>
  </div>
);

export const VariableControl = ({
  label,
  name,
  type,
  value,
  onChange,
  onOpacityChange,
  opacityValue,
  min,
  max,
  step,
  unit,
  dense = false
}: {
  label?: string;
  name?: string;
  type?: 'color' | 'text' | 'range' | 'number';
  value: any;
  onChange: (val: any) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onOpacityChange?: (val: string) => void;
  opacityValue?: string;
  dense?: boolean;
}) => (
  <div className={`flex items-center justify-between px-4 group hover:bg-white/[0.02] transition-all border-b border-white/5 last:border-0 ${dense ? 'py-1.5' : 'py-2.5'}`}>
    <div className="flex flex-col">
      {label && <span className={`${dense ? 'text-[9px]' : 'text-[10px]'} font-black uppercase tracking-widest text-white/50 group-hover:text-white transition-colors`}>{label}</span>}
      {name && <span className={`${label ? (dense ? 'text-[7px]' : 'text-[8px]') : (dense ? 'text-[8px]' : 'text-[9px]')} font-mono text-white/30 lowercase tracking-tighter`}>{name}</span>}
    </div>

    <div className="flex items-center gap-2">
      {type === 'color' ? (
        <div className="relative flex items-center gap-4">
          {onOpacityChange && (
            <input
              type="range" min="0" max="1" step="0.01"
              value={opacityValue || "1"}
              onChange={(e) => onOpacityChange(e.target.value)}
              className="w-12 h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-zinc-400"
            />
          )}
          <div className="relative flex items-center">
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-full bg-transparent border-0 cursor-pointer opacity-0 absolute inset-0 z-10"
            />
            <div
              className={`${dense ? 'w-5 h-5' : 'w-6 h-6'} rounded-lg border border-white/20 shadow-xl transition-all group-hover:border-white/40`}
              style={{ backgroundColor: value }}
            />
          </div>
        </div>
      ) : (type === 'number' || type === 'range' || (type === 'text' && (name?.includes('radius') || name?.includes('weight') || name?.includes('-w-')))) ? (
        <div className="flex items-center gap-3">
          <input
            type="range" 
            min={min ?? 0} 
            max={max ?? (name?.includes('gap') || name?.includes('padding') ? 500 : 100)} 
            step={step ?? 1}
            value={parseFloat(value) || 0}
            onChange={(e) => onChange(name?.includes('radius') || name?.includes('weight') || name?.includes('-w-') ? `${e.target.value}px` : e.target.value)}
            className="w-20 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white/40 hover:accent-white transition-all shadow-[0_0_8px_rgba(255,255,255,0.05)]"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${dense ? 'w-10 text-[9px]' : 'w-12 text-[10px]'} bg-white/5 border border-white/5 rounded px-1.5 py-0.5 text-right text-white/80 focus:text-white focus:border-white/20 outline-none font-mono`}
          />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${dense ? 'w-12 text-[9px]' : 'w-16 text-[10px]'} bg-transparent border-0 text-right text-white/60 focus:text-white focus:outline-none font-mono`}
          />
        </div>
      )}
    </div>
  </div>
);

export const RibbonNav = ({ 
  tabs, 
  activeTab, 
  onTabChange 
}: { 
  tabs: { id: string; label: string; icon: any }[];
  activeTab: string;
  onTabChange: (id: string) => void;
}) => {
  return (
    <div className="flex items-center gap-1 p-1 bg-white/[0.03] border-b border-white/5 overflow-x-auto no-scrollbar shrink-0">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all shrink-0 ${activeTab === tab.id ? 'bg-white/10 text-white shadow-lg' : 'text-white/20 hover:text-white/60 hover:bg-white/[0.02]'}`}
        >
          <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-white' : 'text-white/20'}`} />
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export const RibbonGroup = ({ 
  label, 
  children,
  dense = false
}: { 
  label: string; 
  children: React.ReactNode;
  dense?: boolean;
}) => {
  return (
    <div className={`flex flex-col ${dense ? 'p-1' : 'p-4'} border-b border-white/5 last:border-0`}>
      <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/90 mb-4 px-2 italic flex items-center gap-3">
        {label}
        <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
      </h4>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
};
