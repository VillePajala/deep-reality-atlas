/**
 * Theme Visual Profiles — each of the 20 themes gets a visual identity
 * that parameterizes the shared rendering engine.
 *
 * These are DATA, not renderers. They tune existing drawing functions
 * to produce visually distinct pages per theme.
 */

export type CellStyle = 'organic' | 'geometric' | 'linear' | 'radial' | 'fragmented';
export type SymbolType = 'default' | 'ouroboros' | 'eye' | 'meridian' | 'binary' | 'compass' | 'wave' | 'spiral' | 'rune';

export interface GeometryWeight {
  type: 'flower-of-life' | 'vesica' | 'pentagram' | 'concentric' | 'ouroboros' | 'wave' | 'grid-glitch' | 'compass-rose' | 'spiral' | 'concentric-spheres' | 'meridian-curve' | 'hourglass' | 'planetary';
  weight: number;
}

export interface ThemeVisualProfile {
  cellStyle: CellStyle;
  geometryShapes: GeometryWeight[];
  symbolType: SymbolType;
  layerWeights: {
    contourDensity: number;
    branchingDensity: number;
    flowFieldTurbulence: number;
    voidSize: number;
    stippleDensity: number;
    reactionDiffusion: number;
  };
}

const defaultLayerWeights = {
  contourDensity: 1,
  branchingDensity: 1,
  flowFieldTurbulence: 1,
  voidSize: 1,
  stippleDensity: 1,
  reactionDiffusion: 1,
};

