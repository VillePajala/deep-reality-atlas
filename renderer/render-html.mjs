/**
 * Deep Reality Atlas — HTML/Puppeteer Renderer
 *
 * Generates the atlas page as an HTML document with real text,
 * then screenshots it at high resolution. The browser's text
 * rendering engine produces crisp characters at any size.
 *
 * Usage: node renderer/render-html.mjs [seed] [output-name]
 */

import puppeteer from 'puppeteer';
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

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ΣΓΨΩΠαβγδεθλμπφχψ精氣神鬼道空無心穴經絡∞⊕◉⊗∅§†‡※+-=÷×'.split('');

const FRAGMENTS = [
  'MYSTERIUM TREMENDUM', 'SOLVE ET COAGULA', 'PLEROMA', 'GNOSIS',
  'BARDO', 'ŚŪNYATĀ', 'ARCHONTES', 'NIGREDO', 'PNEUMA',
  '精氣神', '鬼宮', 'GHOST PALACE', 'I AM THE IMAGINATION OF MYSELF',
  'THE EMPIRE NEVER ENDED', 'VALIS', 'IT FROM BIT',
  'ERRATA: EVERYTHING', 'STATUS: INCOMPLETE', 'SENSUS NUMINIS',
  'DAS GANZ ANDERE', 'KREATURGEFÜHL', 'GATE GATE PĀRAGATE',
  'RATARA RATARA', 'HIC SUNT DRACONES', 'TERRA INCOGNITA',
  'CHRONOS', 'KAIROS', 'PRIMA MATERIA', 'RUBEDO',
  'THE OBSERVER HAS CONTAMINATED THE OBSERVATION',
  'SPECIMEN UNIDENTIFIED', 'SEE PAGE ∞', 'CROSS-REFERENCE FAILURE',
  'THE MAP IS NOT THE TERRITORY', 'KONSENSUSTODELLISUUS',
  'AIVOKUOLLUT JUMALA', 'OBRAMBORAM SCHUT SCHUT',
];

