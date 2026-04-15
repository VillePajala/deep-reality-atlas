/**
 * Deep Reality Atlas — Offline Renderer v7
 * Matching the reference image as closely as possible:
 * - Grid UPPER-LEFT with visible row structure (legible characters)
 * - Scatter erupts RIGHTWARD and UPWARD from grid edge
 * - Dark horizon band CENTER-RIGHT
 * - Vertical columns hanging from BOTTOM of grid
 * - Thin connection lines radiating from scatter zone
 * - PURE WHITE background, lots of clean white space
 * - No secondary grid cluttering the composition
 */

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'gallery');

function createRng(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ΣΓΨΩΠαβγδεθλμπφχψ精氣神鬼道空無心穴經絡∞⊕◉⊗∅§†‡※+-=÷×><[]{}()'.split('');

// ═══════════════════════════════════════════════
// TEXT GRID — visible rows of characters
// ═══════════════════════════════════════════════

function drawTextGrid(ctx, x, y, w, h, charSize, seed) {
  const rng = createRng(seed);
  const charWidth = charSize * 0.55;
  const lineHeight = charSize * 1.8; // wider row spacing — visible row structure
  const cols = Math.floor(w / charWidth);
  const rows = Math.floor(h / lineHeight);

  ctx.save();
  ctx.fillStyle = '#000';
  ctx.font = `${charSize}px monospace`;
  ctx.textBaseline = 'top';

  for (let row = 0; row < rows; row++) {
    const rowY = y + row * lineHeight;
    const normRow = row / rows;

    // Row integrity — rows near bottom-right dissolve
    for (let col = 0; col < cols; col++) {
      const charX = x + col * charWidth;
      const normCol = col / cols;

      // Dissolution: increases toward RIGHT edge and BOTTOM
      const dissolve = normCol * 0.7 + normRow * 0.3;

      // Clean core (upper-left) → dissolving edge (lower-right)
      if (dissolve > 0.55) {
        // Increasing probability of skipping
        if (rng() < (dissolve - 0.55) * 2.5) continue;
      }

      // Scatter displacement at edges — characters drift rightward
      let dx = 0, dy = 0;
      if (dissolve > 0.4) {
        const drift = Math.pow(dissolve - 0.4, 1.5) * 80;
        dx = rng() * drift + drift * 0.3; // bias rightward
        dy = (rng() - 0.5) * drift * 0.6;
      }

      // Opacity — nearly solid in core, fading at edges
      const coreBoost = Math.max(0, 1 - dissolve * 1.5);
      ctx.globalAlpha = Math.min(1, (0.6 + coreBoost * 0.4) * (0.8 + rng() * 0.2));

      const glyph = GLYPHS[Math.floor(rng() * GLYPHS.length)];
      ctx.fillText(glyph, charX + dx, rowY + dy);
    }

    // Faint horizontal rule under every ~5th row
    if (row % 5 === 0 && normRow < 0.7) {
      ctx.globalAlpha = 0.06;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 0.15;
      ctx.beginPath();
      ctx.moveTo(x, rowY + lineHeight);
      ctx.lineTo(x + w * (1 - normRow * 0.5), rowY + lineHeight);
      ctx.stroke();
    }
  }

  ctx.restore();
  return { cols, rows, charWidth, lineHeight };
}

// ═══════════════════════════════════════════════
// DIRECTIONAL SCATTER — particles erupting from grid edge
// ═══════════════════════════════════════════════

function drawScatter(ctx, originX, originY, numParticles, maxDist, seed) {
  const rng = createRng(seed);

  ctx.save();
  ctx.fillStyle = '#000';
  ctx.strokeStyle = '#000';

  for (let i = 0; i < numParticles; i++) {
    // Direction: primarily RIGHTWARD and slightly upward
    const baseAngle = -0.3 + (rng() - 0.5) * 1.8; // centered around ~-0.3 rad (right-and-slightly-up)
    // Add more lateral spread for distant particles
    const dist = Math.pow(rng(), 0.55) * maxDist;
    const distNorm = dist / maxDist;

    const angle = baseAngle + (rng() - 0.5) * distNorm * 2; // more spread at distance

    const px = originX + Math.cos(angle) * dist;
    const py = originY + Math.sin(angle) * dist;

    // Opacity — dense near origin, fading out
    ctx.globalAlpha = (1 - distNorm * 0.6) * (0.3 + rng() * 0.6);

    const markType = rng();
    if (markType > 0.25) {
      // Dot
      const size = (1 - distNorm * 0.4) * (0.4 + rng() * 3);
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    } else if (markType > 0.08) {
      // Tiny character
      const cs = 2 + rng() * 5 * (1 - distNorm * 0.5);
      ctx.font = `${cs}px monospace`;
      ctx.fillText(GLYPHS[Math.floor(rng() * GLYPHS.length)], px, py);
    } else {
      // Line segment
      ctx.lineWidth = 0.2 + rng() * 0.6;
      const la = angle + (rng() - 0.5) * 1.5;
      const ll = 3 + rng() * 15 * (1 - distNorm * 0.5);
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + Math.cos(la) * ll, py + Math.sin(la) * ll);
      ctx.stroke();
    }
  }

  ctx.restore();
}

