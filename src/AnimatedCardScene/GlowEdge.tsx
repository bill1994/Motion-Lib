import React, { useMemo } from 'react';
import { type GlowColorVariant } from './colorPresets';

export interface GlowEdgeProps {
  width: number;
  height: number;
  frame: number;
  borderRadius?: number;
  color?: string;
  borderWidth?: number;            // 核心 Beam 粗细 (可自由调整 1px ~ 10px)
  beamLength?: number;             // 光束弧度长度 (0 ~ 360deg)
  intensity?: number;              // 总体能量系数
  rotationDuration?: number;       // 旋转一周帧数
  enabled?: boolean;
  colorVariant?: GlowColorVariant;

  coreWhiteHot?: boolean;          // 是否开启高能量白炽核心 (默认 true)
}

const BEAM_PALETTES: Record<string, string[]> = {
  mono: [],
  rainbow: ['#ff3264', '#cc44ff', '#288cff', '#32c850', '#ffcc00'],
  ocean: ['#6446ff', '#288cff', '#1db9aa', '#32c850'],
  sunset: ['#ff3264', '#ff6600', '#ffcc00', '#ff6600'],
};

/**
 * 构造高能量 Beam 渐变（核心带有纯白炽热段，向两侧过渡到主题色彩）
 * 无论 Core 还是 Bloom，全部使用这同一个渐变函数，保证颜色 100% 同源
 */
function buildHighEnergyGradient(
  variant: GlowColorVariant,
  beamLength: number,
  color: string,
  whiteHot: boolean
): string {
  const coreColor = whiteHot ? '#FFFFFF' : color;

  if (variant === 'mono' || variant === 'custom') {
    // 渐变结构：透明 ➔ 主色 ➔ 白炽核心 ➔ 主色 ➔ 透明
    const stops = [
      `transparent 0deg`,
      `rgba(0,0,0,0) 2deg`,
      `${color} ${(beamLength * 0.2).toFixed(1)}deg`,
      `${coreColor} ${(beamLength * 0.5).toFixed(1)}deg`,
      `${color} ${(beamLength * 0.8).toFixed(1)}deg`,
      `transparent ${beamLength.toFixed(1)}deg`,
      `transparent 360deg`,
    ];
    return `conic-gradient(from 0deg at 50% 50%, ${stops.join(', ')})`;
  }

  // 多色彩虹渐变逻辑
  const palette = BEAM_PALETTES[variant] || BEAM_PALETTES.rainbow;
  const num = palette.length;
  const step = beamLength / num;

  const stops: string[] = ['transparent 0deg'];
  palette.forEach((c, i) => {
    const startAngle = i * step;
    const midAngle = (i + 0.5) * step;
    stops.push(`${c}00 ${Math.max(2, startAngle).toFixed(1)}deg`);
    stops.push(`${c} ${midAngle.toFixed(1)}deg`);
  });
  stops.push(`${palette[num - 1]}00 ${beamLength.toFixed(1)}deg`);
  stops.push('transparent 360deg');

  return `conic-gradient(from 0deg at 50% 50%, ${stops.join(', ')})`;
}

const GlowEdge: React.FC<GlowEdgeProps> = ({
  width,
  height,
  frame,
  borderRadius = 16,
  color = '#CBC0D3',
  borderWidth = 3,                 // 核心粗细，可随意调大调小
  beamLength = 70,
  intensity = 1.0,
  rotationDuration = 120,
  enabled = true,
  colorVariant = 'mono',

  // 默认发光配置
  coreWhiteHot = true,
}) => {
  // 1. 全局唯一的渐变源（Core 和 Bloom 共享，确保完全同源）
  const sharedGradient = useMemo(
    () => buildHighEnergyGradient(colorVariant, beamLength, color, coreWhiteHot),
    [colorVariant, beamLength, color, coreWhiteHot]
  );

  if (!enabled) return null;

  // 2. GPU 硬件加速旋转角度
  const angle = (frame * 360 / rotationDuration) % 360;

  // 3. 严格匹配 borderWidth 的标准边框 Mask
  const ringMaskStyle: React.CSSProperties = {
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    padding: `${borderWidth}px`,
  };

  // 4. 旋转基座（保持极大尺寸，旋转时不会露角）
  const diagonal = Math.ceil(Math.sqrt(width * width + height * height));
  const rotatingBase: React.CSSProperties = {
    position: 'absolute',
    inset: -diagonal,
    borderRadius: '50%',
    transform: `rotate(${angle}deg)`,
    willChange: 'transform',
    background: sharedGradient,
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
        // NO overflow hidden — glow needs to spill outward
      }}
    >
      {/* 4. Bloom — widest spread, NO mask */}
      <div style={{
        position: 'absolute' as const,
        inset: -60,
        borderRadius: borderRadius + 60,
      }}>
        <div style={{
          ...rotatingBase,
          background: sharedGradient,
          filter: 'blur(48px)',
          WebkitFilter: 'blur(48px)',
          mixBlendMode: 'plus-lighter' as const,
          opacity: 0.15,
        }} />
      </div>

      {/* 3. Outer Glow — medium spread, NO mask */}
      <div style={{
        position: 'absolute' as const,
        inset: -30,
        borderRadius: borderRadius + 30,
      }}>
        <div style={{
          ...rotatingBase,
          background: sharedGradient,
          filter: 'blur(20px)',
          WebkitFilter: 'blur(20px)',
          mixBlendMode: 'plus-lighter' as const,
          opacity: 0.3,
        }} />
      </div>

      {/* 2. Inner Glow — tight, WITH mask */}
      <div style={{ position: 'absolute' as const, inset: -borderWidth, borderRadius: borderRadius + borderWidth, ...ringMaskStyle }}>
        <div style={{
          ...rotatingBase,
          background: sharedGradient,
          filter: 'blur(6px)',
          WebkitFilter: 'blur(6px)',
          mixBlendMode: 'plus-lighter' as const,
          opacity: 0.6,
        }} />
      </div>

      {/* 1. Core Beam — sharp, WITH mask */}
      <div style={{ position: 'absolute' as const, inset: -borderWidth, borderRadius: borderRadius + borderWidth, ...ringMaskStyle }}>
        <div style={{
          ...rotatingBase,
          background: sharedGradient,
          mixBlendMode: 'plus-lighter' as const,
          opacity: 1.0,
        }} />
      </div>
    </div>
  );
};

export default GlowEdge;