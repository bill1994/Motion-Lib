import React, { useMemo } from 'react';
import { type GlowColorVariant } from './colorPresets';

// ==========================================
// 1. Color Interpolation Helpers (解决插值发灰)
// ==========================================

/**
 * 将 Hex 或 RGB 颜色转换为指定 Alpha 的 RGBA 字符串
 * 解决 CSS 渐变插值到 `transparent` (rgba(0,0,0,0)) 导致的灰黑污染问题
 */
export function colorToRgba(colorStr: string, alpha: number): string {
  if (!colorStr) return `rgba(0, 0, 0, ${alpha})`;
  
  // 处理 #HEX 格式
  if (colorStr.startsWith('#')) {
    let hex = colorStr.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // 处理 rgb(...) 格式
  if (colorStr.startsWith('rgb(')) {
    return colorStr.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
  }

  // 处理 rgba(...) 格式
  if (colorStr.startsWith('rgba(')) {
    return colorStr.replace(/,\s*[\d\.]+\)/, `, ${alpha})`);
  }

  return colorStr;
}

// ==========================================
// 2. Types & Abstractions
// ==========================================

export interface ColorStop {
  color: string;
  angleDeg: number;
}

export interface BeamProfile {
  beamLength: number;   // 弧度角度 (0 ~ 360)
  feather: number;      // 头尾渐隐弧度
  whiteHot: boolean;    // 是否开启电光白芯
  palette?: string[];   // 自定义色板
}

export interface LayerConfig {
  id: string;
  blur: number;
  opacity: number;
  ringWidthOffset?: number;                          // 相对基础 borderWidth 的增量 (px)
  clipInside?: boolean;                              // 是否限制在卡片内部
  mixBlendMode?: React.CSSProperties['mixBlendMode']; // 混合模式 (plus-lighter / screen)
}

export interface GlowEdgeProps {
  width: number;
  height: number;
  frame: number;
  borderRadius?: number;
  color?: string;
  borderWidth?: number;
  intensity?: number;
  rotationDuration?: number;
  enabled?: boolean;
  colorVariant?: GlowColorVariant;
  profilePreset?: 'cyberpunk' | 'apple' | 'rainbow' | 'neonMono';
  customProfile?: Partial<BeamProfile>;
  customLayers?: LayerConfig[];
}

// ==========================================
// 3. Beam Profiles & Gradient Generator
// ==========================================

export const BEAM_PROFILES: Record<string, BeamProfile> = {
  neonMono: {
    beamLength: 70,
    feather: 15,
    whiteHot: true,
  },
  cyberpunk: {
    beamLength: 90,
    feather: 20,
    whiteHot: true,
    palette: ['#00f0ff', '#ff0055', '#7000ff'],
  },
  apple: {
    beamLength: 60,
    feather: 25,
    whiteHot: false,
    palette: ['#ffffff', '#a1a1aa', '#52525b'],
  },
  rainbow: {
    beamLength: 120,
    feather: 15,
    whiteHot: false,
    palette: ['#ff3264', '#cc44ff', '#288cff', '#32c850', '#ffcc00'],
  },
};

/**
 * 生成干净色彩空间插值的 ColorStop 节点
 */
