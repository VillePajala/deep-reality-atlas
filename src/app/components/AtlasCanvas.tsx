'use client';

/**
 * AtlasCanvas — the core interactive viewer component.
 * Renders a Deep Reality atlas page on a canvas with interaction.
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { renderAtlasPage, renderAnimationOverlay, AtlasPageConfig } from '../../composition/atlas-page';
import {
  ObserverState,
  createObserverState,
  updateObserver,
  drawObserverField,
} from '../../interaction/observer';

interface AtlasCanvasProps {
  seed: number;
  entropy: number;
  width?: number;
  height?: number;
  onSeedChange?: (seed: number) => void;
}

export default function AtlasCanvas({
  seed,
  entropy,
  width: propWidth,
  height: propHeight,
  onSeedChange,
}: AtlasCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<ObserverState>(createObserverState());
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const baseImageRef = useRef<ImageData | null>(null);
  const configRef = useRef<AtlasPageConfig | null>(null);
  const [dimensions, setDimensions] = useState({ width: propWidth || 1200, height: propHeight || 1200 });
  const [isRendering, setIsRendering] = useState(true);
  const [renderError, setRenderError] = useState<string | null>(null);

  // Render the static atlas page
  const renderPage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsRendering(true);
    setRenderError(null);

    // Use setTimeout to let the UI update first
    setTimeout(() => {
      try {
        const config: AtlasPageConfig = {
          width: dimensions.width,
          height: dimensions.height,
          seed,
          entropy,
          observerX: observerRef.current.mouseX || dimensions.width / 2,
          observerY: observerRef.current.mouseY || dimensions.height / 2,
        };

        renderAtlasPage(ctx, config);
        configRef.current = config;

        // Store the base image for the animation loop to composite on
        baseImageRef.current = ctx.getImageData(0, 0, dimensions.width, dimensions.height);
      } catch (err) {
        const msg = err instanceof Error ? err.message + '\n' + err.stack : String(err);
        console.error('RENDER ERROR:', msg);
        setRenderError(msg);
      } finally {
        setIsRendering(false);
      }
    }, 50);
  }, [seed, entropy, dimensions]);

  // Animation loop for interactive elements
  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx || !baseImageRef.current) {
      animFrameRef.current = requestAnimationFrame(animate);
      return;
    }

    const dt = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    // Update observer state
    updateObserver(observerRef.current, dt);

    // Always restore base image and draw animation overlay
    ctx.putImageData(baseImageRef.current, 0, 0);

    // Animation overlay — flowing particles, pulsing geometry, breathing void
    if (configRef.current) {
      const elapsed = (timestamp - startTimeRef.current) / 1000;
      renderAnimationOverlay(ctx, configRef.current, elapsed);
    }

    // Observer disruption field
    const observer = observerRef.current;
    if (observer.isActive || observer.localEntropy > 0.005) {
      drawObserverField(ctx, observer);
    }

    animFrameRef.current = requestAnimationFrame(animate);
  }, []);

  // Handle resize
  useEffect(() => {
    if (propWidth && propHeight) return;

    const container = containerRef.current;
    if (!container) return;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const size = Math.min(rect.width - 32, rect.height - 32, 1200);
      setDimensions({ width: size, height: size });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [propWidth, propHeight]);

  // Render page when seed/entropy/dimensions change
  useEffect(() => {
    renderPage();
  }, [renderPage]);

  // Start animation loop
  useEffect(() => {
    const now = performance.now();
    lastTimeRef.current = now;
    startTimeRef.current = now;
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [animate]);

  // Mouse handlers
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = dimensions.width / rect.width;
    const scaleY = dimensions.height / rect.height;
    observerRef.current.mouseX = (e.clientX - rect.left) * scaleX;
    observerRef.current.mouseY = (e.clientY - rect.top) * scaleY;
  }, [dimensions]);

  const handleMouseEnter = useCallback(() => {
    observerRef.current.isActive = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    observerRef.current.isActive = false;
  }, []);

  // Touch handlers
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = dimensions.width / rect.width;
    const scaleY = dimensions.height / rect.height;
    observerRef.current.mouseX = (touch.clientX - rect.left) * scaleX;
    observerRef.current.mouseY = (touch.clientY - rect.top) * scaleY;
    observerRef.current.isActive = true;
  }, [dimensions]);

  const handleTouchEnd = useCallback(() => {
    observerRef.current.isActive = false;
  }, []);

  // Generate new page
  const handleGenerate = useCallback(() => {
    const newSeed = Math.floor(Math.random() * 100000);
    onSeedChange?.(newSeed);
  }, [onSeedChange]);

  return (
    <div ref={containerRef} className="relative flex flex-col items-center gap-4 w-full h-full">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="border border-neutral-800 shadow-2xl cursor-crosshair"
          style={{
            maxWidth: '100%',
            maxHeight: 'calc(100vh - 160px)',
            aspectRatio: '1 / 1',
          }}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        {isRendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
            <div className="text-neutral-400 font-mono text-sm tracking-widest">
              DOCUMENTING...
            </div>
          </div>
        )}
        {renderError && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-950/80 pointer-events-none p-8">
            <pre className="text-red-300 font-mono text-xs whitespace-pre-wrap max-h-full overflow-auto">
              RENDER ERROR:{'\n'}{renderError}
            </pre>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 font-mono text-xs text-neutral-500">
        <button
          onClick={handleGenerate}
          className="px-4 py-2 border border-neutral-700 hover:border-neutral-400 hover:text-neutral-300 transition-colors tracking-widest"
        >
          GENERATE NEW PAGE
        </button>
        <span className="tracking-wider">SEED: {seed}</span>
        <span className="tracking-wider">ENTROPY: {entropy.toFixed(2)}</span>
      </div>
    </div>
  );
}
