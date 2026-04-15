/**
 * Deep Reality Atlas — Renderer v2
 *
 * Major improvements:
 * - DRAMATIC void with organic fractal edges eating the document
 * - VARIED compositions (void position, no-void, corner-void)
 * - TEXT DENSITY variation (packed areas vs sparse)
 * - BOLD overlays that interact with text
 * - BIGGER organism cells visible at thumbnail scale
 *
 * Usage: node renderer/render-atlas-v2.mjs [seed] [output-name] [--style=TYPE]
 *
 * Styles: manuscript, mapped, occult, organism, full
 * Compositions: center, corner, edge, novoid (auto-selected from seed, or --comp=TYPE)
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
  const journalEntries = jText.split(/\n---\n/).slice(1)
    .map(b => b.trim()).filter(b => b.length > 50)
    .map(b => { const ls = b.split('\n'); const tm = ls[0]?.match(/^\*\*(.+?)\*\*/);
      return { title: tm?tm[1]:'', body: ls.slice(tm?1:0).join(' ').replace(/\s+/g,' ').trim() };
    }).filter(b => b.body.length > 30);
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
    'CATALOGUS FATTILLIARDIS','ATLAS CRUENTUS','TABULA HERMETICA','CATALOGUS DEMIURGI',
    'ATLAS CORPORIS INVISIBILIS','ATLAS SONORUM','EXEGESIS 2-3-74','ATLAS SOMNIORUM',
    'ATLAS ATLATUM','TABULA AETERNAE RECURRENTIAE','CATALOGUS COMPUTATIONIS',
    'TAXONOMY OF NUMINOUS ENCOUNTERS','CARTOGRAPHY OF THE BARDO STATES',
    'CLASSIFICATION OF THOUGHT-FORMS','ERRATA TO THE BOOK OF THE DEAD',
    'INVENTORY OF FAILED TAXONOMIES','THE VOID: A FIELD GUIDE',
    'CENSUS OF PHANTOM ISLANDS','THE OBSERVER-OBSERVED PROBLEM',
  ];
  const marginNotes = [
    'SEE PAGE ∞','cf. §47','→ NIGREDO','NB!','STATUS: URGENT','鬼','道','空',
    'ERRATA','→ §892','sic!','SPECIMEN #4091','PAGE X OF ∞','⊕','◉','∅','※','†',
    'WARNING','INCOMPLETE','ALL PREVIOUS REVISIONS VOID','THE SYSTEM IS THE SYMPTOM',
  ];
  return { journalEntries, fieldNotes, quotes, fragments, headers, marginNotes };
}

