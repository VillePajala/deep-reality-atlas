/**
 * Stippling engine — creating dense dot-based textures.
 * The meticulous stippling/dotted lines along organic cell membranes.
 */

import { fbm } from './noise';

/**
 * Draw stippled fill within a circular region.
 * Density varies with noise for organic feel.
 */
export function stippleRegion(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  baseDensity: number,
  seed: number
): void {
  let s = seed;
  const rng = () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };

  const area = Math.PI * radius * radius;
  const numDots = Math.floor(area * baseDensity);

  ctx.save();
  ctx.fillStyle = '#000';

  for (let i = 0; i < numDots; i++) {
    // Rejection sampling for circular region
    const dx = (rng() - 0.5) * 2 * radius;
    const dy = (rng() - 0.5) * 2 * radius;
    if (dx * dx + dy * dy > radius * radius) continue;

    const x = cx + dx;
    const y = cy + dy;

    // Density modulated by noise — more organic
    const noiseDensity = (fbm(x * 0.05 + seed, y * 0.05, 3) + 1) / 2;
    if (rng() > noiseDensity * 0.8 + 0.2) continue;

    const dotSize = 0.2 + rng() * 0.8;
    ctx.globalAlpha = 0.5 + rng() * 0.5;
    ctx.beginPath();
    ctx.arc(x, y, dotSize, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draw a stippled line — like dotted ink along a membrane.
 */
export function stippleLine(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  width: number,
  density: number,
  seed: number
): void {
  if (points.length < 2) return;

  let s = seed;
  const rng = () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };

  ctx.save();
  ctx.fillStyle = '#000';

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const segLen = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / segLen;
    const ny = dx / segLen;

    const numDots = Math.floor(segLen * density);
    for (let d = 0; d < numDots; d++) {
      const t = rng();
      const offset = (rng() - 0.5) * width;
      const x = p1.x + dx * t + nx * offset;
      const y = p1.y + dy * t + ny * offset;
      const dotSize = 0.2 + rng() * 0.6;

      ctx.globalAlpha = 0.4 + rng() * 0.6;
      ctx.beginPath();
      ctx.arc(x, y, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * Draw a gradient of stippling that transitions from dense to sparse.
 * Used at zone boundaries.
 */
export function stippleGradient(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  direction: 'horizontal' | 'vertical' | 'radial',
  maxDensity: number,
  seed: number
): void {
  let s = seed;
  const rng = () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };

  const numDots = Math.floor(width * height * maxDensity * 0.01);

  ctx.save();
  ctx.fillStyle = '#000';

  for (let i = 0; i < numDots; i++) {
    const px = x + rng() * width;
    const py = y + rng() * height;

    let t: number;
    if (direction === 'horizontal') {
      t = (px - x) / width;
    } else if (direction === 'vertical') {
      t = (py - y) / height;
    } else {
      const cx = x + width / 2;
      const cy = y + height / 2;
      const maxR = Math.sqrt(width * width + height * height) / 2;
      const dx = px - cx;
      const dy = py - cy;
      t = Math.sqrt(dx * dx + dy * dy) / maxR;
    }

    if (rng() > t * maxDensity) continue;

    const dotSize = 0.3 + rng() * 1;
    ctx.globalAlpha = 0.3 + rng() * 0.7;
    ctx.beginPath();
    ctx.arc(px, py, dotSize, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
