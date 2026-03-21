import React from 'react';

export const PerformanceMonitor = () => {
  const [history, setHistory] = React.useState<number[]>([]);
  const [memoryUsage, setMemoryUsage] = React.useState<number>(0);
  const frameCount = React.useRef(0);
  const lastTime = React.useRef(performance.now());

  React.useEffect(() => {
    let request: number;
    const loop = () => {
      frameCount.current++;
      const now = performance.now();
      if (now - lastTime.current >= 1000) {
        const currentFps = Math.round((frameCount.current * 1000) / (now - lastTime.current));
        
        // Extract Memory usage (Chrome only)
        const memory = (performance as any).memory?.usedJSHeapSize;
        const memoryMb = memory ? Math.round(memory / (1024 * 1024)) : 0;
        
        setHistory(prev => [...prev.slice(-59), currentFps]);
        setMemoryUsage(memoryMb);
        frameCount.current = 0;
        lastTime.current = now;
      }
      request = requestAnimationFrame(loop);
    };
    request = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(request);
  }, []);

  const currentFps = history[history.length - 1] || 0;
  
  // Sober: W=240, H=120 (Height x2)
  const points = history.map((val, idx) => {
    const x = idx * (240 / 59);
    const y = 120 - (Math.min(val, 60) / 60) * 120;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="absolute top-6 left-6 bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 p-4 flex flex-col gap-3 z-[9999] pointer-events-none shadow-2xl rounded-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2 px-1">
          <span className="text-3xl font-mono font-black text-white leading-none">{currentFps}</span>
          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">fps</span>
        </div>
        <div className="flex items-baseline gap-2 px-1 text-right border-l border-white/10 pl-4">
          <span className="text-xl font-mono font-black text-blue-400 leading-none">{memoryUsage}</span>
          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">mb</span>
        </div>
      </div>

      <div className="w-[240px] h-[120px] bg-white/5 border border-white/5 overflow-hidden rounded-lg">
        <svg width="240" height="120" viewBox="0 0 240 120" className="opacity-90">
          <path
            d={`M ${points}`}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* 30 FPS Warning Line */}
          <line x1="0" y1="60" x2="240" y2="60" stroke="#ef4444" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="4,4" />
          
          {/* Gradient Area Fill */}
          <path
            d={`M ${points} L 240,120 L 0,120 Z`}
            fill="url(#fpsGradient)"
            className="opacity-10"
          />
          <defs>
            <linearGradient id="fpsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};
