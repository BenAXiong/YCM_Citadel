/**
 * WEAVING PATTERN ANIMATION GUIDE
 * 
 * -- generateBraidedPath Parameters --
 * @param yOffset   Horizontal center line of the path (usually 16 for a 32px height).
 * @param amplitude The "height" of the main wave. Higher = steeper peaks/valleys.
 * @param period    The horizontal stretch of one main wave cycle. Lower = more waves per path.
 * @param wrapAmp   The height of the secondary "spiraling" oscillation. Creates the braid texture.
 * @param wrapFreq  The number of mini-spirals per main wave cycle. Lower = slower spiral.
 * 
 * -- Animation Logic --
 * strokeDasharray  (450): Creates a single long dash representing the length of the thread.
 * stroke-dashoffset (450 -> 0): Slides that dash into the view window, creating the "weaving" reveal.
 * dur (4s / 5.2s): Speed of the weaving. Group A and B are decoupled for an asynchronous feel.
 * keyTimes: Defines the rhythm. 0-0.6 is the reveal, 0.6-0.9 is the hold, 0.9-1.0 is the fade out.
 */

'use client';

import React, { useMemo } from 'react';
import { useKilangContext } from './KilangContext';

const generateBraidedPath = (yOffset: number, amplitude: number, period: number, wrapAmp: number, wrapFreq: number, phase: number = 0, length: number = 256) => {
  let path = `M -16 ${yOffset.toFixed(2)}`;
  for (let x = -16; x <= length + 16; x += 2) {
    const angle = (x / period) * Math.PI * 2 + phase;
    const y = yOffset + Math.sin(angle) * amplitude;
    
    if (wrapAmp > 0) {
      const wrapAngle = angle * wrapFreq;
      const wrapY = y + Math.cos(wrapAngle) * wrapAmp;
      path += ` L ${x} ${wrapY.toFixed(2)}`;
    } else {
      path += ` L ${x} ${y.toFixed(2)}`;
    }
  }
  return path;
};

export const WeavingPattern = () => {
  const { state } = useKilangContext();
  const { 
    threadPeriod = 32, 
    threadLength = 256,
    threads = []
  } = state.layoutConfig;

  // Generate paths for each thread
  const threadPaths = useMemo(() => {
    return threads.map((t) => ({
      main: generateBraidedPath(16, t.amplitude, threadPeriod, 0, 1, t.phase, threadLength),
      wrap: generateBraidedPath(16, t.amplitude, threadPeriod, t.orbit, t.complexity, t.phase, threadLength)
    }));
  }, [threads, threadPeriod, threadLength]);

  const dashVal = threadLength * 2;

  return (
    <div 
      className="relative h-8 overflow-hidden rounded-lg flex items-center justify-center transition-all duration-300"
      style={{ width: `${threadLength}px` }}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
      
      <svg className="w-full h-full relative z-10" preserveAspectRatio="none" viewBox={`0 0 ${threadLength} 32`} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {threads.map((t, i) => (
            <linearGradient id={`thread-grad-${i}`} key={i} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={t.color} stopOpacity="0" />
              <stop offset="20%" stopColor={t.color} stopOpacity={t.opacity * 0.5} />
              <stop offset="50%" stopColor={t.color} stopOpacity={t.opacity} />
              <stop offset="80%" stopColor={t.color} stopOpacity={t.opacity * 0.5} />
              <stop offset="100%" stopColor={t.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        <g>
          {threads.map((t, i) => {
            const paths = threadPaths[i];
            const speedStr = `${t.speed}s`;
            
            return (
              <g key={i}>
                <path
                  d={paths.main}
                  stroke={`url(#thread-grad-${i})`}
                  strokeWidth={t.width}
                  strokeLinecap="round"
                  strokeDasharray={dashVal}
                  style={{ opacity: t.opacity }}
                >
                  <animate attributeName="stroke-dashoffset" values={`${dashVal}; 0; 0; 0`} keyTimes="0; 0.6; 0.9; 1" dur={speedStr} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.2; 1; 1; 0" keyTimes="0; 0.1; 0.8; 1" dur={speedStr} repeatCount="indefinite" />
                </path>
                {t.orbit > 0 && (
                  <path
                    d={paths.wrap}
                    stroke={`url(#thread-grad-${i})`}
                    strokeWidth={t.width * 0.7}
                    strokeLinecap="round"
                    strokeDasharray={dashVal}
                    style={{ opacity: t.opacity * 0.6 }}
                  >
                    <animate attributeName="stroke-dashoffset" values={`${dashVal}; 0; 0; 0`} keyTimes="0; 0.6; 0.9; 1" dur={speedStr} repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0; 0.6; 0.6; 0" keyTimes="0; 0.1; 0.8; 1" dur={speedStr} repeatCount="indefinite" />
                  </path>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
