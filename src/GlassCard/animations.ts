import { interpolate, spring, Easing } from 'remotion';
import type { PhaseState } from './types';

export function computePhase(
  frame: number,
  durationInFrames: number,
): { phase: 'enter' | 'hold' | 'settle'; progress: number } {
  const enterEnd = durationInFrames * 0.35;
  const holdEnd = durationInFrames * 0.9;
  const holdDuration = holdEnd - enterEnd;
  const settleDuration = durationInFrames - holdEnd;
  if (frame < enterEnd) {
    return { phase: 'enter', progress: Math.min(frame / enterEnd, 1) };
  }
  if (frame < holdEnd) {
    return { phase: 'hold', progress: Math.min((frame - enterEnd) / holdDuration, 1) };
  }
  return { phase: 'settle', progress: Math.min((frame - holdEnd) / settleDuration, 1) };
}

function ease() {
  return { easing: Easing.out(Easing.quad), extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
}

function enterState(p: number, dstX: number, dstY: number, fanAngle: number): PhaseState {
  const e = ease();
  return {
    x: interpolate(p, [0, 1], [960, dstX], e),
    y: interpolate(p, [0, 1], [540, dstY], e),
    scale: interpolate(p, [0, 1], [0.6, 1], e),
    rotateX: interpolate(p, [0, 1], [15, 0], e),
    rotateY: interpolate(p, [0, 1], [0, fanAngle], e),
    glowIntensity: interpolate(p, [0, 1], [0.2, 1], e),
    opacity: interpolate(p, [0, 0.2], [0, 1], { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const }),
  };
}

function holdState(cx: number, cy: number, fanAngle: number, f: number): PhaseState {
  return {
    x: cx, y: cy,
    scale: 1 + 0.005 * Math.sin((2 * Math.PI * f) / 100),
    rotateX: 1 * Math.sin((2 * Math.PI * f) / 120),
    rotateY: fanAngle,
    glowIntensity: 0.7 + 0.3 * Math.sin((2 * Math.PI * f) / 80),
    opacity: 1,
  };
}

function settleState(f: number, fps: number, dur: number, p: number, cx: number, cy: number, fanAngle: number): PhaseState {
  const s = spring({ frame: p * dur * 0.1, fps, config: { stiffness: 200, damping: 15, mass: 0.5 } });
  const h = holdState(cx, cy, fanAngle, f);
  return { ...h, scale: h.scale + (s - 1) * 0.01, rotateX: h.rotateX + (s - 1) * 0.5 };
}

export function getTitleAnimationState(frame: number, fps: number, durationInFrames: number): PhaseState {
  const { phase, progress } = computePhase(frame, durationInFrames);
  if (phase === 'enter') return enterState(progress, 960, 540, 0);
  if (phase === 'hold') return holdState(960, 540, 0, frame);
  return settleState(frame, fps, durationInFrames, progress, 960, 540, 0);
}

export function getShowcaseAnimationState(
  frame: number, fps: number, durationInFrames: number,
  delay: number, fanAngle: number, fanOffsetX: number, fanOffsetY: number,
): PhaseState {
  const ef = Math.max(0, frame - delay);
  const { phase, progress } = computePhase(ef, durationInFrames);
  const cx = 960 + fanOffsetX;
  const cy = 540 + fanOffsetY;
  if (phase === 'enter') return enterState(progress, cx, cy, fanAngle);
  if (phase === 'hold') return holdState(cx, cy, fanAngle, ef);
  return settleState(ef, fps, durationInFrames, progress, cx, cy, fanAngle);
}
