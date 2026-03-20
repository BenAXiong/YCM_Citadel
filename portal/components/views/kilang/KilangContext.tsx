'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { KilangState, KilangAction } from './kilangReducer';
import { NodeMap } from './KilangTypes';
import { UILang, UIStrings } from '@/types';

interface KilangContextType {
  state: KilangState;
  dispatch: React.Dispatch<KilangAction>;
  nodeMap: NodeMap;
  fetchRootDetails: (root: string) => Promise<void>;
  summaryCache: Record<string, string[]>;
  fetchSummary: (word: string) => Promise<void>;
  handleExport: () => Promise<void>;
  uiLang: UILang;
  toggleUiLang: () => void;
  s: UIStrings;
  // Derived / Helper data from view
  filteredRoots: any[];
  bucketHits: Record<string, number>;
  FILTER_BUCKETS: any[];
  MOE_SOURCES: any[];
  sourceCounts: Record<string, { r: number; e: number }>;
  treeRef: React.RefObject<HTMLDivElement | null>;
}

const KilangContext = createContext<KilangContextType | undefined>(undefined);

export const KilangProvider = ({ children, value }: { children: ReactNode; value: KilangContextType }) => {
  return <KilangContext.Provider value={value}>{children}</KilangContext.Provider>;
};

export const useKilangContext = () => {
  const context = useContext(KilangContext);
  if (context === undefined) {
    throw new Error('useKilangContext must be used within a KilangProvider');
  }
  return context;
};
