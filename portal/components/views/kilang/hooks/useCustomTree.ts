'use client';

import React from 'react';
import { normalizeWord, Derivation, calculateTreeRows } from '../kilangUtils';
import { KilangAction } from '../kilangReducer';

export const useCustomTree = (dispatch: React.Dispatch<KilangAction>) => {
  const [customInput, setCustomInput] = React.useState("Lamit\n  Ca'ang 1\n    Losay 1\n  Ca'ang 2\n    Losay 2\n      Varu\n        Udal\n  Ca'ang 3");
  const [customInputDirty, setCustomInputDirty] = React.useState(false);
  const [showTips, setShowTips] = React.useState(false);

  const onTabKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const newVal = customInput.substring(0, start) + "  " + customInput.substring(end);
      setCustomInput(newVal);
      setCustomInputDirty(true);

      // Wait for re-render to set selection
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handlePlant = () => {
    if (!customInput || !customInput.trim()) return;
    setCustomInputDirty(false);

    const lines = customInput.split('\n').filter(l => l.trim().length > 0);
    if (lines.length === 0) return;

    const root = lines[0].trim();
    const normalizedRoot = normalizeWord(root);

    const derivatives: Derivation[] = [];
    const stack: { word: string, normalized: string, indent: number }[] = [
      { word: root, normalized: normalizedRoot || root.toLowerCase(), indent: -1 }
    ];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const indent = line.search(/\S/);
      const rawWord = line.trim();
      const normalizedWordStr = normalizeWord(rawWord) || rawWord.toLowerCase();

      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      const parentObj = stack[stack.length - 1];
      const tier = stack.length + 1;

      derivatives.push({
        id: Date.now() + i, // Added ID for type safety
        word_ab: normalizedWordStr,
        raw_word: rawWord,
        parentWord: parentObj.normalized,
        ultimateRoot: normalizedRoot,
        tier: tier,
        dict_code: 'CUSTOM',
        definition: '',
        sortPath: ''
      } as any);

      stack.push({ word: rawWord, normalized: normalizedWordStr, indent });
    }

    const normalizedFinalRoot = normalizedRoot || root;
    calculateTreeRows(derivatives, normalizedFinalRoot, 0);

    dispatch({
      type: 'SET_CUSTOM_DATA',
      data: { 
        word: root,
        root: root, // Ensure both root and word are provided for reducer compatibility
        derivatives,
        totalInDb: derivatives.length,
        parentStem: null,
        loading: false
      }
    });
  };

  return {
    customInput,
    setCustomInput,
    customInputDirty,
    setCustomInputDirty,
    showTips,
    setShowTips,
    onTabKeyDown,
    handlePlant
  };
};
