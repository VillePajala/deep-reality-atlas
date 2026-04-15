/**
 * Contour lines — topographic map effect.
 * Marching squares on noise fields to produce kartographic contour lines.
 * Creates the "Variation B: The Topography" feel.
 */

import { fbm } from './noise';

interface ContourSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Generate contour lines using marching squares on a noise field.
 */
export function generateContours(
  x: number,
  y: number,
  width: number,
  height: number,
  resolution: number,
  numLevels: number,
  noiseScale: number,
  seed: number
): ContourSegment[][] {
  const cols = Math.ceil(width / resolution);
  const rows = Math.ceil(height / resolution);

  // Sample the noise field
  const field = new Float32Array((cols + 1) * (rows + 1));
  for (let gy = 0; gy <= rows; gy++) {
    for (let gx = 0; gx <= cols; gx++) {
      const px = x + gx * resolution;
      const py = y + gy * resolution;
      field[gx + gy * (cols + 1)] = fbm(px * noiseScale + seed, py * noiseScale, 4);
    }
  }

  // Find min/max for level spacing
  let min = Infinity, max = -Infinity;
  for (let i = 0; i < field.length; i++) {
    if (field[i] < min) min = field[i];
    if (field[i] > max) max = field[i];
  }

  const levels: ContourSegment[][] = [];

  for (let level = 0; level < numLevels; level++) {
    const threshold = min + (max - min) * ((level + 1) / (numLevels + 1));
    const segments: ContourSegment[] = [];

    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        const tl = field[gx + gy * (cols + 1)];
        const tr = field[(gx + 1) + gy * (cols + 1)];
        const br = field[(gx + 1) + (gy + 1) * (cols + 1)];
        const bl = field[gx + (gy + 1) * (cols + 1)];

        // Marching squares case
        let code = 0;
        if (tl > threshold) code |= 8;
        if (tr > threshold) code |= 4;
        if (br > threshold) code |= 2;
        if (bl > threshold) code |= 1;

        const px = x + gx * resolution;
        const py = y + gy * resolution;

        const lerp = (a: number, b: number) => {
          if (Math.abs(b - a) < 0.0001) return 0.5;
          return (threshold - a) / (b - a);
        };

        // Interpolated edge midpoints
        const top    = { x: px + lerp(tl, tr) * resolution, y: py };
        const right  = { x: px + resolution, y: py + lerp(tr, br) * resolution };
        const bottom = { x: px + lerp(bl, br) * resolution, y: py + resolution };
        const left   = { x: px, y: py + lerp(tl, bl) * resolution };

        switch (code) {
          case 1: case 14:
            segments.push({ x1: left.x, y1: left.y, x2: bottom.x, y2: bottom.y }); break;
          case 2: case 13:
            segments.push({ x1: bottom.x, y1: bottom.y, x2: right.x, y2: right.y }); break;
          case 3: case 12:
            segments.push({ x1: left.x, y1: left.y, x2: right.x, y2: right.y }); break;
          case 4: case 11:
            segments.push({ x1: top.x, y1: top.y, x2: right.x, y2: right.y }); break;
          case 5:
            segments.push({ x1: top.x, y1: top.y, x2: left.x, y2: left.y });
            segments.push({ x1: bottom.x, y1: bottom.y, x2: right.x, y2: right.y }); break;
          case 6: case 9:
            segments.push({ x1: top.x, y1: top.y, x2: bottom.x, y2: bottom.y }); break;
          case 7: case 8:
            segments.push({ x1: top.x, y1: top.y, x2: left.x, y2: left.y }); break;
          case 10:
            segments.push({ x1: top.x, y1: top.y, x2: right.x, y2: right.y });
            segments.push({ x1: left.x, y1: left.y, x2: bottom.x, y2: bottom.y }); break;
        }
      }
    }

    levels.push(segments);
  }

  return levels;
}

/**
 * Draw contour lines with varying weight — every 5th line is heavier.
 */
export function drawContours(
  ctx: CanvasRenderingContext2D,
  levels: ContourSegment[][],
  baseOpacity: number = 0.25,
  baseWidth: number = 0.3,
  majorWidth: number = 0.7
): void {
  ctx.save();
  ctx.strokeStyle = '#000';
  ctx.lineCap = 'round';

  for (let i = 0; i < levels.length; i++) {
    const isMajor = i % 5 === 0;
    ctx.lineWidth = isMajor ? majorWidth : baseWidth;
    ctx.globalAlpha = isMajor ? baseOpacity * 1.5 : baseOpacity;

    for (const seg of levels[i]) {
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();
    }
  }

  ctx.restore();
}
