'use client';

import React from 'react';
import { KilangAction, KilangState } from '../kilangReducer';
import { Bookmark, KilangRootData } from '../KilangTypes';

const STORAGE_KEY = 'kilang_bookmarked_trees';

export const useKilangBookmarks = (
  selectedRoot: string | null,
  rootData: KilangRootData | null,
  dispatch: React.Dispatch<KilangAction>,
  state: Partial<KilangState> = {} // Fallback for components passing it
) => {
  // Pull from state if provided, otherwise context will be used in components
  const bookmarks = (state as KilangState).bookmarks || [];
  const { showPlusOne, showMinusOne } = (state as KilangState).animations || { showPlusOne: null, showMinusOne: null };
  const showMyTrees = (state as KilangState).showMyTrees || false;

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    dispatch({ type: 'SET_TOAST', message: { message, type } });
  };

  const saveBookmark = (
    rootOverride?: string,
    typeOverride?: 'db' | 'custom',
    dataOverride?: any,
    countOverride?: number,
    sidebarTab?: string,
    customInputDirty?: boolean
  ) => {
    const rootToSave = rootOverride || selectedRoot;
    if (!rootToSave) {
      if (sidebarTab === 'custom') {
        showNotification('Plant your Kilang first!', 'info');
      }
      return;
    }

    // Safety check for custom data
    const isCustom = typeOverride === 'custom' ||
      (rootData?.derivatives?.[0]?.dict_code === 'CUSTOM' && rootToSave === selectedRoot) ||
      (dataOverride?.derivatives?.[0]?.dict_code === 'CUSTOM') ||
      (sidebarTab === 'custom' && rootToSave === selectedRoot);

    if (isCustom && !rootData?.derivatives?.length && !dataOverride) {
      showNotification('Plant your Kilang first!', 'info');
      return;
    }

    if (isCustom && customInputDirty) {
      showNotification('Plant your modified Kilang first!', 'info');
      return;
    }

    const existing = bookmarks.find(b => b.root === rootToSave);

    if (existing) {
      const updated = bookmarks.filter(b => b.root !== rootToSave);
      dispatch({ type: 'SET_BOOKMARKS', bookmarks: updated });
      showNotification(`${isCustom ? 'Custom Kilang' : 'Kilang'} removed from Library`, 'info');

      dispatch({ type: 'SET_ANIMATION', minus: rootToSave });
      setTimeout(() => dispatch({ type: 'SET_ANIMATION', minus: null }), 1000);
      return;
    }

    const newBookmark: Bookmark = {
      id: Date.now().toString(),
      root: rootToSave,
      type: isCustom ? 'custom' : 'db',
      data: isCustom ? (dataOverride || (rootToSave === selectedRoot ? rootData : null)) : null,
      timestamp: new Date().toISOString(),
      count: (countOverride ?? (rootToSave === selectedRoot ? rootData?.derivatives?.length : 0)) || 0,
      isPinned: false
    };

    const updated = [newBookmark, ...bookmarks];
    dispatch({ type: 'SET_BOOKMARKS', bookmarks: updated });

    showNotification(`${isCustom ? 'Custom Kilang' : 'Kilang'} saved to Library`);

    dispatch({ type: 'SET_ANIMATION', plus: rootToSave });
    setTimeout(() => dispatch({ type: 'SET_ANIMATION', plus: null }), 1000);

    if (!rootOverride) dispatch({ type: 'SET_UI', showMyTrees: true });
  };

  const togglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = bookmarks.map(b => b.id === id ? { ...b, isPinned: !b.isPinned } : b);
    dispatch({ type: 'SET_BOOKMARKS', bookmarks: updated });
  };

  const deleteBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = bookmarks.filter(b => b.id !== id);
    dispatch({ type: 'SET_BOOKMARKS', bookmarks: updated });
  };

  const loadBookmark = (bookmark: Bookmark, fetchRootDetails: (root: string) => Promise<void>) => {
    if (bookmark.type === 'custom' && bookmark.data) {
      dispatch({ type: 'SET_CUSTOM_DATA', data: bookmark.data });
    } else {
      fetchRootDetails(bookmark.root);
    }
  };

  const sortedBookmarks = [...bookmarks].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return {
    bookmarks,
    sortedBookmarks,
    toast: (state as KilangState).toast,
    showPlusOne,
    showMinusOne,
    showMyTrees,
    setShowMyTrees: (val: boolean) => dispatch({ type: 'SET_UI', showMyTrees: val }),
    saveBookmark,
    togglePin,
    deleteBookmark,
    loadBookmark,
    showNotification
  };
};
