/**
 * Deep Reality Atlas — Unhinged Renderer
 *
 * Everything at once. Every weird idea. Stackable chaos layers:
 *   - Paper fiber, stains, foxing, aged tone
 *   - Ink-bleed void (reused from exquisite)
 *   - PALIMPSEST: ghost text strata underneath (different rotation, older hand)
 *   - CORRECTIONS: strike-throughs, circled errors, marginal rewrites, "NO" scrawls
 *   - REDACTIONS: pure black classified-document blocks
 *   - PASTED NOTES: rotated rectangles of different paper with tape corners
 *   - CURVED TEXT: SVG textPath along spirals, rings, meridian curves
 *   - TORN EDGE: jagged wound across a corner or side, ink pooling at tear
 *   - HAND-DRAWN BORDER: wobbly frame sometimes with panel dividers
 *   - TEXT-AS-ORGANISM: text following cellular outlines, no drawing needed
 *   - PROCEDURAL SYMBOL: unique recurring glyph per seed, repeated obsessively
 *   - FOUND-OBJECT BACKGROUND: faint anatomical/cosmological drawing underneath
 *
 * Usage: node renderer/render-unhinged.mjs [seed] [output-name] [flags]
 *
 *   --variant=light|dark|burnt           paper/ink palette
 *   --composition=center|corner|edge|dispersed|torn|framed|palimpsest
 *   --chaos=low|medium|high              how many effects stack
 *
 * Example:
 *   node renderer/render-unhinged.mjs 217 page01 --variant=light --composition=torn --chaos=high
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'gallery');
const CONTENT_DIR = path.join(__dirname, '..', 'content');

// ════════════════════════════════════════════════════════════
// CORE UTILITIES
// ════════════════════════════════════════════════════════════

function createRng(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// Value noise (seeded)
function valueNoise(rng) {
  const SIZE = 64;
  const grid = new Float32Array(SIZE * SIZE);
  for (let i = 0; i < grid.length; i++) grid[i] = rng();
  return (x, y) => {
    const sx = (x % SIZE + SIZE) % SIZE;
    const sy = (y % SIZE + SIZE) % SIZE;
    const x0 = Math.floor(sx), y0 = Math.floor(sy);
    const x1 = (x0 + 1) % SIZE, y1 = (y0 + 1) % SIZE;
    const fx = sx - x0, fy = sy - y0;
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    const a = grid[x0 + y0 * SIZE];
    const b = grid[x1 + y0 * SIZE];
    const c = grid[x0 + y1 * SIZE];
    const d = grid[x1 + y1 * SIZE];
    return a * (1-ux)*(1-uy) + b * ux*(1-uy) + c * (1-ux)*uy + d * ux*uy;
  };
}
function fbm(noise, x, y, octaves=4) {
  let sum = 0, amp = 1, freq = 1, total = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise(x * freq, y * freq);
    total += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / total;
}

function loadTexts() {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, 'holy-book-of-insanity.md'), 'utf-8');
  const jStart = raw.indexOf('# THE JOURNAL');
  const jText = jStart > -1 ? raw.slice(jStart) : '';
  const entries = jText.split(/\n---\n/).slice(1)
    .map(b => b.trim()).filter(b => b.length > 50)
    .map(b => b.split('\n').filter(l => !l.startsWith('**')).join(' ').replace(/\s+/g,' ').trim())
    .filter(b => b.length > 30);
  const fieldNotes = [];
  for (const m of raw.matchAll(/### Field Notes[^\n]*\n\n([\s\S]*?)(?=\n###|\n---|\n## )/g))
    fieldNotes.push(m[1].trim().replace(/\s+/g,' '));
  const quotes = [];
  for (const m of raw.matchAll(/> "([^"]{30,})"/g)) quotes.push(m[1]);
  const fragments = [];
  for (const m of raw.matchAll(/Fragments: ([^\n]+)/g))
    fragments.push(...m[1].split(' — ').map(f=>f.trim()).filter(f=>f.length>2));
  const headers = [
    'CATALOGUS UMBRAE','TABULA TREMENDI','ATLAS PSYCHE PROFUNDAE','TABULA SMARAGDINA',
    'ATLAS PLEROMATIS','TABULA BARDO','TABULA VACUITATIS','TABULA AUTOPOIETICA',
    'ATLAS CRUENTUS','CATALOGUS DEMIURGI','ATLAS CORPORIS INVISIBILIS','EXEGESIS 2-3-74',
    'TAXONOMY OF NUMINOUS ENCOUNTERS','THE VOID: A FIELD GUIDE',
    'INVENTORY OF FAILED TAXONOMIES','ERRATA TO THE BOOK OF THE DEAD',
    'ATLAS SOMNIORUM','TABULA AETERNAE RECURRENTIAE','CODEX LINGUA AVIUM',
  ];
  const marginNotes = [
    'SEE PAGE ∞','cf. §47','→ NIGREDO','NB!','STATUS: URGENT','鬼','道','空',
    'ERRATA','→ §892','sic!','SPECIMEN #4091','⊕','◉','∅','※','†','WARNING',
    'ALL PREVIOUS REVISIONS VOID','THE SYSTEM IS THE SYMPTOM','hic sunt dracones',
    'NO','WRONG','REDO','FALSE','DESTROY','???','→→→','←','stet',
  ];
  const allText = [...entries,...fieldNotes,...quotes.map(q=>`"${q}"`)];
  return { entries, fieldNotes, quotes, fragments, headers, marginNotes, allText };
}

// Ink-bleed closed path for voids and stains
function generateInkBleedPath(cx, cy, baseR, seed, raggedness=0.35, steps=720) {
  const rng = createRng(seed);
  const noise = valueNoise(rng);
  let path = 'M';
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const nx = Math.cos(a) * 3;
    const ny = Math.sin(a) * 3;
    const n1 = fbm(noise, nx, ny, 5);
    const n2 = fbm(noise, nx * 4 + 17, ny * 4 + 23, 3);
    const deform = 1 + (n1 - 0.5) * raggedness * 2 + (n2 - 0.5) * raggedness;
    const r = baseR * Math.max(0.3, deform);
    path += (i === 0 ? '' : ' L') + `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`;
  }
  return path + ' Z';
}

function makeOcclusionTester() {
  const rects = [], circles = [];
  const api = {
    addRect(x, y, w, h, pad=0) { rects.push({x: x-pad, y: y-pad, w: w+pad*2, h: h+pad*2}); },
    addCircle(cx, cy, r, pad=0) { circles.push({cx, cy, r: r+pad}); },
    test(x, y, w=0, h=0) {
      for (const r of rects) {
        if (x + w > r.x && x < r.x + r.w && y + h > r.y && y < r.y + r.h) return true;
      }
      for (const c of circles) {
        const clx = Math.max(x, Math.min(c.cx, x + w));
        const cly = Math.max(y, Math.min(c.cy, y + h));
        const dx = c.cx - clx, dy = c.cy - cly;
        if (dx*dx + dy*dy < c.r*c.r) return true;
      }
      return false;
    },
    testPoint(x, y) { return api.test(x, y, 0, 0); }
  };
  return api;
}

// ════════════════════════════════════════════════════════════
// PROCEDURAL SYMBOL — unique per-seed glyph
// ════════════════════════════════════════════════════════════

function buildProceduralSymbol(seed) {
  // Returns an SVG string template function: symbolAt(cx, cy, sz, opacity)
  const rng = createRng(seed + 13579);
  // Pick primitives to combine
  const hasCircle = rng() > 0.2;
  const hasInnerShape = rng() > 0.3;
  const hasLine = rng() > 0.25;
  const hasDot = rng() > 0.2;
  const hasHook = rng() > 0.5;
  const innerShape = Math.floor(rng() * 4); // 0:triangle, 1:square, 2:cross, 3:diamond
  const lineAngle = rng() * Math.PI * 2;
  const lineLen = 0.6 + rng() * 0.6;
  const dotOffsetAngle = rng() * Math.PI * 2;
  const dotOffsetDist = 0.3 + rng() * 0.5;
  const hookStartAngle = rng() * Math.PI * 2;

  return function symbolAt(cx, cy, sz, opacity=0.8, stroke='#000') {
    let out = '';
    if (hasCircle) {
      out += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(sz*0.4).toFixed(1)}" fill="none" stroke="${stroke}" stroke-width="${Math.max(0.3, sz*0.07).toFixed(2)}" opacity="${opacity}"/>`;
    }
    if (hasInnerShape) {
      const ir = sz * 0.2;
      if (innerShape === 0) {
        out += `<polygon points="${cx},${cy-ir} ${cx+ir*0.87},${cy+ir*0.5} ${cx-ir*0.87},${cy+ir*0.5}" fill="none" stroke="${stroke}" stroke-width="${Math.max(0.3, sz*0.06).toFixed(2)}" opacity="${opacity}"/>`;
      } else if (innerShape === 1) {
        out += `<rect x="${(cx-ir).toFixed(1)}" y="${(cy-ir).toFixed(1)}" width="${(ir*2).toFixed(1)}" height="${(ir*2).toFixed(1)}" fill="none" stroke="${stroke}" stroke-width="${Math.max(0.3, sz*0.06).toFixed(2)}" opacity="${opacity}"/>`;
      } else if (innerShape === 2) {
        out += `<line x1="${(cx-ir).toFixed(1)}" y1="${cy.toFixed(1)}" x2="${(cx+ir).toFixed(1)}" y2="${cy.toFixed(1)}" stroke="${stroke}" stroke-width="${Math.max(0.3, sz*0.06).toFixed(2)}" opacity="${opacity}"/>`;
        out += `<line x1="${cx.toFixed(1)}" y1="${(cy-ir).toFixed(1)}" x2="${cx.toFixed(1)}" y2="${(cy+ir).toFixed(1)}" stroke="${stroke}" stroke-width="${Math.max(0.3, sz*0.06).toFixed(2)}" opacity="${opacity}"/>`;
      } else {
        out += `<polygon points="${cx},${cy-ir} ${cx+ir},${cy} ${cx},${cy+ir} ${cx-ir},${cy}" fill="none" stroke="${stroke}" stroke-width="${Math.max(0.3, sz*0.06).toFixed(2)}" opacity="${opacity}"/>`;
      }
    }
    if (hasLine) {
      const x1 = cx + Math.cos(lineAngle) * sz * lineLen * 0.4;
      const y1 = cy + Math.sin(lineAngle) * sz * lineLen * 0.4;
      const x2 = cx - Math.cos(lineAngle) * sz * lineLen * 0.4;
      const y2 = cy - Math.sin(lineAngle) * sz * lineLen * 0.4;
      out += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${stroke}" stroke-width="${Math.max(0.3, sz*0.07).toFixed(2)}" opacity="${opacity}"/>`;
    }
    if (hasDot) {
      const dx = cx + Math.cos(dotOffsetAngle) * sz * dotOffsetDist;
      const dy = cy + Math.sin(dotOffsetAngle) * sz * dotOffsetDist;
      out += `<circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="${(sz*0.08).toFixed(2)}" fill="${stroke}" opacity="${opacity}"/>`;
    }
    if (hasHook) {
      const hx = cx + Math.cos(hookStartAngle) * sz * 0.4;
      const hy = cy + Math.sin(hookStartAngle) * sz * 0.4;
      const ex = hx + Math.cos(hookStartAngle + Math.PI/2) * sz * 0.3;
      const ey = hy + Math.sin(hookStartAngle + Math.PI/2) * sz * 0.3;
      out += `<path d="M${hx.toFixed(1)},${hy.toFixed(1)} Q${(cx + sz*0.3).toFixed(1)},${(cy - sz*0.3).toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}" fill="none" stroke="${stroke}" stroke-width="${Math.max(0.3, sz*0.06).toFixed(2)}" opacity="${opacity}"/>`;
    }
    return out;
  };
}

// ════════════════════════════════════════════════════════════
// PROCEDURAL SCRIPT — unique alphabet per seed
// ════════════════════════════════════════════════════════════

function buildProceduralAlphabet(seed, numGlyphs = 40) {
  const rng = createRng(seed + 24680);
  const glyphs = [];
  for (let g = 0; g < numGlyphs; g++) {
    const gRng = createRng(seed + g * 137 + 111);
    const strokes = 2 + Math.floor(gRng() * 4);
    let paths = [];
    // Within a 1x1 box, generate stroke paths
    for (let s = 0; s < strokes; s++) {
      const startX = gRng();
      const startY = gRng();
      const segs = 1 + Math.floor(gRng() * 3);
      let d = `M${startX.toFixed(2)},${startY.toFixed(2)}`;
      let px = startX, py = startY;
      for (let i = 0; i < segs; i++) {
        px = Math.max(0, Math.min(1, px + (gRng() - 0.5) * 0.8));
        py = Math.max(0, Math.min(1, py + (gRng() - 0.5) * 0.8));
        if (gRng() > 0.5) {
          d += ` L${px.toFixed(2)},${py.toFixed(2)}`;
        } else {
          const cx = Math.max(0, Math.min(1, px + (gRng()-0.5)*0.3));
          const cy = Math.max(0, Math.min(1, py + (gRng()-0.5)*0.3));
          d += ` Q${cx.toFixed(2)},${cy.toFixed(2)} ${px.toFixed(2)},${py.toFixed(2)}`;
        }
      }
      paths.push(d);
    }
    glyphs.push(paths);
  }
  return function drawGlyph(idx, cx, cy, sz, stroke='#000', opacity=0.8) {
    const paths = glyphs[idx % glyphs.length];
    const sw = Math.max(0.25, sz * 0.08);
    // Transform each path: scale to sz, offset to (cx-sz/2, cy-sz/2)
    let out = '';
    for (const p of paths) {
      // Replace each coord pair with scaled+offset
      const transformed = p.replace(/([MLQ])(\s*-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_, cmd, a, b) => {
        const x = cx - sz/2 + parseFloat(a) * sz;
        const y = cy - sz/2 + parseFloat(b) * sz;
        return `${cmd}${x.toFixed(1)},${y.toFixed(1)}`;
      });
      out += `<path d="${transformed}" fill="none" stroke="${stroke}" stroke-width="${sw.toFixed(2)}" opacity="${opacity}" stroke-linecap="round"/>`;
    }
    return out;
  };
}

// ════════════════════════════════════════════════════════════
// PAPER TEXTURE
// ════════════════════════════════════════════════════════════

function paperTextureSVG(W, H, seed, variant) {
  const parts = [];
  const rng = createRng(seed + 99999);
  const bg = variant === 'dark' ? '#14100b' : variant === 'burnt' ? '#1a1208' : '#f0ebe0';
  const ink = variant === 'dark' ? '#ddd6c9' : variant === 'burnt' ? '#e0d8c5' : '#1a0f08';

  // Stains
  const numStains = 3 + Math.floor(rng() * 4);
  for (let i = 0; i < numStains; i++) {
    const cx = W * rng(), cy = H * rng();
    const r = 80 + rng() * 300;
    const stainOp = 0.03 + rng() * 0.05;
    const stainColor = variant === 'light' ? '#8a6030' : '#2a1a08';
    if (rng() > 0.5) {
      parts.push(`<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="none" stroke="${stainColor}" stroke-width="${(2+rng()*6).toFixed(1)}" opacity="${stainOp.toFixed(2)}"/>`);
      parts.push(`<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${(r*0.95).toFixed(0)}" fill="${stainColor}" opacity="${(stainOp*0.3).toFixed(2)}"/>`);
    } else {
      parts.push(`<path d="${generateInkBleedPath(cx, cy, r, seed + 9000 + i, 0.4, 200)}" fill="${stainColor}" opacity="${stainOp.toFixed(2)}"/>`);
    }
  }
  // Foxing
  const numFoxing = variant === 'light' ? 80 + Math.floor(rng() * 80) : 30;
  const foxingColor = variant === 'light' ? '#9a7040' : '#3a2010';
  for (let i = 0; i < numFoxing; i++) {
    const cx = W * rng(), cy = H * rng();
    const r = 1 + rng() * 6;
    parts.push(`<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(1)}" fill="${foxingColor}" opacity="${(0.08+rng()*0.15).toFixed(2)}"/>`);
    if (rng() > 0.6) for (let j = 0; j < 3 + Math.floor(rng()*4); j++) {
      parts.push(`<circle cx="${(cx + (rng()-0.5)*15).toFixed(0)}" cy="${(cy + (rng()-0.5)*15).toFixed(0)}" r="${(0.5+rng()*2).toFixed(1)}" fill="${foxingColor}" opacity="${(0.04+rng()*0.08).toFixed(2)}"/>`);
    }
  }
  // Fiber
  for (let i = 0; i < 4000; i++) {
    const x = W * rng(), y = H * rng();
    const fiberColor = variant === 'light' ? '#d8c8a0' : '#3a2818';
    parts.push(`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(0.3+rng()*0.7).toFixed(1)}" fill="${fiberColor}" opacity="${(0.06+rng()*0.1).toFixed(2)}"/>`);
  }
  return { bg, ink, parts };
}

// ════════════════════════════════════════════════════════════
// FOUND-OBJECT BACKGROUND — anatomical / cosmic drawing underneath
// ════════════════════════════════════════════════════════════

function drawFoundObject(parts, W, H, seed, ink) {
  const rng = createRng(seed + 77777);
  const type = Math.floor(rng() * 4);
  const cx = W * 0.5, cy = H * 0.5;
  const scale = Math.min(W, H) * 0.35;
  const op = 0.07;

  if (type === 0) {
    // Anatomical skeleton-like vertical figure
    // Skull
    parts.push(`<circle cx="${cx}" cy="${(cy - scale*1.1).toFixed(0)}" r="${(scale*0.16).toFixed(0)}" fill="none" stroke="${ink}" stroke-width="1" opacity="${op}"/>`);
    // Eye sockets
    parts.push(`<circle cx="${(cx - scale*0.055).toFixed(0)}" cy="${(cy - scale*1.1).toFixed(0)}" r="${(scale*0.028).toFixed(0)}" fill="${ink}" opacity="${op*0.8}"/>`);
    parts.push(`<circle cx="${(cx + scale*0.055).toFixed(0)}" cy="${(cy - scale*1.1).toFixed(0)}" r="${(scale*0.028).toFixed(0)}" fill="${ink}" opacity="${op*0.8}"/>`);
    // Spine as vertical line with vertebrae
    for (let v = 0; v < 24; v++) {
      const vy = cy - scale * 0.9 + v * scale * 0.07;
      parts.push(`<line x1="${(cx-scale*0.04).toFixed(0)}" y1="${vy.toFixed(0)}" x2="${(cx+scale*0.04).toFixed(0)}" y2="${vy.toFixed(0)}" stroke="${ink}" stroke-width="1.2" opacity="${op}"/>`);
      parts.push(`<circle cx="${cx}" cy="${vy.toFixed(0)}" r="${(scale*0.025).toFixed(0)}" fill="none" stroke="${ink}" stroke-width="0.5" opacity="${op*0.6}"/>`);
    }
    // Ribcage
    for (let r = 0; r < 10; r++) {
      const ry = cy - scale*0.75 + r * scale * 0.075;
      const rw = scale * (0.45 - Math.abs(r - 4) * 0.03);
      parts.push(`<path d="M${(cx-rw).toFixed(0)},${ry.toFixed(0)} Q${cx},${(ry-scale*0.05).toFixed(0)} ${(cx+rw).toFixed(0)},${ry.toFixed(0)}" fill="none" stroke="${ink}" stroke-width="0.8" opacity="${op*0.8}"/>`);
    }
    // Pelvis
    parts.push(`<ellipse cx="${cx}" cy="${(cy+scale*0.15).toFixed(0)}" rx="${(scale*0.25).toFixed(0)}" ry="${(scale*0.12).toFixed(0)}" fill="none" stroke="${ink}" stroke-width="1" opacity="${op}"/>`);
    // Arms
    for (const side of [-1, 1]) {
      const ax = cx + side * scale * 0.12;
      parts.push(`<line x1="${ax.toFixed(0)}" y1="${(cy-scale*0.75).toFixed(0)}" x2="${(ax+side*scale*0.45).toFixed(0)}" y2="${(cy-scale*0.3).toFixed(0)}" stroke="${ink}" stroke-width="1.2" opacity="${op}"/>`);
      parts.push(`<line x1="${(ax+side*scale*0.45).toFixed(0)}" y1="${(cy-scale*0.3).toFixed(0)}" x2="${(ax+side*scale*0.55).toFixed(0)}" y2="${(cy+scale*0.1).toFixed(0)}" stroke="${ink}" stroke-width="1.2" opacity="${op}"/>`);
    }
    // Legs
    for (const side of [-1, 1]) {
      const lx = cx + side * scale * 0.1;
      parts.push(`<line x1="${lx.toFixed(0)}" y1="${(cy+scale*0.22).toFixed(0)}" x2="${(lx+side*scale*0.12).toFixed(0)}" y2="${(cy+scale*0.7).toFixed(0)}" stroke="${ink}" stroke-width="1.2" opacity="${op}"/>`);
      parts.push(`<line x1="${(lx+side*scale*0.12).toFixed(0)}" y1="${(cy+scale*0.7).toFixed(0)}" x2="${(lx+side*scale*0.15).toFixed(0)}" y2="${(cy+scale*1.1).toFixed(0)}" stroke="${ink}" stroke-width="1.2" opacity="${op}"/>`);
    }

  } else if (type === 1) {
    // Star chart / astronomical
    // Outer circle
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${scale.toFixed(0)}" fill="none" stroke="${ink}" stroke-width="1.2" opacity="${op}"/>`);
    // Inner circles (celestial spheres)
    for (let i = 1; i < 5; i++) {
      parts.push(`<circle cx="${cx}" cy="${cy}" r="${(scale * i / 5).toFixed(0)}" fill="none" stroke="${ink}" stroke-width="0.5" opacity="${op*0.6}"/>`);
    }
    // Zodiac radial spokes
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      parts.push(`<line x1="${cx}" y1="${cy}" x2="${(cx+Math.cos(a)*scale).toFixed(0)}" y2="${(cy+Math.sin(a)*scale).toFixed(0)}" stroke="${ink}" stroke-width="0.6" opacity="${op*0.7}"/>`);
    }
    // Stars
    const sRng = createRng(seed + 111);
    for (let i = 0; i < 60; i++) {
      const a = sRng() * Math.PI * 2;
      const d = sRng() * scale;
      const x = cx + Math.cos(a) * d;
      const y = cy + Math.sin(a) * d;
      const sz = 1 + sRng() * 3;
      parts.push(`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${sz.toFixed(1)}" fill="${ink}" opacity="${op*1.5}"/>`);
      if (sRng() > 0.7) {
        for (const a2 of [0, Math.PI/2]) {
          parts.push(`<line x1="${(x-Math.cos(a2)*sz*3).toFixed(0)}" y1="${(y-Math.sin(a2)*sz*3).toFixed(0)}" x2="${(x+Math.cos(a2)*sz*3).toFixed(0)}" y2="${(y+Math.sin(a2)*sz*3).toFixed(0)}" stroke="${ink}" stroke-width="0.4" opacity="${op*0.8}"/>`);
        }
      }
    }

  } else if (type === 2) {
    // Flower / botanical cross-section
    const petals = 8;
    for (let p = 0; p < petals; p++) {
      const a = (p / petals) * Math.PI * 2;
      let d = `M${cx},${cy}`;
      for (let t = 0; t <= 30; t++) {
        const tt = t / 30;
        const petalR = scale * tt;
        const petalWidth = Math.sin(tt * Math.PI) * 0.3;
        const pa = a + petalWidth;
        d += ` L${(cx + Math.cos(pa) * petalR).toFixed(0)},${(cy + Math.sin(pa) * petalR).toFixed(0)}`;
      }
      for (let t = 30; t >= 0; t--) {
        const tt = t / 30;
        const petalR = scale * tt;
        const petalWidth = Math.sin(tt * Math.PI) * 0.3;
        const pa = a - petalWidth;
        d += ` L${(cx + Math.cos(pa) * petalR).toFixed(0)},${(cy + Math.sin(pa) * petalR).toFixed(0)}`;
      }
      d += ' Z';
      parts.push(`<path d="${d}" fill="none" stroke="${ink}" stroke-width="0.8" opacity="${op}"/>`);
    }
    // Central pistil
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${(scale*0.08).toFixed(0)}" fill="none" stroke="${ink}" stroke-width="1.5" opacity="${op}"/>`);
    // Stamen dots
    const stRng = createRng(seed + 222);
    for (let i = 0; i < 24; i++) {
      const a = stRng() * Math.PI * 2;
      const d = stRng() * scale * 0.12;
      parts.push(`<circle cx="${(cx+Math.cos(a)*d).toFixed(0)}" cy="${(cy+Math.sin(a)*d).toFixed(0)}" r="${(1+stRng()*2).toFixed(1)}" fill="${ink}" opacity="${op*1.2}"/>`);
    }

  } else {
    // Compass rose / map
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${scale.toFixed(0)}" fill="none" stroke="${ink}" stroke-width="1" opacity="${op}"/>`);
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${(scale*0.85).toFixed(0)}" fill="none" stroke="${ink}" stroke-width="0.5" opacity="${op*0.6}"/>`);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const inner = scale * (i % 4 === 0 ? 0.2 : 0.5);
      const outer = scale * (i % 4 === 0 ? 1 : 0.85);
      parts.push(`<line x1="${(cx+Math.cos(a)*inner).toFixed(0)}" y1="${(cy+Math.sin(a)*inner).toFixed(0)}" x2="${(cx+Math.cos(a)*outer).toFixed(0)}" y2="${(cy+Math.sin(a)*outer).toFixed(0)}" stroke="${ink}" stroke-width="${i%4===0?1.2:0.5}" opacity="${op}"/>`);
    }
    // Label ring
    for (const [lbl, a] of [['N', -Math.PI/2], ['E', 0], ['S', Math.PI/2], ['W', Math.PI]]) {
      parts.push(`<text x="${(cx+Math.cos(a)*scale*1.05).toFixed(0)}" y="${(cy+Math.sin(a)*scale*1.05+4).toFixed(0)}" font-size="18" fill="${ink}" opacity="${op*1.3}" text-anchor="middle" font-family="'Courier New',monospace">${lbl}</text>`);
    }
  }
}

// ════════════════════════════════════════════════════════════
// TORN EDGE — generate a jagged polygon that excludes a corner/side
// ════════════════════════════════════════════════════════════

function generateTearMask(W, H, seed) {
  // Returns { clipPath: SVG path string, edgeInkPaths: [svgStrings] }
  const rng = createRng(seed + 54321);
  const noise = valueNoise(rng);
  const side = Math.floor(rng() * 4); // 0=top, 1=right, 2=bottom, 3=left
  const cornerSeverity = 0.2 + rng() * 0.25; // fraction of page torn away

  // Build a jagged path across one side
  const tearPoints = [];
  const nPoints = 60 + Math.floor(rng() * 40);

  for (let i = 0; i <= nPoints; i++) {
    const t = i / nPoints;
    let x, y;
    if (side === 0) { // top torn
      x = W * t;
      const baseY = H * cornerSeverity;
      const n = fbm(noise, t * 8, 10, 5);
      y = baseY * (0.5 + n * 0.8) + (rng() - 0.5) * 20;
    } else if (side === 1) { // right torn
      y = H * t;
      const baseX = W * (1 - cornerSeverity);
      const n = fbm(noise, t * 8, 20, 5);
      x = baseX + (W - baseX) * (1 - (0.5 + n * 0.8)) + (rng()-0.5)*20;
    } else if (side === 2) { // bottom torn
      x = W * t;
      const baseY = H * (1 - cornerSeverity);
      const n = fbm(noise, t * 8, 30, 5);
      y = baseY + (H - baseY) * (1 - (0.5 + n * 0.8)) + (rng()-0.5)*20;
    } else { // left torn
      y = H * t;
      const baseX = W * cornerSeverity;
      const n = fbm(noise, t * 8, 40, 5);
      x = baseX * (0.5 + n * 0.8) + (rng()-0.5)*20;
    }
    tearPoints.push({ x, y });
  }

  // Build clip polygon: the KEPT area (not the torn area)
  let clip = 'M';
  if (side === 0) {
    clip += `${tearPoints[0].x.toFixed(0)},${tearPoints[0].y.toFixed(0)}`;
    for (const p of tearPoints) clip += ` L${p.x.toFixed(0)},${p.y.toFixed(0)}`;
    clip += ` L${W},${H} L0,${H} Z`;
  } else if (side === 1) {
    clip += `0,0 L${tearPoints[0].x.toFixed(0)},${tearPoints[0].y.toFixed(0)}`;
    for (const p of tearPoints) clip += ` L${p.x.toFixed(0)},${p.y.toFixed(0)}`;
    clip += ` L0,${H} Z`;
  } else if (side === 2) {
    clip += `0,0 L${W},0 L${tearPoints[0].x.toFixed(0)},${tearPoints[0].y.toFixed(0)}`;
    for (const p of tearPoints) clip += ` L${p.x.toFixed(0)},${p.y.toFixed(0)}`;
    clip += ` Z`;
  } else {
    clip += `${tearPoints[0].x.toFixed(0)},${tearPoints[0].y.toFixed(0)}`;
    for (const p of tearPoints) clip += ` L${p.x.toFixed(0)},${p.y.toFixed(0)}`;
    clip += ` L${W},${H} L${W},0 Z`;
  }

  // Generate ink pooling paths near the tear
  const edgeInkPaths = [];
  for (let i = 0; i < tearPoints.length - 1; i++) {
    if (rng() > 0.7) {
      const p = tearPoints[i];
      const sz = 2 + rng() * 10;
      edgeInkPaths.push(`<circle cx="${p.x.toFixed(0)}" cy="${p.y.toFixed(0)}" r="${sz.toFixed(1)}" fill="#000" opacity="${(0.2 + rng()*0.4).toFixed(2)}"/>`);
    }
  }

  // Generate the tear line itself as an SVG path (visible jagged edge)
  let tearLine = 'M';
  for (let i = 0; i < tearPoints.length; i++) {
    tearLine += (i === 0 ? '' : ' L') + `${tearPoints[i].x.toFixed(0)},${tearPoints[i].y.toFixed(0)}`;
  }

  return { clipPath: clip, edgeInkPaths, tearLine, side, tearPoints };
}

// ════════════════════════════════════════════════════════════
// HAND-DRAWN BORDER — wobbly rectangle
// ════════════════════════════════════════════════════════════

function drawHandDrawnBorder(parts, W, H, seed, ink) {
  const rng = createRng(seed + 3333);
  const margin = 40 + rng() * 40;
  const wobble = 2 + rng() * 4;
  const ns = rng() * 100;
  const noise = valueNoise(createRng(seed+3334));

  // Four sides with wobble
  const sides = [
    { x1: margin, y1: margin, x2: W-margin, y2: margin }, // top
    { x1: W-margin, y1: margin, x2: W-margin, y2: H-margin }, // right
    { x1: W-margin, y1: H-margin, x2: margin, y2: H-margin }, // bottom
    { x1: margin, y1: H-margin, x2: margin, y2: margin }, // left
  ];

  for (let s = 0; s < 4; s++) {
    const side = sides[s];
    const steps = 100;
    let d = `M${side.x1.toFixed(0)},${side.y1.toFixed(0)}`;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const baseX = side.x1 + (side.x2 - side.x1) * t;
      const baseY = side.y1 + (side.y2 - side.y1) * t;
      const n1 = fbm(noise, ns + s * 10 + t * 5, 0, 3);
      const n2 = fbm(noise, ns + s * 10 + t * 5, 10, 3);
      const perpX = -(side.y2 - side.y1), perpY = (side.x2 - side.x1);
      const len = Math.hypot(perpX, perpY);
      const px = baseX + (perpX/len) * (n1-0.5) * wobble;
      const py = baseY + (perpY/len) * (n2-0.5) * wobble;
      d += ` L${px.toFixed(1)},${py.toFixed(1)}`;
    }
    parts.push(`<path d="${d}" fill="none" stroke="${ink}" stroke-width="${(1 + rng() * 1.5).toFixed(1)}" opacity="${(0.5 + rng() * 0.3).toFixed(2)}"/>`);
  }

  // Corner flourishes
  if (rng() > 0.5) {
    for (const corner of [[margin, margin], [W-margin, margin], [margin, H-margin], [W-margin, H-margin]]) {
      if (rng() > 0.3) continue;
      const [cx, cy] = corner;
      // Small crosshatch ornament
      for (let i = 0; i < 3; i++) {
        const ox = (rng()-0.5) * 15, oy = (rng()-0.5) * 15;
        parts.push(`<line x1="${(cx+ox-6).toFixed(0)}" y1="${(cy+oy).toFixed(0)}" x2="${(cx+ox+6).toFixed(0)}" y2="${(cy+oy).toFixed(0)}" stroke="${ink}" stroke-width="0.6" opacity="0.5"/>`);
        parts.push(`<line x1="${(cx+ox).toFixed(0)}" y1="${(cy+oy-6).toFixed(0)}" x2="${(cx+ox).toFixed(0)}" y2="${(cy+oy+6).toFixed(0)}" stroke="${ink}" stroke-width="0.6" opacity="0.5"/>`);
      }
    }
  }
}

// ════════════════════════════════════════════════════════════
// ORGANISMS (compact version)
// ════════════════════════════════════════════════════════════

function drawOrganism(svgParts, cx, cy, sz, seed, ink='#000', opacity=0.85) {
  const rng = createRng(seed);
  const noise = valueNoise(rng);
  const type = Math.floor(rng() * 5);
  let membrane = 'M';
  const resolution = 80;
  const nseed = rng() * 100;

  if (type === 0 || type === 4) {
    const roughness = type === 4 ? 0.45 : 0.28;
    for (let i = 0; i <= resolution; i++) {
      const a = (i / resolution) * Math.PI * 2;
      const n = fbm(noise, Math.cos(a) * 2.5 + nseed, Math.sin(a) * 2.5 + nseed, type === 4 ? 5 : 3);
      const w = sz * (0.55 + n * roughness);
      membrane += (i === 0 ? '' : ' L') + `${(cx + Math.cos(a) * w).toFixed(1)},${(cy + Math.sin(a) * w).toFixed(1)}`;
    }
  } else if (type === 1) {
    const rot = rng() * Math.PI, cos = Math.cos(rot), sin = Math.sin(rot);
    const squash = 0.4 + rng() * 0.3;
    for (let i = 0; i <= resolution; i++) {
      const a = (i / resolution) * Math.PI * 2;
      const n = fbm(noise, Math.cos(a) * 3 + nseed, Math.sin(a) * 3 + nseed, 3);
      const w = sz * (0.55 + n * 0.25);
      const rx = Math.cos(a) * w, ry = Math.sin(a) * w * squash;
      membrane += (i === 0 ? '' : ' L') + `${(cx + rx*cos - ry*sin).toFixed(1)},${(cy + rx*sin + ry*cos).toFixed(1)}`;
    }
  } else if (type === 2) {
    const spikes = 7 + Math.floor(rng() * 9);
    const si = 0.3 + rng() * 0.3;
    for (let i = 0; i <= resolution; i++) {
      const a = (i / resolution) * Math.PI * 2;
      const n = fbm(noise, Math.cos(a) * 2 + nseed, Math.sin(a) * 2 + nseed, 3);
      const spike = Math.cos(a * spikes) * si;
      const w = sz * (0.55 + n * 0.15 + spike);
      membrane += (i === 0 ? '' : ' L') + `${(cx + Math.cos(a) * w).toFixed(1)},${(cy + Math.sin(a) * w).toFixed(1)}`;
    }
  } else {
    const blobs = 2 + Math.floor(rng() * 2);
    const offsets = [];
    for (let b = 0; b < blobs; b++) offsets.push({ ox: (rng()-0.5)*sz*0.6, oy: (rng()-0.5)*sz*0.6, r: sz*(0.5+rng()*0.3) });
    for (let i = 0; i <= resolution; i++) {
      const a = (i / resolution) * Math.PI * 2;
      let maxR = 0;
      for (const o of offsets) {
        const dot = Math.cos(a)*o.ox + Math.sin(a)*o.oy;
        const r = dot + Math.sqrt(Math.max(0, o.r*o.r - (Math.cos(a)*o.oy - Math.sin(a)*o.ox)**2));
        if (r > maxR) maxR = r;
      }
      const n = fbm(noise, Math.cos(a) * 2 + nseed, Math.sin(a) * 2 + nseed, 3);
      const w = maxR * (0.85 + n * 0.2);
      membrane += (i === 0 ? '' : ' L') + `${(cx + Math.cos(a) * w).toFixed(1)},${(cy + Math.sin(a) * w).toFixed(1)}`;
    }
  }
  membrane += ' Z';

  return { path: membrane, id: `org-${seed}` };
}

// ════════════════════════════════════════════════════════════
// MAIN RENDER
// ════════════════════════════════════════════════════════════

function render(seed, variant='light', composition='center', chaos='high', W=3000, H=3000) {
  const rng = createRng(seed);
  for (let i = 0; i < (seed % 7) + 3; i++) rng();
  const texts = loadTexts();
  const bodies = [...texts.allText].sort(() => rng() - 0.5);

  const paper = paperTextureSVG(W, H, seed, variant);
  const bgColor = paper.bg, inkColor = paper.ink;

  // Symbol/script
  const symbolAt = buildProceduralSymbol(seed);
  const drawGlyph = buildProceduralAlphabet(seed);

  // Void position
  let vCx, vCy, vR;
  if (composition === 'center') {
    vCx = W * (0.38 + rng() * 0.24); vCy = H * (0.38 + rng() * 0.24);
    vR = Math.min(W, H) * (0.12 + rng() * 0.08);
  } else if (composition === 'corner') {
    const c = Math.floor(rng() * 4);
    vCx = [W*0.12, W*0.88, W*0.12, W*0.88][c];
    vCy = [H*0.12, H*0.12, H*0.88, H*0.88][c];
    vR = Math.min(W, H) * (0.14 + rng() * 0.06);
  } else if (composition === 'edge') {
    const e = Math.floor(rng() * 4);
    [vCx, vCy] = [[W*0.5, H*0.08], [W*0.92, H*0.5], [W*0.5, H*0.92], [W*0.08, H*0.5]][e];
    vR = Math.min(W, H) * (0.12 + rng() * 0.05);
  } else if (composition === 'dispersed' || composition === 'framed' || composition === 'torn') {
    // dispersed: multiple voids
    // framed: small off-center void, compensated by hand-drawn border
    // torn: moderate void but the tear is the main event
    vCx = W * 0.5; vCy = H * 0.5;
    vR = Math.min(W, H) * (composition === 'dispersed' ? 0.06 : 0.13);
  } else { // palimpsest
    vCx = W * 0.5; vCy = H * 0.5;
    vR = Math.min(W, H) * 0.1;
  }

  const occlusion = makeOcclusionTester();
  if (composition !== 'dispersed') {
    occlusion.addCircle(vCx, vCy, vR * 1.2);
  }

  // Organisms — placed first for occlusion
  const organisms = [];
  const numOrganisms = chaos === 'high' ? 25 : chaos === 'medium' ? 15 : 8;
  for (let i = 0; i < numOrganisms; i++) {
    const nearVoid = rng() > 0.4;
    let ox, oy;
    if (nearVoid) {
      const a = rng() * Math.PI * 2;
      const d = vR * (1.1 + Math.pow(rng(), 0.7) * 3);
      ox = vCx + Math.cos(a) * d; oy = vCy + Math.sin(a) * d;
    } else {
      ox = W * (0.08 + rng() * 0.84); oy = H * (0.08 + rng() * 0.84);
    }
    if (ox < 60 || ox > W-60 || oy < 60 || oy > H-60) continue;
    const osz = 20 + rng() * 80;
    organisms.push({ cx: ox, cy: oy, sz: osz, seed: seed + 7000 + i });
    occlusion.addCircle(ox, oy, osz * 0.9, 6);
  }

  // Some organisms become TEXT-ORGANISMS (text follows the outline)
  const textOrganismIndices = [];
  for (let i = 0; i < organisms.length; i++) {
    if (rng() > 0.6 && organisms[i].sz > 35) textOrganismIndices.push(i);
  }

  // Pasted notes — pre-allocate rectangles, add to occlusion
  const pastedNotes = [];
  const numPasted = chaos === 'high' ? 2 + Math.floor(rng() * 3) : chaos === 'medium' ? 1 + Math.floor(rng()*2) : 0;
  for (let i = 0; i < numPasted; i++) {
    const pw = 200 + rng() * 300;
    const ph = 150 + rng() * 250;
    const px = 100 + rng() * (W - pw - 200);
    const py = 100 + rng() * (H - ph - 200);
    const rot = (rng() - 0.5) * 12;
    pastedNotes.push({ x: px, y: py, w: pw, h: ph, rot });
    // Rough occlusion — treat as rectangle ignoring rotation (conservative)
    occlusion.addRect(px - 20, py - 20, pw + 40, ph + 40);
  }

  // Redactions — pre-allocated black blocks
  const redactions = [];
  const numRedactions = chaos === 'high' ? 5 + Math.floor(rng() * 5) : chaos === 'medium' ? 2 + Math.floor(rng()*3) : 0;
  for (let i = 0; i < numRedactions; i++) {
    // Thin wide blocks over text-column-like areas
    const rW = 100 + rng() * 400;
    const rH = 8 + rng() * 14;
    const rX = 50 + rng() * (W - rW - 100);
    const rY = 50 + rng() * (H - 100);
    redactions.push({ x: rX, y: rY, w: rW, h: rH });
  }

  // Curved text blocks (spiral or radial)
  const curvedTextBlocks = [];
  if (chaos !== 'low' && rng() > 0.4) {
    const ctType = rng() > 0.5 ? 'spiral' : 'ring';
    if (ctType === 'spiral') {
      curvedTextBlocks.push({
        type: 'spiral',
        cx: W * (0.15 + rng() * 0.7),
        cy: H * (0.15 + rng() * 0.7),
        startR: 30,
        turns: 2 + rng() * 3,
        maxR: 100 + rng() * 150,
        text: bodies[Math.floor(rng() * bodies.length)]
      });
    } else {
      curvedTextBlocks.push({
        type: 'ring',
        cx: W * (0.15 + rng() * 0.7),
        cy: H * (0.15 + rng() * 0.7),
        r: 50 + rng() * 200,
        text: bodies[Math.floor(rng() * bodies.length)]
      });
    }
    // Add to occlusion (rough)
    const last = curvedTextBlocks[curvedTextBlocks.length - 1];
    const cOccR = last.type === 'spiral' ? last.maxR : last.r * 1.2;
    occlusion.addCircle(last.cx, last.cy, cOccR);
  }

  // Torn edge
  let torn = null;
  if (composition === 'torn') {
    torn = generateTearMask(W, H, seed);
    // Add an occlusion to keep text out of the torn area (rough triangle)
    if (torn.side === 0) occlusion.addRect(0, 0, W, H * 0.22);
    else if (torn.side === 1) occlusion.addRect(W * 0.78, 0, W * 0.22, H);
    else if (torn.side === 2) occlusion.addRect(0, H * 0.78, W, H * 0.22);
    else occlusion.addRect(0, 0, W * 0.22, H);
  }

  // Build SVG and HTML
  const svgParts = [];
  const htmlParts = [];

  // Layer 1: paper texture
  svgParts.push(...paper.parts);

  // Layer 1.5: found-object background (faint)
  const useFoundObject = chaos !== 'low' && rng() > 0.5;
  if (useFoundObject) {
    drawFoundObject(svgParts, W, H, seed, inkColor);
  }

  // Layer 2: faint grid (graph paper / ruled)
  const gridType = Math.floor(rng() * 4); // 3 = none
  const gridOp = variant === 'light' ? 0.04 : 0.025;
  if (gridType === 0) {
    const s = 12 + rng() * 10;
    for (let y = 0; y < H; y += s) svgParts.push(`<line x1="0" y1="${y.toFixed(0)}" x2="${W}" y2="${y.toFixed(0)}" stroke="${inkColor}" stroke-width="0.25" opacity="${gridOp.toFixed(3)}"/>`);
  } else if (gridType === 1) {
    const s = 20 + rng() * 20;
    for (let x = 0; x < W; x += s) svgParts.push(`<line x1="${x.toFixed(0)}" y1="0" x2="${x.toFixed(0)}" y2="${H}" stroke="${inkColor}" stroke-width="0.2" opacity="${gridOp.toFixed(3)}"/>`);
    for (let y = 0; y < H; y += s) svgParts.push(`<line x1="0" y1="${y.toFixed(0)}" x2="${W}" y2="${y.toFixed(0)}" stroke="${inkColor}" stroke-width="0.2" opacity="${gridOp.toFixed(3)}"/>`);
  }

  // Layer 3: PALIMPSEST — ghost text beneath everything
  if (composition === 'palimpsest' || (chaos === 'high' && rng() > 0.5)) {
    // A faint rotated block of older text
    const palRng = createRng(seed + 99);
    const palAngle = (palRng() - 0.5) * 30; // degrees
    const palText = bodies[Math.floor(palRng() * bodies.length)];
    const palFs = 7 + palRng() * 3;
    // Stretch palimpsest text across page as diagonal lines
    // Use larger spacing so rows don't visually merge into strokes at thumbnail scale
    const palLines = 24 + Math.floor(palRng() * 10);
    const palCopy = palText.repeat(8);
    const palSpacing = H * 1.4 / palLines;
    for (let i = 0; i < palLines; i++) {
      const offsetY = i * palSpacing - H * 0.2;
      const lineText = palCopy.slice((i * 83) % palCopy.length, (i * 83) % palCopy.length + 180);
      htmlParts.push(`<div style="position:absolute;left:-200px;top:${offsetY.toFixed(0)}px;width:${(W+400).toFixed(0)}px;font-size:${palFs.toFixed(1)}px;opacity:0.07;letter-spacing:2px;white-space:nowrap;overflow:hidden;transform:rotate(${palAngle.toFixed(1)}deg);transform-origin:center;color:${inkColor}">${esc(lineText)}</div>`);
    }
  }

  // Layer 4: TEXT COLUMNS (main reading layer)
  const numCols = 5 + Math.floor(rng() * 2);
  const margin = W * 0.028;
  const colGap = 6;
  const colW = (W - margin * 2 - colGap * (numCols - 1)) / numCols;

  const dropCapCol = Math.floor(rng() * numCols);
  const dropCapDrawn = { value: false };
  const renderedLines = []; // track for later strike-throughs

  for (let ci = 0; ci < numCols; ci++) {
    const colX = margin + ci * (colW + colGap);
    const isDense = rng() > 0.5;
    const baseFs = isDense ? 4.5 + rng() * 1 : 6 + rng() * 1.5;
    const baseLh = baseFs * (1.2 + rng() * 0.2);
    const cRng = createRng(seed + 1000 + ci * 137);
    let y = margin;
    let tPtr = (ci * 7) % bodies.length;
    let inkIntensity = 0.85 + cRng() * 0.15;

    while (y < H - margin) {
      if (occlusion.test(colX, y, colW, baseLh)) {
        y += baseLh * 0.5; continue;
      }

      const bt = cRng();

      // Drop cap
      if (!dropCapDrawn.value && ci === dropCapCol && y === margin) {
        const dcSize = baseFs * 6;
        const dcLetter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(cRng() * 26)];
        occlusion.addRect(colX, y, dcSize * 0.8, dcSize * 0.8, 4);
        htmlParts.push(`<div style="position:absolute;left:${colX}px;top:${(y - dcSize*0.15).toFixed(0)}px;font-size:${dcSize.toFixed(0)}px;font-weight:900;line-height:1;color:${inkColor}" class="dropcap">${dcLetter}</div>`);
        const h = texts.headers[Math.floor(cRng() * texts.headers.length)];
        htmlParts.push(`<div style="position:absolute;left:${(colX + dcSize*0.85).toFixed(0)}px;top:${(y+4).toFixed(0)}px;width:${(colW - dcSize*0.85).toFixed(0)}px;font-size:${(baseFs*1.4).toFixed(1)}px;font-weight:bold;letter-spacing:1.5px;color:${inkColor};opacity:0.95">${esc(h)}</div>`);
        dropCapDrawn.value = true;
        y += dcSize * 0.85;
        continue;
      }

      if (bt < 0.04 && y > margin + 20) {
        const h = texts.headers[Math.floor(cRng() * texts.headers.length)];
        htmlParts.push(`<div style="position:absolute;left:${colX}px;top:${y.toFixed(0)}px;width:${colW.toFixed(0)}px;font-size:${(baseFs*1.3).toFixed(1)}px;font-weight:bold;letter-spacing:1.5px;color:${inkColor};opacity:0.95;border-bottom:1px solid ${inkColor};padding-bottom:3px">${esc(h)}</div>`);
        y += baseFs * 3;
        continue;
      }

      if (bt < 0.09) {
        const n = 3 + Math.floor(cRng() * 5);
        for (let f = 0; f < n && y < H - margin; f++) {
          if (occlusion.test(colX, y, colW, baseLh)) { y += baseLh; continue; }
          const frag = texts.fragments[Math.floor(cRng() * texts.fragments.length)];
          htmlParts.push(`<div style="position:absolute;left:${(colX + 8).toFixed(0)}px;top:${y.toFixed(0)}px;width:${(colW - 8).toFixed(0)}px;font-size:${(baseFs*0.85).toFixed(1)}px;letter-spacing:1px;color:${inkColor};opacity:${(inkIntensity*0.8).toFixed(2)}">${esc(frag)}</div>`);
          y += baseFs * 1.05;
        }
        y += 4; continue;
      }

      if (bt < (isDense ? 0.11 : 0.2)) { y += 6 + cRng() * 18; continue; }

      if (bt < 0.23 && cRng() > 0.7) {
        const note = texts.marginNotes[Math.floor(cRng() * texts.marginNotes.length)];
        htmlParts.push(`<div style="position:absolute;left:${(colX + cRng()*colW*0.5).toFixed(0)}px;top:${y.toFixed(0)}px;font-size:${(baseFs*0.7).toFixed(1)}px;color:${inkColor};opacity:0.4;transform:rotate(${((cRng()-0.5)*10).toFixed(0)}deg)">${esc(note)}</div>`);
        y += baseFs * 1.5;
        continue;
      }

      // Dense paragraph
      const text = bodies[tPtr % bodies.length]; tPtr++;
      const cpl = Math.floor(colW / (baseFs * 0.5));
      const words = text.split(' ');
      let line = '';
      let paraInk = inkIntensity;

      for (const word of words) {
        if (y > H - margin) break;
        if (occlusion.test(colX, y, colW, baseLh)) {
          if (line) {
            const lineY = y;
            htmlParts.push(`<div style="position:absolute;left:${colX.toFixed(0)}px;top:${lineY.toFixed(0)}px;width:${colW.toFixed(0)}px;font-size:${baseFs.toFixed(1)}px;line-height:${baseLh.toFixed(1)}px;color:${inkColor};opacity:${paraInk.toFixed(2)};white-space:nowrap;overflow:hidden">${esc(line)}</div>`);
            renderedLines.push({ x: colX, y: lineY, w: colW, h: baseLh, text: line, fontSize: baseFs });
            y += baseLh;
            line = '';
          }
          y += baseLh;
          continue;
        }
        if ((line + ' ' + word).length > cpl) {
          if (line) {
            htmlParts.push(`<div style="position:absolute;left:${colX.toFixed(0)}px;top:${y.toFixed(0)}px;width:${colW.toFixed(0)}px;font-size:${baseFs.toFixed(1)}px;line-height:${baseLh.toFixed(1)}px;color:${inkColor};opacity:${paraInk.toFixed(2)};white-space:nowrap;overflow:hidden">${esc(line)}</div>`);
            renderedLines.push({ x: colX, y: y, w: colW, h: baseLh, text: line, fontSize: baseFs });
            y += baseLh;
            paraInk += (cRng()-0.5) * 0.04;
            paraInk = Math.max(0.55, Math.min(1, paraInk));
          }
          line = word;
        } else {
          line = line ? line + ' ' + word : word;
        }
      }
      if (line && y < H - margin && !occlusion.test(colX, y, colW, baseLh)) {
        htmlParts.push(`<div style="position:absolute;left:${colX.toFixed(0)}px;top:${y.toFixed(0)}px;width:${colW.toFixed(0)}px;font-size:${baseFs.toFixed(1)}px;line-height:${baseLh.toFixed(1)}px;color:${inkColor};opacity:${paraInk.toFixed(2)};white-space:nowrap;overflow:hidden">${esc(line)}</div>`);
        renderedLines.push({ x: colX, y: y, w: colW, h: baseLh, text: line, fontSize: baseFs });
        y += baseLh;
      }
      y += baseFs * 0.4;
    }

    // Column separator
    if (ci < numCols - 1) {
      const sepX = colX + colW + colGap / 2;
      let sy = margin;
      while (sy < H - margin) {
        const segH = 20 + rng() * 40;
        if (!occlusion.testPoint(sepX, sy + segH/2)) {
          svgParts.push(`<line x1="${sepX}" y1="${sy.toFixed(0)}" x2="${sepX}" y2="${(sy + segH).toFixed(0)}" stroke="${inkColor}" stroke-width="0.35" opacity="0.15"/>`);
        }
        sy += segH;
      }
    }
  }

  // Layer 4.5: Edge marginalia (vertical)
  for (let side = 0; side < 2; side++) {
    const edgeX = side === 0 ? 10 : W - 10;
    const rotation = side === 0 ? 90 : -90;
    const eRng = createRng(seed + 8000 + side * 100);
    const frag = bodies[Math.floor(eRng() * bodies.length)];
    const snippet = frag.slice(0, 280);
    const esz = 5 + eRng() * 2;
    htmlParts.push(`<div style="position:absolute;left:${edgeX}px;top:${side===0 ? margin*2 : H-margin*2}px;transform:rotate(${rotation}deg);transform-origin:left top;white-space:nowrap;font-size:${esz.toFixed(1)}px;color:${inkColor};opacity:0.25;letter-spacing:0.5px;max-width:${H-margin*4}px">${esc(snippet)}</div>`);
  }

  // Layer 5: Margin annotations
  const mRng = createRng(seed + 880);
  for (let i = 0; i < 30; i++) {
    const ax = mRng() < 0.5 ? 3 + mRng() * (margin - 6) : W - margin + 2 + mRng() * (margin - 6);
    const ay = margin + mRng() * (H - margin * 2);
    if (occlusion.testPoint(ax, ay)) continue;
    const note = texts.marginNotes[Math.floor(mRng() * texts.marginNotes.length)];
    htmlParts.push(`<div style="position:absolute;left:${ax.toFixed(0)}px;top:${ay.toFixed(0)}px;font-size:${(3.5 + mRng() * 2.5).toFixed(1)}px;color:${inkColor};opacity:${(0.3 + mRng() * 0.4).toFixed(2)};transform:rotate(${((mRng()-0.5)*25).toFixed(0)}deg);white-space:nowrap">${esc(note)}</div>`);
  }

  // Layer 6: CORRECTIONS & STRIKE-THROUGHS over text lines
  if (chaos !== 'low') {
    const corrRng = createRng(seed + 4567);
    const numStrikes = chaos === 'high' ? 10 + Math.floor(corrRng() * 12) : 4 + Math.floor(corrRng() * 6);
    for (let i = 0; i < numStrikes && i < renderedLines.length; i++) {
      const ln = renderedLines[Math.floor(corrRng() * renderedLines.length)];
      const strikeType = Math.floor(corrRng() * 4);

      if (strikeType === 0) {
        // Horizontal strike-through
        const ly = ln.y + ln.h * 0.5;
        const jitter = (corrRng()-0.5) * 3;
        svgParts.push(`<line x1="${ln.x.toFixed(0)}" y1="${(ly+jitter).toFixed(0)}" x2="${(ln.x + ln.w).toFixed(0)}" y2="${(ly-jitter).toFixed(0)}" stroke="${inkColor}" stroke-width="${(1 + corrRng() * 1.5).toFixed(1)}" opacity="${(0.55 + corrRng() * 0.35).toFixed(2)}"/>`);
        // Sometimes double strike
        if (corrRng() > 0.5) {
          svgParts.push(`<line x1="${ln.x.toFixed(0)}" y1="${(ly+jitter+2).toFixed(0)}" x2="${(ln.x + ln.w).toFixed(0)}" y2="${(ly-jitter+1.5).toFixed(0)}" stroke="${inkColor}" stroke-width="${(0.7 + corrRng()).toFixed(1)}" opacity="${(0.4 + corrRng() * 0.3).toFixed(2)}"/>`);
        }
      } else if (strikeType === 1) {
        // Diagonal scratch-out (several strokes)
        for (let s = 0; s < 3 + Math.floor(corrRng() * 3); s++) {
          const sy1 = ln.y + corrRng() * ln.h;
          const sy2 = ln.y + corrRng() * ln.h;
          svgParts.push(`<line x1="${ln.x.toFixed(0)}" y1="${sy1.toFixed(0)}" x2="${(ln.x+ln.w).toFixed(0)}" y2="${sy2.toFixed(0)}" stroke="${inkColor}" stroke-width="${(0.8 + corrRng() * 1.5).toFixed(1)}" opacity="${(0.4 + corrRng() * 0.4).toFixed(2)}"/>`);
        }
      } else if (strikeType === 2) {
        // Circled word with arrow to margin
        const wordStart = ln.x + corrRng() * ln.w * 0.7;
        const wordW = 30 + corrRng() * 60;
        const cy2 = ln.y + ln.h/2;
        // Wobbly ellipse
        let ellipse = 'M';
        for (let i = 0; i <= 24; i++) {
          const a = (i/24) * Math.PI * 2;
          const wobble = 1 + (corrRng()-0.5) * 0.2;
          ellipse += (i===0?'':' L') + `${(wordStart + wordW/2 + Math.cos(a) * wordW/2 * wobble).toFixed(0)},${(cy2 + Math.sin(a) * ln.h * 0.8 * wobble).toFixed(0)}`;
        }
        ellipse += ' Z';
        svgParts.push(`<path d="${ellipse}" fill="none" stroke="${inkColor}" stroke-width="${(0.8 + corrRng()).toFixed(1)}" opacity="${(0.45 + corrRng()*0.35).toFixed(2)}"/>`);
        // Arrow out to margin
        const side = ln.x < W/2 ? -1 : 1;
        const ex = wordStart + wordW/2 + side * (40 + corrRng() * 60);
        const ey = cy2 + (corrRng()-0.5) * 30;
        svgParts.push(`<path d="M${(wordStart + wordW/2).toFixed(0)},${cy2.toFixed(0)} Q${((wordStart + wordW/2 + ex)/2 + (corrRng()-0.5)*20).toFixed(0)},${(cy2 + (corrRng()-0.5)*20).toFixed(0)} ${ex.toFixed(0)},${ey.toFixed(0)}" fill="none" stroke="${inkColor}" stroke-width="0.8" opacity="0.5"/>`);
        // Arrowhead
        svgParts.push(`<path d="M${ex.toFixed(0)},${ey.toFixed(0)} L${(ex-side*8).toFixed(0)},${(ey-5).toFixed(0)} M${ex.toFixed(0)},${ey.toFixed(0)} L${(ex-side*8).toFixed(0)},${(ey+5).toFixed(0)}" fill="none" stroke="${inkColor}" stroke-width="0.8" opacity="0.5"/>`);
        // Correction text at arrow end
        const correction = ['NO','WRONG','sic','stet','???','FALSE','DESTROY','erratum','REVERSE','→ §47'][Math.floor(corrRng()*10)];
        htmlParts.push(`<div style="position:absolute;left:${(ex + side*5).toFixed(0)}px;top:${(ey - 6).toFixed(0)}px;font-size:9px;color:${inkColor};opacity:0.7;font-weight:bold;font-family:Georgia,serif;font-style:italic;transform:rotate(${((corrRng()-0.5)*20).toFixed(0)}deg)">${correction}</div>`);
      } else {
        // Underline + question mark
        svgParts.push(`<line x1="${ln.x.toFixed(0)}" y1="${(ln.y + ln.h * 0.9).toFixed(0)}" x2="${(ln.x + ln.w*0.7).toFixed(0)}" y2="${(ln.y + ln.h * 0.9 + 1).toFixed(0)}" stroke="${inkColor}" stroke-width="1" opacity="0.5"/>`);
        htmlParts.push(`<div style="position:absolute;left:${(ln.x + ln.w + 6).toFixed(0)}px;top:${(ln.y - 2).toFixed(0)}px;font-size:13px;color:${inkColor};opacity:0.6;font-weight:bold">?</div>`);
      }
    }

    // Marginal rewritings — text squeezed between columns
    const reRng = createRng(seed + 4568);
    for (let i = 0; i < (chaos === 'high' ? 4 : 2); i++) {
      const rx = 10 + reRng() * (W - 200);
      const ry = 50 + reRng() * (H - 100);
      if (occlusion.testPoint(rx, ry)) continue;
      const re = texts.fragments[Math.floor(reRng() * texts.fragments.length)];
      htmlParts.push(`<div style="position:absolute;left:${rx.toFixed(0)}px;top:${ry.toFixed(0)}px;font-size:${(6+reRng()*3).toFixed(1)}px;font-family:Georgia,serif;font-style:italic;color:${inkColor};opacity:${(0.5 + reRng()*0.3).toFixed(2)};transform:rotate(${((reRng()-0.5)*8).toFixed(0)}deg);white-space:nowrap">${esc(re.slice(0, 40))}</div>`);
    }
  }

  // Layer 7: REDACTIONS
  for (const red of redactions) {
    svgParts.push(`<rect x="${red.x.toFixed(0)}" y="${red.y.toFixed(0)}" width="${red.w.toFixed(0)}" height="${red.h.toFixed(0)}" fill="${inkColor}" opacity="0.95"/>`);
    // Occasional "REDACTED" or classification label
    if (rng() > 0.6) {
      htmlParts.push(`<div style="position:absolute;left:${red.x.toFixed(0)}px;top:${(red.y + red.h + 2).toFixed(0)}px;font-size:6px;color:${inkColor};opacity:0.7;font-weight:bold;letter-spacing:1px">[REDACTED]</div>`);
    }
  }

  // Layer 8: CURVED TEXT BLOCKS (using SVG textPath)
  for (const ct of curvedTextBlocks) {
    if (ct.type === 'spiral') {
      let d = 'M';
      const totalPts = 400;
      for (let i = 0; i <= totalPts; i++) {
        const t = i / totalPts;
        const a = t * ct.turns * Math.PI * 2;
        const r = ct.startR + (ct.maxR - ct.startR) * t;
        const x = ct.cx + Math.cos(a) * r;
        const y = ct.cy + Math.sin(a) * r;
        d += (i === 0 ? '' : ' L') + `${x.toFixed(1)},${y.toFixed(1)}`;
      }
      const pathId = `spiralpath-${seed}`;
      svgParts.push(`<defs><path id="${pathId}" d="${d}"/></defs>`);
      // Repeat text along the path
      const longText = ct.text.repeat(8);
      svgParts.push(`<text font-size="7" fill="${inkColor}" font-family="'Courier New',monospace" opacity="0.85" letter-spacing="0.5"><textPath href="#${pathId}" startOffset="0">${esc(longText)}</textPath></text>`);
    } else {
      const pathId = `ringpath-${seed}`;
      svgParts.push(`<defs><path id="${pathId}" d="M${(ct.cx - ct.r).toFixed(1)},${ct.cy.toFixed(1)} A${ct.r.toFixed(1)},${ct.r.toFixed(1)} 0 1,1 ${(ct.cx + ct.r).toFixed(1)},${ct.cy.toFixed(1)} A${ct.r.toFixed(1)},${ct.r.toFixed(1)} 0 1,1 ${(ct.cx - ct.r).toFixed(1)},${ct.cy.toFixed(1)}"/></defs>`);
      const longText = ct.text.repeat(4);
      svgParts.push(`<text font-size="8" fill="${inkColor}" font-family="'Courier New',monospace" opacity="0.8" letter-spacing="1"><textPath href="#${pathId}" startOffset="0">${esc(longText)}</textPath></text>`);
      // A second inner ring sometimes
      if (rng() > 0.5) {
        const innerR = ct.r * 0.7;
        const innerId = `ringpath-inner-${seed}`;
        svgParts.push(`<defs><path id="${innerId}" d="M${(ct.cx - innerR).toFixed(1)},${ct.cy.toFixed(1)} A${innerR.toFixed(1)},${innerR.toFixed(1)} 0 1,1 ${(ct.cx + innerR).toFixed(1)},${ct.cy.toFixed(1)} A${innerR.toFixed(1)},${innerR.toFixed(1)} 0 1,1 ${(ct.cx - innerR).toFixed(1)},${ct.cy.toFixed(1)}"/></defs>`);
        svgParts.push(`<text font-size="6" fill="${inkColor}" font-family="'Courier New',monospace" opacity="0.6" letter-spacing="1"><textPath href="#${innerId}" startOffset="0">${esc(texts.allText[Math.floor(rng()*texts.allText.length)].repeat(3))}</textPath></text>`);
      }
      // Outline circle (faint)
      svgParts.push(`<circle cx="${ct.cx.toFixed(0)}" cy="${ct.cy.toFixed(0)}" r="${ct.r.toFixed(0)}" fill="none" stroke="${inkColor}" stroke-width="0.5" opacity="0.25"/>`);
    }
  }

  // Layer 9: MYCELIUM & CONTOURS
  const ctRng = createRng(seed + 4500);
  for (let c = 0; c < 3 + Math.floor(ctRng() * 3); c++) {
    const cx = W * (0.15 + ctRng() * 0.7);
    const cy = H * (0.15 + ctRng() * 0.7);
    const baseR = 80 + ctRng() * 300;
    const rings = 4 + Math.floor(ctRng() * 6);
    const op = 0.06 + ctRng() * 0.09;
    for (let r = 0; r < rings; r++) {
      const rr = baseR + r * (15 + ctRng() * 25);
      let d = 'M';
      for (let i = 0; i <= 50; i++) {
        const a = (i / 50) * Math.PI * 2;
        const w = rr * (1 + Math.sin(a * 3 + ctRng() * 10) * 0.12);
        d += (i === 0 ? '' : ' L') + `${(cx + Math.cos(a) * w).toFixed(0)},${(cy + Math.sin(a) * w).toFixed(0)}`;
      }
      svgParts.push(`<path d="${d}" fill="none" stroke="${inkColor}" stroke-width="${(0.5 + ctRng() * 1.0).toFixed(1)}" opacity="${op.toFixed(2)}"/>`);
    }
  }

  const myRng = createRng(seed + 6600);
  for (let m = 0; m < 15 + Math.floor(myRng() * 10); m++) {
    let mx = W * (0.1 + myRng() * 0.8), my = H * (0.1 + myRng() * 0.8);
    let a = myRng() * Math.PI * 2;
    const segs = 15 + Math.floor(myRng() * 25);
    let d = `M${mx.toFixed(0)},${my.toFixed(0)}`;
    const lOp = 0.08 + myRng() * 0.14, lSw = 0.35 + myRng() * 0.7;
    for (let s = 0; s < segs; s++) {
      a += (myRng()-0.5) * 0.8;
      mx += Math.cos(a) * (5 + myRng() * 22);
      my += Math.sin(a) * (5 + myRng() * 22);
      d += ` L${mx.toFixed(0)},${my.toFixed(0)}`;
      if (myRng() > 0.5) svgParts.push(`<circle cx="${mx.toFixed(0)}" cy="${my.toFixed(0)}" r="${(0.8 + myRng() * 2.5).toFixed(1)}" fill="${inkColor}" opacity="${(lOp * 0.7).toFixed(2)}"/>`);
    }
    svgParts.push(`<path d="${d}" fill="none" stroke="${inkColor}" stroke-width="${lSw.toFixed(1)}" opacity="${lOp.toFixed(2)}"/>`);
  }

  // Layer 10: ORGANISMS (drawings)
  for (let oi = 0; oi < organisms.length; oi++) {
    const o = organisms[oi];
    const isTextOrganism = textOrganismIndices.includes(oi);
    const info = drawOrganism(null, o.cx, o.cy, o.sz, o.seed, inkColor, 0.82);

    if (isTextOrganism) {
      // Use as textPath
      const orgPathId = `orgpath-${seed}-${oi}`;
      svgParts.push(`<defs><path id="${orgPathId}" d="${info.path}"/></defs>`);
      const orgText = bodies[Math.floor(rng() * bodies.length)].repeat(3);
      svgParts.push(`<text font-size="${(o.sz * 0.1).toFixed(1)}" fill="${inkColor}" font-family="'Courier New',monospace" opacity="0.9" letter-spacing="0.5"><textPath href="#${orgPathId}" startOffset="0">${esc(orgText.slice(0, 400))}</textPath></text>`);
      // Inner nucleus (subtle)
      svgParts.push(`<circle cx="${o.cx.toFixed(0)}" cy="${o.cy.toFixed(0)}" r="${(o.sz * 0.15).toFixed(1)}" fill="none" stroke="${inkColor}" stroke-width="0.4" opacity="0.4"/>`);
      // Interior micro-text fill
      const innerTextLines = Math.floor(o.sz / 5);
      for (let it = 0; it < innerTextLines; it++) {
        const ty = o.cy - o.sz * 0.5 + it * 5;
        const text2 = texts.fragments[Math.floor(rng() * texts.fragments.length)];
        svgParts.push(`<text x="${(o.cx - o.sz * 0.4).toFixed(0)}" y="${ty.toFixed(0)}" font-size="3" fill="${inkColor}" font-family="'Courier New',monospace" opacity="${(0.2 + rng() * 0.2).toFixed(2)}">${esc(text2.slice(0, 30))}</text>`);
      }
    } else {
      // Regular organism drawing
      svgParts.push(`<path d="${info.path}" fill="none" stroke="${inkColor}" stroke-width="${(0.7 + rng() * 1.8).toFixed(1)}" opacity="${(0.78 + rng() * 0.18).toFixed(2)}"/>`);
      // Nucleus
      if (rng() > 0.15) {
        const nr = o.sz * (0.1 + rng() * 0.15);
        svgParts.push(`<circle cx="${o.cx.toFixed(0)}" cy="${o.cy.toFixed(0)}" r="${nr.toFixed(1)}" fill="${inkColor}" opacity="0.65"/>`);
      }
      // Organelle dots
      for (let s = 0; s < 8 + Math.floor(rng() * 20); s++) {
        const sa = rng() * Math.PI * 2, sd = rng() * o.sz * 0.45;
        svgParts.push(`<circle cx="${(o.cx + Math.cos(sa) * sd).toFixed(0)}" cy="${(o.cy + Math.sin(sa) * sd).toFixed(0)}" r="${(0.4 + rng() * 1.6).toFixed(1)}" fill="${inkColor}" opacity="0.4"/>`);
      }
    }
  }

  // Layer 11: PROCEDURAL SYMBOL scattered obsessively
  const symRng = createRng(seed + 9876);
  for (let i = 0; i < 60 + Math.floor(symRng() * 40); i++) {
    const sx = W * symRng(), sy = H * symRng();
    const sz = 6 + symRng() * 14;
    const op = 0.3 + symRng() * 0.35;
    svgParts.push(symbolAt(sx, sy, sz, op, inkColor));
  }
  // And a few large instances as featured symbols
  for (let i = 0; i < 4 + Math.floor(symRng() * 3); i++) {
    const sx = W * (0.15 + symRng() * 0.7);
    const sy = H * (0.15 + symRng() * 0.7);
    if (occlusion.testPoint(sx, sy)) continue;
    const sz = 40 + symRng() * 80;
    svgParts.push(symbolAt(sx, sy, sz, 0.6 + symRng() * 0.25, inkColor));
  }

  // Layer 12: PROCEDURAL SCRIPT — scatter glyphs as invented text fragments
  const gRng = createRng(seed + 11211);
  for (let i = 0; i < 30 + Math.floor(gRng() * 30); i++) {
    const sx = W * (0.05 + gRng() * 0.9);
    const sy = H * (0.05 + gRng() * 0.9);
    if (occlusion.testPoint(sx, sy)) continue;
    // Word of glyphs
    const wordLen = 3 + Math.floor(gRng() * 6);
    for (let g = 0; g < wordLen; g++) {
      const gx = sx + g * 10;
      const glyphSz = 7 + gRng() * 3;
      const gIdx = Math.floor(gRng() * 40);
      svgParts.push(drawGlyph(gIdx, gx, sy, glyphSz, inkColor, 0.45 + gRng() * 0.3));
    }
  }

  // Layer 13: INK-BLEED VOID
  function drawInkBleedVoid(cx, cy, r, seed2) {
    // Outer soft layers
    for (let layer = 0; layer < 15; layer++) {
      const lr = r * (1 + layer * 0.04);
      const rag = 0.25 + layer * 0.03;
      const path = generateInkBleedPath(cx, cy, lr, seed2 + layer * 100, rag);
      svgParts.push(`<path d="${path}" fill="${inkColor}" opacity="${Math.max(0, 0.12 - layer * 0.008).toFixed(3)}"/>`);
    }
    const vRng = createRng(seed2);
    for (let i = 0; i < 8; i++) {
      const ocx = cx + (vRng()-0.5)*r*0.2, ocy = cy + (vRng()-0.5)*r*0.2;
      const oR = r * (0.75 + vRng() * 0.2);
      svgParts.push(`<path d="${generateInkBleedPath(ocx, ocy, oR, seed2 + 500 + i, 0.2 + vRng()*0.25)}" fill="${inkColor}" opacity="${(0.5 + vRng() * 0.3).toFixed(2)}"/>`);
    }
    svgParts.push(`<path d="${generateInkBleedPath(cx, cy, r * 0.7, seed2 + 1000, 0.15)}" fill="${inkColor}" opacity="1"/>`);

    // Drips
    const dripRng = createRng(seed2 + 2000);
    for (let t = 0; t < 60 + Math.floor(dripRng() * 40); t++) {
      const sa = dripRng() * Math.PI * 2;
      let tx = cx + Math.cos(sa) * r * (0.8 + dripRng() * 0.2);
      let ty = cy + Math.sin(sa) * r * (0.8 + dripRng() * 0.2);
      let ta = sa + (dripRng()-0.5) * 0.3;
      const maxLen = r * (0.4 + dripRng() * 2.5);
      let tv = 0;
      let d = `M${tx.toFixed(1)},${ty.toFixed(1)}`;
      const bw = 0.3 + dripRng() * 2.2;
      const op = 0.18 + dripRng() * 0.35;
      while (tv < maxLen) {
        ta += (dripRng() - 0.5) * 0.4;
        const outwardBias = (Math.atan2(ty - cy, tx - cx) - ta);
        ta += outwardBias * 0.05;
        const step = 2 + dripRng() * 8;
        tx += Math.cos(ta) * step; ty += Math.sin(ta) * step; tv += step;
        d += ` L${tx.toFixed(1)},${ty.toFixed(1)}`;
        if (dripRng() > 0.88) svgParts.push(`<circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="${(0.5 + dripRng()*3).toFixed(1)}" fill="${inkColor}" opacity="${(op*0.8).toFixed(2)}"/>`);
      }
      svgParts.push(`<path d="${d}" fill="none" stroke="${inkColor}" stroke-width="${bw.toFixed(1)}" opacity="${op.toFixed(2)}" stroke-linecap="round"/>`);
    }
    // Splatter
    const spRng = createRng(seed2 + 3000);
    for (let i = 0; i < 1500; i++) {
      const a = spRng() * Math.PI * 2;
      const d = r * (0.9 + Math.pow(spRng(), 2) * 2.5);
      const px = cx + Math.cos(a) * d, py = cy + Math.sin(a) * d;
      const df = (d - r*0.9) / (r*2.5);
      const sz = (1 - df) * (0.3 + spRng() * 2.5);
      const op = Math.max(0, 1 - df*1.5) * (0.15 + spRng() * 0.45);
      if (sz > 0.1 && op > 0.02) svgParts.push(`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${sz.toFixed(1)}" fill="${inkColor}" opacity="${op.toFixed(2)}"/>`);
    }
  }

  if (composition !== 'dispersed') {
    drawInkBleedVoid(vCx, vCy, vR, seed + 100);
  } else {
    for (let i = 0; i < 5 + Math.floor(rng() * 4); i++) {
      const dx = W * (0.2 + rng() * 0.6);
      const dy = H * (0.2 + rng() * 0.6);
      const dr = Math.min(W, H) * (0.04 + rng() * 0.05);
      drawInkBleedVoid(dx, dy, dr, seed + 100 + i * 777);
    }
  }

  // Layer 14: BURNT effect (only for burnt variant)
  if (variant === 'burnt') {
    const burnRng = createRng(seed + 12345);
    for (let edge = 0; edge < 4; edge++) {
      const n = 150 + Math.floor(burnRng() * 150);
      for (let i = 0; i < n; i++) {
        let bx, by;
        const depth = Math.pow(burnRng(), 1.5) * 250;
        if (edge === 0) { bx = burnRng() * W; by = depth; }
        else if (edge === 1) { bx = W - depth; by = burnRng() * H; }
        else if (edge === 2) { bx = burnRng() * W; by = H - depth; }
        else { bx = depth; by = burnRng() * H; }
        const sz = 1 + burnRng() * 6 * (1 - depth/250);
        const op = Math.max(0, 1 - depth/250) * (0.15 + burnRng() * 0.5);
        svgParts.push(`<circle cx="${bx.toFixed(0)}" cy="${by.toFixed(0)}" r="${sz.toFixed(1)}" fill="#000" opacity="${op.toFixed(2)}"/>`);
      }
    }
  }

  // Layer 15: PASTED NOTES (rotated, with tape marks)
  for (const note of pastedNotes) {
    const noteBg = variant === 'dark' ? '#2a2018' : '#e8dcc5';
    const noteInk = variant === 'dark' ? '#f0e8d8' : '#1a0f08';
    const shadowOp = variant === 'light' ? 0.25 : 0.5;
    const shadowColor = variant === 'light' ? '#000' : '#000';

    // Note wrapper
    htmlParts.push(`<div style="position:absolute;left:${note.x.toFixed(0)}px;top:${note.y.toFixed(0)}px;width:${note.w.toFixed(0)}px;height:${note.h.toFixed(0)}px;background:${noteBg};transform:rotate(${note.rot.toFixed(1)}deg);box-shadow:3px 5px 10px rgba(0,0,0,${shadowOp});border:1px solid rgba(0,0,0,0.12);padding:12px;font-family:Georgia,serif;color:${noteInk};overflow:hidden;font-size:11px;line-height:1.4">
      <div style="font-weight:bold;border-bottom:1px solid ${noteInk};padding-bottom:4px;margin-bottom:6px;font-size:10px;letter-spacing:1px;font-family:'Courier New',monospace">${esc(texts.headers[Math.floor(rng() * texts.headers.length)])}</div>
      <div style="font-style:italic;opacity:0.85">${esc(bodies[Math.floor(rng() * bodies.length)].slice(0, 360))}</div>
    </div>`);
    // Tape on corners (2 corners visible)
    const tapeColor = variant === 'light' ? 'rgba(200,180,120,0.55)' : 'rgba(220,200,150,0.4)';
    const taX = note.x - 10 + note.w/2 * Math.cos((note.rot*Math.PI/180));
    htmlParts.push(`<div style="position:absolute;left:${(note.x + note.w * 0.1).toFixed(0)}px;top:${(note.y - 8).toFixed(0)}px;width:50px;height:18px;background:${tapeColor};transform:rotate(${(note.rot + (rng()-0.5)*20).toFixed(1)}deg);box-shadow:1px 2px 4px rgba(0,0,0,0.2);border:1px dashed rgba(0,0,0,0.15)"></div>`);
    htmlParts.push(`<div style="position:absolute;left:${(note.x + note.w * 0.7).toFixed(0)}px;top:${(note.y - 8).toFixed(0)}px;width:50px;height:18px;background:${tapeColor};transform:rotate(${(note.rot + (rng()-0.5)*20).toFixed(1)}deg);box-shadow:1px 2px 4px rgba(0,0,0,0.2);border:1px dashed rgba(0,0,0,0.15)"></div>`);
  }

  // Layer 16: HAND-DRAWN BORDER
  if (composition === 'framed' || (chaos === 'high' && rng() > 0.55)) {
    drawHandDrawnBorder(svgParts, W, H, seed, inkColor);
  }

  // Layer 17: TORN EDGE (rendered last so nothing shows past it)
  if (torn) {
    // Fill the torn area with the surrounding color (simulating page being gone)
    // Draw all ink pooling and tear line
    for (const p of torn.edgeInkPaths) svgParts.push(p);
    // Tear line
    svgParts.push(`<path d="${torn.tearLine}" fill="none" stroke="${inkColor}" stroke-width="1.2" opacity="0.65"/>`);
    // Thicker irregular ink line
    svgParts.push(`<path d="${torn.tearLine}" fill="none" stroke="${inkColor}" stroke-width="0.4" opacity="0.4" stroke-dasharray="3,2"/>`);
    // Shadow under tear (dark band)
    const shadowBand = Math.floor(torn.tearPoints.length / 2);
    for (let i = 0; i < torn.tearPoints.length - 1; i++) {
      const p = torn.tearPoints[i], p2 = torn.tearPoints[i+1];
      let dx = 0, dy = 0;
      if (torn.side === 0) { dy = 3; } else if (torn.side === 1) { dx = -3; } else if (torn.side === 2) { dy = -3; } else { dx = 3; }
      svgParts.push(`<line x1="${(p.x+dx).toFixed(0)}" y1="${(p.y+dy).toFixed(0)}" x2="${(p2.x+dx).toFixed(0)}" y2="${(p2.y+dy).toFixed(0)}" stroke="${inkColor}" stroke-width="0.6" opacity="0.15"/>`);
    }
    // The area beyond the tear is "empty" — we fill with background-colored polygon sized to cover
    // Build the opposite polygon (the torn-away part)
    let emptyPoly = 'M';
    if (torn.side === 0) {
      emptyPoly += `0,0 L${W},0`;
      for (let i = torn.tearPoints.length - 1; i >= 0; i--) emptyPoly += ` L${torn.tearPoints[i].x.toFixed(0)},${torn.tearPoints[i].y.toFixed(0)}`;
      emptyPoly += ' Z';
    } else if (torn.side === 1) {
      emptyPoly += `${W},0 L${W},${H}`;
      for (let i = torn.tearPoints.length - 1; i >= 0; i--) emptyPoly += ` L${torn.tearPoints[i].x.toFixed(0)},${torn.tearPoints[i].y.toFixed(0)}`;
      emptyPoly += ' Z';
    } else if (torn.side === 2) {
      emptyPoly += `${W},${H} L0,${H}`;
      for (let i = torn.tearPoints.length - 1; i >= 0; i--) emptyPoly += ` L${torn.tearPoints[i].x.toFixed(0)},${torn.tearPoints[i].y.toFixed(0)}`;
      emptyPoly += ' Z';
    } else {
      emptyPoly += `0,${H} L0,0`;
      for (let i = torn.tearPoints.length - 1; i >= 0; i--) emptyPoly += ` L${torn.tearPoints[i].x.toFixed(0)},${torn.tearPoints[i].y.toFixed(0)}`;
      emptyPoly += ' Z';
    }
    // Use a light neutral below the page
    const underColor = variant === 'light' ? '#c4b89a' : '#0a0604';
    svgParts.push(`<path d="${emptyPoly}" fill="${underColor}"/>`);
    // Fuzz at the tear edge — fine ink dots sprinkling
    const fuzRng = createRng(seed + 77);
    for (let i = 0; i < 400; i++) {
      const idx = Math.floor(fuzRng() * torn.tearPoints.length);
      const p = torn.tearPoints[idx];
      const offsetAmt = 6 + fuzRng() * 12;
      const dx2 = (fuzRng()-0.5) * offsetAmt;
      const dy2 = (fuzRng()-0.5) * offsetAmt;
      svgParts.push(`<circle cx="${(p.x+dx2).toFixed(1)}" cy="${(p.y+dy2).toFixed(1)}" r="${(0.4+fuzRng()*1.2).toFixed(1)}" fill="${inkColor}" opacity="${(0.15+fuzRng()*0.25).toFixed(2)}"/>`);
    }
  }

  // Layer 18: Page notation
  svgParts.push(`<text x="15" y="${H-12}" font-size="6" font-family="'Courier New',monospace" fill="${inkColor}" opacity="0.35">§${(seed%999)+1} — ${variant.toUpperCase()} — ${composition.toUpperCase()} — CHAOS:${chaos.toUpperCase()} — STATUS: INCOMPLETE</text>`);
  for (let i = 0; i < 40; i++) {
    svgParts.push(`<text x="${(W*(i+1)/42).toFixed(0)}" y="${H-3}" font-size="3" font-family="'Courier New',monospace" fill="${inkColor}" opacity="0.12">${i+1}</text>`);
  }

  return {
    html: `<!DOCTYPE html><html><head><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;background:${bgColor};position:relative;overflow:hidden;font-family:'Courier New',Courier,monospace;color:${inkColor}}
.dropcap{font-family:Georgia,'Times New Roman',serif;font-style:italic}
</style></head><body>
${htmlParts.join('\n')}
<svg style="position:absolute;left:0;top:0;width:${W}px;height:${H}px;pointer-events:none;z-index:9999" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
${svgParts.join('\n')}
</svg>
</body></html>`,
    stats: {
      htmlElements: htmlParts.length,
      svgElements: svgParts.length,
      organisms: organisms.length,
      textOrganisms: textOrganismIndices.length,
      pastedNotes: pastedNotes.length,
      redactions: redactions.length,
      curvedTextBlocks: curvedTextBlocks.length,
      torn: !!torn,
      foundObject: useFoundObject,
      variant, composition, chaos,
    }
  };
}

// ════════════════════════════════════════════════════════════
// CLI
// ════════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const seed = parseInt(args[0]) || Math.floor(Math.random() * 100000);
const name = args[1] || `unhinged-${seed}`;
const variantFlag = args.find(a => a.startsWith('--variant='));
const compFlag = args.find(a => a.startsWith('--composition='));
const chaosFlag = args.find(a => a.startsWith('--chaos='));
const variant = variantFlag ? variantFlag.split('=')[1] : 'light';
const composition = compFlag ? compFlag.split('=')[1] : ['center','corner','edge','dispersed','torn','framed','palimpsest'][seed % 7];
const chaos = chaosFlag ? chaosFlag.split('=')[1] : 'high';

const out = path.join(OUTPUT_DIR, `${name}.png`);

console.log(`\nRendering Unhinged — seed ${seed}, ${variant}, ${composition}, chaos=${chaos}`);
const start = Date.now();
const { html, stats } = render(seed, variant, composition, chaos);
const tmp = path.join(OUTPUT_DIR, `_t${seed}.html`);
fs.writeFileSync(tmp, html);
console.log(`  HTML: ${(html.length/1024/1024).toFixed(2)} MB`);
console.log(`  HTML:${stats.htmlElements} SVG:${stats.svgElements} org:${stats.organisms}(${stats.textOrganisms}t) paste:${stats.pastedNotes} redact:${stats.redactions} curve:${stats.curvedTextBlocks} torn:${stats.torn} found:${stats.foundObject}`);

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 3000, height: 3000, deviceScaleFactor: 1 });
await page.goto(`file://${tmp}`, { waitUntil: 'networkidle0', timeout: 180000 });
await page.screenshot({ path: out, type: 'png' });
await browser.close();
fs.unlinkSync(tmp);

console.log(`  PNG: ${(fs.statSync(out).size/1024/1024).toFixed(2)} MB, Time: ${((Date.now()-start)/1000).toFixed(1)}s\n`);
