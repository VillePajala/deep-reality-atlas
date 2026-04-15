/**
 * The Void / Dark Mass — large areas of deep black.
 *
 * Functions as:
 * - Negative space that breathes
 * - Territory on a map — unmapped zones, terra incognita
 * - The thing the taxonomy was trying to contain — seeping through
 *
 * The boundary between black and white is ORGANIC — bleeding, seeping, consuming.
 */

import { fbm, simplex2 } from './noise';

export interface VoidConfig {
  centerX: number;
  centerY: number;
  baseRadius: number;
  irregularity: number;     // 0 = circle, 1 = very organic
  bleedAmount: number;      // How much the edges bleed/feather
  noiseScale: number;
  seed: number;
  tendrils: number;         // Number of tendril extensions
  tendrilLength: number;
}

function createRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Generate the void boundary — an organic, bleeding shape.
 * Returns a function that tells you whether a point is inside the void.
 */
export function createVoidField(config: VoidConfig): (x: number, y: number) => number {
  const rng = createRng(config.seed);

  // Pre-compute tendril directions
  const tendrilAngles: number[] = [];
  const tendrilLengths: number[] = [];
  const tendrilWidths: number[] = [];
  for (let i = 0; i < config.tendrils; i++) {
    tendrilAngles.push(rng() * Math.PI * 2);
    tendrilLengths.push(config.tendrilLength * (0.5 + rng() * 0.5));
    tendrilWidths.push(10 + rng() * 30);
  }

  return (x: number, y: number): number => {
    const dx = x - config.centerX;
    const dy = y - config.centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    // Base shape with noise-driven irregularity
    const noiseVal = fbm(
      x * config.noiseScale + config.seed,
      y * config.noiseScale,
      4
    );
    const effectiveRadius = config.baseRadius * (1 + config.irregularity * noiseVal);

    // Core void density
    let density = 1 - (dist / effectiveRadius);

    // Tendrils — fingers of dark reaching out
    for (let i = 0; i < config.tendrils; i++) {
      const angleDiff = Math.abs(
        ((angle - tendrilAngles[i] + Math.PI * 3) % (Math.PI * 2)) - Math.PI
      );
      const tendrilInfluence = Math.max(0, 1 - angleDiff / 0.3);
      if (tendrilInfluence > 0) {
        const tendrilReach = effectiveRadius + tendrilLengths[i];
        const tendrilDensity = tendrilInfluence * (1 - dist / tendrilReach);
        const tendrilNoise = simplex2(
          x * 0.03 + config.seed * 3,
          y * 0.03
        ) * 0.3;
        density = Math.max(density, tendrilDensity + tendrilNoise);
      }
    }

    // Bleeding edge effect
    if (density > -config.bleedAmount && density < config.bleedAmount) {
      const edgeNoise = fbm(x * 0.05 + config.seed * 2, y * 0.05, 3);
      density += edgeNoise * config.bleedAmount * 0.5;
    }

    return density;
  };
}

/**
 * Render the void onto a canvas.
 * Uses stippling at the edges for an ink-bleeding effect.
 */
export function drawVoid(
  ctx: CanvasRenderingContext2D,
  config: VoidConfig,
  width: number,
  height: number,
  resolution: number = 2
): void {
  const voidField = createVoidField(config);
  const rng = createRng(config.seed + 500);

  // Render in blocks for performance
  for (let y = 0; y < height; y += resolution) {
    for (let x = 0; x < width; x += resolution) {
      const density = voidField(x, y);

      if (density > 0.15) {
        // Solid black core
        ctx.fillStyle = '#000';
        ctx.fillRect(x, y, resolution, resolution);
      } else if (density > -0.1) {
        // Stippled edge — the bleeding boundary
        const stippleChance = (density + 0.1) / 0.25;
        if (rng() < stippleChance) {
          const dotSize = 0.5 + rng() * 1.5;
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.arc(x + rng() * resolution, y + rng() * resolution, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  // White-on-black details inside the void — sacred geometry fragments,
  // constellations, the "other side" showing through
  drawVoidInterior(ctx, config, voidField, rng);
}

/**
 * Draw white details inside the dark mass — the dual modality.
 * Maps, geometry, and constellations visible within the void.
 */
function drawVoidInterior(
  ctx: CanvasRenderingContext2D,
  config: VoidConfig,
  voidField: (x: number, y: number) => number,
  rng: () => number
): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 0.5;

  // Constellation dots — white points in the darkness
  const numStars = 30 + Math.floor(rng() * 40);
  for (let i = 0; i < numStars; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = rng() * config.baseRadius * 0.7;
    const sx = config.centerX + Math.cos(angle) * dist;
    const sy = config.centerY + Math.sin(angle) * dist;

    if (voidField(sx, sy) > 0.2) {
      const size = 0.5 + rng() * 2;
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fill();

      // Connecting lines between nearby stars
      if (rng() > 0.6 && i > 0) {
        const prevAngle = rng() * Math.PI * 2;
        const prevDist = rng() * config.baseRadius * 0.5;
        const px = config.centerX + Math.cos(prevAngle) * prevDist;
        const py = config.centerY + Math.sin(prevAngle) * prevDist;
        if (voidField(px, py) > 0.2) {
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(px, py);
          ctx.stroke();
        }
      }
    }
  }

  // Sacred geometry fragment — incomplete circle/vesica piscis
  ctx.lineWidth = 0.4;
  ctx.globalAlpha = 0.3;
  const geoX = config.centerX + (rng() - 0.5) * config.baseRadius * 0.5;
  const geoY = config.centerY + (rng() - 0.5) * config.baseRadius * 0.5;
  const geoR = config.baseRadius * (0.15 + rng() * 0.25);

  // Partial circles
  const startAngle = rng() * Math.PI * 2;
  const arcLength = Math.PI * (0.5 + rng() * 1.2);
  ctx.beginPath();
  ctx.arc(geoX, geoY, geoR, startAngle, startAngle + arcLength);
  ctx.stroke();

  // Second circle for vesica piscis
  if (rng() > 0.4) {
    const offset = geoR * 0.7;
    ctx.beginPath();
    ctx.arc(geoX + offset, geoY, geoR, startAngle + Math.PI * 0.3, startAngle + arcLength + Math.PI * 0.3);
    ctx.stroke();
  }

  // Contour lines — topographic feel inside the void
  ctx.lineWidth = 0.3;
  ctx.globalAlpha = 0.2;
  for (let r = config.baseRadius * 0.2; r < config.baseRadius * 0.8; r += config.baseRadius * 0.12) {
    ctx.beginPath();
    let started = false;
    for (let a = 0; a < Math.PI * 2; a += 0.05) {
      const noise = simplex2(a * 2 + config.seed, r * 0.01) * config.baseRadius * 0.1;
      const px = config.centerX + Math.cos(a) * (r + noise);
      const py = config.centerY + Math.sin(a) * (r + noise);
      if (voidField(px, py) > 0.15) {
        if (!started) { ctx.moveTo(px, py); started = true; }
        else ctx.lineTo(px, py);
      } else {
        started = false;
      }
    }
    ctx.stroke();
  }

  ctx.restore();
}