export function generateBeamStops(
  profile: BeamProfile,
  variant: GlowColorVariant,
  baseColor: string
): ColorStop[] {
  const { beamLength, feather, whiteHot, palette } = profile;
  const stops: ColorStop[] = [];

  // 判定是否使用 Palette 模式 (修复 API 优先级 BUG)
  const hasPresetPalette = Boolean(palette && palette.length > 0);
  const usePalette = hasPresetPalette || (variant !== 'mono' && variant !== 'custom');

  if (!usePalette) {
    // ----------------- 单色 / 白芯光束 -----------------
    const zeroAlphaBase = colorToRgba(baseColor, 0);
    const fullBase = colorToRgba(baseColor, 1);
    
    // 初始透明点：使用基色的 Alpha=0，拒绝 transparent 黑色插值
    stops.push({ color: zeroAlphaBase, angleDeg: 0 });
    stops.push({ color: zeroAlphaBase, angleDeg: 2 });
    stops.push({ color: fullBase, angleDeg: Math.max(2, feather) });

    if (whiteHot) {
      const zeroAlphaWhite = 'rgba(255, 255, 255, 0)';
      const fullWhite = 'rgba(255, 255, 255, 1)';
      stops.push({ color: fullWhite, angleDeg: beamLength * 0.5 });
    } else {
      stops.push({ color: fullBase, angleDeg: beamLength * 0.5 });
    }

    stops.push({ color: fullBase, angleDeg: Math.max(beamLength - feather, beamLength * 0.8) });
    stops.push({ color: zeroAlphaBase, angleDeg: beamLength });
    stops.push({ color: zeroAlphaBase, angleDeg: 360 });
  } else {
    // ----------------- 多色彩虹 / 调色板光束 -----------------
    const activePalette = palette && palette.length > 0 
      ? palette 
      : ['#ff3264', '#cc44ff', '#288cff', '#32c850', '#ffcc00'];

    const firstColorZero = colorToRgba(activePalette[0], 0);
    const lastColorZero = colorToRgba(activePalette[activePalette.length - 1], 0);

    stops.push({ color: firstColorZero, angleDeg: 0 });
    
    const step = beamLength / activePalette.length;
    activePalette.forEach((c, i) => {
      const angle = (i + 0.5) * step;
      stops.push({ color: colorToRgba(c, 1), angleDeg: Number(angle.toFixed(1)) });
    });

    stops.push({ color: lastColorZero, angleDeg: beamLength });
    stops.push({ color: lastColorZero, angleDeg: 360 });
  }

  return stops;
}

export function stopsToConicGradient(stops: ColorStop[]): string {
  const stopStrs = stops.map((s) => `${s.color} ${s.angleDeg}deg`);
  return `conic-gradient(from 0deg at 50% 50%, ${stopStrs.join(', ')})`;
}

// ==========================================
// 4. Sub-components (修复光心对齐与混合模式)
// ==========================================

/**
 * 旋转渐变画布：根据层容器的实际展开尺寸精准计算中心点
 */
const RotatingGradient: React.FC<{
  containerWidth: number;
  containerHeight: number;
  angle: number;
  gradientStr: string;
}> = React.memo(({ containerWidth, containerHeight, angle, gradientStr }) => {
  // 最小外接圆直径 D = √(W² + H²)
  const diagonal = Math.ceil(Math.sqrt(containerWidth * containerWidth + containerHeight * containerHeight));
  const left = (containerWidth - diagonal) / 2;
  const top = (containerHeight - diagonal) / 2;

  return (
    <div
      style={{
        position: 'absolute',
        width: diagonal,
        height: diagonal,
        left,
        top,
        borderRadius: '50%',
        transform: `rotate(${angle}deg)`,
        transformOrigin: 'center center',
        willChange: 'transform',
        background: gradientStr,
      }}
    />
  );
});

RotatingGradient.displayName = 'RotatingGradient';

/**
 * 环形遮罩图层
 */
const RingLayer: React.FC<{
  borderRadius: number;
  ringWidth: number;
  blur: number;
  opacity: number;
  intensityFilter?: string;
  mixBlendMode?: React.CSSProperties['mixBlendMode'];
  clipInside?: boolean;
  children: React.ReactNode;
}> = ({ borderRadius, ringWidth, blur, opacity, intensityFilter, mixBlendMode, clipInside = false, children }) => {
  const ringMaskStyle: React.CSSProperties = {
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    padding: `${ringWidth}px`,
  };

  const layerContent = (
    <div
      style={{
        position: 'absolute',
        inset: -ringWidth,
        borderRadius: borderRadius + ringWidth,
        filter: blur > 0 
          ? `blur(${blur}px) ${intensityFilter || ''}`.trim() 
          : intensityFilter || undefined,
        WebkitFilter: blur > 0 
          ? `blur(${blur}px) ${intensityFilter || ''}`.trim() 
          : intensityFilter || undefined,
        opacity,
        mixBlendMode,
      }}
    >
      <div style={{ position: 'absolute', inset: 0, ...ringMaskStyle }}>
        {children}
      </div>
    </div>
  );

  if (clipInside) {
    return (
      <div style={{ position: 'absolute', inset: 0, borderRadius, overflow: 'hidden' }}>
        {layerContent}
      </div>
    );
  }

  return layerContent;
};

