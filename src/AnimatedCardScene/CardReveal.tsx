import React from 'react';
import { interpolate, spring, Easing } from 'remotion';
import type { MotionConfig } from './config';
import type { PhaseInfo, EntranceStyle } from './types';
import type { GlowColorVariant } from './colorPresets';
import GlowEdge from './GlowEdge';

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
  entranceStyle?: EntranceStyle;
  glowEdgeEnabled?: boolean;
  glowEdgeColor?: string;
  glowEdgeIntensity?: number;
  glowEdgeRotationDuration?: number;
  glowEdgeIllumEnabled?: boolean;
  glowEdgeIllumIntensity?: number;
  glowEdgeColorVariant?: GlowColorVariant;
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
  cardWidth = 400,
  cardHeight = 600,
  borderRadius = 16,
  backgroundColor = 'rgb(203,192,211)',
  boxShadow = '0 8px 32px rgba(0,0,0,0.08)',
  entranceStyle = 'default',
  glowEdgeEnabled = true,
  glowEdgeColor = '#CBC0D3',
  glowEdgeIntensity = 2.0,
  glowEdgeRotationDuration = 120,
  glowEdgeIllumEnabled = true,
  glowEdgeIllumIntensity = 0.6,
  glowEdgeColorVariant = 'mono',
}) => {
  const resolvedCardHeight = cardHeight ?? 280;
  const centerX = (width - cardWidth) / 2;
  const centerY = (height - resolvedCardHeight) / 2;

  const { introDuration, holdDuration, outroDuration } = config.timeline;
  const { breathingAmplitude, breathingCycle, rotateYStart } = config.card;

  const glowEdge = (
    <GlowEdge
      width={cardWidth}
      height={resolvedCardHeight}
      frame={frame}
      borderRadius={borderRadius}
      color={glowEdgeColor}
      intensity={glowEdgeIntensity}
      rotationDuration={glowEdgeRotationDuration}
      enabled={glowEdgeEnabled}
      colorVariant={glowEdgeColorVariant}
    />
  );

  const insideIllumination = (
    <div style={{
      position: 'absolute' as const,
      inset: 0,
      borderRadius,
      zIndex: 3,
      mixBlendMode: 'soft-light' as const,
      opacity: glowEdgeIllumIntensity,
      background: [
        'radial-gradient(at 80% 55%, hsla(268,100%,76%,1) 0px, transparent 50%)',
        'radial-gradient(at 69% 34%, hsla(349,100%,74%,1) 0px, transparent 50%)',
        'radial-gradient(at 8% 6%, hsla(136,100%,78%,1) 0px, transparent 50%)',
        'radial-gradient(at 41% 38%, hsla(192,100%,64%,1) 0px, transparent 50%)',
        'radial-gradient(at 86% 85%, hsla(186,100%,74%,1) 0px, transparent 50%)',
        'radial-gradient(at 82% 18%, hsla(52,100%,65%,1) 0px, transparent 50%)',
        'radial-gradient(at 51% 4%, hsla(12,100%,72%,1) 0px, transparent 50%)',
        'linear-gradient(#c299ff 0 100%)',
      ].join(', '),
      maskImage: [
        'linear-gradient(to bottom, black, black)',
        'radial-gradient(ellipse at 50% 50%, black 40%, transparent 65%)',
        'radial-gradient(ellipse at 66% 66%, black 5%, transparent 40%)',
        'radial-gradient(ellipse at 33% 33%, black 5%, transparent 40%)',
        'radial-gradient(ellipse at 66% 33%, black 5%, transparent 40%)',
        'radial-gradient(ellipse at 33% 66%, black 5%, transparent 40%)',
      ].join(', '),
      WebkitMaskImage: [
        'linear-gradient(to bottom, black, black)',
        'radial-gradient(ellipse at 50% 50%, black 40%, transparent 65%)',
        'radial-gradient(ellipse at 66% 66%, black 5%, transparent 40%)',
        'radial-gradient(ellipse at 33% 33%, black 5%, transparent 40%)',
        'radial-gradient(ellipse at 66% 33%, black 5%, transparent 40%)',
        'radial-gradient(ellipse at 33% 66%, black 5%, transparent 40%)',
      ].join(', '),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      maskComposite: 'subtract,add,add,add,add,add' as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      WebkitMaskComposite: 'subtract,add,add,add,add,add' as any,
      pointerEvents: 'none' as const,
    }} />
  );

  const contentLayer = (
    <div style={{ position: 'absolute', inset: 0, borderRadius, overflow: 'hidden', zIndex: 2 }}>
      {children}
    </div>
  );

  if (entranceStyle === 'cardFlyUp') {
    const CARD_FLY_UP_DURATION = introDuration + holdDuration;
    const totalProgress = Math.min(frame / CARD_FLY_UP_DURATION, 1);

    const POWER2_IN_OUT = Easing.bezier(0.45, 0.05, 0.55, 0.95);
    const START_ROTATE_X = 90;
    const START_TRANSLATE_Z = 750;
    const OPACITY_FADE_DURATION = 0.2;
    const SETTLE_START = 0.85;
    const SETTLE_DURATION = 0.15;

    const flyRotateX = interpolate(totalProgress, [0, 1], [START_ROTATE_X, 0], {
      easing: POWER2_IN_OUT,
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const flyTranslateZ = interpolate(totalProgress, [0, 1], [START_TRANSLATE_Z, 0], {
      easing: POWER2_IN_OUT,
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const flyY = interpolate(totalProgress, [0, 1], [startY, centerY], {
      easing: POWER2_IN_OUT,
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const flyOpacity = interpolate(totalProgress, [0, OPACITY_FADE_DURATION], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    let scaleSettle = 1;
    let rotateSettle = 0;
    if (totalProgress > SETTLE_START) {
      const settleProgress = Math.min(
        Math.max((totalProgress - SETTLE_START) / SETTLE_DURATION, 0),
        1,
      );
      const settle = spring({
        frame: settleProgress * 30,
        fps,
        config: { stiffness: 200, damping: 15, mass: 0.5 },
      });
      scaleSettle = 1 + (settle - 1) * 0.015;
      rotateSettle = (settle - 1) * 1.0;
    }

    const renderScale = scaleSettle;
    const renderRotateX = flyRotateX + rotateSettle;

    return (
      <div style={{ position: 'relative', width, height }}>
        <div
          style={{
            position: 'absolute',
            left: centerX,
            top: flyY,
            width: cardWidth,
            height: resolvedCardHeight,
            borderRadius,
            backgroundColor,
            boxShadow,
            opacity: flyOpacity,
            transform: `perspective(1200px) rotateX(${renderRotateX}deg) translateZ(${flyTranslateZ}px) scale(${renderScale})`,
            transformOrigin: '50% -20%',
            isolation: 'isolate',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, borderRadius, backgroundColor, backfaceVisibility: 'hidden', transform: 'rotateY(180deg) translateZ(6px)', zIndex: 0 }} />
          {glowEdgeIllumEnabled && insideIllumination}
          {contentLayer}
          {glowEdge}
        </div>
      </div>
    );
  }

  const { phase } = computePhase(frame, config);

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
          height: resolvedCardHeight,
          borderRadius,
          backgroundColor,
          boxShadow,
          transform: `perspective(1200px) scale(${scale}) rotateY(${rotateY}deg)`,
          isolation: 'isolate',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, borderRadius, backgroundColor, backfaceVisibility: 'hidden', transform: 'rotateY(180deg) translateZ(6px)', zIndex: 0 }} />
        {glowEdgeIllumEnabled && insideIllumination}
        {contentLayer}
        {glowEdge}
      </div>
    </div>
  );
};

export default CardReveal;
