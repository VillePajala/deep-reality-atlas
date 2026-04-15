/**
 * Voronoi tessellation — generates cellular networks.
 * The signature visual motif of Johannes Kamikaze / Deep Reality.
 */

export interface VoronoiSite {
  x: number;
  y: number;
  id: number;
}

export interface VoronoiCell {
  site: VoronoiSite;
  vertices: { x: number; y: number }[];
}

/** Poisson disk sampling — natural point distribution */
export function poissonDisk(
  width: number,
  height: number,
  minDist: number,
  rng: () => number = Math.random,
  maxAttempts: number = 30
): { x: number; y: number }[] {
  const cellSize = minDist / Math.SQRT2;
  const gridW = Math.ceil(width / cellSize);
  const gridH = Math.ceil(height / cellSize);
  const grid: (number | null)[] = new Array(gridW * gridH).fill(null);
  const points: { x: number; y: number }[] = [];
  const active: number[] = [];

  const gridIndex = (x: number, y: number) =>
    Math.floor(x / cellSize) + Math.floor(y / cellSize) * gridW;

  // Seed point
  const p0 = { x: rng() * width, y: rng() * height };
  points.push(p0);
  active.push(0);
  grid[gridIndex(p0.x, p0.y)] = 0;

  while (active.length > 0) {
    const idx = Math.floor(rng() * active.length);
    const point = points[active[idx]];
    let found = false;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const angle = rng() * Math.PI * 2;
      const dist = minDist + rng() * minDist;
      const nx = point.x + Math.cos(angle) * dist;
      const ny = point.y + Math.sin(angle) * dist;

      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;

      const gi = Math.floor(nx / cellSize);
      const gj = Math.floor(ny / cellSize);
      let tooClose = false;

      for (let di = -2; di <= 2 && !tooClose; di++) {
        for (let dj = -2; dj <= 2 && !tooClose; dj++) {
          const ni = gi + di;
          const nj = gj + dj;
          if (ni < 0 || ni >= gridW || nj < 0 || nj >= gridH) continue;
          const neighbor = grid[ni + nj * gridW];
          if (neighbor !== null) {
            const np = points[neighbor];
            const dx = np.x - nx;
            const dy = np.y - ny;
            if (dx * dx + dy * dy < minDist * minDist) tooClose = true;
          }
        }
      }

      if (!tooClose) {
        const newIdx = points.length;
        points.push({ x: nx, y: ny });
        active.push(newIdx);
        grid[gi + gj * gridW] = newIdx;
        found = true;
        break;
      }
    }

    if (!found) active.splice(idx, 1);
  }

  return points;
}

/**
 * Compute Voronoi cells via brute-force for moderate point counts.
 * Returns polygon vertices for each cell by sampling boundary points.
 */
export function computeVoronoiCells(
  sites: VoronoiSite[],
  width: number,
  height: number,
  resolution: number = 2
): VoronoiCell[] {
  // Build a grid mapping each pixel to its nearest site
  const gridW = Math.ceil(width / resolution);
  const gridH = Math.ceil(height / resolution);
  const ownership = new Int32Array(gridW * gridH);

  for (let gy = 0; gy < gridH; gy++) {
    for (let gx = 0; gx < gridW; gx++) {
      const px = gx * resolution;
      const py = gy * resolution;
      let minDist = Infinity;
      let minId = 0;
      for (let i = 0; i < sites.length; i++) {
        const dx = sites[i].x - px;
        const dy = sites[i].y - py;
        const d = dx * dx + dy * dy;
        if (d < minDist) {
          minDist = d;
          minId = i;
        }
      }
      ownership[gx + gy * gridW] = minId;
    }
  }

  // Extract boundary points for each cell
  const cellBoundaries: Map<number, { x: number; y: number }[]> = new Map();
  for (let i = 0; i < sites.length; i++) cellBoundaries.set(i, []);

  for (let gy = 0; gy < gridH - 1; gy++) {
    for (let gx = 0; gx < gridW - 1; gx++) {
      const id = ownership[gx + gy * gridW];
      const right = ownership[(gx + 1) + gy * gridW];
      const below = ownership[gx + (gy + 1) * gridW];
      if (id !== right || id !== below) {
        const px = gx * resolution;
        const py = gy * resolution;
        cellBoundaries.get(id)!.push({ x: px, y: py });
        if (id !== right) cellBoundaries.get(right)!.push({ x: px + resolution, y: py });
        if (id !== below) cellBoundaries.get(below)!.push({ x: px, y: py + resolution });
      }
    }
  }

  // Order boundary points by angle from center
  return sites.map((site, i) => {
    const boundary = cellBoundaries.get(i) || [];
    boundary.sort((a, b) => {
      const aa = Math.atan2(a.y - site.y, a.x - site.x);
      const ba = Math.atan2(b.y - site.y, b.x - site.x);
      return aa - ba;
    });
    return { site, vertices: boundary };
  });
}

