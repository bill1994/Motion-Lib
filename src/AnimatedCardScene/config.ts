export interface MotionTimelineConfig {
  introDuration: number;
  holdDuration: number;
  outroDuration: number;
}

import type { EntranceStyle } from './types';

export interface MotionCardConfig {
  breathingAmplitude: number;
  breathingCycle: number;
  rotateYStart: number;
  entranceStyle: EntranceStyle;
}

export interface MotionParticleConfig {
  count: number;
  gravity: number;
  drag: number;
  minSpeed: number;
  maxSpeed: number;
  minSize: number;
  maxSize: number;
  fadeDuration: number;
}

export interface MotionConfig {
  timeline: MotionTimelineConfig;
  card: MotionCardConfig;
  particle: MotionParticleConfig;
}

export const DEFAULT_MOTION_CONFIG: MotionConfig = {
  timeline: {
    introDuration: 40,
    holdDuration: 100,
    outroDuration: 35,
  },
  card: {
    breathingAmplitude: 10,
    breathingCycle: 50,
    rotateYStart: 360,
    entranceStyle: 'default',
  },
  particle: {
    count: 70,
    gravity: 0.3,
    drag: 0.95,
    minSpeed: 7.2,
    maxSpeed: 22.5,
    minSize: 7.2,
    maxSize: 21.6,
    fadeDuration: 45,
  },
};

export type PartialMotionConfig = {
  [K in keyof MotionConfig]?: Partial<MotionConfig[K]>;
};

export function mergeConfig(
  overrides?: PartialMotionConfig,
): MotionConfig {
  if (!overrides) {
    return { ...DEFAULT_MOTION_CONFIG };
  }

  return {
    timeline: {
      ...DEFAULT_MOTION_CONFIG.timeline,
      ...(overrides.timeline || {}),
    },
    card: {
      ...DEFAULT_MOTION_CONFIG.card,
      ...(overrides.card || {}),
    },
    particle: {
      ...DEFAULT_MOTION_CONFIG.particle,
      ...(overrides.particle || {}),
    },
  };
}
