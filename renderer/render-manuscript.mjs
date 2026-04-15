/**
 * Deep Reality Atlas — "The Manuscript" Renderer v2
 *
 * Dense encyclopedia page of real atlas text with a void consuming it.
 * The TEXT IS the artwork. Every word is from the Holy Book of Insanity.
 *
 * Key qualities:
 * - BLACK dense text — packed like an old encyclopedia
 * - Multiple column types: dense paragraphs, lists, fragments, annotations
 * - Bold section headers breaking up the flow
 * - Margin annotations with arrows and numbers
 * - Void with organic fractal tendrils interacting with text
 * - Text warps, stretches, and fragments near the void
 * - Warm aged paper background
 *
 * Usage: node renderer/render-manuscript.mjs [seed] [output-name]
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
function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ─── Load all text from the Holy Book ───
function loadTexts() {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, 'holy-book-of-insanity.md'), 'utf-8');

  // Journal entries
  const journalStart = raw.indexOf('# THE JOURNAL');
  const journalText = journalStart > -1 ? raw.slice(journalStart) : '';
  const journalEntries = journalText.split(/\n---\n/).slice(1)
    .map(b => b.trim())
    .filter(b => b.length > 50)
    .map(b => {
      const lines = b.split('\n');
      const titleMatch = lines[0]?.match(/^\*\*(.+?)\*\*/);
      const title = titleMatch ? titleMatch[1] : '';
      const body = lines.slice(titleMatch ? 1 : 0).join(' ').replace(/\s+/g, ' ').trim();
      return { title, body };
    })
    .filter(b => b.body.length > 30);

  // Field notes
  const fieldNotes = [];
  for (const m of raw.matchAll(/### Field Notes[^\n]*\n\n([\s\S]*?)(?=\n###|\n---|\n## )/g)) {
    fieldNotes.push(m[1].trim().replace(/\s+/g, ' '));
  }

  // Long quotes
  const quotes = [];
  for (const m of raw.matchAll(/> "([^"]{30,})"/g)) {
    quotes.push(m[1]);
  }

  // Fragments
  const fragments = [];
  for (const m of raw.matchAll(/Fragments: ([^\n]+)/g)) {
    fragments.push(...m[1].split(' — ').map(f => f.trim()).filter(f => f.length > 2));
  }

  // Section headers from the atlas
  const headers = [
    'CATALOGUS UMBRAE — SPECIMEN', 'TABULA TREMENDI — SERIES',
    'ATLAS PSYCHE PROFUNDAE', 'INDEX INDIVIDUATIONIS',
    'TABULA SMARAGDINA — OPERATIONES', 'ATLAS PLEROMATIS',
    'TABULA BARDO — TRANSITIONES', 'ATLAS MORTIS ET LUCIS',
    'TABULA VACUITATIS', 'TABULA AUTOPOIETICA',
    'CATALOGUS FATTILLIARDIS — COSMOGONIA', 'ATLAS CRUENTUS — ARTAUD',
    'TABULA HERMETICA — PRINCIPIA', 'CATALOGUS DEMIURGI — SAKLAS',
    'ATLAS CORPORIS INVISIBILIS — MERIDIANI',
    'ATLAS SONORUM — CYMATICS', 'EXEGESIS — ENTRY 2-3-74',
    'ATLAS SOMNIORUM — TRANSFORMATIONES',
    'ATLAS ATLATUM — META-CARTOGRAPHIA', 'TABULA AETERNAE RECURRENTIAE',
    'CATALOGUS COMPUTATIONIS UNIVERSALIS', 'ATLAS ATLATIS — DE SE IPSO',
    'CODEX LINGUA AVIUM', 'TAXONOMY OF NUMINOUS ENCOUNTERS',
    'CARTOGRAPHY OF THE BARDO STATES', 'MERIDIAN SYSTEM OF THE INVISIBLE BODY',
    'FIELD GUIDE TO CONSENSUS REALITY', 'CLASSIFICATION OF THOUGHT-FORMS',
    'THE OBSERVER-OBSERVED PROBLEM (UNRESOLVED)',
    'ERRATA TO THE BOOK OF THE DEAD', 'CENSUS OF PHANTOM ISLANDS (ONGOING)',
    'INVENTORY OF FAILED TAXONOMIES', 'THE VOID: A FIELD GUIDE',
  ];

  // Margin annotations
  const marginNotes = [
    'SEE PAGE ∞', 'cf. §47', 'CROSS-REF: VOID', '→ NIGREDO',
    'NB!', 'STATUS: URGENT', '鬼', '道', '空', 'ERRATA',
    'REVISION 1847', 'DATE UNKNOWN', '→ §892', 'sic!',
    'THE PREVIOUS ENTRY WAS INCORRECT', 'SPECIMEN #4091',
    'PAGE X OF ∞', '⊕', '◉', '∅', '※', '†',
    'WARNING', 'INCOMPLETE', 'THIS SECTION SUPERSEDES',
    'ALL PREVIOUS REVISIONS VOID', 'THE SYSTEM IS THE SYMPTOM',
  ];

  return { journalEntries, fieldNotes, quotes, fragments, headers, marginNotes };
}

