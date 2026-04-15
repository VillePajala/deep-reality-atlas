/**
 * Deep Reality Atlas — "The Eye" / Glitch Renderer
 *
 * Inspired by reference image 12: horizontal lines dominating,
 * a dark circular void (eye) slightly off-center, lines radiating
 * from the void. Text fragments at edges. Glitch/scan aesthetic.
 *
 * Real atlas text runs as horizontal lines that distort near the void.
 *
 * Usage: node renderer/render-glitch.mjs [seed] [output-name]
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'gallery');
const CONTENT_DIR = path.join(__dirname, '..', 'content');

function createRng(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}
function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function loadTexts() {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, 'holy-book-of-insanity.md'), 'utf-8');
  const journal = raw.indexOf('# THE JOURNAL');
  const jText = journal > -1 ? raw.slice(journal) : '';
  const entries = jText.split(/\n---\n/).slice(1)
    .map(b => b.trim().split('\n').filter(l => !l.startsWith('**')).join(' ').replace(/\s+/g,' ').trim())
    .filter(b => b.length > 30);
  const fragments = [];
  for (const m of raw.matchAll(/Fragments: ([^\n]+)/g)) {
    fragments.push(...m[1].split(' — ').map(f => f.trim()).filter(f => f.length > 2));
  }
  return { entries, fragments };
}

function render(seed, W = 3000, H = 3000) {
  const rng = createRng(seed);
  for (let i = 0; i < (seed % 7) + 3; i++) rng();

  const texts = loadTexts();
  const shuffled = [...texts.entries].sort(() => rng() - 0.5);

  // Void position — slightly off-center
  const voidCx = W * (0.45 + rng() * 0.15);
  const voidCy = H * (0.42 + rng() * 0.16);
  const voidR = Math.min(W, H) * (0.1 + rng() * 0.06);

  const fontSize = 5.5 + rng() * 1.5;
  const lineHeight = fontSize * 1.3;
  const numLines = Math.floor(H / lineHeight);

  console.log(`  Void: (${Math.round(voidCx)},${Math.round(voidCy)}) r=${Math.round(voidR)}`);
  console.log(`  Lines: ${numLines}`);

  let htmlParts = [];
  let svgParts = [];
  let textIdx = 0;

  // ─── HORIZONTAL TEXT LINES — spanning full width ───
  for (let line = 0; line < numLines; line++) {
    const y = line * lineHeight;
    const text = shuffled[textIdx % shuffled.length];
    textIdx++;
    if (!text) continue;

    // Repeat text to fill full width
    const charsPerLine = Math.floor(W / (fontSize * 0.5));
    let lineText = '';
    while (lineText.length < charsPerLine) {
      lineText += text + '   ';
    }
    lineText = lineText.slice(0, charsPerLine);

    // Distance from void center
    const distToVoid = Math.abs(y - voidCy);
    const voidInfluence = Math.max(0, 1 - distToVoid / (voidR * 3));

    // Lines near void: thicker, darker, compressed vertically
    let opacity = 0.5 + rng() * 0.3;
    let transform = '';
    let extraHeight = 0;

    if (voidInfluence > 0.1) {
      // Darken near void
      opacity = Math.min(1, opacity + voidInfluence * 0.5);

      // Horizontal compression/stretching — glitch effect
      const shiftX = (rng() - 0.5) * voidInfluence * 80;
      const scaleX = 1 + (rng() - 0.5) * voidInfluence * 0.3;
      transform = `transform: translateX(${shiftX.toFixed(0)}px) scaleX(${scaleX.toFixed(2)});transform-origin: ${voidCx.toFixed(0)}px center;`;

      // Line weight variation near void
      extraHeight = voidInfluence * 3;
    }

    // Skip lines inside the void core
    if (distToVoid < voidR * 0.6 && Math.abs(line * lineHeight + lineHeight/2 - voidCy) < voidR * 0.5) {
      // Draw only a fragment — the line is being consumed
      const startFrac = rng() * 0.3;
      const endFrac = 0.7 + rng() * 0.3;
      const fragText = lineText.slice(Math.floor(startFrac * lineText.length), Math.floor(endFrac * lineText.length));

      if (rng() > 0.3) continue; // most lines inside void are gone

      htmlParts.push(
        `<div style="position:absolute;left:${(startFrac * W).toFixed(0)}px;top:${y.toFixed(0)}px;font-size:${fontSize.toFixed(1)}px;opacity:${(opacity * 0.3).toFixed(2)};white-space:nowrap;overflow:hidden;height:${(lineHeight + extraHeight).toFixed(0)}px;line-height:${(lineHeight + extraHeight).toFixed(0)}px;${transform}">${esc(fragText)}</div>`
      );
      continue;
    }

    htmlParts.push(
      `<div style="position:absolute;left:0;top:${y.toFixed(0)}px;width:${W}px;font-size:${fontSize.toFixed(1)}px;opacity:${opacity.toFixed(2)};white-space:nowrap;overflow:hidden;height:${(lineHeight + extraHeight).toFixed(0)}px;line-height:${(lineHeight + extraHeight).toFixed(0)}px;${transform}">${esc(lineText)}</div>`
    );
  }

  // ─── SVG: VOID ───
  // Concentric rings building up to solid black
  for (let ring = 0; ring < 25; ring++) {
    const r = voidR * (1 - ring * 0.035);
    const op = 0.04 + ring * 0.04;
    svgParts.push(`<circle cx="${voidCx.toFixed(0)}" cy="${voidCy.toFixed(0)}" r="${Math.max(1, r).toFixed(0)}" fill="#000" opacity="${Math.min(1, op).toFixed(2)}"/>`);
  }

  // Concentric stroke rings outside void
  for (let ring = 0; ring < 8; ring++) {
    const r = voidR * (1.1 + ring * 0.15);
    svgParts.push(`<circle cx="${voidCx.toFixed(0)}" cy="${voidCy.toFixed(0)}" r="${r.toFixed(0)}" fill="none" stroke="#000" stroke-width="${(0.2 + rng() * 0.5).toFixed(1)}" opacity="${(0.03 + rng() * 0.06).toFixed(2)}"/>`);
  }

  // ─── RADIAL LINES from void ───
  const radRng = createRng(seed + 300);
  for (let i = 0; i < 200; i++) {
    const a = radRng() * Math.PI * 2;
    const startR = voidR * (0.8 + radRng() * 0.4);
    const endR = voidR * (1.5 + radRng() * 5);
    const sx = voidCx + Math.cos(a) * startR;
    const sy = voidCy + Math.sin(a) * startR;
    const ex = voidCx + Math.cos(a + (radRng()-0.5)*0.1) * endR;
    const ey = voidCy + Math.sin(a + (radRng()-0.5)*0.1) * endR;
    const sw = 0.15 + radRng() * 0.6;
    const op = 0.03 + radRng() * 0.1;
    svgParts.push(`<line x1="${sx.toFixed(0)}" y1="${sy.toFixed(0)}" x2="${ex.toFixed(0)}" y2="${ey.toFixed(0)}" stroke="#000" stroke-width="${sw.toFixed(1)}" opacity="${op.toFixed(2)}"/>`);
  }

  // ─── HORIZONTAL GLITCH STREAKS ───
  const glRng = createRng(seed + 400);
  for (let i = 0; i < 150; i++) {
    const gy = H * glRng();
    const distToVoid = Math.abs(gy - voidCy);
    const nearVoid = Math.max(0, 1 - distToVoid / (voidR * 2));

    const gx = glRng() * W * 0.3;
    const gw = W * (0.1 + glRng() * 0.6 + nearVoid * 0.3);
    const gh = 0.5 + glRng() * (1 + nearVoid * 4);
    const op = (0.05 + glRng() * 0.15 + nearVoid * 0.3);

    svgParts.push(`<rect x="${gx.toFixed(0)}" y="${gy.toFixed(0)}" width="${gw.toFixed(0)}" height="${gh.toFixed(1)}" fill="#000" opacity="${op.toFixed(2)}"/>`);
  }

  // ─── TOP/BOTTOM TEXT FRAGMENTS ───
  const fRng = createRng(seed + 500);
  // Top edge
  for (let i = 0; i < 15; i++) {
    const fx = W * fRng();
    const fy = 10 + fRng() * H * 0.05;
    const frag = texts.fragments[Math.floor(fRng() * texts.fragments.length)];
    svgParts.push(`<text x="${fx.toFixed(0)}" y="${fy.toFixed(0)}" font-size="5" font-family="'Courier New',monospace" fill="#000" opacity="${(0.15+fRng()*0.2).toFixed(2)}">${esc(frag)}</text>`);
  }
  // Bottom edge
  for (let i = 0; i < 15; i++) {
    const fx = W * fRng();
    const fy = H - 10 - fRng() * H * 0.05;
    const frag = texts.fragments[Math.floor(fRng() * texts.fragments.length)];
    svgParts.push(`<text x="${fx.toFixed(0)}" y="${fy.toFixed(0)}" font-size="5" font-family="'Courier New',monospace" fill="#000" opacity="${(0.15+fRng()*0.2).toFixed(2)}">${esc(frag)}</text>`);
  }

  svgParts.push(`<text x="15" y="${H-8}" font-size="6" font-family="'Courier New',monospace" fill="#000" opacity="0.25">§${(seed%999)+1} — THE OBSERVER HAS CONTAMINATED THE OBSERVATION</text>`);

  console.log(`  HTML elements: ${htmlParts.length}`);
  console.log(`  SVG elements: ${svgParts.length}`);

  return `<!DOCTYPE html><html><head><style>
*{margin:0;padding:0}
body{width:${W}px;height:${H}px;background:#fff;position:relative;overflow:hidden;font-family:'Courier New',monospace;color:#000}
</style></head><body>
${htmlParts.join('\n')}
<svg style="position:absolute;left:0;top:0;width:${W}px;height:${H}px;pointer-events:none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
${svgParts.join('\n')}
</svg>
</body></html>`;
}

// CLI
const seed = parseInt(process.argv[2]) || Math.floor(Math.random() * 100000);
const name = process.argv[3] || `glitch-${seed}`;
const out = path.join(OUTPUT_DIR, `${name}.png`);

console.log(`\nRendering Glitch/Eye page...`);
console.log(`  Seed: ${seed}`);

const start = Date.now();
const html = render(seed);
const tmp = path.join(OUTPUT_DIR, `_t${seed}.html`);
fs.writeFileSync(tmp, html);

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 3000, height: 3000, deviceScaleFactor: 1 });
await page.goto(`file://${tmp}`, { waitUntil: 'networkidle0', timeout: 180000 });
console.log(`  Screenshotting...`);
await page.screenshot({ path: out, type: 'png' });
await browser.close();
fs.unlinkSync(tmp);

const stats = fs.statSync(out);
console.log(`  PNG: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Time: ${((Date.now() - start) / 1000).toFixed(1)}s\n`);
