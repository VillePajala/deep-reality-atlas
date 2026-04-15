/**
 * Deep Reality Atlas — Network/Tree Renderer
 *
 * Generates a TREE/NETWORK structure — nodes connected by lines,
 * growing from center outward, on light paper background.
 * Central trunk/spine with organic branching, hand-drawn feel.
 *
 * Usage: node renderer/render-network.mjs [seed] [output-name]
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'gallery');

function createRng(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function blob(cx, cy, r, rng) {
  const n = 6 + Math.floor(rng() * 4); let d = 'M';
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2; const w = r * (0.6 + rng() * 0.8);
    d += (i === 0 ? '' : ', L') + (cx + Math.cos(a) * w).toFixed(1) + ',' + (cy + Math.sin(a) * w).toFixed(1);
  }
  return d + 'Z';
}

function tline(x1, y1, x2, y2, t, rng) {
  const d2 = Math.hypot(x2 - x1, y2 - y1); const st = Math.max(2, Math.floor(d2 / 10));
  let d = `M${x1.toFixed(1)},${y1.toFixed(1)}`;
  for (let i = 1; i <= st; i++) {
    const f = i / st;
    d += ` L${(x1 + (x2 - x1) * f + (rng() - 0.5) * t).toFixed(1)},${(y1 + (y2 - y1) * f + (rng() - 0.5) * t).toFixed(1)}`;
  }
  return d;
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const FRAGMENTS = [
  'MYSTERIUM', 'SOLVE ET COAGULA', 'PLEROMA', 'GNOSIS', 'BARDO',
  'ŚŪNYATĀ', 'ARCHONTES', 'NIGREDO', 'PNEUMA', '精氣神',
  '鬼宮', 'GHOST PALACE', 'VALIS', 'IT FROM BIT',
  'ERRATA', '§217', 'SPECIMEN', 'STATUS: INCOMPLETE',
];

// ═══════════════════════════════════════════════
// NODE DRAWING — 6 types of small diagrams
// ═══════════════════════════════════════════════

function drawNodeSVG(cx, cy, r, type, rng) {
  let svg = '';
  const op = (0.4 + rng() * 0.5).toFixed(2);

  switch (type) {
    case 0: {
      // Concentric circles (2-4 rings)
      const rings = 2 + Math.floor(rng() * 3);
      for (let i = rings; i >= 1; i--) {
        const rr = r * (i / rings);
        const sw = (0.2 + rng() * 0.4).toFixed(1);
        svg += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${rr.toFixed(1)}" fill="none" stroke="#000" stroke-width="${sw}" opacity="${op}"/>`;
      }
      // Center dot
      svg += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(r * 0.12).toFixed(1)}" fill="#000" opacity="${op}"/>`;
      break;
    }
    case 1: {
      // Circle with cross inside
      const sw = (0.2 + rng() * 0.4).toFixed(1);
      svg += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="none" stroke="#000" stroke-width="${sw}" opacity="${op}"/>`;
      svg += `<line x1="${(cx - r * 0.7).toFixed(1)}" y1="${cy.toFixed(1)}" x2="${(cx + r * 0.7).toFixed(1)}" y2="${cy.toFixed(1)}" stroke="#000" stroke-width="${sw}" opacity="${op}"/>`;
      svg += `<line x1="${cx.toFixed(1)}" y1="${(cy - r * 0.7).toFixed(1)}" x2="${cx.toFixed(1)}" y2="${(cy + r * 0.7).toFixed(1)}" stroke="#000" stroke-width="${sw}" opacity="${op}"/>`;
      break;
    }
    case 2: {
      // Circle with dot at center
      const sw = (0.2 + rng() * 0.5).toFixed(1);
      svg += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="none" stroke="#000" stroke-width="${sw}" opacity="${op}"/>`;
      svg += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(r * 0.2).toFixed(1)}" fill="#000" opacity="${op}"/>`;
      break;
    }
    case 3: {
      // Organic blob with internal dots
      svg += `<path d="${blob(cx, cy, r, rng)}" fill="none" stroke="#000" stroke-width="0.3" opacity="${op}"/>`;
      const nd = 2 + Math.floor(rng() * 4);
      for (let i = 0; i < nd; i++) {
        const dx = cx + (rng() - 0.5) * r * 1.2;
        const dy = cy + (rng() - 0.5) * r * 1.2;
        svg += `<circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="${(0.5 + rng() * 1.5).toFixed(1)}" fill="#000" opacity="${(parseFloat(op) * 0.7).toFixed(2)}"/>`;
      }
      break;
    }
    case 4: {
      // Small radial pattern (lines from center)
      const nRays = 4 + Math.floor(rng() * 6);
      const sw = (0.15 + rng() * 0.3).toFixed(2);
      for (let i = 0; i < nRays; i++) {
        const a = (i / nRays) * Math.PI * 2 + rng() * 0.3;
        const rl = r * (0.5 + rng() * 0.5);
        svg += `<line x1="${cx.toFixed(1)}" y1="${cy.toFixed(1)}" x2="${(cx + Math.cos(a) * rl).toFixed(1)}" y2="${(cy + Math.sin(a) * rl).toFixed(1)}" stroke="#000" stroke-width="${sw}" opacity="${op}"/>`;
      }
      // Center dot
      svg += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(r * 0.15).toFixed(1)}" fill="#000" opacity="${op}"/>`;
      break;
    }
    case 5: {
      // Cluster of tiny dots
      const nDots = 4 + Math.floor(rng() * 8);
      for (let i = 0; i < nDots; i++) {
        const dx = cx + (rng() - 0.5) * r * 1.6;
        const dy = cy + (rng() - 0.5) * r * 1.6;
        const dr = 0.4 + rng() * 1.5;
        svg += `<circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="${dr.toFixed(1)}" fill="#000" opacity="${(parseFloat(op) * (0.4 + rng() * 0.6)).toFixed(2)}"/>`;
      }
      break;
    }
  }

  return svg;
}

// ═══════════════════════════════════════════════
// NETWORK GENERATION
// ═══════════════════════════════════════════════

function generateHTML(seed, width = 3000, height = 3000) {
  const rng = createRng(seed);
  for (let i = 0; i < (seed % 7) + 3; i++) rng(); // decorrelate

  const centerX = width / 2;
  const centerY = height / 2;

  // ─── GENERATE NODES ───
  // Nodes are distributed organically: dense at center, sparser at edges
  const nodeRng = createRng(seed + 100);
  const numNodes = 180 + Math.floor(rng() * 120); // 180-300
  const nodes = [];

  // Central trunk nodes (vertical spine)
  const trunkNodes = 15 + Math.floor(rng() * 10);
  for (let i = 0; i < trunkNodes; i++) {
    const t = (i + 0.5) / trunkNodes;
    const ny = height * 0.08 + t * height * 0.84;
    const nx = centerX + (nodeRng() - 0.5) * 30;
    const r = 8 + nodeRng() * 25; // larger nodes on trunk
    nodes.push({ x: nx, y: ny, r, type: Math.floor(nodeRng() * 6), trunk: true, depth: 0 });
  }

  // Branch nodes — radiate outward from trunk
  for (let i = nodes.length; i < numNodes; i++) {
    // Pick a parent to branch from (bias toward trunk and early nodes)
    const parentIdx = Math.floor(Math.pow(nodeRng(), 1.5) * nodes.length);
    const parent = nodes[parentIdx];

    // Branch angle — primarily horizontal with some vertical spread
    const baseAngle = (nodeRng() > 0.5 ? 0 : Math.PI) + (nodeRng() - 0.5) * 1.2;
    const branchDist = 20 + nodeRng() * 200 * Math.pow(0.85, parent.depth || 0);

    let nx = parent.x + Math.cos(baseAngle) * branchDist;
    let ny = parent.y + Math.sin(baseAngle) * branchDist * 0.6 + (nodeRng() - 0.5) * 40;

    // Keep within bounds with margins
    nx = Math.max(60, Math.min(width - 60, nx));
    ny = Math.max(60, Math.min(height - 60, ny));

    // Distance from center affects size
    const distFromCenter = Math.hypot(nx - centerX, ny - centerY) / (width * 0.5);
    const maxR = Math.max(2, 30 * (1 - distFromCenter * 0.7));
    const r = Math.max(2, 2 + nodeRng() * maxR);

    nodes.push({
      x: nx, y: ny, r,
      type: Math.floor(nodeRng() * 6),
      trunk: false,
      depth: (parent.depth || 0) + 1,
      parentIdx,
    });
  }

  // ─── GENERATE CONNECTIONS ───
  const connRng = createRng(seed + 200);
  const connections = [];

  // Parent-child connections
  for (let i = trunkNodes; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.parentIdx !== undefined) {
      connections.push({ from: node.parentIdx, to: i });
    }
  }

  // Additional proximity-based connections
  const extraConns = 80 + Math.floor(rng() * 120);
  for (let e = 0; e < extraConns; e++) {
    const a = Math.floor(connRng() * nodes.length);
    // Find a nearby node
    let bestDist = Infinity;
    let bestIdx = -1;
    // Sample a few candidates
    for (let s = 0; s < 8; s++) {
      const b = Math.floor(connRng() * nodes.length);
      if (b === a) continue;
      const d = Math.hypot(nodes[a].x - nodes[b].x, nodes[a].y - nodes[b].y);
      if (d < bestDist && d < 300 && d > 10) {
        bestDist = d;
        bestIdx = b;
      }
    }
    if (bestIdx >= 0) {
      connections.push({ from: a, to: bestIdx });
    }
  }

  // ─── BUILD SVG ───
  let svgParts = [];

  // Background: faint ruled lines (notebook paper)
  const bgRng = createRng(seed + 50);
  const ruleSpacing = 18 + bgRng() * 8;
  for (let ly = ruleSpacing; ly < height; ly += ruleSpacing) {
    const op = (0.03 + bgRng() * 0.02).toFixed(3);
    svgParts.push(`<line x1="40" y1="${ly.toFixed(0)}" x2="${(width - 40).toFixed(0)}" y2="${ly.toFixed(0)}" stroke="#888" stroke-width="0.3" opacity="${op}"/>`);
  }
  // Faint vertical margin line
  svgParts.push(`<line x1="100" y1="30" x2="100" y2="${height - 30}" stroke="#c88" stroke-width="0.3" opacity="0.04"/>`);

  // Central trunk — heavier vertical line with wobble
  const trunkRng = createRng(seed + 150);
  for (let seg = 0; seg < 5; seg++) {
    const y1 = height * 0.05 + seg * height * 0.18;
    const y2 = y1 + height * 0.2;
    const x1 = centerX + (trunkRng() - 0.5) * 8;
    const x2 = centerX + (trunkRng() - 0.5) * 8;
    const sw = (0.8 + trunkRng() * 1.2).toFixed(1);
    const op = (0.25 + trunkRng() * 0.2).toFixed(2);
    svgParts.push(`<path d="${tline(x1, y1, x2, y2, 3, trunkRng)}" fill="none" stroke="#000" stroke-width="${sw}" opacity="${op}"/>`);
  }

  // Secondary trunk lines (parallel, thinner)
  for (let p = 0; p < 2; p++) {
    const offset = (p === 0 ? -1 : 1) * (12 + trunkRng() * 15);
    for (let seg = 0; seg < 3; seg++) {
      const y1 = height * 0.1 + seg * height * 0.25 + trunkRng() * height * 0.05;
      const y2 = y1 + height * 0.15 + trunkRng() * height * 0.1;
      const x1 = centerX + offset + (trunkRng() - 0.5) * 5;
      const x2 = centerX + offset + (trunkRng() - 0.5) * 5;
      svgParts.push(`<path d="${tline(x1, y1, x2, y2, 2, trunkRng)}" fill="none" stroke="#000" stroke-width="0.3" opacity="0.15"/>`);
    }
  }

  // Connection lines (drawn before nodes so nodes sit on top)
  const lineRng = createRng(seed + 300);
  for (const conn of connections) {
    const a = nodes[conn.from];
    const b = nodes[conn.to];
    const dist = Math.hypot(a.x - b.x, a.y - b.y);
    const tremor = 1 + lineRng() * 3;
    const sw = (0.2 + lineRng() * 0.6).toFixed(2);
    const op = (0.06 + lineRng() * 0.2 * Math.max(0.2, 1 - dist / 500)).toFixed(2);
    svgParts.push(`<path d="${tline(a.x, a.y, b.x, b.y, tremor, lineRng)}" fill="none" stroke="#000" stroke-width="${sw}" opacity="${op}"/>`);
  }

  // Draw nodes
  const drawRng = createRng(seed + 400);
  for (const node of nodes) {
    svgParts.push(drawNodeSVG(node.x, node.y, node.r, node.type, drawRng));
  }

  // Text labels next to some nodes
  const labelRng = createRng(seed + 500);
  const labelCount = 20 + Math.floor(rng() * 15);
  const labelledNodes = new Set();
  for (let i = 0; i < labelCount; i++) {
    let idx;
    let attempts = 0;
    do {
      idx = Math.floor(labelRng() * nodes.length);
      attempts++;
    } while (labelledNodes.has(idx) && attempts < 20);
    if (labelledNodes.has(idx)) continue;
    labelledNodes.add(idx);

    const node = nodes[idx];
    const frag = FRAGMENTS[Math.floor(labelRng() * FRAGMENTS.length)];
    const slice = frag.slice(0, 3 + Math.floor(labelRng() * (frag.length - 3)));
    const fs = (3 + labelRng() * 5).toFixed(1);
    const op = (0.12 + labelRng() * 0.25).toFixed(2);
    const offsetX = node.r + 3 + labelRng() * 8;
    const offsetY = (labelRng() - 0.5) * 10;
    const side = labelRng() > 0.5 ? 1 : -1;
    const anchor = side > 0 ? 'start' : 'end';
    svgParts.push(
      `<text x="${(node.x + offsetX * side).toFixed(1)}" y="${(node.y + offsetY).toFixed(1)}" font-family="'Courier New',monospace" font-size="${fs}" fill="#000" opacity="${op}" text-anchor="${anchor}">${escapeHtml(slice)}</text>`
    );
  }

  // Tiny scattered dots (dust/noise)
  const dustRng = createRng(seed + 600);
  const numDust = 300 + Math.floor(rng() * 200);
  for (let i = 0; i < numDust; i++) {
    const dx = 50 + dustRng() * (width - 100);
    const dy = 50 + dustRng() * (height - 100);
    const distFromCenter = Math.hypot(dx - centerX, dy - centerY) / (width * 0.5);
    // Denser near center
    if (dustRng() > (1 - distFromCenter * 0.5)) continue;
    const dr = (0.3 + dustRng() * 1.2).toFixed(1);
    const op = (0.04 + dustRng() * 0.1).toFixed(2);
    svgParts.push(`<circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="${dr}" fill="#000" opacity="${op}"/>`);
  }

  // ─── PAGE NOTATION ───
  const sectionNum = (seed % 999) + 1;
  svgParts.push(
    `<text x="30" y="${height - 30}" font-family="'Courier New',monospace" font-size="9" fill="#000" opacity="0.3">§${sectionNum}</text>`
  );
  svgParts.push(
    `<text x="30" y="${height - 16}" font-family="'Courier New',monospace" font-size="5" fill="#000" opacity="0.15">FIELD NOTES — DATE UNKNOWN</text>`
  );

  // Edge numbering along bottom
  for (let i = 0; i < 40; i++) {
    svgParts.push(
      `<text x="${(width * (i + 1) / 42).toFixed(0)}" y="${height - 5}" font-family="'Courier New',monospace" font-size="3" fill="#000" opacity="0.08">${i + 1}</text>`
    );
  }

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${width}px;
    height: ${height}px;
    background: #faf8f5;
    position: relative;
    overflow: hidden;
  }
</style>
</head>
<body>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="position:absolute;left:0;top:0;">
${svgParts.join('\n')}
</svg>
</body>
</html>`;
}

// ═══════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════

const seed = parseInt(process.argv[2]) || Math.floor(Math.random() * 100000);
const name = process.argv[3] || `network-${seed}`;
const outputPath = path.join(OUTPUT_DIR, `${name}.png`);

console.log(`\nRendering Deep Reality Atlas (Network/Tree)...`);
console.log(`  Seed: ${seed}`);
console.log(`  Output: ${outputPath}`);

const start = Date.now();

const html = generateHTML(seed);
const htmlPath = path.join(OUTPUT_DIR, `_temp_network_${seed}.html`);
fs.writeFileSync(htmlPath, html);

console.log(`  HTML generated (${(html.length / 1024).toFixed(0)} KB), launching browser...`);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 3000, height: 3000, deviceScaleFactor: 1 });
await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 120000 });

console.log(`  Page loaded, taking screenshot...`);

await page.screenshot({ path: outputPath, type: 'png', fullPage: false });
await browser.close();

// Clean up temp HTML
fs.unlinkSync(htmlPath);

const stats = fs.statSync(outputPath);
console.log(`  Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Time: ${((Date.now() - start) / 1000).toFixed(1)}s`);
console.log(`  Done.\n`);
