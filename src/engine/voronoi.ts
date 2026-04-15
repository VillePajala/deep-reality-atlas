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
 * Draw a single organic form inside a cell — the "specimen" in the taxonomy.
 * Each cell contains a slightly different organism.
 */
export function drawCellOrganism(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  seed: number,
  rng: () => number
): void {
  const numLobes = 5 + Math.floor(rng() * 8);
  const innerRadius = radius * (0.2 + rng() * 0.3);

  ctx.save();
  ctx.translate(cx, cy);

  // Outer membrane — organic, irregular
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

  // Inner organelles
  const numOrganelles = 2 + Math.floor(rng() * 4);
  for (let o = 0; o < numOrganelles; o++) {
    const oAngle = rng() * Math.PI * 2;
    const oDist = innerRadius + rng() * (radius * 0.3);
    const oRadius = radius * (0.08 + rng() * 0.15);
    const ox = Math.cos(oAngle) * oDist;
    const oy = Math.sin(oAngle) * oDist;

    ctx.beginPath();
    ctx.ellipse(ox, oy, oRadius, oRadius * (0.6 + rng() * 0.4), rng() * Math.PI, 0, Math.PI * 2);
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // Nucleus
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

  // Stippling dots inside membrane
  const numDots = 10 + Math.floor(rng() * 30);
  for (let d = 0; d < numDots; d++) {
    const da = rng() * Math.PI * 2;
    const dd = rng() * radius * 0.65;
    const dotSize = 0.3 + rng() * 0.8;
    ctx.beginPath();
    ctx.arc(Math.cos(da) * dd, Math.sin(da) * dd, dotSize, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
