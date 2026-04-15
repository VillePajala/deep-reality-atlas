/**
 * Atlas Page Composer — assembles ALL generative systems into a single
 * coherent page of the Deep Reality atlas.
 *
 * Every page tells the same story:
 * A rational system encounters something it cannot contain, and breaks down.
 *
 * 14 layers of rendering, from sub-surface ghost text to 3D eruptions.
 * Each page draws from the Holy Book of Insanity text corpus.
 *
 * Structure: Taxonomy Grid (upper-left) → Breakdown Zone (center) → Void (lower-right)
 */

import { seedNoise } from '../engine/noise';
import { createFlowField, drawFlowLines } from '../engine/flow-field';
import { drawTaxonomyGrid, drawCrossReferences } from '../engine/taxonomy-grid';
import { drawVoid, VoidConfig } from '../engine/void';
import { createScriptSystem, writeTextBlock, drawMarginalia, writeText } from '../engine/pseudo-script';
import { drawGeometryFragments, scatterRecurringSymbol } from '../engine/sacred-geometry';
import { stippleGradient, stippleRegion } from '../engine/stippling';
import { selectThemes, pickFragments, pickQuote } from '../engine/corpus';
import { createRDField, simulateRD, drawRDField, RD_PRESETS } from '../engine/reaction-diffusion';
import { generateBranching, drawBranching } from '../engine/branching';
import { generateContours, drawContours } from '../engine/contours';
import { drawGhostText, drawSubSurface, drawEruption, drawVignette } from '../engine/depth';

export interface AtlasPageConfig {
  width: number;
  height: number;
  seed: number;
  /** 0-1: How much of the page is in breakdown (0 = mostly ordered, 1 = mostly chaotic) */
  entropy: number;
  /** Observer position for parallax depth effects */
  observerX?: number;
  observerY?: number;
  /** Time in seconds — drives slow animation */
  time?: number;
}

function createRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export interface AtlasPageInfo {
  primaryTheme: string;
  secondaryTheme: string;
  mantra: string;
  longQuote: string;
  fragments: string[];
}

/** Get the theme info for a seed without rendering */
export function getPageInfo(seed: number): AtlasPageInfo {
  const { primary, secondary } = selectThemes(seed);
  const fragments = pickFragments(primary, 8, seed);
  const fragments2 = pickFragments(secondary, 4, seed + 50);
  const longQuote = pickQuote(primary, seed);
  return {
    primaryTheme: primary.title,
    secondaryTheme: secondary.title,
    mantra: primary.mantras[0],
    longQuote,
    fragments: [...fragments, ...fragments2],
  };
}

/**
 * Render a complete atlas page onto a canvas context.
 * 14 layers, from deepest to topmost.
 */
