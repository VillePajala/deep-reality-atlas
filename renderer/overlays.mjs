/**
 * Overlay systems — BOLD visual elements layered on top of text.
 * These should be CLEARLY VISIBLE, not subtle hints.
 */

function createRng(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

// ════════════════════════════════════
// CARTOGRAPHIC — contours, compass, coordinates
// ════════════════════════════════════

export function addCartographicOverlay(svgParts, W, H, seed) {
  const rng = createRng(seed);

  // CONTOUR LINES — multiple centers, visible curves
  for (let c = 0; c < 8 + Math.floor(rng() * 8); c++) {
    const cx = W * (0.1 + rng() * 0.8);
    const cy = H * (0.1 + rng() * 0.8);
    const baseR = 40 + rng() * 250;
    const numRings = 5 + Math.floor(rng() * 10);
    const op = 0.2 + rng() * 0.2; // ACTUALLY VISIBLE over text

    for (let r = 0; r < numRings; r++) {
      const ringR = baseR + r * (10 + rng() * 18);
      let d = 'M';
      const steps = 50;
      for (let i = 0; i <= steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        const wobble = ringR * (1 + Math.sin(a * 3 + rng() * 10) * 0.12 + (rng() - 0.5) * 0.06);
        d += (i === 0 ? '' : ' L') + `${(cx + Math.cos(a) * wobble).toFixed(0)},${(cy + Math.sin(a) * wobble).toFixed(0)}`;
      }
      svgParts.push(`<path d="${d}" fill="none" stroke="#000" stroke-width="${(1 + rng() * 1.5).toFixed(1)}" opacity="${op.toFixed(2)}"/>`);
    }
  }

  // COMPASS ROSE — big, prominent
  const compX = W * (0.15 + rng() * 0.7);
  const compY = H * (0.15 + rng() * 0.7);
  const compR = 60 + rng() * 150;
  const numRays = 12 + Math.floor(rng() * 20);
  for (let i = 0; i < numRays; i++) {
    const a = (i / numRays) * Math.PI * 2;
    const inner = compR * 0.05;
    const outer = compR * (0.5 + rng() * 0.5);
    const sw = i % (numRays / 4) === 0 ? 1 : 0.4; // cardinal directions thicker
    svgParts.push(`<line x1="${(compX + Math.cos(a) * inner).toFixed(0)}" y1="${(compY + Math.sin(a) * inner).toFixed(0)}" x2="${(compX + Math.cos(a) * outer).toFixed(0)}" y2="${(compY + Math.sin(a) * outer).toFixed(0)}" stroke="#000" stroke-width="${sw}" opacity="0.3"/>`);
  }
  for (let r = 1; r <= 3; r++) {
    svgParts.push(`<circle cx="${compX.toFixed(0)}" cy="${compY.toFixed(0)}" r="${(compR * r * 0.3).toFixed(0)}" fill="none" stroke="#000" stroke-width="0.5" opacity="0.2"/>`);
  }
  // Center dot
  svgParts.push(`<circle cx="${compX.toFixed(0)}" cy="${compY.toFixed(0)}" r="3" fill="#000" opacity="0.3"/>`);

  // COORDINATE GRID — faint but present
  const gridSpacing = 80 + rng() * 120;
  const gridOp = 0.03 + rng() * 0.03;
  const gridOffX = rng() * gridSpacing;
  const gridOffY = rng() * gridSpacing;
  for (let x = gridOffX; x < W; x += gridSpacing) {
    svgParts.push(`<line x1="${x.toFixed(0)}" y1="0" x2="${x.toFixed(0)}" y2="${H}" stroke="#000" stroke-width="0.25" opacity="${gridOp.toFixed(3)}"/>`);
  }
  for (let y = gridOffY; y < H; y += gridSpacing) {
    svgParts.push(`<line x1="0" y1="${y.toFixed(0)}" x2="${W}" y2="${y.toFixed(0)}" stroke="#000" stroke-width="0.25" opacity="${gridOp.toFixed(3)}"/>`);
  }

  // CROSS MARKS at intersections
  for (let x = gridOffX; x < W; x += gridSpacing) {
    for (let y = gridOffY; y < H; y += gridSpacing) {
      if (rng() > 0.5) continue;
      const ms = 4 + rng() * 6;
      svgParts.push(`<line x1="${(x-ms).toFixed(0)}" y1="${y.toFixed(0)}" x2="${(x+ms).toFixed(0)}" y2="${y.toFixed(0)}" stroke="#000" stroke-width="0.4" opacity="0.2"/>`);
      svgParts.push(`<line x1="${x.toFixed(0)}" y1="${(y-ms).toFixed(0)}" x2="${x.toFixed(0)}" y2="${(y+ms).toFixed(0)}" stroke="#000" stroke-width="0.4" opacity="0.2"/>`);
    }
  }

  // DOTTED PATH LINES — routes across the map
  for (let p = 0; p < 8 + Math.floor(rng() * 8); p++) {
    let px = W * rng(), py = H * rng();
    let d = `M${px.toFixed(0)},${py.toFixed(0)}`;
    const segs = 15 + Math.floor(rng() * 25);
    for (let s = 0; s < segs; s++) {
      px += (rng() - 0.5) * 120;
      py += (rng() - 0.5) * 120;
      d += ` L${px.toFixed(0)},${py.toFixed(0)}`;
    }
    svgParts.push(`<path d="${d}" fill="none" stroke="#000" stroke-width="0.5" stroke-dasharray="3,5" opacity="${(0.15 + rng() * 0.2).toFixed(2)}"/>`);

    // Dots along the path
    let px2 = W * rng(), py2 = H * rng();
    for (let s = 0; s < 5 + Math.floor(rng() * 8); s++) {
      px2 += (rng() - 0.5) * 80;
      py2 += (rng() - 0.5) * 80;
      svgParts.push(`<circle cx="${px2.toFixed(0)}" cy="${py2.toFixed(0)}" r="${(1.5 + rng() * 2).toFixed(1)}" fill="#000" opacity="${(0.15 + rng() * 0.2).toFixed(2)}"/>`);
    }
  }
}

// ════════════════════════════════════
// SYMBOLS — sacred geometry, alchemical, planetary
// ════════════════════════════════════

export function addSymbolsOverlay(svgParts, W, H, seed) {
  const rng = createRng(seed);

  const drawSymbol = (cx, cy, r, rng) => {
    const type = Math.floor(rng() * 8);
    let svg = '';

    if (type === 0) {
      // Flower of life fragment
      const ir = r / 2.5;
      for (let i = 0; i < 7; i++) {
        const a = i === 0 ? 0 : (i - 1) / 6 * Math.PI * 2;
        const x = i === 0 ? cx : cx + Math.cos(a) * ir;
        const y = i === 0 ? cy : cy + Math.sin(a) * ir;
        if (rng() > 0.2) svg += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${ir.toFixed(0)}" fill="none" stroke="#000" stroke-width="0.5"/>`;
      }
    } else if (type === 1) {
      // Ouroboros
      svg += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="none" stroke="#000" stroke-width="0.8"/>`;
      const ha = 0.3;
      svg += `<circle cx="${(cx + Math.cos(ha) * r).toFixed(0)}" cy="${(cy + Math.sin(ha) * r).toFixed(0)}" r="${(r * 0.12).toFixed(1)}" fill="#000"/>`;
    } else if (type === 2) {
      // Sun — circle with dot and rays
      svg += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="none" stroke="#000" stroke-width="0.6"/>`;
      svg += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${(r * 0.15).toFixed(1)}" fill="#000"/>`;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        svg += `<line x1="${(cx + Math.cos(a) * r * 1.1).toFixed(0)}" y1="${(cy + Math.sin(a) * r * 1.1).toFixed(0)}" x2="${(cx + Math.cos(a) * r * 1.4).toFixed(0)}" y2="${(cy + Math.sin(a) * r * 1.4).toFixed(0)}" stroke="#000" stroke-width="0.5"/>`;
      }
    } else if (type === 3) {
      // Eye
      svg += `<path d="M${(cx - r).toFixed(0)},${cy.toFixed(0)} Q${cx.toFixed(0)},${(cy - r * 0.7).toFixed(0)} ${(cx + r).toFixed(0)},${cy.toFixed(0)} Q${cx.toFixed(0)},${(cy + r * 0.7).toFixed(0)} ${(cx - r).toFixed(0)},${cy.toFixed(0)}" fill="none" stroke="#000" stroke-width="0.6"/>`;
      svg += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${(r * 0.25).toFixed(1)}" fill="#000"/>`;
    } else if (type === 4) {
      // Triangle
      const dir = rng() > 0.5 ? -1 : 1;
      svg += `<path d="M${cx.toFixed(0)},${(cy + dir * r).toFixed(0)} L${(cx - r * 0.87).toFixed(0)},${(cy - dir * r * 0.5).toFixed(0)} L${(cx + r * 0.87).toFixed(0)},${(cy - dir * r * 0.5).toFixed(0)} Z" fill="none" stroke="#000" stroke-width="0.6"/>`;
    } else if (type === 5) {
      // Spiral
      let d = 'M';
      for (let i = 0; i < 60; i++) {
        const t = i / 60;
        const a = t * Math.PI * 5;
        const sr = t * r;
        d += (i === 0 ? '' : ' L') + `${(cx + Math.cos(a) * sr).toFixed(0)},${(cy + Math.sin(a) * sr).toFixed(0)}`;
      }
      svg += `<path d="${d}" fill="none" stroke="#000" stroke-width="0.5"/>`;
    } else if (type === 6) {
      // Hermetic cross
      svg += `<line x1="${(cx - r).toFixed(0)}" y1="${cy.toFixed(0)}" x2="${(cx + r).toFixed(0)}" y2="${cy.toFixed(0)}" stroke="#000" stroke-width="0.6"/>`;
      svg += `<line x1="${cx.toFixed(0)}" y1="${(cy - r).toFixed(0)}" x2="${cx.toFixed(0)}" y2="${(cy + r).toFixed(0)}" stroke="#000" stroke-width="0.6"/>`;
      svg += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${(r * 0.7).toFixed(0)}" fill="none" stroke="#000" stroke-width="0.5"/>`;
    } else {
      // Concentric spheres with gaps
      for (let i = 1; i <= 4; i++) {
        const gap = rng() * Math.PI * 0.3;
        const start = rng() * Math.PI * 2;
        const sr = r * i * 0.25;
        svg += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${sr.toFixed(0)}" fill="none" stroke="#000" stroke-width="0.4" stroke-dasharray="${(sr * (Math.PI * 2 - gap) / Math.PI).toFixed(0)},${(sr * gap / Math.PI).toFixed(0)}" transform="rotate(${(start * 180 / Math.PI).toFixed(0)} ${cx.toFixed(0)} ${cy.toFixed(0)})"/>`;
      }
    }
    return svg;
  };

  // LARGE symbols — 8-15 prominent ones
  for (let i = 0; i < 8 + Math.floor(rng() * 8); i++) {
    const sx = W * (0.05 + rng() * 0.9);
    const sy = H * (0.05 + rng() * 0.9);
    const sr = 15 + rng() * 50; // BIG
    const op = 0.1 + rng() * 0.15; // VISIBLE
    svgParts.push(`<g opacity="${op.toFixed(2)}">${drawSymbol(sx, sy, sr, rng)}</g>`);
  }

  // MEDIUM scattered symbols — 20-30
  for (let i = 0; i < 20 + Math.floor(rng() * 15); i++) {
    const sx = W * rng();
    const sy = H * rng();
    const sr = 8 + rng() * 20;
    const op = 0.15 + rng() * 0.2;
    svgParts.push(`<g opacity="${op.toFixed(2)}">${drawSymbol(sx, sy, sr, rng)}</g>`);
  }

  // TINY recurring symbol — obsessive repetition, 60-100
  const recType = Math.floor(rng() * 8);
  for (let i = 0; i < 60 + Math.floor(rng() * 50); i++) {
    const sx = W * rng();
    const sy = H * rng();
    const sr = 3 + rng() * 7;
    const op = 0.12 + rng() * 0.18;
    // Force same type for the recurring one
    const tmpRng = createRng(seed + 9999 + i);
    // Override type
    let svg = '';
    if (recType < 3) {
      svg = `<circle cx="${sx.toFixed(0)}" cy="${sy.toFixed(0)}" r="${sr.toFixed(0)}" fill="none" stroke="#000" stroke-width="0.4"/><circle cx="${sx.toFixed(0)}" cy="${sy.toFixed(0)}" r="${(sr*0.2).toFixed(1)}" fill="#000"/>`;
    } else if (recType < 5) {
      svg = `<path d="M${(sx-sr).toFixed(0)},${sy.toFixed(0)} Q${sx.toFixed(0)},${(sy-sr*0.5).toFixed(0)} ${(sx+sr).toFixed(0)},${sy.toFixed(0)} Q${sx.toFixed(0)},${(sy+sr*0.5).toFixed(0)} ${(sx-sr).toFixed(0)},${sy.toFixed(0)}" fill="none" stroke="#000" stroke-width="0.3"/><circle cx="${sx.toFixed(0)}" cy="${sy.toFixed(0)}" r="${(sr*0.15).toFixed(1)}" fill="#000"/>`;
    } else {
      const cr = sr * 0.4;
      svg = `<line x1="${(sx-cr).toFixed(0)}" y1="${sy.toFixed(0)}" x2="${(sx+cr).toFixed(0)}" y2="${sy.toFixed(0)}" stroke="#000" stroke-width="0.3"/><line x1="${sx.toFixed(0)}" y1="${(sy-cr).toFixed(0)}" x2="${sx.toFixed(0)}" y2="${(sy+cr).toFixed(0)}" stroke="#000" stroke-width="0.3"/>`;
    }
    svgParts.push(`<g opacity="${op.toFixed(2)}">${svg}</g>`);
  }
}

