/**
 * Pseudo-script systems — three invented writing systems.
 *
 * Script A: "Flowing" — cursive, Arabic/Tibetan-like. Used for annotations.
 * Script B: "Angular" — runic/cuneiform-like. Used for labels.
 * Script C: "Pictographic" — symbolic/diagrammatic. Used for diagrams.
 *
 * These must feel consistent within each piece, as if they mean something.
 */

interface Glyph {
  draw: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => void;
}

function createRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Script A: Flowing — connected curves, descenders, ligatures
function createFlowingGlyphs(rng: () => number): Glyph[] {
  const glyphs: Glyph[] = [];
  for (let i = 0; i < 24; i++) {
    const a1 = rng() * Math.PI * 2;
    const a2 = rng() * Math.PI * 2;
    const h = 0.3 + rng() * 0.7;
    const hasDescender = rng() > 0.7;
    const hasDot = rng() > 0.6;

    glyphs.push({
      draw: (ctx, x, y, size) => {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(
          x + size * 0.5 * Math.cos(a1),
          y - size * h,
          x + size * 0.8,
          y - size * 0.1
        );
        if (hasDescender) {
          ctx.quadraticCurveTo(
            x + size * 0.9,
            y + size * 0.4,
            x + size * (0.6 + rng() * 0.3),
            y + size * 0.3
          );
        }
        ctx.stroke();
        if (hasDot) {
          ctx.beginPath();
          ctx.arc(x + size * 0.4, y - size * (h + 0.15), size * 0.06, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
  }
  return glyphs;
}

// Script B: Angular — straight lines, sharp angles, runic
function createAngularGlyphs(rng: () => number): Glyph[] {
  const glyphs: Glyph[] = [];
  for (let i = 0; i < 20; i++) {
    const numStrokes = 2 + Math.floor(rng() * 3);
    const strokes: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let s = 0; s < numStrokes; s++) {
      strokes.push({
        x1: rng() * 0.8,
        y1: rng(),
        x2: rng() * 0.8,
        y2: rng(),
      });
    }

    glyphs.push({
      draw: (ctx, x, y, size) => {
        for (const s of strokes) {
          ctx.beginPath();
          ctx.moveTo(x + s.x1 * size, y - s.y1 * size);
          ctx.lineTo(x + s.x2 * size, y - s.y2 * size);
          ctx.stroke();
        }
      }
    });
  }
  return glyphs;
}

// Script C: Pictographic — small symbols, circles, arrows, dots
function createPictographicGlyphs(rng: () => number): Glyph[] {
  const glyphs: Glyph[] = [];
  const types = ['circle', 'triangle', 'cross', 'arrow', 'dot-cluster', 'wave', 'eye', 'spiral'];

  for (const type of types) {
    glyphs.push({
      draw: (ctx, x, y, size) => {
        const s = size * 0.7;
        const cx = x + s / 2;
        const cy = y - s / 2;
        ctx.beginPath();

        switch (type) {
          case 'circle':
            ctx.arc(cx, cy, s * 0.35, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(cx, cy, s * 0.1, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'triangle':
            ctx.moveTo(cx, cy - s * 0.4);
            ctx.lineTo(cx - s * 0.3, cy + s * 0.3);
            ctx.lineTo(cx + s * 0.3, cy + s * 0.3);
            ctx.closePath();
            ctx.stroke();
            break;
          case 'cross':
            ctx.moveTo(cx - s * 0.3, cy);
            ctx.lineTo(cx + s * 0.3, cy);
            ctx.moveTo(cx, cy - s * 0.3);
            ctx.lineTo(cx, cy + s * 0.3);
            ctx.stroke();
            break;
          case 'arrow':
            ctx.moveTo(cx - s * 0.3, cy);
            ctx.lineTo(cx + s * 0.3, cy);
            ctx.lineTo(cx + s * 0.15, cy - s * 0.15);
            ctx.moveTo(cx + s * 0.3, cy);
            ctx.lineTo(cx + s * 0.15, cy + s * 0.15);
            ctx.stroke();
            break;
          case 'dot-cluster':
            for (let d = 0; d < 5; d++) {
              ctx.beginPath();
              ctx.arc(cx + (rng() - 0.5) * s * 0.5, cy + (rng() - 0.5) * s * 0.5, s * 0.05, 0, Math.PI * 2);
              ctx.fill();
            }
            break;
          case 'wave':
            ctx.moveTo(cx - s * 0.3, cy);
            for (let w = 0; w <= 6; w++) {
              const wx = cx - s * 0.3 + (w / 6) * s * 0.6;
              const wy = cy + Math.sin(w * 1.5) * s * 0.15;
              ctx.lineTo(wx, wy);
            }
            ctx.stroke();
            break;
          case 'eye':
            ctx.ellipse(cx, cy, s * 0.3, s * 0.15, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(cx, cy, s * 0.08, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'spiral':
            for (let a = 0; a < Math.PI * 4; a += 0.2) {
              const sr = a * s * 0.025;
              const sx = cx + Math.cos(a) * sr;
              const sy = cy + Math.sin(a) * sr;
              if (a === 0) ctx.moveTo(sx, sy);
              else ctx.lineTo(sx, sy);
            }
            ctx.stroke();
            break;
        }
      }
    });
  }
  return glyphs;
}

export interface ScriptSystem {
  flowing: Glyph[];
  angular: Glyph[];
  pictographic: Glyph[];
}

export function createScriptSystem(seed: number): ScriptSystem {
  return {
    flowing: createFlowingGlyphs(createRng(seed)),
    angular: createAngularGlyphs(createRng(seed + 1000)),
    pictographic: createPictographicGlyphs(createRng(seed + 2000)),
  };
}

/**
 * Write a line of pseudo-text using a specified script.
 */
export function writeText(
  ctx: CanvasRenderingContext2D,
  script: Glyph[],
  x: number,
  y: number,
  length: number,
  charSize: number,
  spacing: number,
  rng: () => number
): void {
  ctx.save();
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = '#000';
  ctx.fillStyle = '#000';

  let curX = x;
  for (let i = 0; i < length; i++) {
    const glyph = script[Math.floor(rng() * script.length)];
    const sizeVariation = charSize * (0.8 + rng() * 0.4);
    glyph.draw(ctx, curX, y, sizeVariation);
    curX += sizeVariation + spacing * (0.5 + rng() * 1);

    // Occasional word space
    if (rng() > 0.8) curX += charSize * 0.5;
  }

  ctx.restore();
}

/**
 * Write a block of pseudo-text — multiple lines like a manuscript page.
 * Now mixes real corpus text with invented glyphs.
 */
export function writeTextBlock(
  ctx: CanvasRenderingContext2D,
  scripts: ScriptSystem,
  x: number,
  y: number,
  width: number,
  numLines: number,
  charSize: number,
  seed: number,
  realTexts?: string[]
): void {
  const rng = createRng(seed);
  const lineHeight = charSize * 1.8;

  for (let line = 0; line < numLines; line++) {
    const currentY = y + line * lineHeight;

    // Alternate between real corpus text and pseudo-script
    if (realTexts && realTexts.length > 0 && rng() > 0.35) {
      // Real text line — from the Holy Book of Insanity
      const text = realTexts[Math.floor(rng() * realTexts.length)];
      writeRealText(ctx, text, x, currentY, width, charSize, rng);
    } else {
      // Pseudo-script line
      const scriptChoice = rng() > 0.5 ? scripts.angular : scripts.flowing;
      const charsPerLine = Math.floor(width / (charSize * 1.2));
      writeText(ctx, scriptChoice, x, currentY, charsPerLine, charSize, charSize * 0.3, rng);
    }
  }
}

/**
 * Render real text in a hand-drawn style — slight wobble, ink variation.
 */
export function writeRealText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  size: number,
  rng: () => number
): void {
  ctx.save();
  ctx.font = `${size}px monospace`;
  ctx.fillStyle = '#000';
  ctx.globalAlpha = 0.4 + rng() * 0.4;

  // Truncate to fit width
  const charWidth = size * 0.62;
  const maxChars = Math.floor(maxWidth / charWidth);
  const displayText = text.length > maxChars ? text.slice(0, maxChars) : text;

  // Draw each character with slight positional wobble for hand-drawn feel
  let curX = x;
  for (let i = 0; i < displayText.length; i++) {
    const wobbleX = (rng() - 0.5) * size * 0.08;
    const wobbleY = (rng() - 0.5) * size * 0.12;
    const wobbleSize = size * (0.92 + rng() * 0.16);
    ctx.font = `${wobbleSize}px monospace`;
    ctx.globalAlpha = 0.35 + rng() * 0.45;
    ctx.fillText(displayText[i], curX + wobbleX, y + wobbleY);
    curX += charWidth * (0.85 + rng() * 0.3);
  }

  ctx.restore();
}

/**
 * Draw marginalia — annotations along the edges of the page,
 * like a scholar's notes on a document they can't stop studying.
 */
export function drawMarginalia(
  ctx: CanvasRenderingContext2D,
  scripts: ScriptSystem,
  width: number,
  height: number,
  seed: number
): void {
  const rng = createRng(seed + 777);

  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 0.3;

  // Right edge — flowing script, vertical
  ctx.save();
  ctx.translate(width - 15, 30);
  ctx.rotate(Math.PI / 2);
  const rightLength = Math.floor(height * 0.7 / 8);
  writeText(ctx, scripts.flowing, 0, 0, rightLength, 6, 2, rng);
  ctx.restore();

  // Bottom edge — angular script, like a colophon
  writeText(ctx, scripts.angular, 20, height - 12, Math.floor(width * 0.5 / 7), 5, 2, rng);

  // Top-right corner — page number in pictographic
  writeText(ctx, scripts.pictographic, width - 60, 15, 4, 8, 3, rng);

  ctx.restore();
}
