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
  canvasTransform: { x: number; y: number; k: number };
}

export const ForestView = React.memo(React.forwardRef<HTMLDivElement, ForestViewProps>(({
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
  canvasTransform,
}, ref) => {
  const { state: sidebarState } = useSidebar();
  const bloomedNodes = React.useRef(new Set<string>());

  return (
    <div
      ref={ref}
      id="kilang-forest-inner"
      key={selectedRoot}
      className="relative kilang-gpu-layer"
      style={{
        width: '4000px',
        height: '4000px',
        transformOrigin: '0 0',
        transform: 'translate3d(var(--cam-x, 0px), var(--cam-y, 0px), 0) scale(var(--cam-k, 1))',
        willChange: 'transform'
      } as React.CSSProperties}
    >
      {/* 1. SVG Layer (Background) */}
      {nodeMap[normalizeWord(selectedRoot || '') || ''] && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          <LineageCanvas
            root={selectedRoot || ''}
            derivatives={(rootData?.derivatives || []) as Derivation[]}
            nodeMap={nodeMap}
            direction={direction}
            isFit={isFit}
            scale={scale}
            layoutConfig={layoutConfig}
            rootPos={nodeMap[normalizeWord(selectedRoot || '') || '']}
            activeHighlightChain={activeHighlightChain}
            dispatch={dispatch}
          />
        </div>
      )}

      {/* 2. Nodes Layer (Foreground) */}
      <div className="absolute inset-0" style={{ zIndex: 10 }}>
        {/* Root Node */}
        {nodeMap[normalizeWord(selectedRoot || '') || ''] && (
          <div
            key={`root-${selectedRoot}`}
            className="absolute transition-all duration-500 animate-in fade-in duration-1000"
            style={{
              left: 0,
              top: 0,
              transform: `translate(-50%, -50%) translate(${nodeMap[normalizeWord(selectedRoot || '') || ''].x}px, ${nodeMap[normalizeWord(selectedRoot || '') || ''].y}px)`,
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
              onInteraction={(type, word) => {
                if (type === 'hover') dispatch({ type: 'SET_CANVAS_HOVER', node: word });
                else if (type === 'select') dispatch({ type: 'SET_CANVAS_SELECT', node: word });
              }}
            />
          </div>
        )}

        {/* Branches Forest */}
        {(rootData?.derivatives as Derivation[])?.map((d: Derivation) => {
          const pos = nodeMap[d.word_ab];
          const rootPos = nodeMap[normalizeWord(selectedRoot || '') || ''];
          if (!pos || !rootPos) return null;
          
          const hasBloomed = bloomedNodes.current.has(d.word_ab);
          if (!hasBloomed) bloomedNodes.current.add(d.word_ab);

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
                className={hasBloomed ? "kilang-node-bloom-lock" : "kilang-node-bloom-lock animate-forest-bloom"}
                style={{
                  animationDelay: `${(d.tier - 2) * 120}ms`,
                  transformOrigin: `${rootPos.x - pos.x}px ${rootPos.y - pos.y}px`,
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
                    onInteraction={(type, word) => {
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
}), (prev: ForestViewProps, next: ForestViewProps) => {
  // --- CUSTOM MEMO COMPARISON: The Performance Shield ---
  // Only re-render if structural data or coordinate-affecting layout changes.
  // Ignore "layoutConfig" identity if specific values didn't change.
  
  const layoutChanged = 
    prev.layoutConfig.nodeSize !== next.layoutConfig.nodeSize ||
    prev.layoutConfig.nodeWidth !== next.layoutConfig.nodeWidth ||
    prev.layoutConfig.nodePaddingY !== next.layoutConfig.nodePaddingY ||
    prev.layoutConfig.interTierGap !== next.layoutConfig.interTierGap ||
    prev.layoutConfig.interRowGap !== next.layoutConfig.interRowGap ||
    prev.layoutConfig.lineGapX !== next.layoutConfig.lineGapX ||
    prev.layoutConfig.lineGapY !== next.layoutConfig.lineGapY ||
    prev.layoutConfig.lineTension !== next.layoutConfig.lineTension;

  return (
    !layoutChanged &&
    prev.selectedRoot === next.selectedRoot &&
    prev.rootData === next.rootData &&
    prev.nodeMap === next.nodeMap &&
    prev.direction === next.direction &&
    prev.arrangement === next.arrangement &&
    prev.isFit === next.isFit &&
    prev.scale === next.scale &&
    prev.fitTransform === next.fitTransform &&
    prev.activeHighlightChain === next.activeHighlightChain &&
    prev.summaryCache === next.summaryCache &&
    prev.showTreeTooltips === next.showTreeTooltips
  );
});

ForestView.displayName = 'ForestView';
