/**
 * Reaction-Diffusion — Gray-Scott model.
 * Produces Turing patterns: organic spots, stripes, labyrinths, mitosis.
 * These create the living, breathing texture within cells and membranes.
 */

export interface RDConfig {
  width: number;
  height: number;
  feed: number;      // Feed rate (0.01 - 0.1) — controls pattern type
  kill: number;      // Kill rate (0.045 - 0.07) — controls pattern type
  dA: number;        // Diffusion rate of chemical A
  dB: number;        // Diffusion rate of chemical B
  iterations: number; // Simulation steps
}

export interface RDField {
  a: Float32Array;
  b: Float32Array;
  width: number;
  height: number;
}

// Pattern presets — different visual results
export const RD_PRESETS = {
  mitosis:    { feed: 0.0367, kill: 0.0649 },
  coral:      { feed: 0.0545, kill: 0.062  },
  maze:       { feed: 0.029,  kill: 0.057  },
  holes:      { feed: 0.039,  kill: 0.058  },
  worms:      { feed: 0.046,  kill: 0.063  },
  spots:      { feed: 0.035,  kill: 0.065  },
  fingerprint:{ feed: 0.055,  kill: 0.062  },
} as const;

export function createRDField(width: number, height: number): RDField {
  const size = width * height;
  const a = new Float32Array(size).fill(1);
  const b = new Float32Array(size).fill(0);

  // Seed with random droplets of chemical B
  for (let i = 0; i < 15; i++) {
    const cx = Math.floor(Math.random() * width);
    const cy = Math.floor(Math.random() * height);
    const r = 3 + Math.floor(Math.random() * 8);
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy <= r * r) {
          const px = ((cx + dx) % width + width) % width;
          const py = ((cy + dy) % height + height) % height;
          b[px + py * width] = 1;
        }
      }
    }
  }

  return { a, b, width, height };
}

function laplacian(grid: Float32Array, x: number, y: number, w: number, h: number): number {
  const idx = x + y * w;
  const left  = ((x - 1 + w) % w) + y * w;
  const right = ((x + 1) % w) + y * w;
  const up    = x + ((y - 1 + h) % h) * w;
  const down  = x + ((y + 1) % h) * w;

  return grid[left] + grid[right] + grid[up] + grid[down] - 4 * grid[idx];
}

export function simulateRD(field: RDField, config: RDConfig): void {
  const { width, height } = field;
  const { feed, kill, dA, dB } = config;
  const size = width * height;
  const dt = 1.0;

  const nextA = new Float32Array(size);
  const nextB = new Float32Array(size);

  for (let iter = 0; iter < config.iterations; iter++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = x + y * width;
        const a = field.a[idx];
        const b = field.b[idx];
        const abb = a * b * b;

        nextA[idx] = a + (dA * laplacian(field.a, x, y, width, height) - abb + feed * (1 - a)) * dt;
        nextB[idx] = b + (dB * laplacian(field.b, x, y, width, height) + abb - (kill + feed) * b) * dt;

        nextA[idx] = Math.max(0, Math.min(1, nextA[idx]));
        nextB[idx] = Math.max(0, Math.min(1, nextB[idx]));
      }
    }

    field.a.set(nextA);
    field.b.set(nextB);
  }
}

/**
 * Render reaction-diffusion field as stippled ink texture.
 * Chemical B concentration drives ink density.
 */
export function drawRDField(
  ctx: CanvasRenderingContext2D,
  field: RDField,
  x: number,
  y: number,
  scale: number,
  opacity: number = 0.7
): void {
  ctx.save();
  ctx.fillStyle = '#000';

  for (let fy = 0; fy < field.height; fy++) {
    for (let fx = 0; fx < field.width; fx++) {
      const b = field.b[fx + fy * field.width];
      if (b > 0.15) {
        const intensity = (b - 0.15) / 0.85;
        ctx.globalAlpha = intensity * opacity;
        const px = x + fx * scale;
        const py = y + fy * scale;
        const dotSize = scale * 0.4 * intensity + 0.2;
        ctx.beginPath();
        ctx.arc(px, py, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}
