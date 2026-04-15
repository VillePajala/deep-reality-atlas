/**
 * Taxonomy Grid — the anchor of sanity.
 * Rows and rows of small squares, each containing a carefully drawn organism.
 * This section feels SANE, scientific, methodical.
 * The grid's existence is what makes everything else meaningful.
 */

import { drawCellOrganism } from './voronoi';
import { simplex2 } from './noise';

export interface TaxonomyGridConfig {
  x: number;
  y: number;
  cols: number;
  rows: number;
  cellSize: number;
  padding: number;         // Space between cells
  warpFactor: number;      // How much the grid warps (0 = perfect, 1 = very warped)
  breakdownStart: number;  // Row where breakdown begins (0-1 normalized)
  seed: number;
  cellStyle?: string;      // Theme-driven cell drawing style
}

interface SeededRng {
  (): number;
}

function createRng(seed: number): SeededRng {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Draw the taxonomy grid — the systematic, sane part of the atlas page.
 * Each cell is numbered and contains a unique organic specimen.
 */
export function drawTaxonomyGrid(
  ctx: CanvasRenderingContext2D,
  config: TaxonomyGridConfig
): void {
  const rng = createRng(config.seed);
  const totalCells = config.cols * config.rows;

  ctx.save();

  for (let row = 0; row < config.rows; row++) {
    for (let col = 0; col < config.cols; col++) {
      const cellIndex = row * config.cols + col;
      const progress = row / config.rows; // 0 = top (sane), 1 = bottom (breaking down)

      // Calculate warp — increases as we move away from top-left
      const distFromOrigin = Math.sqrt(
        (col / config.cols) * (col / config.cols) +
        (row / config.rows) * (row / config.rows)
      );
      const warpAmount = distFromOrigin * config.warpFactor;

      // Base position
      let cellX = config.x + col * (config.cellSize + config.padding);
      let cellY = config.y + row * (config.cellSize + config.padding);

      // Apply warp — grid lines become less straight
      if (warpAmount > 0) {
        const noiseX = simplex2(col * 0.3 + config.seed, row * 0.3);
        const noiseY = simplex2(col * 0.3 + 100, row * 0.3 + config.seed);
        cellX += noiseX * warpAmount * config.cellSize * 0.5;
        cellY += noiseY * warpAmount * config.cellSize * 0.5;
      }

      // Cell size also warps
      const sizeWarp = 1 + warpAmount * (simplex2(col * 0.5 + config.seed * 2, row * 0.5) * 0.3);
      const actualSize = config.cellSize * sizeWarp;

      // Skip cells that would be in heavy breakdown (random dropout)
      if (progress > config.breakdownStart && rng() < (progress - config.breakdownStart) * 1.5) {
        // Draw just a fragment — scratched out, incomplete
        if (rng() > 0.5) {
          ctx.save();
          ctx.setLineDash([2, 4]);
          ctx.globalAlpha = 0.3;
          ctx.strokeRect(cellX, cellY, actualSize, actualSize);
          ctx.restore();
        }
        continue;
      }

      // Draw cell border
      ctx.strokeStyle = '#000';
      ctx.lineWidth = progress > config.breakdownStart ? 0.3 + rng() * 0.5 : 0.5;
      ctx.globalAlpha = 1 - warpAmount * 0.3;
      ctx.strokeRect(cellX, cellY, actualSize, actualSize);

      // Draw organism inside cell
      const centerX = cellX + actualSize / 2;
      const centerY = cellY + actualSize / 2;
      const radius = actualSize * 0.38;

      ctx.fillStyle = '#000';
      ctx.strokeStyle = '#000';
      drawCellOrganism(ctx, centerX, centerY, radius, cellIndex + config.seed, rng, config.cellStyle);

      // Cell number annotation (pseudo-scientific label)
      if (actualSize > 15) {
        const label = generateCellLabel(cellIndex, rng);
        ctx.save();
        ctx.font = `${Math.max(5, actualSize * 0.12)}px monospace`;
        ctx.globalAlpha = 0.6 - warpAmount * 0.3;
        ctx.fillText(label, cellX + 2, cellY + actualSize - 2);
        ctx.restore();
      }
    }
  }

  // Grid title annotation
  ctx.save();
  ctx.font = '7px monospace';
  ctx.globalAlpha = 0.5;
  const title = generateGridTitle(config.seed, rng);
  ctx.fillText(title, config.x, config.y - 4);
  ctx.restore();

  ctx.restore();
}

/** Generate pseudo-scientific cell label */
function generateCellLabel(index: number, rng: () => number): string {
  const prefixes = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  const suffixes = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const prefix = prefixes[index % prefixes.length];
  const suffix = suffixes[Math.floor(rng() * suffixes.length)];
  return `${prefix}.${suffix}`;
}

/** Generate a pseudo-title for the grid section */
function generateGridTitle(seed: number, rng: () => number): string {
  const titles = [
    'TABULA SYSTEMATICA — SPECIMEN',
    'CATALOGUS FORMAE ORGANICAE',
    'INDEX MORPHOLOGICUS',
    'CLASSIFICATIO NATURALIS',
    'TYPUS CELLULARIS — SERIES',
    'ANATOMIA INVISIBILIS',
    'ATLAS MICROCOSMICUS',
    'NOMENCLATURA ARCANA',
  ];
  return titles[Math.floor(rng() * titles.length)] + ` §${(seed % 99) + 1}`;
}

/**
 * Draw cross-reference arrows between cells — connections between
 * things that should not be connected.
 */
export function drawCrossReferences(
  ctx: CanvasRenderingContext2D,
  config: TaxonomyGridConfig,
  numRefs: number
): void {
  const rng = createRng(config.seed + 999);

  ctx.save();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 0.4;
  ctx.globalAlpha = 0.35;
  ctx.setLineDash([1, 3]);

  for (let i = 0; i < numRefs; i++) {
    const col1 = Math.floor(rng() * config.cols);
    const row1 = Math.floor(rng() * config.rows);
    const col2 = Math.floor(rng() * config.cols);
    const row2 = Math.floor(rng() * config.rows);

    const x1 = config.x + col1 * (config.cellSize + config.padding) + config.cellSize / 2;
    const y1 = config.y + row1 * (config.cellSize + config.padding) + config.cellSize / 2;
    const x2 = config.x + col2 * (config.cellSize + config.padding) + config.cellSize / 2;
    const y2 = config.y + row2 * (config.cellSize + config.padding) + config.cellSize / 2;

    // Curved connection line
    const midX = (x1 + x2) / 2 + (rng() - 0.5) * 60;
    const midY = (y1 + y2) / 2 + (rng() - 0.5) * 60;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(midX, midY, x2, y2);
    ctx.stroke();

    // Numbered circle at connection point
    const circleX = midX;
    const circleY = midY;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(circleX, circleY, 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = '4px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';
    ctx.fillText(`${Math.floor(rng() * 99) + 1}`, circleX, circleY);
    ctx.setLineDash([1, 3]);
  }

  ctx.restore();
}
