import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

// ================================================================
// CardFlyUp — 单张卡片从下方旋转升入的 3D 动效
//
// 复现 https://incredibles.dev 上 s__usp-wrapper 的卡片入场：
//   - 透视投影 perspective(400px)
//   - 绕 X 轴 90° → 0° 翻转（平躺 → 直立）
//   - Z 轴 750px → 0 推进（远处 → 眼前）
//   - Y 轴从画面中下方升至垂直居中
//   - 结尾微幅弹簧 overshoot settle
// ================================================================

interface CardFlyUpProps {
  /** 卡片宽度 px，默认 320 */
  cardWidth?: number;
  /** 卡片高度 px，默认 420 */
  cardHeight?: number;
  /** 圆角 px，默认 24 */
  borderRadius?: number;
  /** 动画总帧数 @60fps，默认 90（1.5s） */
  durationInFrames?: number;
  /** 延迟帧数，默认 0 */
  delay?: number;
  /** 卡片背景色，默认 "#2b2b2b" */
  backgroundColor?: string;
  /** 自定义内容，默认显示占位骨架 */
  children?: React.ReactNode;
}

const DEFAULTS = {
  cardWidth: 320,
  cardHeight: 420,
  borderRadius: 24,
  durationInFrames: 90,
  delay: 0,
  backgroundColor: "#2b2b2b",
} satisfies Required<
  Pick<
    CardFlyUpProps,
    "cardWidth" | "cardHeight" | "borderRadius" | "durationInFrames" | "delay" | "backgroundColor"
  >
>;

// ----------------------------------------------------------------
// 动画常量
// ----------------------------------------------------------------

const PERSPECTIVE = 400; // px
const START_TRANSLATE_Z = 750; // px
const START_ROTATE_X = 90; // deg → 0
const OPACITY_FADE_DURATION = 0.2; // 前 20% 帧淡入
const SETTLE_START = 0.85; // progress ≥ 0.85 触发弹簧微沉
const SETTLE_DURATION = 0.15; // 弹簧段占动画比例

// Spring 参数（微幅 overshoot）
const SPRING_STIFFNESS = 200;
const SPRING_DAMPING = 15;
const SPRING_MASS = 0.5;
const SETTLE_SCALE_AMPLITUDE = 0.015; // ±1.5%
const SETTLE_ROTATE_AMPLITUDE = 1.0; // ±1°

// power2.inOut
const POWER2_IN_OUT = Easing.bezier(0.45, 0.05, 0.55, 0.95);

// ----------------------------------------------------------------
// 组件
// ----------------------------------------------------------------

export const CardFlyUp: React.FC<CardFlyUpProps> = ({
  cardWidth = DEFAULTS.cardWidth,
  cardHeight = DEFAULTS.cardHeight,
  borderRadius = DEFAULTS.borderRadius,
  durationInFrames = DEFAULTS.durationInFrames,
  delay = DEFAULTS.delay,
  backgroundColor = DEFAULTS.backgroundColor,
  children,
}) => {
  const frame = useCurrentFrame();
  const { width: viewportWidth, height: viewportHeight, fps } = useVideoConfig();

  // ---- 有效进度（考虑延迟） ----
  const effectiveFrame = Math.max(0, frame - delay);
  const progress =
    durationInFrames > 0
      ? Math.min(effectiveFrame / durationInFrames, 1)
      : 0;

  // ---- 旋转：扁平(90°) → 直立(0°) ----
  const rotateX = interpolate(progress, [0, 1], [START_ROTATE_X, 0], {
    easing: POWER2_IN_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---- Z 轴推进：远处 → 眼前 ----
  const translateZ = interpolate(
    progress,
    [0, 1],
    [START_TRANSLATE_Z, 0],
    {
      easing: POWER2_IN_OUT,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  // ---- Y 轴位置：画面中下方 → 垂直居中 ----
  const startY = viewportHeight * 0.5 + cardHeight;
  const endY = (viewportHeight - cardHeight) / 2;

  const y = interpolate(progress, [0, 1], [startY, endY], {
    easing: POWER2_IN_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---- 透明度淡入（前 20% 帧） ----
  const opacity = interpolate(
    progress,
    [0, OPACITY_FADE_DURATION],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // ---- 结尾 Spring 微沉（progress > 0.85） ----
  let scaleSettle = 1;
  let rotateSettle = 0;

  if (progress > SETTLE_START) {
    const settleProgress = Math.min(
      Math.max((progress - SETTLE_START) / SETTLE_DURATION, 0),
      1,
    );
    const settle = spring({
      frame: settleProgress * 30,
      fps,
      config: {
        stiffness: SPRING_STIFFNESS,
        damping: SPRING_DAMPING,
        mass: SPRING_MASS,
      },
    });
    scaleSettle = 1 + (settle - 1) * SETTLE_SCALE_AMPLITUDE;
    rotateSettle = (settle - 1) * SETTLE_ROTATE_AMPLITUDE;
  }

  // ---- 水平居中 ----
  const left = (viewportWidth - cardWidth) / 2;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        perspective: PERSPECTIVE,
        perspectiveOrigin: "50% 50%",
      }}
    >
      <div
        style={{
          position: "absolute",
          left,
          top: y,
          width: cardWidth,
          height: cardHeight,
          transform: [
            `scale(${scaleSettle})`,
            `rotateX(${rotateX + rotateSettle}deg)`,
            `translateZ(${translateZ}px)`,
          ].join(" "),
          transformOrigin: "50% -20%",
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
          borderRadius,
          backgroundColor,
          opacity,
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontFamily:
            "'Neue Montreal', 'Helvetica Neue', Arial, sans-serif",
          fontSize: 18,
          lineHeight: 1.5,
          overflow: "hidden",
        }}
      >
        {children ?? (
          <>
            {/* 骨架占位符：灰色矩形 */}
            <div
              style={{
                width: "60%",
                height: "40%",
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: 12,
                marginBottom: 16,
              }}
            />
            {/* 骨架占位符：宽灰色条 */}
            <div
              style={{
                width: "80%",
                height: 14,
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: 4,
                marginBottom: 8,
              }}
            />
            {/* 骨架占位符：短灰色条 */}
            <div
              style={{
                width: "65%",
                height: 14,
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: 4,
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

// ================================================================
// catalogEntry — 组件目录注册
// ================================================================

export const catalogEntry = {
  name: "CardFlyUp",
  description:
    "卡片从下方旋转升入 — 复现 incredibles.dev s__usp-wrapper 动效",
  params: {
    cardWidth: {
      type: "number",
      default: "320",
      desc: "卡片宽度 (px)",
    },
    cardHeight: {
      type: "number",
      default: "420",
      desc: "卡片高度 (px)",
    },
    durationInFrames: {
      type: "number",
      default: "90",
      desc: "动画总帧数 @60fps",
    },
  },
};
