'use client';

import { useMemo } from 'react';
import { FILTER_BUCKETS } from '../kilangConstants';

interface UseKilangFilteringProps {
  stats: any;
  searchTerm: string;
  branchFilter: string;
}

export const useKilangFiltering = ({ 
  stats, 
  searchTerm, 
  branchFilter 
}: UseKilangFilteringProps) => {
  const bucketHits = useMemo(() => {
    if (!stats) return {};
    const hits: Record<string, number> = {};
    FILTER_BUCKETS.forEach(bucket => {
      hits[bucket.label] = stats.top_roots.filter((r: any) => r.count >= bucket.min && r.count <= bucket.max).length;
    });
    return hits;
  }, [stats]);

  const filteredRoots = useMemo(() => {
    if (!stats) return [];
    let roots = stats.top_roots;

    if (searchTerm) {
      roots = roots.filter((r: any) => r.root.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (branchFilter !== 'all') {
      const bucket = FILTER_BUCKETS.find(b => b.label === branchFilter);
      if (bucket) {
        roots = roots.filter((r: any) => r.count >= bucket.min && r.count <= bucket.max);
      }
    }

    // Ensure uniqueness and sort by count ASC
    const uniqueRoots = new Map();
    roots.forEach((r: any) => {
      const low = r.root.toLowerCase();
      if (!uniqueRoots.has(low) || r.count > uniqueRoots.get(low).count) {
        uniqueRoots.set(low, r);
      }
    });

    return Array.from(uniqueRoots.values()).sort((a, b) => a.count - b.count);
  }, [stats, searchTerm, branchFilter]);

  return {
    bucketHits,
    filteredRoots,
    FILTER_BUCKETS
  };
};
