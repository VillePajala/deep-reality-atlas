/**
 * Flow fields — directional vector fields driven by noise.
 * Creates the organic, curving breakdown of rational systems.
 * This is the technique behind Tyler Hobbs' Fidenza.
 */

import { simplex2, fbm } from './noise';

export interface FlowFieldConfig {
  width: number;
  height: number;
  resolution: number;      // Grid cell size in pixels
  noiseScale: number;       // How zoomed-in the noise is (smaller = smoother)
  turbulence: number;       // Multiplier for angle variation (higher = more chaotic)
  offsetX: number;          // Noise offset for variation between instances
  offsetY: number;
  octaves: number;          // Noise complexity layers
}

export interface FlowField {
  config: FlowFieldConfig;
  cols: number;
  rows: number;
  angles: Float32Array;
}

export function createFlowField(config: FlowFieldConfig): FlowField {
  const cols = Math.ceil(config.width / config.resolution);
  const rows = Math.ceil(config.height / config.resolution);
  const angles = new Float32Array(cols * rows);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const nx = (x * config.noiseScale) + config.offsetX;
      const ny = (y * config.noiseScale) + config.offsetY;
      const angle = fbm(nx, ny, config.octaves) * Math.PI * config.turbulence;
      angles[x + y * cols] = angle;
    }
  }

  return { config, cols, rows, angles };
}

/** Get the flow angle at a world position */
export function getFlowAngle(field: FlowField, x: number, y: number): number {
  const col = Math.floor(x / field.config.resolution);
  const row = Math.floor(y / field.config.resolution);
  const cCol = Math.max(0, Math.min(col, field.cols - 1));
  const cRow = Math.max(0, Math.min(row, field.rows - 1));
  return field.angles[cCol + cRow * field.cols];
}

export interface FlowLine {
  points: { x: number; y: number }[];
}

/**
 * Trace a line through the flow field from a starting point.
 * The line follows the flow vectors, creating organic curves.
 */
export function traceFlowLine(
  field: FlowField,
  startX: number,
  startY: number,
  stepSize: number,
  maxSteps: number,
  bounds: { x: number; y: number; width: number; height: number }
): FlowLine {
  const points: { x: number; y: number }[] = [{ x: startX, y: startY }];
  let x = startX;
  let y = startY;

  for (let i = 0; i < maxSteps; i++) {
    const angle = getFlowAngle(field, x, y);
    x += Math.cos(angle) * stepSize;
    y += Math.sin(angle) * stepSize;

    // Stop if out of bounds
    if (x < bounds.x || x > bounds.x + bounds.width ||
        y < bounds.y || y > bounds.y + bounds.height) break;

    points.push({ x, y });
  }

  return { points };
}

/**
 * Draw flow lines with varying thickness — thicker where slow, thinner where fast.
 * Creates the ink-like quality of hand-drawn curves.
 */
export function drawFlowLines(
  ctx: CanvasRenderingContext2D,
  field: FlowField,
  bounds: { x: number; y: number; width: number; height: number },
  numLines: number,
  rng: () => number,
  options: {
    stepSize?: number;
    maxSteps?: number;
    minWidth?: number;
    maxWidth?: number;
    opacity?: number;
  } = {}
): FlowLine[] {
  const {
    stepSize = 2,
    maxSteps = 200,
    minWidth = 0.3,
    maxWidth = 2.5,
    opacity = 1,
  } = options;

  const lines: FlowLine[] = [];

  for (let i = 0; i < numLines; i++) {
    const startX = bounds.x + rng() * bounds.width;
    const startY = bounds.y + rng() * bounds.height;
    const line = traceFlowLine(field, startX, startY, stepSize, maxSteps, bounds);
    lines.push(line);

    if (line.points.length < 3) continue;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw with varying width
    for (let j = 1; j < line.points.length; j++) {
      const prev = line.points[j - 1];
      const curr = line.points[j];

      // Width varies along the line — thicker in middle, tapering at ends
      const t = j / line.points.length;
      const taper = Math.sin(t * Math.PI);
      const widthNoise = 0.7 + 0.3 * simplex2(curr.x * 0.02, curr.y * 0.02);
      const width = minWidth + (maxWidth - minWidth) * taper * widthNoise;

      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(curr.x, curr.y);
      ctx.lineWidth = width;
      ctx.stroke();
    }

    ctx.restore();
  }

  return lines;
}
