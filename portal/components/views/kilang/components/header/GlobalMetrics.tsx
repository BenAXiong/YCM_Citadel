'use client';

import React from 'react';
import { TrendingUp, Boxes, GitBranch, Maximize2 } from 'lucide-react';
import { useKilangContext } from '../../KilangContext';
import { CompactMetric } from '../CompactMetric';

export const GlobalMetrics = () => {
  const { state } = useKilangContext();
  const { stats, showStats } = state;

  if (!stats || !showStats) return null;

  return (
    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
      <CompactMetric
        icon={<TrendingUp className="w-3 h-3" />}
        label="Flowers"
        value={stats.summary.total_words}
        color="rose"
        description="Total vocabulary words mapped to established roots."
      />
      <CompactMetric
        icon={<Boxes className="w-3 h-3" />}
        label="Stems"
        value={stats.summary.total_roots}
        color="blue"
        description="Total unique semantic roots identified in the database."
      />
      <CompactMetric
        icon={<GitBranch className="w-3 h-3" />}
        label="Branching"
        value={stats.summary.average_branching}
        color="indigo"
        description="Average number of derived forms per semantic root."
      />
      <CompactMetric
        icon={<Maximize2 className="w-3 h-3" />}
        label="Max. span"
        value={stats.summary.max_depth}
        color="emerald"
        description="Maximum morphological depth (evolutionary layers) found."
      />
    </div>
  );
};
