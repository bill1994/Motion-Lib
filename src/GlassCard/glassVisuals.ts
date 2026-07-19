import type React from 'react';
import type { GlassCardVariant, PhaseState, GlassVisualConfig } from './types';

export function getGlassSurfaceStyle(
  config: GlassVisualConfig,
): React.CSSProperties {
  return {
    position: 'absolute',
    inset: 0,
    background: `rgba(255, 255, 255, ${config.glassOpacity})`,
    backdropFilter: `blur(${config.blurRadius}px)`,
    WebkitBackdropFilter: `blur(${config.blurRadius}px)`,
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: config.borderRadius,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}

export function getRimGlowStyle(
  config: GlassVisualConfig,
  intensity: number,
): React.CSSProperties {
  return {
    position: 'absolute',
    inset: 0,
    borderRadius: config.borderRadius,
    boxShadow: [
      `0 0 ${8 * intensity}px ${config.rimColor}`,
      `0 0 ${25 * intensity}px ${config.rimColor}`,
      `inset 0 1px 0 rgba(255, 255, 255, ${0.08 * intensity})`,
    ].join(', '),
    pointerEvents: 'none' as const,
    opacity: Math.min(intensity, 1),
  };
}

export function getAccentRailStyle(
  config: GlassVisualConfig,
): React.CSSProperties {
  return {
    position: 'absolute',
    bottom: 0,
    left: '15%',
    right: '15%',
    height: 2,
    background: `linear-gradient(90deg, transparent, ${config.accentColor}, transparent)`,
    borderRadius: 1,
    pointerEvents: 'none' as const,
  };
}

export function getCardContainerStyle(
  state: PhaseState,
  cardWidth: number,
  cardHeight: number,
  borderRadius: number,
): React.CSSProperties {
  return {
    position: 'absolute',
    left: state.x,
    top: state.y,
    width: cardWidth,
    height: cardHeight,
    borderRadius,
    transform: [
      'perspective(1000px)',
      `rotateX(${state.rotateX}deg)`,
      `rotateY(${state.rotateY}deg)`,
      `scale(${state.scale})`,
    ].join(' '),
    transformStyle: 'preserve-3d',
    opacity: state.opacity,
  };
}

export function getDefaultVisualConfig(
  variant: GlassCardVariant,
): GlassVisualConfig {
  if (variant === 'title') {
    return {
      rimColor: '#CBC0D3',
      accentColor: '#CBC0D3',
      glassOpacity: 0.06,
      blurRadius: 16,
      borderRadius: 16,
    };
  }
  return {
    rimColor: '#4E4D5C',
    accentColor: '#CBC0D3',
    glassOpacity: 0.04,
    blurRadius: 12,
    borderRadius: 12,
  };
}
