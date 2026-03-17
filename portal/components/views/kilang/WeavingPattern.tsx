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

const generateBraidedPath = (yOffset: number, amplitude: number, period: number, wrapAmp: number, wrapFreq: number) => {
  let path = `M -16 ${yOffset}`;
  // Higher resolution for smooth high-frequency waves
  for (let x = -16; x <= 272; x += 2) {
    const baseY = yOffset + amplitude * Math.sin(((x + 16) * Math.PI) / period);
    const wrapY = wrapAmp * Math.sin((x * Math.PI) / wrapFreq);
    path += ` L ${x} ${baseY + wrapY}`;
  }
  return path;
};

export const WeavingPattern = () => {
  // Main Strands (The base loom)
  const mainPathA = generateBraidedPath(16, 12, 32, 0, 1);
  const mainPathB = generateBraidedPath(16, -12, 32, 0, 1);

  // Wrapping Strands (The orbiting accents)
  const wrapPathA = generateBraidedPath(16, 12, 32, 3.5, 10);
  const wrapPathB = generateBraidedPath(16, -12, 32, 3.5, 12);

  return (
    <div className="relative w-64 h-8 overflow-hidden rounded-lg flex items-center justify-center">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 256 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="braid-gradient-a" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="braid-gradient-b" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>

          <linearGradient id="fade-sides" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="black" />
            <stop offset="10%" stopColor="white" />
            <stop offset="90%" stopColor="white" />
            <stop offset="100%" stopColor="black" />
          </linearGradient>

          <mask id="pattern-bounds">
            <rect width="256" height="32" fill="url(#fade-sides)" />
          </mask>
        </defs>

        <g mask="url(#pattern-bounds)">
          {/* Group A: Faster (4.0s) */}
          <g>
            <path
              d={mainPathA}
              stroke="url(#braid-gradient-a)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="450"
              className="opacity-90"
            >
              <animate attributeName="stroke-dashoffset" values="450; 0; 0; 0" keyTimes="0; 0.6; 0.9; 1" dur="4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.2; 0.9; 0.9; 0" keyTimes="0; 0.1; 0.8; 1" dur="4s" repeatCount="indefinite" />
            </path>
            <path
              d={wrapPathA}
              stroke="url(#braid-gradient-a)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeDasharray="450"
              className="opacity-60"
            >
              <animate attributeName="stroke-dashoffset" values="450; 0; 0; 0" keyTimes="0; 0.6; 0.9; 1" dur="4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0; 0.5; 0.5; 0" keyTimes="0; 0.1; 0.8; 1" dur="4s" repeatCount="indefinite" />
            </path>
          </g>

          {/* Group B: Slower (5.2s) */}
          <g>
            <path
              d={mainPathB}
              stroke="url(#braid-gradient-b)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="450"
              className="opacity-90"
            >
              <animate attributeName="stroke-dashoffset" values="450; 0; 0; 0" keyTimes="0; 0.6; 0.95; 1" dur="5.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.2; 0.9; 0.9; 0" keyTimes="0; 0.1; 0.85; 1" dur="5.2s" repeatCount="indefinite" />
            </path>
            <path
              d={wrapPathB}
              stroke="url(#braid-gradient-b)"
              strokeWidth="2.0"
              strokeLinecap="round"
              strokeDasharray="450"
              className="opacity-80"
            >
              <animate attributeName="stroke-dashoffset" values="450; 0; 0; 0" keyTimes="0; 0.6; 0.95; 1" dur="5.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0; 0.5; 0.5; 0" keyTimes="0; 0.1; 0.85; 1" dur="5.2s" repeatCount="indefinite" />
            </path>
          </g>
        </g>
      </svg>
    </div>
  );
};