function generateHTML(seed, width = 3000, height = 3000) {
  const rng = createRng(seed);
  for (let i = 0; i < (seed % 7) + 3; i++) rng(); // decorrelate

  // ─── GRID PARAMETERS ───
  const charSize = 5 + rng() * 2; // px
  const gridX = width * 0.03;
  const gridY = height * 0.03;
  const gridW = width * (0.42 + rng() * 0.12);
  const gridH = height * (0.5 + rng() * 0.15);
  const charWidth = charSize * 0.52;
  const lineHeight = charSize * 1.4;
  const cols = Math.floor(gridW / charWidth);
  const rows = Math.floor(gridH / lineHeight);

  // Scatter origin
  const scatterX = gridX + gridW * 0.85;
  const scatterY = gridY + gridH * 0.45;
  const horizonY = scatterY;

  let elements = [];

  // ─── GRID CHARACTERS ───
  const gridRng = createRng(seed + 100);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const normCol = col / cols;
      const normRow = row / rows;
      const dissolve = normCol * 0.7 + normRow * 0.3;

      if (dissolve > 0.55 && gridRng() < (dissolve - 0.55) * 2.5) continue;
      if (dissolve > 0.4 && gridRng() < (dissolve - 0.4) * 0.5) continue;

      let dx = 0, dy = 0;
      if (dissolve > 0.35) {
        const drift = Math.pow(dissolve - 0.35, 1.5) * 120;
        dx = gridRng() * drift + drift * 0.3;
        dy = (gridRng() - 0.5) * drift * 0.6;
      }

      const coreBoost = Math.max(0, 1 - dissolve * 1.2);
      const opacity = Math.min(1, (0.7 + coreBoost * 0.3) * (0.85 + gridRng() * 0.15));
      const glyph = GLYPHS[Math.floor(gridRng() * GLYPHS.length)];
      const x = gridX + col * charWidth + dx;
      const y = gridY + row * lineHeight + dy;

      elements.push(
        `<span style="position:absolute;left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;font-size:${charSize.toFixed(1)}px;opacity:${opacity.toFixed(2)}">${escapeHtml(glyph)}</span>`
      );
    }
  }

  // ─── SCATTER PARTICLES ───
  const scatRng = createRng(seed + 200);
  const numScatter = 40000 + Math.floor(rng() * 20000);
  const maxDist = width * 0.45;

  for (let i = 0; i < numScatter; i++) {
    const baseAngle = -0.3 + (scatRng() - 0.5) * 1.8;
    const dist = Math.pow(scatRng(), 0.55) * maxDist;
    const distNorm = dist / maxDist;
    const angle = baseAngle + (scatRng() - 0.5) * distNorm * 2;

    const px = scatterX + Math.cos(angle) * dist;
    const py = scatterY + Math.sin(angle) * dist;

    if (px < 0 || px > width || py < 0 || py > height) continue;

    const opacity = (1 - distNorm * 0.5) * (0.35 + scatRng() * 0.55);
    const markType = scatRng();

    if (markType > 0.2) {
      // Dot
      const size = (1 - distNorm * 0.4) * (1 + scatRng() * 4);
      elements.push(
        `<span style="position:absolute;left:${px.toFixed(0)}px;top:${py.toFixed(0)}px;width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;background:#000;border-radius:50%;opacity:${opacity.toFixed(2)}"></span>`
      );
    } else if (markType > 0.05) {
      // Character
      const cs = 3 + scatRng() * 6 * (1 - distNorm * 0.5);
      const glyph = GLYPHS[Math.floor(scatRng() * GLYPHS.length)];
      elements.push(
        `<span style="position:absolute;left:${px.toFixed(0)}px;top:${py.toFixed(0)}px;font-size:${cs.toFixed(1)}px;opacity:${opacity.toFixed(2)}">${escapeHtml(glyph)}</span>`
      );
    } else {
      // Line (as thin rotated div)
      const la = angle + (scatRng() - 0.5) * 1.5;
      const ll = 4 + scatRng() * 18 * (1 - distNorm * 0.5);
      const deg = (la * 180 / Math.PI).toFixed(0);
      elements.push(
        `<span style="position:absolute;left:${px.toFixed(0)}px;top:${py.toFixed(0)}px;width:${ll.toFixed(0)}px;height:0;border-top:0.5px solid #000;transform:rotate(${deg}deg);transform-origin:0 0;opacity:${opacity.toFixed(2)}"></span>`
      );
    }
  }

  // ─── DARK HORIZON BAND ───
  const hRng = createRng(seed + 300);
  const hStartX = scatterX - width * 0.05;
  const hEndX = width * 0.9;
  const hThickness = height * 0.04;
  const hDensity = 12000 + Math.floor(rng() * 6000);

  for (let i = 0; i < hDensity; i++) {
    const px = hStartX + hRng() * (hEndX - hStartX);
    const py = horizonY + (hRng() - 0.5) * hThickness;
    const distFromCenter = Math.abs(py - horizonY) / (hThickness / 2);
    const hFade = Math.pow((px - hStartX) / (hEndX - hStartX), 0.5);
    const vFade = Math.pow(1 - distFromCenter, 2);
    const opacity = vFade * (1 - hFade * 0.7) * (0.4 + hRng() * 0.5);

    if (hRng() > 0.25) {
      // Horizontal streak
      const len = 3 + hRng() * 60 * (1 - hFade);
      const thickness = 0.3 + hRng() * 1.5 * vFade;
      elements.push(
        `<span style="position:absolute;left:${px.toFixed(0)}px;top:${py.toFixed(0)}px;width:${len.toFixed(0)}px;height:0;border-top:${thickness.toFixed(1)}px solid #000;opacity:${opacity.toFixed(2)}"></span>`
      );
    } else {
      const size = 0.5 + hRng() * 2.5 * vFade;
      elements.push(
        `<span style="position:absolute;left:${px.toFixed(0)}px;top:${py.toFixed(0)}px;width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;background:#000;border-radius:50%;opacity:${opacity.toFixed(2)}"></span>`
      );
    }
  }

  // Sharp center line
  elements.push(
    `<span style="position:absolute;left:${hStartX.toFixed(0)}px;top:${horizonY.toFixed(0)}px;width:${((hEndX - hStartX) * 0.8).toFixed(0)}px;height:0;border-top:2px solid #000;opacity:0.4"></span>`
  );

  // ─── VERTICAL COLUMNS ───
  const vRng = createRng(seed + 400);
  const colsStartY = gridY + gridH;
  const numVCols = 50 + Math.floor(rng() * 40);
  const colsRegionW = gridW * 0.65;
  const colsMaxH = height * 0.3;

  for (let c = 0; c < numVCols; c++) {
    const cx = gridX + vRng() * colsRegionW;
    const lineLen = 30 + vRng() * colsMaxH;
    const lw = 0.3 + vRng() * 0.7;
    const opacity = 0.2 + vRng() * 0.4;

    // Main vertical line
    elements.push(
      `<span style="position:absolute;left:${cx.toFixed(0)}px;top:${colsStartY.toFixed(0)}px;width:0;height:${lineLen.toFixed(0)}px;border-left:${lw.toFixed(1)}px solid #000;opacity:${opacity.toFixed(2)}"></span>`
    );

    // Tick marks
    const numTicks = 3 + Math.floor(vRng() * 10);
    for (let t = 0; t < numTicks; t++) {
      const ty = colsStartY + (t / numTicks) * lineLen;
      const tw = 2 + vRng() * 6;
      elements.push(
        `<span style="position:absolute;left:${(cx - tw/2).toFixed(0)}px;top:${ty.toFixed(0)}px;width:${tw.toFixed(0)}px;height:0;border-top:0.3px solid #000;opacity:${(0.1 + vRng() * 0.2).toFixed(2)}"></span>`
      );
    }

    // Characters along some columns
    if (vRng() > 0.5) {
      for (let t = 0; t < 3 + Math.floor(vRng() * 6); t++) {
        const ty = colsStartY + vRng() * lineLen;
        const cs = 3 + vRng() * 3;
        elements.push(
          `<span style="position:absolute;left:${(cx + 3).toFixed(0)}px;top:${ty.toFixed(0)}px;font-size:${cs.toFixed(1)}px;opacity:${(0.12 + vRng() * 0.18).toFixed(2)}">${escapeHtml(GLYPHS[Math.floor(vRng() * GLYPHS.length)])}</span>`
        );
      }
    }
  }

  // ─── CONNECTION LINES ───
  const cRng = createRng(seed + 500);
  const numConns = 35 + Math.floor(rng() * 25);
  for (let i = 0; i < numConns; i++) {
    const angle = cRng() * Math.PI * 2;
    const len = 80 + cRng() * Math.max(width, height) * 0.5;
    const ex = scatterX + Math.cos(angle) * len;
    const ey = scatterY + Math.sin(angle) * len;
    const ox = scatterX + (cRng() - 0.5) * 30;
    const oy = scatterY + (cRng() - 0.5) * 30;
    const opacity = 0.03 + cRng() * 0.08;
    const lw = 0.2 + cRng() * 0.3;

    // SVG line element for smooth thin lines
    elements.push(
      `<svg style="position:absolute;left:0;top:0;width:${width}px;height:${height}px;pointer-events:none;overflow:visible">
        <line x1="${ox.toFixed(0)}" y1="${oy.toFixed(0)}" x2="${ex.toFixed(0)}" y2="${ey.toFixed(0)}" stroke="#000" stroke-width="${lw.toFixed(1)}" opacity="${opacity.toFixed(2)}"/>
      </svg>`
    );

    // Node at end
    if (cRng() > 0.4 && ex > 0 && ex < width && ey > 0 && ey < height) {
      const ns = 1 + cRng() * 2.5;
      elements.push(
        `<span style="position:absolute;left:${ex.toFixed(0)}px;top:${ey.toFixed(0)}px;width:${ns.toFixed(1)}px;height:${ns.toFixed(1)}px;background:#000;border-radius:50%;opacity:${(0.1 + cRng() * 0.15).toFixed(2)}"></span>`
      );
    }
  }

  // ─── SCATTERED TEXT FRAGMENTS ───
  const fRng = createRng(seed + 600);
  const numFrags = 30 + Math.floor(rng() * 30);
  for (let i = 0; i < numFrags; i++) {
    const fx = scatterX + (fRng() - 0.3) * width * 0.4;
    const fy = scatterY + (fRng() - 0.5) * height * 0.5;
    if (fx < 0 || fx > width || fy < 0 || fy > height) continue;
    const fs = 3 + fRng() * 5;
    const opacity = 0.05 + fRng() * 0.12;
    const frag = FRAGMENTS[Math.floor(fRng() * FRAGMENTS.length)];
    const slice = frag.slice(0, 3 + Math.floor(fRng() * 12));
    const rot = (fRng() - 0.5) * 15;
    elements.push(
      `<span style="position:absolute;left:${fx.toFixed(0)}px;top:${fy.toFixed(0)}px;font-size:${fs.toFixed(1)}px;opacity:${opacity.toFixed(2)};transform:rotate(${rot.toFixed(0)}deg);white-space:nowrap">${escapeHtml(slice)}</span>`
    );
  }

  // ─── PAGE NOTATION ───
  elements.push(
    `<span style="position:absolute;left:12px;bottom:18px;font-size:8px;opacity:0.3">§${(seed % 999) + 1}</span>`
  );
  elements.push(
    `<span style="position:absolute;left:12px;bottom:6px;font-size:5px;opacity:0.15">FIELD NOTES — DATE UNKNOWN — STATUS: INCOMPLETE</span>`
  );

  // Edge numbering
  for (let i = 0; i < 40; i++) {
    elements.push(
      `<span style="position:absolute;left:${(width * (i + 1) / 42).toFixed(0)}px;bottom:2px;font-size:3px;opacity:0.1">${i + 1}</span>`
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
    background: #fff;
    font-family: 'Courier New', Courier, monospace;
    color: #000;
    position: relative;
    overflow: hidden;
  }
  span {
    display: inline-block;
    line-height: 1;
  }
</style>
</head>
<body>
${elements.join('\n')}
</body>
</html>`;
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ═══════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════

const seed = parseInt(process.argv[2]) || Math.floor(Math.random() * 100000);
const name = process.argv[3] || `page-${seed}`;
const outputPath = path.join(OUTPUT_DIR, `${name}.png`);

console.log(`\nRendering Deep Reality Atlas (HTML/Puppeteer)...`);
console.log(`  Seed: ${seed}`);
console.log(`  Output: ${outputPath}`);

const start = Date.now();

const html = generateHTML(seed);
const htmlPath = path.join(OUTPUT_DIR, `_temp_${seed}.html`);
fs.writeFileSync(htmlPath, html);

console.log(`  HTML generated (${(html.length / 1024 / 1024).toFixed(1)} MB), launching browser...`);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
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
