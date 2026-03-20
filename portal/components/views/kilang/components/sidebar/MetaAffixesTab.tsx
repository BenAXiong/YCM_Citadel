'use client';

import React from 'react';

interface MetaAffixesTabProps {
  rootData: any;
}

export const MetaAffixesTab = ({ 
  rootData 
}: MetaAffixesTabProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-4 bg-[var(--kilang-accent)] rounded-full" />
        <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--kilang-text)]/80">Affixes / Decomposition</h3>
      </div>
      <div className="mt-4 p-5 bg-[var(--kilang-ctrl-bg)] rounded-2xl border border-[var(--kilang-border-std)] transition-all">
        <p className="text-xs font-medium text-[var(--kilang-text)] leading-relaxed italic opacity-80">
          “{rootData?.definition || 'No semantic definition mapped for this node yet...'}”
        </p>
      </div>
    </div>
  );
};
