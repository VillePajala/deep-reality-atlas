/**
 * Deep Reality Atlas — INSANE RENDERERS
 *
 * 5 completely different compositions. Going wild.
 *
 * Usage: node renderer/render-insane.mjs [1-5] [seed] [output-name]
 *
 * 1: "The Collapse" — text arranged in a spiral being sucked into void
 * 2: "The Mirror" — page split in half, left is dense text, right is its negative/inverse
 * 3: "The Infection" — text starts clean, organism cells GROW and consume it progressively
 * 4: "The Transmission" — concentric rings of text radiating from center, like a broadcast
 * 5: "The Autopsy" — body-shaped void with meridian lines and ghost point labels
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

function loadTexts() {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, 'holy-book-of-insanity.md'), 'utf-8');
  const jStart = raw.indexOf('# THE JOURNAL');
  const jText = jStart > -1 ? raw.slice(jStart) : '';
  const entries = jText.split(/\n---\n/).slice(1)
    .map(b => b.trim()).filter(b => b.length > 50)
    .map(b => b.split('\n').filter(l => !l.startsWith('**')).join(' ').replace(/\s+/g,' ').trim())
    .filter(b => b.length > 30);
  const fragments = [];
  for (const m of raw.matchAll(/Fragments: ([^\n]+)/g))
    fragments.push(...m[1].split(' — ').map(f=>f.trim()).filter(f=>f.length>2));
  const quotes = [];
  for (const m of raw.matchAll(/> "([^"]{30,})"/g)) quotes.push(m[1]);
  const allText = [...entries, ...quotes].sort(() => Math.random()-0.5);
  return { entries, fragments, quotes, allText };
}

// ═══════════════════════════════════════
// 1: THE COLLAPSE — spiral text sucked into void
// ═══════════════════════════════════════

function renderCollapse(seed, W=3000, H=3000) {
  const rng = createRng(seed);
  const texts = loadTexts();
  const voidCx = W*0.5, voidCy = H*0.5, voidR = Math.min(W,H)*0.08;
  let html = [], svg = [];

  // Build one enormous string of all text
  let megaText = texts.allText.join(' §§§ ').repeat(3);
  let charIdx = 0;

  // Place characters along a spiral from outside toward center
  const maxR = Math.min(W,H)*0.48;
  const turns = 40 + Math.floor(rng()*20);
  const totalSteps = turns * 120;
  const charSize = 5 + rng()*2;

  for (let i = 0; i < totalSteps; i++) {
    const t = i / totalSteps; // 0=outside, 1=center
    const angle = t * turns * Math.PI * 2;
    const r = maxR * (1 - t);

    if (r < voidR * 1.2) break;

    const x = voidCx + Math.cos(angle) * r;
    const y = voidCy + Math.sin(angle) * r;

    if (x < 10 || x > W-10 || y < 10 || y > H-10) continue;

    const ch = megaText[charIdx % megaText.length];
    charIdx++;
    if (ch === ' ' && rng() > 0.3) continue;

    // Characters get MORE DISTORTED near center
    const distortion = Math.pow(t, 2);
    const rot = (angle * 180 / Math.PI) + 90 + (rng()-0.5) * distortion * 60;
    const opacity = 0.3 + (1-t) * 0.6 + rng() * 0.1;
    const size = charSize * (0.5 + (1-t)*0.8 + distortion * rng());

    html.push(`<div style="position:absolute;left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;font-size:${size.toFixed(1)}px;opacity:${opacity.toFixed(2)};transform:rotate(${rot.toFixed(0)}deg);transform-origin:center">${esc(ch)}</div>`);
  }

  // Void
  svg.push(`<circle cx="${voidCx}" cy="${voidCy}" r="${voidR}" fill="#000"/>`);
  for (let r=0;r<25;r++) {
    svg.push(`<circle cx="${voidCx}" cy="${voidCy}" r="${voidR+r*3}" fill="#000" opacity="${Math.max(0,0.8-r*0.035).toFixed(2)}"/>`);
  }
  // Spiral lines
  for (let s=0;s<8;s++) {
    const sRng = createRng(seed+100+s);
    let d = 'M';
    for (let i=0;i<200;i++) {
      const t=i/200, a=t*20*Math.PI+s*Math.PI/4, r2=maxR*(1-t);
      if(r2<voidR) break;
      d+=(i===0?'':' L')+`${(voidCx+Math.cos(a)*r2).toFixed(0)},${(voidCy+Math.sin(a)*r2).toFixed(0)}`;
    }
    svg.push(`<path d="${d}" fill="none" stroke="#000" stroke-width="${(0.3+sRng()*0.5).toFixed(1)}" opacity="${(0.05+sRng()*0.08).toFixed(2)}"/>`);
  }

  svg.push(`<text x="15" y="${H-12}" font-size="6" font-family="'Courier New',monospace" fill="#000" opacity="0.3">§${(seed%999)+1} — THE COLLAPSE</text>`);

  return wrap(html, svg, W, H, '#fff');
}

// ═══════════════════════════════════════
// 2: THE MIRROR — left dense text, right is scattered/inverted
// ═══════════════════════════════════════

function renderMirror(seed, W=3000, H=3000) {
  const rng = createRng(seed);
  const texts = loadTexts();
  let html = [], svg = [];
  const midX = W * 0.5;

  // LEFT SIDE — dense, dark, orderly text
  const fontSize = 5.5;
  const lineH = fontSize * 1.4;
  const margin = W*0.03;
  const leftW = midX - margin*2;
  const cpl = Math.floor(leftW / (fontSize*0.5));
  const lines = Math.floor((H-margin*2)/lineH);
  let tIdx = 0;

  for (let line=0; line<lines; line++) {
    const y = margin + line*lineH;
    const text = texts.allText[tIdx%texts.allText.length];
    tIdx++;
    let lineText = text;
    while (lineText.length < cpl) lineText += ' ' + texts.allText[(tIdx++)%texts.allText.length];
    lineText = lineText.slice(0, cpl);

    html.push(`<div style="position:absolute;left:${margin}px;top:${y}px;width:${leftW}px;font-size:${fontSize}px;opacity:0.85;white-space:nowrap;overflow:hidden">${esc(lineText)}</div>`);
  }

  // MIRROR LINE — bold vertical
  svg.push(`<line x1="${midX}" y1="0" x2="${midX}" y2="${H}" stroke="#000" stroke-width="2" opacity="0.3"/>`);

  // RIGHT SIDE — same text but SCATTERED, rotated, fragmented
  const rRng = createRng(seed+200);
  tIdx = 0;
  for (let line=0; line<lines; line++) {
    const y = margin + line*lineH;
    const text = texts.allText[tIdx%texts.allText.length];
    tIdx++;

    // Break into word fragments and scatter them
    const words = text.split(' ').slice(0, 6);
    for (const word of words) {
      if (rRng() > 0.6) continue;
      const wx = midX + margin + rRng()*(leftW);
      const wy = y + (rRng()-0.5)*lineH*3;
      const rot = (rRng()-0.5)*90;
      const op = 0.15 + rRng()*0.5;
      const sz = fontSize*(0.5+rRng()*1.5);
      html.push(`<div style="position:absolute;left:${wx.toFixed(0)}px;top:${wy.toFixed(0)}px;font-size:${sz.toFixed(1)}px;opacity:${op.toFixed(2)};transform:rotate(${rot.toFixed(0)}deg);white-space:nowrap">${esc(word)}</div>`);
    }
  }

  // Right side — scattered fragments, connection lines
  for (let i=0;i<100;i++) {
    const frag = texts.fragments[Math.floor(rRng()*texts.fragments.length)];
    const fx = midX+margin+rRng()*leftW, fy = margin+rRng()*(H-margin*2);
    const rot = (rRng()-0.5)*45, op = 0.08+rRng()*0.15;
    html.push(`<div style="position:absolute;left:${fx.toFixed(0)}px;top:${fy.toFixed(0)}px;font-size:${(3+rRng()*5).toFixed(1)}px;opacity:${op.toFixed(2)};transform:rotate(${rot.toFixed(0)}deg);white-space:nowrap">${esc(frag)}</div>`);
  }

  // Connection lines crossing the mirror
  for (let i=0;i<40;i++) {
    const y1=margin+rRng()*(H-margin*2), y2=margin+rRng()*(H-margin*2);
    const x1=midX-rRng()*100, x2=midX+rRng()*200;
    svg.push(`<line x1="${x1.toFixed(0)}" y1="${y1.toFixed(0)}" x2="${x2.toFixed(0)}" y2="${y2.toFixed(0)}" stroke="#000" stroke-width="${(0.2+rRng()*0.4).toFixed(1)}" opacity="${(0.04+rRng()*0.06).toFixed(2)}"/>`);
  }

  svg.push(`<text x="15" y="${H-12}" font-size="6" font-family="'Courier New',monospace" fill="#000" opacity="0.3">§${(seed%999)+1} — THE MIRROR</text>`);

  return wrap(html, svg, W, H, '#f8f5ef');
}

// ═══════════════════════════════════════
// 3: THE INFECTION — clean text being consumed by organisms
// ═══════════════════════════════════════

function renderInfection(seed, W=3000, H=3000) {
  const rng = createRng(seed);
  const texts = loadTexts();
  let html = [], svg = [];

  // Infection centers — 3-5 points where organisms originate
  const numCenters = 3 + Math.floor(rng()*3);
  const centers = [];
  for (let c=0;c<numCenters;c++) {
    centers.push({ x: W*(0.15+rng()*0.7), y: H*(0.15+rng()*0.7), r: 100+rng()*300 });
  }

  // Text columns — dense, orderly
  const numCols = 5;
  const margin = W*0.03;
  const colGap = 6;
  const colW = (W-margin*2-colGap*(numCols-1))/numCols;
  const fontSize = 5.5+rng()*1.5;
  const lineH = fontSize*1.3;
  let tIdx = 0;

  for (let ci=0;ci<numCols;ci++) {
    const colX = margin+ci*(colW+colGap);
    let y = margin;
    while (y < H-margin) {
      const text = texts.allText[tIdx%texts.allText.length]; tIdx++;
      const cpl = Math.floor(colW/(fontSize*0.5));
      const words = text.split(' ');
      let line = '';
      for (const word of words) {
        if (y>H-margin) break;
        if ((line+' '+word).length>cpl) {
          if (line) {
            // Check infection proximity
            let infected = 0;
            for (const c of centers) {
              const d = Math.hypot(colX+colW/2-c.x, y-c.y);
              if (d < c.r) infected = Math.max(infected, 1-d/c.r);
            }
            let op = 0.85 - infected*0.5;
            let ts = '';
            if (infected > 0.3) {
              const sk = infected*15*(rng()>0.5?1:-1);
              ts = `transform:skewX(${sk.toFixed(0)}deg);letter-spacing:${(infected*3).toFixed(1)}px;`;
              if (infected>0.6 && rng()<infected*0.4) { y+=lineH; line=word; continue; }
            }
            html.push(`<div style="position:absolute;left:${colX}px;top:${y}px;width:${colW}px;font-size:${fontSize.toFixed(1)}px;opacity:${op.toFixed(2)};white-space:nowrap;overflow:hidden;${ts}">${esc(line)}</div>`);
            y+=lineH;
          }
          line=word;
        } else { line=line?line+' '+word:word; }
      }
      if (line&&y<H-margin) {
        html.push(`<div style="position:absolute;left:${colX}px;top:${y}px;width:${colW}px;font-size:${fontSize.toFixed(1)}px;opacity:0.85;white-space:nowrap;overflow:hidden">${esc(line)}</div>`);
        y+=lineH;
      }
      y+=fontSize*0.4;
    }
  }

  // ORGANISM CELLS at infection centers — BIG, dramatic
  for (const c of centers) {
    const oRng = createRng(seed+c.x*7+c.y*13);
    const numCells = 15+Math.floor(oRng()*25);
    for (let i=0;i<numCells;i++) {
      const a=oRng()*Math.PI*2, d=oRng()*c.r;
      const cx=c.x+Math.cos(a)*d, cy=c.y+Math.sin(a)*d;
      const sz=15+oRng()*60;
      const lobes=4+Math.floor(oRng()*6);
      const op=0.15+oRng()*0.25;

      let path='M';
      for (let j=0;j<=40;j++) {
        const ang=(j/40)*Math.PI*2;
        const w=sz*(0.4+0.6*Math.sin(ang*lobes+oRng()*10));
        path+=(j===0?'':' L')+`${(cx+Math.cos(ang)*w).toFixed(0)},${(cy+Math.sin(ang)*w).toFixed(0)}`;
      }
      path+=' Z';
      svg.push(`<path d="${path}" fill="none" stroke="#000" stroke-width="${(0.8+oRng()*1.5).toFixed(1)}" opacity="${op.toFixed(2)}"/>`);
      // Nucleus
      svg.push(`<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${(sz*0.15+oRng()*sz*0.1).toFixed(0)}" fill="none" stroke="#000" stroke-width="0.5" opacity="${(op*0.8).toFixed(2)}"/>`);
      // Dots
      for (let d2=0;d2<5+Math.floor(oRng()*10);d2++) {
        const da=oRng()*Math.PI*2, dd=oRng()*sz*0.4;
        svg.push(`<circle cx="${(cx+Math.cos(da)*dd).toFixed(0)}" cy="${(cy+Math.sin(da)*dd).toFixed(0)}" r="${(0.5+oRng()*1.5).toFixed(1)}" fill="#000" opacity="${(op*0.5).toFixed(2)}"/>`);
      }
    }
    // Mycelium spreading from center
    for (let m=0;m<15;m++) {
      let mx=c.x,my=c.y,a=oRng()*Math.PI*2;
      let d=`M${mx.toFixed(0)},${my.toFixed(0)}`;
      for (let s=0;s<20+Math.floor(oRng()*20);s++) {
        a+=(oRng()-0.5)*0.7; mx+=Math.cos(a)*(8+oRng()*20); my+=Math.sin(a)*(8+oRng()*20);
        d+=` L${mx.toFixed(0)},${my.toFixed(0)}`;
        if(oRng()>0.5) svg.push(`<circle cx="${mx.toFixed(0)}" cy="${my.toFixed(0)}" r="${(1+oRng()*3).toFixed(1)}" fill="#000" opacity="${(0.08+oRng()*0.12).toFixed(2)}"/>`);
      }
      svg.push(`<path d="${d}" fill="none" stroke="#000" stroke-width="${(0.4+oRng()*0.8).toFixed(1)}" opacity="${(0.1+oRng()*0.15).toFixed(2)}"/>`);
    }
  }

  svg.push(`<text x="15" y="${H-12}" font-size="6" font-family="'Courier New',monospace" fill="#000" opacity="0.3">§${(seed%999)+1} — THE INFECTION</text>`);

  return wrap(html, svg, W, H, '#f5f2ea');
}

// ═══════════════════════════════════════
// 4: THE TRANSMISSION — concentric rings of text from center
// ═══════════════════════════════════════

function renderTransmission(seed, W=3000, H=3000) {
  const rng = createRng(seed);
  const texts = loadTexts();
  let html = [], svg = [];
  const cx = W*0.5, cy = H*0.5;

  // Center void — small, like a broadcast point
  const voidR = 30+rng()*20;
  svg.push(`<circle cx="${cx}" cy="${cy}" r="${voidR}" fill="#000"/>`);
  for (let r=0;r<15;r++) svg.push(`<circle cx="${cx}" cy="${cy}" r="${voidR+r*2}" fill="#000" opacity="${Math.max(0,0.7-r*0.05).toFixed(2)}"/>`);

  // CONCENTRIC RINGS of text — each ring is one sentence curved around the center
  const maxR = Math.min(W,H)*0.47;
  const numRings = 60+Math.floor(rng()*40);
  const ringSpacing = (maxR-voidR-20)/numRings;

  for (let ring=0; ring<numRings; ring++) {
    const r2 = voidR + 30 + ring*ringSpacing;
    const text = texts.allText[ring%texts.allText.length];
    const circumference = 2*Math.PI*r2;
    const charSize = 4+rng()*3;
    const charsInRing = Math.floor(circumference/(charSize*0.55));
    const startAngle = rng()*Math.PI*2;

    // Opacity varies — some rings darker, some lighter
    const ringOp = 0.3+rng()*0.6;
    // Some rings are fragments, some are full text
    const isFragment = rng() > 0.7;

    for (let c=0; c<charsInRing; c++) {
      const angle = startAngle + (c/charsInRing)*Math.PI*2;
      const x = cx+Math.cos(angle)*r2;
      const y = cy+Math.sin(angle)*r2;

      if (x<5||x>W-5||y<5||y>H-5) continue;

      // Gap in ring for some chars
      if (isFragment && rng()>0.4) continue;
      if (rng()<0.02) continue; // random dropout

      const ch = text[c%text.length] || ' ';
      if (ch===' ' && rng()>0.3) continue;

      const rot = (angle*180/Math.PI)+90;
      html.push(`<div style="position:absolute;left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;font-size:${charSize.toFixed(1)}px;opacity:${ringOp.toFixed(2)};transform:rotate(${rot.toFixed(0)}deg);transform-origin:center">${esc(ch)}</div>`);
    }
  }

  // Radial lines — like broadcast rays
  for (let i=0;i<24;i++) {
    const a = (i/24)*Math.PI*2;
    const len = voidR+20+rng()*maxR*0.8;
    svg.push(`<line x1="${(cx+Math.cos(a)*(voidR+10)).toFixed(0)}" y1="${(cy+Math.sin(a)*(voidR+10)).toFixed(0)}" x2="${(cx+Math.cos(a)*len).toFixed(0)}" y2="${(cy+Math.sin(a)*len).toFixed(0)}" stroke="#000" stroke-width="${i%6===0?0.8:0.3}" opacity="${i%6===0?0.15:0.06}"/>`);
  }

  // Fragment labels along some radials
  for (let i=0;i<15;i++) {
    const a=rng()*Math.PI*2, d=voidR+50+rng()*maxR*0.6;
    const fx=cx+Math.cos(a)*d, fy=cy+Math.sin(a)*d;
    const frag=texts.fragments[Math.floor(rng()*texts.fragments.length)];
    const rot=a*180/Math.PI;
    svg.push(`<text x="${fx.toFixed(0)}" y="${fy.toFixed(0)}" font-size="5" font-family="'Courier New',monospace" fill="#000" opacity="0.2" transform="rotate(${rot.toFixed(0)} ${fx.toFixed(0)} ${fy.toFixed(0)})">${esc(frag)}</text>`);
  }

  svg.push(`<text x="15" y="${H-12}" font-size="6" font-family="'Courier New',monospace" fill="#000" opacity="0.3">§${(seed%999)+1} — THE TRANSMISSION</text>`);

  return wrap(html, svg, W, H, '#fff');
}

// ═══════════════════════════════════════
// 5: THE AUTOPSY — body outline with meridians and ghost points
// ═══════════════════════════════════════

function renderAutopsy(seed, W=3000, H=3000) {
  const rng = createRng(seed);
  const texts = loadTexts();
  let html = [], svg = [];

  // Body outline — simple elongated shape in center
  const bodyCx = W*0.5, bodyTop = H*0.08, bodyBot = H*0.88;
  const bodyH = bodyBot-bodyTop;
  const shoulderW = W*0.18, hipW = W*0.1, headR = W*0.06;

  // Draw body outline
  const bodyPath = `M${bodyCx},${bodyTop+headR}
    C${bodyCx-headR},${bodyTop} ${bodyCx+headR},${bodyTop} ${bodyCx},${bodyTop+headR}
    L${bodyCx},${bodyTop+headR*2.5}
    L${bodyCx-shoulderW},${bodyTop+bodyH*0.15}
    L${bodyCx-shoulderW*0.9},${bodyTop+bodyH*0.45}
    L${bodyCx-hipW},${bodyTop+bodyH*0.55}
    L${bodyCx-hipW*0.8},${bodyTop+bodyH*0.85}
    L${bodyCx-hipW*0.5},${bodyTop+bodyH}
    L${bodyCx+hipW*0.5},${bodyTop+bodyH}
    L${bodyCx+hipW*0.8},${bodyTop+bodyH*0.85}
    L${bodyCx+hipW},${bodyTop+bodyH*0.55}
    L${bodyCx+shoulderW*0.9},${bodyTop+bodyH*0.45}
    L${bodyCx+shoulderW},${bodyTop+bodyH*0.15}
    L${bodyCx},${bodyTop+headR*2.5} Z`;

  svg.push(`<path d="${bodyPath}" fill="#000" opacity="0.06" stroke="#000" stroke-width="1.5" opacity="0.2"/>`);

  // MERIDIAN LINES — flowing S-curves through the body
  const meridians = [
    { name: 'LUNG', x: -0.12, color: '#000' },
    { name: 'HEART', x: -0.05, color: '#000' },
    { name: 'LIVER', x: 0.08, color: '#000' },
    { name: 'KIDNEY', x: 0.12, color: '#000' },
    { name: 'SPLEEN', x: -0.08, color: '#000' },
    { name: 'PERICARDIUM', x: 0.05, color: '#000' },
  ];

  for (const mer of meridians) {
    const mRng = createRng(seed+mer.x*10000);
    let d = `M${(bodyCx+mer.x*W).toFixed(0)},${(bodyTop+bodyH*0.1).toFixed(0)}`;
    let py = bodyTop+bodyH*0.1;
    while (py < bodyBot-50) {
      py += 20+mRng()*30;
      const px = bodyCx + mer.x*W + Math.sin(py*0.01+mRng()*10)*30;
      d += ` L${px.toFixed(0)},${py.toFixed(0)}`;

      // Acupuncture point dot
      if (mRng()>0.6) {
        svg.push(`<circle cx="${px.toFixed(0)}" cy="${py.toFixed(0)}" r="4" fill="#000" opacity="0.25"/>`);
        svg.push(`<circle cx="${px.toFixed(0)}" cy="${py.toFixed(0)}" r="8" fill="none" stroke="#000" stroke-width="0.4" opacity="0.15"/>`);
        // Label
        const side = mer.x>0 ? 1 : -1;
        const label = ['Spirit Gate','Ghost Palace','Sea of Qi','Gushing Spring','Cloud Gate','Ghost Heart','Ghost Pillow','Great Abyss','Shining Sea','Gate of Life'][Math.floor(mRng()*10)];
        svg.push(`<text x="${(px+side*15).toFixed(0)}" y="${(py+2).toFixed(0)}" font-size="4" font-family="'Courier New',monospace" fill="#000" opacity="0.3" text-anchor="${side>0?'start':'end'}">${label}</text>`);
      }
    }
    svg.push(`<path d="${d}" fill="none" stroke="#000" stroke-width="0.6" opacity="0.15"/>`);
    // Meridian label
    svg.push(`<text x="${(bodyCx+mer.x*W).toFixed(0)}" y="${(bodyTop+bodyH*0.05).toFixed(0)}" font-size="4" font-family="'Courier New',monospace" fill="#000" opacity="0.2" text-anchor="middle">${mer.name}</text>`);
  }

  // GHOST POINTS — 13 specific points with labels
  const ghostPoints = [
    { name: '鬼宮 GHOST PALACE', y: 0.12, x: 0 },
    { name: '鬼信 GHOST FAITH', y: 0.35, x: -0.15 },
    { name: '鬼壘 EYE OF THE GHOST', y: 0.9, x: -0.06 },
    { name: '鬼心 GHOST HEART', y: 0.38, x: -0.04 },
    { name: '鬼路 GHOST PATH', y: 0.82, x: 0.08 },
    { name: '鬼枕 GHOST PILLOW', y: 0.08, x: 0.02 },
    { name: '鬼床 GHOST BED', y: 0.18, x: 0.06 },
    { name: '鬼市 GHOST MARKET', y: 0.15, x: -0.01 },
    { name: '鬼窟 GHOST CAVE', y: 0.4, x: 0.04 },
    { name: '鬼堂 GHOST HALL', y: 0.06, x: 0 },
    { name: '鬼藏 GHOST STORE', y: 0.6, x: 0 },
    { name: '鬼臣 GHOST LEG', y: 0.42, x: 0.13 },
    { name: '鬼封 GHOST SEAL', y: 0.55, x: -0.02 },
  ];

  for (let i=0; i<ghostPoints.length; i++) {
    const gp = ghostPoints[i];
    const gpx = bodyCx + gp.x*W;
    const gpy = bodyTop + gp.y*bodyH;

    // Point marker
    svg.push(`<circle cx="${gpx.toFixed(0)}" cy="${gpy.toFixed(0)}" r="6" fill="#000" opacity="0.35"/>`);
    svg.push(`<circle cx="${gpx.toFixed(0)}" cy="${gpy.toFixed(0)}" r="12" fill="none" stroke="#000" stroke-width="0.8" opacity="0.2"/>`);
    svg.push(`<circle cx="${gpx.toFixed(0)}" cy="${gpy.toFixed(0)}" r="18" fill="none" stroke="#000" stroke-width="0.3" opacity="0.1"/>`);

    // Number
    svg.push(`<text x="${gpx.toFixed(0)}" y="${(gpy+2).toFixed(0)}" font-size="5" font-family="'Courier New',monospace" fill="#fff" opacity="0.8" text-anchor="middle">${i+1}</text>`);

    // Label — leader line + text
    const side = gp.x >= 0 ? 1 : -1;
    const labelX = gpx + side*(80+rng()*100);
    svg.push(`<line x1="${gpx.toFixed(0)}" y1="${gpy.toFixed(0)}" x2="${labelX.toFixed(0)}" y2="${gpy.toFixed(0)}" stroke="#000" stroke-width="0.3" opacity="0.2"/>`);
    svg.push(`<text x="${labelX.toFixed(0)}" y="${(gpy+2).toFixed(0)}" font-size="5" font-family="'Courier New',monospace" fill="#000" opacity="0.35" text-anchor="${side>0?'start':'end'}">${gp.name}</text>`);
  }

  // TEXT COLUMNS on the sides — outside the body
  const colFontSize = 5;
  const colLineH = colFontSize*1.3;
  let tIdx = 0;
  // Left column
  for (let y=H*0.05; y<H*0.92; y+=colLineH) {
    const text = texts.allText[tIdx%texts.allText.length]; tIdx++;
    const maxW = bodyCx-shoulderW-60;
    const cpl = Math.floor(maxW/(colFontSize*0.5));
    html.push(`<div style="position:absolute;left:20px;top:${y.toFixed(0)}px;width:${maxW.toFixed(0)}px;font-size:${colFontSize}px;opacity:0.6;white-space:nowrap;overflow:hidden">${esc(text.slice(0,cpl))}</div>`);
  }
  // Right column
  for (let y=H*0.05; y<H*0.92; y+=colLineH) {
    const text = texts.allText[tIdx%texts.allText.length]; tIdx++;
    const startX = bodyCx+shoulderW+60;
    const maxW = W-startX-20;
    const cpl = Math.floor(maxW/(colFontSize*0.5));
    html.push(`<div style="position:absolute;left:${startX.toFixed(0)}px;top:${y.toFixed(0)}px;width:${maxW.toFixed(0)}px;font-size:${colFontSize}px;opacity:0.6;white-space:nowrap;overflow:hidden">${esc(text.slice(0,cpl))}</div>`);
  }

  svg.push(`<text x="15" y="${H-12}" font-size="6" font-family="'Courier New',monospace" fill="#000" opacity="0.3">§${(seed%999)+1} — THE AUTOPSY — ATLAS CORPORIS INVISIBILIS</text>`);

  return wrap(html, svg, W, H, '#f8f5ef');
}

function wrap(html, svg, W, H, bg) {
  return `<!DOCTYPE html><html><head><style>
*{margin:0;padding:0}
body{width:${W}px;height:${H}px;background:${bg};position:relative;overflow:hidden;font-family:'Courier New',monospace;color:#000}
</style></head><body>
${html.join('\n')}
<svg style="position:absolute;left:0;top:0;width:${W}px;height:${H}px;pointer-events:none;z-index:9999" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
${svg.join('\n')}
</svg>
</body></html>`;
}

// ═══ CLI ═══
const type = parseInt(process.argv[2]) || 1;
const seed = parseInt(process.argv[3]) || Math.floor(Math.random()*100000);
const name = process.argv[4] || `insane-${type}-${seed}`;
const out = path.join(OUTPUT_DIR, `${name}.png`);

const renderers = [null, renderCollapse, renderMirror, renderInfection, renderTransmission, renderAutopsy];
const names = [null, 'THE COLLAPSE', 'THE MIRROR', 'THE INFECTION', 'THE TRANSMISSION', 'THE AUTOPSY'];

if (type < 1 || type > 5) { console.error('Type must be 1-5'); process.exit(1); }

console.log(`\nRendering ${names[type]}...`);
console.log(`  Seed: ${seed}`);

const start = Date.now();
const html = renderers[type](seed);
const tmp = path.join(OUTPUT_DIR, `_t${seed}.html`);
fs.writeFileSync(tmp, html);

const browser = await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox']});
const page = await browser.newPage();
await page.setViewport({width:3000,height:3000,deviceScaleFactor:1});
await page.goto(`file://${tmp}`,{waitUntil:'networkidle0',timeout:180000});
await page.screenshot({path:out,type:'png'});
await browser.close();
fs.unlinkSync(tmp);

console.log(`  PNG: ${(fs.statSync(out).size/1024/1024).toFixed(2)} MB, Time: ${((Date.now()-start)/1000).toFixed(1)}s\n`);
