/**
 * Dense Detail Systems — the layers that make a page feel obsessive.
 * Hatching, micro-annotations, ruled lines, measurement marks,
 * connection diagrams, tiny numbering systems, dense fill patterns.
 *
 * These are what separate "a quick sketch" from "someone spent 2000 hours on this."
 */

function createRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Cross-hatching fill — dense parallel lines at two angles.
 * Creates the look of meticulous hand-drawn shading.
 */
export function drawHatchingField(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  angle: number,
  spacing: number,
  opacity: number,
  seed: number,
  crossHatch: boolean = true
): void {
  const rng = createRng(seed);
  ctx.save();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 0.3 + rng() * 0.3;
  ctx.globalAlpha = opacity;

  // First direction
  const cos1 = Math.cos(angle);
  const sin1 = Math.sin(angle);
  const diagonal = Math.sqrt(w * w + h * h);
  const numLines = Math.ceil(diagonal / spacing);

  for (let i = -numLines; i <= numLines; i++) {
    const offset = i * spacing + (rng() - 0.5) * spacing * 0.15; // slight wobble
    const x1 = x + w / 2 + cos1 * diagonal + sin1 * offset;
    const y1 = y + h / 2 + sin1 * diagonal - cos1 * offset;
    const x2 = x + w / 2 - cos1 * diagonal + sin1 * offset;
    const y2 = y + h / 2 - sin1 * diagonal - cos1 * offset;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Second direction (cross-hatch)
  if (crossHatch) {
    const angle2 = angle + Math.PI * (0.3 + rng() * 0.4);
    const cos2 = Math.cos(angle2);
    const sin2 = Math.sin(angle2);
    ctx.lineWidth = 0.2 + rng() * 0.2;
    ctx.globalAlpha = opacity * 0.6;

    for (let i = -numLines; i <= numLines; i++) {
      const offset = i * spacing * 1.3 + (rng() - 0.5) * spacing * 0.2;
      const x1 = x + w / 2 + cos2 * diagonal + sin2 * offset;
      const y1 = y + h / 2 + sin2 * diagonal - cos2 * offset;
      const x2 = x + w / 2 - cos2 * diagonal + sin2 * offset;
      const y2 = y + h / 2 - sin2 * diagonal - cos2 * offset;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Micro-annotations — tiny numbered labels, arrows, brackets scattered everywhere.
 * The obsessive labeling of someone who needs to classify everything.
 */
export function drawMicroAnnotations(
  ctx: CanvasRenderingContext2D,
  width: number, height: number,
  count: number,
  seed: number,
  fragments: string[]
): void {
  const rng = createRng(seed);

  ctx.save();
  ctx.fillStyle = '#000';
  ctx.strokeStyle = '#000';

  for (let i = 0; i < count; i++) {
    const x = width * (0.03 + rng() * 0.94);
    const y = height * (0.03 + rng() * 0.94);
    const type = Math.floor(rng() * 7);

    if (type === 0) {
      // Tiny numbered circle with leader line
      ctx.globalAlpha = 0.3 + rng() * 0.3;
      ctx.lineWidth = 0.3;
      const num = Math.floor(rng() * 999) + 1;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = '3px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${num}`, x, y);
      // Leader line
      const la = rng() * Math.PI * 2;
      const ll = 8 + rng() * 20;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(la) * 3, y + Math.sin(la) * 3);
      ctx.lineTo(x + Math.cos(la) * ll, y + Math.sin(la) * ll);
      ctx.stroke();
    } else if (type === 1) {
      // Bracket with label
      ctx.globalAlpha = 0.25 + rng() * 0.2;
      ctx.lineWidth = 0.3;
      const bh = 10 + rng() * 30;
      const dir = rng() > 0.5 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + dir * 4, y);
      ctx.lineTo(x + dir * 4, y + bh);
      ctx.lineTo(x, y + bh);
      ctx.stroke();
      ctx.font = '3.5px monospace';
      ctx.textAlign = dir > 0 ? 'left' : 'right';
      ctx.fillText(`§${Math.floor(rng() * 99)}`, x + dir * 6, y + bh / 2);
    } else if (type === 2) {
      // Tiny arrow pointing at something
      ctx.globalAlpha = 0.3 + rng() * 0.25;
      ctx.lineWidth = 0.4;
      const aa = rng() * Math.PI * 2;
      const al = 10 + rng() * 25;
      const ax = x + Math.cos(aa) * al;
      const ay = y + Math.sin(aa) * al;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(ax, ay);
      ctx.stroke();
      // Arrowhead
      const ha = aa + Math.PI;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax + Math.cos(ha + 0.4) * 4, ay + Math.sin(ha + 0.4) * 4);
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax + Math.cos(ha - 0.4) * 4, ay + Math.sin(ha - 0.4) * 4);
      ctx.stroke();
    } else if (type === 3) {
      // Dimension line with measurement
      ctx.globalAlpha = 0.2 + rng() * 0.15;
      ctx.lineWidth = 0.25;
      const dl = 20 + rng() * 50;
      const da = rng() * Math.PI;
      const dx = x + Math.cos(da) * dl;
      const dy = y + Math.sin(da) * dl;
      // Line with end ticks
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(dx, dy);
      ctx.stroke();
      const perp = da + Math.PI / 2;
      for (const [px, py] of [[x, y], [dx, dy]]) {
        ctx.beginPath();
        ctx.moveTo(px + Math.cos(perp) * 2, py + Math.sin(perp) * 2);
        ctx.lineTo(px - Math.cos(perp) * 2, py - Math.sin(perp) * 2);
        ctx.stroke();
      }
      ctx.font = '3px monospace';
      ctx.textAlign = 'center';
      const mx = (x + dx) / 2;
      const my = (y + dy) / 2;
      ctx.fillText(`${(rng() * 100).toFixed(1)}`, mx, my - 2);
    } else if (type === 4) {
      // Corpus fragment as tiny annotation
      ctx.globalAlpha = 0.25 + rng() * 0.3;
      const frag = fragments[Math.floor(rng() * fragments.length)] || 'SPECIMEN';
      const size = 3 + rng() * 3;
      ctx.font = `${size}px monospace`;
      ctx.textAlign = 'left';
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rng() - 0.5) * 0.3);
      ctx.fillText(frag.slice(0, 15), 0, 0);
      ctx.restore();
    } else if (type === 5) {
      // Small cross/registration mark
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = 0.2;
      const cs = 2 + rng() * 3;
      ctx.beginPath();
      ctx.moveTo(x - cs, y); ctx.lineTo(x + cs, y);
      ctx.moveTo(x, y - cs); ctx.lineTo(x, y + cs);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, cs * 0.6, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Dotted connection line to another point
      ctx.globalAlpha = 0.15 + rng() * 0.15;
      ctx.lineWidth = 0.3;
      ctx.setLineDash([1, 2]);
      const tx = width * (0.05 + rng() * 0.9);
      const ty = height * (0.05 + rng() * 0.9);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  ctx.restore();
}

