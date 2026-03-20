import React from 'react';

interface CompactMetricProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  description: string;
}

export const CompactMetric = ({ icon, label, value, color, description }: CompactMetricProps) => {
  const colorMap: any = {
    blue: 'text-[var(--kilang-secondary-text)]',
    indigo: 'text-[var(--kilang-secondary-text)]',
    emerald: 'text-[var(--kilang-accent-text)]',
    red: 'text-[var(--kilang-primary-text)]',
    rose: 'text-[var(--kilang-accent-text)]'
  };

  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[var(--kilang-card)] border border-[var(--kilang-border-std)] rounded-xl hover:bg-white/[0.05] transition-all shrink-0 cursor-help group/metric relative min-w-[80px]" title={description}>
      <div className={`${colorMap[color] || 'text-[var(--kilang-secondary-text)]'} opacity-70 group-hover/metric:opacity-100 transition-opacity`}>{icon}</div>
      <div className="flex flex-col">
        <span className="text-[7px] font-black uppercase tracking-widest leading-none mb-0.5 text-[var(--kilang-text-muted)] uppercase">{label}</span>
        <span className={`text-sm font-black text-[var(--kilang-metric-text)] leading-none font-mono`}>
          {value !== undefined && value !== null ? value.toLocaleString() : '---'}
        </span>
      </div>

      {/* Detailed Tooltip Overlay */}
      <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--kilang-tooltip-bg)] backdrop-blur-3xl border border-[var(--kilang-tooltip-border)] p-3 rounded-xl shadow-2xl opacity-0 invisible group-hover/metric:opacity-100 group-hover/metric:visible transition-all z-[9999] pointer-events-none">
        <p className="text-[10px] text-[var(--kilang-text-muted)] leading-relaxed font-medium">{description}</p>
      </div>
    </div>
  );
};
