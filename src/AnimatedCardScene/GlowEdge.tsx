import React from 'react';
import { type GlowColorVariant } from './colorPresets';

export interface GlowEdgeProps {
  width: number;
  height: number;
  frame: number;
  borderRadius?: number;
  color?: string;
  borderWidth?: number;
  beamLength?: number;
  glowBlur?: number;
  blurAmount?: number;
  intensity?: number;
  rotationDuration?: number;
  enabled?: boolean;
  colorVariant?: GlowColorVariant;
}

// Color palettes for gradient beam arcs (simplified, 4-5 colors per variant)
const BEAM_PALETTES: Record<string, string[]> = {
  mono: [],
  rainbow: ['#ff3264', '#cc44ff', '#288cff', '#32c850', '#ffcc00'],
  ocean: ['#6446ff', '#288cff', '#1db9aa', '#32c850'],
  sunset: ['#ff3264', '#ff6600', '#ffcc00', '#ff6600'],
};

/**
 * Generate a conic-gradient string that creates a colored beam arc.
 * The beam arc starts at `angle` and spans `beamLength` degrees.
 * Colors from the palette are distributed evenly within the arc.
 */
function getBeamGradient(
  variant: GlowColorVariant,
  angle: number,
  beamLength: number,
  color: string,
): string {
  if (variant === 'mono' || variant === 'custom') {
    // Single-color beam
    return `conic-gradient(from ${angle}deg at 50% 50%, transparent 0deg, ${color} 5deg, ${color} ${beamLength}deg, transparent ${beamLength + 10}deg)`;
  }

  const palette = BEAM_PALETTES[variant] || BEAM_PALETTES.rainbow;
  const numColors = palette.length;
  if (numColors === 0) {
    return `conic-gradient(from ${angle}deg at 50% 50%, transparent 0deg, ${color} 5deg, ${color} ${beamLength}deg, transparent ${beamLength + 10}deg)`;
  }

  // Distribute colors evenly within the beam arc
  const segmentSize = beamLength / numColors;
  const stops: string[] = [];

  // Start with transparent
  stops.push(`transparent 0deg`);

  // Each color occupies one segment
  palette.forEach((c, i) => {
    const startAngle = i * segmentSize;
    const endAngle = (i + 1) * segmentSize;
    stops.push(`${c} ${Math.max(2, startAngle)}deg`);
    stops.push(`${c} ${endAngle}deg`);
  });

  // End with transparent
  stops.push(`transparent ${beamLength + 10}deg`);

  return `conic-gradient(from ${angle}deg at 50% 50%, ${stops.join(', ')})`;
}

// CSS mask composite trick: show only the padding/border ring, hide content + outside
function getBorderMask(borderWidth: number) {
  return {
    WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
    WebkitMaskComposite: 'xor' as const,
    maskComposite: 'exclude' as const,
    padding: borderWidth,
  };
}

const GlowEdge: React.FC<GlowEdgeProps> = ({
  frame,
  borderRadius = 16,
  color = '#CBC0D3',
  borderWidth = 4,
  beamLength = 90,
  glowBlur: glowBlurProp = 20,
  blurAmount,
  intensity = 1.0,
  rotationDuration = 120,
  enabled = true,
  colorVariant = 'mono',
}) => {
  if (!enabled) return null;

  const glowBlur = blurAmount ?? glowBlurProp;
  const angle = (frame * 360 / rotationDuration) % 360;
  const beamGrad = getBeamGradient(colorVariant, angle, beamLength, color);
  const maskInset = borderWidth;
  const maskBorderRadius = borderRadius + maskInset;
  const beamOpacity = Math.min(1, intensity);
  const sharedMask = getBorderMask(borderWidth);

  return (
    <div
      style={{
        position: 'absolute' as const,
        inset: 0,
        pointerEvents: 'none' as const,
        zIndex: 5,
        opacity: beamOpacity,
      }}
    >
      {/* Layer 1: Blurred glow halo — NO mask, extends outward */}
      <div
        style={{
          position: 'absolute' as const,
          inset: -glowBlur,
          borderRadius: borderRadius + glowBlur,
          background: beamGrad,
          filter: `blur(${glowBlur}px)`,
          WebkitFilter: `blur(${glowBlur}px)`,
          mixBlendMode: 'plus-lighter' as const,
          opacity: 0.5,
        }}
      />

      {/* Layer 2: Core sharp beam */}
      <div
        style={{
          position: 'absolute' as const,
          inset: -maskInset,
          borderRadius: maskBorderRadius,
          background: beamGrad,
          mixBlendMode: 'plus-lighter' as const,
          ...sharedMask,
        }}
      />
    </div>
  );
};

export default GlowEdge;