// ═══════════════════════════════════════════════
// DARK HORIZON BAND
// ═══════════════════════════════════════════════

function drawHorizon(ctx, centerY, startX, endX, thickness, density, seed) {
  const rng = createRng(seed);
  const bandWidth = endX - startX;

  ctx.save();
  ctx.fillStyle = '#000';
  ctx.strokeStyle = '#000';

  // Dense core — sharp horizontal streaks
  for (let i = 0; i < density; i++) {
    const px = startX + rng() * bandWidth;
    const py = centerY + (rng() - 0.5) * thickness;

    const distFromCenter = Math.abs(py - centerY) / (thickness / 2);
    const horizontalFade = Math.pow((px - startX) / bandWidth, 0.5); // sharper at left, fading right

    const vertFade = Math.pow(1 - distFromCenter, 2);
    ctx.globalAlpha = vertFade * (1 - horizontalFade * 0.7) * (0.3 + rng() * 0.5);

    if (rng() > 0.25) {
      // Horizontal streak
      ctx.lineWidth = 0.3 + rng() * 1.5 * vertFade;
      const streakLen = 3 + rng() * 80 * (1 - horizontalFade);
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + streakLen, py + (rng() - 0.5) * 1.5);
      ctx.stroke();
    } else {
      // Dot
      ctx.beginPath();
      ctx.arc(px, py, 0.3 + rng() * 2 * vertFade, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Sharp center line
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1.5 + rng();
  ctx.beginPath();
  ctx.moveTo(startX, centerY);
  ctx.lineTo(endX, centerY + (rng() - 0.5) * 3);
  ctx.stroke();

  // Second thinner line slightly offset
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = 0.5 + rng() * 0.5;
  ctx.beginPath();
  ctx.moveTo(startX, centerY + 3 + rng() * 5);
  ctx.lineTo(endX * 0.85, centerY + 3 + rng() * 5);
  ctx.stroke();

  ctx.restore();
}

// ═══════════════════════════════════════════════
// VERTICAL COLUMNS — hanging from bottom of grid
// ═══════════════════════════════════════════════

function drawVerticalColumns(ctx, x, y, w, maxH, numCols, seed) {
  const rng = createRng(seed);

  ctx.save();
  ctx.strokeStyle = '#000';
  ctx.fillStyle = '#000';

  for (let c = 0; c < numCols; c++) {
    const cx = x + rng() * w;
    const lineLen = 40 + rng() * maxH;

    // Main vertical line
    ctx.lineWidth = 0.3 + rng() * 0.7;
    ctx.globalAlpha = 0.2 + rng() * 0.4;
    ctx.beginPath();
    ctx.moveTo(cx, y);
    ctx.lineTo(cx + (rng() - 0.5) * 3, y + lineLen);
    ctx.stroke();

    // Tick marks
    const numTicks = 5 + Math.floor(rng() * 15);
    ctx.lineWidth = 0.2;
    for (let t = 0; t < numTicks; t++) {
      const ty = y + (t / numTicks) * lineLen;
      const tw = 2 + rng() * 6;
      ctx.globalAlpha = 0.1 + rng() * 0.2;
      ctx.beginPath();
      ctx.moveTo(cx - tw / 2, ty);
      ctx.lineTo(cx + tw / 2, ty);
      ctx.stroke();
    }

    // Characters along some columns
    if (rng() > 0.4) {
      ctx.globalAlpha = 0.15 + rng() * 0.25;
      ctx.font = `${3 + rng() * 3}px monospace`;
      for (let t = 0; t < 3 + Math.floor(rng() * 8); t++) {
        ctx.fillText(GLYPHS[Math.floor(rng() * GLYPHS.length)], cx + 3 + rng() * 5, y + rng() * lineLen);
      }
    }

    // Dots near column
    for (let d = 0; d < Math.floor(rng() * 6); d++) {
      ctx.globalAlpha = 0.1 + rng() * 0.15;
      ctx.beginPath();
      ctx.arc(cx + (rng() - 0.5) * 12, y + rng() * lineLen, 0.3 + rng() * 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

// ═══════════════════════════════════════════════
// CONNECTION LINES — thin spider-web from scatter zone
// ═══════════════════════════════════════════════

function drawConnections(ctx, originX, originY, width, height, numLines, seed) {
  const rng = createRng(seed);

  ctx.save();
  ctx.strokeStyle = '#000';

  for (let i = 0; i < numLines; i++) {
    ctx.lineWidth = 0.15 + rng() * 0.3;
    ctx.globalAlpha = 0.04 + rng() * 0.1;

    const angle = rng() * Math.PI * 2;
    const len = 80 + rng() * Math.max(width, height) * 0.6;
    const endX = originX + Math.cos(angle) * len;
    const endY = originY + Math.sin(angle) * len;

    // Slightly curved
    const mx = (originX + endX) / 2 + (rng() - 0.5) * 50;
    const my = (originY + endY) / 2 + (rng() - 0.5) * 50;

    ctx.beginPath();
    ctx.moveTo(originX + (rng() - 0.5) * 30, originY + (rng() - 0.5) * 30);
    ctx.quadraticCurveTo(mx, my, endX, endY);
    ctx.stroke();

    // Small node at end
    if (rng() > 0.4) {
      ctx.fillStyle = '#000';
      ctx.globalAlpha = 0.1 + rng() * 0.15;
      ctx.beginPath();
      ctx.arc(endX, endY, 0.8 + rng() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Node cluster at some endpoints
    if (rng() > 0.7) {
      for (let n = 0; n < 3 + Math.floor(rng() * 5); n++) {
        ctx.globalAlpha = 0.05 + rng() * 0.1;
        ctx.beginPath();
        ctx.arc(endX + (rng() - 0.5) * 15, endY + (rng() - 0.5) * 15, 0.3 + rng() * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}

// ═══════════════════════════════════════════════
// MAIN RENDER
// ═══════════════════════════════════════════════

function renderPage(seed, width = 3000, height = 3000) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const rng = createRng(seed);

  // Burn some RNG values
  for (let i = 0; i < (seed % 7) + 3; i++) rng();

  const fragments = [
    'MYSTERIUM', 'SOLVE ET COAGULA', 'PLEROMA', 'GNOSIS', 'BARDO',
    'ŚŪNYATĀ', 'ARCHONTES', 'NIGREDO', 'PNEUMA', '精氣神',
    '鬼宮', 'GHOST PALACE', 'I AM THE IMAGINATION OF MYSELF',
    'THE EMPIRE NEVER ENDED', 'VALIS', 'IT FROM BIT',
    'ERRATA: EVERYTHING', '§217', 'STATUS: INCOMPLETE',
  ];

  // ─── PURE WHITE background ───
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // ─── COMPOSITION — matching reference layout ───
  // Grid: UPPER-LEFT, large block
  const charSize = 5 + rng() * 2.5; // 5-7.5px
  const gridX = width * 0.03;
  const gridY = height * 0.03;
  const gridW = width * (0.42 + rng() * 0.12);
  const gridH = height * (0.5 + rng() * 0.15);

  // Scatter origin: RIGHT EDGE of grid, vertically centered
  const scatterX = gridX + gridW * 0.85;
  const scatterY = gridY + gridH * (0.4 + rng() * 0.2);

  // Horizon band: runs from scatter zone RIGHTWARD
  const horizonY = scatterY + (rng() - 0.5) * height * 0.05;
  const horizonStartX = scatterX - width * 0.05;
  const horizonEndX = width * (0.85 + rng() * 0.12);

  // Vertical columns: below grid, left side
  const colsStartY = gridY + gridH;
  const colsX = gridX;
  const colsW = gridW * 0.7;
  const colsMaxH = height * (0.25 + rng() * 0.15);

  console.log(`  Grid: (${Math.round(gridX)},${Math.round(gridY)}) ${Math.round(gridW)}x${Math.round(gridH)}, char=${charSize.toFixed(1)}px`);
  console.log(`  Scatter origin: (${Math.round(scatterX)},${Math.round(scatterY)})`);

  // ─── LAYER 0: Faint horizontal ruled lines ───
  ctx.save();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 0.1;
  ctx.globalAlpha = 0.012;
  const ruleSpacing = 10 + rng() * 6;
  for (let ly = gridY; ly < gridY + gridH; ly += ruleSpacing) {
    ctx.beginPath(); ctx.moveTo(gridX, ly); ctx.lineTo(gridX + gridW, ly); ctx.stroke();
  }
  ctx.restore();

  // ─── LAYER 1: TEXT GRID ───
  console.log(`  Drawing text grid...`);
  drawTextGrid(ctx, gridX, gridY, gridW, gridH, charSize, seed + 100);

  // ─── LAYER 2: SCATTER — erupting rightward from grid edge ───
  console.log(`  Drawing scatter...`);
  const scatterDist = width * (0.4 + rng() * 0.15);
  drawScatter(ctx, scatterX, scatterY, 30000 + Math.floor(rng() * 15000), scatterDist, seed + 200);

  // Additional scatter clusters in the cloud
  for (let sc = 0; sc < 3 + Math.floor(rng() * 3); sc++) {
    const clusterX = scatterX + (rng() * 0.3) * width;
    const clusterY = scatterY + (rng() - 0.5) * height * 0.25;
    drawScatter(ctx, clusterX, clusterY, 2000 + Math.floor(rng() * 4000), scatterDist * 0.3, seed + 220 + sc * 50);
  }

  // ─── LAYER 3: DARK HORIZON BAND ───
  console.log(`  Drawing horizon...`);
  drawHorizon(ctx, horizonY, horizonStartX, horizonEndX, height * 0.035 + rng() * 0.02 * height, 10000 + Math.floor(rng() * 5000), seed + 300);

  // ─── LAYER 4: VERTICAL COLUMNS ───
  console.log(`  Drawing columns...`);
  drawVerticalColumns(ctx, colsX, colsStartY - 5, colsW * 0.6, colsMaxH, 60 + Math.floor(rng() * 40), seed + 400);

  // ─── LAYER 5: CONNECTION LINES ───
  console.log(`  Drawing connections...`);
  drawConnections(ctx, scatterX, scatterY, width, height, 30 + Math.floor(rng() * 25), seed + 500);

  // Additional connections from below the scatter
  drawConnections(ctx, scatterX, scatterY + height * 0.15, width, height, 15 + Math.floor(rng() * 15), seed + 510);

  // ─── LAYER 6: Scattered text fragments (sparse, in white space areas) ───
  ctx.save();
  ctx.fillStyle = '#000';
  const numFrags = 20 + Math.floor(rng() * 30);
  for (let i = 0; i < numFrags; i++) {
    // Bias toward the scatter zone, not the clean white corners
    const fx = scatterX + (rng() - 0.3) * width * 0.4;
    const fy = scatterY + (rng() - 0.5) * height * 0.5;
    const fs = 3 + rng() * 5;
    ctx.font = `${fs}px monospace`;
    ctx.globalAlpha = 0.06 + rng() * 0.12;
    const frag = fragments[Math.floor(rng() * fragments.length)];
    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate((rng() - 0.5) * 0.25);
    ctx.fillText(frag.slice(0, 3 + Math.floor(rng() * 10)), 0, 0);
    ctx.restore();
  }
  ctx.restore();

  // ─── LAYER 7: Edge notation ───
  ctx.save();
  ctx.fillStyle = '#000';
  ctx.font = '8px monospace';
  ctx.globalAlpha = 0.3;
  ctx.fillText(`§${(seed % 999) + 1}`, 12, height - 18);
  ctx.font = '5px monospace';
  ctx.globalAlpha = 0.15;
  ctx.fillText('FIELD NOTES — DATE UNKNOWN — STATUS: INCOMPLETE', 12, height - 8);

  // Edge numbering along bottom
  ctx.font = '3px monospace';
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 40; i++) {
    ctx.fillText(`${i + 1}`, width * ((i + 1) / 42), height - 3);
  }
  ctx.restore();

  return canvas;
}

// ═══════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════

const seed = parseInt(process.argv[2]) || Math.floor(Math.random() * 100000);
const name = process.argv[3] || `page-${seed}`;
const outputPath = path.join(OUTPUT_DIR, `${name}.png`);

console.log(`\nRendering Deep Reality Atlas page v7...`);
console.log(`  Seed: ${seed}`);
console.log(`  Output: ${outputPath}`);

const start = Date.now();
const canvas = renderPage(seed);
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(outputPath, buffer);

console.log(`  Size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Time: ${((Date.now() - start) / 1000).toFixed(1)}s`);
console.log(`  Done.\n`);
