'use client';

import { Derivation, NodeMap } from '../KilangTypes';
import { normalizeWord } from './formatUtils';
import { calculateTreeRows } from './treeUtils';

// --- COORDINATE ENGINE ---

// Standard "Bounding Box" for nodes to ensure consistent line connection points
export const LAYOUT_CONSTANTS = {
  NODE_WIDTH: 160,    // Refined base width
  NODE_HEIGHT: 80,    // Refined base height
  ROOT_SIZE: 150,     // Root bubble is larger
  GUTTER_H: 80,       // Distance between tiers
  GUTTER_V: 40,       // Distance between siblings in flow
  ALIGN_CELL_W: 280,  // Grid cell width for aligned mode
  ALIGN_CELL_H: 140,  // Grid cell height for aligned mode (increased)
};

/**
 * Calculates the total bounding box of the forest to support "Smart Fit" scaling.
 */
export const getForestBoundingBox = (nodeMap: NodeMap) => {
  const coords = Object.values(nodeMap);
  if (coords.length === 0) return { minX: 2000, minY: 2000, maxX: 2000, maxY: 2000 };

  let minX = coords[0].x, minY = coords[0].y, maxX = coords[0].x, maxY = coords[0].y;
  coords.forEach(p => {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  });

  return {
    minX: minX - 120,
    minY: minY - 50,
    maxX: maxX + 120,
    maxY: maxY + 50
  };
};

/**
 * Deterministically calculates {x, y} coordinates for all nodes in the tree.
 */
export const calculateNodeMap = (
  root: string,
  derivatives: Derivation[],
  direction: 'horizontal' | 'vertical',
  arrangement: 'aligned' | 'flow',
  config?: { 
    interTierGap: number; 
    interRowGap: number; 
    nodeWidth: number; 
    anchorX: number; 
    anchorY: number;
    spacingMode?: 'even' | 'log';
    rootGap?: number;
    coupleGaps?: boolean;
    nodePaddingY?: number;
    nodeSize?: number;
  }
): NodeMap => {
  const nodeMap: NodeMap = {};
  const { ROOT_SIZE, ALIGN_CELL_W: BASE_W, ALIGN_CELL_H: BASE_H, GUTTER_H, GUTTER_V } = LAYOUT_CONSTANTS;
  
  const nodeWidth = config?.nodeWidth ?? LAYOUT_CONSTANTS.NODE_WIDTH;
  const cellW = (arrangement === 'aligned' && config?.interTierGap) ? config.interTierGap : BASE_W;
  const cellH = (arrangement === 'aligned' && config?.interRowGap) ? config.interRowGap : BASE_H;

  const CENTER_X = config?.anchorX ?? (direction === 'horizontal' ? 400 : 2000); 
  const CENTER_Y = config?.anchorY ?? (direction === 'vertical' ? 1300 : 2000);

  const getTierOffset = (tier: number) => {
    if (tier <= 1) return 0;
    const basePadding = ROOT_SIZE / 2;
    const rootGap = config?.coupleGaps ? (config?.interTierGap ?? cellW) : (config?.rootGap ?? 100);
    const interGap = config?.interTierGap ?? cellW;
    const halfSize = direction === 'horizontal' 
      ? (nodeWidth / 2) 
      : (config?.nodePaddingY ?? 8) + 8;
    
    let totalOffset = basePadding + rootGap + halfSize;
    for (let i = 3; i <= tier; i++) {
      let currentGap = interGap;
      if (config?.spacingMode === 'log') {
        currentGap = interGap * Math.pow(0.8, i - 3);
      }
      totalOffset += (halfSize * 2) + currentGap;
    }
    return totalOffset;
  };

  const rootKey = normalizeWord(root) || root;
  nodeMap[rootKey] = { x: CENTER_X, y: CENTER_Y };

  if (arrangement === 'aligned') {
    const normalizedRoot = normalizeWord(root) || root;
    const { medianRow: rootMedian } = calculateTreeRows(derivatives, normalizedRoot, 0);

    derivatives.forEach(d => {
      const tier = d.tier;
      const row = (d.treeRow ?? 0) - rootMedian;
      const offset = getTierOffset(tier);
      
      if (direction === 'horizontal') {
        nodeMap[d.word_ab] = { 
          x: CENTER_X + offset, 
          y: CENTER_Y + (row * cellH) 
        };
      } else {
        nodeMap[d.word_ab] = { 
          x: CENTER_X + (row * cellH),
          y: CENTER_Y - offset
        };
      }
    });
  } else {
    const tiers: Record<number, Derivation[]> = {};
    derivatives.forEach(d => {
      if (!tiers[d.tier]) tiers[d.tier] = [];
      tiers[d.tier].push(d);
    });

    Object.keys(tiers).forEach(tStr => {
      const t = Number(tStr);
      const tierNodes = tiers[t].sort((a, b) => a.word_ab.localeCompare(b.word_ab));
      const offset = getTierOffset(t);

      tierNodes.forEach((node, i) => {
        const rowGap = config?.interRowGap ?? GUTTER_V;
        const nodeSize = config?.nodeSize ?? 1;
        const dynamicHeight = ((config?.nodePaddingY ?? 8) * 2 + 16) * nodeSize;
        const dynamicWidth = (config?.nodeWidth ?? 100) * nodeSize;
        
        const spacing = (direction === 'horizontal' ? dynamicHeight : dynamicWidth) + rowGap;
        const crossOffset = (i - (tierNodes.length - 1) / 2) * spacing;

        if (direction === 'horizontal') {
          nodeMap[node.word_ab] = { 
            x: CENTER_X + offset, 
            y: CENTER_Y + crossOffset 
          };
        } else {
          nodeMap[node.word_ab] = { 
            x: CENTER_X + crossOffset, 
            y: CENTER_Y - offset 
          };
        }
      });
    });
  }

  return nodeMap;
};
