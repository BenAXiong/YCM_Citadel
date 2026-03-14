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

export interface KilangRootData {
  word: string;
  derivatives: Derivation[];
  totalInDb: number;
  parentStem: string | null;
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
 */
export const calculateTreeRows = (
  derivatives: Derivation[],
  parentWord: string,
  startRow: number = 0
): number => {
  const pNormalized = normalizeWord(parentWord);
  const children = derivatives.filter((d) => d.parentWord === pNormalized);
  
  if (children.length === 0) return 1;

  let totalUsed = 0;
  children.forEach((child) => {
    const rowsForChild = calculateTreeRows(derivatives, child.word_ab, startRow + totalUsed);
    child.treeRow = startRow + totalUsed;
    totalUsed += rowsForChild;
  });
  
  return totalUsed;
};
