/**
 * Deep Reality Atlas — Final Gallery Renderer
 *
 * 3 compositions, refined to be exceptional:
 * 1: MANUSCRIPT — dense text columns + void + bold overlays
 * 2: INFECTION — clean text being consumed by organism cells
 * 3: TRANSMISSION — concentric rings of text radiating from void
 *
 * Usage: node renderer/render-final.mjs [1-3] [seed] [output-name]
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
    'TABULA SMARAGDINA — OPERATIONES','ATLAS PLEROMATIS','TABULA BARDO — TRANSITIONES',
    'TABULA VACUITATIS','TABULA AUTOPOIETICA','ATLAS CRUENTUS — ARTAUD',
    'CATALOGUS DEMIURGI — SAKLAS','ATLAS CORPORIS INVISIBILIS','EXEGESIS 2-3-74',
    'TAXONOMY OF NUMINOUS ENCOUNTERS','CARTOGRAPHY OF THE BARDO STATES',
    'CLASSIFICATION OF THOUGHT-FORMS','THE VOID: A FIELD GUIDE',
    'INVENTORY OF FAILED TAXONOMIES','ERRATA TO THE BOOK OF THE DEAD',
  ];
  const marginNotes = [
    'SEE PAGE ∞','cf. §47','→ NIGREDO','NB!','STATUS: URGENT','鬼','道','空',
    'ERRATA','→ §892','sic!','SPECIMEN #4091','⊕','◉','∅','※','†','WARNING',
    'ALL PREVIOUS REVISIONS VOID','THE SYSTEM IS THE SYMPTOM',
  ];
  const allText = [...entries,...fieldNotes,...quotes.map(q=>`"${q}"`)];
  return { entries, fieldNotes, quotes, fragments, headers, marginNotes, allText };
}

// ═══════════════════════════════════════════════════════
// 1: MANUSCRIPT — refined
// ═══════════════════════════════════════════════════════

function renderManuscript(seed, W=3000, H=3000) {
  const rng = createRng(seed);
  for (let i=0;i<(seed%7)+3;i++) rng();
  const texts = loadTexts();
  const bodies = [...texts.allText].sort(()=>rng()-0.5);

  // Void — varied position
  const voidType = seed % 4;
  let vCx, vCy, vR;
  if (voidType===0) { vCx=W*(0.35+rng()*0.3); vCy=H*(0.35+rng()*0.3); vR=Math.min(W,H)*(0.1+rng()*0.08); }
  else if (voidType===1) { vCx=W*0.12; vCy=H*0.85; vR=Math.min(W,H)*(0.12+rng()*0.06); }
  else if (voidType===2) { vCx=W*0.85; vCy=H*0.15; vR=Math.min(W,H)*(0.1+rng()*0.06); }
  else { vCx=W*0.5; vCy=H*0.9; vR=Math.min(W,H)*(0.1+rng()*0.05); }

  const numCols = 5+Math.floor(rng()*2);
  const margin = W*0.025;
  const colGap = 6;
  const colW = (W-margin*2-colGap*(numCols-1))/numCols;

  let html=[], svg=[];

  // COLUMNS with density variation
  for (let ci=0;ci<numCols;ci++) {
    const colX = margin+ci*(colW+colGap);
    const isDense = rng()>0.5;
    const fs = isDense ? 4.5+rng()*1 : 6+rng()*1.5;
    const lh = fs*(1.2+rng()*0.15);
    const cRng = createRng(seed+1000+ci*137);
    let y=margin, tPtr=(ci*7)%bodies.length;

    while (y<H-margin) {
      const distV = Math.hypot(colX+colW/2-vCx, y-vCy);
      const vInf = Math.max(0, 1-distV/(vR*2.2));
      if (distV<vR*0.6) { y+=30; continue; }

      let ts='', opMod=1;
      if (vInf>0.05) {
        opMod=Math.max(0.1, 1-vInf*1.3);
        const px=((colX+colW/2-vCx)/distV)*vInf*40;
        const py=((y-vCy)/distV)*vInf*30;
        const sk=vInf*15*(colX<vCx?-1:1);
        ts=`transform:translate(${px.toFixed(0)}px,${py.toFixed(0)}px) skewX(${sk.toFixed(1)}deg);`;
        if (vInf>0.2 && cRng()<vInf*0.7) { y+=15; continue; }
      }

      const bt=cRng();
      if (bt<0.05 && y>margin+20) {
        html.push(`<div style="position:absolute;left:${colX}px;top:${y}px;width:${colW}px;font-size:${(fs*1.2).toFixed(1)}px;font-weight:bold;letter-spacing:1.5px;opacity:${(0.95*opMod).toFixed(2)};border-bottom:1px solid rgba(0,0,0,0.3);padding-bottom:3px;${ts}">${esc(texts.headers[Math.floor(cRng()*texts.headers.length)])}</div>`);
        y+=fs*3;
      } else if (bt<0.1) {
        const n=3+Math.floor(cRng()*5);
        for (let f=0;f<n&&y<H-margin;f++) {
          html.push(`<div style="position:absolute;left:${colX+6}px;top:${y}px;width:${colW-6}px;font-size:${(fs*0.8).toFixed(1)}px;letter-spacing:1px;opacity:${(0.7*opMod).toFixed(2)};${ts}">${esc(texts.fragments[Math.floor(cRng()*texts.fragments.length)])}</div>`);
          y+=fs*1.05;
        }
        y+=3;
      } else if (bt < (isDense?0.11:0.2)) {
        y+=5+cRng()*15;
      } else {
        const text=bodies[tPtr%bodies.length]; tPtr++;
        const cpl=Math.floor(colW/(fs*0.5));
        const words=text.split(' ');
        let line='';
        for (const word of words) {
          if (y>H-margin) break;
          if ((line+' '+word).length>cpl) {
            if (line) {
              html.push(`<div style="position:absolute;left:${colX}px;top:${y}px;width:${colW}px;font-size:${fs.toFixed(1)}px;line-height:${lh.toFixed(1)}px;opacity:${(0.92*opMod).toFixed(2)};white-space:nowrap;overflow:hidden;${ts}">${esc(line)}</div>`);
              y+=lh;
            }
            line=word;
          } else { line=line?line+' '+word:word; }
        }
        if (line&&y<H-margin) {
          html.push(`<div style="position:absolute;left:${colX}px;top:${y}px;width:${colW}px;font-size:${fs.toFixed(1)}px;line-height:${lh.toFixed(1)}px;opacity:${(0.92*opMod).toFixed(2)};white-space:nowrap;overflow:hidden;${ts}">${esc(line)}</div>`);
          y+=lh;
        }
        y+=fs*0.3;
      }
    }
    if (ci<numCols-1) html.push(`<div style="position:absolute;left:${colX+colW+colGap/2}px;top:${margin}px;width:0;height:${H-margin*2}px;border-left:0.4px solid rgba(0,0,0,0.15)"></div>`);
  }

  // Margin annotations
  const mRng=createRng(seed+800);
  for (let i=0;i<35;i++) {
    const ci=Math.floor(mRng()*(numCols+1));
    let ax=ci===0?3+mRng()*(margin-5):ci===numCols?W-margin+3:margin+ci*(colW+colGap)-colGap+1;
    html.push(`<div style="position:absolute;left:${ax.toFixed(0)}px;top:${(margin+mRng()*(H-margin*2)).toFixed(0)}px;font-size:${(3.5+mRng()*2).toFixed(1)}px;opacity:${(0.3+mRng()*0.35).toFixed(2)};transform:rotate(${((mRng()-0.5)*20).toFixed(0)}deg);white-space:nowrap">${esc(texts.marginNotes[Math.floor(mRng()*texts.marginNotes.length)])}</div>`);
  }

  // VOID — dramatic organic edges
  svg.push(`<circle cx="${vCx.toFixed(0)}" cy="${vCy.toFixed(0)}" r="${(vR*0.5).toFixed(0)}" fill="#000"/>`);
  for (let r=0;r<40;r++) svg.push(`<circle cx="${vCx.toFixed(0)}" cy="${vCy.toFixed(0)}" r="${(vR*(0.5+r*0.015)).toFixed(0)}" fill="#000" opacity="${Math.max(0,0.9-r*0.025).toFixed(2)}"/>`);

  // Edge blobs
  const eRng=createRng(seed+900);
  for (let i=0;i<5000;i++) {
    const a=eRng()*Math.PI*2, d=vR*(0.4+eRng()*1);
    const px=vCx+Math.cos(a)*d, py=vCy+Math.sin(a)*d;
    const sz=0.5+eRng()*6, dfe=Math.abs(d-vR*0.65)/vR;
    const op=Math.max(0,0.7-dfe*1)*(0.3+eRng()*0.7);
    if(op>0.02) svg.push(`<circle cx="${px.toFixed(0)}" cy="${py.toFixed(0)}" r="${sz.toFixed(1)}" fill="#000" opacity="${op.toFixed(2)}"/>`);
  }

  // LONG tendrils
  const tRng=createRng(seed+950);
  for (let t=0;t<80;t++) {
    const sa=tRng()*Math.PI*2;
    let tx=vCx+Math.cos(sa)*vR*0.8, ty=vCy+Math.sin(sa)*vR*0.8, a=sa;
    const ns=15+Math.floor(tRng()*40), bw=0.4+tRng()*2, bo=0.12+tRng()*0.35;
    let d=`M${tx.toFixed(0)},${ty.toFixed(0)}`;
    for (let s=0;s<ns;s++) {
      a+=(tRng()-0.5)*0.5; tx+=Math.cos(a)*(5+tRng()*35); ty+=Math.sin(a)*(5+tRng()*35);
      d+=` L${tx.toFixed(0)},${ty.toFixed(0)}`;
      if(tRng()>0.35) svg.push(`<circle cx="${tx.toFixed(0)}" cy="${ty.toFixed(0)}" r="${(0.5+tRng()*4).toFixed(1)}" fill="#000" opacity="${(bo*0.6).toFixed(2)}"/>`);
      if(tRng()>0.6) {
        let bx=tx,by=ty,ba=a+(tRng()-0.5)*1.5,bd=`M${bx.toFixed(0)},${by.toFixed(0)}`;
        for(let bs=0;bs<3+Math.floor(tRng()*8);bs++){ba+=(tRng()-0.5)*0.6;bx+=Math.cos(ba)*(4+tRng()*18);by+=Math.sin(ba)*(4+tRng()*18);bd+=` L${bx.toFixed(0)},${by.toFixed(0)}`;}
        svg.push(`<path d="${bd}" fill="none" stroke="#000" stroke-width="${(bw*0.4).toFixed(1)}" opacity="${(bo*0.4).toFixed(2)}"/>`);
      }
    }
    svg.push(`<path d="${d}" fill="none" stroke="#000" stroke-width="${bw.toFixed(1)}" opacity="${bo.toFixed(2)}"/>`);
  }

  // ORGANISM CELLS — big, visible
  const oRng=createRng(seed+7000);
  for (let c=0;c<60;c++) {
    let cx2,cy2;
    if(oRng()>0.3){const a=oRng()*Math.PI*2,d=vR*(0.7+oRng()*2.5);cx2=vCx+Math.cos(a)*d;cy2=vCy+Math.sin(a)*d;}
    else{cx2=W*(0.05+oRng()*0.9);cy2=H*(0.05+oRng()*0.9);}
    const sz=10+oRng()*55, lobes=4+Math.floor(oRng()*7), op=0.12+oRng()*0.22;
    let p2='M';
    for(let i=0;i<=40;i++){const a=(i/40)*Math.PI*2,w=sz*(0.4+0.6*Math.sin(a*lobes+oRng()*10));p2+=(i===0?'':' L')+`${(cx2+Math.cos(a)*w).toFixed(0)},${(cy2+Math.sin(a)*w).toFixed(0)}`;}
    p2+=' Z';
    svg.push(`<path d="${p2}" fill="none" stroke="#000" stroke-width="${(0.7+oRng()*1.5).toFixed(1)}" opacity="${op.toFixed(2)}"/>`);
    if(oRng()>0.15) svg.push(`<circle cx="${cx2.toFixed(0)}" cy="${cy2.toFixed(0)}" r="${(sz*0.18).toFixed(0)}" fill="none" stroke="#000" stroke-width="0.5" opacity="${(op*0.8).toFixed(2)}"/>`);
    for(let s=0;s<5+Math.floor(oRng()*12);s++){const sa=oRng()*Math.PI*2,sd=oRng()*sz*0.4;svg.push(`<circle cx="${(cx2+Math.cos(sa)*sd).toFixed(0)}" cy="${(cy2+Math.sin(sa)*sd).toFixed(0)}" r="${(0.5+oRng()*1.5).toFixed(1)}" fill="#000" opacity="${(op*0.5).toFixed(2)}"/>`);}
  }

  // CONTOUR LINES
  for(let c=0;c<5+Math.floor(rng()*5);c++){
    const cx2=W*(0.1+rng()*0.8),cy2=H*(0.1+rng()*0.8),baseR=60+rng()*250;
    for(let r=0;r<4+Math.floor(rng()*6);r++){
      const rr=baseR+r*(12+rng()*20);let d='M';
      for(let i=0;i<=50;i++){const a=(i/50)*Math.PI*2,w=rr*(1+Math.sin(a*3+rng()*10)*0.12);d+=(i===0?'':' L')+`${(cx2+Math.cos(a)*w).toFixed(0)},${(cy2+Math.sin(a)*w).toFixed(0)}`;}
      svg.push(`<path d="${d}" fill="none" stroke="#000" stroke-width="${(0.8+rng()*1.2).toFixed(1)}" opacity="${(0.1+rng()*0.12).toFixed(2)}"/>`);
    }
  }

  // Mycelium
  for(let m=0;m<25;m++){
    let mx=W*(0.1+rng()*0.8),my=H*(0.1+rng()*0.8),a=rng()*Math.PI*2;
    let d=`M${mx.toFixed(0)},${my.toFixed(0)}`;
    for(let s=0;s<15+Math.floor(rng()*25);s++){a+=(rng()-0.5)*0.8;mx+=Math.cos(a)*(5+rng()*25);my+=Math.sin(a)*(5+rng()*25);d+=` L${mx.toFixed(0)},${my.toFixed(0)}`;
      if(rng()>0.4) svg.push(`<circle cx="${mx.toFixed(0)}" cy="${my.toFixed(0)}" r="${(1+rng()*3).toFixed(1)}" fill="#000" opacity="${(0.06+rng()*0.1).toFixed(2)}"/>`);
    }
    svg.push(`<path d="${d}" fill="none" stroke="#000" stroke-width="${(0.4+rng()*0.8).toFixed(1)}" opacity="${(0.06+rng()*0.1).toFixed(2)}"/>`);
  }

  // Scattered text fragments near void
  const sRng=createRng(seed+970);
  for(let i=0;i<500;i++){
    const a=sRng()*Math.PI*2,d=vR*(0.6+sRng()*3);
    const px=vCx+Math.cos(a)*d,py=vCy+Math.sin(a)*d;
    if(px<0||px>W||py<0||py>H) continue;
    const dn=(d-vR*0.6)/(vR*3),op=Math.max(0.05,(1-dn)*(0.15+sRng()*0.45));
    const rot=Math.atan2(vCy-py,vCx-px)*180/Math.PI+(sRng()-0.5)*30;
    const frag=texts.fragments[Math.floor(sRng()*texts.fragments.length)];
    svg.push(`<text x="${px.toFixed(0)}" y="${py.toFixed(0)}" font-size="${(3+sRng()*8*(1-dn*0.5)).toFixed(1)}" font-family="'Courier New',monospace" fill="#000" opacity="${op.toFixed(2)}" transform="rotate(${rot.toFixed(0)} ${px.toFixed(0)} ${py.toFixed(0)})">${esc(frag.slice(0,1+Math.floor(sRng()*8)))}</text>`);
  }

  svg.push(`<text x="15" y="${H-12}" font-size="6" font-family="'Courier New',monospace" fill="#000" opacity="0.3">§${(seed%999)+1} — FIELD NOTES — STATUS: INCOMPLETE</text>`);
  return wrap(html,svg,W,H,'#f0ebe0');
}

// ═══════════════════════════════════════════════════════
// 2: INFECTION — refined
// ═══════════════════════════════════════════════════════

function renderInfection(seed, W=3000, H=3000) {
  const rng = createRng(seed);
  for (let i=0;i<(seed%7)+3;i++) rng();
  const texts = loadTexts();
  const bodies = [...texts.allText].sort(()=>rng()-0.5);
  let html=[], svg=[];

  // 3-6 infection centers
  const numCenters = 3+Math.floor(rng()*4);
  const centers = [];
  for (let c=0;c<numCenters;c++) centers.push({x:W*(0.1+rng()*0.8),y:H*(0.1+rng()*0.8),r:80+rng()*350});

  // Dense text columns
  const numCols=5+Math.floor(rng()*2);
  const margin=W*0.025, colGap=6;
  const colW=(W-margin*2-colGap*(numCols-1))/numCols;
  const fs=5+rng()*1.5, lh=fs*1.3;
  let tIdx=0;

  for (let ci=0;ci<numCols;ci++) {
    const colX=margin+ci*(colW+colGap);
    let y=margin;
    const cRng=createRng(seed+1000+ci*137);

    while (y<H-margin) {
      const text=bodies[tIdx%bodies.length]; tIdx++;

      // Header sometimes
      if (cRng()<0.04 && y>margin+20) {
        html.push(`<div style="position:absolute;left:${colX}px;top:${y}px;width:${colW}px;font-size:${(fs*1.15).toFixed(1)}px;font-weight:bold;letter-spacing:1.5px;opacity:0.9;border-bottom:0.8px solid rgba(0,0,0,0.25);padding-bottom:2px">${esc(texts.headers[Math.floor(cRng()*texts.headers.length)])}</div>`);
        y+=fs*2.5; continue;
      }

      const cpl=Math.floor(colW/(fs*0.5));
      const words=text.split(' ');
      let line='';
      for (const word of words) {
        if (y>H-margin) break;
        if ((line+' '+word).length>cpl) {
          if (line) {
            // Check infection
            let infected=0;
            for (const c of centers) {
              const d=Math.hypot(colX+colW/2-c.x,y-c.y);
              if(d<c.r) infected=Math.max(infected,1-d/c.r);
            }
            let op=0.9-infected*0.55;
            let ts='';
            if (infected>0.2) {
              const sk=infected*20*(rng()>0.5?1:-1);
              const stretch=1+infected*3;
              ts=`transform:skewX(${sk.toFixed(0)}deg);letter-spacing:${stretch.toFixed(1)}px;`;
              if(infected>0.5&&cRng()<infected*0.5){y+=lh;line=word;continue;}
            }
            html.push(`<div style="position:absolute;left:${colX}px;top:${y}px;width:${colW}px;font-size:${fs.toFixed(1)}px;line-height:${lh.toFixed(1)}px;opacity:${op.toFixed(2)};white-space:nowrap;overflow:hidden;${ts}">${esc(line)}</div>`);
            y+=lh;
          }
          line=word;
        } else { line=line?line+' '+word:word; }
      }
      if(line&&y<H-margin){html.push(`<div style="position:absolute;left:${colX}px;top:${y}px;width:${colW}px;font-size:${fs.toFixed(1)}px;opacity:0.9;white-space:nowrap;overflow:hidden">${esc(line)}</div>`);y+=lh;}
      y+=fs*0.3;
    }
    if(ci<numCols-1) html.push(`<div style="position:absolute;left:${colX+colW+colGap/2}px;top:${margin}px;width:0;height:${H-margin*2}px;border-left:0.4px solid rgba(0,0,0,0.12)"></div>`);
  }

  // ORGANISM CELLS at each infection center — BIG and dramatic
  for (const c of centers) {
    const oRng=createRng(seed+Math.floor(c.x*7+c.y*13));
    const numCells=20+Math.floor(oRng()*30);

    for (let i=0;i<numCells;i++) {
      const a=oRng()*Math.PI*2, d2=oRng()*c.r;
      const cx2=c.x+Math.cos(a)*d2, cy2=c.y+Math.sin(a)*d2;
      const nearCenter=1-d2/c.r;
      const sz=10+oRng()*70*nearCenter; // BIGGER near center
      const lobes=4+Math.floor(oRng()*6);
      const op=0.15+nearCenter*0.2+oRng()*0.1;

      let p2='M';
      for(let j=0;j<=40;j++){const ang=(j/40)*Math.PI*2,w=sz*(0.35+0.65*Math.sin(ang*lobes+oRng()*10));p2+=(j===0?'':' L')+`${(cx2+Math.cos(ang)*w).toFixed(0)},${(cy2+Math.sin(ang)*w).toFixed(0)}`;}
      p2+=' Z';
      svg.push(`<path d="${p2}" fill="none" stroke="#000" stroke-width="${(0.8+oRng()*2).toFixed(1)}" opacity="${op.toFixed(2)}"/>`);
      // Nucleus
      if(oRng()>0.1){const nr=sz*(0.1+oRng()*0.2);svg.push(`<circle cx="${cx2.toFixed(0)}" cy="${cy2.toFixed(0)}" r="${nr.toFixed(0)}" fill="none" stroke="#000" stroke-width="0.6" opacity="${(op*0.8).toFixed(2)}"/>`)}
      // Organelle dots
      for(let s=0;s<5+Math.floor(oRng()*15);s++){const sa=oRng()*Math.PI*2,sd=oRng()*sz*0.45;svg.push(`<circle cx="${(cx2+Math.cos(sa)*sd).toFixed(0)}" cy="${(cy2+Math.sin(sa)*sd).toFixed(0)}" r="${(0.5+oRng()*2).toFixed(1)}" fill="#000" opacity="${(op*0.5).toFixed(2)}"/>`)}
    }

    // Mycelium spreading from each center
    for(let m=0;m<20;m++){
      let mx=c.x,my=c.y,a2=oRng()*Math.PI*2;
      let d2=`M${mx.toFixed(0)},${my.toFixed(0)}`;
      for(let s=0;s<20+Math.floor(oRng()*25);s++){
        a2+=(oRng()-0.5)*0.7;mx+=Math.cos(a2)*(8+oRng()*25);my+=Math.sin(a2)*(8+oRng()*25);
        d2+=` L${mx.toFixed(0)},${my.toFixed(0)}`;
        if(oRng()>0.4) svg.push(`<circle cx="${mx.toFixed(0)}" cy="${my.toFixed(0)}" r="${(1+oRng()*3.5).toFixed(1)}" fill="#000" opacity="${(0.08+oRng()*0.12).toFixed(2)}"/>`);
      }
      svg.push(`<path d="${d2}" fill="none" stroke="#000" stroke-width="${(0.4+oRng()*1).toFixed(1)}" opacity="${(0.1+oRng()*0.15).toFixed(2)}"/>`);
    }

    // Dense ink mass at center of infection
    for(let i=0;i<300;i++){
      const a2=oRng()*Math.PI*2,d2=Math.pow(oRng(),0.7)*c.r*0.2;
      svg.push(`<circle cx="${(c.x+Math.cos(a2)*d2).toFixed(0)}" cy="${(c.y+Math.sin(a2)*d2).toFixed(0)}" r="${(0.5+oRng()*3).toFixed(1)}" fill="#000" opacity="${(0.1+oRng()*0.3).toFixed(2)}"/>`);
    }
  }

  svg.push(`<text x="15" y="${H-12}" font-size="6" font-family="'Courier New',monospace" fill="#000" opacity="0.3">§${(seed%999)+1} — THE INFECTION</text>`);
  return wrap(html,svg,W,H,'#f5f2ea');
}

// ═══════════════════════════════════════════════════════
// 3: TRANSMISSION — refined
// ═══════════════════════════════════════════════════════

function renderTransmission(seed, W=3000, H=3000) {
  const rng = createRng(seed);
  for (let i=0;i<(seed%7)+3;i++) rng();
  const texts = loadTexts();
  let html=[], svg=[];
  const cx=W*0.5, cy=H*0.5;
  const voidR=25+rng()*15;
  const maxR=Math.min(W,H)*0.47;

  // Void
  svg.push(`<circle cx="${cx}" cy="${cy}" r="${voidR}" fill="#000"/>`);
  for(let r=0;r<20;r++) svg.push(`<circle cx="${cx}" cy="${cy}" r="${voidR+r*2}" fill="#000" opacity="${Math.max(0,0.7-r*0.04).toFixed(2)}"/>`);

  // CONCENTRIC TEXT RINGS — DENSER, DARKER
  const numRings=80+Math.floor(rng()*40);
  const ringSpacing=(maxR-voidR-30)/numRings;

  for (let ring=0;ring<numRings;ring++) {
    const r2=voidR+35+ring*ringSpacing;
    const text=texts.allText[ring%texts.allText.length];
    const circumference=2*Math.PI*r2;
    const charSize=4+rng()*2.5;
    const charsInRing=Math.floor(circumference/(charSize*0.5));
    const startAngle=rng()*Math.PI*2;

    // Density varies — inner rings denser/darker, outer rings sparser
    const distNorm=ring/numRings;
    const ringOp=0.4+(1-distNorm)*0.5+rng()*0.1;
    const isGap=rng()>0.85; // some rings are mostly empty

    for(let c=0;c<charsInRing;c++){
      const angle=startAngle+(c/charsInRing)*Math.PI*2;
      const x=cx+Math.cos(angle)*r2, y=cy+Math.sin(angle)*r2;
      if(x<5||x>W-5||y<5||y>H-5) continue;
      if(isGap&&rng()>0.15) continue;
      if(rng()<0.02) continue;

      const ch=text[c%text.length]||' ';
      if(ch===' '&&rng()>0.3) continue;

      const rot=(angle*180/Math.PI)+90;
      html.push(`<div style="position:absolute;left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;font-size:${charSize.toFixed(1)}px;opacity:${ringOp.toFixed(2)};transform:rotate(${rot.toFixed(0)}deg);transform-origin:center">${esc(ch)}</div>`);
    }
  }

  // RADIAL LINES — broadcast rays, some thick
  for(let i=0;i<36;i++){
    const a=(i/36)*Math.PI*2;
    const len=voidR+30+rng()*maxR*0.8;
    const isCardinal=i%9===0;
    svg.push(`<line x1="${(cx+Math.cos(a)*(voidR+15)).toFixed(0)}" y1="${(cy+Math.sin(a)*(voidR+15)).toFixed(0)}" x2="${(cx+Math.cos(a)*len).toFixed(0)}" y2="${(cy+Math.sin(a)*len).toFixed(0)}" stroke="#000" stroke-width="${isCardinal?1.5:0.3}" opacity="${isCardinal?0.2:0.06}"/>`);
  }

  // Fragment labels along radials
  for(let i=0;i<25;i++){
    const a=rng()*Math.PI*2, d=voidR+60+rng()*maxR*0.6;
    const fx=cx+Math.cos(a)*d, fy=cy+Math.sin(a)*d;
    const frag=texts.fragments[Math.floor(rng()*texts.fragments.length)];
    svg.push(`<text x="${fx.toFixed(0)}" y="${fy.toFixed(0)}" font-size="5" font-family="'Courier New',monospace" fill="#000" opacity="0.25" transform="rotate(${(a*180/Math.PI).toFixed(0)} ${fx.toFixed(0)} ${fy.toFixed(0)})">${esc(frag)}</text>`);
  }

  // Ring labels — section headers at certain radii
  for(let i=0;i<6;i++){
    const r2=voidR+50+(i/(6))*(maxR-voidR-80);
    const header=texts.headers[Math.floor(rng()*texts.headers.length)];
    const a=rng()*Math.PI*2;
    svg.push(`<text x="${(cx+Math.cos(a)*r2).toFixed(0)}" y="${(cy+Math.sin(a)*r2).toFixed(0)}" font-size="7" font-weight="bold" font-family="'Courier New',monospace" fill="#000" opacity="0.35" transform="rotate(${(a*180/Math.PI+90).toFixed(0)} ${(cx+Math.cos(a)*r2).toFixed(0)} ${(cy+Math.sin(a)*r2).toFixed(0)})">${esc(header)}</text>`);
  }

  // Concentric circle outlines at certain intervals
  for(let i=0;i<8;i++){
    const r2=voidR+50+rng()*(maxR-voidR-60);
    svg.push(`<circle cx="${cx}" cy="${cy}" r="${r2.toFixed(0)}" fill="none" stroke="#000" stroke-width="0.3" opacity="0.06"/>`);
  }

  svg.push(`<text x="15" y="${H-12}" font-size="6" font-family="'Courier New',monospace" fill="#000" opacity="0.3">§${(seed%999)+1} — THE TRANSMISSION</text>`);
  return wrap(html,svg,W,H,'#fff');
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

// CLI
const type=parseInt(process.argv[2])||1;
const seed=parseInt(process.argv[3])||Math.floor(Math.random()*100000);
const name=process.argv[4]||`final-${type}-${seed}`;
const out=path.join(OUTPUT_DIR,`${name}.png`);
const renderers=[null,renderManuscript,renderInfection,renderTransmission];
const names=[null,'MANUSCRIPT','INFECTION','TRANSMISSION'];
if(type<1||type>3){console.error('Type 1-3');process.exit(1);}
console.log(`\nRendering ${names[type]}...`);
console.log(`  Seed: ${seed}`);
const start=Date.now();
const html=renderers[type](seed);
const tmp=path.join(OUTPUT_DIR,`_t${seed}.html`);
fs.writeFileSync(tmp,html);
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox']});
const page=await browser.newPage();
await page.setViewport({width:3000,height:3000,deviceScaleFactor:1});
await page.goto(`file://${tmp}`,{waitUntil:'networkidle0',timeout:180000});
await page.screenshot({path:out,type:'png'});
await browser.close();
fs.unlinkSync(tmp);
console.log(`  PNG: ${(fs.statSync(out).size/1024/1024).toFixed(2)} MB, Time: ${((Date.now()-start)/1000).toFixed(1)}s\n`);
