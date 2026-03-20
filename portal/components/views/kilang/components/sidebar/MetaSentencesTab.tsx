'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { CollapsibleSection, SentenceItem } from './SidebarShared';
import { getLinearPath, normalizeWord } from '../../kilangUtils';

interface MetaSentencesTabProps {
  canvasSelectedNode: string | null;
  selectedRoot: string | null;
  rootData: any;
  collapsedSections: Record<string, boolean>;
  toggleSection: (id: string) => void;
  renderSentences: (jsonStr: string | null | undefined, focusWord: string) => React.ReactNode;
}

export const MetaSentencesTab = ({
  canvasSelectedNode,
  selectedRoot,
  rootData,
  collapsedSections,
  toggleSection,
  renderSentences
}: MetaSentencesTabProps) => {
  const activeNode = canvasSelectedNode || selectedRoot;
  
  if (!activeNode) return (
    <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center">
      <MessageSquare className="w-12 h-12 mb-4 text-[var(--kilang-text-muted)]" />
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--kilang-text-muted)]">Select a node to view its structural properties</span>
    </div>
  );

  const nodeData = rootData?.derivatives?.find((d: any) => d.word_ab.toLowerCase() === activeNode.toLowerCase()) ||
    (selectedRoot?.toLowerCase() === activeNode.toLowerCase() ? { word_ab: activeNode, isRoot: true, ...rootData } : null);

  const path = getLinearPath(activeNode, rootData?.derivatives || [], selectedRoot);
  const parentKeys = path.slice(0, -1);
  const parentNodes = parentKeys.map(pk => {
    return rootData?.derivatives?.find((d: any) => d.word_ab.toLowerCase() === pk.toLowerCase()) ||
      (selectedRoot?.toLowerCase() === pk.toLowerCase() ? { word_ab: selectedRoot, isRoot: true, ...rootData } : null);
  }).filter(Boolean);

  const childrenNodes = rootData?.derivatives?.filter((d: any) => d.parentWord?.toLowerCase() === activeNode.toLowerCase()) || [];

  return (
    <div className="space-y-6">
      {/* PRIMARY SELECTION */}
      <section className="space-y-4 mb-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-[var(--kilang-primary-text)] tracking-tighter uppercase mb-6 drop-shadow-[0_0_10px_var(--kilang-primary-glow)]">{activeNode}</h2>
          <div className="border-l-4 border-[var(--kilang-primary-border)]/30 pl-8 space-y-6 py-4">
            {nodeData?.definitions && nodeData.definitions.length > 0 ? (
              nodeData.definitions.map((def: string, i: number) => (
                <div key={i} className="text-md text-[var(--kilang-primary-text)] font-medium leading-relaxed">
                  {nodeData.definitions!.length > 1 && <span className="text-[var(--kilang-primary-text)]/50 mr-2">{i + 1}.</span>}
                  {def}
                </div>
              ))
            ) : (
              <div className="text-lg text-[var(--kilang-primary-text)] font-medium leading-relaxed italic opacity-50">
                {nodeData?.definition || "No definition available"}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 pt-4">
          {renderSentences(nodeData?.examples_json, activeNode)}
        </div>
      </section>

      {/* GENEALOGICAL CONTEXT */}
      <div className="pt-6 border-t border-[var(--kilang-border-std)] space-y-4">
        {/* PARENTS CONTEXT */}
        {parentNodes.length > 0 && (
          <CollapsibleSection
            title={`Parents (${parentNodes.length})`}
            id="parents-sent"
            isCollapsed={collapsedSections['parents-sent'] ?? true}
            onToggle={() => toggleSection('parents-sent')}
          >
            <div className="space-y-6">
              {parentNodes.map((pNode: any) => (
                <div key={pNode.word_ab} className="space-y-2">
                  <div className="text-[12px] font-bold text-[var(--kilang-text)]/90 uppercase tracking-widest border-b border-[var(--kilang-border-std)] pb-1">{pNode.word_ab}</div>
                  <div className="space-y-1 pl-2 mb-2">
                    {pNode.definitions && pNode.definitions.length > 0 ? (
                      pNode.definitions.map((def: string, i: number) => (
                        <div key={i} className="text-[12px] text-[var(--kilang-secondary-text)] leading-tight">
                          {pNode.definitions.length > 1 && <span className="opacity-40 mr-1">{i + 1}.</span>}
                          {def}
                        </div>
                      ))
                    ) : (
                      <div className="text-[10px] text-[var(--kilang-secondary-text)] opacity-40 italic">{pNode.definition}</div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {renderSentences(pNode.examples_json, pNode.word_ab)}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* CHILDREN CONTEXT */}
        {childrenNodes.length > 0 && (
          <CollapsibleSection
            title={`Children (${childrenNodes.length})`}
            id="children-sent"
            isCollapsed={collapsedSections['children-sent'] ?? true}
            onToggle={() => toggleSection('children-sent')}
          >
            <div className="space-y-6">
              {childrenNodes.map((child: any) => (
                <div key={child.word_ab} className="space-y-2">
                  <div className="text-[12px] font-bold text-[var(--kilang-text)]/90 uppercase tracking-widest border-b border-[var(--kilang-border-std)] pb-1">{child.word_ab}</div>
                  <div className="space-y-1 pl-2 mb-2">
                    {child.definitions && child.definitions.length > 0 ? (
                      child.definitions.map((def: string, i: number) => (
                        <div key={i} className="text-[12px] text-[var(--kilang-secondary-text)] leading-tight">
                          {child.definitions.length > 1 && <span className="opacity-40 mr-1">{i + 1}.</span>}
                          {def}
                        </div>
                      ))
                    ) : (
                      <div className="text-[12px] text-[var(--kilang-secondary-text)] opacity-40 italic">{child.definition}</div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {renderSentences(child.examples_json, child.word_ab)}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {parentNodes.length === 0 && childrenNodes.length === 0 && (
          <div className="text-[12px] italic text-[var(--kilang-text-muted)] text-center py-4">No morphological neighbors to compare</div>
        )}
      </div>
    </div>
  );
};
