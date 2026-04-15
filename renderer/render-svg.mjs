/**
 * Deep Reality Atlas — SVG Renderer — Reference Match
 *
 * Precise zone-by-zone replication of the reference image.
 *
 * Usage: node renderer/render-svg.mjs [seed] [output-name]
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'gallery');

function createRng(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

const G = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ΣΓΨΩΠαβγδεθλμπφχψ精氣神鬼道空無心穴經絡∞⊕◉∅§†‡※+-='.split('');
function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function blob(cx,cy,r,rng) {
  const n=6+Math.floor(rng()*4); let d=`M`;
  for(let i=0;i<=n;i++){const a=(i/n)*Math.PI*2;const w=r*(0.65+rng()*0.7);
    const x=cx+Math.cos(a)*w;const y=cy+Math.sin(a)*w;
    d+=i===0?`${x.toFixed(1)},${y.toFixed(1)}`:` L${x.toFixed(1)},${y.toFixed(1)}`;}
  return d+'Z';
}
function tline(x1,y1,x2,y2,t,rng) {
  const d2=Math.sqrt((x2-x1)**2+(y2-y1)**2);const st=Math.max(2,Math.floor(d2/10));
  let d=`M${x1.toFixed(1)},${y1.toFixed(1)}`;
  for(let i=1;i<=st;i++){const f=i/st;
    d+=` L${(x1+(x2-x1)*f+(rng()-0.5)*t).toFixed(1)},${(y1+(y2-y1)*f+(rng()-0.5)*t).toFixed(1)}`;}
  return d;
}

function render(seed, W=3000, H=3000) {
  const rng = createRng(seed);
  const p = []; // SVG parts

  // ══════════════════════════════════
  // ZONE 1: TEXT GRID — upper-left
  // ══════════════════════════════════
  const gRng = createRng(seed+100);
  const cs = 7; // bigger characters — legible individually
  const cw = cs * 0.65; // wider spacing — white between chars
  const lh = cs * 1.8; // taller lines — visible row gaps
  const gx = W*0.02, gy = H*0.02;
  const gw = W*0.44, gh = H*0.42;
  const cols = Math.floor(gw/cw);
  const rows = Math.floor(gh/lh);

  // Each row has its own "reach" — how far right it extends (ragged edge)
  const rowReach = [];
  for (let r=0; r<rows; r++) {
    const baseReach = 1 - (r/rows) * 0.15; // slightly shorter at bottom
    const rowNoise = Math.sin(r*0.8+seed*0.1) * 0.12 + (gRng()-0.5)*0.1;
    rowReach.push(Math.min(1, baseReach + rowNoise));
  }

  for (let row=0; row<rows; row++) {
    const ry = gy + row*lh + cs;
    const reach = rowReach[row];
    const maxCol = Math.floor(cols * reach);

    for (let col=0; col<maxCol; col++) {
      const normCol = col/cols;
      const normRow = row/rows;

      // Random dropout everywhere — very sparse, keeps it from being solid
      if (gRng() < 0.03) continue;

      // Dissolution at right edge — characters scatter
      const edgeDist = normCol / reach;
      if (edgeDist > 0.85 && gRng() < (edgeDist-0.85)*4) continue;

      let dx=0, dy=0;
      if (edgeDist > 0.75) {
        const drift = Math.pow(edgeDist-0.75, 1.3) * 80;
        dx = gRng()*drift + drift*0.5;
        dy = (gRng()-0.5)*drift*0.8;
      }

      // FULLY BLACK at core, fading toward dissolving edges
      const darkness = 1 - normCol*0.2 - normRow*0.15;
      const opacity = Math.min(1, Math.max(0.3, darkness * 1.1));

      const glyph = G[Math.floor(gRng()*G.length)];
      const rx = gx + col*cw + dx;
      const jit = (gRng()-0.5)*2;
      p.push(`<text x="${rx.toFixed(1)}" y="${(ry+dy).toFixed(1)}" font-size="${cs}" opacity="${opacity.toFixed(2)}" transform="rotate(${jit.toFixed(1)} ${rx.toFixed(1)} ${(ry+dy).toFixed(1)})">${esc(glyph)}</text>`);
    }

    // Faint ruled line every ~8 rows
    if (row%8===0 && row>0) {
      p.push(`<line x1="${gx}" y1="${ry+2}" x2="${(gx+gw*rowReach[row]).toFixed(0)}" y2="${ry+2}" stroke="#000" stroke-width="0.15" opacity="0.06"/>`);
    }
  }

  // ══════════════════════════════════
  // ZONE 2: UPWARD-RIGHT SCATTER
  // ══════════════════════════════════
  const s1Rng = createRng(seed+200);
  const s1x = gx+gw*0.8, s1y = gy+gh*0.35;
  const s1n = 30000;
  const s1dist = W*0.45;

  for (let i=0; i<s1n; i++) {
    // Upward-right bias
    const a = -0.6 + (s1Rng()-0.5)*2.0; // biased up-right
    const rawD = s1Rng();
    const clump = 0.6 + Math.sin(rawD*23+s1Rng()*7)*0.4;
    const d = Math.pow(rawD, 0.5)*s1dist*clump;
    const dn = d/s1dist;
    const ang = a + (s1Rng()-0.5)*dn*2;

    const px = s1x+Math.cos(ang)*d, py = s1y+Math.sin(ang)*d;
    if(px<-30||px>W+30||py<-30||py>H+30) continue;

    const op = (1-dn*0.5)*(0.25+s1Rng()*0.6);
    const mt = s1Rng();
    if (mt>0.15) {
      const sz = (1-dn*0.4)*(0.4+s1Rng()*3);
      p.push(`<path d="${blob(px,py,sz,s1Rng)}" fill="#000" opacity="${op.toFixed(2)}"/>`);
    } else if (mt>0.04) {
      const cs2 = 2.5+s1Rng()*5*(1-dn*0.5);
      const rot = (s1Rng()-0.5)*25;
      p.push(`<text x="${px.toFixed(0)}" y="${py.toFixed(0)}" font-size="${cs2.toFixed(1)}" opacity="${op.toFixed(2)}" transform="rotate(${rot.toFixed(0)} ${px.toFixed(0)} ${py.toFixed(0)})">${esc(G[Math.floor(s1Rng()*G.length)])}</text>`);
    } else {
      const la=ang+(s1Rng()-0.5)*1.5, ll=4+s1Rng()*18*(1-dn*0.5);
      const sw=0.2+s1Rng()*0.5;
      p.push(`<path d="${tline(px,py,px+Math.cos(la)*ll,py+Math.sin(la)*ll,1,s1Rng)}" fill="none" stroke="#000" stroke-width="${sw.toFixed(1)}" opacity="${op.toFixed(2)}"/>`);
    }
  }

  // Dense knots in the scatter — irregular, non-circular clusters
  for (let k=0; k<12; k++) {
    const kRng=createRng(seed+220+k*31);
    const kx=s1x+(kRng()-0.2)*W*0.3, ky=s1y+(kRng()-0.5)*H*0.25;
    const kr=10+kRng()*40;
    const kn=80+Math.floor(kRng()*250);
    // Elongated shape — not circular
    const kAngle = kRng()*Math.PI;
    const kStretch = 1.5+kRng()*2;
    for(let i=0;i<kn;i++){
      const a=kRng()*Math.PI*2, d=Math.pow(kRng(),0.7)*kr;
      // Stretch in one direction
      const dx = Math.cos(a)*d;
      const dy = Math.sin(a)*d;
      const rx = dx*Math.cos(kAngle) - dy*Math.sin(kAngle);
      const ry = dx*Math.sin(kAngle) + dy*Math.cos(kAngle);
      const px=kx+rx*kStretch, py=ky+ry;
      const sz=0.2+kRng()*2, op=(1-d/kr)*(0.2+kRng()*0.45);
      p.push(`<path d="${blob(px,py,sz,kRng)}" fill="#000" opacity="${op.toFixed(2)}"/>`);
    }
  }

  // ══════════════════════════════════
  // ZONE 3: DARK HORIZON BAND
  // ══════════════════════════════════
  const hRng = createRng(seed+300);
  const hy = gy+gh*0.95; // at bottom of grid
  const hsx = gx+gw*0.6, hex = W*0.92;
  const hth = H*0.035;

  for (let i=0; i<15000; i++) {
    const px=hsx+hRng()*(hex-hsx);
    const py=hy+(hRng()-0.5)*hth;
    const dc=Math.abs(py-hy)/(hth/2);
    const hf=Math.pow((px-hsx)/(hex-hsx),0.5);
    const vf=Math.pow(1-dc,2);
    const op=vf*(1-hf*0.7)*(0.35+hRng()*0.55);

    if(hRng()>0.2) {
      const len=3+hRng()*80*(1-hf);
      const sw=0.3+hRng()*2*vf;
      p.push(`<path d="${tline(px,py,px+len,py+(hRng()-0.5)*2,0.5,hRng)}" fill="none" stroke="#000" stroke-width="${sw.toFixed(1)}" opacity="${op.toFixed(2)}"/>`);
    } else {
      const sz=0.5+hRng()*3*vf;
      p.push(`<path d="${blob(px,py,sz,hRng)}" fill="#000" opacity="${op.toFixed(2)}"/>`);
    }
  }
  // Bold core lines
  p.push(`<path d="${tline(hsx,hy,hex*0.9,hy+(rng()-0.5)*3,1.5,createRng(seed+301))}" fill="none" stroke="#000" stroke-width="2.5" opacity="0.5"/>`);
  p.push(`<path d="${tline(hsx,hy+4,hex*0.75,hy+5,1,createRng(seed+302))}" fill="none" stroke="#000" stroke-width="0.8" opacity="0.3"/>`);

  // ══════════════════════════════════
  // ZONE 4: DOWNWARD SCATTER (below horizon)
  // ══════════════════════════════════
  const s2Rng = createRng(seed+400);
  const s2x = gx+gw*0.7, s2y = hy+H*0.02;
  const s2n = 15000;
  const s2dist = H*0.35;

  for (let i=0; i<s2n; i++) {
    // DOWNWARD bias
    const a = Math.PI*0.5 + (s2Rng()-0.5)*1.8; // centered on straight down
    const rawD = s2Rng();
    const clump = 0.6+Math.sin(rawD*19+s2Rng()*6)*0.4;
    const d = Math.pow(rawD,0.5)*s2dist*clump;
    const dn = d/s2dist;
    const ang = a + (s2Rng()-0.5)*dn*1.5;

    const px=s2x+Math.cos(ang)*d, py=s2y+Math.sin(ang)*d;
    if(px<-30||px>W+30||py<-30||py>H+30) continue;

    const op=(1-dn*0.5)*(0.2+s2Rng()*0.5);
    const mt=s2Rng();
    if(mt>0.15) {
      const sz=(1-dn*0.3)*(0.3+s2Rng()*2.5);
      p.push(`<path d="${blob(px,py,sz,s2Rng)}" fill="#000" opacity="${op.toFixed(2)}"/>`);
    } else if(mt>0.05) {
      const cs2=2.5+s2Rng()*4*(1-dn*0.5);
      p.push(`<text x="${px.toFixed(0)}" y="${py.toFixed(0)}" font-size="${cs2.toFixed(1)}" opacity="${op.toFixed(2)}">${esc(G[Math.floor(s2Rng()*G.length)])}</text>`);
    } else {
      const la=ang+(s2Rng()-0.5)*1, ll=3+s2Rng()*15;
      p.push(`<path d="${tline(px,py,px+Math.cos(la)*ll,py+Math.sin(la)*ll,1,s2Rng)}" fill="none" stroke="#000" stroke-width="${(0.2+s2Rng()*0.4).toFixed(1)}" opacity="${op.toFixed(2)}"/>`);
    }
  }

  // Dense knots below horizon — elongated, irregular
  for (let k=0; k<7; k++) {
    const kRng=createRng(seed+420+k*41);
    const kx=s2x+(kRng()-0.5)*W*0.2, ky=s2y+kRng()*H*0.2;
    const kr=10+kRng()*35, kn=60+Math.floor(kRng()*200);
    const kAngle=kRng()*Math.PI, kStretch=1.3+kRng()*1.5;
    for(let i=0;i<kn;i++){
      const a=kRng()*Math.PI*2, d=Math.pow(kRng(),0.7)*kr;
      const dx=Math.cos(a)*d, dy=Math.sin(a)*d;
      const rx=dx*Math.cos(kAngle)-dy*Math.sin(kAngle);
      const ry=dx*Math.sin(kAngle)+dy*Math.cos(kAngle);
      const sz=0.2+kRng()*1.8, op=(1-d/kr)*(0.2+kRng()*0.4);
      p.push(`<path d="${blob(kx+rx*kStretch,ky+ry,sz,kRng)}" fill="#000" opacity="${op.toFixed(2)}"/>`);
    }
  }

  // ══════════════════════════════════
  // ZONE 5: VERTICAL COLUMNS (bottom-left)
  // ══════════════════════════════════
  const vRng = createRng(seed+500);
  const vsy = gy+gh; // start at bottom of grid

  for (let c=0; c<70; c++) {
    // Clustered — some close together, some gaps
    const cluster = Math.floor(c/5);
    const clusterX = gx + (cluster/(70/5))*gw*0.55;
    const cx = clusterX + (vRng()-0.5)*25;
    const lineLen = 40+vRng()*H*0.28;
    const sw = 0.25+vRng()*0.7;
    const op = 0.2+vRng()*0.45;

    p.push(`<path d="${tline(cx,vsy-3,cx+(vRng()-0.5)*4,vsy+lineLen,0.3+vRng()*0.5,vRng)}" fill="none" stroke="#000" stroke-width="${sw.toFixed(1)}" opacity="${op.toFixed(2)}"/>`);

    // Ticks
    for(let t=0;t<3+Math.floor(vRng()*8);t++){
      const ty=vsy+(t/(10))*lineLen;
      const tw=2+vRng()*5;
      p.push(`<line x1="${(cx-tw/2).toFixed(0)}" y1="${ty.toFixed(0)}" x2="${(cx+tw/2).toFixed(0)}" y2="${ty.toFixed(0)}" stroke="#000" stroke-width="0.25" opacity="${(0.1+vRng()*0.2).toFixed(2)}"/>`);
    }

    // Characters
    if(vRng()>0.5) for(let t=0;t<2+Math.floor(vRng()*4);t++){
      const ty=vsy+vRng()*lineLen;
      p.push(`<text x="${(cx+3).toFixed(0)}" y="${ty.toFixed(0)}" font-size="${(3+vRng()*2.5).toFixed(1)}" opacity="${(0.1+vRng()*0.18).toFixed(2)}">${esc(G[Math.floor(vRng()*G.length)])}</text>`);
    }

    // Dots near column
    for(let d=0;d<Math.floor(vRng()*5);d++){
      const dx=cx+(vRng()-0.5)*12, dy=vsy+vRng()*lineLen;
      p.push(`<path d="${blob(dx,dy,0.3+vRng()*1.2,vRng)}" fill="#000" opacity="${(0.08+vRng()*0.15).toFixed(2)}"/>`);
    }
  }

  // ══════════════════════════════════
  // ZONE 6+7: CONNECTION LINES (spider web)
  // ══════════════════════════════════
  const cRng = createRng(seed+600);
  // From upward scatter origin
  for(let i=0;i<50;i++){
    const ang=cRng()*Math.PI*2;
    const len=80+cRng()*W*0.5;
    const ox=s1x+(cRng()-0.5)*30, oy=s1y+(cRng()-0.5)*30;
    const ex=ox+Math.cos(ang)*len, ey=oy+Math.sin(ang)*len;
    const sw=0.1+cRng()*0.25, op=0.02+cRng()*0.06;
    p.push(`<path d="${tline(ox,oy,ex,ey,2+cRng()*3,cRng)}" fill="none" stroke="#000" stroke-width="${sw.toFixed(2)}" opacity="${op.toFixed(2)}"/>`);
    // End node
    if(cRng()>0.4&&ex>0&&ex<W&&ey>0&&ey<H){
      const ns=0.5+cRng()*2;
      p.push(`<path d="${blob(ex,ey,ns,cRng)}" fill="#000" opacity="${(0.06+cRng()*0.12).toFixed(2)}"/>`);
    }
  }
  // From downward scatter origin
  for(let i=0;i<25;i++){
    const ang=cRng()*Math.PI*2;
    const len=60+cRng()*W*0.35;
    const ox=s2x+(cRng()-0.5)*30, oy=s2y+(cRng()-0.5)*30;
    const ex=ox+Math.cos(ang)*len, ey=oy+Math.sin(ang)*len;
    const sw=0.1+cRng()*0.2, op=0.02+cRng()*0.05;
    p.push(`<path d="${tline(ox,oy,ex,ey,2+cRng()*3,cRng)}" fill="none" stroke="#000" stroke-width="${sw.toFixed(2)}" opacity="${op.toFixed(2)}"/>`);
  }

  // ══════════════════════════════════
  // NOTATION
  // ══════════════════════════════════
  p.push(`<text x="12" y="${H-18}" font-size="8" opacity="0.3">§${(seed%999)+1}</text>`);
  p.push(`<text x="12" y="${H-6}" font-size="5" opacity="0.15">FIELD NOTES — DATE UNKNOWN — STATUS: INCOMPLETE</text>`);

  console.log(`  Elements: ${p.length}`);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="background:#fff">
<style>text{font-family:'Courier New',monospace;fill:#000}</style>
${p.join('\n')}
</svg>`;
}

// CLI
const seed = parseInt(process.argv[2]) || Math.floor(Math.random()*100000);
const name = process.argv[3] || `page-${seed}`;
const out = path.join(OUTPUT_DIR, `${name}.png`);

console.log(`\nRendering (SVG zones)...`);
console.log(`  Seed: ${seed}`);

const start = Date.now();
const svg = render(seed);
const tmp = path.join(OUTPUT_DIR, `_t${seed}.svg`);
fs.writeFileSync(tmp, svg);

const browser = await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox']});
const page = await browser.newPage();
await page.setViewport({width:3000,height:3000,deviceScaleFactor:1});
await page.goto(`file://${tmp}`,{waitUntil:'networkidle0',timeout:180000});
console.log(`  Screenshotting...`);
await page.screenshot({path:out,type:'png'});
await browser.close();
fs.unlinkSync(tmp);

const stats = fs.statSync(out);
console.log(`  PNG: ${(stats.size/1024/1024).toFixed(2)} MB`);
console.log(`  Time: ${((Date.now()-start)/1000).toFixed(1)}s\n`);
