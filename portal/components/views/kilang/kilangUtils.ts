/**
 * Kilang Data Engine Utilities
 * Handles the extraction and reshaping of morphological derivation trees.
 */

export interface MoeEntry {
  id: number;
  word_ab: string;
  definition: string;
  dict_code: string;
  stem?: string;
  parent_word?: string;
  ultimate_root?: string;
  tier?: number | string;
  sort_path?: string;
  [key: string]: any;
}

export interface Derivation extends MoeEntry {
  word_ab: string;
  parentWord: string | null;
  ultimateRoot: string | null;
  tier: number;
  sortPath: string;
  treeRow?: number;
}

export interface RootStats {
  summary: {
    total_roots: number;
    max_depth: number;
    max_branches: number;
    total_words: number;
    average_branching: number;
    std_dev: number;
  };
  distribution: Record<string, number>;
  depth_distribution: Record<string, number>;
  deep_examples: Record<string, string[]>;
  top_roots: Array<{ root: string; count: number }>;
}

export interface NodeCoordinate {
  x: number;
  y: number;
}

export type NodeMap = Record<string, NodeCoordinate>;

export interface KilangRootData {
  word: string;
  derivatives: Derivation[];
  totalInDb: number;
  parentStem: string | null;
  loading?: boolean;
  error?: boolean;
  errorMessage?: string;
}

/**
 * Normalizes word strings by trimming and removing trailing pipes.
 */
export const normalizeWord = (word: string | null | undefined): string | null => {
  if (!word) return null;
  let normalized = word.toLowerCase().trim();
  if (normalized.endsWith('|')) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
};

/**
 * Reshapes raw database rows into a structured Derivation array.
 */
export const reshapeDerivatives = (
  rows: MoeEntry[],
  root: string
): Derivation[] => {
  const lowRoot = normalizeWord(root);
  const uniqueDerivativesMap = new Map<string, Derivation>();

  rows.forEach((row) => {
    const word = normalizeWord(row.word_ab);
    if (!word) return;

    const pWord = normalizeWord(row.parent_word);
    const uRoot = normalizeWord(row.ultimate_root);

    const dRow: Derivation = {
      ...row,
      word_ab: word,
      parentWord: pWord,
      ultimateRoot: uRoot,
      tier: Number(row.tier || 2),
      sortPath: row.sort_path || ''
    };

    // Filter out the root itself and duplicates
    if (word !== lowRoot && !uniqueDerivativesMap.has(word)) {
      uniqueDerivativesMap.set(word, dRow);
    }
  });

  let derivatives = Array.from(uniqueDerivativesMap.values());

  // Fallback ancestry calculation if sort_path is missing
  if (derivatives.length > 0 && !derivatives[0].sortPath) {
    derivatives = derivatives.map((d) => ({
      ...d,
      sortPath: calculateAncestryPath(d, derivatives)
    }));
  }

  return derivatives;
};

/**
 * Calculates a sortable ancestry path string: "root>parent>child"
 */
export const calculateAncestryPath = (
  target: Derivation,
  allDerivatives: Derivation[]
): string => {
  let path = [target.word_ab];
  let curr = target;
  
  for (let i = 0; i < 15; i++) {
    if (!curr.parentWord) break;
    const parent = allDerivatives.find(
      (p) => p.word_ab === curr.parentWord
    );
    if (parent) {
      path.unshift(parent.word_ab);
      curr = parent;
    } else {
      break;
    }
  }
  return path.join('>');
};

/**
 * Assigns treeRow indices for layout positioning using a recursive DFS.
 * Returns { totalRows, centerRow } to support recursive centering.
 */
export const calculateTreeRows = (
  derivatives: Derivation[],
  parentWord: string,
  startRow: number = 0
): { totalRows: number; medianRow: number } => {
  const pNormalized = normalizeWord(parentWord);
  const children = derivatives.filter((d) => d.parentWord === pNormalized);
  
  if (children.length === 0) return { totalRows: 1, medianRow: startRow };

  let totalUsed = 0;
  const childMedians: number[] = [];

  children.forEach((child) => {
    const { totalRows: rowsForChild, medianRow: childMedian } = calculateTreeRows(derivatives, child.word_ab, startRow + totalUsed);
    child.treeRow = childMedian; // The child's Y position is its OWN subtree median
    childMedians.push(childMedian);
    totalUsed += rowsForChild;
  });
  
  // The parent's median is the average of its children's start/end spectrum
  // Actually, more simply: the average of its first and last child's medians
  const medianRow = (childMedians[0] + childMedians[childMedians.length - 1]) / 2;
  
  return { totalRows: totalUsed, medianRow };
};

