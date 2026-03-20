'use client';

import { Derivation } from '../KilangTypes';

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
 * Calculates a set of words that form the highlight chain (ancestors and descendants).
 */
export const getActiveHighlightChain = (
  activeHighlightNode: string | null,
  derivatives: Derivation[],
  selectedRoot: string | null
): Set<string> => {
  if (!activeHighlightNode || !derivatives) return new Set<string>();

  const chain = new Set<string>();
  const lowRoot = normalizeWord(selectedRoot || '');

  let current: string | null = activeHighlightNode;
  chain.add(current);

  while (current && current !== lowRoot) {
    const entry = derivatives.find((d: Derivation) => d.word_ab === current);
    if (entry && entry.parentWord) {
      chain.add(entry.parentWord);
      current = entry.parentWord;
    } else {
      if (lowRoot) chain.add(lowRoot);
      break;
    }
  }

  const addDescendants = (word: string) => {
    derivatives.forEach((d: Derivation) => {
      if (d.parentWord === word && !chain.has(d.word_ab)) {
        chain.add(d.word_ab);
        addDescendants(d.word_ab);
      }
    });
  };
  addDescendants(activeHighlightNode);

  return chain;
};

/**
 * Calculates the linear path from the root to the active node.
 */
export const getLinearPath = (
  activeHighlightNode: string | null,
  derivatives: Derivation[],
  selectedRoot: string | null
): string[] => {
  if (!activeHighlightNode || !derivatives) return [];

  const path: string[] = [];
  const lowRoot = normalizeWord(selectedRoot || '');

  let current: string | null = activeHighlightNode;
  path.push(current);

  while (current && current !== lowRoot) {
    const entry = derivatives.find((d: Derivation) => d.word_ab === current);
    if (entry && entry.parentWord) {
      path.push(entry.parentWord);
      current = entry.parentWord;
    } else {
      if (lowRoot && !path.includes(lowRoot)) path.push(lowRoot);
      break;
    }
  }

  return path.reverse();
};

/**
 * Generates an ASCII tree string from a list of derivations.
 */
export const generateTreeString = (
  nodes: any[], 
  currentWord: string, 
  prefix: string = '', 
  isLast: boolean = true,
  depth: number = 0,
  filterSet?: Set<string>,
  focusNode?: string | null,
  includeDefinitions?: boolean,
  includeSentences?: boolean
): string => {
  if (depth > 20) return prefix + '└── [Depth Limit Exceeded]\n';
  const normCurrent = normalizeWord(currentWord) || '';
  if (filterSet && !filterSet.has(normCurrent)) return '';
  
  const children = nodes.filter(n => (normalizeWord(n.parentWord) === normCurrent));
  const filteredChildren = filterSet 
    ? children.filter(c => filterSet.has(normalizeWord(c.word_ab) || ''))
    : children;

  const node = nodes.find(n => normalizeWord(n.word_ab) === normCurrent);
  const defStr = (includeDefinitions && node?.definition) ? ` : ${node.definition}` : '';

  const marker = isLast ? '└─ ' : '├─ ';
  let result = prefix + marker + (currentWord || normCurrent) + defStr + '\n';
  
  const newPrefix = prefix + (isLast ? '   ' : '│  ');
  filteredChildren.forEach((child, index) => {
    result += generateTreeString(
      nodes, 
      child.word_ab, 
      newPrefix, 
      index === filteredChildren.length - 1,
      depth + 1,
      filterSet,
      focusNode,
      includeDefinitions,
      includeSentences
    );
  });
  
  return result;
};
