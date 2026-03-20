'use client';

import React from 'react';
import { Code, Type, HelpCircle, Scissors, Copy, Check } from 'lucide-react';
import { CollapsibleSection } from './SidebarShared';
import { getActiveHighlightChain, getLinearPath, generateTreeString, normalizeWord } from '../../kilangUtils';

interface MetaTreeTabProps {
  canvasSelectedNode: string | null;
  selectedRoot: string | null;
  rootData: any;
  collapsedSections: Record<string, boolean>;
  toggleSection: (id: string) => void;
  copiedId: string | null;
  handleCopy: (id: string, text: string) => void;
  trimDescendants: boolean;
  setTrimDescendants: (trim: boolean) => void;
}

export const MetaTreeTab = ({
  canvasSelectedNode,
  selectedRoot,
  rootData,
  collapsedSections,
  toggleSection,
  copiedId,
  handleCopy,
  trimDescendants,
  setTrimDescendants
}: MetaTreeTabProps) => {
  return (
    <div className="space-y-4">
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
            (selectedRoot?.toLowerCase() === activeNode.toLowerCase() ? rootData : null);
          if (!nodeData) return null;
          return (
            <button
              onClick={(e) => { e.stopPropagation(); handleCopy('json', JSON.stringify(nodeData, null, 2)); }}
              className="p-1.5 rounded-md hover:bg-[var(--kilang-ctrl-active)]/5 text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)] transition-all"
              title="Copy JSON"
            >
              {copiedId === 'json' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          );
        })()}
      >
        {(() => {
          const activeNode = canvasSelectedNode || selectedRoot;
          if (!activeNode) return <span className="text-[var(--kilang-text-muted)] italic">No data available</span>;
          const nodeData = rootData?.derivatives?.find((d: any) => d.word_ab.toLowerCase() === activeNode.toLowerCase()) ||
            (selectedRoot?.toLowerCase() === activeNode.toLowerCase() ? rootData : null);

          if (!nodeData) return <span className="text-[var(--kilang-text-muted)] italic">// {activeNode} details not found</span>;

          return (
            <div className="space-y-0.5 leading-relaxed">
              {JSON.stringify(nodeData, null, 2).split('\n').map((line, i) => {
                const keyMatch = line.match(/^(\s*)"([^"]+)":/);
                if (keyMatch) {
                  const indent = keyMatch[1];
                  const key = keyMatch[2];
                  const rest = line.substring(keyMatch[0].length);
                  return (
                    <div key={i}>
                      {indent}<span className="text-[var(--kilang-primary-text)]">"{key}"</span>:
                      <span className="text-[var(--kilang-secondary-text)]">{rest}</span>
                    </div>
                  );
                }
                return <div key={i} className="text-[var(--kilang-text-muted)] opacity-60">{line}</div>;
              })}
            </div>
          );
        })()}
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
                className={`p-1.5 rounded-md transition-all ${trimDescendants ? 'bg-[var(--kilang-accent)]/20 text-[var(--kilang-accent-text)]' : 'text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)]'}`}
                title={trimDescendants ? "Show All Descendants" : "Trim All Descendants"}
              >
                <Scissors className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleCopy('text', treeStr); }}
                className="p-1.5 rounded-md hover:bg-[var(--kilang-ctrl-active)]/5 text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)] transition-all"
                title="Copy ASCII Tree"
              >
                {copiedId === 'text' ? <Check className="w-3 h-3 text-[var(--kilang-primary-text)]" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          );
        })()}
      >
        <div className="text-[var(--kilang-accent-text)] whitespace-pre">
          {(() => {
            const activeNode = canvasSelectedNode || selectedRoot;
            if (!activeNode || !rootData?.derivatives) return <span className="text-[var(--kilang-text-muted)] italic">Select a node to view its growth</span>;

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

      {/* Analysis Section */}
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
              className="p-1.5 rounded-md hover:bg-[var(--kilang-ctrl-active)]/5 text-[var(--kilang-text-muted)] hover:text-[var(--kilang-text)] transition-all"
              title="Copy Analysis Summary"
            >
              {copiedId === 'query' ? <Check className="w-3 h-3 text-[var(--kilang-primary-text)]" /> : <Copy className="w-3 h-3" />}
            </button>
          );
        })()}
      >
        {(() => {
          const activeNode = canvasSelectedNode || selectedRoot;
          if (!activeNode) return <span className="text-[var(--kilang-text-muted)]">Select a node to analyze</span>;
          const children = rootData?.derivatives?.filter((d: any) => d.parentWord?.toLowerCase() === activeNode.toLowerCase()) || [];
          const allDescendants = rootData?.derivatives?.filter((d: any) => d.sortPath?.toLowerCase().includes(`>${activeNode.toLowerCase()}>`) || d.sortPath?.toLowerCase().endsWith(`>${activeNode.toLowerCase()}`)) || [];

          return (
            <div className="text-[var(--kilang-text-muted)] space-y-2">
              <div>WORD: <span className="text-[var(--kilang-primary-text)]">{activeNode}</span></div>
              <div>CHILDREN: <span className="text-[var(--kilang-text)]">{children.length}</span></div>
              <div>SUBTREE SIZE: <span className="text-[var(--kilang-text)]">{allDescendants.length}</span></div>
              <div>TYPE: <span className="text-[var(--kilang-text)]">{activeNode === selectedRoot ? 'ROOT STEM' : 'DERIVATIVE'}</span></div>
            </div>
          );
        })()}
      </CollapsibleSection>
    </div>
  );
};