export function renderAtlasPage(
  ctx: CanvasRenderingContext2D,
  config: AtlasPageConfig
): void {
  const { width, height, seed, entropy } = config;
  const observerX = config.observerX ?? width / 2;
  const observerY = config.observerY ?? height / 2;
  const rng = createRng(seed);

  seedNoise(seed);

  // Select thematic content from the Holy Book of Insanity
  const { primary: theme, secondary: theme2 } = selectThemes(seed);
  const fragments = pickFragments(theme, 8, seed);
  const fragments2 = pickFragments(theme2, 4, seed + 50);
  const longQuote = pickQuote(theme, seed);
  const scripts = createScriptSystem(seed);

  // ═══════════════════════════════════════════════════════
  // LAYOUT SYSTEM — randomize WHERE everything goes
  // ═══════════════════════════════════════════════════════

  // Pick one of 4 quadrants for the grid anchor
  const gridQuadrant = Math.floor(rng() * 4); // 0=TL, 1=TR, 2=BL, 3=BR
  const gridX = (gridQuadrant % 2 === 0) ? width * 0.04 : width * (0.5 + rng() * 0.1);
  const gridY = (gridQuadrant < 2) ? height * 0.04 : height * (0.5 + rng() * 0.1);

  // Void goes roughly opposite to the grid
  const voidCX = (gridQuadrant % 2 === 0) ? width * (0.6 + rng() * 0.3) : width * (0.1 + rng() * 0.3);
  const voidCY = (gridQuadrant < 2) ? height * (0.55 + rng() * 0.35) : height * (0.1 + rng() * 0.3);

  // Grid size varies dramatically
  const gridScale = 0.5 + rng() * 0.8; // 0.5 = small grid, 1.3 = huge grid
  const gridCols = Math.floor((4 + rng() * 10) * gridScale);
  const gridRows = Math.floor((3 + rng() * 8) * gridScale);
  const maxGridW = width * (0.25 + rng() * 0.25);
  const maxGridH = height * (0.25 + rng() * 0.25);
  const cellSize = Math.min(maxGridW / gridCols, maxGridH / gridRows);

  // Void size varies
  const voidRadius = Math.min(width, height) * (0.1 + rng() * 0.2 + entropy * 0.2);

  // Flow field direction varies
  const flowAngleOffset = rng() * 100;

  // How many branching networks (0-3)
  const numNetworks = Math.floor(rng() * 3) + 1;

  // Whether to have eruptions (not just entropy-dependent)
  const hasEruptions = rng() > 0.4;

  // Text block positions — random
  const numTextBlocks = 1 + Math.floor(rng() * 4);

  // Composition style bias — some pages are more grid, some more void, some more text
  const styleBias = rng();
  const isGridHeavy = styleBias < 0.25;
  const isVoidHeavy = styleBias >= 0.25 && styleBias < 0.5;
  const isTextHeavy = styleBias >= 0.5 && styleBias < 0.75;
  // else balanced

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════

  // Clear to off-white
  ctx.fillStyle = '#f5f0e8';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#000';
  ctx.fillStyle = '#000';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // LAYER 0: Sub-surface
  drawSubSurface(ctx, width, height, seed + 10);

  // LAYER 1: Ghost text
  drawGhostText(ctx, longQuote, width, height, seed + 20);
  ctx.save();
  ctx.fillStyle = '#000';
  ctx.globalAlpha = 0.06;
  ctx.font = `bold ${width * (0.1 + rng() * 0.1)}px serif`;
  ctx.textAlign = 'center';
  ctx.translate(width * (0.3 + rng() * 0.4), height * (0.3 + rng() * 0.4));
  ctx.rotate((rng() - 0.5) * 0.6);
  ctx.fillText(theme.title, 0, 0);
  ctx.restore();

  // LAYER 2: Contour lines — position and density varies
  const contourRegionX = rng() * width * 0.3;
  const contourRegionY = rng() * height * 0.3;
  const contourLevels = generateContours(
    contourRegionX, contourRegionY,
    width * (0.5 + rng() * 0.5), height * (0.5 + rng() * 0.5),
    20, 8 + Math.floor(entropy * 8 + rng() * 5),
    0.002 + rng() * 0.004,
    seed + 30
  );
  drawContours(ctx, contourLevels, 0.06 + entropy * 0.15, 0.2, 0.6);

  // LAYER 3: Reaction-diffusion — random placement
  const presetKeys = Object.keys(RD_PRESETS) as (keyof typeof RD_PRESETS)[];
  const numRDPatches = 1 + Math.floor(rng() * 3);
  for (let i = 0; i < numRDPatches; i++) {
    const rdPreset = RD_PRESETS[presetKeys[Math.floor(rng() * presetKeys.length)]];
    const rdSize = 30 + Math.floor(rng() * 30);
    const rdField = createRDField(rdSize, rdSize);
    simulateRD(rdField, {
      width: rdSize, height: rdSize,
      feed: rdPreset.feed, kill: rdPreset.kill,
      dA: 1.0, dB: 0.5,
      iterations: 150 + Math.floor(rng() * 150),
    });
    const patchX = width * (0.05 + rng() * 0.7);
    const patchY = height * (0.05 + rng() * 0.7);
    const patchScale = (width * (0.15 + rng() * 0.3)) / rdSize;
    drawRDField(ctx, rdField, patchX, patchY, patchScale, 0.1 + rng() * 0.25);
  }

  // LAYER 4: Void — position determined by layout
  const voidConfig: VoidConfig = {
    centerX: voidCX,
    centerY: voidCY,
    baseRadius: isVoidHeavy ? voidRadius * 1.5 : voidRadius,
    irregularity: 0.3 + rng() * 0.5 + entropy * 0.3,
    bleedAmount: 0.1 + rng() * 0.1,
    noiseScale: 0.005 + rng() * 0.006,
    seed: seed + 100,
    tendrils: 2 + Math.floor(rng() * 4 + entropy * 4),
    tendrilLength: 30 + rng() * 60 + entropy * 60,
  };
  drawVoid(ctx, voidConfig, width, height, 4);

  // Second void on some pages
  if (rng() > 0.6) {
    const void2: VoidConfig = {
      centerX: width * (0.1 + rng() * 0.8),
      centerY: height * (0.1 + rng() * 0.8),
      baseRadius: voidRadius * (0.3 + rng() * 0.4),
      irregularity: 0.5 + rng() * 0.4,
      bleedAmount: 0.12,
      noiseScale: 0.007,
      seed: seed + 110,
      tendrils: 1 + Math.floor(rng() * 3),
      tendrilLength: 20 + rng() * 40,
    };
    drawVoid(ctx, void2, width, height, 4);
  }

  // LAYER 5: Sacred geometry — scattered across random region
  drawGeometryFragments(ctx,
    width * rng() * 0.3, height * rng() * 0.3,
    width * (0.4 + rng() * 0.5), height * (0.4 + rng() * 0.5),
    0.3 + entropy * 0.8 + rng() * 0.3,
    seed + 200
  );

  // LAYER 6: Branching networks — random roots and bounds
  for (let n = 0; n < numNetworks; n++) {
    const netBounds = {
      x: width * rng() * 0.4,
      y: height * rng() * 0.4,
      width: width * (0.3 + rng() * 0.5),
      height: height * (0.3 + rng() * 0.5),
    };
    const rootX = netBounds.x + rng() * netBounds.width;
    const rootY = netBounds.y + rng() * netBounds.height;
    const net = generateBranching(
      netBounds, rootX, rootY,
      60 + Math.floor(rng() * 100 + entropy * 80),
      50 + rng() * 50, 8 + rng() * 5, 3 + rng() * 4,
      80 + Math.floor(rng() * 50),
      seed + 250 + n * 100
    );
    drawBranching(ctx, net, 1.5 + rng() * 2, 0.1, 0.2 + rng() * 0.3 + entropy * 0.2);
  }

  // LAYER 7: Flow field — direction and bounds vary
  const flowField = createFlowField({
    width, height,
    resolution: 15,
    noiseScale: 0.008 + rng() * 0.025 + entropy * 0.015,
    turbulence: 1.5 + rng() * 3 + entropy * 4,
    offsetX: flowAngleOffset,
    offsetY: flowAngleOffset * 1.7,
    octaves: 3 + Math.floor(rng() * 3),
  });

  // Flow lines fill a random region
  const flowBounds = {
    x: width * rng() * 0.3,
    y: height * rng() * 0.3,
    width: width * (0.3 + rng() * 0.5),
    height: height * (0.3 + rng() * 0.5),
  };
  ctx.save();
  ctx.strokeStyle = '#000';
  drawFlowLines(ctx, flowField, flowBounds, 50 + Math.floor(rng() * 80 + entropy * 100), rng, {
    stepSize: 1 + rng(),
    maxSteps: 100 + Math.floor(rng() * 100 + entropy * 80),
    minWidth: 0.1 + rng() * 0.2,
    maxWidth: 1.5 + rng() * 2 + entropy * 1.5,
    opacity: 0.2 + rng() * 0.2 + entropy * 0.35,
  });
  ctx.restore();

  // LAYER 8: Taxonomy grid — position from layout
  const actualGridCols = isGridHeavy ? gridCols + 4 : gridCols;
  const actualGridRows = isGridHeavy ? gridRows + 3 : gridRows;

  drawTaxonomyGrid(ctx, {
    x: gridX, y: gridY,
    cols: Math.max(3, Math.min(actualGridCols, 18)),
    rows: Math.max(2, Math.min(actualGridRows, 14)),
    cellSize,
    padding: cellSize * (0.1 + rng() * 0.2),
    warpFactor: entropy * (0.8 + rng() * 0.8),
    breakdownStart: 0.3 + rng() * 0.4 - entropy * 0.2,
    seed: seed + 300,
  });

  drawCrossReferences(ctx, {
    x: gridX, y: gridY,
    cols: Math.max(3, Math.min(actualGridCols, 18)),
    rows: Math.max(2, Math.min(actualGridRows, 14)),
    cellSize, padding: cellSize * 0.15,
    warpFactor: entropy, breakdownStart: 0.5,
    seed: seed + 300,
  }, 3 + Math.floor(rng() * 6 + entropy * 6));

  // LAYER 9: Corpus text
  drawCorpusText(ctx, fragments, fragments2, theme, width, height, seed, rng);

  // LAYER 10: Pseudo-script + real corpus text — random placements
  const allCorpusLines = [
    ...fragments, ...fragments2,
    ...theme.fragments.slice(0, 6),
    ...theme2.fragments.slice(0, 4),
    longQuote,
  ];
  for (let t = 0; t < numTextBlocks; t++) {
    const tbX = width * (0.03 + rng() * 0.7);
    const tbY = height * (0.05 + rng() * 0.8);
    const tbW = width * (0.15 + rng() * 0.3);
    const tbLines = 2 + Math.floor(rng() * 6);
    const tbSize = 4 + Math.floor(rng() * 5);
    writeTextBlock(ctx, scripts, tbX, tbY, tbW, tbLines, tbSize, seed + 400 + t * 50, allCorpusLines);
  }
  drawMarginalia(ctx, scripts, width, height, seed + 500);

  // LAYER 11: Stipple zones — random placement
  const numStippleZones = 2 + Math.floor(rng() * 4);
  for (let i = 0; i < numStippleZones; i++) {
    const dir = (['horizontal', 'vertical', 'radial'] as const)[Math.floor(rng() * 3)];
    stippleGradient(ctx,
      width * rng() * 0.6, height * rng() * 0.6,
      width * (0.15 + rng() * 0.3), height * (0.15 + rng() * 0.3),
      dir, 0.2 + rng() * 0.4 + entropy * 0.3, seed + 600 + i * 30
    );
  }

  const numClusters = 2 + Math.floor(rng() * 5 + entropy * 4);
  for (let i = 0; i < numClusters; i++) {
    stippleRegion(ctx,
      width * (0.1 + rng() * 0.8), height * (0.1 + rng() * 0.8),
      10 + rng() * 50, 0.03 + rng() * 0.1, seed + 660 + i
    );
  }

  // LAYER 12: Eruptions — random positions, not just near void
  if (hasEruptions && entropy > 0.2) {
    const numEruptions = 1 + Math.floor(rng() * 2 + entropy * 2);
    for (let i = 0; i < numEruptions; i++) {
      // Some near void, some anywhere
      const nearVoid = rng() > 0.4;
      const eruptX = nearVoid
        ? voidConfig.centerX + (rng() - 0.5) * voidRadius
        : width * (0.1 + rng() * 0.8);
      const eruptY = nearVoid
        ? voidConfig.centerY + (rng() - 0.5) * voidRadius
        : height * (0.1 + rng() * 0.8);
      const eruptR = 15 + rng() * 40 + entropy * 25;
      drawEruption(ctx, eruptX, eruptY, eruptR, 1 + rng() * 2 + entropy * 2,
        seed + 700 + i, observerX, observerY, width, height);
    }
  }

  // LAYER 13: Recurring symbol + mantra
  scatterRecurringSymbol(ctx, width, height, 30 + Math.floor(rng() * 40 + entropy * 40), seed + 800);
  drawMantricRepetition(ctx, theme.mantras[0], width, height, seed + 810);

  // LAYER 14: Edge details + vignette
  drawEdgeDetails(ctx, width, height, seed, rng);
  drawVignette(ctx, width, height, 0.1 + rng() * 0.1 + entropy * 0.15);

  ctx.save();
  ctx.font = '8px monospace';
  ctx.fillStyle = '#000';
  ctx.globalAlpha = 0.5;
  ctx.fillText(`§${(seed % 999) + 1} — ${theme.id.toUpperCase()} / ${theme2.id.toUpperCase()}`, 12, height - 35);
  ctx.restore();
}

