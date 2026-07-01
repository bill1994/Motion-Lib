import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

// ================================================================
// 动画参数配置
// ================================================================
const CONFIG = {
  /** 转场起始帧 */
  transitionStart: 45,
  /** 转场持续帧数 */
  transitionDuration: 90,

  /** 多边形边数 */
  polygonSides: 8,
  /** 起始缩放（大于 1 以确保初始全覆盖） */
  startScale: 1.8,
  /** 结束缩放 */
  endScale: 0,
  /** 起始旋转角度 */
  startRotation: 0,
  /** 结束旋转角度 */
  endRotation: 360,

  /** Scene A 背景色（红色） */
  sceneAColor: "#E53935" as const,
  /** Scene B 背景色（淡黄色） */
  sceneBColor: "#FFF8E1" as const,

  /** 文字字体 */
  fontFamily: '"MapleMono-NF-CN", sans-serif',
  /** 文字字号（rem） */
  fontSize: 5,
} as const;

// ================================================================
// 工具函数：计算正多边形顶点坐标
// ================================================================
function polygonPoints(
  cx: number,
  cy: number,
  radius: number,
  sides: number,
  rotation: number,
): string {
  const rot = (rotation * Math.PI) / 180;
  const points: string[] = [];

  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 + rot;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }

  return points.join(" ");
}

// ================================================================
// SceneTransition — SVG 多边形旋转转场
//
// 【设计思路】
//   Scene B（淡黄背景 + "ZHANWEIFU"）位于底层
//   Scene A（红色背景 + "zhanweifu"）位于上层，通过 SVG mask 裁剪
//   多边形 mask 从完全覆盖（scale 1.8）开始，
//   旋转 360° 同时缩小至 0，逐步露出下层 Scene B
// ================================================================
export const SceneTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.hypot(cx, cy);

  // ---- 转场进度 ----
  const progress = interpolate(
    frame,
    [CONFIG.transitionStart, CONFIG.transitionStart + CONFIG.transitionDuration],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    },
  );

  const scale = interpolate(
    progress,
    [0, 1],
    [CONFIG.startScale, CONFIG.endScale],
  );

  const rotation = interpolate(
    progress,
    [0, 1],
    [CONFIG.startRotation, CONFIG.endRotation],
  );

  const radius = maxR * scale;
  const points = polygonPoints(cx, cy, radius, CONFIG.polygonSides, rotation);

  // ---- Scene A 透明度（hold 阶段淡入，转场结束后淡出）----
  const sceneAOpacity = interpolate(frame, [0, 15, CONFIG.transitionStart + CONFIG.transitionDuration, 180], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---- Scene B 透明度（转场开始后显现）----
  const sceneBOpacity = interpolate(frame, [CONFIG.transitionStart, CONFIG.transitionStart + 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---- 渲染 ----
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "transparent",
      }}
    >
      {/* Scene B — 底层（淡黄背景 + 大写） */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: CONFIG.sceneBColor,
          opacity: sceneBOpacity,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: CONFIG.fontFamily,
            fontSize: `${CONFIG.fontSize}rem`,
            fontWeight: "bold",
            color: "#1D1B20",
          }}
        >
          ZHANWEIFU
        </span>
      </div>

      {/* Scene A — 上层（红色背景 + 小写，被 SVG mask 裁剪） */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: sceneAOpacity,
          mask: `url(#wipe-mask)`,
          WebkitMask: `url(#wipe-mask)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: CONFIG.sceneAColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: CONFIG.fontFamily,
              fontSize: `${CONFIG.fontSize}rem`,
              fontWeight: "bold",
              color: "#FFFFFF",
            }}
          >
            zhanweifu
          </span>
        </div>
      </div>

      {/* SVG mask 定义 */}
      <svg
        width={width}
        height={height}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
        }}
      >
        <defs>
          <mask id="wipe-mask">
            {/* 默认全黑（隐藏区域） */}
            <rect width={width} height={height} fill="black" />
            {/* 多边形区域为白色（可见区域），旋转驱动转场 */}
            <polygon points={points} fill="white" />
          </mask>
        </defs>
      </svg>
    </div>
  );
};

export const catalogEntry = {
  name: 'SceneTransition',
  description: 'SVG 多边形旋转缩放转场',
  params: {},
};
