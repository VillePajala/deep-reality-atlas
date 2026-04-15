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

// ═══════════════════════════════════════════════════════
// NEW GEOMETRY SHAPES — theme-specific
// ═══════════════════════════════════════════════════════

export function drawOuroboros(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, rng: () => number
): void {
  ctx.save();
  ctx.lineWidth = 0.6;
  // Serpent body as thick arc
  const gap = 0.4 + rng() * 0.3; // mouth gap
  ctx.beginPath();
  ctx.arc(cx, cy, radius, gap, Math.PI * 2);
  ctx.stroke();
  // Head (triangle at gap)
  const headAngle = gap;
  const hx = cx + Math.cos(headAngle) * radius;
  const hy = cy + Math.sin(headAngle) * radius;
  ctx.beginPath();
  ctx.moveTo(hx, hy);
  ctx.lineTo(hx + Math.cos(headAngle + 0.3) * radius * 0.2, hy + Math.sin(headAngle + 0.3) * radius * 0.2);
  ctx.lineTo(hx + Math.cos(headAngle - 0.3) * radius * 0.2, hy + Math.sin(headAngle - 0.3) * radius * 0.2);
  ctx.closePath();
  ctx.fill();
  // Eye dot
  ctx.beginPath();
  ctx.arc(hx + Math.cos(headAngle + 0.5) * radius * 0.15, hy + Math.sin(headAngle + 0.5) * radius * 0.15, radius * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawWavePattern(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, rng: () => number
): void {
  ctx.save();
  ctx.lineWidth = 0.5;
  const numWaves = 3 + Math.floor(rng() * 5);
  for (let w = 0; w < numWaves; w++) {
    const waveY = cy - radius + (w / numWaves) * radius * 2;
    const amplitude = radius * (0.05 + rng() * 0.15);
    const freq = 2 + rng() * 6;
    ctx.beginPath();
    for (let x = cx - radius; x <= cx + radius; x += 1) {
      const y = waveY + Math.sin((x - cx) * freq / radius + w * 1.5) * amplitude;
      if (x === cx - radius) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

export function drawGridGlitch(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, rng: () => number
): void {
  ctx.save();
  ctx.lineWidth = 0.4;
  const r = radius;
  const cells = 3 + Math.floor(rng() * 4);
  const cellW = (r * 2) / cells;
  for (let row = 0; row < cells; row++) {
    for (let col = 0; col < cells; col++) {
      if (rng() > 0.6) continue;
      const ox = (rng() - 0.5) * cellW * 0.3; // glitch offset
      const oy = (rng() - 0.5) * cellW * 0.3;
      ctx.strokeRect(cx - r + col * cellW + ox, cy - r + row * cellW + oy, cellW, cellW);
    }
  }
  // Random displacement lines
  for (let i = 0; i < 2 + Math.floor(rng() * 3); i++) {
    const ly = cy - r + rng() * r * 2;
    ctx.beginPath();
    ctx.moveTo(cx - r, ly);
    ctx.lineTo(cx + r, ly + (rng() - 0.5) * cellW);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawCompassRose(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, rng: () => number
): void {
  ctx.save();
  ctx.lineWidth = 0.5;
  const numLines = 4 + Math.floor(rng() * 8);
  for (let i = 0; i < numLines; i++) {
    const angle = (i / numLines) * Math.PI * 2 + rng() * 0.1;
    const innerR = radius * (0.05 + rng() * 0.1);
    const outerR = radius * (0.5 + rng() * 0.5);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
    ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
    ctx.stroke();
  }
  // Center circle
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.08, 0, Math.PI * 2);
  ctx.fill();
  // Outer ring (partial)
  ctx.beginPath();
  const start = rng() * Math.PI;
  ctx.arc(cx, cy, radius * 0.9, start, start + Math.PI * (1 + rng()));
  ctx.stroke();
  ctx.restore();
}

export function drawSpiral(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, rng: () => number
): void {
  ctx.save();
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  const turns = 2 + rng() * 4;
  const totalSteps = Math.floor(turns * 60);
  for (let i = 0; i < totalSteps; i++) {
    const t = i / totalSteps;
    const angle = t * turns * Math.PI * 2;
    const r = t * radius;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

export function drawConcentricSpheres(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, rng: () => number
): void {
  ctx.save();
  ctx.lineWidth = 0.4;
  const numRings = 3 + Math.floor(rng() * 5);
  for (let i = 0; i < numRings; i++) {
    const r = radius * ((i + 1) / numRings);
    const gap = rng() * Math.PI * 0.5;
    const start = rng() * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, start + gap, start + Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawMeridianCurve(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, rng: () => number
): void {
  ctx.save();
  ctx.lineWidth = 0.6;
  // S-curve
  ctx.beginPath();
  ctx.moveTo(cx, cy - radius);
  ctx.bezierCurveTo(
    cx + radius * (0.5 + rng() * 0.5), cy - radius * 0.3,
    cx - radius * (0.5 + rng() * 0.5), cy + radius * 0.3,
    cx, cy + radius
  );
  ctx.stroke();
  // Points along the curve
  const numPoints = 3 + Math.floor(rng() * 5);
  for (let i = 0; i < numPoints; i++) {
    const t = (i + 1) / (numPoints + 1);
    const py = cy - radius + t * radius * 2;
    const px = cx + Math.sin(t * Math.PI) * radius * 0.3 * (rng() > 0.5 ? 1 : -1);
    ctx.beginPath();
    ctx.arc(px, py, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawHourglass(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, rng: () => number
): void {
  ctx.save();
  ctx.lineWidth = 0.5;
  const r = radius * 0.8;
  // Top triangle
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.6, cy - r);
  ctx.lineTo(cx + r * 0.6, cy - r);
  ctx.lineTo(cx, cy);
  ctx.closePath();
  ctx.stroke();
  // Bottom triangle
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx - r * 0.6, cy + r);
  ctx.lineTo(cx + r * 0.6, cy + r);
  ctx.closePath();
  ctx.stroke();
  // Center dot
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawPlanetarySymbol(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, rng: () => number
): void {
  ctx.save();
  ctx.lineWidth = 0.6;
  const r = radius * 0.5;
  const sym = Math.floor(rng() * 5);
  if (sym === 0) {
    // Sun — circle with dot
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.12, 0, Math.PI * 2); ctx.fill();
  } else if (sym === 1) {
    // Moon — crescent
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + r * 0.35, cy, r * 0.8, 0, Math.PI * 2);
    ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.arc(cx + r * 0.35, cy, r * 0.8, 0, Math.PI * 2); ctx.stroke();
  } else if (sym === 2) {
    // Mercury — circle + cross below + horns above
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy + r * 0.5); ctx.lineTo(cx, cy + r); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - r * 0.3, cy + r * 0.75); ctx.lineTo(cx + r * 0.3, cy + r * 0.75); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy - r * 0.5, r * 0.35, Math.PI, 0); ctx.stroke();
  } else if (sym === 3) {
    // Saturn — cross with hook
    ctx.beginPath(); ctx.moveTo(cx - r * 0.4, cy - r * 0.3); ctx.lineTo(cx + r * 0.4, cy - r * 0.3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r * 0.5); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + r * 0.3, cy + r * 0.5, r * 0.3, -Math.PI * 0.5, Math.PI); ctx.stroke();
  } else {
    // Venus — circle with cross below
    ctx.beginPath(); ctx.arc(cx, cy - r * 0.2, r * 0.4, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy + r * 0.2); ctx.lineTo(cx, cy + r); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - r * 0.3, cy + r * 0.6); ctx.lineTo(cx + r * 0.3, cy + r * 0.6); ctx.stroke();
  }
  ctx.restore();
}

/**
 * Draw scattered geometry fragments — now theme-aware via weighted shape list.
 */
export function drawGeometryFragments(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  density: number,
  seed: number,
  shapeWeights?: Array<{ type: string; weight: number }>
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

  // Build weighted selection array
  const shapes = shapeWeights || [
    { type: 'flower-of-life', weight: 1 },
    { type: 'vesica', weight: 1 },
    { type: 'pentagram', weight: 1 },
    { type: 'concentric', weight: 1 },
  ];
  const totalWeight = shapes.reduce((sum, s) => sum + s.weight, 0);

  for (let i = 0; i < numFragments; i++) {
    const fx = x + rng() * width;
    const fy = y + rng() * height;
    const fSize = 10 + rng() * 40;
    const completeness = 0.2 + rng() * 0.5;

    // Weighted random selection
    let roll = rng() * totalWeight;
    let selectedType = shapes[0].type;
    for (const shape of shapes) {
      roll -= shape.weight;
      if (roll <= 0) { selectedType = shape.type; break; }
    }

    switch (selectedType) {
      case 'flower-of-life': drawFlowerOfLife(ctx, fx, fy, fSize, completeness, rng); break;
      case 'vesica': drawVesicaPiscis(ctx, fx, fy, fSize * 0.5, rng() * Math.PI); break;
      case 'pentagram': drawPentagram(ctx, fx, fy, fSize * 0.4, completeness, rng() * Math.PI); break;
      case 'ouroboros': drawOuroboros(ctx, fx, fy, fSize * 0.4, rng); break;
      case 'wave': drawWavePattern(ctx, fx, fy, fSize, rng); break;
      case 'grid-glitch': drawGridGlitch(ctx, fx, fy, fSize, rng); break;
      case 'compass-rose': drawCompassRose(ctx, fx, fy, fSize * 0.5, rng); break;
      case 'spiral': drawSpiral(ctx, fx, fy, fSize * 0.4, rng); break;
      case 'concentric-spheres': drawConcentricSpheres(ctx, fx, fy, fSize * 0.5, rng); break;
      case 'meridian-curve': drawMeridianCurve(ctx, fx, fy, fSize * 0.5, rng); break;
      case 'hourglass': drawHourglass(ctx, fx, fy, fSize * 0.4, rng); break;
      case 'planetary': drawPlanetarySymbol(ctx, fx, fy, fSize * 0.4, rng); break;
      default:
        // Concentric circles fallback
        for (let r = fSize * 0.2; r < fSize; r += fSize * 0.2) {
          if (rng() > completeness) continue;
          ctx.beginPath();
          const start = rng() * Math.PI;
          ctx.arc(fx, fy, r, start, start + Math.PI * (0.5 + rng()));
          ctx.stroke();
        }
    }
  }

  ctx.restore();
}

/**
 * Draw the recurring obsessive symbol — theme-specific.
 */
export function drawRecurringSymbol(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  seed: number,
  symbolType: string = 'default'
): void {
  ctx.save();
  ctx.lineWidth = Math.max(0.3, size * 0.08);
  ctx.strokeStyle = ctx.fillStyle;

  switch (symbolType) {
    case 'ouroboros': {
      // Tiny circle with a tail
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.3, 0.3, Math.PI * 2);
      ctx.stroke();
      const hx = cx + Math.cos(0.3) * size * 0.3;
      const hy = cy + Math.sin(0.3) * size * 0.3;
      ctx.beginPath();
      ctx.arc(hx, hy, size * 0.06, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'eye': {
      // Almond eye with pupil
      ctx.beginPath();
      ctx.moveTo(cx - size * 0.4, cy);
      ctx.quadraticCurveTo(cx, cy - size * 0.3, cx + size * 0.4, cy);
      ctx.quadraticCurveTo(cx, cy + size * 0.3, cx - size * 0.4, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.1, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'meridian': {
      // Dot with radiating lines
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.12, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * size * 0.15, cy + Math.sin(a) * size * 0.15);
        ctx.lineTo(cx + Math.cos(a) * size * 0.4, cy + Math.sin(a) * size * 0.4);
        ctx.stroke();
      }
      break;
    }
    case 'binary': {
      // 0 and 1
      ctx.font = `${size * 0.5}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(seed % 2 === 0 ? '0' : '1', cx, cy);
      break;
    }
    case 'compass': {
      // Small cross with cardinal points
      const cr = size * 0.35;
      ctx.beginPath();
      ctx.moveTo(cx, cy - cr); ctx.lineTo(cx, cy + cr);
      ctx.moveTo(cx - cr, cy); ctx.lineTo(cx + cr, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.06, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'wave': {
      // Small sine wave
      ctx.beginPath();
      for (let x = -size * 0.4; x <= size * 0.4; x += 1) {
        const y = Math.sin(x * 4 / size) * size * 0.15;
        if (x === -size * 0.4) ctx.moveTo(cx + x, cy + y);
        else ctx.lineTo(cx + x, cy + y);
      }
      ctx.stroke();
      break;
    }
    case 'spiral': {
      // Tiny spiral
      ctx.beginPath();
      for (let i = 0; i < 40; i++) {
        const t = i / 40;
        const angle = t * Math.PI * 4;
        const r = t * size * 0.35;
        if (i === 0) ctx.moveTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
        else ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      }
      ctx.stroke();
      break;
    }
    case 'rune': {
      // Angular glyph — invented rune
      const r = size * 0.35;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx, cy + r);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.3);
      ctx.lineTo(cx + r * 0.6, cy - r * 0.7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy + r * 0.2);
      ctx.lineTo(cx + r * 0.5, cy);
      ctx.stroke();
      break;
    }
    default: {
      // Original: circle + vertical line + dot
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - size * 0.5);
      ctx.lineTo(cx, cy + size * 0.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy - size * 0.6, size * 0.08, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * Scatter the recurring symbol across the entire canvas — now theme-aware.
 */
export function scatterRecurringSymbol(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  count: number,
  seed: number,
  symbolType: string = 'default'
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
    drawRecurringSymbol(ctx, x, y, size, seed + i, symbolType);
  }

  ctx.restore();
}
