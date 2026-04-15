/**
 * Sacred geometry fragments — broken flower of life, incomplete pentagrams,
 * vesica piscis, as if the underlying geometry of reality is showing through.
 */

export function drawFlowerOfLife(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  completeness: number,  // 0-1, how complete the pattern is
  rng: () => number
): void {
  ctx.save();
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.5 + completeness * 0.3;

  const r = radius / 3;
  const centers: { x: number; y: number }[] = [{ x: cx, y: cy }];

  // First ring
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    centers.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    });
  }

  // Second ring
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    centers.push({
      x: cx + Math.cos(angle) * r * 2,
      y: cy + Math.sin(angle) * r * 2,
    });
    const midAngle = ((i + 0.5) * Math.PI) / 3;
    centers.push({
      x: cx + Math.cos(midAngle) * r * Math.sqrt(3),
      y: cy + Math.sin(midAngle) * r * Math.sqrt(3),
    });
  }

  // Draw circles with random incompleteness
  for (const center of centers) {
    if (rng() > completeness) continue;

    const startAngle = rng() * Math.PI * 2;
    const arcLength = Math.PI * 2 * (0.3 + completeness * 0.7);

    ctx.beginPath();
    ctx.arc(center.x, center.y, r, startAngle, startAngle + arcLength);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawVesicaPiscis(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  rotation: number
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.lineWidth = 0.6;

  const offset = radius * 0.5;

  ctx.beginPath();
  ctx.arc(-offset, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(offset, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

export function drawPentagram(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  completeness: number,
  rotation: number
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.lineWidth = 0.5;

  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
    points.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    });
  }

  // Draw the star lines (skip some for incompleteness)
  const connections = [[0, 2], [2, 4], [4, 1], [1, 3], [3, 0]];
  for (const [a, b] of connections) {
    if (Math.random() > completeness) continue;
    ctx.beginPath();
    ctx.moveTo(points[a].x, points[a].y);
    ctx.lineTo(points[b].x, points[b].y);
    ctx.stroke();
  }

  // Outer circle (often partial)
  if (completeness > 0.5) {
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2 * completeness);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draw scattered sacred geometry fragments across a region.
 * These appear as if reality's underlying structure is showing through.
 */
export function drawGeometryFragments(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  density: number,
  seed: number
): void {
  let s = seed;
  const rng = () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };

  const numFragments = Math.floor(density * 8);

  ctx.save();
  ctx.strokeStyle = '#000';
  ctx.globalAlpha = 0.25;

  for (let i = 0; i < numFragments; i++) {
    const fx = x + rng() * width;
    const fy = y + rng() * height;
    const fSize = 10 + rng() * 40;
    const completeness = 0.2 + rng() * 0.5;
    const type = Math.floor(rng() * 4);

    switch (type) {
      case 0:
        drawFlowerOfLife(ctx, fx, fy, fSize, completeness, rng);
        break;
      case 1:
        drawVesicaPiscis(ctx, fx, fy, fSize * 0.5, rng() * Math.PI);
        break;
      case 2:
        drawPentagram(ctx, fx, fy, fSize * 0.4, completeness, rng() * Math.PI);
        break;
      case 3:
        // Concentric circles — compass rose fragment
        for (let r = fSize * 0.2; r < fSize; r += fSize * 0.2) {
          if (rng() > completeness) continue;
          ctx.beginPath();
          const start = rng() * Math.PI;
          ctx.arc(fx, fy, r, start, start + Math.PI * (0.5 + rng()));
          ctx.stroke();
        }
        break;
    }
  }

  ctx.restore();
}

/**
 * Draw the recurring obsessive symbol — appears hundreds of times
 * at every scale, in margins, inside cells, as punctuation.
 * Like a signature, ward, or prayer.
 */
export function drawRecurringSymbol(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  seed: number
): void {
  // The symbol: a circle with a vertical line and a dot above —
  // like a simplified eye/consciousness glyph, or an alchemical symbol
  ctx.save();
  ctx.lineWidth = Math.max(0.3, size * 0.08);
  ctx.strokeStyle = ctx.fillStyle;

  // Outer circle
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.4, 0, Math.PI * 2);
  ctx.stroke();

  // Vertical line through center
  ctx.beginPath();
  ctx.moveTo(cx, cy - size * 0.5);
  ctx.lineTo(cx, cy + size * 0.5);
  ctx.stroke();

  // Dot above
  ctx.beginPath();
  ctx.arc(cx, cy - size * 0.6, size * 0.08, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Scatter the recurring symbol across the entire canvas.
 */
export function scatterRecurringSymbol(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  count: number,
  seed: number
): void {
  let s = seed + 3333;
  const rng = () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };

  ctx.save();
  ctx.strokeStyle = '#000';
  ctx.fillStyle = '#000';

  for (let i = 0; i < count; i++) {
    const x = rng() * width;
    const y = rng() * height;
    const size = 3 + rng() * 8;
    ctx.globalAlpha = 0.1 + rng() * 0.3;
    drawRecurringSymbol(ctx, x, y, size, seed);
  }

  ctx.restore();
}