function render(seed, style, comp, W=3000, H=3000) {
  const rng = createRng(seed);
  for (let i=0;i<(seed%7)+3;i++) rng();
  const texts = loadTexts();
  const allBodies = [
    ...texts.journalEntries.map(e=>e.body),...texts.fieldNotes,
    ...texts.quotes.map(q=>`"${q}"`),
  ].sort(()=>rng()-0.5);

  // ═══ COMPOSITION — where is the void? ═══
  let voidCx, voidCy, voidR, hasVoid = true;
  if (comp === 'novoid') {
    hasVoid = false; voidCx=0; voidCy=0; voidR=0;
  } else if (comp === 'corner') {
    const corner = Math.floor(rng()*4);
    voidCx = corner%2===0 ? W*0.12 : W*0.88;
    voidCy = corner<2 ? H*0.12 : H*0.88;
    voidR = Math.min(W,H)*(0.12+rng()*0.08);
  } else if (comp === 'edge') {
    const edge = Math.floor(rng()*4);
    if (edge===0) { voidCx=W*0.5; voidCy=H*0.08; }
    else if (edge===1) { voidCx=W*0.92; voidCy=H*0.5; }
    else if (edge===2) { voidCx=W*0.5; voidCy=H*0.92; }
    else { voidCx=W*0.08; voidCy=H*0.5; }
    voidR = Math.min(W,H)*(0.1+rng()*0.06);
  } else { // center (default)
    voidCx = W*(0.3+rng()*0.4);
    voidCy = H*(0.3+rng()*0.4);
    voidR = Math.min(W,H)*(0.1+rng()*0.08);
  }

  console.log(`  Composition: ${comp}, void: ${hasVoid ? `(${Math.round(voidCx)},${Math.round(voidCy)}) r=${Math.round(voidR)}` : 'NONE'}`);

  // ═══ COLUMNS ═══
  const numCols = 4 + Math.floor(rng()*3);
  const margin = W*0.025;
  const colGap = 6;
  const colWidth = (W-margin*2-colGap*(numCols-1))/numCols;

  // ═══ TEXT DENSITY MAP — varies across the page ═══
  // Some columns are DENSE (small font, packed), some SPARSE (larger font, gaps)
  const colDensity = [];
  for (let c=0;c<numCols;c++) {
    colDensity.push(0.5 + rng()*0.5 + (rng()>0.7 ? 0.5 : 0)); // 0.5-1.5
  }

  let htmlParts = [];
  let svgParts = [];

  // ═══ RENDER COLUMNS ═══
  for (let ci=0; ci<numCols; ci++) {
    const colX = margin + ci*(colWidth+colGap);
    const density = colDensity[ci];
    const baseFontSize = density > 1 ? 4.5+rng()*1 : 6+rng()*2;
    const lineHeight = baseFontSize*(1.2+rng()*0.2);
    const cRng = createRng(seed+1000+ci*137);
    let y = margin;
    let textPtr = (ci*7)%allBodies.length;

    while (y < H-margin) {
      // Check void
      const distV = hasVoid ? Math.hypot(colX+colWidth/2-voidCx, y-voidCy) : Infinity;
      const vInf = hasVoid ? Math.max(0, 1-distV/(voidR*2.2)) : 0;

      if (hasVoid && distV < voidR*0.65) { y += 30; continue; }

      // Void distortion
      let ts='', opMod=1;
      if (vInf>0.05) {
        opMod = Math.max(0.1, 1-vInf*1.3);
        const px = ((colX+colWidth/2-voidCx)/distV)*vInf*35;
        const py = ((y-voidCy)/distV)*vInf*25;
        const sk = vInf*12*(colX<voidCx?-1:1);
        ts = `transform:translate(${px.toFixed(0)}px,${py.toFixed(0)}px) skewX(${sk.toFixed(1)}deg);`;
        if (vInf>0.25 && cRng()<vInf*0.6) { y+=20; continue; }
      }

      const bt = cRng();

      // SECTION HEADER
      if (bt<0.05 && y>margin+20) {
        const h = texts.headers[Math.floor(cRng()*texts.headers.length)];
        htmlParts.push(`<div style="position:absolute;left:${colX}px;top:${y}px;width:${colWidth}px;font-size:${(baseFontSize*1.2).toFixed(1)}px;font-weight:bold;letter-spacing:1.5px;opacity:${(0.9*opMod).toFixed(2)};border-bottom:0.8px solid rgba(0,0,0,0.25);padding-bottom:3px;${ts}">${esc(h)}</div>`);
        y += baseFontSize*3;

      // FRAGMENT LIST
      } else if (bt<0.12) {
        const n = 3+Math.floor(cRng()*6);
        for (let f=0;f<n&&y<H-margin;f++) {
          const frag = texts.fragments[Math.floor(cRng()*texts.fragments.length)];
          htmlParts.push(`<div style="position:absolute;left:${colX+6}px;top:${y}px;width:${colWidth-6}px;font-size:${(baseFontSize*0.8).toFixed(1)}px;letter-spacing:0.8px;opacity:${(0.65*opMod).toFixed(2)};${ts}">${esc(frag)}</div>`);
          y += baseFontSize*1.05;
        }
        y+=4;

      // GAP (breathing room — more gaps in sparse columns)
      } else if (bt < (density>1 ? 0.13 : 0.22)) {
        y += 8+cRng()*20;

      // DENSE PARAGRAPH
      } else {
        const text = allBodies[textPtr%allBodies.length]; textPtr++;
        const cpl = Math.floor(colWidth/(baseFontSize*0.5));
        const words = text.split(' ');
        let line = '';
        for (const word of words) {
          if (y>H-margin) break;
          if ((line+' '+word).length>cpl) {
            if (line) {
              htmlParts.push(`<div style="position:absolute;left:${colX}px;top:${y}px;width:${colWidth}px;font-size:${baseFontSize.toFixed(1)}px;line-height:${lineHeight.toFixed(1)}px;opacity:${(0.9*opMod).toFixed(2)};white-space:nowrap;overflow:hidden;${ts}">${esc(line)}</div>`);
              y += lineHeight;
            }
            line = word;
          } else { line = line ? line+' '+word : word; }
        }
        if (line && y<H-margin) {
          htmlParts.push(`<div style="position:absolute;left:${colX}px;top:${y}px;width:${colWidth}px;font-size:${baseFontSize.toFixed(1)}px;line-height:${lineHeight.toFixed(1)}px;opacity:${(0.9*opMod).toFixed(2)};white-space:nowrap;overflow:hidden;${ts}">${esc(line)}</div>`);
          y += lineHeight;
        }
        y += baseFontSize*0.4;
      }
    }

    // Column separator
    if (ci<numCols-1) {
      htmlParts.push(`<div style="position:absolute;left:${colX+colWidth+colGap/2}px;top:${margin}px;width:0;height:${H-margin*2}px;border-left:0.4px solid rgba(0,0,0,0.12)"></div>`);
    }
  }

  // ═══ MARGIN ANNOTATIONS ═══
  const mRng = createRng(seed+800);
  for (let i=0;i<30+Math.floor(rng()*25);i++) {
    const ci = Math.floor(mRng()*(numCols+1));
    let ax = ci===0 ? 3+mRng()*(margin-5) : ci===numCols ? W-margin+3 : margin+ci*(colWidth+colGap)-colGap+1;
    const ay = margin+mRng()*(H-margin*2);
    const note = texts.marginNotes[Math.floor(mRng()*texts.marginNotes.length)];
    htmlParts.push(`<div style="position:absolute;left:${ax.toFixed(0)}px;top:${ay.toFixed(0)}px;font-size:${(3.5+mRng()*2).toFixed(1)}px;opacity:${(0.25+mRng()*0.35).toFixed(2)};transform:rotate(${((mRng()-0.5)*20).toFixed(0)}deg);white-space:nowrap">${esc(note)}</div>`);
  }

  // ═══ SVG: DRAMATIC VOID ═══
  if (hasVoid) {
    // Solid core
    svgParts.push(`<circle cx="${voidCx.toFixed(0)}" cy="${voidCy.toFixed(0)}" r="${(voidR*0.55).toFixed(0)}" fill="#000"/>`);

    // Feathered edge — many rings
    for (let ring=0;ring<35;ring++) {
      const r = voidR*(0.55+ring*0.015);
      svgParts.push(`<circle cx="${voidCx.toFixed(0)}" cy="${voidCy.toFixed(0)}" r="${r.toFixed(0)}" fill="#000" opacity="${Math.max(0,0.85-ring*0.025).toFixed(2)}"/>`);
    }

    // ORGANIC EDGE — ink blobs, irregular boundary
    const eRng = createRng(seed+900);
    for (let i=0;i<4000;i++) {
      const a = eRng()*Math.PI*2;
      const d = voidR*(0.5+eRng()*0.9);
      const px = voidCx+Math.cos(a)*d, py = voidCy+Math.sin(a)*d;
      const sz = 0.5+eRng()*5;
      const dfe = Math.abs(d-voidR*0.7)/voidR;
      const op = Math.max(0, 0.7-dfe*1.2)*(0.3+eRng()*0.7);
      if (op>0.02) svgParts.push(`<circle cx="${px.toFixed(0)}" cy="${py.toFixed(0)}" r="${sz.toFixed(1)}" fill="#000" opacity="${op.toFixed(2)}"/>`);
    }

    // FRACTAL TENDRILS — long branching cracks reaching DEEP into the text
    const tRng = createRng(seed+950);
    for (let t=0;t<70;t++) {
      const sa = tRng()*Math.PI*2;
      let tx=voidCx+Math.cos(sa)*voidR*0.85, ty=voidCy+Math.sin(sa)*voidR*0.85, a=sa;
      const numSegs = 12+Math.floor(tRng()*35); // LONGER tendrils
      let d = `M${tx.toFixed(0)},${ty.toFixed(0)}`;
      const bw = 0.4+tRng()*1.8; // THICKER
      const bo = 0.12+tRng()*0.3; // MORE VISIBLE

      for (let s=0;s<numSegs;s++) {
        a += (tRng()-0.5)*0.6;
        const sl = 5+tRng()*30; // LONGER segments
        tx += Math.cos(a)*sl; ty += Math.sin(a)*sl;
        d += ` L${tx.toFixed(0)},${ty.toFixed(0)}`;

        // Branch blobs — BIGGER
        if (tRng()>0.4) {
          svgParts.push(`<circle cx="${tx.toFixed(0)}" cy="${ty.toFixed(0)}" r="${(0.5+tRng()*3.5).toFixed(1)}" fill="#000" opacity="${(bo*0.7).toFixed(2)}"/>`);
        }

        // Sub-branches
        if (tRng()>0.6) {
          let bx=tx,by=ty,ba=a+(tRng()-0.5)*1.5;
          let bd=`M${bx.toFixed(0)},${by.toFixed(0)}`;
          for (let bs=0;bs<4+Math.floor(tRng()*8);bs++) {
            ba+=(tRng()-0.5)*0.6; bx+=Math.cos(ba)*(4+tRng()*15); by+=Math.sin(ba)*(4+tRng()*15);
            bd+=` L${bx.toFixed(0)},${by.toFixed(0)}`;
            if (tRng()>0.5) svgParts.push(`<circle cx="${bx.toFixed(0)}" cy="${by.toFixed(0)}" r="${(0.3+tRng()*2).toFixed(1)}" fill="#000" opacity="${(bo*0.4).toFixed(2)}"/>`);
          }
          svgParts.push(`<path d="${bd}" fill="none" stroke="#000" stroke-width="${(bw*0.4).toFixed(1)}" opacity="${(bo*0.5).toFixed(2)}"/>`);
        }
      }
      svgParts.push(`<path d="${d}" fill="none" stroke="#000" stroke-width="${bw.toFixed(1)}" opacity="${bo.toFixed(2)}"/>`);
    }

    // Scattered fragments rotating toward void
    const sRng = createRng(seed+970);
    for (let i=0;i<400;i++) {
      const a=sRng()*Math.PI*2, d=voidR*(0.7+sRng()*2.5);
      const px=voidCx+Math.cos(a)*d, py=voidCy+Math.sin(a)*d;
      if(px<0||px>W||py<0||py>H) continue;
      const dn=(d-voidR*0.7)/(voidR*2.5);
      const op=Math.max(0.05,(1-dn)*(0.15+sRng()*0.4));
      const rot=Math.atan2(voidCy-py,voidCx-px)*180/Math.PI+(sRng()-0.5)*30;
      const frag=texts.fragments[Math.floor(sRng()*texts.fragments.length)];
      const fs=3+sRng()*8*(1-dn*0.5);
      svgParts.push(`<text x="${px.toFixed(0)}" y="${py.toFixed(0)}" font-size="${fs.toFixed(1)}" font-family="'Courier New',monospace" fill="#000" opacity="${op.toFixed(2)}" transform="rotate(${rot.toFixed(0)} ${px.toFixed(0)} ${py.toFixed(0)})">${esc(frag.slice(0,1+Math.floor(sRng()*8)))}</text>`);
    }

    // Connection lines from void
    const cRng = createRng(seed+980);
    for (let i=0;i<60;i++) {
      const a=cRng()*Math.PI*2;
      const sr=voidR*0.8, er=voidR*(2+cRng()*6);
      svgParts.push(`<line x1="${(voidCx+Math.cos(a)*sr).toFixed(0)}" y1="${(voidCy+Math.sin(a)*sr).toFixed(0)}" x2="${(voidCx+Math.cos(a+(cRng()-0.5)*0.3)*er).toFixed(0)}" y2="${(voidCy+Math.sin(a+(cRng()-0.5)*0.3)*er).toFixed(0)}" stroke="#000" stroke-width="${(0.2+cRng()*0.4).toFixed(2)}" opacity="${(0.04+cRng()*0.08).toFixed(2)}"/>`);
    }
  }

  // ═══ OVERLAYS ═══
  if (style==='mapped'||style==='full') {
    addCartographic(svgParts, W, H, seed+5000, rng);
  }
  if (style==='occult'||style==='full') {
    addSymbols(svgParts, W, H, seed+6000, rng);
  }
  if (style==='organism'||style==='full') {
    addOrganism(svgParts, W, H, voidCx, voidCy, voidR, hasVoid, seed+7000, rng);
  }

  svgParts.push(`<text x="15" y="${H-12}" font-size="6" font-family="'Courier New',monospace" fill="#000" opacity="0.3">§${(seed%999)+1} — FIELD NOTES — STATUS: INCOMPLETE</text>`);

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

// ═══ INLINE OVERLAYS — BOLD, VISIBLE ═══

function addCartographic(p, W, H, seed, rng) {
  const r = createRng(seed);
  // Big contour groups
  for (let c=0;c<6+Math.floor(r()*6);c++) {
    const cx=W*(0.1+r()*0.8), cy=H*(0.1+r()*0.8);
    const baseR=50+r()*300, nRings=4+Math.floor(r()*8);
    for (let ring=0;ring<nRings;ring++) {
      const rr=baseR+ring*(12+r()*20);
      let d='M'; const steps=50;
      for (let i=0;i<=steps;i++) {
        const a=(i/steps)*Math.PI*2;
        const w=rr*(1+Math.sin(a*3+r()*10)*0.12+(r()-0.5)*0.06);
        d+=(i===0?'':' L')+`${(cx+Math.cos(a)*w).toFixed(0)},${(cy+Math.sin(a)*w).toFixed(0)}`;
      }
      p.push(`<path d="${d}" fill="none" stroke="#000" stroke-width="${(1+r()*1.5).toFixed(1)}" opacity="${(0.15+r()*0.15).toFixed(2)}"/>`);
    }
  }
  // Compass rose
  const cx=W*(0.15+r()*0.7), cy=H*(0.15+r()*0.7), cr=80+r()*120;
  for (let i=0;i<16;i++) {
    const a=(i/16)*Math.PI*2, outer=cr*(0.5+r()*0.5);
    p.push(`<line x1="${(cx+Math.cos(a)*5).toFixed(0)}" y1="${(cy+Math.sin(a)*5).toFixed(0)}" x2="${(cx+Math.cos(a)*outer).toFixed(0)}" y2="${(cy+Math.sin(a)*outer).toFixed(0)}" stroke="#000" stroke-width="${i%4===0?1.5:0.5}" opacity="${i%4===0?0.25:0.12}"/>`);
  }
  p.push(`<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${(cr*0.3).toFixed(0)}" fill="none" stroke="#000" stroke-width="0.6" opacity="0.15"/>`);
  p.push(`<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="4" fill="#000" opacity="0.25"/>`);
  // Dotted paths
  for (let i=0;i<6+Math.floor(r()*6);i++) {
    let px=W*r(),py=H*r(),d=`M${px.toFixed(0)},${py.toFixed(0)}`;
    for (let s=0;s<12+Math.floor(r()*15);s++) {
      px+=(r()-0.5)*150; py+=(r()-0.5)*150;
      d+=` L${px.toFixed(0)},${py.toFixed(0)}`;
    }
    p.push(`<path d="${d}" fill="none" stroke="#000" stroke-width="0.6" stroke-dasharray="4,6" opacity="${(0.1+r()*0.12).toFixed(2)}"/>`);
  }
}

function addSymbols(p, W, H, seed, rng) {
  const r = createRng(seed);
  const drawSym = (cx,cy,sz) => {
    const t=Math.floor(r()*6);
    if (t===0) { // Flower of life
      const ir=sz/2.5;
      let s='';
      for (let i=0;i<7;i++) {
        const a=i===0?0:(i-1)/6*Math.PI*2;
        const x=i===0?cx:cx+Math.cos(a)*ir, y=i===0?cy:cy+Math.sin(a)*ir;
        if(r()>0.15) s+=`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${ir.toFixed(0)}" fill="none" stroke="#000" stroke-width="0.6"/>`;
      }
      return s;
    } else if (t===1) { // Eye
      return `<path d="M${(cx-sz).toFixed(0)},${cy.toFixed(0)} Q${cx.toFixed(0)},${(cy-sz*0.7).toFixed(0)} ${(cx+sz).toFixed(0)},${cy.toFixed(0)} Q${cx.toFixed(0)},${(cy+sz*0.7).toFixed(0)} ${(cx-sz).toFixed(0)},${cy.toFixed(0)}" fill="none" stroke="#000" stroke-width="0.8"/><circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${(sz*0.25).toFixed(1)}" fill="#000"/>`;
    } else if (t===2) { // Ouroboros
      return `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${sz.toFixed(0)}" fill="none" stroke="#000" stroke-width="1"/><circle cx="${(cx+sz).toFixed(0)}" cy="${cy.toFixed(0)}" r="${(sz*0.12).toFixed(1)}" fill="#000"/>`;
    } else if (t===3) { // Triangle
      const d=r()>0.5?-1:1;
      return `<path d="M${cx.toFixed(0)},${(cy+d*sz).toFixed(0)} L${(cx-sz*0.87).toFixed(0)},${(cy-d*sz*0.5).toFixed(0)} L${(cx+sz*0.87).toFixed(0)},${(cy-d*sz*0.5).toFixed(0)} Z" fill="none" stroke="#000" stroke-width="0.8"/>`;
    } else if (t===4) { // Spiral
      let d='M';
      for(let i=0;i<60;i++){const tt=i/60,a=tt*Math.PI*5,sr=tt*sz;d+=(i===0?'':' L')+`${(cx+Math.cos(a)*sr).toFixed(0)},${(cy+Math.sin(a)*sr).toFixed(0)}`;}
      return `<path d="${d}" fill="none" stroke="#000" stroke-width="0.6"/>`;
    } else { // Cross+circle
      return `<line x1="${(cx-sz).toFixed(0)}" y1="${cy.toFixed(0)}" x2="${(cx+sz).toFixed(0)}" y2="${cy.toFixed(0)}" stroke="#000" stroke-width="0.8"/><line x1="${cx.toFixed(0)}" y1="${(cy-sz).toFixed(0)}" x2="${cx.toFixed(0)}" y2="${(cy+sz).toFixed(0)}" stroke="#000" stroke-width="0.8"/><circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${(sz*0.7).toFixed(0)}" fill="none" stroke="#000" stroke-width="0.5"/>`;
    }
  };
  // BIG symbols
  for (let i=0;i<10+Math.floor(r()*8);i++) {
    const sx=W*(0.05+r()*0.9), sy=H*(0.05+r()*0.9), sz=20+r()*60;
    p.push(`<g opacity="${(0.15+r()*0.2).toFixed(2)}">${drawSym(sx,sy,sz)}</g>`);
  }
  // Recurring tiny symbol — 80+
  for (let i=0;i<80+Math.floor(r()*60);i++) {
    const sx=W*r(), sy=H*r(), sz=3+r()*8;
    p.push(`<g opacity="${(0.08+r()*0.15).toFixed(2)}">${drawSym(sx,sy,sz)}</g>`);
  }
}

function addOrganism(p, W, H, vCx, vCy, vR, hasVoid, seed, rng) {
  const r = createRng(seed);
  // BIG cellular forms — visible at thumbnail
  for (let c=0;c<50+Math.floor(r()*30);c++) {
    let cx,cy;
    if (hasVoid && r()>0.3) {
      const a=r()*Math.PI*2, d=vR*(0.8+r()*2.5);
      cx=vCx+Math.cos(a)*d; cy=vCy+Math.sin(a)*d;
    } else {
      cx=W*(0.05+r()*0.9); cy=H*(0.05+r()*0.9);
    }
    const sz = 10+r()*50; // UP TO 50px — BIG
    const op = 0.12+r()*0.2;
    const lobes = 4+Math.floor(r()*7);

    let path='M';
    for (let i=0;i<=40;i++) {
      const a=(i/40)*Math.PI*2;
      const w=sz*(0.4+0.6*Math.sin(a*lobes+r()*10));
      path+=(i===0?'':' L')+`${(cx+Math.cos(a)*w).toFixed(0)},${(cy+Math.sin(a)*w).toFixed(0)}`;
    }
    path+=' Z';
    p.push(`<path d="${path}" fill="none" stroke="#000" stroke-width="${(0.6+r()*1.2).toFixed(1)}" opacity="${op.toFixed(2)}"/>`);

    // Nucleus
    if (r()>0.15) {
      const nr=sz*(0.15+r()*0.2);
      p.push(`<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${nr.toFixed(0)}" fill="none" stroke="#000" stroke-width="0.5" opacity="${(op*0.8).toFixed(2)}"/>`);
    }
    // Organelle dots
    for (let s=0;s<5+Math.floor(r()*15);s++) {
      const sa=r()*Math.PI*2, sd=r()*sz*0.5;
      p.push(`<circle cx="${(cx+Math.cos(sa)*sd).toFixed(0)}" cy="${(cy+Math.sin(sa)*sd).toFixed(0)}" r="${(0.5+r()*1.5).toFixed(1)}" fill="#000" opacity="${(op*0.6).toFixed(2)}"/>`);
    }
  }

  // Mycelium — BOLDER
  for (let m=0;m<30+Math.floor(r()*20);m++) {
    let mx=W*(0.1+r()*0.8), my=H*(0.1+r()*0.8), a=r()*Math.PI*2;
    const segs=15+Math.floor(r()*30);
    let d=`M${mx.toFixed(0)},${my.toFixed(0)}`;
    const lOp=0.08+r()*0.15, lSw=0.4+r()*0.8;
    for (let s=0;s<segs;s++) {
      a+=(r()-0.5)*0.8; mx+=Math.cos(a)*(5+r()*25); my+=Math.sin(a)*(5+r()*25);
      d+=` L${mx.toFixed(0)},${my.toFixed(0)}`;
      if (r()>0.4) p.push(`<circle cx="${mx.toFixed(0)}" cy="${my.toFixed(0)}" r="${(1+r()*3).toFixed(1)}" fill="#000" opacity="${(lOp*0.7).toFixed(2)}"/>`);
      if (r()>0.7) {
        let bx=mx,by=my,ba=a+(r()-0.5)*1.5;
        let bd=`M${bx.toFixed(0)},${by.toFixed(0)}`;
        for(let bs=0;bs<3+Math.floor(r()*6);bs++){ba+=(r()-0.5)*0.6;bx+=Math.cos(ba)*(3+r()*12);by+=Math.sin(ba)*(3+r()*12);bd+=` L${bx.toFixed(0)},${by.toFixed(0)}`;}
        p.push(`<path d="${bd}" fill="none" stroke="#000" stroke-width="${(lSw*0.5).toFixed(1)}" opacity="${(lOp*0.5).toFixed(2)}"/>`);
      }
    }
    p.push(`<path d="${d}" fill="none" stroke="#000" stroke-width="${lSw.toFixed(1)}" opacity="${lOp.toFixed(2)}"/>`);
  }
}

// ═══ CLI ═══
const args = process.argv.slice(2);
const seed = parseInt(args[0]) || Math.floor(Math.random()*100000);
const name = args[1] || `atlas-${seed}`;
const styleFlag = args.find(a=>a.startsWith('--style='));
const compFlag = args.find(a=>a.startsWith('--comp='));
const style = styleFlag ? styleFlag.split('=')[1] : 'manuscript';
const comp = compFlag ? compFlag.split('=')[1] : ['center','center','corner','edge','novoid'][seed%5];

const out = path.join(OUTPUT_DIR, `${name}.png`);
console.log(`\nRendering Atlas v2...`);
console.log(`  Seed: ${seed}, Style: ${style}`);

const start = Date.now();
const html = render(seed, style, comp);
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
