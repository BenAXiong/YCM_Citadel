import React, { useState, useEffect } from 'react';
import { Search, Info, ChevronDown, ChevronRight, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * 🚨 ATTENTION: DESIGN SYSTEM MANIFEST 🚨
 * --------------------------------------
 * The VARIABLE_MANIFEST object below is AUTOMATICALLY GENERATED.
 * 
 * DO NOT EDIT THE MANIFEST MANUALLY.
 * To update usage counts and file mappings, run:
 * 
 * npm run sync-vars
 * 
 * To verify synchronization with ThemeBar, run:
 * node scripts/verify-sync.mjs
 * 
 * This command executes portal/scripts/sync-vars.mjs, which scans the
 * codebase for --kilang- variables and re-injects the updated data.
 */

const VARIABLE_MANIFEST: Record<string, { count: number, files: string[], group: 'surface' | 'border' | 'text' | 'links' | 'structural' }> = {
  "--kilang-accent": { group: 'surface', count: 9, files: ["KilangHeader.tsx","KilangNode.tsx","KilangRightSidebar.tsx","StatsOverlay.tsx","components\\ThemeBar.tsx","kilangReducer.ts"] },
  "--kilang-accent-bg": { group: 'surface', count: 3, files: ["components\\ThemeBar.tsx"] },
  "--kilang-accent-border": { group: 'border', count: 4, files: ["StatsOverlay.tsx","components\\ThemeBar.tsx"] },
  "--kilang-accent-glow": { group: 'surface', count: 3, files: ["components\\ThemeBar.tsx"] },
  "--kilang-accent-text": { group: 'text', count: 8, files: ["KilangNode.tsx","KilangRightSidebar.tsx","components\\CompactMetric.tsx","components\\ThemeBar.tsx"] },
  "--kilang-background-secondary": { group: 'surface', count: 4, files: ["components\\SidebarUI.tsx","components\\ThemeBar.tsx"] },
  "--kilang-bg": { group: 'surface', count: 7, files: ["KilangCanvas.tsx","KilangExportHUD.tsx","KilangNode.tsx","components\\ThemeBar.tsx"] },
  "--kilang-bg-base": { group: 'surface', count: 57, files: ["AffixesOverlay.tsx","KilangCanvas.tsx","KilangExportHUD.tsx","KilangHeader.tsx","KilangMobileLayout.tsx","KilangNode.tsx","KilangRightSidebar.tsx","KilangSidebar.tsx","KilangToolbox.tsx","StatsOverlay.tsx","components\\CustomTab.tsx","components\\ForestControls.tsx","components\\StylingTab.tsx","components\\ThemeBar.tsx"] },
  "--kilang-border": { group: 'border', count: 11, files: ["KilangHeader.tsx","KilangNode.tsx","components\\SidebarUI.tsx","components\\ThemeBar.tsx"] },
  "--kilang-border-std": { group: 'border', count: 125, files: ["AffixesOverlay.tsx","KilangCanvas.tsx","KilangExportHUD.tsx","KilangHeader.tsx","KilangMobileLayout.tsx","KilangNode.tsx","KilangRightSidebar.tsx","KilangSidebar.tsx","KilangToolbox.tsx","StatsOverlay.tsx","components\\CompactMetric.tsx","components\\CustomTab.tsx","components\\ForestControls.tsx","components\\RootList.tsx","components\\SidebarUI.tsx","components\\StylingTab.tsx","components\\ThemeBar.tsx"] },
  "--kilang-card": { group: 'surface', count: 7, files: ["components\\CompactMetric.tsx","components\\ForestControls.tsx","components\\RootList.tsx","components\\ThemeBar.tsx"] },
  "--kilang-ctrl-active": { group: 'surface', count: 62, files: ["KilangCanvas.tsx","KilangExportHUD.tsx","KilangHeader.tsx","KilangMobileLayout.tsx","KilangRightSidebar.tsx","KilangSidebar.tsx","KilangToolbox.tsx","StatsOverlay.tsx","components\\CustomTab.tsx","components\\ForestControls.tsx","components\\RootList.tsx","components\\StylingTab.tsx","components\\ThemeBar.tsx"] },
  "--kilang-ctrl-active-border": { group: 'border', count: 5, files: ["components\\ThemeBar.tsx"] },
  "--kilang-ctrl-active-text": { group: 'text', count: 53, files: ["AffixesOverlay.tsx","KilangCanvas.tsx","KilangExportHUD.tsx","KilangHeader.tsx","KilangMobileLayout.tsx","KilangRightSidebar.tsx","KilangSidebar.tsx","components\\CustomTab.tsx","components\\ForestControls.tsx","components\\RootList.tsx","components\\StylingTab.tsx","components\\ThemeBar.tsx"] },
  "--kilang-ctrl-bg": { group: 'surface', count: 87, files: ["AffixesOverlay.tsx","KilangCanvas.tsx","KilangExportHUD.tsx","KilangHeader.tsx","KilangMobileLayout.tsx","KilangRightSidebar.tsx","KilangSidebar.tsx","KilangToolbox.tsx","StatsOverlay.tsx","components\\CustomTab.tsx","components\\RootList.tsx","components\\StylingTab.tsx","components\\ThemeBar.tsx"] },
  "--kilang-glass": { group: 'border', count: 3, files: ["components\\ThemeBar.tsx"] },
  "--kilang-input-bg": { group: 'surface', count: 3, files: ["components\\ThemeBar.tsx"] },
  "--kilang-link-end": { group: 'links', count: 3, files: ["components\\LineageCanvas.tsx","components\\ThemeBar.tsx"] },
  "--kilang-link-mid": { group: 'links', count: 3, files: ["components\\LineageCanvas.tsx","components\\ThemeBar.tsx"] },
  "--kilang-link-opacity": { group: 'links', count: 6, files: ["components\\LineageCanvas.tsx","components\\ThemeBar.tsx"] },
  "--kilang-link-start": { group: 'links', count: 3, files: ["components\\LineageCanvas.tsx","components\\ThemeBar.tsx"] },
  "--kilang-logo-text": { group: 'text', count: 5, files: ["KilangHeader.tsx","components\\StylingTab.tsx","components\\ThemeBar.tsx"] },
  "--kilang-metric-text": { group: 'text', count: 4, files: ["components\\CompactMetric.tsx","components\\ThemeBar.tsx"] },
  "--kilang-muted-border": { group: 'border', count: 3, files: ["components\\ThemeBar.tsx"] },
  "--kilang-node-border": { group: 'border', count: 3, files: ["components\\ThemeBar.tsx"] },
  "--kilang-overlay-bg": { group: 'surface', count: 3, files: ["components\\ThemeBar.tsx"] },
  "--kilang-primary": { group: 'surface', count: 125, files: ["AffixesOverlay.tsx","KilangCanvas.tsx","KilangExportHUD.tsx","KilangHeader.tsx","KilangMobileLayout.tsx","KilangNode.tsx","KilangRightSidebar.tsx","KilangSidebar.tsx","KilangToolbox.tsx","StatsOverlay.tsx","components\\BookmarkLibrary.tsx","components\\CustomTab.tsx","components\\ForestControls.tsx","components\\RootList.tsx","components\\SidebarUI.tsx","components\\StylingTab.tsx","components\\ThemeBar.tsx","kilangReducer.ts"] },
  "--kilang-primary-active": { group: 'surface', count: 4, files: ["KilangNode.tsx","components\\ThemeBar.tsx"] },
  "--kilang-primary-bg": { group: 'surface', count: 10, files: ["KilangHeader.tsx","KilangNode.tsx","components\\ForestControls.tsx","components\\RootList.tsx","components\\ThemeBar.tsx"] },
  "--kilang-primary-border": { group: 'border', count: 35, files: ["KilangExportHUD.tsx","KilangHeader.tsx","KilangMobileLayout.tsx","KilangNode.tsx","KilangRightSidebar.tsx","KilangToolbox.tsx","StatsOverlay.tsx","components\\ForestControls.tsx","components\\StylingTab.tsx","components\\ThemeBar.tsx"] },
  "--kilang-primary-glow": { group: 'surface', count: 32, files: ["KilangCanvas.tsx","KilangExportHUD.tsx","KilangHeader.tsx","KilangMobileLayout.tsx","KilangNode.tsx","KilangRightSidebar.tsx","components\\ForestControls.tsx","components\\RootList.tsx","components\\ThemeBar.tsx"] },
  "--kilang-primary-text": { group: 'text', count: 42, files: ["KilangHeader.tsx","KilangNode.tsx","KilangRightSidebar.tsx","KilangToolbox.tsx","StatsOverlay.tsx","components\\CompactMetric.tsx","components\\ForestControls.tsx","components\\KilangLanding.tsx","components\\RootList.tsx","components\\SidebarUI.tsx","components\\StylingTab.tsx","components\\ThemeBar.tsx"] },
  "--kilang-radius-lg": { group: 'structural', count: 3, files: ["KilangNode.tsx","components\\ThemeBar.tsx"] },
  "--kilang-resizer-active": { group: 'surface', count: 4, files: ["KilangSidebar.tsx","components\\ThemeBar.tsx"] },
  "--kilang-resizer-hover": { group: 'surface', count: 4, files: ["KilangSidebar.tsx","components\\ThemeBar.tsx"] },
  "--kilang-scrollbar-border": { group: 'border', count: 3, files: ["components\\ThemeBar.tsx"] },
  "--kilang-secondary": { group: 'surface', count: 22, files: ["KilangExportHUD.tsx","KilangHeader.tsx","KilangNode.tsx","KilangSidebar.tsx","KilangToolbox.tsx","components\\BookmarkLibrary.tsx","components\\CustomTab.tsx","components\\ForestControls.tsx","components\\ThemeBar.tsx","kilangReducer.ts"] },
  "--kilang-secondary-bg": { group: 'surface', count: 4, files: ["components\\ForestControls.tsx","components\\ThemeBar.tsx"] },
  "--kilang-secondary-border": { group: 'border', count: 7, files: ["KilangExportHUD.tsx","KilangToolbox.tsx","components\\ForestControls.tsx","components\\ThemeBar.tsx"] },
  "--kilang-secondary-glow": { group: 'surface', count: 8, files: ["KilangExportHUD.tsx","components\\ForestControls.tsx","components\\ThemeBar.tsx"] },
  "--kilang-secondary-text": { group: 'text', count: 17, files: ["KilangExportHUD.tsx","KilangRightSidebar.tsx","KilangToolbox.tsx","components\\CompactMetric.tsx","components\\ForestControls.tsx","components\\ThemeBar.tsx"] },
  "--kilang-shadow-color": { group: 'surface', count: 5, files: ["KilangRightSidebar.tsx","KilangSidebar.tsx","components\\ThemeBar.tsx"] },
  "--kilang-shadow-primary": { group: 'surface', count: 52, files: ["AffixesOverlay.tsx","KilangCanvas.tsx","KilangHeader.tsx","KilangMobileLayout.tsx","KilangRightSidebar.tsx","KilangSidebar.tsx","KilangToolbox.tsx","StatsOverlay.tsx","components\\CustomTab.tsx","components\\ForestControls.tsx","components\\ThemeBar.tsx"] },
  "--kilang-text": { group: 'text', count: 133, files: ["AffixesOverlay.tsx","KilangCanvas.tsx","KilangExportHUD.tsx","KilangHeader.tsx","KilangMobileLayout.tsx","KilangNode.tsx","KilangRightSidebar.tsx","KilangSidebar.tsx","KilangToolbox.tsx","StatsOverlay.tsx","components\\CustomTab.tsx","components\\ForestControls.tsx","components\\RootList.tsx","components\\SidebarUI.tsx","components\\StylingTab.tsx","components\\ThemeBar.tsx"] },
  "--kilang-text-muted": { group: 'text', count: 177, files: ["AffixesOverlay.tsx","KilangCanvas.tsx","KilangExportHUD.tsx","KilangHeader.tsx","KilangMobileLayout.tsx","KilangNode.tsx","KilangRightSidebar.tsx","KilangSidebar.tsx","KilangToolbox.tsx","StatsOverlay.tsx","components\\CompactMetric.tsx","components\\CustomTab.tsx","components\\ForestControls.tsx","components\\RootList.tsx","components\\SidebarUI.tsx","components\\StylingTab.tsx","components\\ThemeBar.tsx"] },
  "--kilang-tier-": { group: 'text', count: 3, files: ["KilangNode.tsx"] },
  "--kilang-tier-1-border": { group: 'border', count: 4, files: ["components\\ThemeBar.tsx","kilangReducer.ts"] },
  "--kilang-tier-1-fill": { group: 'surface', count: 4, files: ["components\\ThemeBar.tsx","kilangReducer.ts"] },
  "--kilang-tier-1-text": { group: 'text', count: 6, files: ["KilangNode.tsx","components\\ThemeBar.tsx","kilangReducer.ts"] },
  "--kilang-tier-2-border": { group: 'border', count: 5, files: ["KilangNode.tsx","components\\ThemeBar.tsx","kilangReducer.ts"] },
  "--kilang-tier-2-fill": { group: 'surface', count: 4, files: ["components\\ThemeBar.tsx","kilangReducer.ts"] },
  "--kilang-tier-2-text": { group: 'text', count: 4, files: ["components\\ThemeBar.tsx","kilangReducer.ts"] },
  "--kilang-tier-3-border": { group: 'border', count: 5, files: ["KilangNode.tsx","components\\ThemeBar.tsx","kilangReducer.ts"] },
  "--kilang-tier-3-fill": { group: 'surface', count: 4, files: ["components\\ThemeBar.tsx","kilangReducer.ts"] },
  "--kilang-tier-3-text": { group: 'text', count: 4, files: ["components\\ThemeBar.tsx","kilangReducer.ts"] },
  "--kilang-tier-4-border": { group: 'border', count: 5, files: ["KilangNode.tsx","components\\ThemeBar.tsx","kilangReducer.ts"] },
  "--kilang-tier-4-fill": { group: 'surface', count: 4, files: ["components\\ThemeBar.tsx","kilangReducer.ts"] },
  "--kilang-tier-4-text": { group: 'text', count: 4, files: ["components\\ThemeBar.tsx","kilangReducer.ts"] },
  "--kilang-tier-5-border": { group: 'border', count: 4, files: ["components\\ThemeBar.tsx","kilangReducer.ts"] },
  "--kilang-tier-5-fill": { group: 'surface', count: 4, files: ["components\\ThemeBar.tsx","kilangReducer.ts"] },
  "--kilang-tier-5-text": { group: 'text', count: 4, files: ["components\\ThemeBar.tsx","kilangReducer.ts"] },
  "--kilang-tier-6-border": { group: 'border', count: 4, files: ["components\\ThemeBar.tsx","kilangReducer.ts"] },
  "--kilang-tier-6-fill": { group: 'surface', count: 4, files: ["components\\ThemeBar.tsx","kilangReducer.ts"] },
  "--kilang-tier-6-text": { group: 'text', count: 4, files: ["components\\ThemeBar.tsx","kilangReducer.ts"] },
  "--kilang-tier-7-border": { group: 'border', count: 4, files: ["components\\ThemeBar.tsx","kilangReducer.ts"] },
  "--kilang-tier-7-fill": { group: 'surface', count: 4, files: ["components\\ThemeBar.tsx","kilangReducer.ts"] },
  "--kilang-tier-7-text": { group: 'text', count: 4, files: ["components\\ThemeBar.tsx","kilangReducer.ts"] },
  "--kilang-tier-8-border": { group: 'border', count: 4, files: ["components\\ThemeBar.tsx","kilangReducer.ts"] },
  "--kilang-tier-8-fill": { group: 'surface', count: 4, files: ["components\\ThemeBar.tsx","kilangReducer.ts"] },
  "--kilang-tier-8-text": { group: 'text', count: 4, files: ["components\\ThemeBar.tsx","kilangReducer.ts"] },
  "--kilang-tier-9-border": { group: 'border', count: 4, files: ["components\\ThemeBar.tsx","kilangReducer.ts"] },
  "--kilang-tier-9-fill": { group: 'surface', count: 4, files: ["components\\ThemeBar.tsx","kilangReducer.ts"] },
  "--kilang-tier-9-text": { group: 'text', count: 4, files: ["components\\ThemeBar.tsx","kilangReducer.ts"] },
  "--kilang-toast-bg": { group: 'surface', count: 4, files: ["KilangSidebar.tsx","components\\ThemeBar.tsx"] },
  "--kilang-toast-border": { group: 'border', count: 5, files: ["KilangSidebar.tsx","components\\ThemeBar.tsx"] },
  "--kilang-toast-text": { group: 'text', count: 3, files: ["components\\ThemeBar.tsx"] },
  "--kilang-tooltip-accent": { group: 'surface', count: 4, files: ["KilangNode.tsx","components\\ThemeBar.tsx"] },
  "--kilang-tooltip-bg": { group: 'surface', count: 5, files: ["KilangNode.tsx","components\\CompactMetric.tsx","components\\ThemeBar.tsx"] },
  "--kilang-tooltip-border": { group: 'border', count: 6, files: ["KilangNode.tsx","components\\CompactMetric.tsx","components\\ThemeBar.tsx"] },
  "--kilang-tooltip-text": { group: 'text', count: 3, files: ["components\\ThemeBar.tsx"] }
};

export const VariableMap = () => {
  const [search, setSearch] = useState('');
  const [expandedVar, setExpandedVar] = useState<string | null>(null);
  const [computedValues, setComputedValues] = useState<Record<string, string>>({});
  const [activeColumn, setActiveColumn] = useState<'surface' | 'border' | 'text'>('text');

  useEffect(() => {
    const updateValues = () => {
      const values: Record<string, string> = {};
      Object.keys(VARIABLE_MANIFEST).forEach(v => {
        values[v] = getComputedStyle(document.documentElement).getPropertyValue(v).trim();
      });
      setComputedValues(values);
    };

    updateValues();
    const interval = setInterval(updateValues, 2000);
    return () => clearInterval(interval);
  }, []);

  const filteredVars = Object.entries(VARIABLE_MANIFEST).filter(([name, data]) => 
    data.group === activeColumn && 
    (name.toLowerCase().includes(search.toLowerCase()))
  ).sort((a, b) => b[1].count - a[1].count);

  const stats = {
    surface: Object.values(VARIABLE_MANIFEST).filter(v => v.group === 'surface').length,
    border: Object.values(VARIABLE_MANIFEST).filter(v => v.group === 'border').length,
    text: Object.values(VARIABLE_MANIFEST).filter(v => v.group === 'text').length,
  };

  return (
    <div className="flex flex-col h-full bg-black/20 animate-in fade-in duration-500">
      {/* Tab Switcher */}
      <div className="flex p-1 bg-black/40 gap-1 border-b border-white/5">
        {(['surface', 'border', 'text'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveColumn(tab)}
            className={`flex-1 flex flex-col items-center py-2 rounded-lg transition-all ${activeColumn === tab ? 'bg-[var(--kilang-primary)] shadow-lg shadow-[var(--kilang-primary)]/20' : 'hover:bg-white/5'}`}
          >
            <span className={`text-[8px] font-black uppercase tracking-widest ${activeColumn === tab ? 'text-white' : 'text-white/30'}`}>{tab}</span>
            <span className={`text-[12px] font-black leading-none mt-0.5 ${activeColumn === tab ? 'text-white' : 'text-white/60'}`}>{stats[tab]}</span>
          </button>
        ))}
      </div>

      {/* Legacy/Search Header */}
      <div className="px-4 py-3 bg-[var(--kilang-primary)]/5 flex items-center justify-between border-b border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
          <input 
            type="text"
            placeholder={`SEARCH ${activeColumn.toUpperCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent py-1 pl-10 pr-4 text-[9px] font-black uppercase tracking-widest text-white/60 placeholder:text-white/10 focus:outline-none"
          />
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[14px] font-black text-[var(--kilang-primary)] leading-none">
            {filteredVars.reduce((acc, curr) => acc + curr[1].count, 0)}
          </span>
          <span className="text-[7px] font-bold text-white/30 uppercase tracking-widest">Target Usages</span>
        </div>
      </div>

      {/* Variable List */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
        {filteredVars.map(([name, data]) => {
          const isExpanded = expandedVar === name;
          const val = computedValues[name] || '';
          const isColor = val.startsWith('#') || val.startsWith('rgba') || val.startsWith('rgb') || val.startsWith('hsl');

          return (
            <div 
              key={name}
              className={`rounded-xl border transition-all duration-300 ${isExpanded ? 'bg-white/5 border-white/20' : 'bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/5'}`}
            >
              <button 
                onClick={() => setExpandedVar(isExpanded ? null : name)}
                className="w-full flex items-center justify-between p-3 text-left group"
              >
                <div className="flex items-center gap-3">
                  {isColor ? (
                    <div className="w-6 h-6 rounded-lg border border-white/10 shadow-lg relative overflow-hidden" style={{ backgroundColor: val }}>
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <FileCode className="w-3 h-3 text-white/20" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase tracking-widest text-white group-hover:text-[var(--kilang-primary)] transition-colors">{name}</span>
                    <span className="text-[8px] font-mono text-white/30 truncate max-w-[120px]">{val}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-white/60">{data.count}</span>
                    <span className="text-[6px] font-bold text-white/20 uppercase tracking-tighter">usages</span>
                  </div>
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-white/40" /> : <ChevronRight className="w-3.5 h-3.5 text-white/10 group-hover:text-white/40" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-3 pb-4 pt-1 animate-in slide-in-from-top-2 duration-300">
                  <div className="bg-black/40 rounded-lg p-3 border border-white/5 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1 h-1 rounded-full bg-[var(--kilang-primary)]" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Propagation Points</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {data.files.map(file => (
                        <div key={file} className="flex items-center gap-2 group/file">
                          <ChevronRight className="w-2 h-2 text-white/10 group-hover/file:text-[var(--kilang-primary)]" />
                          <span className="text-[9px] font-mono text-white/40 group-hover/file:text-white transition-colors truncate">{file}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-2 border-t border-white/5 mt-2">
                       <div className="flex items-center justify-between text-[7px] font-black uppercase tracking-widest text-white/20">
                          <span>Diagnostic Status</span>
                          <span className={data.count > 10 ? 'text-emerald-500/60' : 'text-blue-500/60'}>
                             {data.count > 10 ? 'ESTABLISHED' : 'PARTIAL'}
                          </span>
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
