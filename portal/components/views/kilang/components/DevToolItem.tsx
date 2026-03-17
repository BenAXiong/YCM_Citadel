import React from 'react';

interface DevToolItemProps {
  label: string;
  goal: string;
  isOn?: boolean;
  isPlaceholder?: boolean;
  onClick?: () => void;
}

export const DevToolItem = ({ label, goal, isOn, isPlaceholder, onClick }: DevToolItemProps) => {
  const [isHovered, setIsHovered] = React.useState(false);
  return (
    <div 
      className="relative group/tool"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        disabled={isPlaceholder}
        onClick={onClick}
        className={`flex items-center justify-between w-full px-2 py-1.5 rounded hover:bg-white/5 transition-all group ${isPlaceholder ? 'opacity-30 cursor-not-allowed' : ''}`}
      >
        <span className="text-[9px] font-bold uppercase text-white/40 group-hover:text-white/80 transition-colors">{label}</span>
        {!isPlaceholder && (
          <div className={`w-2 h-2 rounded-full border transition-all ${isOn ? 'bg-blue-500 border-blue-400' : 'border-white/20'}`} />
        )}
      </button>

      {/* Goal Tooltip */}
      {isHovered && (
        <div className="absolute right-full mr-2 top-0 w-36 bg-[#1e293b] border border-white/10 p-2 rounded-lg shadow-xl z-[5000] pointer-events-none animate-in fade-in slide-in-from-right-2 duration-200">
          <p className="text-[8px] font-medium leading-relaxed text-white/60 tracking-wider uppercase">{goal}</p>
        </div>
      )}
    </div>
  );
};
