import React from 'react';
import { type GlowColorVariant, getGradientString } from './colorPresets';

export interface GlowEdgeProps {
  width: number;
  height: number;
  frame: number;
  borderRadius?: number;
  color?: string;
  intensity?: number;
  rotationDuration?: number;
  enabled?: boolean;
  colorVariant?: GlowColorVariant;
  blurAmount?: number;
}

const GlowEdge: React.FC<GlowEdgeProps> = ({
  frame,
  borderRadius = 16,
  color = '#CBC0D3',
  intensity = 2.0,
  rotationDuration = 120,
  enabled = true,
  colorVariant = 'mono',
  blurAmount = 10,
}) => {
  if (!enabled) return null;

  const angle = (frame * 360 / rotationDuration) % 360;
  const OUTSET = 40;

  return (
    <div style={{
      position: 'absolute' as const,
      inset: -OUTSET,
      borderRadius,
      pointerEvents: 'none' as const,
      zIndex: 3,
      background: getGradientString(colorVariant, color),
      filter: `blur(${blurAmount}px)`,
      WebkitFilter: `blur(${blurAmount}px)`,
      maskImage: `conic-gradient(from ${angle}deg at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%)`,
      WebkitMaskImage: `conic-gradient(from ${angle}deg at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%)`,
      mixBlendMode: 'plus-lighter' as const,
      opacity: Math.min(1, intensity),
    }} />
  );
};

export default GlowEdge;