// ════════════════════════════════════
// ORGANIC — cellular forms, mycelium, biological drawings
// ════════════════════════════════════

export function addOrganicOverlay(svgParts, W, H, voidCx, voidCy, voidR, seed) {
  const rng = createRng(seed);

  // CELLULAR FORMS — growing from void, scattered across page
  for (let c = 0; c < 40 + Math.floor(rng() * 30); c++) {
    // Some near void, some scattered
    let cx, cy;
    if (rng() > 0.4) {
      const a = rng() * Math.PI * 2;
      const d = voidR * (0.8 + rng() * 2);
      cx = voidCx + Math.cos(a) * d;
      cy = voidCy + Math.sin(a) * d;
    } else {
      cx = W * (0.05 + rng() * 0.9);
      cy = H * (0.05 + rng() * 0.9);
    }

    const r = 8 + rng() * 35;
    const op = 0.2 + rng() * 0.25; // VISIBLE
    const numLobes = 4 + Math.floor(rng() * 7);

    // Organic membrane
    let path = 'M';
    for (let i = 0; i <= 40; i++) {
      const angle = (i / 40) * Math.PI * 2;
      const wobble = r * (0.5 + 0.5 * Math.sin(angle * numLobes + rng() * 10));
      path += (i === 0 ? '' : ' L') + `${(cx + Math.cos(angle) * wobble).toFixed(0)},${(cy + Math.sin(angle) * wobble).toFixed(0)}`;
    }
    path += ' Z';
    svgParts.push(`<path d="${path}" fill="none" stroke="#000" stroke-width="${(0.5 + rng() * 0.8).toFixed(1)}" opacity="${op.toFixed(2)}"/>`);

    // Nucleus
    if (rng() > 0.2) {
      const nr = r * (0.15 + rng() * 0.25);
      let npath = 'M';
      for (let i = 0; i <= 20; i++) {
        const a = (i / 20) * Math.PI * 2;
        const w = nr * (0.8 + rng() * 0.4);
        npath += (i === 0 ? '' : ' L') + `${(cx + Math.cos(a) * w).toFixed(0)},${(cy + Math.sin(a) * w).toFixed(0)}`;
      }
      npath += ' Z';
      svgParts.push(`<path d="${npath}" fill="none" stroke="#000" stroke-width="0.4" opacity="${(op * 0.8).toFixed(2)}"/>`);
    }

    // Internal dots — organelles
    for (let s = 0; s < 5 + Math.floor(rng() * 12); s++) {
      const sa = rng() * Math.PI * 2;
      const sd = rng() * r * 0.5;
      svgParts.push(`<circle cx="${(cx + Math.cos(sa) * sd).toFixed(0)}" cy="${(cy + Math.sin(sa) * sd).toFixed(0)}" r="${(0.5 + rng() * 1.2).toFixed(1)}" fill="#000" opacity="${(op * 0.7).toFixed(2)}"/>`);
    }
  }

  // MYCELIUM NETWORK — branching lines
  for (let m = 0; m < 25 + Math.floor(rng() * 20); m++) {
    let mx = W * (0.1 + rng() * 0.8);
    let my = H * (0.1 + rng() * 0.8);
    let angle = rng() * Math.PI * 2;
    const segs = 15 + Math.floor(rng() * 30);
    let d = `M${mx.toFixed(0)},${my.toFixed(0)}`;
    const lineOp = 0.15 + rng() * 0.2;
    const lineSw = 0.3 + rng() * 0.6;

    for (let s = 0; s < segs; s++) {
      angle += (rng() - 0.5) * 0.8;
      const segLen = 5 + rng() * 25;
      mx += Math.cos(angle) * segLen;
      my += Math.sin(angle) * segLen;
      d += ` L${mx.toFixed(0)},${my.toFixed(0)}`;

      // Branch node
      if (rng() > 0.5) {
        svgParts.push(`<circle cx="${mx.toFixed(0)}" cy="${my.toFixed(0)}" r="${(0.8 + rng() * 2.5).toFixed(1)}" fill="#000" opacity="${(lineOp * 0.8).toFixed(2)}"/>`);
      }

      // Sub-branch
      if (rng() > 0.7) {
        let bx = mx, by = my, ba = angle + (rng() - 0.5) * 1.5;
        let bd = `M${bx.toFixed(0)},${by.toFixed(0)}`;
        for (let bs = 0; bs < 3 + Math.floor(rng() * 6); bs++) {
          ba += (rng() - 0.5) * 0.6;
          bx += Math.cos(ba) * (3 + rng() * 12);
          by += Math.sin(ba) * (3 + rng() * 12);
          bd += ` L${bx.toFixed(0)},${by.toFixed(0)}`;
        }
        svgParts.push(`<path d="${bd}" fill="none" stroke="#000" stroke-width="${(lineSw * 0.5).toFixed(1)}" opacity="${(lineOp * 0.6).toFixed(2)}"/>`);
      }
    }
    svgParts.push(`<path d="${d}" fill="none" stroke="#000" stroke-width="${lineSw.toFixed(1)}" opacity="${lineOp.toFixed(2)}"/>`);
  }

  // DENSE STIPPLING — organic texture around void
  for (let i = 0; i < 3000; i++) {
    const a = rng() * Math.PI * 2;
    const d = voidR * (0.5 + rng() * 2.5);
    const px = voidCx + Math.cos(a) * d;
    const py = voidCy + Math.sin(a) * d;
    const distNorm = Math.abs(d - voidR) / voidR;
    const op = Math.max(0, 0.15 - distNorm * 0.05) * (0.3 + rng() * 0.7);
    if (op > 0.02) {
      svgParts.push(`<circle cx="${px.toFixed(0)}" cy="${py.toFixed(0)}" r="${(0.3 + rng() * 0.8).toFixed(1)}" fill="#000" opacity="${op.toFixed(2)}"/>`);
    }
  }
}
