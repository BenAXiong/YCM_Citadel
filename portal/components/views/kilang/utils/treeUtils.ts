'use client';

import { MoeEntry, Derivation } from '../KilangTypes';
import { normalizeWord } from './formatUtils';

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
      sortPath: row.sort_path || '',
      definitions: [row.definition],
      allExamples: row.examples_json ? JSON.parse(row.examples_json) : []
    };

    if (word === lowRoot) return;

    if (uniqueDerivativesMap.has(word)) {
      const existing = uniqueDerivativesMap.get(word)!;
      if (!existing.definitions?.includes(row.definition)) {
        existing.definitions?.push(row.definition);
      }
      if (row.examples_json) {
        try {
          const newEx = JSON.parse(row.examples_json);
          if (Array.isArray(newEx)) {
            newEx.forEach(ex => {
              if (!existing.allExamples?.some(e => e.ab === ex.ab)) {
                 existing.allExamples?.push(ex);
              }
            });
          }
        } catch (e) {}
      }
    } else {
      uniqueDerivativesMap.set(word, dRow);
    }
  });

  let derivatives = Array.from(uniqueDerivativesMap.values());

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
): { totalRows: number; medianRow: number } => {
  const pNormalized = normalizeWord(parentWord);
  const children = derivatives.filter((d) => d.parentWord === pNormalized);
  
  if (children.length === 0) return { totalRows: 1, medianRow: startRow };

  let totalUsed = 0;
  const childMedians: number[] = [];

  children.forEach((child) => {
    const { totalRows: rowsForChild, medianRow: childMedian } = calculateTreeRows(derivatives, child.word_ab, startRow + totalUsed);
    child.treeRow = childMedian;
    childMedians.push(childMedian);
    totalUsed += rowsForChild;
  });
  
  const medianRow = (childMedians[0] + childMedians[childMedians.length - 1]) / 2;
  return { totalRows: totalUsed, medianRow };
};
