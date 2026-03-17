'use client';

import React, { useState, useEffect } from 'react';
import { Minimize2, Layers, Search, Sidebar, Columns, ArrowUpDown, Activity } from 'lucide-react';

interface AffixesOverlayProps {
  showAffixesOverlay: boolean;
  setShowAffixesOverlay: (show: boolean) => void;
}

export const AffixesOverlay = ({
  showAffixesOverlay,
  setShowAffixesOverlay,
}: AffixesOverlayProps) => {
  const [showInfixes, setShowInfixes] = useState(true);
  const [showPrefixes, setShowPrefixes] = useState(true);
  const [showSuffixes, setShowSuffixes] = useState(true);
  const [activeModes, setActiveModes] = useState<string[]>(['moe', 'plus']);
  const [statsData, setStatsData] = useState<Record<string, any>>({});
  const [manifests, setManifests] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [selectedAffix, setSelectedAffix] = useState<{ affix: string; type: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'examples' | 'diffs'>('examples');
  const [sortMode, setSortMode] = useState<'count' | 'alpha'>('count');
  
  // Per-column source filters
  const [columnSources, setColumnSources] = useState<Record<string, string[]>>({
    moe: ['ALL'],
    plus: ['ALL'],
    star: ['ALL']
  });

  const [availableSources, setAvailableSources] = useState<Record<string, {id: string, label: string}[]>>({});

  useEffect(() => {
    if (Object.keys(manifests).length === 0) return;
    
    const newAvailable: Record<string, {id: string, label: string}[]> = {};
    Object.entries(manifests).forEach(([mode, manifest]) => {
      const found = new Set<string>();
      let hasOther = false;
      Object.values(manifest).forEach((data: any) => {
        if (data.src) {
          data.src.split(',').forEach((s: string) => found.add(s.trim()));
        } else {
          hasOther = true;
        }
      });
      
      const sources = [{ id: 'ALL', label: 'ALL' }];
      const mapping: Record<string, string> = { 
        s: 'Tsai', 
        p: 'Pangcah', 
        m: 'MoE Mac',
        'old-s': 'Old Tsai',
        '吳明義阿美族語辭典': 'Wu' 
      };
      
      // Sort known sources first, then others
      ['s', 'p', 'm', 'old-s', '吳明義阿美族語辭典'].forEach(s => {
        if (found.has(s)) {
          sources.push({ id: s, label: mapping[s] || s.toUpperCase() });
          found.delete(s);
        }
      });
      found.forEach(s => {
        sources.push({ id: s, label: s.toUpperCase() });
      });

      if (hasOther) sources.push({ id: 'OTHER', label: 'OTHERS' });
      newAvailable[mode] = sources;
    });
    setAvailableSources(newAvailable);
  }, [manifests]);

  useEffect(() => {
    if (!showAffixesOverlay) return;

    setLoading(true);
    const modesToFetch = ['moe', 'plus', 'star'];
    
    // Fetch stats
    const statsPromise = Promise.all(
      modesToFetch.map(mode =>
        fetch(`/data/moe_stats_${mode}.json`)
          .then(res => res.ok ? res.json() : null)
          .catch(() => null)
      )
    ).then(results => {
      const newData: Record<string, any> = {};
      modesToFetch.forEach((mode, i) => {
        if (results[i]) newData[mode] = results[i];
      });
      setStatsData(newData);
    });

    // Fetch manifests for examples & dynamic filtering
    const manifestPromise = Promise.all(
      modesToFetch.map(mode =>
        fetch(`/data/moe_manifest_${mode}.json`)
          .then(res => res.ok ? res.json() : null)
          .catch(() => null)
      )
    ).then(results => {
      const newManifests: Record<string, any> = {};
      modesToFetch.forEach((mode, i) => {
        if (results[i]) newManifests[mode] = results[i];
      });
      setManifests(newManifests);
    });

    Promise.all([statsPromise, manifestPromise]).then(() => setLoading(false));
  }, [showAffixesOverlay]);

  if (!showAffixesOverlay) return null;

  const toggleSource = (mode: string, sourceId: string) => {
    setColumnSources((prev: Record<string, string[]>) => {
      const current = prev[mode] || ['ALL'];
      let next: string[];
      
      if (sourceId === 'ALL') {
        next = ['ALL'];
      } else {
        const filters = current.filter(id => id !== 'ALL');
        if (filters.includes(sourceId)) {
          next = filters.filter(id => id !== sourceId);
          if (next.length === 0) next = ['ALL'];
        } else {
          next = [...filters, sourceId];
        }
      }
      return { ...prev, [mode]: next };
    });
  };

  const toggleMode = (mode: string) => {
    setActiveModes((prev: string[]) =>
      prev.includes(mode)
        ? prev.filter(m => m !== mode)
        : [...prev, mode]
    );
  };

  const getSortedAffixes = (mode: string) => {
    const filters = columnSources[mode] || ['ALL'];
    const manifest = manifests[mode];
    
    let affixesMap: Record<string, number> = {};

    // Use pre-calculated stats if ALL is selected and we have them
    if (filters.includes('ALL')) {
      affixesMap = statsData[mode]?.affixes || {};
    } else if (manifest) {
      // Dynamic recalculation for specific sources
      Object.entries(manifest).forEach(([word, data]: [string, any]) => {
        const entrySrc = data.src || 'OTHER';
        const entrySources = entrySrc.split(',').map((s: string) => s.trim());
        const isMatch = entrySources.some((s: string) => filters.includes(s));
        if (!isMatch) return;
        const stem = data.p;
        if (!stem || word === stem) return;

        // Extract affixes (logic mirrored from builder)
        const isPrefix = word.endsWith(stem) && word.length > stem.length;
        const isSuffix = word.startsWith(stem) && word.length > stem.length;
        
        if (isPrefix) {
          const p = `${word.slice(0, word.length - stem.length)}-`;
          affixesMap[p] = (affixesMap[p] || 0) + 1;
        }
        if (isSuffix) {
          const s = `-${word.slice(stem.length)}`;
          affixesMap[s] = (affixesMap[s] || 0) + 1;
        }

        // Infix Split Match
        for (let i = 1; i < stem.length; i++) {
          const s1 = stem.slice(0, i);
          const s2 = stem.slice(i);
          if (word.startsWith(s1) && word.endsWith(s2)) {
            const inf = `-${word.slice(s1.length, word.length - s2.length)}-`;
            affixesMap[inf] = (affixesMap[inf] || 0) + 1;
            break;
          }
        }
      });
    }

    let entries = Object.entries(affixesMap)
      .map(([affix, count]) => {
        const type = (affix.startsWith('-') && affix.endsWith('-')) ? 'infix' :
          affix.startsWith('-') ? 'suffix' : 'prefix';
        return { affix, count: count as number, type };
      })
      .filter(item => {
        if (item.type === 'infix' && !showInfixes) return false;
        if (item.type === 'prefix' && !showPrefixes) return false;
        if (item.type === 'suffix' && !showSuffixes) return false;
        return true;
      });

    const compare = (a: any, b: any) => {
      if (sortMode === 'count') return b.count - a.count;
      return a.affix.localeCompare(b.affix);
    };

    return entries.sort(compare);
  };


  const getInfixExamples = (affix: string) => {
    const cleanAffix = affix.replace(/-/g, '');
    const examples: Array<{ stem: string; word: string; mode: string }> = [];
    
    activeModes.forEach(mode => {
      const manifest = manifests[mode];
      if (!manifest) return;
      
      const filters = columnSources[mode] || ['ALL'];

      Object.entries(manifest).forEach(([word, data]: [string, any]) => {
        if (examples.length >= 100) return;
        const entrySrc = data.src || 'OTHER';
        const entrySources = entrySrc.split(',').map((s: string) => s.trim());
        const isMatch = entrySources.some((s: string) => filters.includes(s));
        if (!filters.includes('ALL') && !isMatch) return;
        
        const stem = data.p;
        if (!stem || word === stem) return;

        // Split match logic
        for (let i = 1; i < stem.length; i++) {
          const s1 = stem.slice(0, i);
          const s2 = stem.slice(i);
          if (word.startsWith(s1) && word.endsWith(s2)) {
            const inf = word.slice(s1.length, word.length - s2.length);
            if (inf === cleanAffix) {
              examples.push({ stem, word, mode });
              break;
            }
          }
        }
      });
    });

    return examples.sort((a, b) => {
      if (sortMode === 'alpha') return a.word.localeCompare(b.word);
      return 0;
    });
  };

  const getAffixExamples = (affixObj: { affix: string; type: string }) => {
    if (affixObj.type === 'infix') return getInfixExamples(affixObj.affix);

    const examples: Array<{ stem: string; word: string; mode: string }> = [];
    activeModes.forEach(mode => {
      const manifest = manifests[mode];
      if (!manifest) return;
      
      const filters = columnSources[mode] || ['ALL'];

      Object.entries(manifest).forEach(([word, data]: [string, any]) => {
        if (examples.length >= 100) return;
        const entrySrc = data.src || 'OTHER';
        const entrySources = entrySrc.split(',').map((s: string) => s.trim());
        const isMatch = entrySources.some((s: string) => filters.includes(s));
        if (!filters.includes('ALL') && !isMatch) return;

        const stem = data.p;
        if (!stem || word === stem) return;

        const isPrefix = affixObj.affix.endsWith('-');
        const clean = affixObj.affix.replace('-', '');

        if (isPrefix) {
          if (word === clean + stem) examples.push({ stem, word, mode });
        } else {
          if (word === stem + clean) examples.push({ stem, word, mode });
        }
      });
    });

    return examples.sort((a, b) => {
      if (sortMode === 'alpha') return a.word.localeCompare(b.word);
      return 0;
    });
  };

  const getDiffs = () => {
    if (activeModes.length < 2) return [];
    const modeA = activeModes[0];
    const modeB = activeModes[1];
    
    // Use current dynamic counts for diffs
    const affixesA = new Set(getSortedAffixes(modeA).map(a => a.affix));
    const affixesB = new Set(getSortedAffixes(modeB).map(a => a.affix));

    const onlyInA = Array.from(affixesA).filter(x => !affixesB.has(x)).map(a => ({ affix: a, mode: modeA }));
    const onlyInB = Array.from(affixesB).filter(x => !affixesA.has(x)).map(a => ({ affix: a, mode: modeB }));

    return [...onlyInA, ...onlyInB];
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-8 bg-[#020617]/90 backdrop-blur-3xl animate-in fade-in duration-300">
      <div className="w-full h-full max-w-[90vw] bg-[#020617]/95 border border-white/10 rounded-[40px] shadow-2xl flex flex-col overflow-hidden relative">

        {/* Header */}
        <div className="flex items-center justify-between px-10 py-5 border-b border-white/5 bg-white/2">
          <div className="flex items-center gap-5">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-black text-white tracking-widest uppercase italic leading-none">Affixes Comparison</h2>
              <p className="text-[9px] text-blue-400 font-bold uppercase tracking-[0.4em] opacity-80 mt-1.5 leading-none">Heuristic Morphological Pattern Analysis</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setSortMode(sortMode === 'count' ? 'alpha' : 'count')}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-all flex items-center gap-2 h-9"
              title="Toggle Sort Mode"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              {sortMode === 'count' ? 'By Frequency' : 'Alphabetical'}
            </button>

            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 gap-1 h-9 items-center">
              <button
                onClick={() => setShowPrefixes(!showPrefixes)}
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all h-full ${showPrefixes ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/10' : 'text-white/20 hover:text-white/40'}`}
              >
                Prefixes
              </button>
              <button
                onClick={() => setShowSuffixes(!showSuffixes)}
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all h-full ${showSuffixes ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/10' : 'text-white/20 hover:text-white/40'}`}
              >
                Suffixes
              </button>
              <button
                onClick={() => setShowInfixes(!showInfixes)}
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all h-full ${showInfixes ? 'bg-orange-500/20 text-orange-400 border border-orange-500/10' : 'text-white/20 hover:text-white/40'}`}
              >
                Infixes
              </button>
            </div>

            <div className="h-6 w-[1px] bg-white/10" />

            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
              {[
                { id: 'moe', label: 'STRICT', color: 'text-rose-400' },
                { id: 'plus', label: 'PLUS', color: 'text-blue-400' },
                { id: 'star', label: 'STAR', color: 'text-cyan-400' }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => toggleMode(m.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeModes.includes(m.id)
                    ? 'bg-white/10 text-white shadow-inner'
                    : 'text-white/20 hover:text-white/40'
                    }`}
                >
                  <span className={activeModes.includes(m.id) ? m.color : ''}>{m.label}</span>
                </button>
              ))}
            </div>

            <div className="h-6 w-[1px] bg-white/10" />

            <button
              onClick={() => setShowAffixesOverlay(false)}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-red-500 hover:text-white hover:border-red-400 transition-all shadow-md active:scale-95"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex p-10 gap-8">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <div className="text-blue-500 font-black tracking-widest uppercase text-xs">Parsing Manifests...</div>
              </div>
            </div>
          ) : activeModes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-white/20 uppercase tracking-[0.3em] font-black italic">
              <Sidebar className="w-20 h-20 mb-6 opacity-10" />
              Select a mode to begin comparison
            </div>
          ) : (
            <div className="flex-1 flex gap-8 overflow-hidden">
              {/* Main Comparison Lists */}
              <div className={`grid grid-cols-${activeModes.length} gap-8 flex-[3] overflow-hidden`}>
                {activeModes.map(mode => {
                  const affixes = getSortedAffixes(mode);
                  const maxCount = affixes.length > 0 ? Math.max(...affixes.map(a => a.count)) : 1;
                  const activeFilters = columnSources[mode] || ['ALL'];

                  return (
                    <div key={mode} className="flex flex-col h-full bg-white/5 rounded-[24px] border border-white/5 overflow-hidden animate-in slide-in-from-bottom-2 duration-500 shadow-xl">
                      <div className="px-6 py-4 border-b border-white/5 bg-white/5">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2.5 shrink-0">
                            <div className={`w-2 h-2 rounded-full ${mode === 'moe' ? 'bg-rose-500' : mode === 'plus' ? 'bg-blue-500' : 'bg-cyan-500'}`} />
                            <span className="text-[10px] font-black text-white tracking-widest uppercase">{mode === 'moe' ? 'STRICT' : mode.toUpperCase()}</span>
                          </div>
                          
                          {/* Source Toggles Inline and Centered */}
                          <div className="flex-1 flex justify-center">
                            <div className="flex gap-1 bg-black/20 p-1 rounded-lg border border-white/5">
                              {(availableSources[mode] || [{id: 'ALL', label: 'ALL'}]).map(source => (
                                <button
                                  key={source.id}
                                  onClick={() => toggleSource(mode, source.id)}
                                  className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-tighter transition-all ${
                                    activeFilters.includes(source.id) 
                                    ? 'bg-blue-500 text-white shadow-lg' 
                                    : 'text-white/20 hover:text-white/40 hover:bg-white/5'
                                  }`}
                                >
                                  {source.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <span className="text-[10px] font-mono text-white/40 shrink-0">{affixes.length}</span>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-2 bg-black/10">
                        {affixes.map(({ affix, count, type }, i) => (
                          <button
                            key={affix}
                            onClick={() => setSelectedAffix({ affix, type })}
                            className={`w-full group flex items-center gap-4 p-3 rounded-xl transition-all border ${selectedAffix?.affix === affix
                                ? 'bg-white/10 border-white/20 shadow-lg'
                                : 'hover:bg-white/5 border-transparent hover:border-white/10'
                              }`}
                          >
                            <span className="w-6 text-[10px] font-mono text-white/20 font-bold">{i + 1}</span>
                            <div className="flex-1 flex flex-col gap-1.5 text-left">
                              <div className="flex items-center justify-between">
                                <span className={`text-sm font-black tracking-widest uppercase ${type === 'infix' ? 'text-orange-400' :
                                  type === 'suffix' ? 'text-indigo-400' : 'text-emerald-400'
                                  }`}>
                                  {affix}
                                </span>
                                <span className="text-[10px] font-mono font-bold text-white/40">{count.toLocaleString()}</span>
                              </div>
                              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full opacity-60 transition-all duration-1000 ${type === 'infix' ? 'bg-orange-500' :
                                    type === 'suffix' ? 'bg-indigo-500' : 'bg-emerald-500'
                                    }`}
                                  style={{ width: `${(count / maxCount) * 100}%` }}
                                />
                              </div>
                            </div>
                          </button>
                        ))}
                        {affixes.length === 0 && (
                          <div className="h-full flex flex-col items-center justify-center text-white/10 text-[10px] font-black uppercase tracking-[0.2em] italic text-center gap-3">
                            <Activity className="w-6 h-6 opacity-5" />
                            No patterns detected in this subset
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sidebar Tabs */}
              <div className="flex-1 bg-white/5 rounded-[24px] border border-white/5 flex flex-col overflow-hidden animate-in slide-in-from-right-2 duration-500 shadow-2xl">
                <div className="flex border-b border-white/5 bg-white/2">
                  <button
                    onClick={() => setActiveTab('examples')}
                    className={`flex-1 p-5 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'examples' ? 'text-blue-400 border-b-2 border-blue-500 bg-white/5' : 'text-white/20 hover:text-white/40'}`}
                  >
                    Examples
                  </button>
                  <button
                    onClick={() => setActiveTab('diffs')}
                    className={`flex-1 p-5 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'diffs' ? 'text-blue-400 border-b-2 border-blue-500 bg-white/5' : 'text-white/20 hover:text-white/40'}`}
                  >
                    Diffs
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-black/10">
                  {activeTab === 'examples' ? (
                    selectedAffix ? (
                      <div className="space-y-4">
                        <div className="mb-6 px-4 py-3 rounded-2xl bg-white/5 border border-white/5">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-2xl font-black uppercase tracking-tighter ${selectedAffix.type === 'infix' ? 'text-orange-400' : selectedAffix.type === 'suffix' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                              {selectedAffix.affix}
                            </h4>
                            {loading && (
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                <div className="w-4 h-4 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          {getAffixExamples(selectedAffix).map((ex, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all flex flex-col gap-1.5 shadow-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] text-blue-500/60 font-black uppercase flex items-center gap-1.5">
                                  <div className={`w-1 h-1 rounded-full ${ex.mode === 'moe' ? 'bg-rose-500' : 'bg-blue-500'}`} />
                                  {ex.mode}
                                </span>
                                <span className="text-[9px] text-blue-400 font-mono italic opacity-40">#{i + 1}</span>
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm font-bold text-white/60">{ex.stem}</span>
                                <div className="h-[1px] flex-1 bg-white/5 relative">
                                  <ArrowUpDown className="absolute -top-1.5 left-1/2 -ml-1.5 w-3 h-3 text-white/10 rotate-90" />
                                </div>
                                <span className="text-sm font-black text-white tracking-widest uppercase">{ex.word}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-white/10 text-[10px] font-black uppercase tracking-widest italic text-center gap-4">
                        <Search className="w-8 h-8 opacity-20" />
                        Select an affix to see examples
                      </div>
                    )
                  ) : (
                    <div className="space-y-4">
                      {activeModes.length < 2 ? (
                        <div className="h-full flex flex-col items-center justify-center text-white/10 text-[10px] font-black uppercase tracking-widest italic text-center gap-4">
                          Select 2 modes to see diffs
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              Unique Patterns
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {getDiffs().map((diff, i) => (
                                <div key={i} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${diff.mode === 'moe' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                  {diff.affix}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
