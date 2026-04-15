/**
 * Deep Reality Atlas — Text-First Renderer
 *
 * The grid is rendered as actual HTML text in a <pre> block.
 * The browser renders monospace text PERFECTLY — crisp, dark, with visible rows.
 * Then scatter/horizon/columns are overlaid as SVG.
 *
 * Usage: node renderer/render-text.mjs [seed] [output-name]
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

const G = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ΣΓΨΩαβγδεθλμπφχψ精氣神鬼道空無心穴經絡∞⊕◉∅§†‡※+-='.split('');
function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function blob(cx,cy,r,rng) {
  const n=6+Math.floor(rng()*4); let d='M';
  for(let i=0;i<=n;i++){const a=(i/n)*Math.PI*2;const w=r*(0.6+rng()*0.8);
    d+=(i===0?'':', L')+(cx+Math.cos(a)*w).toFixed(1)+','+(cy+Math.sin(a)*w).toFixed(1);}
  return d+'Z';
}
function tline(x1,y1,x2,y2,t,rng) {
  const d2=Math.hypot(x2-x1,y2-y1);const st=Math.max(2,Math.floor(d2/10));
  let d=`M${x1.toFixed(1)},${y1.toFixed(1)}`;
  for(let i=1;i<=st;i++){const f=i/st;
    d+=` L${(x1+(x2-x1)*f+(rng()-0.5)*t).toFixed(1)},${(y1+(y2-y1)*f+(rng()-0.5)*t).toFixed(1)}`;}
  return d;
}

function render(seed, W=3000, H=3000) {
  const rng = createRng(seed);
  for(let i=0;i<(seed%7)+3;i++) rng();

  // ══════════════════════════════════
  // GRID as plain text lines
  // ══════════════════════════════════
  const gRng = createRng(seed+100);
  const fontSize = 7;
  const gx = W*0.02, gy = H*0.02;
  const gw = W*0.44, gh = H*0.42;
  // At 7px monospace, each char is roughly 4.2px wide
  const charsPerRow = Math.floor(gw / (fontSize * 0.6));
  const numRows = Math.floor(gh / (fontSize * 1.5));

  // Build text lines — each row has a different length (ragged right edge)
  const textLines = [];
  for (let row = 0; row < numRows; row++) {
    const normRow = row / numRows;
    // Ragged right edge — rows have different lengths
    const baseLen = charsPerRow * (1 - normRow * 0.1);
    const noise = Math.sin(row * 0.7 + seed * 0.1) * charsPerRow * 0.08;
    const rowLen = Math.floor(baseLen + noise);

    let line = '';
    for (let col = 0; col < rowLen; col++) {
      const normCol = col / charsPerRow;
      const dissolve = normCol * 0.7 + normRow * 0.3;

      // At dissolving edge, replace chars with spaces (gaps)
      if (dissolve > 0.5 && gRng() < (dissolve - 0.5) * 2) {
        line += ' ';
      } else if (dissolve > 0.4 && gRng() < (dissolve - 0.4) * 0.4) {
        line += ' ';
      } else if (gRng() < 0.02) {
        line += ' '; // random tiny gaps everywhere
      } else {
        line += G[Math.floor(gRng() * G.length)];
      }
    }
    textLines.push(line);
  }

  // ══════════════════════════════════
  // SVG OVERLAY — scatter, horizon, columns, connections
  // ══════════════════════════════════
  const svgParts = [];

  // Scatter origin — right edge of grid, ~40% down
  const sx = gx + gw * 0.85;
  const sy = gy + gh * 0.4;

  // UPWARD-RIGHT SCATTER
  const s1 = createRng(seed+200);
  for (let i = 0; i < 35000; i++) {
    const ba = -0.5 + (s1()-0.5)*1.8;
    const rd = s1();
    const cl = 0.6+Math.sin(rd*19+s1()*6)*0.4;
    const d = Math.pow(rd,0.5)*W*0.45*cl;
    const dn = d/(W*0.45);
    const a = ba+(s1()-0.5)*dn*2.2;
    const px=sx+Math.cos(a)*d, py=sy+Math.sin(a)*d;
    if(px<-30||px>W+30||py<-30||py>H+30) continue;
    const op=(1-dn*0.5)*(0.3+s1()*0.6);
    const mt=s1();
    if(mt>0.15){
      const sz=(1-dn*0.4)*(0.4+s1()*3);
      svgParts.push(`<path d="${blob(px,py,sz,s1)}" fill="#000" opacity="${op.toFixed(2)}"/>`);
    } else if(mt>0.04){
      const cs2=3+s1()*5*(1-dn*0.5);
      const rot=(s1()-0.5)*25;
      svgParts.push(`<text x="${px.toFixed(0)}" y="${py.toFixed(0)}" font-size="${cs2.toFixed(1)}" opacity="${op.toFixed(2)}" transform="rotate(${rot.toFixed(0)} ${px.toFixed(0)} ${py.toFixed(0)})">${esc(G[Math.floor(s1()*G.length)])}</text>`);
    } else {
      const la=a+(s1()-0.5)*1.5,ll=4+s1()*18*(1-dn*0.5);
      svgParts.push(`<path d="${tline(px,py,px+Math.cos(la)*ll,py+Math.sin(la)*ll,1,s1)}" fill="none" stroke="#000" stroke-width="${(0.2+s1()*0.5).toFixed(1)}" opacity="${op.toFixed(2)}"/>`);
    }
  }

  // Scatter knots
  for(let k=0;k<10;k++){
    const kr=createRng(seed+220+k*31);
    const kx=sx+(kr()-0.2)*W*0.3, ky=sy+(kr()-0.5)*H*0.25;
    const krad=10+kr()*35, kn=60+Math.floor(kr()*200);
    const ka=kr()*Math.PI, ks=1.5+kr()*1.5;
    for(let i=0;i<kn;i++){
      const a=kr()*Math.PI*2,d=Math.pow(kr(),0.7)*krad;
      const dx=Math.cos(a)*d,dy=Math.sin(a)*d;
      const rx=dx*Math.cos(ka)-dy*Math.sin(ka);
      const ry=dx*Math.sin(ka)+dy*Math.cos(ka);
      svgParts.push(`<path d="${blob(kx+rx*ks,ky+ry,0.2+kr()*2,kr)}" fill="#000" opacity="${((1-d/krad)*(0.2+kr()*0.4)).toFixed(2)}"/>`);
    }
  }

  // DARK HORIZON
  const hRng=createRng(seed+300);
  const hy=gy+gh*0.95, hsx=sx-W*0.05, hex=W*0.92;
  for(let i=0;i<15000;i++){
    const px=hsx+hRng()*(hex-hsx);
    const py=hy+(hRng()-0.5)*H*0.035;
    const dc=Math.abs(py-hy)/(H*0.0175);
    const hf=Math.pow((px-hsx)/(hex-hsx),0.5);
    const vf=Math.pow(1-dc,2);
    const op=vf*(1-hf*0.7)*(0.4+hRng()*0.5);
    if(hRng()>0.2){
      const len=3+hRng()*80*(1-hf);
      svgParts.push(`<path d="${tline(px,py,px+len,py+(hRng()-0.5)*2,0.5,hRng)}" fill="none" stroke="#000" stroke-width="${(0.3+hRng()*2*vf).toFixed(1)}" opacity="${op.toFixed(2)}"/>`);
    } else {
      svgParts.push(`<path d="${blob(px,py,0.5+hRng()*3*vf,hRng)}" fill="#000" opacity="${op.toFixed(2)}"/>`);
    }
  }
  svgParts.push(`<path d="${tline(hsx,hy,hex*0.9,hy+(rng()-0.5)*3,1.5,createRng(seed+301))}" fill="none" stroke="#000" stroke-width="2.5" opacity="0.5"/>`);
  svgParts.push(`<path d="${tline(hsx,hy+4,hex*0.75,hy+5,1,createRng(seed+302))}" fill="none" stroke="#000" stroke-width="0.8" opacity="0.3"/>`);

  // DOWNWARD SCATTER
  const s2=createRng(seed+400);
  const s2x=gx+gw*0.7, s2y=hy+H*0.02;
  for(let i=0;i<15000;i++){
    const a=Math.PI*0.5+(s2()-0.5)*1.8;
    const rd=s2();const cl=0.6+Math.sin(rd*19+s2()*6)*0.4;
    const d=Math.pow(rd,0.5)*H*0.35*cl;const dn=d/(H*0.35);
    const ang=a+(s2()-0.5)*dn*1.5;
    const px=s2x+Math.cos(ang)*d,py=s2y+Math.sin(ang)*d;
    if(px<-30||px>W+30||py>H+30) continue;
    const op=(1-dn*0.5)*(0.2+s2()*0.5);
    if(s2()>0.15){
      svgParts.push(`<path d="${blob(px,py,(1-dn*0.3)*(0.3+s2()*2.5),s2)}" fill="#000" opacity="${op.toFixed(2)}"/>`);
    } else {
      const cs2=2.5+s2()*4*(1-dn*0.5);
      svgParts.push(`<text x="${px.toFixed(0)}" y="${py.toFixed(0)}" font-size="${cs2.toFixed(1)}" opacity="${op.toFixed(2)}">${esc(G[Math.floor(s2()*G.length)])}</text>`);
    }
  }

  // Downward knots
  for(let k=0;k<6;k++){
    const kr=createRng(seed+420+k*41);
    const kx=s2x+(kr()-0.5)*W*0.2,ky=s2y+kr()*H*0.2;
    const krad=10+kr()*30,kn=50+Math.floor(kr()*150);
    for(let i=0;i<kn;i++){
      const a=kr()*Math.PI*2,d=Math.pow(kr(),0.7)*krad;
      svgParts.push(`<path d="${blob(kx+Math.cos(a)*d,ky+Math.sin(a)*d,0.2+kr()*1.8,kr)}" fill="#000" opacity="${((1-d/krad)*(0.2+kr()*0.4)).toFixed(2)}"/>`);
    }
  }

  // VERTICAL COLUMNS
  const vRng=createRng(seed+500);
  const vsy=gy+gh;
  for(let c=0;c<70;c++){
    const cl=Math.floor(c/5);
    const cx=gx+(cl/(14))*gw*0.55+(vRng()-0.5)*20;
    const ll=40+vRng()*H*0.28;
    const sw=0.25+vRng()*0.7,op=0.2+vRng()*0.45;
    svgParts.push(`<path d="${tline(cx,vsy-3,cx+(vRng()-0.5)*4,vsy+ll,0.3+vRng()*0.5,vRng)}" fill="none" stroke="#000" stroke-width="${sw.toFixed(1)}" opacity="${op.toFixed(2)}"/>`);
    for(let t=0;t<3+Math.floor(vRng()*8);t++){
      const ty=vsy+(t/10)*ll,tw=2+vRng()*5;
      svgParts.push(`<line x1="${(cx-tw/2).toFixed(0)}" y1="${ty.toFixed(0)}" x2="${(cx+tw/2).toFixed(0)}" y2="${ty.toFixed(0)}" stroke="#000" stroke-width="0.25" opacity="${(0.1+vRng()*0.2).toFixed(2)}"/>`);
    }
    if(vRng()>0.5) for(let t=0;t<2+Math.floor(vRng()*4);t++){
      svgParts.push(`<text x="${(cx+3).toFixed(0)}" y="${(vsy+vRng()*ll).toFixed(0)}" font-size="${(3+vRng()*2.5).toFixed(1)}" opacity="${(0.1+vRng()*0.18).toFixed(2)}">${esc(G[Math.floor(vRng()*G.length)])}</text>`);
    }
  }

  // CONNECTION LINES
  const cRng=createRng(seed+600);
  for(let i=0;i<60;i++){
    const ang=cRng()*Math.PI*2,len=80+cRng()*W*0.5;
    const ox=sx+(cRng()-0.5)*30,oy=sy+(cRng()-0.5)*30;
    const ex=ox+Math.cos(ang)*len,ey=oy+Math.sin(ang)*len;
    svgParts.push(`<path d="${tline(ox,oy,ex,ey,2+cRng()*3,cRng)}" fill="none" stroke="#000" stroke-width="${(0.1+cRng()*0.25).toFixed(2)}" opacity="${(0.02+cRng()*0.06).toFixed(2)}"/>`);
    if(cRng()>0.4&&ex>0&&ex<W&&ey>0&&ey<H)
      svgParts.push(`<path d="${blob(ex,ey,0.5+cRng()*2,cRng)}" fill="#000" opacity="${(0.06+cRng()*0.12).toFixed(2)}"/>`);
  }
  // From downward scatter too
  for(let i=0;i<30;i++){
    const ang=cRng()*Math.PI*2,len=60+cRng()*W*0.35;
    const ox=s2x+(cRng()-0.5)*30,oy=s2y+(cRng()-0.5)*30;
    svgParts.push(`<path d="${tline(ox,oy,ox+Math.cos(ang)*len,oy+Math.sin(ang)*len,2+cRng()*3,cRng)}" fill="none" stroke="#000" stroke-width="${(0.1+cRng()*0.2).toFixed(2)}" opacity="${(0.02+cRng()*0.05).toFixed(2)}"/>`);
  }

  // NOTATION
  svgParts.push(`<text x="12" y="${H-18}" font-size="8" opacity="0.3">§${(seed%999)+1}</text>`);
  svgParts.push(`<text x="12" y="${H-6}" font-size="5" opacity="0.15">FIELD NOTES — DATE UNKNOWN — STATUS: INCOMPLETE</text>`);

  console.log(`  Grid: ${charsPerRow}x${numRows} chars`);
  console.log(`  SVG elements: ${svgParts.length}`);

  // ══════════════════════════════════
  // BUILD HTML — text grid as <pre>, overlays as SVG
  // ══════════════════════════════════
  return `<!DOCTYPE html><html><head><style>
*{margin:0;padding:0}
body{width:${W}px;height:${H}px;background:#fff;position:relative;overflow:hidden}
#grid{position:absolute;left:${gx}px;top:${gy}px;font:${fontSize}px/1.5 'Courier New',monospace;color:#000;white-space:pre;letter-spacing:0px}
#overlay{position:absolute;left:0;top:0}
</style></head><body>
<div id="grid">${textLines.map(l => esc(l)).join('\n')}</div>
<svg id="overlay" xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<style>text{font-family:'Courier New',monospace;fill:#000}</style>
${svgParts.join('\n')}
</svg>
</body></html>`;
}

// CLI
const seed = parseInt(process.argv[2]) || Math.floor(Math.random()*100000);
const name = process.argv[3] || `page-${seed}`;
const out = path.join(OUTPUT_DIR, `${name}.png`);

console.log(`\nRendering (Text+SVG)...`);
console.log(`  Seed: ${seed}`);

const start = Date.now();
const html = render(seed);
const tmp = path.join(OUTPUT_DIR, `_t${seed}.html`);
fs.writeFileSync(tmp, html);
console.log(`  HTML: ${(html.length/1024/1024).toFixed(1)} MB`);

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
