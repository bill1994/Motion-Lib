import React, { useMemo } from 'react';
import { type GlowColorVariant } from './colorPresets';

export interface GlowEdgeProps {
  width: number;
  height: number;
  frame: number;
  borderRadius?: number;
  color?: string;
  borderWidth?: number;
  beamLength?: number;
  intensity?: number;
  rotationDuration?: number;
  enabled?: boolean;
  colorVariant?: GlowColorVariant;
  /** @deprecated No longer used — blur is now layered (48px/20px/6px). Kept for backward compat. */
  blurAmount?: number;
  /** @deprecated No longer used — blur is now layered (48px/20px/6px). Kept for backward compat. */
  glowBlur?: number;
}

const BEAM_PALETTES: Record<string, string[]> = {
  mono: [],
  rainbow: ['#ff3264', '#cc44ff', '#288cff', '#32c850', '#ffcc00'],
  ocean: ['#6446ff', '#288cff', '#1db9aa', '#32c850'],
  sunset: ['#ff3264', '#ff6600', '#ffcc00', '#ff6600'],
};

/**
 * Build a smooth conic-gradient for the beam (static, 0-360 degrees).
 * The arc has soft edges: transparent → fade in → bright core → fade out → transparent.
 * This string is built ONCE via useMemo. Rotation is done via CSS transform per frame.
 */
function buildSmoothBeamGradient(
  variant: GlowColorVariant,
  beamLength: number,
  glowExpandDeg: number,
  color: string,
  brightnessBoost: boolean = false,
): string {
  const actualLength = beamLength + glowExpandDeg;
  const coreColor = brightnessBoost ? '#FFFFFF' : color;

  if (variant === 'mono' || variant === 'custom') {
    const stops = [
      `transparent 0deg`,
      `rgba(0,0,0,0) 2deg`,
      `${color} ${(actualLength * 0.15).toFixed(1)}deg`,
      `${coreColor} ${(actualLength * 0.5).toFixed(1)}deg`,
      `${color} ${(actualLength * 0.85).toFixed(1)}deg`,
      `transparent ${actualLength.toFixed(1)}deg`,
      `transparent 360deg`,
    ];
    return `conic-gradient(from 0deg at 50% 50%, ${stops.join(', ')})`;
  }

  const palette = BEAM_PALETTES[variant] || BEAM_PALETTES.rainbow;
  const num = palette.length;
  const step = actualLength / num;

  const stops: string[] = ['transparent 0deg'];

  palette.forEach((c, i) => {
    const startAngle = i * step;
    const midAngle = (i + 0.5) * step;
    stops.push(`${c}00 ${Math.max(2, startAngle).toFixed(1)}deg`);
    stops.push(`${c} ${midAngle.toFixed(1)}deg`);
  });

  stops.push(`${palette[num - 1]}00 ${actualLength.toFixed(1)}deg`);
  stops.push('transparent 360deg');

  return `conic-gradient(from 0deg at 50% 50%, ${stops.join(', ')})`;
}

const GlowEdge: React.FC<GlowEdgeProps> = ({
  width,
  height,
  frame,
  borderRadius = 16,
  color = '#CBC0D3',
  borderWidth = 2,
  beamLength = 60,
  intensity = 1.0,
  rotationDuration = 120,
  enabled = true,
  colorVariant = 'mono',
}) => {
  // Hooks must be called unconditionally (before any early return)
  const beamGrad = useMemo(
    () => buildSmoothBeamGradient(colorVariant, beamLength, 0, color, true),
    [colorVariant, beamLength, color],
  );
  const glowGrad = useMemo(
    () => buildSmoothBeamGradient(colorVariant, beamLength, 30, color, false),
    [colorVariant, beamLength, color],
  );

  if (!enabled) return null;

  // GPU-friendly rotation: static gradient, per-frame transform
  const angle = (frame * 360 / rotationDuration) % 360;

  // Ring mask via content-box exclusion
  const maskStyle: React.CSSProperties = {
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    padding: borderWidth,
  };

  // Large rotating base (bigger than card diagonal, won't show edges when rotated)
  const diagonal = Math.ceil(Math.sqrt(width * width + height * height));
  const rotatingBase: React.CSSProperties = {
    position: 'absolute',
    inset: -diagonal,
    borderRadius: '50%',
    transform: `rotate(${angle}deg)`,
    willChange: 'transform',
  };

  const beamOpacity = Math.min(1, intensity);

  return (
    <div
      style={{
        position: 'absolute' as const,
        inset: 0,
        borderRadius,
        pointerEvents: 'none' as const,
        zIndex: 5,
        opacity: beamOpacity,
        overflow: 'hidden',
      }}
    >
      {/* 4. Bloom - wide ambient glow */}
      <div style={{ position: 'absolute' as const, inset: -borderWidth, borderRadius: borderRadius + borderWidth, ...maskStyle }}>
        <div style={{ ...rotatingBase, background: glowGrad, filter: 'blur(48px)', WebkitFilter: 'blur(48px)', opacity: 0.2 }} />
      </div>

      {/* 3. Outer Glow - medium spread */}
      <div style={{ position: 'absolute' as const, inset: -borderWidth, borderRadius: borderRadius + borderWidth, ...maskStyle }}>
        <div style={{ ...rotatingBase, background: glowGrad, filter: 'blur(20px)', WebkitFilter: 'blur(20px)', opacity: 0.5 }} />
      </div>

      {/* 2. Inner Glow - tight glow */}
      <div style={{ position: 'absolute' as const, inset: -borderWidth, borderRadius: borderRadius + borderWidth, ...maskStyle }}>
        <div style={{ ...rotatingBase, background: glowGrad, filter: 'blur(6px)', WebkitFilter: 'blur(6px)', opacity: 0.8 }} />
      </div>

      {/* 1. Core Beam - sharp ring */}
      <div style={{ position: 'absolute' as const, inset: -borderWidth, borderRadius: borderRadius + borderWidth, ...maskStyle }}>
        <div style={{ ...rotatingBase, background: beamGrad, opacity: 1.0 }} />
      </div>
    </div>
  );
};

export default GlowEdge;
