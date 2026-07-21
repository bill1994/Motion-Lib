import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import type { CardContentProps, EntranceStyle } from './types';
import type { PartialMotionConfig } from './config';
import { mergeConfig } from './config';
import { createParticles } from './particleUtils';
import { ParticleCanvas } from './ParticleCanvas';
import CardReveal from './CardReveal';
import DefaultCardContent from './DefaultCardContent';

export interface AnimatedCardSceneProps extends Omit<CardContentProps, 'title'> {
  title?: string;
  startX?: number;
  startY?: number;
  seed?: string;
  config?: PartialMotionConfig;
  cardWidth?: number;
  cardHeight?: number;
  borderRadius?: number;
  backgroundColor?: string;
  boxShadow?: string;
  entranceStyle?: EntranceStyle;
  children?: React.ReactNode;
  glowEdgeEnabled?: boolean;
  glowEdgeColor?: string;
  glowEdgeIntensity?: number;
  glowEdgeRotationDuration?: number;
}

export const AnimatedCardScene: React.FC<AnimatedCardSceneProps> = ({
  title,
  subtitle,
  imageUrl,
  description,
  accentColor,
  startX: startXProp,
  startY: startYProp,
  seed = 'default',
  config,
  cardWidth = 672,
  cardHeight,
  borderRadius = 24,
  backgroundColor = 'rgb(203,192,211)',
  boxShadow = '0 8px 32px rgba(0,0,0,0.08)',
  entranceStyle = 'default',
  children,
  glowEdgeEnabled = true,
  glowEdgeColor = '#CBC0D3',
  glowEdgeIntensity = 2.0,
  glowEdgeRotationDuration = 120,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const mergedConfig = useMemo(() => mergeConfig(config), [config]);

  const { introDuration } = mergedConfig.timeline;

  const resolvedStartX = startXProp ?? 300;
  const resolvedStartY = startYProp ?? height * 0.5;

  const { count, minSpeed, maxSpeed, minSize, maxSize } = mergedConfig.particle;

  const particles = useMemo(
    () =>
      createParticles(
        count,
        seed,
        width / 2,
        height / 2,
        minSpeed,
        maxSpeed,
        minSize,
        maxSize,
        introDuration,
      ),
    [count, seed, width, height, minSpeed, maxSpeed, minSize, maxSize, introDuration],
  );

  return (
    <div
      style={{ position: 'absolute', inset: 0, backgroundColor: 'transparent' }}
    >
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <ParticleCanvas
          particles={particles}
          frame={frame}
          introDuration={introDuration}
          fadeDuration={mergedConfig.particle.fadeDuration}
          gravity={mergedConfig.particle.gravity}
          drag={mergedConfig.particle.drag}
          width={width}
          height={height}
        />
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <CardReveal
          startX={resolvedStartX}
          startY={resolvedStartY}
          config={mergedConfig}
          width={width}
          height={height}
          frame={frame}
          fps={fps}
          cardWidth={cardWidth}
          cardHeight={cardHeight}
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          boxShadow={boxShadow}
          entranceStyle={entranceStyle}
          glowEdgeEnabled={glowEdgeEnabled}
          glowEdgeColor={glowEdgeColor}
          glowEdgeIntensity={glowEdgeIntensity}
          glowEdgeRotationDuration={glowEdgeRotationDuration}
        >
          {children ?? (
            <DefaultCardContent
              title={title ?? ''}
              subtitle={subtitle}
              imageUrl={imageUrl}
              description={description}
              accentColor={accentColor}
            />
          )}
        </CardReveal>
      </div>
    </div>
  );
};

export const catalogEntry = {
  name: 'AnimatedCardScene',
  category: 'card',
  description: '3D 卡片弹出 + 粒子爆发动效 — 三段式（出场/悬停呼吸/退场）',
  params: {
    seed: { type: 'string', default: '"default"', desc: '随机种子，确保粒子确定性生成' },
    title: { type: 'string', default: '"Card Title"', desc: '卡片标题' },
    subtitle: { type: 'string', default: '"Subtitle"', desc: '卡片副标题' },
    startX: { type: 'number', default: '300', desc: '卡片起始 X 坐标（px）' },
    startY: { type: 'number', default: 'height/2', desc: '卡片起始 Y 坐标（px）' },
    cardWidth: { type: 'number', default: '672', desc: '卡片宽度（px）' },
    cardHeight: { type: 'number', default: '—', desc: '卡片高度（px，默认等于宽度）' },
    boxShadow: { type: 'string', default: '"0 8px 32px rgba(0,0,0,0.08)"', desc: '卡片阴影（CSS box-shadow 值）' },
  },
};
