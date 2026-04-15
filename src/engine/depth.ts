/**
 * Depth system — creates layered parallax and shadow effects.
 *
 * The taxonomy grid is flat (2D documentation).
 * The void/eruption gains VOLUME — it rises from the paper.
 * This dimensional contrast between flat rational documentation
 * and physical irrational eruption is what elevates good to extraordinary.
 *
 * Implements:
 * - Drop shadows that shift with mouse position (parallax)
 * - Layered rendering at different "depths"
 * - Edge darkening / vignette for depth perception
 * - "Eruption" effect — 3D masses pushing through the 2D surface
 */

import { fbm, simplex2 } from './noise';

export interface DepthLayer {
  z: number;       // 0 = paper surface, positive = above, negative = below
  opacity: number;
  blur: number;    // Shadow blur at this depth
}

export const DEPTH_LAYERS = {
  subSurface:   { z: -2, opacity: 0.15, blur: 4 },   // Ghost text, deep patterns
  paper:        { z: 0,  opacity: 1,    blur: 0 },    // Main drawing surface
  inkPooling:   { z: 0.5, opacity: 0.8, blur: 0.5 },  // Thick ink areas
  raised:       { z: 1,  opacity: 0.9, blur: 1 },     // Slightly raised elements
  eruption:     { z: 3,  opacity: 1,   blur: 2 },     // 3D eruptions from paper
} as const;

/**
 * Draw a drop shadow for an element at a given depth.
 * Shadow direction shifts with observer position for parallax.
 */
export function drawDepthShadow(
  ctx: CanvasRenderingContext2D,
  drawFn: (ctx: CanvasRenderingContext2D) => void,
  depth: number,
  observerX: number,
  observerY: number,
  canvasWidth: number,
  canvasHeight: number
): void {
  if (depth <= 0) return;

  // Shadow offset based on observer position (parallax)
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const offsetX = (centerX - observerX) / canvasWidth * depth * 4;
  const offsetY = (centerY - observerY) / canvasHeight * depth * 4;
  const blur = depth * 2;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = blur;
  ctx.shadowOffsetX = offsetX;
  ctx.shadowOffsetY = offsetY;
  drawFn(ctx);
  ctx.restore();
}

/**
 * Draw an "eruption" — a 3D mass pushing through the paper surface.
 * Uses radial gradient and shadow to create depth illusion.
 */