// --- COORDINATE ENGINE ---

// Standard "Bounding Box" for nodes to ensure consistent line connection points
export const LAYOUT_CONSTANTS = {
  NODE_WIDTH: 240,    // Base width plus internal padding
  NODE_HEIGHT: 100,   // Base height plus internal padding
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
  if (coords.length === 0) return { minX: 1000, minY: 1000, maxX: 1000, maxY: 1000 };

  let minX = coords[0].x, minY = coords[0].y, maxX = coords[0].x, maxY = coords[0].y;
  coords.forEach(p => {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  });

  // Pad by node dimensions
  return {
    minX: minX - 120,
    minY: minY - 50,
    maxX: maxX + 120,
    maxY: maxY + 50
  };
};

/**
 * Deterministically calculates {x, y} coordinates for all nodes in the tree.
 * This eliminates the need for DOM measurement (getBoundingClientRect).
 */
export const calculateNodeMap = (
  root: string,
  derivatives: Derivation[],
  direction: 'horizontal' | 'vertical',
  arrangement: 'aligned' | 'flow'
): NodeMap => {
  const nodeMap: NodeMap = {};
  const { ROOT_SIZE, ALIGN_CELL_W, ALIGN_CELL_H, GUTTER_H, GUTTER_V, NODE_WIDTH, NODE_HEIGHT } = LAYOUT_CONSTANTS;
  const CENTER = 1000;

  // 1. Position Root (True Forest Center)
  const rootKey = normalizeWord(root) || root;
  nodeMap[rootKey] = { x: CENTER, y: CENTER };

  if (arrangement === 'aligned') {
    // 2. Centering Logic
    const normalizedRoot = normalizeWord(root) || root;
    const { medianRow: rootMedian } = calculateTreeRows(derivatives, normalizedRoot, 0);

    // ALIGNED Mode: Uses treeRow for consistent branches
    derivatives.forEach(d => {
      const tier = d.tier - 1;
      const row = (d.treeRow ?? 0) - rootMedian; // CENTERED recursive
      
      if (direction === 'horizontal') {
        nodeMap[d.word_ab] = { 
          x: CENTER + (tier * ALIGN_CELL_W + ROOT_SIZE / 2 + 100), 
          y: CENTER + (row * ALIGN_CELL_H) 
        };
      } else {
        nodeMap[d.word_ab] = { 
          x: CENTER + (row * ALIGN_CELL_W), 
          y: CENTER - (tier * ALIGN_CELL_H + ROOT_SIZE / 2 + 100) 
        };
      }
    });
  } else {
    // FLOW Mode: Uses tier grouping (V1 style)
    const tiers: Record<number, Derivation[]> = {};
    derivatives.forEach(d => {
      if (!tiers[d.tier]) tiers[d.tier] = [];
      tiers[d.tier].push(d);
    });

    Object.keys(tiers).forEach(tStr => {
      const t = Number(tStr);
      const tierNodes = tiers[t].sort((a, b) => a.word_ab.localeCompare(b.word_ab));
      const tierIndex = t - 1;

      tierNodes.forEach((node, i) => {
        const spacing = (direction === 'horizontal' ? NODE_HEIGHT : NODE_WIDTH) + GUTTER_V;
        const offset = (i - (tierNodes.length - 1) / 2) * spacing;

        if (direction === 'horizontal') {
          nodeMap[node.word_ab] = { 
            x: CENTER + (tierIndex * (NODE_WIDTH + GUTTER_H) + ROOT_SIZE / 2 + 50), 
            y: CENTER + offset 
          };
        } else {
          nodeMap[node.word_ab] = { 
            x: CENTER + offset, 
            y: CENTER - (tierIndex * (NODE_HEIGHT + GUTTER_H) + ROOT_SIZE / 2 + 50) // UP
          };
        }
      });
    });
  }

  return nodeMap;
};
