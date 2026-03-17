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
    blue: 'text-blue-400', 
    indigo: 'text-indigo-400', 
    emerald: 'text-emerald-400', 
    red: 'text-red-400', 
    rose: 'text-rose-400' 
  };

  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white/[0.02] border border-white/10 rounded-xl hover:bg-white/[0.05] transition-all shrink-0 cursor-help group/metric relative" title={description}>
      <div className={`${colorMap[color] || 'text-blue-400'} opacity-70 group-hover/metric:opacity-100 transition-opacity`}>{icon}</div>
      <div className="flex flex-col">
        <span className="text-[7px] font-black uppercase tracking-widest leading-none mb-0.5 text-kilang-text-muted">{label}</span>
        <span className={`text-sm font-black ${colorMap[color] || 'text-white'} leading-none font-mono`}>
          {value !== undefined && value !== null ? value.toLocaleString() : '---'}
        </span>
      </div>

      {/* Detailed Tooltip Overlay */}
      <div className="absolute top-full right-0 mt-2 w-48 bg-[#0f172a] border border-white/10 p-3 rounded-xl shadow-2xl opacity-0 invisible group-hover/metric:opacity-100 group-hover/metric:visible transition-all z-[9999] pointer-events-none">
        <p className="text-[10px] text-gray-400 leading-relaxed font-medium">{description}</p>
      </div>
    </div>
  );
};
