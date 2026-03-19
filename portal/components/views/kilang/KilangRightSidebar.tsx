'use client';

import React from 'react';
import {
  FileText,
  MessageSquare,
  Database,
  ChevronLeft,
  ChevronRight,
  Code,
  Type,
  HelpCircle,
  Layout,
  Copy,
  Check,
  Scissors,
  BookOpen
} from 'lucide-react';
import { getActiveHighlightChain, normalizeWord, getLinearPath, generateTreeString } from './kilangUtils';
import { KilangState, KilangAction } from './kilangReducer';

interface KilangRightSidebarProps {
  state: KilangState;
  dispatch: React.Dispatch<KilangAction>;
  isCollapsed: boolean;
  onToggle: () => void;
  nodeMap?: any;
}


export const KilangRightSidebar = ({ state, dispatch, isCollapsed, onToggle, nodeMap }: KilangRightSidebarProps) => {
  const { rightSidebarTab, rightSidebarWidth, canvasSelectedNode, rootData, selectedRoot } = state;
  const [collapsedSections, setCollapsedSections] = React.useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setCollapsedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleResize = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.pageX;
    const startWidth = rightSidebarWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = startX - moveEvent.pageX;
      const newWidth = Math.max(260, Math.min(600, startWidth + delta));
      dispatch({ type: 'SET_UI', rightSidebarWidth: newWidth });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
  }, [rightSidebarWidth, dispatch]);
  
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const [trimDescendants, setTrimDescendants] = React.useState(false);

  return (
    <aside
      className={`relative h-full flex flex-col bg-[#0f172a]/80 backdrop-blur-xl transition-all duration-300 ease-in-out z-40 ${isCollapsed ? 'w-0 border-l-0 overflow-visible' : 'border-l border-white/5 overflow-hidden'}`}
      style={{ width: isCollapsed ? '0px' : `${rightSidebarWidth}px` }}
    >
      {/* Resize Handle */}
      {!isCollapsed && (
        <div
          onMouseDown={handleResize}
          className="absolute left-0 top-0 w-1 h-full cursor-col-resize hover:bg-blue-500/50 transition-colors z-50"
        />
      )}

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -left-3 top-20 w-6 h-6 bg-[#1e293b] border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all z-50 shadow-lg"
      >
        {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Tabs */}
      <div className={`flex flex-col h-full ${isCollapsed ? 'items-center py-4' : ''}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-1 p-2 border-b border-white/5 bg-black/20">
            {[
              { id: 'txt', icon: FileText, label: 'Tree' },
              { id: 'sent', icon: MessageSquare, label: 'Sentences' },
              { id: 'met', icon: Database, label: 'Affixes' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => dispatch({ type: 'SET_UI', rightSidebarTab: tab.id as any })}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${rightSidebarTab === tab.id ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-white/30 hover:text-white/60 hover:bg-white/5 border border-transparent'}`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-wider">{tab.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Tab Content */}
        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            {rightSidebarTab === 'txt' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 bg-blue-500 rounded-full" />
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-white/80">Structure Views</h3>
                </div>

                {/* JSON Section */}
                <CollapsibleSection
                  title="JSON Structure"
                  id="json"
                  icon={Code}
                  isCollapsed={collapsedSections['json']}
                  onToggle={() => toggleSection('json')}
                  action={(() => {
                    const activeNode = canvasSelectedNode || selectedRoot;
                    if (!activeNode) return null;
                    const nodeData = rootData?.derivatives?.find((d: any) => d.word_ab.toLowerCase() === activeNode.toLowerCase()) || 
                                   (selectedRoot?.toLowerCase() === activeNode.toLowerCase() ? { word: activeNode, isRoot: true } : null);
                    if (!nodeData) return null;
                    return (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleCopy('json', JSON.stringify(nodeData, null, 2)); }}
                        className="p-1.5 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-all"
                        title="Copy JSON"
                      >
                        {copiedId === 'json' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    );
                  })()}
                >
                  <div className="p-3 bg-black/40 rounded-lg border border-white/5 font-mono text-[10px] overflow-x-auto custom-scrollbar max-h-[400px]">
                    {(() => {
                      const activeNode = canvasSelectedNode || selectedRoot;
                      if (!activeNode) return <span className="text-white/20 italic">No data available</span>;
                      const nodeData = rootData?.derivatives?.find((d: any) => d.word_ab.toLowerCase() === activeNode.toLowerCase()) || 
                                     (selectedRoot?.toLowerCase() === activeNode.toLowerCase() ? { word: activeNode, isRoot: true } : null);
                      
                      if (!nodeData) return <span className="text-white/20 italic">// {activeNode} details not found</span>;
                      
                      // Simple syntax highlighting component (internal inline)
                      return (
                         <div className="space-y-0.5 leading-relaxed">
                            {JSON.stringify(nodeData, null, 2).split('\n').map((line, i) => {
                              const keyMatch = line.match(/^(\s*)"([^"]+)":/);
                              const valueMatch = line.match(/:(.*)$/);
                              
                              if (keyMatch) {
                                const indent = keyMatch[1];
                                const key = keyMatch[2];
                                const rest = line.substring(keyMatch[0].length);
                                return (
                                  <div key={i}>
                                    {indent}<span className="text-blue-400">"{key}"</span>:
                                    <span className="text-orange-300">{rest}</span>
                                  </div>
                                );
                              }
                              return <div key={i} className="text-white/40">{line}</div>;
                            })}
                         </div>
                      );
                    })()}
                  </div>
                </CollapsibleSection>

                {/* TEXT Section */}
                <CollapsibleSection
                  title="ASCII Tree"
                  id="text"
                  icon={Type}
                  isCollapsed={collapsedSections['text']}
                  onToggle={() => toggleSection('text')}
                  action={(() => {
                    const activeNode = canvasSelectedNode || selectedRoot;
                    if (!activeNode || !rootData?.derivatives) return null;
                    
                    const filterSet = canvasSelectedNode 
                      ? (trimDescendants 
                          ? new Set(getLinearPath(canvasSelectedNode, rootData.derivatives, selectedRoot).map(w => normalizeWord(w) || ''))
                          : getActiveHighlightChain(canvasSelectedNode, rootData.derivatives, selectedRoot))
                      : undefined;

                    const treeRoot = selectedRoot || activeNode;
                    const treeStr = generateTreeString(rootData.derivatives, treeRoot, '', true, 0, filterSet, canvasSelectedNode);
                    
                    return (
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setTrimDescendants(!trimDescendants); }}
                          className={`p-1.5 rounded-md transition-all ${trimDescendants ? 'bg-orange-500/20 text-orange-400' : 'text-white/20 hover:text-white/40'}`}
                          title={trimDescendants ? "Show All Descendants" : "Trim All Descendants"}
                        >
                          <Scissors className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleCopy('text', treeStr); }}
                          className="p-1.5 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-all"
                          title="Copy ASCII Tree"
                        >
                          {copiedId === 'text' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    );
                  })()}
                >
                  <div className="p-3 bg-black/40 rounded-lg border border-white/5 font-mono text-[10px] text-emerald-400/90 whitespace-pre overflow-x-auto leading-relaxed custom-scrollbar">
                    {(() => {
                      const activeNode = canvasSelectedNode || selectedRoot;
                      if (!activeNode || !rootData?.derivatives) return <span className="text-white/20 italic">Select a node to view its growth</span>;
                      
                      const filterSet = canvasSelectedNode 
                        ? (trimDescendants 
                            ? new Set(getLinearPath(canvasSelectedNode, rootData.derivatives, selectedRoot).map(w => normalizeWord(w) || ''))
                            : getActiveHighlightChain(canvasSelectedNode, rootData.derivatives, selectedRoot))
                        : undefined;
                      
                      const treeRoot = selectedRoot || activeNode;
                      return generateTreeString(rootData.derivatives, treeRoot, '', true, 0, filterSet, canvasSelectedNode);
                    })()}
                  </div>
                </CollapsibleSection>

                {/* ? Section */}
                <CollapsibleSection
                  title="Analysis"
                  id="query"
                  icon={HelpCircle}
                  isCollapsed={collapsedSections['query']}
                  onToggle={() => toggleSection('query')}
                  action={(() => {
                    const activeNode = canvasSelectedNode || selectedRoot;
                    if (!activeNode) return null;
                    const childrenCount = rootData?.derivatives?.filter((d: any) => d.parentWord?.toLowerCase() === activeNode.toLowerCase()).length || 0;
                    const descendantsCount = rootData?.derivatives?.filter((d: any) => d.sortPath?.toLowerCase().includes(`>${activeNode.toLowerCase()}>`) || d.sortPath?.toLowerCase().endsWith(`>${activeNode.toLowerCase()}`)).length || 0;
                    const analysisStr = `WORD: ${activeNode}\nCHILDREN: ${childrenCount}\nSUBTREE SIZE: ${descendantsCount}\nTYPE: ${activeNode === selectedRoot ? 'ROOT STEM' : 'DERIVATIVE'}`;
                    
                    return (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleCopy('query', analysisStr); }}
                        className="p-1.5 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-all"
                        title="Copy Analysis Summary"
                      >
                        {copiedId === 'query' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    );
                  })()}
                >
                  <div className="p-3 bg-black/40 rounded-lg border border-white/5 font-mono text-[10px] text-purple-400/90 space-y-2">
                    {(() => {
                      const activeNode = canvasSelectedNode || selectedRoot;
                      if (!activeNode) return "Select a node to analyze";
                      const children = rootData?.derivatives?.filter((d: any) => d.parentWord?.toLowerCase() === activeNode.toLowerCase()) || [];
                      const allDescendants = rootData?.derivatives?.filter((d: any) => d.sortPath?.toLowerCase().includes(`>${activeNode.toLowerCase()}>`) || d.sortPath?.toLowerCase().endsWith(`>${activeNode.toLowerCase()}`)) || [];
                      
                      return (
                        <>
                          <div>WORD: <span className="text-white">{activeNode}</span></div>
                          <div>CHILDREN: <span className="text-white">{children.length}</span></div>
                          <div>SUBTREE SIZE: <span className="text-white">{allDescendants.length}</span></div>
                          <div>TYPE: <span className="text-white">{activeNode === selectedRoot ? 'ROOT STEM' : 'DERIVATIVE'}</span></div>
                        </>
                      );
                    })()}
                  </div>
                </CollapsibleSection>

                {/* DICT Section */}
                <CollapsibleSection
                  title="Dictionary View"
                  id="dict"
                  icon={BookOpen}
                  isCollapsed={collapsedSections['dict']}
                  onToggle={() => toggleSection('dict')}
                >
                  <div className="p-3 bg-black/40 rounded-lg border border-white/5 font-mono text-[10px] space-y-3">
                    {(() => {
                      const activeNode = canvasSelectedNode || selectedRoot;
                      if (!activeNode) return "Select a node to view attributes";
                      const nodeData = rootData?.derivatives?.find((d: any) => d.word_ab.toLowerCase() === activeNode.toLowerCase()) || 
                                     (selectedRoot?.toLowerCase() === activeNode.toLowerCase() ? { word: activeNode, isRoot: true } : null);
                      
                      if (!nodeData) return <div className="text-white/20 italic">No entry data found</div>;
                      
                      return (
                        <>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 opacity-40 uppercase tracking-tighter text-[9px]">
                              <div className="w-1 h-1 bg-white/40 rounded-full" />
                              Definition
                            </div>
                            <div className="text-white/80 leading-relaxed pl-2.5 border-l border-white/10 italic">
                               {nodeData.definition || "No definition available"}
                            </div>
                          </div>
                           <div className="grid grid-cols-2 gap-2">
                             <div className="space-y-1">
                                <div className="opacity-40 uppercase tracking-tighter text-[9px]">Pinyin</div>
                                <div className="text-blue-400">{nodeData.pinyin || "-"}</div>
                             </div>
                             <div className="space-y-1">
                                <div className="opacity-40 uppercase tracking-tighter text-[9px]">Bopomof</div>
                                <div className="text-emerald-400">{nodeData.bopomofo || "-"}</div>
                             </div>
                           </div>
                           <div className="pt-2 border-t border-white/5">
                             <div className="opacity-40 uppercase tracking-tighter text-[9px]">Source Code</div>
                             <div className="text-white/40">{nodeData.dict_code || "Unknown"}</div>
                           </div>
                        </>
                      );
                    })()}
                  </div>
                </CollapsibleSection>
              </div>
            )}

            {rightSidebarTab === 'sent' && (
              <div className="flex flex-col items-center justify-center h-full opacity-20 py-20">
                <MessageSquare className="w-12 h-12 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Sentences Coming Soon</p>
              </div>
            )}

            {rightSidebarTab === 'met' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 bg-purple-500 rounded-full" />
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-white/80">Affixes / Decomposition</h3>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center py-20">
                  <Layout className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">Affix Mapping Coming Soon</p>
                </div>
              </div>
            )}
          </div>
        )}

        {isCollapsed && (
          <div className="hidden" />
        )}
      </div>
    </aside>
  );
};

interface CollapsibleSectionProps {
  title: string;
  id: string;
  icon: any;
  isCollapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  action?: React.ReactNode;
}

const CollapsibleSection = ({ title, icon: Icon, isCollapsed, onToggle, children, action }: CollapsibleSectionProps) => (
  <div className="border border-white/5 rounded-xl overflow-hidden bg-white/[0.02]">
    <div className="flex items-center bg-white/[0.03] pr-2 hover:bg-white/[0.05] transition-colors group/header">
      <button
        onClick={onToggle}
        className="flex-1 flex items-center gap-2 p-3 text-left"
      >
        <Icon className="w-3.5 h-3.5 text-white/30" />
        <span className="text-[10px] font-black uppercase tracking-wider text-white/60">{title}</span>
      </button>
      
      <div className="flex items-center gap-1">
        {action}
        <button 
          onClick={onToggle}
          className="p-1 text-white/20 hover:text-white transition-colors ml-1"
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>
    </div>
    {!isCollapsed && <div className="p-1">{children}</div>}
  </div>
);

const ChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);
