import React from 'react';

export interface GlowEdgeProps {
  width: number;
  height: number;
  frame: number;
  borderRadius?: number;
  color?: string;
  intensity?: number;
  rotationDuration?: number;
  enabled?: boolean;
}

const GlowEdge: React.FC<GlowEdgeProps> = ({
  frame,
  borderRadius = 16,
  color = '#CBC0D3',
  intensity = 2.0,
  rotationDuration = 120,
  enabled = true,
}) => {
  if (!enabled) return null;

  const angle = (frame * 360 / rotationDuration) % 360;
  const glowOpacity = Math.min(1, intensity);
  const OUTSET = 40;

  return (
    <div style={{
      position: 'absolute' as const,
      inset: -OUTSET,
      borderRadius,
      pointerEvents: 'none' as const,
      zIndex: 3,
      maskImage: `conic-gradient(from ${angle}deg at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%)`,
      WebkitMaskImage: `conic-gradient(from ${angle}deg at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%)`,
      mixBlendMode: 'plus-lighter' as const,
      opacity: glowOpacity,
    }}>
      <div style={{
        position: 'absolute' as const,
        inset: OUTSET,
        borderRadius,
        boxShadow: [
          `inset 0 0 0 1px ${color}FF`,
          `inset 0 0 1px 0 ${color}99`,
          `inset 0 0 3px 0 ${color}80`,
          `inset 0 0 6px 0 ${color}66`,
          `inset 0 0 15px 0 ${color}4D`,
          `inset 0 0 25px 2px ${color}33`,
          `inset 0 0 50px 2px ${color}1A`,
          `0 0 1px 0 ${color}99`,
          `0 0 3px 0 ${color}80`,
          `0 0 6px 0 ${color}66`,
          `0 0 15px 0 ${color}4D`,
          `0 0 25px 2px ${color}33`,
          `0 0 50px 2px ${color}1A`,
        ].join(', '),
      }} />
    </div>
  );
};

export default GlowEdge;
