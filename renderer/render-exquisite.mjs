/**
 * Deep Reality Atlas — Exquisite Renderer
 *
 * Everything: paper texture, ink bleed voids, organism text-displacement,
 * per-character jitter, drop caps, edge marginalia, multi-scale detail,
 * burnt/dark variants.
 *
 * Usage: node renderer/render-exquisite.mjs [seed] [output-name] [--variant=light|dark|burnt] [--composition=center|corner|edge|dispersed]
 *
 * Design principles:
 * - Paper first, ink second. Layer of paper fiber + subtle stains under everything.
 * - Void is ink bleeding into fiber, not a feathered circle. Organic noise-driven boundary.
 * - Organisms OCCLUDE the text — text wraps around them like a manuscript.
 * - Characters have micro-jitter. Some paragraphs are "heavy ink", some "dry".
 * - Multi-scale: drop caps, body text, micro-annotations, full-width banners.
 * - Edge marginalia runs vertically along margins.
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'gallery');
const CONTENT_DIR = path.join(__dirname, '..', 'content');

// ════════════════════════════════════════════════════════════
// UTILITIES
// ════════════════════════════════════════════════════════════

function createRng(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}
function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// Seeded 2D value noise (simplified, sufficient)
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
    'CATALOGUS UMBRAE — SPECIMEN','TABULA TREMENDI — SERIES','ATLAS PSYCHE PROFUNDAE',
    'TABULA SMARAGDINA','ATLAS PLEROMATIS','TABULA BARDO — TRANSITIONES',
    'TABULA VACUITATIS','TABULA AUTOPOIETICA','ATLAS CRUENTUS — ARTAUD',
    'CATALOGUS DEMIURGI — SAKLAS','ATLAS CORPORIS INVISIBILIS','EXEGESIS 2-3-74',
    'TAXONOMY OF NUMINOUS ENCOUNTERS','CARTOGRAPHY OF THE BARDO STATES',
    'CLASSIFICATION OF THOUGHT-FORMS','THE VOID: A FIELD GUIDE',
    'INVENTORY OF FAILED TAXONOMIES','ERRATA TO THE BOOK OF THE DEAD',
    'ATLAS SOMNIORUM','TABULA AETERNAE RECURRENTIAE','CODEX LINGUA AVIUM',
  ];
  const marginNotes = [
    'SEE PAGE ∞','cf. §47','→ NIGREDO','NB!','STATUS: URGENT','鬼','道','空',
    'ERRATA','→ §892','sic!','SPECIMEN #4091','⊕','◉','∅','※','†','WARNING',
    'ALL PREVIOUS REVISIONS VOID','THE SYSTEM IS THE SYMPTOM','hic sunt dracones',
  ];
  const allText = [...entries,...fieldNotes,...quotes.map(q=>`"${q}"`)];
  return { entries, fieldNotes, quotes, fragments, headers, marginNotes, allText };
}

// ════════════════════════════════════════════════════════════
// INK BLEED VOID — organic expansion based on noise field
// Produces a void with fractal-like edges that look like ink
// soaking into paper fiber.
// ════════════════════════════════════════════════════════════

function generateInkBleedPath(cx, cy, baseR, seed, raggedness=0.35) {
  const rng = createRng(seed);
  const noise = valueNoise(rng);
  const steps = 720;
  let path = 'M';
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    // Multi-octave noise drives radius at each angle — creates organic lumps
    const nx = Math.cos(a) * 3;
    const ny = Math.sin(a) * 3;
    const n1 = fbm(noise, nx, ny, 5); // -ish range, but scaled by value noise 0..1
    const n2 = fbm(noise, nx * 4 + 17, ny * 4 + 23, 3);
    const deform = 1 + (n1 - 0.5) * raggedness * 2 + (n2 - 0.5) * raggedness;
    const r = baseR * Math.max(0.3, deform);
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    path += (i === 0 ? '' : ' L') + `${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return path + ' Z';
}

// Test if a point is inside the ink-bleed void (using the same noise function)
function isInsideVoid(px, py, cx, cy, baseR, seed, raggedness=0.35) {
  const rng = createRng(seed);
  const noise = valueNoise(rng);
  const dx = px - cx, dy = py - cy;
  const d = Math.hypot(dx, dy);
  if (d > baseR * 2) return false;
  const a = Math.atan2(dy, dx);
  const nx = Math.cos(a) * 3;
  const ny = Math.sin(a) * 3;
  const n1 = fbm(noise, nx, ny, 5);
  const n2 = fbm(noise, nx * 4 + 17, ny * 4 + 23, 3);
  const deform = 1 + (n1 - 0.5) * raggedness * 2 + (n2 - 0.5) * raggedness;
  const effectiveR = baseR * Math.max(0.3, deform);
  return d <= effectiveR;
}

// ════════════════════════════════════════════════════════════
// PAPER TEXTURE — subtle noise, stains, foxing
// ════════════════════════════════════════════════════════════

function paperTextureSVG(W, H, seed, variant) {
  const parts = [];
  const rng = createRng(seed + 99999);

  // Filter defs for noise — combined with source
  const baseColor = variant === 'dark' ? '#14100b' : variant === 'burnt' ? '#1a1208' : '#f0ebe0';
  const inkColor = variant === 'dark' ? '#ddd6c9' : variant === 'burnt' ? '#e0d8c5' : '#1a0f08';

  // Stains (coffee rings, water marks)
  const numStains = 3 + Math.floor(rng() * 4);
  for (let i = 0; i < numStains; i++) {
    const cx = W * rng();
    const cy = H * rng();
    const r = 80 + rng() * 300;
    const isRing = rng() > 0.5;
    const stainOp = 0.03 + rng() * 0.05;
    const stainColor = variant === 'light' ? '#8a6030' : '#2a1a08';

    if (isRing) {
      // Ring stain
      parts.push(`<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="none" stroke="${stainColor}" stroke-width="${(2+rng()*6).toFixed(1)}" opacity="${stainOp.toFixed(2)}"/>`);
      // Inner fill faint
      parts.push(`<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${(r*0.95).toFixed(0)}" fill="${stainColor}" opacity="${(stainOp*0.3).toFixed(2)}"/>`);
    } else {
      // Irregular water mark
      const wobblyPath = generateInkBleedPath(cx, cy, r, seed + 9000 + i, 0.4);
      parts.push(`<path d="${wobblyPath}" fill="${stainColor}" opacity="${stainOp.toFixed(2)}"/>`);
    }
  }

  // Foxing spots (little golden-brown age spots)
  const numFoxing = variant === 'light' ? 80 + Math.floor(rng() * 80) : 30;
  const foxingColor = variant === 'light' ? '#9a7040' : '#3a2010';
  for (let i = 0; i < numFoxing; i++) {
    const cx = W * rng(), cy = H * rng();
    const r = 1 + rng() * 6;
    parts.push(`<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(1)}" fill="${foxingColor}" opacity="${(0.08+rng()*0.15).toFixed(2)}"/>`);
    // Cluster satellites
    if (rng() > 0.6) {
      for (let j = 0; j < 3 + Math.floor(rng()*4); j++) {
        parts.push(`<circle cx="${(cx + (rng()-0.5)*15).toFixed(0)}" cy="${(cy + (rng()-0.5)*15).toFixed(0)}" r="${(0.5+rng()*2).toFixed(1)}" fill="${foxingColor}" opacity="${(0.04+rng()*0.08).toFixed(2)}"/>`);
      }
    }
  }

  // Paper fiber — very low density noise dots
  for (let i = 0; i < 4000; i++) {
    const x = W * rng(), y = H * rng();
    const fiberColor = variant === 'light' ? '#d8c8a0' : '#3a2818';
    parts.push(`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(0.3+rng()*0.7).toFixed(1)}" fill="${fiberColor}" opacity="${(0.06+rng()*0.1).toFixed(2)}"/>`);
  }

  return { bg: baseColor, ink: inkColor, parts };
}

// ════════════════════════════════════════════════════════════
// OCCLUSION — list of rectangles/circles where text must not go
// ════════════════════════════════════════════════════════════

function makeOcclusionTester() {
  const rects = [], circles = [];
  return {
    addRect(x, y, w, h, pad=0) { rects.push({x: x-pad, y: y-pad, w: w+pad*2, h: h+pad*2}); },
    addCircle(cx, cy, r, pad=0) { circles.push({cx, cy, r: r+pad}); },
    test(x, y, w=0, h=0) {
      for (const r of rects) {
        if (x + w > r.x && x < r.x + r.w && y + h > r.y && y < r.y + r.h) return true;
      }
      for (const c of circles) {
        // Test rect-circle intersection (approximate)
        const closestX = Math.max(x, Math.min(c.cx, x + w));
        const closestY = Math.max(y, Math.min(c.cy, y + h));
        const dx = c.cx - closestX, dy = c.cy - closestY;
        if (dx*dx + dy*dy < c.r*c.r) return true;
      }
      return false;
    },
    testPoint(x, y) {
      return this.test(x, y, 0, 0);
    }
  };
}

// ════════════════════════════════════════════════════════════
// ORGANISM — a wobbled cellular drawing with nucleus and organelles
// ════════════════════════════════════════════════════════════

function drawOrganism(svgParts, cx, cy, sz, seed, ink='#000', opacity=0.85) {
  const rng = createRng(seed);
  const noise = valueNoise(rng);
  const type = Math.floor(rng() * 5); // 5 different organism types

  // Type 0: irregular blob (using noise for boundary)
  // Type 1: elongated cell with fine membrane detail
  // Type 2: stellate / spiky
  // Type 3: compound blob (several merged cells)
  // Type 4: high-frequency crenulated border

  let membrane = 'M';
  const resolution = 80;
  const nseed = rng() * 100;

  if (type === 0 || type === 4) {
    // Noise-driven irregular — NO sin waves, purely organic
    const roughness = type === 4 ? 0.45 : 0.28;
    for (let i = 0; i <= resolution; i++) {
      const a = (i / resolution) * Math.PI * 2;
      const nx = Math.cos(a) * 2.5 + nseed;
      const ny = Math.sin(a) * 2.5 + nseed;
      const n = fbm(noise, nx, ny, type === 4 ? 5 : 3);
      const w = sz * (0.55 + n * roughness);
      membrane += (i === 0 ? '' : ' L') + `${(cx + Math.cos(a) * w).toFixed(1)},${(cy + Math.sin(a) * w).toFixed(1)}`;
    }
  } else if (type === 1) {
    // Elongated — squash in one axis
    const rot = rng() * Math.PI;
    const cos = Math.cos(rot), sin = Math.sin(rot);
    const squash = 0.4 + rng() * 0.3;
    for (let i = 0; i <= resolution; i++) {
      const a = (i / resolution) * Math.PI * 2;
      const nx = Math.cos(a) * 3 + nseed;
      const ny = Math.sin(a) * 3 + nseed;
      const n = fbm(noise, nx, ny, 3);
      const w = sz * (0.55 + n * 0.25);
      const rx = Math.cos(a) * w;
      const ry = Math.sin(a) * w * squash;
      const x = cx + rx * cos - ry * sin;
      const y = cy + rx * sin + ry * cos;
      membrane += (i === 0 ? '' : ' L') + `${x.toFixed(1)},${y.toFixed(1)}`;
    }
  } else if (type === 2) {
    // Stellate — spiky protrusions
    const spikes = 7 + Math.floor(rng() * 9);
    const spikeIntensity = 0.3 + rng() * 0.3;
    for (let i = 0; i <= resolution; i++) {
      const a = (i / resolution) * Math.PI * 2;
      const nx = Math.cos(a) * 2 + nseed;
      const ny = Math.sin(a) * 2 + nseed;
      const n = fbm(noise, nx, ny, 3);
      const spike = Math.cos(a * spikes) * spikeIntensity;
      const w = sz * (0.55 + n * 0.15 + spike);
      membrane += (i === 0 ? '' : ' L') + `${(cx + Math.cos(a) * w).toFixed(1)},${(cy + Math.sin(a) * w).toFixed(1)}`;
    }
  } else {
    // Compound — merge 2-3 blob centers
    const blobs = 2 + Math.floor(rng() * 2);
    const offsets = [];
    for (let b = 0; b < blobs; b++) {
      offsets.push({ ox: (rng()-0.5) * sz * 0.6, oy: (rng()-0.5) * sz * 0.6, r: sz * (0.5 + rng()*0.3) });
    }
    for (let i = 0; i <= resolution; i++) {
      const a = (i / resolution) * Math.PI * 2;
      // Max distance to envelope all blobs
      let maxR = 0;
      for (const o of offsets) {
        const dot = Math.cos(a) * (o.ox) + Math.sin(a) * (o.oy);
        const r = dot + Math.sqrt(Math.max(0, o.r * o.r - (Math.cos(a)*o.oy - Math.sin(a)*o.ox)**2));
        if (r > maxR) maxR = r;
      }
      const nx = Math.cos(a) * 2 + nseed;
      const ny = Math.sin(a) * 2 + nseed;
      const n = fbm(noise, nx, ny, 3);
      const w = maxR * (0.85 + n * 0.2);
      membrane += (i === 0 ? '' : ' L') + `${(cx + Math.cos(a) * w).toFixed(1)},${(cy + Math.sin(a) * w).toFixed(1)}`;
    }
  }
  membrane += ' Z';
  svgParts.push(`<path d="${membrane}" fill="none" stroke="${ink}" stroke-width="${(0.7 + rng() * 1.8).toFixed(1)}" opacity="${opacity.toFixed(2)}"/>`);

  // Secondary inner contour (offset copy)
  if (rng() > 0.35) {
    let inner = 'M';
    const innerScale = 0.65 + rng() * 0.15;
    for (let i = 0; i <= 50; i++) {
      const a = (i / 50) * Math.PI * 2;
      const nx = Math.cos(a) * 4 + nseed + 50;
      const ny = Math.sin(a) * 4 + nseed + 50;
      const n = fbm(noise, nx, ny, 3);
      const w = sz * innerScale * (0.7 + n * 0.3);
      inner += (i === 0 ? '' : ' L') + `${(cx + Math.cos(a) * w).toFixed(1)},${(cy + Math.sin(a) * w).toFixed(1)}`;
    }
    inner += ' Z';
    svgParts.push(`<path d="${inner}" fill="none" stroke="${ink}" stroke-width="${(0.4 + rng() * 0.6).toFixed(1)}" opacity="${(opacity * 0.7).toFixed(2)}"/>`);
  }

  // Nucleus
  if (rng() > 0.15) {
    const nr = sz * (0.1 + rng() * 0.15);
    const nx = cx + (rng()-0.5) * sz * 0.15;
    const ny = cy + (rng()-0.5) * sz * 0.15;
    svgParts.push(`<circle cx="${nx.toFixed(0)}" cy="${ny.toFixed(0)}" r="${nr.toFixed(1)}" fill="${ink}" opacity="${(opacity * 0.85).toFixed(2)}"/>`);
    svgParts.push(`<circle cx="${nx.toFixed(0)}" cy="${ny.toFixed(0)}" r="${(nr * 1.8).toFixed(1)}" fill="none" stroke="${ink}" stroke-width="0.4" opacity="${(opacity * 0.5).toFixed(2)}"/>`);
  }

  // Organelles and stippling
  for (let s = 0; s < 8 + Math.floor(rng() * 20); s++) {
    const sa = rng() * Math.PI * 2;
    const sd = rng() * sz * 0.45;
    const osz = 0.4 + rng() * 1.6;
    svgParts.push(`<circle cx="${(cx + Math.cos(sa) * sd).toFixed(0)}" cy="${(cy + Math.sin(sa) * sd).toFixed(0)}" r="${osz.toFixed(1)}" fill="${ink}" opacity="${(opacity * 0.5).toFixed(2)}"/>`);
  }

  // Radiating tendrils (occasional)
  if (rng() > 0.5) {
    for (let t = 0; t < 3 + Math.floor(rng()*4); t++) {
      const ta = rng() * Math.PI * 2;
      let tx = cx + Math.cos(ta) * sz * 0.5;
      let ty = cy + Math.sin(ta) * sz * 0.5;
      const segs = 5 + Math.floor(rng() * 10);
      let tpath = `M${tx.toFixed(0)},${ty.toFixed(0)}`;
      let tangle = ta;
      for (let i = 0; i < segs; i++) {
        tangle += (rng()-0.5) * 0.6;
        tx += Math.cos(tangle) * (3 + rng()*8);
        ty += Math.sin(tangle) * (3 + rng()*8);
        tpath += ` L${tx.toFixed(0)},${ty.toFixed(0)}`;
      }
      svgParts.push(`<path d="${tpath}" fill="none" stroke="${ink}" stroke-width="${(0.3+rng()*0.4).toFixed(1)}" opacity="${(opacity*0.4).toFixed(2)}"/>`);
    }
  }
}

// ════════════════════════════════════════════════════════════
// INK BLEED VOID — the centerpiece
// ════════════════════════════════════════════════════════════

function drawInkBleedVoid(svgParts, cx, cy, r, seed, ink='#000', variant='light') {
  // Layered noise-perturbed blobs at decreasing opacity — creates organic boundary
  // Outer softness
  for (let layer = 0; layer < 15; layer++) {
    const lr = r * (1 + layer * 0.04);
    const rag = 0.25 + layer * 0.03;
    const path = generateInkBleedPath(cx, cy, lr, seed + layer * 100, rag);
    const op = Math.max(0, 0.12 - layer * 0.008);
    svgParts.push(`<path d="${path}" fill="${ink}" opacity="${op.toFixed(3)}"/>`);
  }

  // Main bleed body — multiple overlapping noise shapes for organic look
  const rng = createRng(seed);
  for (let i = 0; i < 8; i++) {
    const ocx = cx + (rng()-0.5) * r * 0.2;
    const ocy = cy + (rng()-0.5) * r * 0.2;
    const oR = r * (0.75 + rng() * 0.2);
    const rag = 0.2 + rng() * 0.25;
    const path = generateInkBleedPath(ocx, ocy, oR, seed + 500 + i, rag);
    const op = 0.5 + rng() * 0.3;
    svgParts.push(`<path d="${path}" fill="${ink}" opacity="${op.toFixed(2)}"/>`);
  }

  // Solid core
  const corePath = generateInkBleedPath(cx, cy, r * 0.7, seed + 1000, 0.15);
  svgParts.push(`<path d="${corePath}" fill="${ink}" opacity="1"/>`);

  // DRIPS AND TENDRILS — ink following paper fiber outward
  const dripRng = createRng(seed + 2000);
  const numTendrils = 60 + Math.floor(dripRng() * 40);
  for (let t = 0; t < numTendrils; t++) {
    const sa = dripRng() * Math.PI * 2;
    // Start at void edge
    let tx = cx + Math.cos(sa) * r * (0.8 + dripRng() * 0.2);
    let ty = cy + Math.sin(sa) * r * (0.8 + dripRng() * 0.2);
    let tangle = sa + (dripRng()-0.5) * 0.3;
    const maxLen = r * (0.4 + dripRng() * 2.5);
    let traveled = 0;
    let d = `M${tx.toFixed(1)},${ty.toFixed(1)}`;
    const baseW = 0.3 + dripRng() * 2.2;
    const op = 0.18 + dripRng() * 0.35;

    while (traveled < maxLen) {
      tangle += (dripRng() - 0.5) * 0.4;
      // Bias outward
      const outwardBias = (Math.atan2(ty - cy, tx - cx) - tangle);
      tangle += outwardBias * 0.05;
      const step = 2 + dripRng() * 8;
      tx += Math.cos(tangle) * step;
      ty += Math.sin(tangle) * step;
      traveled += step;
      d += ` L${tx.toFixed(1)},${ty.toFixed(1)}`;

      // Occasional pooling at branch points
      if (dripRng() > 0.88) {
        svgParts.push(`<circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="${(0.5 + dripRng()*3).toFixed(1)}" fill="${ink}" opacity="${(op*0.8).toFixed(2)}"/>`);
      }

      // Sub-branch
      if (dripRng() > 0.7 && traveled > r * 0.3) {
        let bx = tx, by = ty, ba = tangle + (dripRng()-0.5) * 1.5;
        let bd = `M${bx.toFixed(1)},${by.toFixed(1)}`;
        for (let bs = 0; bs < 4 + Math.floor(dripRng()*8); bs++) {
          ba += (dripRng()-0.5) * 0.5;
          bx += Math.cos(ba) * (2 + dripRng()*5);
          by += Math.sin(ba) * (2 + dripRng()*5);
          bd += ` L${bx.toFixed(1)},${by.toFixed(1)}`;
        }
        svgParts.push(`<path d="${bd}" fill="none" stroke="${ink}" stroke-width="${(baseW*0.4).toFixed(1)}" opacity="${(op*0.6).toFixed(2)}"/>`);
      }
    }
    // Taper the stroke-width across the main tendril by drawing it as several overlapping strokes
    svgParts.push(`<path d="${d}" fill="none" stroke="${ink}" stroke-width="${baseW.toFixed(1)}" opacity="${op.toFixed(2)}" stroke-linecap="round"/>`);
  }

  // Fine splatter — random dots extending beyond the main bleed
  const splatterRng = createRng(seed + 3000);
  for (let i = 0; i < 1500; i++) {
    const a = splatterRng() * Math.PI * 2;
    const d = r * (0.9 + Math.pow(splatterRng(), 2) * 2.5);
    const px = cx + Math.cos(a) * d;
    const py = cy + Math.sin(a) * d;
    const distFactor = (d - r*0.9) / (r*2.5);
    const sz = (1 - distFactor) * (0.3 + splatterRng() * 2.5);
    const op = Math.max(0, 1 - distFactor*1.5) * (0.15 + splatterRng() * 0.45);
    if (sz > 0.1 && op > 0.02) {
      svgParts.push(`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${sz.toFixed(1)}" fill="${ink}" opacity="${op.toFixed(2)}"/>`);
    }
  }
}

// ════════════════════════════════════════════════════════════
// CHARACTER JITTER — per-char position/rotation variation
// Returns CSS style string that creates hand-set feel
// ════════════════════════════════════════════════════════════

function charJitter(rng, amount = 1) {
  const jx = (rng()-0.5) * 0.6 * amount;
  const jy = (rng()-0.5) * 0.4 * amount;
  const jr = (rng()-0.5) * 1.5 * amount;
  return `transform:translate(${jx.toFixed(2)}px,${jy.toFixed(2)}px) rotate(${jr.toFixed(1)}deg);`;
}

// ════════════════════════════════════════════════════════════
// MAIN RENDER
// ════════════════════════════════════════════════════════════

function render(seed, variant='light', composition='center', W=3000, H=3000) {
  const rng = createRng(seed);
  for (let i = 0; i < (seed % 7) + 3; i++) rng();
  const texts = loadTexts();
  const bodies = [...texts.allText].sort(() => rng() - 0.5);

  // Paper/ink colors
  const paper = paperTextureSVG(W, H, seed, variant);
  const bgColor = paper.bg;
  const inkColor = paper.ink;

  // Void position
  let vCx, vCy, vR;
  if (composition === 'center') {
    vCx = W * (0.38 + rng() * 0.24);
    vCy = H * (0.38 + rng() * 0.24);
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
  } else if (composition === 'dispersed') {
    vCx = W * 0.5; vCy = H * 0.5;
    vR = Math.min(W, H) * 0.03; // small — many small voids instead
  } else {
    vCx = W * 0.5; vCy = H * 0.5;
    vR = Math.min(W, H) * 0.15;
  }

  const occlusion = makeOcclusionTester();

  // Add void to occlusion map (oversized to cover ink-bleed boundary)
  occlusion.addCircle(vCx, vCy, vR * 1.15, 0);

  // ORGANISMS — decide placement FIRST so text can avoid them
  const organisms = [];
  const numOrganisms = 18 + Math.floor(rng() * 20);
  for (let i = 0; i < numOrganisms; i++) {
    const nearVoid = rng() > 0.4;
    let ox, oy;
    if (nearVoid) {
      const a = rng() * Math.PI * 2;
      const d = vR * (1.1 + Math.pow(rng(), 0.7) * 3);
      ox = vCx + Math.cos(a) * d;
      oy = vCy + Math.sin(a) * d;
    } else {
      ox = W * (0.05 + rng() * 0.9);
      oy = H * (0.05 + rng() * 0.9);
    }
    if (ox < 40 || ox > W - 40 || oy < 40 || oy > H - 40) continue;
    const osz = 20 + rng() * 80; // BIGGER organisms
    organisms.push({ cx: ox, cy: oy, sz: osz, seed: seed + 7000 + i });
    // Register for text-displacement with padding
    occlusion.addCircle(ox, oy, osz * 0.95, 8);
  }

  // Build SVG and HTML arrays
  const svgParts = [];
  const htmlParts = [];

  // Layer 1: paper texture & stains
  svgParts.push(...paper.parts);

  // Layer 2: faint underlying grid (notebook lines / graph paper feel)
  const gridType = Math.floor(rng() * 3);
  const gridOp = variant === 'light' ? 0.04 : 0.025;
  const gridColor = variant === 'light' ? '#000' : '#fff';
  if (gridType === 0) {
    // Ruled lines
    const spacing = 12 + rng() * 10;
    for (let y = 0; y < H; y += spacing) {
      svgParts.push(`<line x1="0" y1="${y.toFixed(0)}" x2="${W}" y2="${y.toFixed(0)}" stroke="${gridColor}" stroke-width="0.25" opacity="${gridOp.toFixed(3)}"/>`);
    }
  } else if (gridType === 1) {
    // Graph paper
    const spacing = 20 + rng() * 20;
    for (let x = 0; x < W; x += spacing) svgParts.push(`<line x1="${x.toFixed(0)}" y1="0" x2="${x.toFixed(0)}" y2="${H}" stroke="${gridColor}" stroke-width="0.2" opacity="${gridOp.toFixed(3)}"/>`);
    for (let y = 0; y < H; y += spacing) svgParts.push(`<line x1="0" y1="${y.toFixed(0)}" x2="${W}" y2="${y.toFixed(0)}" stroke="${gridColor}" stroke-width="0.2" opacity="${gridOp.toFixed(3)}"/>`);
  } else {
    // Nothing — clean paper
  }

  // Layer 3: TEXT COLUMNS (respecting occlusion)
  const numCols = 5 + Math.floor(rng() * 2);
  const margin = W * 0.028;
  const colGap = 6;
  const colW = (W - margin * 2 - colGap * (numCols - 1)) / numCols;

  // One drop cap per page (large initial)
  const dropCapCol = Math.floor(rng() * numCols);
  const dropCapDrawn = { value: false };

  for (let ci = 0; ci < numCols; ci++) {
    const colX = margin + ci * (colW + colGap);
    // Column personality
    const isDense = rng() > 0.5;
    const baseFs = isDense ? 4.5 + rng() * 1 : 6 + rng() * 1.5;
    const baseLh = baseFs * (1.2 + rng() * 0.2);
    const cRng = createRng(seed + 1000 + ci * 137);
    let y = margin;
    let tPtr = (ci * 7) % bodies.length;

    // Ink intensity varies slowly down the column (simulates pen reloads / dry spots)
    let inkIntensity = 0.85 + cRng() * 0.15;
    const inkNoiseFn = () => {
      // Slow drift
      inkIntensity += (cRng() - 0.5) * 0.04;
      inkIntensity = Math.max(0.55, Math.min(1, inkIntensity));
      return inkIntensity;
    };

    while (y < H - margin) {
      // Check occlusion
      if (occlusion.test(colX, y, colW, baseLh)) {
        // Skip forward until clear
        y += baseLh * 0.5;
        continue;
      }

      const bt = cRng();

      // DROP CAP (once per page)
      if (!dropCapDrawn.value && ci === dropCapCol && y === margin) {
        const dcSize = baseFs * 6;
        const dcLetter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(cRng() * 26)];
        // Register drop cap in occlusion
        occlusion.addRect(colX, y, dcSize * 0.8, dcSize * 0.8, 4);
        htmlParts.push(`<div style="position:absolute;left:${colX}px;top:${y - dcSize*0.15}px;font-size:${dcSize.toFixed(0)}px;font-weight:900;line-height:1;color:${inkColor}" class="dropcap">${dcLetter}</div>`);
        // Dont advance Y — text flows beside/after cap (we handle by just starting higher font text)
        dropCapDrawn.value = true;
        // Header text after cap
        const h = texts.headers[Math.floor(cRng() * texts.headers.length)];
        htmlParts.push(`<div style="position:absolute;left:${colX + dcSize*0.85}px;top:${y + 4}px;width:${colW - dcSize*0.85}px;font-size:${(baseFs*1.4).toFixed(1)}px;font-weight:bold;letter-spacing:1.5px;color:${inkColor};opacity:0.95">${esc(h)}</div>`);
        y += dcSize * 0.85;
        continue;
      }

      // SECTION HEADER
      if (bt < 0.04 && y > margin + 20) {
        const h = texts.headers[Math.floor(cRng() * texts.headers.length)];
        htmlParts.push(`<div style="position:absolute;left:${colX}px;top:${y}px;width:${colW}px;font-size:${(baseFs*1.3).toFixed(1)}px;font-weight:bold;letter-spacing:1.5px;color:${inkColor};opacity:0.95;border-bottom:1px solid ${inkColor};padding-bottom:3px">${esc(h)}</div>`);
        y += baseFs * 3;
        continue;
      }

      // FRAGMENT LIST (indented)
      if (bt < 0.09) {
        const n = 3 + Math.floor(cRng() * 5);
        for (let f = 0; f < n && y < H - margin; f++) {
          if (occlusion.test(colX, y, colW, baseLh)) { y += baseLh; continue; }
          const ink = inkNoiseFn();
          const frag = texts.fragments[Math.floor(cRng() * texts.fragments.length)];
          htmlParts.push(`<div style="position:absolute;left:${colX + 8}px;top:${y}px;width:${colW - 8}px;font-size:${(baseFs*0.85).toFixed(1)}px;letter-spacing:1px;color:${inkColor};opacity:${(ink*0.8).toFixed(2)}">${esc(frag)}</div>`);
          y += baseFs * 1.05;
        }
        y += 4;
        continue;
      }

      // GAP
      if (bt < (isDense ? 0.11 : 0.2)) {
        y += 6 + cRng() * 18;
        continue;
      }

      // MICRO-ANNOTATION inline
      if (bt < 0.23 && cRng() > 0.7) {
        const note = texts.marginNotes[Math.floor(cRng() * texts.marginNotes.length)];
        htmlParts.push(`<div style="position:absolute;left:${(colX + cRng()*colW*0.5).toFixed(0)}px;top:${y}px;font-size:${(baseFs*0.7).toFixed(1)}px;color:${inkColor};opacity:0.4;transform:rotate(${((cRng()-0.5)*10).toFixed(0)}deg)">${esc(note)}</div>`);
        y += baseFs * 1.5;
        continue;
      }

      // DENSE PARAGRAPH
      const text = bodies[tPtr % bodies.length]; tPtr++;
      const cpl = Math.floor(colW / (baseFs * 0.5));
      const words = text.split(' ');
      let line = '';
      let paragraphInk = inkNoiseFn(); // Ink level for this paragraph

      for (const word of words) {
        if (y > H - margin) break;
        // Check occlusion mid-paragraph
        if (occlusion.test(colX, y, colW, baseLh)) {
          // End current line, skip
          if (line) {
            htmlParts.push(renderTextLine(line, colX, y, colW, baseFs, baseLh, inkColor, paragraphInk, cRng));
            y += baseLh;
            line = '';
          }
          y += baseLh;
          continue;
        }
        if ((line + ' ' + word).length > cpl) {
          if (line) {
            htmlParts.push(renderTextLine(line, colX, y, colW, baseFs, baseLh, inkColor, paragraphInk, cRng));
            y += baseLh;
            // Slightly vary ink within paragraph
            paragraphInk += (cRng()-0.5) * 0.04;
            paragraphInk = Math.max(0.55, Math.min(1, paragraphInk));
          }
          line = word;
        } else {
          line = line ? line + ' ' + word : word;
        }
      }
      if (line && y < H - margin && !occlusion.test(colX, y, colW, baseLh)) {
        htmlParts.push(renderTextLine(line, colX, y, colW, baseFs, baseLh, inkColor, paragraphInk, cRng));
        y += baseLh;
      }
      y += baseFs * 0.4;
    }

    // Column separator (broken by occlusion)
    if (ci < numCols - 1) {
      const sepX = colX + colW + colGap / 2;
      // Draw as dashed/broken line with occlusion
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

  // Layer 4: edge marginalia — vertical text along left/right edges
  for (let side = 0; side < 2; side++) {
    const edgeX = side === 0 ? 10 : W - 10;
    const rotation = side === 0 ? 90 : -90;
    const eRng = createRng(seed + 8000 + side * 100);
    const frag = bodies[Math.floor(eRng() * bodies.length)];
    const snippet = frag.slice(0, 280);
    const esz = 5 + eRng() * 2;
    htmlParts.push(`<div style="position:absolute;left:${edgeX}px;top:${side===0 ? margin*2 : H-margin*2}px;transform:rotate(${rotation}deg);transform-origin:left top;white-space:nowrap;font-size:${esz.toFixed(1)}px;color:${inkColor};opacity:0.25;letter-spacing:0.5px;max-width:${H-margin*4}px">${esc(snippet)}</div>`);
  }

  // Layer 5: margin annotations scattered
  const mRng = createRng(seed + 880);
  for (let i = 0; i < 30; i++) {
    const ax = mRng() < 0.5 ? 3 + mRng() * (margin - 6) : W - margin + 2 + mRng() * (margin - 6);
    const ay = margin + mRng() * (H - margin * 2);
    if (occlusion.testPoint(ax, ay)) continue;
    const note = texts.marginNotes[Math.floor(mRng() * texts.marginNotes.length)];
    htmlParts.push(`<div style="position:absolute;left:${ax.toFixed(0)}px;top:${ay.toFixed(0)}px;font-size:${(3.5 + mRng() * 2.5).toFixed(1)}px;color:${inkColor};opacity:${(0.3 + mRng() * 0.4).toFixed(2)};transform:rotate(${((mRng()-0.5)*25).toFixed(0)}deg);white-space:nowrap">${esc(note)}</div>`);
  }

  // Layer 6: contour/cartographic overlay (subtle)
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

  // Layer 7: mycelium network
  const myRng = createRng(seed + 6600);
  for (let m = 0; m < 20 + Math.floor(myRng() * 15); m++) {
    let mx = W * (0.1 + myRng() * 0.8);
    let my = H * (0.1 + myRng() * 0.8);
    let a = myRng() * Math.PI * 2;
    const segs = 15 + Math.floor(myRng() * 25);
    let d = `M${mx.toFixed(0)},${my.toFixed(0)}`;
    const lOp = 0.08 + myRng() * 0.14;
    const lSw = 0.35 + myRng() * 0.7;
    for (let s = 0; s < segs; s++) {
      a += (myRng()-0.5) * 0.8;
      mx += Math.cos(a) * (5 + myRng() * 22);
      my += Math.sin(a) * (5 + myRng() * 22);
      d += ` L${mx.toFixed(0)},${my.toFixed(0)}`;
      if (myRng() > 0.5) svgParts.push(`<circle cx="${mx.toFixed(0)}" cy="${my.toFixed(0)}" r="${(0.8 + myRng() * 2.5).toFixed(1)}" fill="${inkColor}" opacity="${(lOp * 0.7).toFixed(2)}"/>`);
    }
    svgParts.push(`<path d="${d}" fill="none" stroke="${inkColor}" stroke-width="${lSw.toFixed(1)}" opacity="${lOp.toFixed(2)}"/>`);
  }

  // Layer 8: ORGANISMS (drawn on top of text)
  for (const o of organisms) {
    drawOrganism(svgParts, o.cx, o.cy, o.sz, o.seed, inkColor, 0.78 + rng() * 0.18);
  }

  // Layer 9: THE VOID (ink bleed)
  if (composition !== 'dispersed') {
    drawInkBleedVoid(svgParts, vCx, vCy, vR, seed + 100, inkColor, variant);
  } else {
    // Many small voids
    for (let i = 0; i < 5 + Math.floor(rng() * 4); i++) {
      const dx = W * (0.2 + rng() * 0.6);
      const dy = H * (0.2 + rng() * 0.6);
      const dr = Math.min(W, H) * (0.04 + rng() * 0.05);
      drawInkBleedVoid(svgParts, dx, dy, dr, seed + 100 + i * 777, inkColor, variant);
    }
  }

  // Layer 10: BURNT edges (for burnt variant)
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
    // Char marks radiating from void
    const charRng = createRng(seed + 54321);
    for (let i = 0; i < 40; i++) {
      const a = charRng() * Math.PI * 2;
      const sr = vR * 1.0;
      const er = vR * (2 + charRng() * 4);
      let cx = vCx + Math.cos(a) * sr;
      let cy = vCy + Math.sin(a) * sr;
      let ca = a;
      let d = `M${cx.toFixed(1)},${cy.toFixed(1)}`;
      const segs = 10 + Math.floor(charRng() * 20);
      for (let s = 0; s < segs; s++) {
        ca += (charRng()-0.5) * 0.3;
        cx += Math.cos(ca) * 2;
        cy += Math.sin(ca) * 2;
        d += ` L${cx.toFixed(1)},${cy.toFixed(1)}`;
      }
      svgParts.push(`<path d="${d}" fill="none" stroke="#000" stroke-width="${(0.4 + charRng()*1.5).toFixed(1)}" opacity="${(0.15 + charRng()*0.3).toFixed(2)}"/>`);
    }
  }

  // Layer 11: Page notation
  svgParts.push(`<text x="15" y="${H-12}" font-size="6" font-family="'Courier New',monospace" fill="${inkColor}" opacity="0.35">§${(seed%999)+1} — ${variant.toUpperCase()} — ${composition.toUpperCase()} — STATUS: INCOMPLETE</text>`);

  // Edge numbering
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
      variant, composition
    }
  };
}

function renderTextLine(line, colX, y, colW, fs, lh, inkColor, inkLevel, rng) {
  // 20% of lines get slight jitter/stretch per char for handset feel — otherwise too expensive
  const useJitter = rng() > 0.8;
  if (!useJitter) {
    return `<div style="position:absolute;left:${colX}px;top:${y}px;width:${colW}px;font-size:${fs.toFixed(1)}px;line-height:${lh.toFixed(1)}px;color:${inkColor};opacity:${inkLevel.toFixed(2)};white-space:nowrap;overflow:hidden">${esc(line)}</div>`;
  }
  // Full jitter line — per-character spans
  let out = `<div style="position:absolute;left:${colX}px;top:${y}px;width:${colW}px;font-size:${fs.toFixed(1)}px;line-height:${lh.toFixed(1)}px;color:${inkColor};opacity:${inkLevel.toFixed(2)};white-space:nowrap;overflow:hidden">`;
  for (const ch of line) {
    const jx = (rng()-0.5) * 0.4;
    const jy = (rng()-0.5) * 0.3;
    const jr = (rng()-0.5) * 1.2;
    out += `<span style="display:inline-block;transform:translate(${jx.toFixed(2)}px,${jy.toFixed(2)}px) rotate(${jr.toFixed(1)}deg)">${esc(ch)}</span>`;
  }
  out += '</div>';
  return out;
}

// ════════════════════════════════════════════════════════════
// CLI
// ════════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const seed = parseInt(args[0]) || Math.floor(Math.random() * 100000);
const name = args[1] || `exquisite-${seed}`;
const variantFlag = args.find(a => a.startsWith('--variant='));
const compFlag = args.find(a => a.startsWith('--composition='));
const variant = variantFlag ? variantFlag.split('=')[1] : 'light';
const composition = compFlag ? compFlag.split('=')[1] : ['center','corner','edge','dispersed'][seed % 4];

const out = path.join(OUTPUT_DIR, `${name}.png`);

console.log(`\nRendering Exquisite — seed ${seed}, ${variant}, ${composition}`);

const start = Date.now();
const { html, stats } = render(seed, variant, composition);
const tmp = path.join(OUTPUT_DIR, `_t${seed}.html`);
fs.writeFileSync(tmp, html);
console.log(`  HTML: ${(html.length/1024/1024).toFixed(2)} MB`);
console.log(`  Text: ${stats.htmlElements}, SVG: ${stats.svgElements}, Organisms: ${stats.organisms}`);

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 3000, height: 3000, deviceScaleFactor: 1 });
await page.goto(`file://${tmp}`, { waitUntil: 'networkidle0', timeout: 180000 });
await page.screenshot({ path: out, type: 'png' });
await browser.close();
fs.unlinkSync(tmp);

console.log(`  PNG: ${(fs.statSync(out).size/1024/1024).toFixed(2)} MB, Time: ${((Date.now()-start)/1000).toFixed(1)}s\n`);
