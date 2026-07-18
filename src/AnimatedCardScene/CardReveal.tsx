import React from 'react';
import { interpolate, spring, Easing } from 'remotion';
import type { MotionConfig } from './config';
import type { PhaseInfo } from './types';

interface CardRevealProps {
  children?: React.ReactNode;
  startX: number;
  startY: number;
  config: MotionConfig;
  width: number;
  height: number;
  frame: number;
  fps: number;
  cardWidth?: number;
  cardHeight?: number;
  borderRadius?: number;
  backgroundColor?: string;
  boxShadow?: string;
}

function computePhase(frame: number, config: MotionConfig): PhaseInfo {
  const { introDuration, holdDuration, outroDuration } = config.timeline;
  if (frame < introDuration) {
    return { phase: 'intro', progress: frame / introDuration };
  }
  if (frame < introDuration + holdDuration) {
    return { phase: 'hold', progress: (frame - introDuration) / holdDuration };
  }
  const outroFrame = Math.min(frame - introDuration - holdDuration, outroDuration);
  return { phase: 'outro', progress: outroDuration > 0 ? outroFrame / outroDuration : 1 };
}

const CardReveal: React.FC<CardRevealProps> = ({
  children,
  startX,
  startY,
  config,
  width,
  height,
  frame,
  fps,
  cardWidth = 320,
  cardHeight = 420,
  borderRadius = 16,
  backgroundColor = '#ffffff',
  boxShadow,
}) => {
  const centerX = (width - cardWidth) / 2;
  const centerY = (height - cardHeight) / 2;

  const { phase } = computePhase(frame, config);
  const { introDuration, holdDuration, outroDuration } = config.timeline;
  const { breathingAmplitude, breathingCycle, rotateYStart } = config.card;

  let x: number;
  let y: number;
  let scale: number;
  let rotateY: number;

  switch (phase) {
    case 'intro': {
      x = interpolate(frame, [0, introDuration], [startX, centerX], {
        easing: Easing.out(Easing.quad),
      });

      const ySpringVal = spring({
        frame: Math.min(frame, introDuration),
        fps,
        config: {
          damping: 14,
          stiffness: 180,
          mass: 0.6,
        },
      });
      y = startY + (centerY - startY) * ySpringVal;

      scale = interpolate(frame, [0, 15], [0, 1], {
        easing: Easing.out(Easing.quad),
        extrapolateRight: 'clamp',
      });
      rotateY = interpolate(frame, [0, introDuration], [rotateYStart, 0], {
        easing: Easing.out(Easing.quad),
      });
      break;
    }
    case 'hold': {
      const localHoldFrame = frame - introDuration;
      x = centerX;
      y =
        centerY +
        breathingAmplitude *
          Math.sin((2 * Math.PI * localHoldFrame) / breathingCycle);
      scale = 1;
      rotateY = 0;
      break;
    }
    case 'outro': {
      const localOutroFrame = Math.min(
        frame - introDuration - holdDuration,
        outroDuration,
      );
      x = interpolate(localOutroFrame, [0, outroDuration], [centerX, startX], {
        easing: Easing.in(Easing.quad),
      });
      y = interpolate(localOutroFrame, [0, outroDuration], [centerY, startY], {
        easing: Easing.in(Easing.quad),
      });
      scale = interpolate(localOutroFrame, [0, outroDuration], [1, 0], {
        easing: Easing.in(Easing.quad),
      });
      rotateY = interpolate(
        localOutroFrame,
        [0, outroDuration],
        [0, rotateYStart],
        { easing: Easing.in(Easing.quad) },
      );
      break;
    }
  }

  return (
    <div style={{ position: 'relative', width, height }}>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: cardWidth,
          height: cardHeight,
          borderRadius,
          backgroundColor,
          boxShadow,
          transform: `perspective(1200px) scale(${scale}) rotateY(${rotateY}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, borderRadius, overflow: 'hidden', backfaceVisibility: 'hidden', transform: 'translateZ(6px)' }}>
          {children}
        </div>
        <div style={{ position: 'absolute', inset: 0, borderRadius, backgroundColor, backfaceVisibility: 'hidden', transform: 'rotateY(180deg) translateZ(6px)' }} />
      </div>
    </div>
  );
};

export default CardReveal;
