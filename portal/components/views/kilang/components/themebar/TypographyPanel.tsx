'use client';

import React from 'react';
import { Type, RotateCcw } from 'lucide-react';
import { RibbonNav, RibbonGroup, VariableControl } from './Shared';

interface TypographyPanelProps {
  tsActions: any;
  dispatch: any;
  layoutConfig: any;
  dense?: boolean;
}

export const TypographyPanel = ({
  tsActions,
  dispatch,
  layoutConfig
}: TypographyPanelProps) => {
  return (
    <div className="flex flex-row h-full overflow-x-auto custom-scrollbar bg-[#020202]">
      {/* COLUMN 1: TYPOGRAPHY */}
      <div className="flex-1 min-w-[300px] max-w-[320px] border-r border-white/10 flex flex-col h-full shrink-0 bg-[#0a0a0a]">
        <div className="h-10 px-6 flex items-center justify-between bg-black/40 border-b border-white/5 shrink-0">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Type & Fonts</span>
          <button 
            onClick={() => tsActions.resetLayoutConfig(['fontFamily', 'fontSize'])}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/10 hover:text-white transition-all group/reset"
            title="Reset Typography"
          >
            <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-[-45deg] transition-all" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-1 pb-10">
          <RibbonGroup label="Font System Selection">
              <div className="flex flex-col gap-4 p-4 bg-white/[0.03] mx-1 rounded-2xl border border-white/5">
                  <div className="flex flex-col gap-2">
                  <span className="text-[8px] font-black uppercase text-white/30 tracking-widest ml-1">Font Family</span>
                  <select 
                      value={layoutConfig.fontFamily} 
                      onChange={(e) => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { fontFamily: e.target.value } })}
                      className="bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-[11px] text-white outline-none focus:border-white/40 transition-all cursor-pointer font-black uppercase tracking-widest appearance-none"
                  >
                      <option value="Inter">Inter (Sans)</option>
                      <option value="JetBrains Mono">JetBrains Mono (Matrix)</option>
                      <option value="Outfit">Outfit (Pasiwali)</option>
                      <option value="system-ui">System Default</option>
                  </select>
                  </div>

                  <VariableControl 
                    label="Base Font Size" 
                    value={layoutConfig.fontSize} 
                    onChange={(v) => dispatch({ type: 'SET_LAYOUT_CONFIG', config: { fontSize: parseInt(v) } })} 
                    type="number"
                    min={10} max={24}
                    dense
                  />
              </div>
          </RibbonGroup>

          <RibbonGroup label="Live Typography Preview">
              <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl mx-1">
                  <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-3 border-b border-white/5 pb-2">Rendering Sample</div>
                  <div 
                    className="text-white space-y-2 leading-relaxed" 
                    style={{ fontFamily: layoutConfig.fontFamily, fontSize: `${layoutConfig.fontSize}px` }}
                  >
                  <p>The quick brown fox jumps over the lazy dog.</p>
                  <p className="opacity-50 text-[0.8em]">Kilang Morphological Engine v5.0.0</p>
                  </div>
              </div>
          </RibbonGroup>
        </div>
      </div>
    </div>
  );
};