function render(seed, W = 3000, H = 3000) {
  const rng = createRng(seed);
  for (let i = 0; i < (seed % 7) + 3; i++) rng();

  const texts = loadTexts();

  // Shuffle all body texts
  const allBodies = [
    ...texts.journalEntries.map(e => e.body),
    ...texts.fieldNotes,
    ...texts.quotes.map(q => `"${q}"`),
  ].sort(() => rng() - 0.5);

  // ─── VOID ───
  const voidCx = W * (0.35 + rng() * 0.3);
  const voidCy = H * (0.35 + rng() * 0.3);
  const voidR = Math.min(W, H) * (0.1 + rng() * 0.08);

  // ─── COLUMN LAYOUT ───
  const numCols = 5 + Math.floor(rng() * 2); // 5-6 columns
  const margin = W * 0.025;
  const colGap = 6;
  const colWidth = (W - margin * 2 - colGap * (numCols - 1)) / numCols;

  console.log(`  Void: (${Math.round(voidCx)},${Math.round(voidCy)}) r=${Math.round(voidR)}`);
  console.log(`  Columns: ${numCols}, width: ${Math.round(colWidth)}px`);

  // ─── BUILD COLUMN CONTENT ───
  // Each column is an array of "blocks" — paragraphs, headers, lists, fragments
  function buildColumn(colIdx) {
    const colRng = createRng(seed + 1000 + colIdx * 137);
    const blocks = [];
    let textPtr = (colIdx * 7) % allBodies.length;

    // Column personality — some are dense, some sparse
    const baseFontSize = 5.5 + colRng() * 1.5; // 5.5-7px
    const lineHeight = baseFontSize * (1.25 + colRng() * 0.15);
    const totalHeight = H - margin * 2;
    let usedHeight = 0;

    while (usedHeight < totalHeight) {
      const blockType = colRng();

      if (blockType < 0.06 && usedHeight > 50) {
        // SECTION HEADER — bold, uppercase, with rule line
        const header = texts.headers[Math.floor(colRng() * texts.headers.length)];
        const headerSize = baseFontSize * 1.1;
        blocks.push({ type: 'header', text: header, fontSize: headerSize, lineHeight: headerSize * 1.5 });
        usedHeight += headerSize * 2.5;
      } else if (blockType < 0.12) {
        // FRAGMENT LIST — short phrases stacked
        const numFrags = 3 + Math.floor(colRng() * 6);
        const fragLines = [];
        for (let f = 0; f < numFrags; f++) {
          fragLines.push(texts.fragments[Math.floor(colRng() * texts.fragments.length)]);
        }
        blocks.push({ type: 'fragments', lines: fragLines, fontSize: baseFontSize * 0.85, lineHeight: baseFontSize * 1.1 });
        usedHeight += numFrags * baseFontSize * 1.2;
      } else if (blockType < 0.18) {
        // NUMBERED LIST
        const numItems = 3 + Math.floor(colRng() * 5);
        const listLines = [];
        for (let li = 0; li < numItems; li++) {
          const frag = texts.fragments[Math.floor(colRng() * texts.fragments.length)];
          listLines.push(`${li + 1}. ${frag}`);
        }
        blocks.push({ type: 'list', lines: listLines, fontSize: baseFontSize * 0.9, lineHeight: baseFontSize * 1.15 });
        usedHeight += numItems * baseFontSize * 1.2;
      } else if (blockType < 0.22) {
        // BLANK SPACE — breathing room
        const gap = 5 + colRng() * 15;
        blocks.push({ type: 'gap', height: gap });
        usedHeight += gap;
      } else {
        // DENSE PARAGRAPH — the default
        const text = allBodies[textPtr % allBodies.length];
        textPtr++;
        blocks.push({ type: 'paragraph', text, fontSize: baseFontSize, lineHeight });
        // Estimate height
        const charsPerLine = Math.floor(colWidth / (baseFontSize * 0.5));
        const numLines = Math.ceil(text.length / charsPerLine);
        usedHeight += numLines * lineHeight + baseFontSize;
      }
    }

    return { blocks, baseFontSize, lineHeight };
  }

  const columns = [];
  for (let c = 0; c < numCols; c++) {
    columns.push(buildColumn(c));
  }

  // ─── RENDER HTML ───
  let htmlParts = [];
  let svgParts = [];

  for (let colIdx = 0; colIdx < numCols; colIdx++) {
    const colX = margin + colIdx * (colWidth + colGap);
    const col = columns[colIdx];
    let y = margin;

    for (const block of col.blocks) {
      if (y > H - margin) break;

      // Check void proximity for this vertical position
      const distToVoid = Math.hypot(colX + colWidth / 2 - voidCx, y - voidCy);
      const voidInf = Math.max(0, 1 - distToVoid / (voidR * 2.2));

      // Inside void core — skip
      if (distToVoid < voidR * 0.7) {
        y += block.type === 'gap' ? block.height : 40;
        continue;
      }

      // Void distortion
      let transformStyle = '';
      let opacityMod = 1;
      if (voidInf > 0.05) {
        opacityMod = Math.max(0.1, 1 - voidInf * 1.3);
        const pushX = ((colX + colWidth / 2 - voidCx) / distToVoid) * voidInf * 25;
        const pushY = ((y - voidCy) / distToVoid) * voidInf * 15;
        const skew = voidInf * 8 * (colX < voidCx ? -1 : 1);
        transformStyle = `transform:translate(${pushX.toFixed(0)}px,${pushY.toFixed(0)}px) skewX(${skew.toFixed(1)}deg);`;

        // Near void: random line dropout
        if (voidInf > 0.3 && createRng(seed + y * 100)() < voidInf * 0.5) {
          y += block.type === 'gap' ? block.height : 30;
          continue;
        }
      }

      if (block.type === 'header') {
        htmlParts.push(
          `<div style="position:absolute;left:${colX}px;top:${y}px;width:${colWidth}px;font-size:${block.fontSize.toFixed(1)}px;font-weight:bold;letter-spacing:1px;opacity:${(0.9 * opacityMod).toFixed(2)};border-bottom:0.5px solid rgba(0,0,0,0.2);padding-bottom:2px;${transformStyle}">${esc(block.text)}</div>`
        );
        y += block.fontSize * 2.5;

      } else if (block.type === 'fragments') {
        for (const line of block.lines) {
          if (y > H - margin) break;
          htmlParts.push(
            `<div style="position:absolute;left:${colX + 8}px;top:${y}px;width:${colWidth - 8}px;font-size:${block.fontSize.toFixed(1)}px;letter-spacing:0.5px;opacity:${(0.7 * opacityMod).toFixed(2)};${transformStyle}">${esc(line)}</div>`
          );
          y += block.lineHeight;
        }
        y += 4;

      } else if (block.type === 'list') {
        for (const line of block.lines) {
          if (y > H - margin) break;
          htmlParts.push(
            `<div style="position:absolute;left:${colX + 4}px;top:${y}px;width:${colWidth - 4}px;font-size:${block.fontSize.toFixed(1)}px;opacity:${(0.8 * opacityMod).toFixed(2)};${transformStyle}">${esc(line)}</div>`
          );
          y += block.lineHeight;
        }
        y += 4;

      } else if (block.type === 'gap') {
        y += block.height;

      } else {
        // Paragraph — word-wrap into lines
        const charsPerLine = Math.floor(colWidth / (block.fontSize * 0.5));
        const words = block.text.split(' ');
        let line = '';

        for (const word of words) {
          if (y > H - margin) break;
          if ((line + ' ' + word).length > charsPerLine) {
            if (line) {
              htmlParts.push(
                `<div style="position:absolute;left:${colX}px;top:${y}px;width:${colWidth}px;font-size:${block.fontSize.toFixed(1)}px;line-height:${block.lineHeight.toFixed(1)}px;opacity:${(0.9 * opacityMod).toFixed(2)};white-space:nowrap;overflow:hidden;${transformStyle}">${esc(line)}</div>`
              );
              y += block.lineHeight;
            }
            line = word;
          } else {
            line = line ? line + ' ' + word : word;
          }
        }
        if (line && y < H - margin) {
          htmlParts.push(
            `<div style="position:absolute;left:${colX}px;top:${y}px;width:${colWidth}px;font-size:${block.fontSize.toFixed(1)}px;line-height:${block.lineHeight.toFixed(1)}px;opacity:${(0.9 * opacityMod).toFixed(2)};white-space:nowrap;overflow:hidden;${transformStyle}">${esc(line)}</div>`
          );
          y += block.lineHeight;
        }
        y += block.fontSize * 0.5; // paragraph gap
      }
    }

    // Column separator
    if (colIdx < numCols - 1) {
      const sepX = colX + colWidth + colGap / 2;
      htmlParts.push(
        `<div style="position:absolute;left:${sepX}px;top:${margin}px;width:0;height:${H - margin * 2}px;border-left:0.4px solid rgba(0,0,0,0.12)"></div>`
      );
    }
  }

  // ─── MARGIN ANNOTATIONS ───
  const mRng = createRng(seed + 800);
  const numAnnotations = 20 + Math.floor(rng() * 20);
  for (let i = 0; i < numAnnotations; i++) {
    // Place in column gutters or outer margins
    const colIdx = Math.floor(mRng() * (numCols + 1));
    let ax;
    if (colIdx === 0) {
      ax = 3 + mRng() * (margin - 5);
    } else if (colIdx === numCols) {
      ax = W - margin + 3 + mRng() * (margin - 5);
    } else {
      ax = margin + colIdx * (colWidth + colGap) - colGap + 1;
    }
    const ay = margin + mRng() * (H - margin * 2);
    const note = texts.marginNotes[Math.floor(mRng() * texts.marginNotes.length)];
    const rot = (mRng() - 0.5) * 20;
    const fs = 3.5 + mRng() * 2;

    htmlParts.push(
      `<div style="position:absolute;left:${ax.toFixed(0)}px;top:${ay.toFixed(0)}px;font-size:${fs.toFixed(1)}px;opacity:${(0.2 + mRng() * 0.3).toFixed(2)};transform:rotate(${rot.toFixed(0)}deg);color:#000;white-space:nowrap">${esc(note)}</div>`
    );
  }

  // ─── SVG: VOID ───
  // Organic void — not smooth gradient but textured
  // Solid black core
  svgParts.push(`<circle cx="${voidCx.toFixed(0)}" cy="${voidCy.toFixed(0)}" r="${(voidR * 0.6).toFixed(0)}" fill="#000"/>`);

  // Feathered rings
  for (let ring = 0; ring < 30; ring++) {
    const r = voidR * (0.6 + ring * 0.018);
    const op = Math.max(0, 0.8 - ring * 0.03);
    svgParts.push(`<circle cx="${voidCx.toFixed(0)}" cy="${voidCy.toFixed(0)}" r="${r.toFixed(0)}" fill="#000" opacity="${op.toFixed(2)}"/>`);
  }

  // Organic edge blobs
  const eRng = createRng(seed + 900);
  for (let i = 0; i < 3000; i++) {
    const a = eRng() * Math.PI * 2;
    const d = voidR * (0.6 + eRng() * 0.8);
    const px = voidCx + Math.cos(a) * d;
    const py = voidCy + Math.sin(a) * d;
    const sz = 0.5 + eRng() * 4;
    const distFromEdge = Math.abs(d - voidR) / voidR;
    const op = Math.max(0, 0.6 - distFromEdge * 1.5) * (0.3 + eRng() * 0.7);
    if (op > 0.02) {
      svgParts.push(`<circle cx="${px.toFixed(0)}" cy="${py.toFixed(0)}" r="${sz.toFixed(1)}" fill="#000" opacity="${op.toFixed(2)}"/>`);
    }
  }

  // Fractal tendrils — branching cracks reaching into the text
  const tRng = createRng(seed + 950);
  for (let t = 0; t < 50; t++) {
    const startAngle = tRng() * Math.PI * 2;
    let tx = voidCx + Math.cos(startAngle) * voidR * 0.9;
    let ty = voidCy + Math.sin(startAngle) * voidR * 0.9;
    let angle = startAngle;
    const numSegs = 8 + Math.floor(tRng() * 25);
    let pathD = `M${tx.toFixed(0)},${ty.toFixed(0)}`;
    const baseWidth = 0.3 + tRng() * 1.2;
    const baseOp = 0.1 + tRng() * 0.25;

    for (let s = 0; s < numSegs; s++) {
      angle += (tRng() - 0.5) * 0.7;
      const segLen = 3 + tRng() * 20;
      tx += Math.cos(angle) * segLen;
      ty += Math.sin(angle) * segLen;
      pathD += ` L${tx.toFixed(0)},${ty.toFixed(0)}`;

      // Branch dots
      if (tRng() > 0.5) {
        const dotSz = 0.3 + tRng() * 2;
        svgParts.push(`<circle cx="${tx.toFixed(0)}" cy="${ty.toFixed(0)}" r="${dotSz.toFixed(1)}" fill="#000" opacity="${(baseOp * 0.8).toFixed(2)}"/>`);
      }

      // Sub-branch
      if (tRng() > 0.7) {
        let bx = tx, by = ty, ba = angle + (tRng() - 0.5) * 1.5;
        let bd = `M${bx.toFixed(0)},${by.toFixed(0)}`;
        for (let bs = 0; bs < 3 + Math.floor(tRng() * 5); bs++) {
          ba += (tRng() - 0.5) * 0.6;
          bx += Math.cos(ba) * (3 + tRng() * 10);
          by += Math.sin(ba) * (3 + tRng() * 10);
          bd += ` L${bx.toFixed(0)},${by.toFixed(0)}`;
        }
        svgParts.push(`<path d="${bd}" fill="none" stroke="#000" stroke-width="${(baseWidth * 0.5).toFixed(1)}" opacity="${(baseOp * 0.5).toFixed(2)}"/>`);
      }
    }
    svgParts.push(`<path d="${pathD}" fill="none" stroke="#000" stroke-width="${baseWidth.toFixed(1)}" opacity="${baseOp.toFixed(2)}"/>`);
  }

  // Scattered text fragments being sucked into the void
  const sRng = createRng(seed + 970);
  for (let i = 0; i < 300; i++) {
    const a = sRng() * Math.PI * 2;
    const d = voidR * (0.8 + sRng() * 2);
    const px = voidCx + Math.cos(a) * d;
    const py = voidCy + Math.sin(a) * d;
    if (px < 0 || px > W || py < 0 || py > H) continue;

    const distNorm = (d - voidR * 0.8) / (voidR * 2);
    const op = Math.max(0.05, (1 - distNorm) * (0.15 + sRng() * 0.35));

    // Rotate toward void center
    const angleToVoid = Math.atan2(voidCy - py, voidCx - px) * 180 / Math.PI;
    const rot = angleToVoid + (sRng() - 0.5) * 30;

    const frag = texts.fragments[Math.floor(sRng() * texts.fragments.length)];
    const slice = frag.slice(0, 1 + Math.floor(sRng() * 6));
    const fs = 3 + sRng() * 6 * (1 - distNorm * 0.5);

    svgParts.push(`<text x="${px.toFixed(0)}" y="${py.toFixed(0)}" font-size="${fs.toFixed(1)}" font-family="'Courier New',monospace" fill="#000" opacity="${op.toFixed(2)}" transform="rotate(${rot.toFixed(0)} ${px.toFixed(0)} ${py.toFixed(0)})">${esc(slice)}</text>`);
  }

  // Connection lines from void outward
  const cRng = createRng(seed + 980);
  for (let i = 0; i < 50; i++) {
    const a = cRng() * Math.PI * 2;
    const sr = voidR * 0.85;
    const er = voidR * (2 + cRng() * 5);
    const sx = voidCx + Math.cos(a) * sr;
    const sy = voidCy + Math.sin(a) * sr;
    const ex = voidCx + Math.cos(a + (cRng() - 0.5) * 0.3) * er;
    const ey = voidCy + Math.sin(a + (cRng() - 0.5) * 0.3) * er;
    svgParts.push(`<line x1="${sx.toFixed(0)}" y1="${sy.toFixed(0)}" x2="${ex.toFixed(0)}" y2="${ey.toFixed(0)}" stroke="#000" stroke-width="${(0.15 + cRng() * 0.3).toFixed(2)}" opacity="${(0.03 + cRng() * 0.06).toFixed(2)}"/>`);
  }

  // Page notation
  svgParts.push(`<text x="15" y="${H - 12}" font-size="6" font-family="'Courier New',monospace" fill="#000" opacity="0.3">§${(seed % 999) + 1} — FIELD NOTES — STATUS: INCOMPLETE / ONGOING / ABANDONED / URGENT</text>`);

  console.log(`  Text elements: ${htmlParts.length}`);
  console.log(`  SVG elements: ${svgParts.length}`);

  return `<!DOCTYPE html><html><head><style>
*{margin:0;padding:0}
body{width:${W}px;height:${H}px;background:#f0ebe0;position:relative;overflow:hidden;font-family:'Courier New',monospace;color:#000}
</style></head><body>
${htmlParts.join('\n')}
<svg style="position:absolute;left:0;top:0;width:${W}px;height:${H}px;pointer-events:none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
${svgParts.join('\n')}
</svg>
</body></html>`;
}

// CLI
const seed = parseInt(process.argv[2]) || Math.floor(Math.random() * 100000);
const name = process.argv[3] || `manuscript-${seed}`;
const out = path.join(OUTPUT_DIR, `${name}.png`);

console.log(`\nRendering Manuscript v2...`);
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
