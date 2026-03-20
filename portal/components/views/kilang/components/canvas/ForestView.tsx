import React from 'react';
import { KilangNode } from '../../KilangNode';
import { LineageCanvas } from '../LineageCanvas';
import { normalizeWord } from '../../kilangUtils';
import { Derivation, NodeMap } from '../../KilangTypes';
import { KilangAction } from '../../kilangReducer';
import { useSidebar } from '../../SidebarContext';

interface ForestViewProps {
  selectedRoot: string;
  rootData: any;
  nodeMap: NodeMap;
  direction: 'horizontal' | 'vertical';
  arrangement: 'flow' | 'aligned';
  isFit: boolean;
  scale: number;
  fitTransform: { x: number; y: number; scale: number };
  layoutConfig: any;
  activeHighlightChain: Set<string>;
  summaryCache: Record<string, any>;
  fetchSummary: (word: string) => Promise<void>;
  showTreeTooltips: boolean;
  dispatch: React.Dispatch<KilangAction>;
}

export const ForestView: React.FC<ForestViewProps> = ({
  selectedRoot,
  rootData,
  nodeMap,
  direction,
  arrangement,
  isFit,
  scale,
  fitTransform,
  layoutConfig,
  activeHighlightChain,
  summaryCache,
  fetchSummary,
  showTreeTooltips,
  dispatch,
}) => {
  const { state: sidebarState } = useSidebar();
  const rootPos = React.useMemo(() => nodeMap[normalizeWord(selectedRoot || '') || ''], [nodeMap, selectedRoot]);

  return (
    <div
      id="kilang-forest-inner"
      key={selectedRoot}
      className="relative"
      style={{
        width: '4000px',
        height: '4000px',
        transform: isFit
          ? `translate(${fitTransform.x}px, ${fitTransform.y}px) scale(${fitTransform.scale})`
          : `scale(${scale})`,
        transformOrigin: '0 0'
      }}
    >
      {/* 1. SVG Layer (Background) */}
      {rootPos && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          <LineageCanvas
            root={selectedRoot || ''}
            derivatives={(rootData?.derivatives || []) as Derivation[]}
            nodeMap={nodeMap}
            direction={direction}
            isFit={isFit}
            scale={scale}
            layoutConfig={layoutConfig}
            rootPos={rootPos}
            activeHighlightChain={activeHighlightChain}
            dispatch={dispatch}
          />
        </div>
      )}

      {/* 2. Nodes Layer (Foreground) */}
      <div className="absolute inset-0" style={{ zIndex: 10 }}>
        {/* Root Node */}
        {rootPos && (
          <div
            key={`root-${selectedRoot}`}
            className="absolute transition-all duration-500 animate-in fade-in duration-1000"
            style={{
              left: 0,
              top: 0,
              transform: `translate(-50%, -50%) translate(${rootPos.x}px, ${rootPos.y}px)`,
              zIndex: 20
            }}
          >
            <KilangNode
              word={selectedRoot || ''}
              isRoot={true}
              summaryCache={summaryCache}
              fetchSummary={fetchSummary}
              config={layoutConfig}
              isHighlighted={activeHighlightChain.has(normalizeWord(selectedRoot || '') || '')}
              isHovered={sidebarState.canvasHoverNode === normalizeWord(selectedRoot || '')}
              showTooltip={showTreeTooltips}
              onInteraction={(type: 'hover' | 'select', word: string | null) => {
                if (type === 'hover') dispatch({ type: 'SET_CANVAS_HOVER', node: word });
                else if (type === 'select') dispatch({ type: 'SET_CANVAS_SELECT', node: word });
              }}
            />
          </div>
        )}

        {/* Branches Forest */}
        {(rootData?.derivatives as Derivation[])?.map((d: Derivation) => {
          const pos = nodeMap[d.word_ab];
          if (!pos || !rootPos) return null;
          return (
            <div
              key={d.word_ab}
              className="absolute transition-all duration-500"
              style={{
                left: 0,
                top: 0,
                transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px)`,
                zIndex: 10
              }}
            >
              <div
                className="animate-forest-bloom"
                style={{
                  animationDelay: `${(d.tier - 2) * 120}ms`,
                  transformOrigin: `${rootPos.x - pos.x}px ${rootPos.y - pos.y}px`
                }}
              >
                <div className="tree-node">
                  <KilangNode
                    word={d.raw_word || d.word_ab}
                    dictCode={d.dict_code?.toUpperCase()}
                    tier={d.tier}
                    summaryCache={summaryCache}
                    fetchSummary={fetchSummary}
                    config={layoutConfig}
                    isHighlighted={activeHighlightChain.has(d.word_ab)}
                    isHovered={sidebarState.canvasHoverNode === d.word_ab}
                    showTooltip={showTreeTooltips}
                    onInteraction={(type: 'hover' | 'select', word: string | null) => {
                      if (type === 'hover') dispatch({ type: 'SET_CANVAS_HOVER', node: word });
                      else if (type === 'select') dispatch({ type: 'SET_CANVAS_SELECT', node: word });
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
