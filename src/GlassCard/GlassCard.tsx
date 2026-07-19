import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import type { GlassCardProps, PhaseState } from './types';
import { getTitleAnimationState, getShowcaseAnimationState } from './animations';
import {
  getGlassSurfaceStyle,
  getRimGlowStyle,
  getAccentRailStyle,
  getCardContainerStyle,
  getDefaultVisualConfig,
} from './glassVisuals';

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant,
  cardWidth = 400,
  cardHeight = 280,
  rimColor,
  accentColor,
  glassOpacity,
  blurRadius,
  durationInFrames = 180,
  delay = 0,
  fanAngle = 0,
  fanOffsetX = 0,
  fanOffsetY = 0,
  textColor = '#CBC0D3',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const defaults = getDefaultVisualConfig(variant);
  const visualCfg = {
    rimColor: rimColor ?? defaults.rimColor,
    accentColor: accentColor ?? defaults.accentColor,
    glassOpacity: glassOpacity ?? defaults.glassOpacity,
    blurRadius: blurRadius ?? defaults.blurRadius,
    borderRadius: defaults.borderRadius,
  };

  const state: PhaseState =
    variant === 'title'
      ? getTitleAnimationState(frame, fps, durationInFrames)
      : getShowcaseAnimationState(
          frame, fps, durationInFrames, delay,
          fanAngle, fanOffsetX, fanOffsetY,
        );

  const left = state.x - cardWidth / 2;
  const top = state.y - cardHeight / 2;

  const containerStyle = {
    ...getCardContainerStyle(state, cardWidth, cardHeight, visualCfg.borderRadius),
    left,
    top,
  };

  return (
    <div style={{ position: 'absolute', inset: 0, perspective: 1000 }}>
      <div style={containerStyle}>
        <div style={getGlassSurfaceStyle(visualCfg)}>
          <div
            style={{
              padding: 24,
              textAlign: 'center',
              color: textColor,
              fontFamily: "'MapleMono-NF-CN','Helvetica Neue',Arial,sans-serif",
              width: '100%',
            }}
          >
            {children}
          </div>
        </div>
        <div style={getRimGlowStyle(visualCfg, state.glowIntensity)} />
        <div style={getAccentRailStyle(visualCfg)} />
      </div>
    </div>
  );
};
