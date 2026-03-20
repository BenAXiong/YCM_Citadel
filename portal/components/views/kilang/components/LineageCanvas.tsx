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
          gradientUnits="userSpaceOnUse"
          x1="0" y1="0" x2="4000" y2="4000"
        >
          <stop offset="0%" stopColor="var(--kilang-link-start)" stopOpacity="var(--kilang-link-opacity)" />
          <stop offset="50%" stopColor="var(--kilang-link-mid)" stopOpacity="var(--kilang-link-opacity)" />
          <stop offset="100%" stopColor="var(--kilang-link-end)" stopOpacity="var(--kilang-link-opacity)" />
        </linearGradient>
      </defs>
      {derivatives.map((d: Derivation, i: number) => {
        const parentKey = d.parentWord || normalizeWord(root) || '';
        const s = nodeMap[parentKey];
        const t = nodeMap[d.word_ab];
        if (!s || !t) return null;

        const isRootSource = parentKey === normalizeWord(root);
        const isHighlighted = activeHighlightChain.has(d.word_ab) && activeHighlightChain.has(parentKey);

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

        return (
          <g
            key={i}
            className="animate-forest-bloom pointer-events-auto cursor-pointer group"
            style={{
              animationDelay: `${(d.tier - 2) * 120}ms`,
              transformOrigin: `${rootPos.x}px ${rootPos.y}px`,
            }}
            onMouseEnter={() => dispatch({ type: 'SET_CANVAS_HOVER', node: d.word_ab })}
            onMouseLeave={() => dispatch({ type: 'SET_CANVAS_HOVER', node: null })}
            onClick={(e) => {
              e.stopPropagation();
              dispatch({ type: 'SET_CANVAS_SELECT', node: d.word_ab });
            }}
          >
            {/* Outer Fat Path for Hover ease */}
            <path
              d={pathData}
              stroke="transparent"
              strokeWidth={20}
              fill="none"
            />
            <path
              d={pathData}
              stroke={isHighlighted ? layoutConfig.lineColor : "url(#lineageGradient)"}
              strokeWidth={isHighlighted ? (layoutConfig.lineWidth || 1.5) * 2 : layoutConfig.lineWidth || 1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              strokeDasharray={layoutConfig.lineDashArray > 0 ? `${layoutConfig.lineDashArray} ${layoutConfig.lineDashArray}` : 'none'}
              className={`transition-[opacity,stroke-width,filter] duration-300 ${isHighlighted ? 'opacity-100' : 'group-hover:opacity-60'} ${layoutConfig.lineFlowSpeed > 0 ? 'animate-link-flow' : ''}`}
              style={{
                filter: isHighlighted 
                  ? `drop-shadow(0 0 8px ${layoutConfig.lineColor}80)` 
                  : (layoutConfig.lineBlur > 0 ? `blur(${layoutConfig.lineBlur}px)` : 'none'),
                opacity: isHighlighted ? 1 : 'var(--kilang-link-opacity)'
              }}
            />
          </g>
        );
      })}
    </svg>
  );
});