// ==========================================
// 5. Improved Default Layer Configurations
// ==========================================

const DEFAULT_LAYERS: LayerConfig[] = [
  // 1. 广域外发光：高斯模糊 36px，加色混合
  { id: 'bloom-outer', blur: 36, opacity: 0.6, ringWidthOffset: 16, mixBlendMode: 'screen' },
  // 2. 内发光：赋予 10px 的扩张厚度，为 16px 模糊保留足够物理介质 (修复原先被吃光的问题)
  { id: 'bloom-inner', blur: 16, opacity: 0.7, ringWidthOffset: 10, clipInside: true, mixBlendMode: 'screen' },
  // 3. 紧贴边框的高能辉光：plus-lighter 叠加过曝
  { id: 'tight-glow',  blur: 4,  opacity: 0.85, ringWidthOffset: 1, mixBlendMode: 'plus-lighter' },
  // 4. 核心物理线：plus-lighter 电光白芯
  { id: 'core-beam',   blur: 0,  opacity: 1.0,  mixBlendMode: 'plus-lighter' },
];

// ==========================================
// 6. Main GlowEdge Component
// ==========================================

const GlowEdge: React.FC<GlowEdgeProps> = ({
  width,
  height,
  frame,
  borderRadius = 16,
  color = '#A855F7',
  borderWidth = 3,
  intensity = 1.0,
  rotationDuration = 120,
  enabled = true,
  colorVariant = 'mono',
  profilePreset = 'neonMono',
  customProfile,
  customLayers = DEFAULT_LAYERS,
}) => {
  // 1. 合并 Beam Profile 参数
  const mergedProfile = useMemo<BeamProfile>(() => {
    const base = BEAM_PROFILES[profilePreset] || BEAM_PROFILES.neonMono;
    return { ...base, ...customProfile };
  }, [profilePreset, customProfile]);

  // 2. 生成完全剔除灰黑插值污染的渐变字符串
  const gradientStr = useMemo(() => {
    const stops = generateBeamStops(mergedProfile, colorVariant, color);
    return stopsToConicGradient(stops);
  }, [mergedProfile, colorVariant, color]);

  if (!enabled) return null;

  // 3. GPU 旋转角度更新
  const angle = (frame * 360 / rotationDuration) % 360;

  // 4. 计算亮度补偿滤镜 (修复 CSS opacity 被 clamp 在 [0, 1] 导致 intensity 失效)
  const intensityFilter = intensity > 1.0 ? `brightness(${intensity})` : undefined;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      {customLayers.map((layer) => {
        const ringWidth = borderWidth + (layer.ringWidthOffset || 0);
        const finalOpacity = Math.min(1.0, layer.opacity * Math.min(1.0, intensity));

        // 关键修复：向 RotatingGradient 传入包含 ringWidth 扩张后的真实容器尺寸
        const currentContainerWidth = width + ringWidth * 2;
        const currentContainerHeight = height + ringWidth * 2;

        return (
          <RingLayer
            key={layer.id}
            borderRadius={borderRadius}
            ringWidth={ringWidth}
            blur={layer.blur}
            opacity={finalOpacity}
            intensityFilter={intensityFilter}
            mixBlendMode={layer.mixBlendMode}
            clipInside={layer.clipInside}
          >
            <RotatingGradient
              containerWidth={currentContainerWidth}
              containerHeight={currentContainerHeight}
              angle={angle}
              gradientStr={gradientStr}
            />
          </RingLayer>
        );
      })}
    </div>
  );
};

export default GlowEdge;