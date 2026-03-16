'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import { KilangContextProps, SidebarUIState } from './KilangTypes';

const SidebarContext = createContext<KilangContextProps | undefined>(undefined);

export const SidebarProvider: React.FC<{
  children: React.ReactNode;
  value: Omit<KilangContextProps, keyof SidebarUIState | 'setSidebarTab' | 'setShowMyTrees' | 'toggleSection'>;
}> = ({ children, value }) => {
  // Local UI State (Transient UX states not in the global reducer)
  const [uiState, setUiState] = useState<Omit<SidebarUIState, 'sidebarTab' | 'searchTerm' | 'branchFilter'>>({
    showMyTrees: false,
    collapsedSections: {},
    toast: null,
    animations: {
      showPlusOne: false,
      showMinusOne: false
    }
  });

  // Action Shorthands
  const setSidebarTab = (tab: SidebarUIState['sidebarTab']) =>
    value.dispatch({ type: 'SET_UI', sidebarTab: tab });

  const setShowMyTrees = (show: boolean) =>
    setUiState(prev => ({ ...prev, showMyTrees: show }));

  const toggleSection = (id: string) =>
    setUiState(prev => ({
      ...prev,
      collapsedSections: {
        ...prev.collapsedSections,
        [id]: !prev.collapsedSections[id]
      }
    }));

  // Merge external state/dispatch with local UI state
  const contextValue = useMemo(() => ({
    ...value,
    ...uiState,
    sidebarTab: value.state.sidebarTab,
    searchTerm: value.state.searchTerm,
    branchFilter: value.state.branchFilter,
    setSidebarTab,
    setShowMyTrees,
    toggleSection
  }), [value, uiState]);

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
