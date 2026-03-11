import React from 'react';
import { Bookmark, Trash2 } from "lucide-react";
import { Theme } from "@/types";

interface ThemeCustomEditorProps {
  theme: Theme;
  previewTheme: Theme | null;
  customColors: Record<string, string>;
  setCustomColors: (val: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
  setShowCustomEditor: (val: boolean) => void;
  setShowThemePicker: (val: boolean) => void;
  setTheme: (val: Theme) => void;
  THEMES_ORDER: string[];
  setSavedThemes: (val: any) => void;
  pickerTimeout: React.MutableRefObject<NodeJS.Timeout | null>;
}

export function ThemeCustomEditor({
  theme,
  previewTheme,
  customColors,
  setCustomColors,
  setShowCustomEditor,
  setShowThemePicker,
  setTheme,
  THEMES_ORDER,
  setSavedThemes,
  pickerTimeout
}: ThemeCustomEditorProps) {
  return (
    <div
      className="absolute left-full top-0 ml-4 p-4 bg-[var(--bg-panel)] border border-[var(--border-dark)] border-t-2 border-t-[var(--accent)] rounded font-sans shadow-2xl z-[9000] w-72 space-y-4 backdrop-blur-3xl animate-in fade-in slide-in-from-left-4 duration-300 pointer-events-auto"
      onMouseEnter={() => {
        if (pickerTimeout.current) clearTimeout(pickerTimeout.current);
        setShowThemePicker(true);
        setShowCustomEditor(true);
      }}
    >
      <div className="text-[10px] text-[var(--text-sub)] uppercase font-mono tracking-widest border-b border-[var(--border-dark)] pb-1 mb-2 flex justify-between items-center text-left">
        <span className="font-black text-[var(--accent)]">THEME EDITOR</span>
        <button onClick={() => setShowCustomEditor(false)} className="hover:text-red-400 transition text-lg leading-none">×</button>
      </div>
      <div className="space-y-2 pr-1">
        {Object.entries(customColors).map(([key, val]) => (
          <div key={key} className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono text-[var(--text-sub)]">{key.replace('--', '')}</span>
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-mono bg-[var(--bg-deep)] px-1 rounded opacity-50">{val}</span>
              <input
                type="color"
                value={val.startsWith('rgba') ? '#ffffff' : (val.startsWith('#') ? val : '#ffffff')}
                onChange={(e) => {
                  const newColor = e.target.value;
                  setCustomColors(prev => {
                    const next = { ...prev, [key]: newColor };
                    if (key === '--accent') {
                      const r = parseInt(newColor.slice(1, 3), 16) || 0;
                      const g = parseInt(newColor.slice(3, 5), 16) || 0;
                      const b = parseInt(newColor.slice(5, 7), 16) || 0;
                      next['--accent-glow'] = `rgba(${r},${g},${b},0.1)`;
                    }
                    return next;
                  });
                }}
                className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-[var(--border-dark)] flex gap-2">
        <button
          onClick={() => {
            const name = prompt("Enter theme name:");
            if (name) {
              setSavedThemes((prev: any) => [...prev, { name, colors: { ...customColors } }]);
              setTheme(name);
              setShowCustomEditor(false);
              setShowThemePicker(false);
            }
          }}
          className="flex-1 bg-[var(--accent)] text-black font-mono text-[10px] font-bold py-2 rounded hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Bookmark className="w-3 h-3" /> SAVE_THEME
        </button>

        {!THEMES_ORDER.includes(theme) && theme !== 'custom' && (
          <button
            onClick={() => {
              if (confirm(`Delete theme "${theme}"?`)) {
                setSavedThemes((prev: any) => prev.filter((t: any) => t.name !== theme));
                setTheme('matrix');
              }
            }}
            className="p-2 border border-red-500/50 text-red-500 hover:bg-red-500/10 rounded transition-colors"
            title="Delete this custom theme"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