/**
 * Ruled lines — like graph paper or notebook lines visible underneath.
 * Creates the feeling of a systematic document.
 */
export function drawRuledLines(
  ctx: CanvasRenderingContext2D,
  width: number, height: number,
  seed: number
): void {
  const rng = createRng(seed);
  ctx.save();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 0.15;
  ctx.globalAlpha = 0.04 + rng() * 0.04;

  const lineType = Math.floor(rng() * 3);

  if (lineType === 0) {
    // Horizontal ruled lines — notebook style
    const spacing = 8 + rng() * 12;
    const startY = height * (0.05 + rng() * 0.1);
    for (let y = startY; y < height * 0.95; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(width * 0.03, y);
      ctx.lineTo(width * 0.97, y);
      ctx.stroke();
    }
  } else if (lineType === 1) {
    // Grid — graph paper
    const spacing = 12 + rng() * 15;
    for (let x = width * 0.03; x < width * 0.97; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, height * 0.03);
      ctx.lineTo(x, height * 0.97);
      ctx.stroke();
    }
    for (let y = height * 0.03; y < height * 0.97; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(width * 0.03, y);
      ctx.lineTo(width * 0.97, y);
      ctx.stroke();
    }
  } else {
    // Radial lines from a center — like a compass or clock
    const cx = width * (0.3 + rng() * 0.4);
    const cy = height * (0.3 + rng() * 0.4);
    const numRays = 12 + Math.floor(rng() * 24);
    const maxR = Math.max(width, height);
    for (let i = 0; i < numRays; i++) {
      const angle = (i / numRays) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
      ctx.stroke();
    }
    // Concentric circles
    for (let r = 30; r < maxR; r += 30 + rng() * 20) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Dense fill region — an area packed with tiny marks creating a textured mass.
 * Like someone compulsively filled every empty space.
 */
export function drawDenseFill(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  radius: number,
  seed: number,
  fillType: 'dots' | 'lines' | 'crosses' | 'mixed'
): void {
  const rng = createRng(seed);
  ctx.save();
  ctx.fillStyle = '#000';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 0.2;

  const density = 200 + Math.floor(rng() * 400);

  for (let i = 0; i < density; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = rng() * radius;
    const px = cx + Math.cos(angle) * dist;
    const py = cy + Math.sin(angle) * dist;

    // Fade toward edges
    const fade = 1 - (dist / radius);
    ctx.globalAlpha = fade * (0.1 + rng() * 0.25);

    const type = fillType === 'mixed' ? (['dots', 'lines', 'crosses'] as const)[Math.floor(rng() * 3)] : fillType;

    if (type === 'dots') {
      ctx.beginPath();
      ctx.arc(px, py, 0.2 + rng() * 0.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'lines') {
      const la = rng() * Math.PI;
      const ll = 1 + rng() * 3;
      ctx.beginPath();
      ctx.moveTo(px - Math.cos(la) * ll, py - Math.sin(la) * ll);
      ctx.lineTo(px + Math.cos(la) * ll, py + Math.sin(la) * ll);
      ctx.stroke();
    } else {
      const cs = 0.5 + rng() * 1;
      ctx.beginPath();
      ctx.moveTo(px - cs, py); ctx.lineTo(px + cs, py);
      ctx.moveTo(px, py - cs); ctx.lineTo(px, py + cs);
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Obsessive numbering — tiny sequential numbers placed along edges and paths.
 * Like someone counting everything.
 */
export function drawObsessiveNumbering(
  ctx: CanvasRenderingContext2D,
  width: number, height: number,
  seed: number
): void {
  const rng = createRng(seed);
  ctx.save();
  ctx.fillStyle = '#000';
  ctx.font = '3px monospace';
  ctx.textAlign = 'center';

  // Numbers along one edge
  const edge = Math.floor(rng() * 4);
  const numCount = 30 + Math.floor(rng() * 60);
  ctx.globalAlpha = 0.15 + rng() * 0.15;

  for (let i = 0; i < numCount; i++) {
    const t = (i + 1) / (numCount + 1);
    let nx: number, ny: number;
    if (edge === 0) { nx = width * t; ny = height * 0.015; }
    else if (edge === 1) { nx = width * t; ny = height * 0.985; }
    else if (edge === 2) { nx = width * 0.015; ny = height * t; }
    else { nx = width * 0.985; ny = height * t; }

    ctx.fillText(`${i + 1}`, nx, ny);
  }

  // Numbers along a diagonal or curve
  if (rng() > 0.4) {
    ctx.globalAlpha = 0.1 + rng() * 0.1;
    const startX = width * rng();
    const startY = height * rng();
    const angle = rng() * Math.PI;
    for (let i = 0; i < 20 + Math.floor(rng() * 30); i++) {
      const dist = i * (5 + rng() * 3);
      const nx = startX + Math.cos(angle) * dist;
      const ny = startY + Math.sin(angle) * dist;
      if (nx < 0 || nx > width || ny < 0 || ny > height) break;
      ctx.fillText(`${i + 1}`, nx, ny);
    }
  }

  ctx.restore();
}

/**
 * Connection web — a network of dotted lines connecting distant points.
 * Like a conspiracy board with strings between pins.
 */
export function drawConnectionWeb(
  ctx: CanvasRenderingContext2D,
  width: number, height: number,
  numNodes: number,
  seed: number
): void {
  const rng = createRng(seed);

  // Generate nodes
  const nodes: { x: number; y: number }[] = [];
  for (let i = 0; i < numNodes; i++) {
    nodes.push({
      x: width * (0.05 + rng() * 0.9),
      y: height * (0.05 + rng() * 0.9),
    });
  }

  ctx.save();
  ctx.strokeStyle = '#000';
  ctx.fillStyle = '#000';

  // Draw nodes as small dots or circles
  for (const node of nodes) {
    ctx.globalAlpha = 0.2 + rng() * 0.2;
    ctx.lineWidth = 0.3;
    if (rng() > 0.5) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 1.5 + rng() * 2, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw connections — not all nodes, just some
  ctx.lineWidth = 0.2;
  ctx.setLineDash([1, 3]);
  for (let i = 0; i < nodes.length; i++) {
    const numConnections = 1 + Math.floor(rng() * 3);
    for (let c = 0; c < numConnections; c++) {
      const j = Math.floor(rng() * nodes.length);
      if (j === i) continue;
      ctx.globalAlpha = 0.08 + rng() * 0.1;
      ctx.beginPath();
      // Curved connection
      const mx = (nodes[i].x + nodes[j].x) / 2 + (rng() - 0.5) * 40;
      const my = (nodes[i].y + nodes[j].y) / 2 + (rng() - 0.5) * 40;
      ctx.moveTo(nodes[i].x, nodes[i].y);
      ctx.quadraticCurveTo(mx, my, nodes[j].x, nodes[j].y);
      ctx.stroke();
    }
  }
  ctx.setLineDash([]);

  ctx.restore();
}
