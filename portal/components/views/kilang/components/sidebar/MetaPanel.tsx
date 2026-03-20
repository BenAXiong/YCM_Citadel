'use client';

import React from 'react';
import { FileText, MessageSquare, Database } from 'lucide-react';
import { MetaTreeTab } from './MetaTreeTab';
import { MetaSentencesTab } from './MetaSentencesTab';
import { MetaAffixesTab } from './MetaAffixesTab';
import { SentenceItem } from './SidebarShared';

interface MetaPanelProps {
  rightSidebarTab: 'txt' | 'sent' | 'met';
  setTab: (tab: 'txt' | 'sent' | 'met') => void;
  showTreeTab: boolean;
  canvasSelectedNode: string | null;
  selectedRoot: string | null;
  rootData: any;
  summaryCache: Record<string, string[]>;
  dispatch: (action: any) => void;
}

export const MetaPanel = ({
  rightSidebarTab,
  setTab,
  showTreeTab,
  canvasSelectedNode,
  selectedRoot,
  rootData,
  summaryCache,
  dispatch
}: MetaPanelProps) => {
  const [collapsedSections, setCollapsedSections] = React.useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [trimDescendants, setTrimDescendants] = React.useState(false);

  const toggleSection = (id: string) => {
    setCollapsedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderSentences = (jsonStr: string | null | undefined, focusWord: string) => {
    if (!jsonStr) return <div className="text-[10px] text-[var(--kilang-text-muted)] italic pl-3 border-l border-[var(--kilang-border-std)]">No examples found</div>;
    try {
      const examples = JSON.parse(jsonStr);
      if (!Array.isArray(examples) || examples.length === 0)
        return <div className="text-[10px] text-[var(--kilang-text-muted)] italic pl-3 border-l border-[var(--kilang-border-std)]">No examples found</div>;

      return examples.map((ex, idx) => (
        <SentenceItem key={idx} ex={ex} focusWord={focusWord} />
      ));
    } catch (e) {
      return <div className="text-red-400/50 text-[10px] italic">Error parsing examples</div>;
    }
  };

  const tabs = [
    { id: 'txt', icon: FileText, label: 'Tree', show: showTreeTab },
    { id: 'sent', icon: MessageSquare, label: 'Sentences', show: true },
    { id: 'met', icon: Database, label: 'Affixes', show: true }
  ].filter(t => t.show);

  return (
    <div className="flex flex-col h-full">
      {/* Tab Switcher */}
      <div className="flex border border-[var(--kilang-border-std)] bg-[var(--kilang-bg-base)]/50 p-1 m-4 rounded-2xl shadow-[var(--kilang-shadow-primary)]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${rightSidebarTab === tab.id ? 'bg-[var(--kilang-ctrl-active)] text-[var(--kilang-ctrl-active-text)] shadow-[var(--kilang-shadow-primary)]' : 'text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)] hover:bg-[var(--kilang-ctrl-active)]/5'}`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {rightSidebarTab === 'txt' && (
          <MetaTreeTab
            canvasSelectedNode={canvasSelectedNode}
            selectedRoot={selectedRoot}
            rootData={rootData}
            collapsedSections={collapsedSections}
            toggleSection={toggleSection}
            copiedId={copiedId}
            handleCopy={handleCopy}
            trimDescendants={trimDescendants}
            setTrimDescendants={setTrimDescendants}
          />
        )}

        {rightSidebarTab === 'sent' && (
          <MetaSentencesTab
            canvasSelectedNode={canvasSelectedNode}
            selectedRoot={selectedRoot}
            rootData={rootData}
            collapsedSections={collapsedSections}
            toggleSection={toggleSection}
            renderSentences={renderSentences}
          />
        )}

        {rightSidebarTab === 'met' && (
          <MetaAffixesTab
            rootData={rootData}
          />
        )}
      </div>
    </div>
  );
};
