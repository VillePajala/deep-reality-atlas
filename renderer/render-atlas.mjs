/**
 * Deep Reality Atlas — Unified Renderer
 *
 * Generates manuscript-style pages with optional overlay layers.
 *
 * Usage: node renderer/render-atlas.mjs [seed] [output-name] [--style=TYPE]
 *
 * Styles:
 *   manuscript  — text only (default)
 *   mapped      — text + cartographic overlays (contours, compass, coordinates)
 *   occult      — text + sacred geometry & alchemical symbols
 *   organism    — text + organic cellular forms growing from void
 *   full        — text + all overlays combined
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { addCartographicOverlay, addSymbolsOverlay, addOrganicOverlay } from './overlays.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'gallery');
const CONTENT_DIR = path.join(__dirname, '..', 'content');

function createRng(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}
function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ─── Load text ───
function loadTexts() {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, 'holy-book-of-insanity.md'), 'utf-8');
  const journalStart = raw.indexOf('# THE JOURNAL');
  const journalText = journalStart > -1 ? raw.slice(journalStart) : '';
  const journalEntries = journalText.split(/\n---\n/).slice(1)
    .map(b => b.trim()).filter(b => b.length > 50)
    .map(b => {
      const lines = b.split('\n');
      const tm = lines[0]?.match(/^\*\*(.+?)\*\*/);
      return { title: tm ? tm[1] : '', body: lines.slice(tm ? 1 : 0).join(' ').replace(/\s+/g, ' ').trim() };
    }).filter(b => b.body.length > 30);

  const fieldNotes = [];
  for (const m of raw.matchAll(/### Field Notes[^\n]*\n\n([\s\S]*?)(?=\n###|\n---|\n## )/g))
    fieldNotes.push(m[1].trim().replace(/\s+/g, ' '));
  const quotes = [];
  for (const m of raw.matchAll(/> "([^"]{30,})"/g)) quotes.push(m[1]);
  const fragments = [];
  for (const m of raw.matchAll(/Fragments: ([^\n]+)/g))
    fragments.push(...m[1].split(' — ').map(f => f.trim()).filter(f => f.length > 2));

  const headers = [
    'CATALOGUS UMBRAE — SPECIMEN', 'TABULA TREMENDI — SERIES', 'ATLAS PSYCHE PROFUNDAE',
    'TABULA SMARAGDINA — OPERATIONES', 'ATLAS PLEROMATIS', 'TABULA BARDO — TRANSITIONES',
    'TABULA VACUITATIS', 'TABULA AUTOPOIETICA', 'CATALOGUS FATTILLIARDIS — COSMOGONIA',
    'ATLAS CRUENTUS — ARTAUD', 'TABULA HERMETICA — PRINCIPIA', 'CATALOGUS DEMIURGI — SAKLAS',
    'ATLAS CORPORIS INVISIBILIS', 'ATLAS SONORUM — CYMATICS', 'EXEGESIS — ENTRY 2-3-74',
    'ATLAS SOMNIORUM', 'ATLAS ATLATUM — META-CARTOGRAPHIA', 'TABULA AETERNAE RECURRENTIAE',
    'CATALOGUS COMPUTATIONIS', 'ATLAS ATLATIS — DE SE IPSO', 'CODEX LINGUA AVIUM',
    'TAXONOMY OF NUMINOUS ENCOUNTERS', 'CARTOGRAPHY OF THE BARDO STATES',
    'MERIDIAN SYSTEM OF THE INVISIBLE BODY', 'FIELD GUIDE TO CONSENSUS REALITY',
    'CLASSIFICATION OF THOUGHT-FORMS', 'THE OBSERVER-OBSERVED PROBLEM (UNRESOLVED)',
    'ERRATA TO THE BOOK OF THE DEAD', 'INVENTORY OF FAILED TAXONOMIES', 'THE VOID: A FIELD GUIDE',
  ];
  const marginNotes = [
    'SEE PAGE ∞', 'cf. §47', 'CROSS-REF: VOID', '→ NIGREDO', 'NB!', 'STATUS: URGENT',
    '鬼', '道', '空', 'ERRATA', 'REVISION 1847', 'DATE UNKNOWN', '→ §892', 'sic!',
    'SPECIMEN #4091', 'PAGE X OF ∞', '⊕', '◉', '∅', '※', '†', 'WARNING', 'INCOMPLETE',
  ];
  return { journalEntries, fieldNotes, quotes, fragments, headers, marginNotes };
}

function render(seed, style, W = 3000, H = 3000) {
  const rng = createRng(seed);
  for (let i = 0; i < (seed % 7) + 3; i++) rng();
  const texts = loadTexts();
  const allBodies = [
    ...texts.journalEntries.map(e => e.body), ...texts.fieldNotes,
    ...texts.quotes.map(q => `"${q}"`),
  ].sort(() => rng() - 0.5);

  // VOID
  const voidCx = W * (0.35 + rng() * 0.3);
  const voidCy = H * (0.35 + rng() * 0.3);
  const voidR = Math.min(W, H) * (0.1 + rng() * 0.08);

  // COLUMNS
  const numCols = 5 + Math.floor(rng() * 2);
  const margin = W * 0.025;
  const colGap = 6;
  const colWidth = (W - margin * 2 - colGap * (numCols - 1)) / numCols;

  console.log(`  Style: ${style}`);
  console.log(`  Void: (${Math.round(voidCx)},${Math.round(voidCy)}) r=${Math.round(voidR)}`);

  // BUILD COLUMN CONTENT
  function buildColumn(colIdx) {
    const cRng = createRng(seed + 1000 + colIdx * 137);
    const blocks = [];
    let textPtr = (colIdx * 7) % allBodies.length;
    const baseFontSize = 5.5 + cRng() * 1.5;
    const lineHeight = baseFontSize * (1.25 + cRng() * 0.15);
    let usedH = 0;
    const totalH = H - margin * 2;

    while (usedH < totalH) {
      const bt = cRng();
      if (bt < 0.06 && usedH > 50) {
        const h = texts.headers[Math.floor(cRng() * texts.headers.length)];
        blocks.push({ type: 'header', text: h, fontSize: baseFontSize * 1.1, lineHeight: baseFontSize * 1.5 });
        usedH += baseFontSize * 2.5;
      } else if (bt < 0.12) {
        const n = 3 + Math.floor(cRng() * 6);
        const lines = [];
        for (let f = 0; f < n; f++) lines.push(texts.fragments[Math.floor(cRng() * texts.fragments.length)]);
        blocks.push({ type: 'fragments', lines, fontSize: baseFontSize * 0.85, lineHeight: baseFontSize * 1.1 });
        usedH += n * baseFontSize * 1.2;
      } else if (bt < 0.18) {
        const n = 3 + Math.floor(cRng() * 5);
        const lines = [];
        for (let li = 0; li < n; li++) lines.push(`${li + 1}. ${texts.fragments[Math.floor(cRng() * texts.fragments.length)]}`);
        blocks.push({ type: 'list', lines, fontSize: baseFontSize * 0.9, lineHeight: baseFontSize * 1.15 });
        usedH += n * baseFontSize * 1.2;
      } else if (bt < 0.22) {
        const gap = 5 + cRng() * 15;
        blocks.push({ type: 'gap', height: gap });
        usedH += gap;
      } else {
        const text = allBodies[textPtr % allBodies.length]; textPtr++;
        blocks.push({ type: 'paragraph', text, fontSize: baseFontSize, lineHeight });
        usedH += Math.ceil(text.length / Math.floor(colWidth / (baseFontSize * 0.5))) * lineHeight + baseFontSize;
      }
    }
    return { blocks, baseFontSize, lineHeight };
  }

  const columns = [];
  for (let c = 0; c < numCols; c++) columns.push(buildColumn(c));

  // RENDER HTML
  let htmlParts = [];
  let svgParts = [];

  for (let ci = 0; ci < numCols; ci++) {
    const colX = margin + ci * (colWidth + colGap);
    const col = columns[ci];
    let y = margin;

    for (const block of col.blocks) {
      if (y > H - margin) break;
      const distV = Math.hypot(colX + colWidth / 2 - voidCx, y - voidCy);
      const vInf = Math.max(0, 1 - distV / (voidR * 2.2));
      if (distV < voidR * 0.7) { y += block.type === 'gap' ? block.height : 40; continue; }

      let ts = '', opMod = 1;
      if (vInf > 0.05) {
        opMod = Math.max(0.1, 1 - vInf * 1.3);
        const px = ((colX + colWidth / 2 - voidCx) / distV) * vInf * 25;
        const py = ((y - voidCy) / distV) * vInf * 15;
        const sk = vInf * 8 * (colX < voidCx ? -1 : 1);
        ts = `transform:translate(${px.toFixed(0)}px,${py.toFixed(0)}px) skewX(${sk.toFixed(1)}deg);`;
        if (vInf > 0.3 && createRng(seed + y * 100)() < vInf * 0.5) { y += 30; continue; }
      }

      if (block.type === 'header') {
        htmlParts.push(`<div style="position:absolute;left:${colX}px;top:${y}px;width:${colWidth}px;font-size:${block.fontSize.toFixed(1)}px;font-weight:bold;letter-spacing:1px;opacity:${(0.9 * opMod).toFixed(2)};border-bottom:0.5px solid rgba(0,0,0,0.2);padding-bottom:2px;${ts}">${esc(block.text)}</div>`);
        y += block.fontSize * 2.5;
      } else if (block.type === 'fragments') {
        for (const line of block.lines) {
          if (y > H - margin) break;
          htmlParts.push(`<div style="position:absolute;left:${colX + 8}px;top:${y}px;width:${colWidth - 8}px;font-size:${block.fontSize.toFixed(1)}px;letter-spacing:0.5px;opacity:${(0.7 * opMod).toFixed(2)};${ts}">${esc(line)}</div>`);
          y += block.lineHeight;
        }
        y += 4;
      } else if (block.type === 'list') {
        for (const line of block.lines) {
          if (y > H - margin) break;
          htmlParts.push(`<div style="position:absolute;left:${colX + 4}px;top:${y}px;width:${colWidth - 4}px;font-size:${block.fontSize.toFixed(1)}px;opacity:${(0.8 * opMod).toFixed(2)};${ts}">${esc(line)}</div>`);
          y += block.lineHeight;
        }
        y += 4;
      } else if (block.type === 'gap') {
        y += block.height;
      } else {
        const cpl = Math.floor(colWidth / (block.fontSize * 0.5));
        const words = block.text.split(' ');
        let line = '';
        for (const word of words) {
          if (y > H - margin) break;
          if ((line + ' ' + word).length > cpl) {
            if (line) {
              htmlParts.push(`<div style="position:absolute;left:${colX}px;top:${y}px;width:${colWidth}px;font-size:${block.fontSize.toFixed(1)}px;line-height:${block.lineHeight.toFixed(1)}px;opacity:${(0.9 * opMod).toFixed(2)};white-space:nowrap;overflow:hidden;${ts}">${esc(line)}</div>`);
              y += block.lineHeight;
            }
            line = word;
          } else { line = line ? line + ' ' + word : word; }
        }
        if (line && y < H - margin) {
          htmlParts.push(`<div style="position:absolute;left:${colX}px;top:${y}px;width:${colWidth}px;font-size:${block.fontSize.toFixed(1)}px;line-height:${block.lineHeight.toFixed(1)}px;opacity:${(0.9 * opMod).toFixed(2)};white-space:nowrap;overflow:hidden;${ts}">${esc(line)}</div>`);
          y += block.lineHeight;
        }
        y += block.fontSize * 0.5;
      }
    }
    if (ci < numCols - 1) {
      htmlParts.push(`<div style="position:absolute;left:${colX + colWidth + colGap / 2}px;top:${margin}px;width:0;height:${H - margin * 2}px;border-left:0.4px solid rgba(0,0,0,0.12)"></div>`);
    }
  }

  // Margin annotations
  const mRng = createRng(seed + 800);
  for (let i = 0; i < 25 + Math.floor(rng() * 20); i++) {
    const ci = Math.floor(mRng() * (numCols + 1));
    let ax = ci === 0 ? 3 + mRng() * (margin - 5) : ci === numCols ? W - margin + 3 : margin + ci * (colWidth + colGap) - colGap + 1;
    const ay = margin + mRng() * (H - margin * 2);
    const note = texts.marginNotes[Math.floor(mRng() * texts.marginNotes.length)];
    htmlParts.push(`<div style="position:absolute;left:${ax.toFixed(0)}px;top:${ay.toFixed(0)}px;font-size:${(3.5 + mRng() * 2).toFixed(1)}px;opacity:${(0.2 + mRng() * 0.3).toFixed(2)};transform:rotate(${((mRng()-0.5)*20).toFixed(0)}deg);white-space:nowrap">${esc(note)}</div>`);
  }

  // ─── SVG: VOID ───
  svgParts.push(`<circle cx="${voidCx.toFixed(0)}" cy="${voidCy.toFixed(0)}" r="${(voidR * 0.6).toFixed(0)}" fill="#000"/>`);
  for (let ring = 0; ring < 30; ring++) {
    const r = voidR * (0.6 + ring * 0.018);
    svgParts.push(`<circle cx="${voidCx.toFixed(0)}" cy="${voidCy.toFixed(0)}" r="${r.toFixed(0)}" fill="#000" opacity="${Math.max(0, 0.8 - ring * 0.03).toFixed(2)}"/>`);
  }
  // Edge blobs
  const eRng = createRng(seed + 900);
  for (let i = 0; i < 3000; i++) {
    const a = eRng() * Math.PI * 2, d = voidR * (0.6 + eRng() * 0.8);
    const px = voidCx + Math.cos(a) * d, py = voidCy + Math.sin(a) * d;
    const sz = 0.5 + eRng() * 4;
    const dfe = Math.abs(d - voidR) / voidR;
    const op = Math.max(0, 0.6 - dfe * 1.5) * (0.3 + eRng() * 0.7);
    if (op > 0.02) svgParts.push(`<circle cx="${px.toFixed(0)}" cy="${py.toFixed(0)}" r="${sz.toFixed(1)}" fill="#000" opacity="${op.toFixed(2)}"/>`);
  }
  // Tendrils
  const tRng = createRng(seed + 950);
  for (let t = 0; t < 50; t++) {
    const sa = tRng() * Math.PI * 2;
    let tx = voidCx + Math.cos(sa) * voidR * 0.9, ty = voidCy + Math.sin(sa) * voidR * 0.9, a = sa;
    const ns = 8 + Math.floor(tRng() * 25);
    let d = `M${tx.toFixed(0)},${ty.toFixed(0)}`;
    const bw = 0.3 + tRng() * 1.2, bo = 0.1 + tRng() * 0.25;
    for (let s = 0; s < ns; s++) {
      a += (tRng() - 0.5) * 0.7; const sl = 3 + tRng() * 20;
      tx += Math.cos(a) * sl; ty += Math.sin(a) * sl;
      d += ` L${tx.toFixed(0)},${ty.toFixed(0)}`;
      if (tRng() > 0.5) svgParts.push(`<circle cx="${tx.toFixed(0)}" cy="${ty.toFixed(0)}" r="${(0.3 + tRng() * 2).toFixed(1)}" fill="#000" opacity="${(bo * 0.8).toFixed(2)}"/>`);
      if (tRng() > 0.7) {
        let bx = tx, by = ty, ba = a + (tRng() - 0.5) * 1.5;
        let bd = `M${bx.toFixed(0)},${by.toFixed(0)}`;
        for (let bs = 0; bs < 3 + Math.floor(tRng() * 5); bs++) {
          ba += (tRng() - 0.5) * 0.6; bx += Math.cos(ba) * (3 + tRng() * 10); by += Math.sin(ba) * (3 + tRng() * 10);
          bd += ` L${bx.toFixed(0)},${by.toFixed(0)}`;
        }
        svgParts.push(`<path d="${bd}" fill="none" stroke="#000" stroke-width="${(bw * 0.5).toFixed(1)}" opacity="${(bo * 0.5).toFixed(2)}"/>`);
      }
    }
    svgParts.push(`<path d="${d}" fill="none" stroke="#000" stroke-width="${bw.toFixed(1)}" opacity="${bo.toFixed(2)}"/>`);
  }
  // Scattered fragments near void
  const sRng = createRng(seed + 970);
  for (let i = 0; i < 300; i++) {
    const a = sRng() * Math.PI * 2, d = voidR * (0.8 + sRng() * 2);
    const px = voidCx + Math.cos(a) * d, py = voidCy + Math.sin(a) * d;
    if (px < 0 || px > W || py < 0 || py > H) continue;
    const dn = (d - voidR * 0.8) / (voidR * 2);
    const op = Math.max(0.05, (1 - dn) * (0.15 + sRng() * 0.35));
    const rot = Math.atan2(voidCy - py, voidCx - px) * 180 / Math.PI + (sRng() - 0.5) * 30;
    const frag = texts.fragments[Math.floor(sRng() * texts.fragments.length)];
    svgParts.push(`<text x="${px.toFixed(0)}" y="${py.toFixed(0)}" font-size="${(3 + sRng() * 6 * (1 - dn * 0.5)).toFixed(1)}" font-family="'Courier New',monospace" fill="#000" opacity="${op.toFixed(2)}" transform="rotate(${rot.toFixed(0)} ${px.toFixed(0)} ${py.toFixed(0)})">${esc(frag.slice(0, 1 + Math.floor(sRng() * 6)))}</text>`);
  }
  // Connection lines
  const cRng = createRng(seed + 980);
  for (let i = 0; i < 50; i++) {
    const a = cRng() * Math.PI * 2;
    const sr = voidR * 0.85, er = voidR * (2 + cRng() * 5);
    svgParts.push(`<line x1="${(voidCx + Math.cos(a) * sr).toFixed(0)}" y1="${(voidCy + Math.sin(a) * sr).toFixed(0)}" x2="${(voidCx + Math.cos(a + (cRng()-0.5)*0.3) * er).toFixed(0)}" y2="${(voidCy + Math.sin(a + (cRng()-0.5)*0.3) * er).toFixed(0)}" stroke="#000" stroke-width="${(0.15 + cRng() * 0.3).toFixed(2)}" opacity="${(0.03 + cRng() * 0.06).toFixed(2)}"/>`);
  }

  // ─── OVERLAYS based on style ───
  if (style === 'mapped' || style === 'full') {
    addCartographicOverlay(svgParts, W, H, seed + 5000);
  }
  if (style === 'occult' || style === 'full') {
    addSymbolsOverlay(svgParts, W, H, seed + 6000);
  }
  if (style === 'organism' || style === 'full') {
    addOrganicOverlay(svgParts, W, H, voidCx, voidCy, voidR, seed + 7000);
  }

  svgParts.push(`<text x="15" y="${H - 12}" font-size="6" font-family="'Courier New',monospace" fill="#000" opacity="0.3">§${(seed % 999) + 1} — FIELD NOTES — STATUS: INCOMPLETE / ONGOING / ABANDONED / URGENT</text>`);

  console.log(`  Text: ${htmlParts.length}, SVG: ${svgParts.length}`);

  return `<!DOCTYPE html><html><head><style>
*{margin:0;padding:0}
body{width:${W}px;height:${H}px;background:#f0ebe0;position:relative;overflow:hidden;font-family:'Courier New',monospace;color:#000}
</style></head><body>
${htmlParts.join('\n')}
<svg style="position:absolute;left:0;top:0;width:${W}px;height:${H}px;pointer-events:none;z-index:9999" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
${svgParts.join('\n')}
</svg>
</body></html>`;
}

// CLI
const args = process.argv.slice(2);
const seed = parseInt(args[0]) || Math.floor(Math.random() * 100000);
const name = args[1] || `atlas-${seed}`;
const styleFlag = args.find(a => a.startsWith('--style='));
const style = styleFlag ? styleFlag.split('=')[1] : 'manuscript';
const out = path.join(OUTPUT_DIR, `${name}.png`);

console.log(`\nRendering Deep Reality Atlas page...`);
console.log(`  Seed: ${seed}`);

const start = Date.now();
const html = render(seed, style);
const tmp = path.join(OUTPUT_DIR, `_t${seed}.html`);
fs.writeFileSync(tmp, html);

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 3000, height: 3000, deviceScaleFactor: 1 });
await page.goto(`file://${tmp}`, { waitUntil: 'networkidle0', timeout: 180000 });
await page.screenshot({ path: out, type: 'png' });
await browser.close();
fs.unlinkSync(tmp);

const stats = fs.statSync(out);
console.log(`  PNG: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Time: ${((Date.now() - start) / 1000).toFixed(1)}s\n`);
