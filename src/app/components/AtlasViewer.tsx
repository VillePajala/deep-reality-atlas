'use client';

/**
 * AtlasViewer — the main interactive wrapper.
 * Controls seed, entropy, and displays the active theme from the Holy Book of Insanity.
 */

import { useState, useCallback, useMemo } from 'react';
import AtlasCanvas from './AtlasCanvas';
import { getPageInfo } from '../../composition/atlas-page';

export default function AtlasViewer() {
  const [seed, setSeed] = useState(42);
  const [entropy, setEntropy] = useState(0.5);

  const pageInfo = useMemo(() => getPageInfo(seed), [seed]);

  const handleSeedChange = useCallback((newSeed: number) => {
    setSeed(newSeed);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 w-full h-full p-4">
      {/* Theme display */}
      <div className="flex flex-col items-center gap-1 font-mono">
        <div className="text-xs tracking-[0.3em] text-neutral-400">
          {pageInfo.primaryTheme} / {pageInfo.secondaryTheme}
        </div>
        <div className="text-[9px] tracking-[0.15em] text-neutral-600 max-w-lg text-center italic">
          {pageInfo.longQuote.length > 120
            ? pageInfo.longQuote.slice(0, 120) + '...'
            : pageInfo.longQuote}
        </div>
      </div>

      {/* Entropy slider */}
      <div className="flex items-center gap-4 font-mono text-xs text-neutral-500 w-full max-w-md">
        <span className="tracking-widest whitespace-nowrap">ORDER</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={entropy}
          onChange={(e) => setEntropy(parseFloat(e.target.value))}
          className="w-full accent-neutral-500 h-px appearance-none bg-neutral-700 cursor-crosshair
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:bg-neutral-400 [&::-webkit-slider-thumb]:rounded-none
            [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3
            [&::-moz-range-thumb]:bg-neutral-400 [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:border-0"
        />
        <span className="tracking-widest whitespace-nowrap">CHAOS</span>
      </div>

      {/* The atlas canvas */}
      <AtlasCanvas
        seed={seed}
        entropy={entropy}
        onSeedChange={handleSeedChange}
      />

      {/* Mantra + controls */}
      <div className="flex flex-col items-center gap-3">
        <div className="font-mono text-[8px] tracking-[0.2em] text-neutral-700">
          {pageInfo.mantra}
        </div>
        <div className="flex items-center gap-3 font-mono text-xs text-neutral-600">
          <label htmlFor="seed-input" className="tracking-widest">PAGE</label>
          <input
            id="seed-input"
            type="number"
            value={seed}
            onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
            className="w-24 bg-transparent border-b border-neutral-700 text-neutral-400 text-center
              focus:outline-none focus:border-neutral-400 py-1"
          />
        </div>
      </div>
    </div>
  );
}