const profiles: Record<string, ThemeVisualProfile> = {
  numinous: {
    cellStyle: 'organic',
    geometryShapes: [
      { type: 'flower-of-life', weight: 3 },
      { type: 'vesica', weight: 2 },
      { type: 'concentric', weight: 2 },
      { type: 'concentric-spheres', weight: 1 },
    ],
    symbolType: 'default',
    layerWeights: { ...defaultLayerWeights, stippleDensity: 1.5, voidSize: 1.2 },
  },

  jung: {
    cellStyle: 'organic',
    geometryShapes: [
      { type: 'concentric-spheres', weight: 3 },
      { type: 'vesica', weight: 2 },
      { type: 'spiral', weight: 2 },
      { type: 'flower-of-life', weight: 1 },
    ],
    symbolType: 'eye',
    layerWeights: { ...defaultLayerWeights, voidSize: 1.5, branchingDensity: 0.7 },
  },

  alchemy: {
    cellStyle: 'radial',
    geometryShapes: [
      { type: 'ouroboros', weight: 3 },
      { type: 'planetary', weight: 3 },
      { type: 'concentric', weight: 2 },
      { type: 'vesica', weight: 1 },
    ],
    symbolType: 'ouroboros',
    layerWeights: { ...defaultLayerWeights, contourDensity: 1.3, reactionDiffusion: 1.4 },
  },

  gnosis: {
    cellStyle: 'fragmented',
    geometryShapes: [
      { type: 'concentric-spheres', weight: 4 },
      { type: 'pentagram', weight: 2 },
      { type: 'vesica', weight: 1 },
    ],
    symbolType: 'eye',
    layerWeights: { ...defaultLayerWeights, voidSize: 1.6, stippleDensity: 1.4, branchingDensity: 0.5 },
  },

  bardo: {
    cellStyle: 'fragmented',
    geometryShapes: [
      { type: 'concentric-spheres', weight: 3 },
      { type: 'spiral', weight: 2 },
      { type: 'concentric', weight: 2 },
    ],
    symbolType: 'spiral',
    layerWeights: { ...defaultLayerWeights, flowFieldTurbulence: 1.5, voidSize: 1.3, stippleDensity: 0.7 },
  },

  sunyata: {
    cellStyle: 'fragmented',
    geometryShapes: [
      { type: 'concentric-spheres', weight: 3 },
      { type: 'concentric', weight: 3 },
      { type: 'vesica', weight: 1 },
    ],
    symbolType: 'default',
    layerWeights: { ...defaultLayerWeights, voidSize: 2, stippleDensity: 0.4, branchingDensity: 0.3, reactionDiffusion: 0.5 },
  },

  consciousness: {
    cellStyle: 'organic',
    geometryShapes: [
      { type: 'spiral', weight: 4 },
      { type: 'concentric-spheres', weight: 2 },
      { type: 'flower-of-life', weight: 1 },
    ],
    symbolType: 'eye',
    layerWeights: { ...defaultLayerWeights, branchingDensity: 1.6, flowFieldTurbulence: 1.3 },
  },

  outsider: {
    cellStyle: 'organic',
    geometryShapes: [
      { type: 'flower-of-life', weight: 2 },
      { type: 'pentagram', weight: 2 },
      { type: 'spiral', weight: 2 },
      { type: 'concentric', weight: 1 },
      { type: 'planetary', weight: 1 },
    ],
    symbolType: 'rune',
    layerWeights: { ...defaultLayerWeights, stippleDensity: 1.8, branchingDensity: 1.4, reactionDiffusion: 1.3 },
  },

  horror: {
    cellStyle: 'fragmented',
    geometryShapes: [
      { type: 'pentagram', weight: 3 },
      { type: 'concentric-spheres', weight: 2 },
      { type: 'spiral', weight: 2 },
    ],
    symbolType: 'eye',
    layerWeights: { ...defaultLayerWeights, voidSize: 1.8, stippleDensity: 1.6, flowFieldTurbulence: 1.5, branchingDensity: 0.4 },
  },

  hermetic: {
    cellStyle: 'radial',
    geometryShapes: [
      { type: 'planetary', weight: 4 },
      { type: 'flower-of-life', weight: 2 },
      { type: 'vesica', weight: 2 },
      { type: 'concentric', weight: 1 },
    ],
    symbolType: 'ouroboros',
    layerWeights: { ...defaultLayerWeights, contourDensity: 1.2, reactionDiffusion: 1.2 },
  },

  demiurge: {
    cellStyle: 'geometric',
    geometryShapes: [
      { type: 'concentric-spheres', weight: 3 },
      { type: 'grid-glitch', weight: 3 },
      { type: 'pentagram', weight: 1 },
    ],
    symbolType: 'eye',
    layerWeights: { ...defaultLayerWeights, voidSize: 1.7, contourDensity: 0.5, branchingDensity: 0.6, stippleDensity: 1.5 },
  },

  tcm: {
    cellStyle: 'linear',
    geometryShapes: [
      { type: 'meridian-curve', weight: 4 },
      { type: 'concentric', weight: 2 },
      { type: 'spiral', weight: 1 },
    ],
    symbolType: 'meridian',
    layerWeights: { ...defaultLayerWeights, flowFieldTurbulence: 1.6, branchingDensity: 1.5, contourDensity: 1.3, reactionDiffusion: 0.5 },
  },

  sound: {
    cellStyle: 'linear',
    geometryShapes: [
      { type: 'wave', weight: 4 },
      { type: 'concentric', weight: 3 },
      { type: 'spiral', weight: 1 },
    ],
    symbolType: 'wave',
    layerWeights: { ...defaultLayerWeights, flowFieldTurbulence: 1.8, contourDensity: 1.5, branchingDensity: 0.3, stippleDensity: 0.6 },
  },

  pkd: {
    cellStyle: 'geometric',
    geometryShapes: [
      { type: 'grid-glitch', weight: 3 },
      { type: 'concentric-spheres', weight: 2 },
      { type: 'pentagram', weight: 1 },
      { type: 'spiral', weight: 1 },
    ],
    symbolType: 'eye',
    layerWeights: { ...defaultLayerWeights, voidSize: 1.5, reactionDiffusion: 1.5, stippleDensity: 1.3 },
  },

  dreams: {
    cellStyle: 'organic',
    geometryShapes: [
      { type: 'spiral', weight: 3 },
      { type: 'concentric-spheres', weight: 2 },
      { type: 'flower-of-life', weight: 1 },
      { type: 'vesica', weight: 1 },
    ],
    symbolType: 'spiral',
    layerWeights: { ...defaultLayerWeights, flowFieldTurbulence: 1.4, contourDensity: 1.2, voidSize: 1.1 },
  },

  cartography: {
    cellStyle: 'linear',
    geometryShapes: [
      { type: 'compass-rose', weight: 4 },
      { type: 'concentric', weight: 2 },
      { type: 'spiral', weight: 1 },
    ],
    symbolType: 'compass',
    layerWeights: { ...defaultLayerWeights, contourDensity: 2, branchingDensity: 0.5, flowFieldTurbulence: 0.7, stippleDensity: 0.5 },
  },

  time: {
    cellStyle: 'radial',
    geometryShapes: [
      { type: 'spiral', weight: 4 },
      { type: 'hourglass', weight: 3 },
      { type: 'concentric', weight: 2 },
    ],
    symbolType: 'spiral',
    layerWeights: { ...defaultLayerWeights, contourDensity: 1.4, flowFieldTurbulence: 1.2 },
  },

  simulation: {
    cellStyle: 'geometric',
    geometryShapes: [
      { type: 'grid-glitch', weight: 4 },
      { type: 'concentric', weight: 1 },
      { type: 'spiral', weight: 1 },
    ],
    symbolType: 'binary',
    layerWeights: { ...defaultLayerWeights, reactionDiffusion: 1.8, contourDensity: 0.4, flowFieldTurbulence: 0.5, branchingDensity: 1.3 },
  },

  metatext: {
    cellStyle: 'geometric',
    geometryShapes: [
      { type: 'grid-glitch', weight: 3 },
      { type: 'concentric-spheres', weight: 2 },
      { type: 'spiral', weight: 2 },
    ],
    symbolType: 'default',
    layerWeights: { ...defaultLayerWeights, stippleDensity: 0.8, reactionDiffusion: 1.2 },
  },

  glossolalia: {
    cellStyle: 'organic',
    geometryShapes: [
      { type: 'wave', weight: 2 },
      { type: 'spiral', weight: 2 },
      { type: 'flower-of-life', weight: 1 },
      { type: 'concentric', weight: 1 },
    ],
    symbolType: 'rune',
    layerWeights: { ...defaultLayerWeights, stippleDensity: 1.5, flowFieldTurbulence: 1.4, branchingDensity: 1.2 },
  },
};

const fallback: ThemeVisualProfile = {
  cellStyle: 'organic',
  geometryShapes: [
    { type: 'flower-of-life', weight: 1 },
    { type: 'vesica', weight: 1 },
    { type: 'pentagram', weight: 1 },
    { type: 'concentric', weight: 1 },
  ],
  symbolType: 'default',
  layerWeights: defaultLayerWeights,
};

export function getVisualProfile(themeId: string): ThemeVisualProfile {
  return profiles[themeId] || fallback;
}