export function drawEruption(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  height: number, // Perceived height above paper (0-5)
  seed: number,
  observerX: number,
  observerY: number,
  canvasWidth: number,
  canvasHeight: number
): void {
  let s = seed;
  const rng = () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };

  // Shadow (shifts with observer)
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const shadowX = (centerX - observerX) / canvasWidth * height * 6;
  const shadowY = (centerY - observerY) / canvasHeight * height * 6;

  ctx.save();

  // Drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  for (let a = 0; a < Math.PI * 2; a += 0.05) {
    const noise = fbm(a * 2 + seed, 0, 3) * radius * 0.3;
    const r = radius + noise;
    const px = cx + shadowX + Math.cos(a) * r;
    const py = cy + shadowY + Math.sin(a) * r;
    if (a === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.filter = `blur(${height * 1.5}px)`;
  ctx.fill();
  ctx.filter = 'none';

  // The eruption mass itself — black with organic boundary
  ctx.fillStyle = '#000';
  ctx.beginPath();
  for (let a = 0; a < Math.PI * 2; a += 0.03) {
    const noise = fbm(a * 3 + seed, radius * 0.01, 5) * radius * 0.4;
    const r = radius * 0.8 + noise;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (a === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // Surface texture on the eruption — gives it sculptural quality
  // Highlight edge (light from upper-left)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let a = Math.PI * 0.8; a < Math.PI * 1.8; a += 0.05) {
    const noise = fbm(a * 3 + seed, radius * 0.01, 5) * radius * 0.4;
    const r = radius * 0.75 + noise;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (a === Math.PI * 0.8) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Concentric texture rings on the mass surface (like geological layers)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 0.5;
  for (let ring = 0.2; ring < 0.8; ring += 0.15) {
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += 0.08) {
      const noise = simplex2(a * 4 + seed + ring * 10, ring * 5) * radius * 0.15;
      const r = radius * ring + noise;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Organic details erupting from the mass
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 0.4;
  const numDetails = 5 + Math.floor(rng() * 10);
  for (let d = 0; d < numDetails; d++) {
    const angle = rng() * Math.PI * 2;
    const dist = radius * (0.3 + rng() * 0.4);
    const dx = cx + Math.cos(angle) * dist;
    const dy = cy + Math.sin(angle) * dist;
    const detailR = 2 + rng() * 8;

    // Small organic form — like the JK cellular vocabulary
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += 0.2) {
      const wobble = 1 + Math.sin(a * 3 + rng() * 10) * 0.3;
      const r = detailR * wobble;
      const px = dx + Math.cos(a) * r;
      const py = dy + Math.sin(a) * r;
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draw a vignette — darkening at the edges for depth.
 */
export function drawVignette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number = 0.3
): void {
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.3,
    width / 2, height / 2, Math.max(width, height) * 0.7
  );
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity})`);

  ctx.save();
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

/**
 * Draw ghost text — very large, very faint text underlying the composition.
 * Like a watermark or palimpsest — text that was written first, then drawn over.
 */
export function drawGhostText(
  ctx: CanvasRenderingContext2D,
  text: string,
  width: number,
  height: number,
  seed: number
): void {
  let s = seed;
  const rng = () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };

  ctx.save();
  ctx.fillStyle = '#000';
  ctx.globalAlpha = 0.08;

  // Large rotating text
  const fontSize = 40 + rng() * 60;
  ctx.font = `${fontSize}px serif`;
  ctx.textAlign = 'center';

  const angle = (rng() - 0.5) * 0.4;
  ctx.translate(width / 2, height / 2);
  ctx.rotate(angle);

  // Break into words and scatter
  const words = text.split(' ');
  const lineHeight = fontSize * 1.3;
  const startY = -((words.length / 4) * lineHeight) / 2;

  let wordIdx = 0;
  for (let line = 0; wordIdx < words.length; line++) {
    const wordsPerLine = 3 + Math.floor(rng() * 3);
    const lineWords = words.slice(wordIdx, wordIdx + wordsPerLine).join(' ');
    ctx.fillText(lineWords, (rng() - 0.5) * 100, startY + line * lineHeight);
    wordIdx += wordsPerLine;
  }

  ctx.restore();
}

/**
 * Draw sub-surface pattern — faint geometric grid visible "beneath" the paper.
 * Like seeing through the paper to a hidden layer.
 */
export function drawSubSurface(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number
): void {
  let s = seed;
  const rng = () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };

  ctx.save();
  ctx.strokeStyle = '#000';
  ctx.globalAlpha = 0.025;
  ctx.lineWidth = 0.3;

  // Faint grid
  const gridSize = 30 + rng() * 40;
  const offsetX = rng() * gridSize;
  const offsetY = rng() * gridSize;
  const angle = (rng() - 0.5) * 0.15;

  ctx.translate(width / 2, height / 2);
  ctx.rotate(angle);
  ctx.translate(-width / 2, -height / 2);

  for (let x = offsetX; x < width + 50; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, -50);
    ctx.lineTo(x, height + 50);
    ctx.stroke();
  }
  for (let y = offsetY; y < height + 50; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(-50, y);
    ctx.lineTo(width + 50, y);
    ctx.stroke();
  }

  // Faint concentric circles
  const cx = width * (0.3 + rng() * 0.4);
  const cy = height * (0.3 + rng() * 0.4);
  for (let r = 20; r < Math.max(width, height) * 0.5; r += 25 + rng() * 20) {
    ctx.globalAlpha = 0.015;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}
