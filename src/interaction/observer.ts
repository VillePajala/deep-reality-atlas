/**
 * Observer Effect — the viewer's presence disrupts the systems.
 *
 * Kvanttihippa as interaction design:
 * The observer literally changes the observed.
 *
 * - Mouse proximity causes taxonomy grid lines to warp
 * - Movement speed increases entropy locally
 * - Stillness allows systems to re-stabilize
 * - The void pulses and breathes with time
 */

export interface ObserverState {
  mouseX: number;
  mouseY: number;
  prevMouseX: number;
  prevMouseY: number;
  velocity: number;
  smoothVelocity: number;
  time: number;
  isActive: boolean;          // Is the mouse/touch in the canvas
  localEntropy: number;       // 0-1 entropy increase from observer
  influenceRadius: number;    // How far the observer's effect reaches
  breathPhase: number;        // Cyclic breathing of the void
}

export function createObserverState(): ObserverState {
  return {
    mouseX: 0,
    mouseY: 0,
    prevMouseX: 0,
    prevMouseY: 0,
    velocity: 0,
    smoothVelocity: 0,
    time: 0,
    isActive: false,
    localEntropy: 0,
    influenceRadius: 150,
    breathPhase: 0,
  };
}

export function updateObserver(state: ObserverState, dt: number): void {
  // Calculate velocity
  const dx = state.mouseX - state.prevMouseX;
  const dy = state.mouseY - state.prevMouseY;
  state.velocity = Math.sqrt(dx * dx + dy * dy);
  state.smoothVelocity = state.smoothVelocity * 0.9 + state.velocity * 0.1;

  // Local entropy increases with movement, decays when still
  if (state.isActive) {
    const targetEntropy = Math.min(1, state.smoothVelocity / 20);
    state.localEntropy = state.localEntropy * 0.95 + targetEntropy * 0.05;
  } else {
    state.localEntropy *= 0.98;
  }

  // Breathing cycle
  state.breathPhase += dt * 0.0005;

  // Time marches forward
  state.time += dt;

  // Store previous position
  state.prevMouseX = state.mouseX;
  state.prevMouseY = state.mouseY;
}

/**
 * Get the observer's influence at a given point.
 * Returns 0-1 where 1 is maximum disruption.
 */
export function getObserverInfluence(
  state: ObserverState,
  x: number,
  y: number
): number {
  if (!state.isActive && state.localEntropy < 0.01) return 0;

  const dx = x - state.mouseX;
  const dy = y - state.mouseY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const radius = state.influenceRadius * (1 + state.localEntropy);

  if (dist > radius) return 0;

  const falloff = 1 - (dist / radius);
  return falloff * falloff * state.localEntropy;
}

/**
 * Get the void's breath factor — cyclic expansion/contraction.
 */
export function getBreathFactor(state: ObserverState): number {
  return 1 + Math.sin(state.breathPhase) * 0.05;
}

/**
 * Draw the observer's disruption field — visible ripples around the cursor.
 * Subtle concentric rings that distort the underlying art.
 */
export function drawObserverField(
  ctx: CanvasRenderingContext2D,
  state: ObserverState
): void {
  if (!state.isActive || state.localEntropy < 0.01) return;

  ctx.save();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 0.3;

  const numRings = 3 + Math.floor(state.localEntropy * 5);
  const maxRadius = state.influenceRadius * (1 + state.localEntropy);

  for (let i = 0; i < numRings; i++) {
    const t = (i + 1) / (numRings + 1);
    const radius = maxRadius * t;
    const alpha = (1 - t) * state.localEntropy * 0.15;

    ctx.globalAlpha = alpha;
    ctx.beginPath();

    // Slightly wobbly ring
    for (let a = 0; a <= Math.PI * 2; a += 0.1) {
      const wobble = Math.sin(a * 5 + state.time * 0.003 + i) * radius * 0.05;
      const r = radius + wobble;
      const px = state.mouseX + Math.cos(a) * r;
      const py = state.mouseY + Math.sin(a) * r;
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }

  ctx.restore();
}
