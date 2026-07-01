/**
 * Definition of a pixel sprite sheet: dimensions, color palette, pixel grid, and optional anchor points.
 *
 * - `grid`: A 2D array of numbers where 0 = transparent and positive values reference `palette` indices.
 * - `palette`: Maps palette index numbers (1, 2, 3, ...) to hex color strings (e.g. `"#FF00FF"`).
 * - `anchors`: Named reference points on the sprite (e.g. `"left-eye"`, `"mouth"`) for positioning facial features.
 */
export type PixelSpriteDef = {
  name: string;
  width: number;
  height: number;
  palette: Record<number, string>;
  grid: number[][];
  anchors?: Record<string, { x: number; y: number }>;
};

/**
 * A single facial-feature instance placed at a named anchor point.
 *
 * - `anchor`: References a key in `PixelSpriteDef.anchors`.
 * - `offset`: Optional pixel offset from the anchor's origin.
 * - `hidden`: When true the feature is not rendered (useful for toggling expressions).
 */
export type FacialFeatureVariant = {
  anchor: string;
  offset?: { dx: number; dy: number };
  hidden?: boolean;
};

/**
 * A named facial expression composed of zero or more feature variants.
 *
 * Each expression selectively overrides the sprite's facial features at
 * specific anchor points to produce a distinct look (e.g. "happy", "angry").
 */
export type FacialExpression = {
  name: string;
  features: FacialFeatureVariant[];
};

/**
 * A single particle in a pixel-art particle system.
 *
 * Position, velocity, remaining lifetime, and fill color are all tracked
 * per particle for deterministic update loops.
 */
export type PixelParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
};

/**
 * A named phase within a sprite animation sequence.
 *
 * - `start`: Normalised start time of the phase (0.0 – 1.0).
 * - `end`: Normalised end time of the phase (0.0 – 1.0).
 */
export type SpritePhase = {
  name: string;
  start: number;
  end: number;
};

/**
 * Runtime state tracking which animation phase is active and how far
 * through it the animation has progressed.
 */
export type PhaseState = {
  phase: string;
  progress: number;
};