/**
 * Draw a single form inside a taxonomy cell.
 * Style is determined by the theme's visual profile.
 */
export function drawCellOrganism(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  seed: number,
  rng: () => number,
  style: string = 'organic'
): void {
  switch (style) {
    case 'geometric': drawGeometricCell(ctx, cx, cy, radius, seed, rng); break;
    case 'linear': drawLinearCell(ctx, cx, cy, radius, seed, rng); break;
    case 'radial': drawRadialCell(ctx, cx, cy, radius, seed, rng); break;
    case 'fragmented': drawFragmentedCell(ctx, cx, cy, radius, seed, rng); break;
    default: drawOrganicCell(ctx, cx, cy, radius, seed, rng); break;
  }
}

/** Original organic style — wobbled circles, organelles, biological */
function drawOrganicCell(
  ctx: CanvasRenderingContext2D, cx: number, cy: number,
  radius: number, seed: number, rng: () => number
): void {
  const numLobes = 5 + Math.floor(rng() * 8);
  const innerRadius = radius * (0.2 + rng() * 0.3);

  ctx.save();
  ctx.translate(cx, cy);

  ctx.beginPath();
  for (let i = 0; i <= 360; i += 2) {
    const angle = (i * Math.PI) / 180;
    const wobble = 1 + 0.3 * Math.sin(angle * numLobes + seed) +
                   0.15 * Math.sin(angle * (numLobes * 2.7) + seed * 3.1);
    const r = radius * 0.7 * wobble;
    if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
    else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
  }
  ctx.closePath();
  ctx.lineWidth = 0.8;
  ctx.stroke();

  const numOrganelles = 2 + Math.floor(rng() * 4);
  for (let o = 0; o < numOrganelles; o++) {
    const oAngle = rng() * Math.PI * 2;
    const oDist = innerRadius + rng() * (radius * 0.3);
    const oRadius = radius * (0.08 + rng() * 0.15);
    ctx.beginPath();
    ctx.ellipse(
      Math.cos(oAngle) * oDist, Math.sin(oAngle) * oDist,
      oRadius, oRadius * (0.6 + rng() * 0.4), rng() * Math.PI, 0, Math.PI * 2
    );
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  ctx.beginPath();
  for (let i = 0; i <= 360; i += 3) {
    const angle = (i * Math.PI) / 180;
    const wobble = 1 + 0.2 * Math.sin(angle * 3 + seed * 7);
    const r = innerRadius * wobble;
    if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
    else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
  }
  ctx.closePath();
  ctx.lineWidth = 0.6;
  ctx.stroke();

  const numDots = 10 + Math.floor(rng() * 30);
  for (let d = 0; d < numDots; d++) {
    const da = rng() * Math.PI * 2;
    const dd = rng() * radius * 0.65;
    ctx.beginPath();
    ctx.arc(Math.cos(da) * dd, Math.sin(da) * dd, 0.3 + rng() * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/** Geometric style — angular subdivisions, grid patterns, pixel-like */
function drawGeometricCell(
  ctx: CanvasRenderingContext2D, cx: number, cy: number,
  radius: number, seed: number, rng: () => number
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineWidth = 0.5;

  const r = radius * 0.7;
  const subdivisions = 2 + Math.floor(rng() * 4);
  const cellW = (r * 2) / subdivisions;

  // Inner grid subdivisions
  for (let row = 0; row < subdivisions; row++) {
    for (let col = 0; col < subdivisions; col++) {
      const sx = -r + col * cellW;
      const sy = -r + row * cellW;
      if (rng() > 0.3) {
        ctx.strokeRect(sx, sy, cellW, cellW);
      }
      // Fill some cells
      if (rng() > 0.7) {
        ctx.globalAlpha = 0.15 + rng() * 0.3;
        ctx.fillRect(sx + 1, sy + 1, cellW - 2, cellW - 2);
        ctx.globalAlpha = 1;
      }
      // Diagonal glitch lines
      if (rng() > 0.8) {
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + cellW, sy + cellW);
        ctx.stroke();
      }
    }
  }

  // Displaced rectangle — glitch offset
  if (rng() > 0.5) {
    const dx = (rng() - 0.5) * r * 0.5;
    const dy = (rng() - 0.5) * r * 0.5;
    const dw = r * (0.3 + rng() * 0.5);
    ctx.globalAlpha = 0.3;
    ctx.strokeRect(dx, dy, dw, dw * (0.5 + rng()));
    ctx.globalAlpha = 1;
  }

  // Small dots at intersections
  for (let i = 0; i < 4 + Math.floor(rng() * 6); i++) {
    ctx.beginPath();
    ctx.arc((rng() - 0.5) * r * 1.4, (rng() - 0.5) * r * 1.4, 0.4 + rng() * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/** Linear style — flowing curves, meridian paths, contour fragments */
function drawLinearCell(
  ctx: CanvasRenderingContext2D, cx: number, cy: number,
  radius: number, seed: number, rng: () => number
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineWidth = 0.6;

  const numCurves = 3 + Math.floor(rng() * 5);
  const r = radius * 0.7;

  for (let c = 0; c < numCurves; c++) {
    ctx.beginPath();
    const startY = -r + (c / numCurves) * r * 2;
    const amplitude = r * (0.1 + rng() * 0.4);
    const freq = 1 + rng() * 3;
    const phase = rng() * Math.PI * 2;

    for (let x = -r; x <= r; x += 1) {
      const y = startY + Math.sin(x * freq / r + phase) * amplitude;
      if (x === -r) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Dots along curves — acupuncture points / stations
  const numDots = 3 + Math.floor(rng() * 5);
  for (let d = 0; d < numDots; d++) {
    const dx = (rng() - 0.5) * r * 1.4;
    const dy = (rng() - 0.5) * r * 1.4;
    ctx.beginPath();
    ctx.arc(dx, dy, 1 + rng() * 1.5, 0, Math.PI * 2);
    ctx.fill();
    // Tiny radiating lines from dot
    if (rng() > 0.5) {
      for (let l = 0; l < 3; l++) {
        const la = rng() * Math.PI * 2;
        const ll = 2 + rng() * 4;
        ctx.beginPath();
        ctx.moveTo(dx, dy);
        ctx.lineTo(dx + Math.cos(la) * ll, dy + Math.sin(la) * ll);
        ctx.stroke();
      }
    }
  }

  ctx.restore();
}

/** Radial style — concentric circles, vessels, retort shapes, planetary */
function drawRadialCell(
  ctx: CanvasRenderingContext2D, cx: number, cy: number,
  radius: number, seed: number, rng: () => number
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineWidth = 0.5;

  const r = radius * 0.7;
  const numRings = 2 + Math.floor(rng() * 5);

  // Concentric rings — some partial
  for (let ring = 0; ring < numRings; ring++) {
    const ringR = r * ((ring + 1) / numRings);
    const startAngle = rng() * Math.PI * 2;
    const arcLen = Math.PI * (0.5 + rng() * 1.5);
    ctx.beginPath();
    ctx.arc(0, 0, ringR, startAngle, startAngle + arcLen);
    ctx.stroke();
  }

  // Center symbol — varies
  const symType = Math.floor(rng() * 4);
  if (symType === 0) {
    // Cross
    const cr = r * 0.25;
    ctx.beginPath();
    ctx.moveTo(-cr, 0); ctx.lineTo(cr, 0);
    ctx.moveTo(0, -cr); ctx.lineTo(0, cr);
    ctx.stroke();
  } else if (symType === 1) {
    // Dot
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.1, 0, Math.PI * 2);
    ctx.fill();
  } else if (symType === 2) {
    // Small triangle (alchemical)
    const tr = r * 0.2;
    ctx.beginPath();
    ctx.moveTo(0, -tr);
    ctx.lineTo(tr * 0.87, tr * 0.5);
    ctx.lineTo(-tr * 0.87, tr * 0.5);
    ctx.closePath();
    ctx.stroke();
  } else {
    // Double circle
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  // Radial lines — like clock hands or compass bearings
  const numLines = 2 + Math.floor(rng() * 4);
  for (let l = 0; l < numLines; l++) {
    const la = rng() * Math.PI * 2;
    const innerR = r * (0.15 + rng() * 0.2);
    const outerR = r * (0.5 + rng() * 0.5);
    ctx.beginPath();
    ctx.moveTo(Math.cos(la) * innerR, Math.sin(la) * innerR);
    ctx.lineTo(Math.cos(la) * outerR, Math.sin(la) * outerR);
    ctx.stroke();
  }

  ctx.restore();
}

/** Fragmented style — broken arcs, shattered geometry, negative space */
function drawFragmentedCell(
  ctx: CanvasRenderingContext2D, cx: number, cy: number,
  radius: number, seed: number, rng: () => number
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineWidth = 0.5;

  const r = radius * 0.7;
  const numFragments = 4 + Math.floor(rng() * 8);

  for (let f = 0; f < numFragments; f++) {
    const fragType = Math.floor(rng() * 4);

    if (fragType === 0) {
      // Broken arc
      const arcR = r * (0.2 + rng() * 0.6);
      const start = rng() * Math.PI * 2;
      const len = Math.PI * (0.2 + rng() * 0.8);
      ctx.beginPath();
      ctx.arc((rng() - 0.5) * r * 0.4, (rng() - 0.5) * r * 0.4, arcR, start, start + len);
      ctx.stroke();
    } else if (fragType === 1) {
      // Short line segment
      const x1 = (rng() - 0.5) * r * 1.2;
      const y1 = (rng() - 0.5) * r * 1.2;
      const angle = rng() * Math.PI;
      const len = r * (0.2 + rng() * 0.5);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 + Math.cos(angle) * len, y1 + Math.sin(angle) * len);
      ctx.stroke();
    } else if (fragType === 2) {
      // Dot cluster
      for (let d = 0; d < 3 + Math.floor(rng() * 4); d++) {
        ctx.beginPath();
        ctx.arc(
          (rng() - 0.5) * r * 1.2,
          (rng() - 0.5) * r * 1.2,
          0.3 + rng() * 0.8, 0, Math.PI * 2
        );
        ctx.fill();
      }
    } else {
      // Partial polygon
      const sides = 3 + Math.floor(rng() * 4);
      const polyR = r * (0.2 + rng() * 0.4);
      const rot = rng() * Math.PI;
      const ox = (rng() - 0.5) * r * 0.5;
      const oy = (rng() - 0.5) * r * 0.5;
      ctx.beginPath();
      const startSide = Math.floor(rng() * sides);
      const drawSides = 1 + Math.floor(rng() * (sides - 1));
      for (let s = startSide; s <= startSide + drawSides; s++) {
        const a = rot + (s / sides) * Math.PI * 2;
        const px = ox + Math.cos(a) * polyR;
        const py = oy + Math.sin(a) * polyR;
        if (s === startSide) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }

  ctx.restore();
}
