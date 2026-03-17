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
      width="2000"
      height="2000"
      viewBox="0 0 2000 2000"
      className="absolute inset-0 pointer-events-none z-0 overflow-visible"
    >
      <defs>
        <linearGradient
          id="lineageGradient"
          gradientUnits="userSpaceOnUse"
          x1="0" y1="0" x2="2000" y2="2000"
        >
          <stop offset="0%" stopColor={layoutConfig.lineColor} stopOpacity="0.4" />
          <stop offset="50%" stopColor={layoutConfig.lineColorMid} stopOpacity="0.4" />
          <stop offset="100%" stopColor={layoutConfig.lineGradientEnd} stopOpacity="0.4" />
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
        if (direction === 'vertical') {
          const midY = (sourceY + targetY) / 2;
          pathData = `M ${sourceX} ${sourceY} C ${sourceX} ${midY} ${targetX} ${midY} ${targetX} ${targetY}`;
        } else {
          const midX = (sourceX + targetX) / 2;
          pathData = `M ${sourceX} ${sourceY} C ${midX} ${sourceY} ${midX} ${targetY} ${targetX} ${targetY}`;
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
              className={`transition-[opacity,stroke-width,filter] duration-300 ${isHighlighted ? 'opacity-100' : 'opacity-20 group-hover:opacity-60'}`}
              style={{
                filter: isHighlighted ? `drop-shadow(0 0 8px ${layoutConfig.lineColor}80)` : 'none'
              }}
            />
          </g>
        );
      })}
    </svg>
  );
});
