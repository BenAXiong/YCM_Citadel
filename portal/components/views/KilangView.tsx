'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  TreePine,
  Boxes, GitBranch, Search, Filter, RefreshCw, BarChart3, Activity,
  ArrowUp, Columns, Rows, ExternalLink, Hash, BookOpen, Layers,
  Download, Image as ImageIcon, ChevronRight, ChevronDown, Maximize2, Minimize2, Zap, AlertCircle, HelpCircle,
  Minimize, Maximize, Link2, TrendingUp, Minus, Plus, RotateCcw, XCircle
} from 'lucide-react';
import { toPng } from 'html-to-image';
import './Kilang.css';

interface RootStats {
  summary: {
    total_roots: number;
    max_depth: number;
    max_branches: number;
    total_words: number;
    average_branching: number;
    std_dev: number;
  };
  distribution: Record<string, number>;
  depth_distribution: Record<string, number>;
  deep_examples: Record<string, string[]>;
  top_roots: Array<{ root: string; count: number }>;
}

export default function KilangView() {
  const [stats, setStats] = useState<RootStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [layoutMode, setLayoutMode] = useState<'h1' | 'h2' | 'v1' | 'v2'>('h1');
  const [searchTerm, setSearchTerm] = useState('');
  const [exporting, setExporting] = useState(false);
  const [scale, setScale] = useState(1);
  const [isFit, setIsFit] = useState(false);
  const treeRef = useRef<HTMLDivElement>(null);
  const [branchFilter, setBranchFilter] = useState<string | 'all'>('all');
  const [selectedRoot, setSelectedRoot] = useState<string | null>(null);
  const [rootData, setRootData] = useState<any>(null);
  const [showStatsOverlay, setShowStatsOverlay] = useState(false);
  const [summaryCache, setSummaryCache] = useState<Record<string, string[]>>({});
  const [morphMode, setMorphMode] = useState<'moe' | 'plus' | 'star'>('moe');
  const [visibleChainsCount, setVisibleChainsCount] = useState(10);

  const [manifest, setManifest] = useState<any>(null);
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');

  const MOE_SOURCES = [
    { id: 'ALL', label: 'ALL SOURCES' },
    { id: 's', label: 'Tsai (s)' },
    { id: 'p', label: 'Pangcah (p)' },
    { id: 'm', label: 'MoE Mac (m)' },
  ];

  useEffect(() => {
    setLoading(true);
    const statsFile = `/data/moe_stats_${morphMode}.json`;
    const manifestFile = `/data/moe_manifest_${morphMode}.json`;

    fetch(statsFile)
      .then(res => {
        if (!res.ok) throw new Error('Fetch failed');
        return res.json();
      })
      .then(data => {
        setStats(data);
        return fetch(manifestFile);
      })
      .then(res => res.json())
      .then(m => {
        setManifest(m);
        setLoading(false);
        // Clear selection when mode changes to prevent data mismatch
        setSelectedRoot(null);
        setRootData(null);
      })
      .catch(err => {
        console.error('Stats/Manifest fetch error:', err);
        setLoading(false);
      });
  }, [morphMode]);

  const FILTER_BUCKETS = [
    { label: '1', min: 1, max: 1 },
    { label: '2', min: 2, max: 2 },
    { label: '3', min: 3, max: 3 },
    { label: '4-5', min: 4, max: 5 },
    { label: '6-10', min: 6, max: 10 },
    { label: '11-20', min: 11, max: 20 },
    { label: '21-50', min: 21, max: 50 },
    { label: '51-80', min: 51, max: 80 },
    { label: '80+', min: 81, max: 1000 },
  ];

  const bucketHits = useMemo(() => {
    if (!stats) return {};
    const hits: Record<string, number> = {};
    FILTER_BUCKETS.forEach(bucket => {
      hits[bucket.label] = stats.top_roots.filter(r => r.count >= bucket.min && r.count <= bucket.max).length;
    });
    return hits;
  }, [stats]);

  const filteredRoots = useMemo(() => {
    if (!stats) return [];
    let roots = stats.top_roots;

    if (searchTerm) {
      roots = roots.filter(r => r.root.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (branchFilter !== 'all') {
      const bucket = FILTER_BUCKETS.find(b => b.label === branchFilter);
      if (bucket) {
        roots = roots.filter(r => r.count >= bucket.min && r.count <= bucket.max);
      }
    }

    const uniqueRoots = new Map();
    roots.forEach(r => {
      const low = r.root.toLowerCase();
      if (!uniqueRoots.has(low) || r.count > uniqueRoots.get(low).count) {
        uniqueRoots.set(low, r);
      }
    });

    return Array.from(uniqueRoots.values()).sort((a, b) => b.count - a.count);
  }, [stats, searchTerm, branchFilter]);

  const fetchRootDetails = async (root: string) => {
    setSelectedRoot(root);
    setRootData({ loading: true });
    try {
      const res = await fetch(`/api/moe_shadow?keyword=${encodeURIComponent(root)}&aggregate=true&mode=${morphMode}&source=${sourceFilter}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const data = await res.json();

      let allRows = data.rows || [];
      const lowRoot = root.toLowerCase().trim();

      const uniqueDerivativesMap = new Map();
      allRows.forEach((d: any) => {
        let word = d.word_ab.toLowerCase().trim();
        if (word.endsWith('|')) word = word.slice(0, -1);

        // Clean parent and root from API
        let pWord = d.parent_word ? d.parent_word.trim() : null;
        if (pWord && pWord.endsWith('|')) pWord = pWord.slice(0, -1);

        let uRoot = d.ultimate_root ? d.ultimate_root.trim() : null;
        if (uRoot && uRoot.endsWith('|')) uRoot = uRoot.slice(0, -1);

        // HYBRID SHIFT-LEFT: Using pre-calculated sortPath from API if available
        const dRow = {
          ...d,
          word_ab: word,
          parentWord: pWord,
          ultimateRoot: uRoot,
          tier: Number(d.tier || 2),
          sortPath: d.sort_path
        };

        if (word !== lowRoot && !uniqueDerivativesMap.has(word)) {
          uniqueDerivativesMap.set(word, dRow);
        }
      });

      let derivatives = Array.from(uniqueDerivativesMap.values());

      // If sortPath was not pre-calculated by API (e.g. Star/Plus mode), fallback to client-side
      if (!derivatives[0]?.sortPath) {
        const getAncestry = (word: any) => {
          let path = [word.word_ab.toLowerCase()];
          let curr = word;
          for (let i = 0; i < 15; i++) {
            if (!curr.parentWord) break;
            const parent = derivatives.find((p: any) => p.word_ab.toLowerCase() === curr.parentWord.toLowerCase());
            if (parent) {
              path.unshift(parent.word_ab.toLowerCase());
              curr = parent;
            } else break;
          }
          return path.join('>');
        };
        derivatives = derivatives.map((d: any) => ({ ...d, sortPath: getAncestry(d) }));
      }

      let currentRow = 0;
      const assignTreeRows = (parentWord: string, startRow: number) => {
        const pNormalized = parentWord.toLowerCase().trim();
        const children = derivatives.filter((d: any) => d.parentWord?.toLowerCase() === pNormalized);
        if (children.length === 0) return 1;

        let totalUsed = 0;
        children.forEach((child: any, i: number) => {
          const rowsForChild = assignTreeRows(child.word_ab, startRow + totalUsed);
          child.treeRow = startRow + totalUsed;
          totalUsed += rowsForChild;
        });
        return totalUsed;
      };

      assignTreeRows(lowRoot, 0);

      const parentRes = await fetch(`/api/moe_shadow?keyword=${encodeURIComponent(root)}&exact=true&mode=${morphMode}`);
      const parentData = await parentRes.json();
      const firstEntry = parentData.rows?.[0];
      let parentStem = firstEntry?.stem && firstEntry.stem.toLowerCase() !== root.toLowerCase() ? firstEntry.stem : null;
      if (parentStem && parentStem.endsWith('|')) parentStem = parentStem.slice(0, -1);

      setRootData({
        word: root,
        derivatives: derivatives,
        totalInDb: allRows.length,
        parentStem: parentStem,
        loading: false
      });
    } catch (e: any) {
      console.error("[Kilang] Bloom Error:", e);
      setRootData({
        error: true,
        errorMessage: e.message || "Unknown Error",
        loading: false
      });
    } finally {
      setRootData((prev: any) => ({ ...prev, loading: false }));
    }
  };

  const handleExport = async () => {
    if (!treeRef.current || !selectedRoot) return;
    setExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const dataUrl = await toPng(treeRef.current, {
        backgroundColor: '#020617',
        quality: 1,
        pixelRatio: 2,
        style: {
          borderRadius: '0',
          transform: 'scale(1)',
          transformOrigin: '0 0'
        }
      });
      const link = document.createElement('a');
      link.download = `kilang-${selectedRoot.toLowerCase()}-${layoutMode}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const fetchSummary = async (word: string) => {
    const key = word.toLowerCase();
    if (summaryCache[key]) return;
    try {
      const res = await fetch(`/api/moe_shadow?keyword=${encodeURIComponent(word)}&exact=true&mode=${morphMode}`);
      const data = await res.json();
      const wordEntries = data.rows || [];
      if (wordEntries.length > 0) {
        setSummaryCache(prev => ({
          ...prev,
          [key]: wordEntries.map((r: any) => r.definition)
        }));
      } else {
        setSummaryCache(prev => ({ ...prev, [key]: ["No definition found."] }));
      }
    } catch (e) {
      setSummaryCache(prev => ({ ...prev, [key]: ["Error loading definition."] }));
    }
  };

  const LineageCanvas = ({ root, derivatives, layoutMode = 'vertical', zoom = 1 }: { root: string; derivatives: any[]; layoutMode?: 'vertical' | 'horizontal'; zoom?: number }) => {
    const [paths, setPaths] = useState<string[]>([]);
    const containerRef = useRef<SVGSVGElement>(null);

    const calculatePaths = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newPaths: string[] = [];
      const getCenter = (id: string, containerRect: DOMRect) => {
        const el = document.getElementById(`node-${id.toLowerCase().replace(/\s/g, '-')}`);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const cx = (rect.left + rect.width / 2 - containerRect.left) / zoom;
        const cy = (rect.top + rect.height / 2 - containerRect.top) / zoom;
        return { x: cx, y: cy };
      };
      derivatives.forEach(d => {
        const target = getCenter(d.word_ab, containerRect);
        const source = getCenter(d.parentWord || root, containerRect);
        if (source && target) {
          if (layoutMode === 'vertical') {
            const midY = (source.y + target.y) / 2;
            newPaths.push(`M ${source.x} ${source.y} C ${source.x} ${midY} ${target.x} ${midY} ${target.x} ${target.y}`);
          } else {
            const midX = (source.x + target.x) / 2;
            newPaths.push(`M ${source.x} ${source.y} C ${midX} ${source.y} ${midX} ${target.y} ${target.x} ${target.y}`);
          }
        }
      });
      setPaths(newPaths);
    };

    useEffect(() => {
      calculatePaths();
      const interval = setInterval(calculatePaths, 32);
      window.addEventListener('resize', calculatePaths);
      const observer = new MutationObserver(calculatePaths);
      observer.observe(document.body, { childList: true, subtree: true });
      return () => {
        clearInterval(interval);
        window.removeEventListener('resize', calculatePaths);
        observer.disconnect();
      };
    }, [derivatives, root, zoom, layoutMode]);

    return (
      <svg ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <defs>
          <linearGradient id="lineageGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        {paths.map((d, i) => (
          <path key={i} d={d} stroke="url(#lineageGradient)" strokeWidth="1.5" fill="none" className="transition-all duration-700 opacity-20 hover:opacity-100" />
        ))}
      </svg>
    );
  };

  const WordTooltip = ({ word, children, dictCode }: { word: string; children: React.ReactNode; dictCode?: string }) => {
    const [isHovered, setIsHovered] = useState(false);
    const timeoutRef = useRef<any>(null);
    const cacheKey = word.toLowerCase();

    const handleEnter = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsHovered(true);
      fetchSummary(word);
    };

    const handleLeave = () => {
      timeoutRef.current = setTimeout(() => setIsHovered(false), 400);
    };

    return (
      <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
        {children}
        <div
          onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current); setIsHovered(true); }}
          onMouseLeave={handleLeave}
          className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-80 bg-[#0f172a] border border-blue-500/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl p-6 transition-all z-[2000] pointer-events-auto text-left leading-normal duration-200 border-b-4 border-b-blue-500 ${isHovered ? 'visible opacity-100 translate-y-0' : 'invisible opacity-0 translate-y-2'}`}
        >
          <div className="flex flex-col gap-1 mb-4 border-b border-white/10 pb-3">
            <div className="flex items-center justify-between text-normal">
              <span className="text-2xl font-black text-white tracking-tighter uppercase">{word}</span>
              {dictCode && <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full uppercase">{dictCode}</span>}
            </div>
            <div className="h-0.5 w-16 bg-blue-500" />
          </div>
          <div className="space-y-4 max-h-[250px] overflow-y-auto custom-scrollbar pr-2 leading-relaxed">
            {summaryCache[cacheKey] === undefined ? (
              <div className="flex items-center gap-2 italic text-blue-400/50 text-xs font-mono">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                DECODING SEMANTIC CORE...
              </div>
            ) : (
              summaryCache[cacheKey].map((def: string, idx: number) => (
                <div key={idx} className="flex gap-3">
                  <span className="text-blue-500 font-black text-xs mt-1">{idx + 1}.</span>
                  <div className="text-sm text-gray-300 font-medium">{def}</div>
                </div>
              ))
            )}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 w-3 h-3 bg-[#0f172a] border-r border-b border-blue-500/30" />
        </div>
      </div>
    );
  };

  const KilangNode = ({ word, dictCode, tier = 2, isRoot = false }: { word: string; dictCode?: string; tier?: number; isRoot?: boolean }) => {
    return (
      <WordTooltip word={word} dictCode={dictCode}>
        <div id={`node-${word.toLowerCase().replace(/\s/g, '-')}`} className="relative">
          <div className={isRoot ? "kilang-root-bubble" : "kilang-branch-bubble"}>
            {isRoot ? (
              <div className="bg-[#0f172a] border-4 border-blue-600 p-8 rounded-full shadow-[0_0_50px_rgba(59,130,246,0.5)] z-10 relative min-w-[120px] flex items-center justify-center">
                <span className="text-white font-black text-2xl tracking-tighter">{word}</span>
              </div>
            ) : (
              <div className={`transition-all text-sm group ring-1 ring-white/5 relative z-10 border px-4 py-3 rounded-2xl ${
                tier === 2 ? "border-blue-500/40 bg-blue-500/10 shadow-lg shadow-blue-500/10" :
                tier === 3 ? "border-indigo-500/30 bg-indigo-500/5 opacity-80 scale-95 shadow-md shadow-indigo-500/5" :
                tier === 4 ? "border-emerald-500/20 bg-emerald-500/5 opacity-60 scale-90 border-dashed" :
                "border-white/10 bg-white/5 opacity-40 scale-75"
              }`}>
                <div className="flex items-center gap-2">
                  <Zap className={`w-3 h-3 ${tier === 2 ? 'text-blue-400' : tier === 3 ? 'text-indigo-400' : 'text-emerald-400'} opacity-50`} />
                  <span className="font-bold text-white group-hover:text-blue-300 transition-colors">{word}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </WordTooltip>
    );
  };

  if (loading) {
    return (
      <div className="kilang-container flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />
          <div className="text-blue-500 font-bold tracking-widest uppercase">Growing the Kilang...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="kilang-container flex flex-col h-screen overflow-hidden">
      <header className="h-16 border-b border-white/5 bg-[#020617]/80 backdrop-blur-md flex items-center justify-between px-6 z-50 shrink-0">
        <div className="flex items-center gap-6">
          {/* 1. Logo & Title */}
          <div className="flex items-center gap-3 group cursor-default">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <GitBranch className="text-white w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white tracking-[0.2em] leading-none uppercase">KILANG</span>
                <span className="text-[8px] font-black text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded uppercase tracking-widest">BETA</span>
              </div>
              <span className="text-[8px] font-black text-blue-400/60 uppercase tracking-widest mt-1">MORPHO-ENGINE</span>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-white/10 mx-1" />

          {/* 2. Morphology Distribution Toggle */}
          <button
            onClick={() => setShowStatsOverlay(true)}
            className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all ${showStatsOverlay ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-white/5 border-white/10 text-kilang-text-muted hover:border-white/30 hover:text-white'}`}
            title="Morphology Distribution"
          >
            <Activity className="w-5 h-5" />
          </button>

          <div className="h-4 w-[1px] bg-white/10 mx-1" />

          {/* 3. Morphology Mode Selector + Source Dropdown */}
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-0.5 h-10 items-stretch relative">
            {(['moe', 'plus', 'star'] as const).map(mode => {
              if (mode === 'moe') {
                return (
                  <div key={mode} className="relative group flex h-full">
                    <button
                      onClick={() => setMorphMode('moe')}
                      className={`px-4 h-full flex items-center justify-center rounded-lg text-[10px] font-black tracking-widest transition-all ${morphMode === 'moe'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-kilang-text-muted hover:text-white hover:bg-white/5'
                        }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{sourceFilter === 'ALL' || morphMode !== 'moe' ? 'MoE' : (MOE_SOURCES.find(s => s.id === sourceFilter)?.label.split(' ')[0] || 'MoE')}</span>
                        <ChevronDown className="w-2.5 h-2.5 opacity-40 shrink-0" />
                      </div>
                    </button>
                    
                    <div className="absolute top-full left-0 mt-1 w-48 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl p-1 hidden group-hover:block z-[3000] animate-in fade-in duration-200">
                      {MOE_SOURCES.map(s => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setSourceFilter(s.id);
                            setMorphMode('moe');
                          }}
                          className={`w-full text-left px-4 py-2 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all ${sourceFilter === s.id && morphMode === 'moe' ? 'bg-blue-600 text-white' : 'text-kilang-text-muted hover:bg-white/5 hover:text-white'}`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              }
              return (
                <button
                  key={mode}
                  onClick={() => setMorphMode(mode)}
                  disabled={true}
                  className={`px-4 flex items-center justify-center rounded-lg text-[10px] font-black tracking-widest transition-all ${morphMode === mode
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-white/10 cursor-not-allowed'
                    }`}
                >
                  {mode === 'plus' ? 'MoE+' : 'MoE*'}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Word + Views + Zoom + Export */}
        <div className="flex-1 flex items-center justify-center px-8 border-x border-white/5 mx-6 h-full">
          {selectedRoot ? (
            <div className="flex items-center gap-6 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="flex items-center gap-3">
                <span className="text-[8px] font-black text-kilang-text-muted uppercase tracking-widest">Layout</span>
                <div className="flex items-center gap-1.5 p-0.5 bg-white/[0.02] border border-white/5 rounded-lg">
                  {(['h1', 'h2', 'v1', 'v2'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setLayoutMode(mode)}
                      className={`w-7 h-7 flex items-center justify-center rounded text-[9px] font-black transition-all ${layoutMode === mode ? 'bg-blue-600 text-white shadow-lg' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                    >
                      {mode.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-[1px] h-8 bg-white/5" />

              <div className="flex items-center gap-1">
                <button onClick={() => { setScale(1); setIsFit(false); }} className={`p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all shadow-sm ${!isFit && scale === 1 ? 'text-blue-400' : 'text-white/50'}`} title="Reset Zoom">
                  <RotateCcw className="w-3 h-3" />
                </button>
                <button onClick={() => { setScale(prev => Math.max(0.2, prev - 0.1)); setIsFit(false); }} className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-all shadow-sm" title="Out">
                  <Minus className="w-3 h-3" />
                </button>
                <button onClick={() => { setScale(prev => Math.min(2, prev + 0.1)); setIsFit(false); }} className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-all shadow-sm" title="In">
                  <Plus className="w-3 h-3" />
                </button>
                <div className="w-[1px] h-4 bg-white/10 mx-2" />
                <button
                  onClick={handleExport}
                  className="p-2 bg-white/5 border border-white/10 rounded-xl text-white/50 hover:bg-blue-600 hover:text-white hover:border-blue-400 transition-all shadow-md"
                  title="Export as PNG"
                >
                  <ImageIcon className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 text-kilang-text-muted/30">
              <GitBranch className="w-4 h-4 opacity-50" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-center">Selected Root data will appear here</span>
            </div>
          )}
        </div>

        {/* 4. Stats Cards */}
        <div className="flex items-center gap-2">
          {stats && (
            <>
              <CompactMetric
                icon={<Boxes className="w-3 h-3" />}
                label="Stems"
                value={stats.summary.total_roots}
                color="blue"
                description="Total unique semantic roots identified in the database."
              />
              <CompactMetric
                icon={<Activity className="w-3 h-3" />}
                label="Branching"
                value={stats.summary.average_branching}
                color="indigo"
                description="Average number of derived forms per semantic root."
              />
              <CompactMetric
                icon={<Maximize className="w-3 h-3" />}
                label="Span"
                value={stats.summary.max_depth}
                color="emerald"
                description="Maximum morphological depth (evolutionary layers) found."
              />
              <CompactMetric
                icon={<TrendingUp className="w-3 h-3" />}
                label="Flowers"
                value={stats.summary.total_words}
                color="rose"
                description="Total vocabulary words mapped to established roots."
              />
              <div className="w-8 h-10 border border-white/5 bg-white/[0.01] rounded-xl border-dashed opacity-20 ml-2" />
            </>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-96 border-r border-white/5 flex flex-col kilang-glass-panel">
          <div className="p-6 space-y-4">
            <div className="relative group">
              <Search className="absolute left-3 top-3 w-4 h-4 text-kilang-text-muted group-focus-within:text-blue-500" />
              <input
                type="text"
                placeholder="Search semantic roots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 text-kilang-text-muted hover:text-white transition-colors"
                  aria-label="Clear search"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-kilang-text-muted uppercase tracking-widest px-1"><Filter className="w-3.5 h-3.5" /> Filter by Branches</div>
            <div className="grid grid-cols-5 gap-2">
              <button onClick={() => setBranchFilter('all')} className={`py-2 rounded-lg border text-[10px] font-black ${branchFilter === 'all' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-kilang-text-muted'}`}>ANY</button>
              {FILTER_BUCKETS.map((bucket) => (
                <button key={bucket.label} onClick={() => setBranchFilter(bucket.label)} className={`py-2 rounded-lg border text-[10px] font-black flex flex-col items-center justify-center ${branchFilter === bucket.label ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-kilang-text-muted'}`}><span>{bucket.label}</span><span className="text-[8px] opacity-60 mt-0.5">({bucketHits[bucket.label] || 0})</span></button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 space-y-2">
            {filteredRoots.map((r, i) => (
              <div key={i} onClick={() => fetchRootDetails(r.root)} className={`px-4 py-2.5 rounded-xl cursor-pointer transition-all border flex items-center justify-between group ${selectedRoot === r.root ? 'bg-blue-600/20 border-blue-500/50' : 'bg-white/5 border-white/5 hover:border-white/20'}`}>
                <span className="text-[13px] font-bold text-white uppercase tracking-tight">{r.root}</span>
                <span className="text-xs font-black text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md">{r.count}</span>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 overflow-hidden relative">
          <div className="h-full flex flex-col">
            <div className="p-4" />
            <div className="flex-1 p-8 pt-4 overflow-hidden flex flex-col">
              <div className="flex-1 kilang-glass-panel rounded-3xl overflow-hidden relative flex flex-col border border-white/10 shadow-2xl">
                {selectedRoot ? (
                  <div ref={treeRef} className="flex-1 overflow-auto custom-scrollbar p-16 bg-[#020617]/40 relative flex flex-col items-center">
                    {rootData?.error ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                          <Activity className="w-8 h-8" />
                        </div>
                        <div className="text-red-500 font-mono text-sm tracking-widest uppercase">Forest Poisoned</div>
                        <div className="text-red-400/60 text-[10px] font-mono italic max-w-xs text-center">{rootData.errorMessage}</div>
                      </div>
                    ) : rootData?.loading ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-4"><RefreshCw className="w-10 h-10 text-blue-500 animate-spin opacity-50" /><div className="animate-pulse text-blue-500 font-mono italic text-xs tracking-widest uppercase">Blooming forest...</div></div>
                    ) : (
                      <div
                        className={`min-h-[1000px] flex transition-all duration-700 origin-center ${isFit ? '!justify-center !items-center !p-0' : (layoutMode.startsWith('v') ? 'flex-col items-center pt-24 pb-96' : 'flex-row items-center py-32 pl-40 pr-96')} gap-12 w-full relative`}
                        style={{ transform: isFit ? 'scale(0.5)' : `scale(${scale})` }}
                      >
                        <LineageCanvas root={selectedRoot} derivatives={rootData?.derivatives || []} layoutMode={layoutMode.startsWith('h') ? 'horizontal' : 'vertical'} zoom={isFit ? 0.45 : 1} />
                        {layoutMode === 'v1' ? (
                          <>
                            {[10, 9, 8, 7, 6, 5, 4, 3, 2].map(tier => {
                              const rawItems = rootData?.derivatives?.filter((d: any) => d.tier === tier) || [];
                              if (rawItems.length === 0) return null;
                              const tierItems = [...rawItems].sort((a, b) => a.sortPath.localeCompare(b.sortPath));
                              return (
                                <div key={tier} className="w-full flex flex-col items-center gap-10">
                                  <div className="flex flex-wrap justify-center gap-6 relative z-10">{tierItems.map((d: any) => <KilangNode key={d.word_ab} word={d.word_ab} dictCode={d.dict_code?.toUpperCase()} tier={d.tier} />)}</div>
                                  <div className="h-6 w-px bg-white/5" />
                                </div>
                              );
                            })}
                            <div className="relative z-50 shrink-0 mb-32" id={`node-${selectedRoot.toLowerCase().replace(/\s/g, '-')}`}><KilangNode word={selectedRoot} isRoot={true} /></div>
                          </>
                        ) : layoutMode === 'h1' ? (
                          <>
                            <div className={`relative z-50 shrink-0 ${isFit ? 'mr-10' : 'mr-20'}`} id={`node-${selectedRoot.toLowerCase().replace(/\s/g, '-')}`}><KilangNode word={selectedRoot} isRoot={true} /></div>
                            {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(tier => {
                              const rawItems = rootData?.derivatives?.filter((d: any) => d.tier === tier) || [];
                              if (rawItems.length === 0) return null;
                              const tierItems = [...rawItems].sort((a, b) => a.sortPath.localeCompare(b.sortPath));
                              return (
                                <div key={tier} className="flex h-full items-center">
                                  <div className={`${isFit ? 'w-10' : 'w-20'} h-px bg-white/10`} />
                                  <div className="flex flex-col items-start gap-4">{tierItems.map((d: any) => <KilangNode key={d.word_ab} word={d.word_ab} dictCode={d.dict_code?.toUpperCase()} tier={d.tier} />)}</div>
                                </div>
                              );
                            })}
                          </>
                        ) : layoutMode === 'h2' ? (
                          <div className="flex items-center gap-24 py-10 relative pr-64">
                            <div id={`node-${selectedRoot.toLowerCase().replace(/\s/g, '-')}`} className="shrink-0">
                              <KilangNode word={selectedRoot} isRoot={true} />
                            </div>
                            <div className="grid grid-cols-[repeat(10,240px)] gap-x-12 relative" style={{ gridTemplateRows: `repeat(${Math.max(1, ...rootData?.derivatives?.map((d: any) => d.treeRow) || [0]) + 1}, 80px)` }}>
                              {rootData?.derivatives?.map((d: any) => (
                                <div key={d.word_ab} className="relative" style={{ gridColumn: d.tier - 1, gridRow: (d.treeRow ?? 0) + 1 }}><KilangNode word={d.word_ab} dictCode={d.dict_code?.toUpperCase()} tier={d.tier} /></div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-24 py-10 relative pb-64">
                            <div id={`node-${selectedRoot.toLowerCase().replace(/\s/g, '-')}`} className="shrink-0 mb-12">
                              <KilangNode word={selectedRoot} isRoot={true} />
                            </div>
                            <div className="grid grid-rows-[repeat(10,100px)] gap-y-12 relative" style={{ gridTemplateColumns: `repeat(${Math.max(1, ...rootData?.derivatives?.map((d: any) => d.treeRow) || [0]) + 1}, 240px)` }}>
                              {rootData?.derivatives?.map((d: any) => (
                                <div key={d.word_ab} className="relative flex items-center justify-center" style={{ gridRow: d.tier - 1, gridColumn: (d.treeRow ?? 0) + 1 }}>
                                  <KilangNode word={d.word_ab} dictCode={d.dict_code?.toUpperCase()} tier={d.tier} />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-20 text-center space-y-8">
                    <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
                      <TreePine className="w-12 h-12 text-blue-500/40" />
                    </div>
                    <div className="max-w-md space-y-4">
                      <h3 className="text-2xl font-black text-white uppercase tracking-widest">Semantic Root Forest</h3>
                      <p className="text-kilang-text-muted leading-relaxed">Select a root from the left panel to visualize its morphological evolution and semantic growth patterns.</p>
                      <div className="flex flex-wrap justify-center gap-2 pt-4">
                        {stats?.top_roots.slice(0, 5).map(r => (
                          <button key={r.root} onClick={() => fetchRootDetails(r.root)} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black hover:bg-white/10 text-white/60">
                            {r.root}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Distribution Overlay - Global Coverage */}
      {showStatsOverlay && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-12 bg-[#020617]/80 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="w-full h-full bg-[#020617]/90 border border-white/10 rounded-[40px] shadow-2xl flex flex-col overflow-hidden relative">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-12 space-y-16">
              <div className="flex items-center justify-between border-b border-white/5 pb-8 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-widest uppercase">Morphology Distribution</h2>
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em] mt-1">Cross-lexical semantic analysis</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowStatsOverlay(false)}
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-red-500 hover:text-white hover:border-red-400 transition-all shadow-lg"
                >
                  <Minimize2 className="w-6 h-6" />
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
                {/* 1: Frequency Map */}
                <div className="flex flex-col space-y-6">
                  <h4 className="text-sm font-black text-indigo-400 mb-6 flex items-center gap-2 uppercase tracking-[0.2em] border-b border-indigo-500/20 pb-4">
                    <BarChart3 className="w-4 h-4" /> Frequency Map
                  </h4>
                  <div className="flex-1 flex flex-col gap-3">
                    {(() => {
                      const dist = Object.entries(stats?.distribution || {}).map(([k, v]) => ({ branches: parseInt(k), count: v as number })).filter(d => d.branches > 0).sort((a, b) => a.branches - b.branches).slice(0, 30);
                      const maxFreq = Math.max(...dist.map(d => d.count), 1);
                      return dist.map(({ branches, count }) => (
                        <div key={branches} className="flex items-center gap-4 group">
                          <div className="w-12 text-right text-[10px] font-mono text-kilang-text-muted font-bold tracking-tighter uppercase">{branches} Br.</div>
                          <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-400 font-black" style={{ width: `${(count / maxFreq) * 100}%` }} />
                          </div>
                          <div className="w-16 text-[10px] font-mono text-blue-400 font-bold">{count}</div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                <div className="flex flex-col gap-12 h-full">
                  {/* 2: Vertical Depth */}
                  <div className="bg-[#020617]/50 rounded-2xl p-8 border border-white/5 flex-1 flex flex-col">
                    <h4 className="text-sm font-black text-blue-400 mb-6 flex items-center gap-2 uppercase tracking-[0.2em] border-b border-blue-500/20 pb-4">
                      <Activity className="w-4 h-4" /> Vertical Depth
                    </h4>
                    <div className="grid grid-cols-2 gap-4 flex-1 content-start">
                      {stats?.depth_distribution && Object.entries(stats.depth_distribution)
                        .sort(([a], [b]) => parseInt(a) - parseInt(b))
                        .map(([depth, count]: any) => {
                          const depthNum = parseInt(depth);
                          const percentage = ((count / stats.summary.total_words) * 100).toFixed(1);
                          const labels: any = { 1: 'ROOTS', 2: 'LEVEL 2', 3: 'NESTED', 4: 'EVOLUTION', 5: 'COMPLEX', 6: 'DEEP', 7: 'ULTRA', 8: 'EPIC', 9: 'LEGEND' };
                          return (
                            <div key={depth} className="p-4 bg-[#0f172a]/80 rounded-[20px] border border-white/5 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-black text-white/40 uppercase tracking-widest">DEPTH {depthNum}</span>
                                <span className="text-[8px] text-blue-400 font-black uppercase tracking-widest px-2 py-0.5 bg-blue-500/10 rounded-full border border-blue-500/20">{labels[depthNum] || 'HUB'}</span>
                              </div>
                              <div className="flex items-baseline justify-between gap-4">
                                <div className="text-2xl font-black text-white leading-tight tracking-tighter">{percentage}%</div>
                                <div className="text-[10px] text-kilang-text-muted font-mono font-bold whitespace-nowrap">{count.toLocaleString()} words</div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* 3: Top Roots */}
                  <div className="bg-[#020617]/50 rounded-2xl p-8 border border-white/5 flex-1 flex flex-col">
                    <h4 className="text-sm font-black text-emerald-400 mb-6 flex items-center gap-2 uppercase tracking-[0.2em] border-b border-emerald-500/20 pb-4">
                      <TrendingUp className="w-4 h-4" /> Top Roots
                    </h4>
                    <div className="grid grid-cols-3 gap-x-6 gap-y-2 flex-1 content-start">
                      {(() => {
                        const roots = stats?.top_roots.slice(0, 15) || [];
                        const rows = 5;
                        const cols = 3;
                        const reordered = [];
                        for (let r = 0; r < rows; r++) {
                          for (let c = 0; c < cols; c++) {
                            const index = r + c * rows;
                            if (index < roots.length) reordered.push({ ...roots[index], originalIndex: index });
                          }
                        }
                        return reordered.map((r, i) => (
                          <WordTooltip word={r.root} key={i}>
                            <div onClick={() => { setShowStatsOverlay(false); fetchRootDetails(r.root); }} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10 group hover:border-blue-500 hover:bg-white/10 transition-all cursor-pointer h-full">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-5 h-5 min-w-[20px] rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center text-[9px] font-black">{r.originalIndex + 1}</span>
                                <span className="font-black text-white group-hover:text-blue-400 uppercase tracking-widest text-[11px] truncate">{r.root}</span>
                              </div>
                              <div className="flex items-baseline gap-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/5 group-hover:border-blue-500/20 shrink-0">
                                <span className="text-[11px] font-black text-white">{r.count}</span>
                                <span className="text-[7px] text-kilang-text-muted uppercase font-black font-mono leading-none">br.</span>
                              </div>
                            </div>
                          </WordTooltip>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#020617]/50 rounded-[40px] p-10 border border-white/5 space-y-8">
                <div className="space-y-6">
                  <h4 className="text-lg font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
                    <Link2 className="w-6 h-6" /> Complex Chains
                  </h4>
                  <div className="grid grid-cols-1 gap-8">
                    {(() => {
                      const allChains = Object.entries(stats?.deep_examples || {})
                        .sort(([, a]: any, [, b]: any) => b.length - a.length);
                      
                      const visibleChains = allChains.slice(0, visibleChainsCount);
                      
                      return (
                        <>
                          {visibleChains.map(([root, chain]: any) => (
                            <WordTooltip word={chain[chain.length - 1]} key={root}>
                              <div onClick={() => { setShowStatsOverlay(false); fetchRootDetails(chain[chain.length - 1]); }} className="p-8 bg-[#0f172a]/80 rounded-[32px] border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group/chain shadow-xl space-y-6 flex items-center justify-between h-full">
                                <div className="flex items-center justify-between gap-6 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                                    {chain.map((link: string, i: number) => (
                                      <React.Fragment key={i}>
                                        <WordTooltip word={link}>
                                          <div className={`px-4 py-2 rounded-xl text-[11px] font-bold font-mono border ${i === 0 ? 'bg-white/5 border-white/10 text-white/40' : i === chain.length - 1 ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-[#1e293b] border-white/5 text-white/70 group-hover/chain:text-white group-hover/chain:border-blue-500/30'}`}>
                                            {link}
                                          </div>
                                        </WordTooltip>
                                        {i < chain.length - 1 && <ChevronRight className="w-4 h-4 text-white/20 shrink-0" />}
                                      </React.Fragment>
                                    ))}
                                  </div>
                                  <div className="px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[12px] font-black text-indigo-400 uppercase tracking-[0.2em] shrink-0">DEPTH {chain.length}</div>
                                </div>
                              </div>
                            </WordTooltip>
                          ))}
                          
                          {allChains.length > visibleChainsCount && (
                            <div className="flex justify-center pt-8">
                              <button 
                                onClick={() => setVisibleChainsCount(prev => prev + 10)}
                                className="px-10 py-5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 rounded-[24px] text-white font-black uppercase tracking-[0.3em] transition-all shadow-xl flex items-center gap-4 group"
                              >
                                <span>Load More Chains</span>
                                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                              </button>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CompactMetric({ icon, label, value, color, description }: { icon: any, label: string, value: string | number, color: string, description: string }) {
  const colorMap: any = { blue: 'text-blue-400', indigo: 'text-indigo-400', emerald: 'text-emerald-400', red: 'text-red-400', rose: 'text-rose-400' };

  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white/[0.02] border border-white/10 rounded-xl hover:bg-white/[0.05] transition-all shrink-0 cursor-help group/metric relative" title={description}>
      <div className={`${colorMap[color] || 'text-blue-400'} opacity-70 group-hover/metric:opacity-100 transition-opacity`}>{icon}</div>
      <div className="flex flex-col">
        <span className="text-[7px] font-black uppercase tracking-widest leading-none mb-0.5 text-kilang-text-muted">{label}</span>
        <span className={`text-sm font-black ${colorMap[color] || 'text-white'} leading-none font-mono`}>
          {value !== undefined && value !== null ? value.toLocaleString() : '---'}
        </span>
      </div>

      {/* Detailed Tooltip Overlay */}
      <div className="absolute top-full right-0 mt-2 w-48 bg-[#0f172a] border border-white/10 p-3 rounded-xl shadow-2xl opacity-0 invisible group-hover/metric:opacity-100 group-hover/metric:visible transition-all z-[1100] pointer-events-none">
        <p className="text-[10px] text-gray-400 leading-relaxed font-medium">{description}</p>
      </div>
    </div>
  );
}

function Metric({ label, value, color }: { label: string, value: string | number, color: string }) {
  const colorMap: any = { blue: 'text-blue-400', red: 'text-red-400' };
  return (
    <div className="flex flex-col items-end">
      <span className="text-[10px] font-black text-kilang-text-muted uppercase tracking-[0.2em]">{label}</span>
      <span className={`text-3xl font-black ${colorMap[color]} font-mono tracking-tighter`}>{value}</span>
    </div>
  );
}
