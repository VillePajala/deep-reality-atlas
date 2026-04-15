/**
 * Space Colonization Algorithm — branching networks.
 * Creates neural/vascular/mycelial networks.
 * The signature organic structure connecting all of Deep Reality.
 */

interface Attractor {
  x: number;
  y: number;
  active: boolean;
}

interface BranchNode {
  x: number;
  y: number;
  parent: number;  // Index of parent node (-1 for root)
  depth: number;
}

export interface BranchNetwork {
  nodes: BranchNode[];
}

/**
 * Generate a branching network using space colonization.
 */
export function generateBranching(
  bounds: { x: number; y: number; width: number; height: number },
  rootX: number,
  rootY: number,
  numAttractors: number,
  influenceRadius: number,
  killRadius: number,
  stepSize: number,
  maxIterations: number,
  seed: number
): BranchNetwork {
  let s = seed;
  const rng = () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };

  // Create random attractors within bounds
  const attractors: Attractor[] = [];
  for (let i = 0; i < numAttractors; i++) {
    attractors.push({
      x: bounds.x + rng() * bounds.width,
      y: bounds.y + rng() * bounds.height,
      active: true,
    });
  }

  const nodes: BranchNode[] = [{ x: rootX, y: rootY, parent: -1, depth: 0 }];

  for (let iter = 0; iter < maxIterations; iter++) {
    // For each active attractor, find the closest node
    const closestNode: Map<number, { dx: number; dy: number; count: number }> = new Map();

    for (let ai = attractors.length - 1; ai >= 0; ai--) {
      const a = attractors[ai];
      if (!a.active) continue;

      let minDist = Infinity;
      let minIdx = -1;

      for (let ni = 0; ni < nodes.length; ni++) {
        const n = nodes[ni];
        const dx = a.x - n.x;
        const dy = a.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < killRadius) {
          a.active = false;
          break;
        }

        if (dist < influenceRadius && dist < minDist) {
          minDist = dist;
          minIdx = ni;
        }
      }

      if (!a.active || minIdx === -1) continue;

      const dx = a.x - nodes[minIdx].x;
      const dy = a.y - nodes[minIdx].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (!closestNode.has(minIdx)) {
        closestNode.set(minIdx, { dx: 0, dy: 0, count: 0 });
      }
      const entry = closestNode.get(minIdx)!;
      entry.dx += dx / dist;
      entry.dy += dy / dist;
      entry.count++;
    }

    // Grow new nodes
    let grew = false;
    for (const [nodeIdx, dir] of closestNode) {
      const len = Math.sqrt(dir.dx * dir.dx + dir.dy * dir.dy);
      if (len === 0) continue;

      const nx = nodes[nodeIdx].x + (dir.dx / len) * stepSize;
      const ny = nodes[nodeIdx].y + (dir.dy / len) * stepSize;

      // Check bounds
      if (nx < bounds.x || nx > bounds.x + bounds.width ||
          ny < bounds.y || ny > bounds.y + bounds.height) continue;

      nodes.push({
        x: nx,
        y: ny,
        parent: nodeIdx,
        depth: nodes[nodeIdx].depth + 1,
      });
      grew = true;
    }

    if (!grew) break;
    // Remove depleted attractors
    if (attractors.filter(a => a.active).length === 0) break;
  }

  return { nodes };
}

/**
 * Draw a branching network with varying thickness based on depth.
 * Deeper branches are thinner — like real vascular/neural networks.
 */
export function drawBranching(
  ctx: CanvasRenderingContext2D,
  network: BranchNetwork,
  maxWidth: number = 2.5,
  minWidth: number = 0.2,
  opacity: number = 0.6
): void {
  if (network.nodes.length === 0) return;

  const maxDepth = Math.max(...network.nodes.map(n => n.depth));

  ctx.save();
  ctx.strokeStyle = '#000';
  ctx.lineCap = 'round';
  ctx.globalAlpha = opacity;

  for (let i = 1; i < network.nodes.length; i++) {
    const node = network.nodes[i];
    if (node.parent < 0) continue;
    const parent = network.nodes[node.parent];

    const depthRatio = node.depth / (maxDepth || 1);
    const width = maxWidth - (maxWidth - minWidth) * depthRatio;

    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(parent.x, parent.y);
    ctx.lineTo(node.x, node.y);
    ctx.stroke();
  }

  // Draw small dots at terminal nodes (leaf nodes)
  const childCount = new Map<number, number>();
  for (const node of network.nodes) {
    if (node.parent >= 0) {
      childCount.set(node.parent, (childCount.get(node.parent) || 0) + 1);
    }
  }

  ctx.fillStyle = '#000';
  for (let i = 0; i < network.nodes.length; i++) {
    if (!childCount.has(i)) {
      // Terminal node — draw dot
      const node = network.nodes[i];
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}
