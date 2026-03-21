import React from 'react';
import { normalizeWord } from '../kilangUtils';
import { NodeMap, Derivation } from '../KilangTypes';
import { KilangAction, KilangState } from '../kilangReducer';

interface LineageCanvasProps {
  root: string;
  derivatives: Derivation[];
  nodeMap: NodeMap;
  direction: 'horizontal' | 'vertical';
  isFit: boolean;
  scale: number;
  layoutConfig: KilangState['layoutConfig'];
  activeHighlightChain: Set<string>;
  dispatch: React.Dispatch<KilangAction>;
  rootPos: { x: number; y: number };
}

export const LineageCanvas = React.memo(({ 
  root, 
  derivatives, 
  nodeMap, 
  direction, 
  layoutConfig, 
  rootPos, 
  activeHighlightChain, 
  dispatch 
}: LineageCanvasProps) => {
  const nodeScale = layoutConfig.nodeSize || 1;
  const isVert = direction === 'vertical';

  const ROOT_R = (isVert ? 40 : 60) * nodeScale;
  const BRANCH_W = (layoutConfig.nodeWidth / 2) * nodeScale;
  const BRANCH_H = (layoutConfig.nodePaddingY + 8) * nodeScale;

  const memoizedPaths = React.useMemo(() => {
    return derivatives.map((d: Derivation) => {
      const parentKey = d.parentWord || normalizeWord(root) || '';
      const s = nodeMap[parentKey];
      const t = nodeMap[d.word_ab];
      if (!s || !t) return null;

      const isRootSource = parentKey === normalizeWord(root);

      let sourceX = s.x;
      let sourceY = s.y;
      let targetX = t.x;
      let targetY = t.y;

      if (direction === 'horizontal') {
        sourceX += (isRootSource ? ROOT_R : BRANCH_W) + layoutConfig.lineGapX;
        targetX -= (BRANCH_W + layoutConfig.lineGapX);
      } else {
        sourceY -= (isRootSource ? ROOT_R : BRANCH_H) + layoutConfig.lineGapY;
        targetY += (BRANCH_H + layoutConfig.lineGapY);
      }

      let pathData = '';
      const tension = layoutConfig.lineTension ?? 1;
      if (direction === 'vertical') {
        const midY = (sourceY + (targetY - sourceY) * 0.5 * tension).toFixed(1);
        pathData = `M ${sourceX.toFixed(1)} ${sourceY.toFixed(1)} C ${sourceX.toFixed(1)} ${midY} ${targetX.toFixed(1)} ${midY} ${targetX.toFixed(1)} ${targetY.toFixed(1)}`;
      } else {
        const midX = (sourceX + (targetX - sourceX) * 0.5 * tension).toFixed(1);
        pathData = `M ${sourceX.toFixed(1)} ${sourceY.toFixed(1)} C ${midX} ${sourceY.toFixed(1)} ${midX} ${targetY.toFixed(1)} ${targetX.toFixed(1)} ${targetY.toFixed(1)}`;
      }

      return {
        id: `${parentKey}-${d.word_ab}`,
        pathData,
        isRootSource,
        parentKey,
        targetWord: d.word_ab,
        tier: d.tier
      };
    }).filter(Boolean);
  }, [
    derivatives, 
    nodeMap, 
    root, 
    direction, 
    layoutConfig.lineGapX, 
    layoutConfig.lineGapY, 
    layoutConfig.lineTension, 
    layoutConfig.nodeWidth, // Added because BRANCH_W depends on it
    layoutConfig.nodePaddingY, // Added because BRANCH_H depends on it
    layoutConfig.nodeSize // Added because ROOT_R/BRANCH depends on it
  ]);

  const onHover = React.useCallback((node: string | null) => {
    dispatch({ type: 'SET_CANVAS_HOVER', node });
  }, [dispatch]);

  const onSelect = React.useCallback((node: string) => {
    dispatch({ type: 'SET_CANVAS_SELECT', node });
  }, [dispatch]);

  return (
    <svg
      width="4000"
      height="4000"
      viewBox="0 0 4000 4000"
      className="absolute inset-0 pointer-events-none z-0 overflow-visible"
    >
      <defs>
        <linearGradient
          id="lineageGradient"
          gradientUnits="objectBoundingBox"
          x1="0" y1="0" x2={direction === 'horizontal' ? "1" : "0"} y2={direction === 'vertical' ? "1" : "0"}
        >
          <stop offset="0%" stopColor="var(--kilang-link-start)" stopOpacity="var(--kilang-link-opacity)" />
          <stop offset="50%" stopColor="var(--kilang-link-mid)" stopOpacity="var(--kilang-link-opacity)" />
          <stop offset="100%" stopColor="var(--kilang-link-end)" stopOpacity="var(--kilang-link-opacity)" />
        </linearGradient>
      </defs>
      {/* 🚀 BASE LAYER: The huge static tree (Scale Agnostic) */}
      {memoizedPaths.map((p: any) => (
        <g
          key={p.id}
          className="animate-forest-bloom pointer-events-auto cursor-pointer group"
          style={{
            animationDelay: `${(p.tier - 2) * 120}ms`,
            transformOrigin: `${rootPos.x}px ${rootPos.y}px`,
          }}
          onMouseEnter={() => onHover(p.targetWord)}
          onMouseLeave={() => onHover(null)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(p.targetWord);
          }}
        >
          {/* Outer Fat Path for Hover ease */}
          <path
            d={p.pathData}
            stroke="transparent"
            strokeWidth={20}
            fill="none"
          />
          <path
            d={p.pathData}
            stroke="url(#lineageGradient)"
            strokeWidth={layoutConfig.lineWidth || 1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray={layoutConfig.lineDashArray > 0 ? `${layoutConfig.lineDashArray} ${layoutConfig.lineDashArray}` : 'none'}
            className={`transition-[opacity,stroke-width,filter] duration-300 group-hover:opacity-60 ${layoutConfig.lineFlowSpeed > 0 ? 'animate-link-flow' : ''}`}
            style={{
              filter: (layoutConfig.lineBlur > 0 ? `blur(${layoutConfig.lineBlur}px)` : 'none'),
              opacity: 'var(--kilang-link-opacity)'
            }}
          />
        </g>
      ))}

      {/* 🚀 HIGHLIGHT LAYER: Only rendering active paths (Ultra Lightweight) */}
      {memoizedPaths.filter((p: any) => activeHighlightChain.has(p.targetWord) && activeHighlightChain.has(p.parentKey)).map((p: any) => (
        <g key={`highlight-${p.id}`} className="pointer-events-none">
          <path
            d={p.pathData}
            stroke={layoutConfig.lineColor}
            strokeWidth={(layoutConfig.lineWidth || 1.5) * 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray={layoutConfig.lineDashArray > 0 ? `${layoutConfig.lineDashArray} ${layoutConfig.lineDashArray}` : 'none'}
            className="transition-[opacity,stroke-width,filter] duration-300"
            style={{
              filter: `drop-shadow(0 0 8px ${layoutConfig.lineColor}80)`,
              opacity: 1
            }}
          />
        </g>
      ))}
    </svg>
  );
});
