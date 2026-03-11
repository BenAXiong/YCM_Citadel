import React from 'react';
import { GLID_FAMILIES, GLID_NAMES, GLID_NAMES_EN, getDialectName } from "@/lib/dialects";
import { ChevronDown, ChevronRight, CheckSquare, Square } from "lucide-react";
import { UILang } from "@/types";

interface DialectTreeProps {
  uiLang: UILang;
  selectedDialects: Set<string>;
  setSelectedDialects: (val: Set<string>) => void;
  expandedGroups: Record<string, boolean>;
  toggleGroupExpand: (glid: string) => void;
  filterFontSize: number;
}

export const DialectTree = React.memo(function DialectTree({
  uiLang,
  selectedDialects,
  setSelectedDialects,
  expandedGroups,
  toggleGroupExpand,
  filterFontSize
}: DialectTreeProps) {
  const toggleDialect = (d: string) => {
    const next = new Set(selectedDialects);
    if (next.has(d)) next.delete(d);
    else next.add(d);
    setSelectedDialects(next);
  };

  const toggleAllInFamily = (glid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const familyDialects = GLID_FAMILIES[glid] || [];
    const allSelected = familyDialects.every(d => selectedDialects.has(d));
    const next = new Set(selectedDialects);
    if (allSelected) {
      familyDialects.forEach(d => next.delete(d));
    } else {
      familyDialects.forEach(d => next.add(d));
    }
    setSelectedDialects(next);
  };

  return (
    <div className="space-y-3 pr-2 w-full" dir="ltr">
      {Object.entries(GLID_FAMILIES).sort((a, b) => Number(a[0]) - Number(b[0])).map(([glid, dialects]) => {
        const isExpanded = expandedGroups[glid];
        const selectedCount = dialects.filter(d => selectedDialects.has(d)).length;
        const titleName = uiLang === "zh" ? GLID_NAMES[glid] : (GLID_NAMES_EN[glid] || GLID_NAMES[glid]);
        return (
          <div key={glid} className="border border-[var(--border-light)] bg-[var(--bg-sub)] rounded overflow-hidden">
            <div className="w-full flex items-center justify-between p-2 bg-[var(--bg-panel)] hover:bg-[var(--bg-highlight)] transition cursor-default">
              <button
                onClick={() => toggleGroupExpand(glid)}
                className="flex items-center space-x-2 text-[var(--text-main)] truncate max-w-[200px] flex-1 text-left"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4 text-[var(--accent)] shrink-0" /> : <ChevronRight className="w-4 h-4 text-[var(--text-sub)] shrink-0" />}
                <span
                  style={{ fontSize: filterFontSize }}
                  className={`font-mono font-semibold tracking-wide truncate ${selectedCount > 0 ? 'text-[var(--accent)]' : 'text-[var(--text-sub)]'}`}
                >
                  [{glid}] {titleName}
                </span>
              </button>
              {selectedCount > 0 && (
                <button
                  onClick={(e) => toggleAllInFamily(glid, e)}
                  className="text-[10px] font-mono bg-[var(--accent)] text-[var(--bg-deep)] px-1.5 rounded hover:opacity-80 transition active:scale-95"
                  title="Toggle All in Category"
                >
                  {selectedCount}
                </button>
              )}
              {selectedCount === 0 && (
                <button
                  onClick={(e) => toggleAllInFamily(glid, e)}
                  className="text-[10px] font-mono border border-[var(--border-dark)] text-[var(--text-sub)] px-1.5 rounded hover:border-[var(--accent)] hover:text-[var(--accent)] transition"
                >
                  0
                </button>
              )}
            </div>
            {isExpanded && (
              <div className="p-1 space-y-0.5 bg-[var(--bg-sub)]">
                {dialects.map(d => (
                  <label key={d} className="flex items-center space-x-2 cursor-pointer group p-1.5 hover:bg-[var(--bg-highlight)] rounded transition" onClick={(e) => { e.preventDefault(); toggleDialect(d); }}>
                    <div className={`w-3.5 h-3.5 border flex items-center justify-center rounded-sm transition-colors shrink-0 ${selectedDialects.has(d) ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border-light)] group-hover:border-[var(--text-sub)] bg-[var(--bg-panel)]'}`}>
                      {selectedDialects.has(d) && <CheckSquare className="w-2.5 h-2.5 text-[var(--bg-deep)]" />}
                    </div>
                    <span
                      style={{ fontSize: filterFontSize }}
                      className={`truncate font-mono ${selectedDialects.has(d) ? 'text-[var(--text-main)] font-medium' : 'text-[var(--text-sub)]'} group-hover:text-[var(--text-main)] transition`}
                    >
                      {getDialectName(d, uiLang as any)}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});
