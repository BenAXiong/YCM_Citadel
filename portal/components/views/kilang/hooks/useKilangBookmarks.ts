'use client';

import React from 'react';
import { KilangAction } from '../kilangReducer';
import { Bookmark } from '../KilangTypes';
import { KilangRootData } from '../kilangUtils';

const STORAGE_KEY = 'kilang_bookmarked_trees';

export const useKilangBookmarks = (
  selectedRoot: string | null,
  rootData: KilangRootData | null,
  dispatch: React.Dispatch<KilangAction>
) => {
  const [bookmarks, setBookmarks] = React.useState<Bookmark[]>([]);
  const [toast, setToast] = React.useState<{ message: string, type: 'success' | 'info' } | null>(null);
  const [showPlusOne, setShowPlusOne] = React.useState(false);
  const [showMinusOne, setShowMinusOne] = React.useState(false);
  const [showMyTrees, setShowMyTrees] = React.useState(false);

  // Load bookmarks on mount
  React.useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse bookmarks", e);
      }
    }
  }, []);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
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
      setBookmarks(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      showNotification(`${isCustom ? 'Custom Kilang' : 'Kilang'} removed from Library`, 'info');

      setShowMinusOne(true);
      setTimeout(() => setShowMinusOne(false), 1000);
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
    setBookmarks(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    showNotification(`${isCustom ? 'Custom Kilang' : 'Kilang'} saved to Library`);

    setShowPlusOne(true);
    setTimeout(() => setShowPlusOne(false), 1000);

    if (!rootOverride) setShowMyTrees(true);
  };

  const togglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = bookmarks.map(b => b.id === id ? { ...b, isPinned: !b.isPinned } : b);
    setBookmarks(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
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
    toast,
    showPlusOne,
    showMinusOne,
    showMyTrees,
    setShowMyTrees,
    saveBookmark,
    togglePin,
    deleteBookmark,
    loadBookmark,
    showNotification
  };
};