/**
 * Draw real text from the corpus — scattered as legible fragments.
 * These reward close reading — someone zooming in finds actual content.
 */
function drawCorpusText(
  ctx: CanvasRenderingContext2D,
  fragments: string[],
  fragments2: string[],
  theme: { characters: string[]; gridTitles: string[] },
  width: number,
  height: number,
  seed: number,
  rng: () => number
): void {
  ctx.save();

  // Scattered fragments — LEGIBLE, rewarding close reading
  const allFragments = [...fragments, ...fragments2];
  for (let i = 0; i < allFragments.length; i++) {
    const text = allFragments[i];
    const fx = width * (0.05 + rng() * 0.85);
    const fy = height * (0.05 + rng() * 0.85);
    const size = 7 + rng() * 10;
    const rotation = (rng() - 0.5) * 0.2;

    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate(rotation);
    ctx.font = `${size}px monospace`;
    ctx.fillStyle = '#000';
    ctx.globalAlpha = 0.35 + rng() * 0.45;
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  // Non-Latin characters — larger, more visible
  for (let i = 0; i < theme.characters.length * 5; i++) {
    const char = theme.characters[i % theme.characters.length];
    const cx = width * (0.1 + rng() * 0.8);
    const cy = height * (0.1 + rng() * 0.8);
    const charSize = 12 + rng() * 24;

    ctx.save();
    ctx.font = `${charSize}px serif`;
    ctx.fillStyle = '#000';
    ctx.globalAlpha = 0.2 + rng() * 0.4;
    ctx.fillText(char, cx, cy);
    ctx.restore();
  }

  // Grid section title — visible, thematic
  ctx.save();
  ctx.font = 'bold 9px monospace';
  ctx.fillStyle = '#000';
  ctx.globalAlpha = 0.7;
  const gridTitle = theme.gridTitles[Math.floor(rng() * theme.gridTitles.length)];
  ctx.fillText(gridTitle, width * 0.04, height * 0.055);
  ctx.restore();

  ctx.restore();
}

/**
 * Draw mantric repetition along the bottom edge.
 * A single phrase repeated across the entire width, like a colophon or prayer.
 */
function drawMantricRepetition(
  ctx: CanvasRenderingContext2D,
  mantra: string,
  width: number,
  height: number,
  seed: number
): void {
  ctx.save();
  ctx.font = '7px monospace';
  ctx.fillStyle = '#000';
  ctx.globalAlpha = 0.4;

  const y = height - 25;
  let x = 10;
  const spacing = mantra.length * 4.5 + 20;

  // Three lines of mantric repetition
  for (let line = 0; line < 3; line++) {
    x = 10 + line * 15;
    while (x < width - 10) {
      ctx.fillText(mantra, x, y + line * 8);
      x += spacing;
    }
  }

  ctx.restore();
}

/**
 * Draw edge details — crop marks, ruled lines, border marks.
 */
function drawEdgeDetails(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
  rng: () => number
): void {
  ctx.save();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 0.3;
  ctx.globalAlpha = 0.2;

  // Crop marks at corners
  const markLen = 15;
  const margin = 8;
  const corners = [
    [margin, margin], [width - margin, margin],
    [margin, height - margin], [width - margin, height - margin],
  ];

  for (const [cx, cy] of corners) {
    const sx = cx === margin ? 1 : -1;
    const sy = cy === margin ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + markLen * sx, cy);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy + markLen * sy);
    ctx.stroke();
  }

  // Ruled margin line
  if (rng() > 0.4) {
    ctx.globalAlpha = 0.06;
    ctx.lineWidth = 0.2;
    const lineX = width * 0.03;
    ctx.beginPath();
    ctx.moveTo(lineX, 0);
    ctx.lineTo(lineX, height);
    ctx.stroke();
  }

  // Top edge decoration — thin line with tick marks
  ctx.globalAlpha = 0.1;
  ctx.lineWidth = 0.2;
  ctx.beginPath();
  ctx.moveTo(margin, margin + 2);
  ctx.lineTo(width - margin, margin + 2);
  ctx.stroke();

  // Tick marks
  for (let x = margin; x < width - margin; x += width / 20) {
    ctx.beginPath();
    ctx.moveTo(x, margin);
    ctx.lineTo(x, margin + 4);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Animated overlay — drawn on top of the static base image each frame.
 * Lightweight: only renders evolving elements, not all 14 layers.
 *
 * - Flowing particles trace the flow field
 * - Sacred geometry fragments slowly rotate
 * - Void boundary breathes
 */
export function renderAnimationOverlay(
  ctx: CanvasRenderingContext2D,
  config: AtlasPageConfig,
  time: number
): void {
  const { width, height, seed, entropy } = config;
  const rng = createRng(seed + 5000);

  seedNoise(seed);

  ctx.save();

  // 1. FLOWING PARTICLES — trace through the flow field like ink droplets
  const flowField = createFlowField({
    width, height,
    resolution: 20,
    noiseScale: 0.012 + rng() * 0.02,
    turbulence: 2 + entropy * 4,
    offsetX: seed * 0.1,
    offsetY: seed * 0.2,
    octaves: 3,
  });

  const numParticles = 15 + Math.floor(entropy * 25);
  ctx.fillStyle = '#000';
  const cols = Math.ceil(width / 20);
  const rows = Math.ceil(height / 20);

  for (let i = 0; i < numParticles; i++) {
    const pSeed = seed + i * 137;
    const pRng = createRng(pSeed);
    const startX = pRng() * width;
    const startY = pRng() * height;
    const speed = 0.3 + pRng() * 0.7;
    const particleLife = 200 + pRng() * 300;

    let px = startX;
    let py = startY;
    const steps = Math.floor((time * speed * 30) % particleLife);

    for (let s = 0; s < steps; s++) {
      const col = Math.max(0, Math.min(Math.floor(px / 20), cols - 1));
      const row = Math.max(0, Math.min(Math.floor(py / 20), rows - 1));
      const angle = flowField.angles[col + row * cols] || 0;
      px += Math.cos(angle) * 1.5;
      py += Math.sin(angle) * 1.5;
      if (px < 0) px += width;
      if (px >= width) px -= width;
      if (py < 0) py += height;
      if (py >= height) py -= height;
    }

    const trailLen = 5 + Math.floor(pRng() * 10);
    for (let t = 0; t < trailLen; t++) {
      const alpha = (1 - t / trailLen) * (0.12 + entropy * 0.15);
      ctx.globalAlpha = alpha;
      const dotSize = (1 - t / trailLen) * (0.6 + pRng() * 1);

      const col = Math.max(0, Math.min(Math.floor(px / 20), cols - 1));
      const row = Math.max(0, Math.min(Math.floor(py / 20), rows - 1));
      const angle = flowField.angles[col + row * cols] || 0;

      ctx.beginPath();
      ctx.arc(px - Math.cos(angle) * t * 2, py - Math.sin(angle) * t * 2, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 2. PULSING GEOMETRY — slowly rotating fragments
  const numGeo = 2 + Math.floor(rng() * 3);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 0.4;

  for (let i = 0; i < numGeo; i++) {
    const gx = rng() * width;
    const gy = rng() * height;
    const gr = 15 + rng() * 35;
    const rotation = time * (0.02 + rng() * 0.05);
    const pulse = 0.7 + Math.sin(time * (0.3 + rng() * 0.5) + i) * 0.3;

    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate(rotation);
    ctx.globalAlpha = 0.08 + pulse * 0.1;

    ctx.beginPath();
    ctx.arc(0, 0, gr * pulse, 0, Math.PI * 2);
    ctx.stroke();

    const sides = 3 + Math.floor(rng() * 4);
    ctx.beginPath();
    for (let s = 0; s <= sides; s++) {
      const a = (s / sides) * Math.PI * 2;
      const r = gr * 0.6 * pulse;
      if (s === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.stroke();
    ctx.restore();
  }

  // 3. BREATHING VOID EDGE — dots drifting at boundary
  const breathe = Math.sin(time * 0.2) * 8;
  ctx.fillStyle = '#000';
  const numEdgeDots = 20 + Math.floor(entropy * 30);
  const voidCX = width * (rng() > 0.5 ? 0.65 : 0.35);
  const voidCY = height * (rng() > 0.5 ? 0.65 : 0.35);

  for (let i = 0; i < numEdgeDots; i++) {
    const angle = (i / numEdgeDots) * Math.PI * 2;
    const baseR = 60 + rng() * 120;
    const drift = Math.sin(time * 0.3 + angle * 3) * 5 + breathe;

    ctx.globalAlpha = 0.04 + Math.abs(Math.sin(time * 0.4 + i)) * 0.08;
    ctx.beginPath();
    ctx.arc(
      voidCX + Math.cos(angle) * (baseR + drift),
      voidCY + Math.sin(angle) * (baseR + drift),
      0.5 + rng() * 1.5, 0, Math.PI * 2
    );
    ctx.fill();
  }

  ctx.restore();
}
