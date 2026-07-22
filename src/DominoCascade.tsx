import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

// ================================================================
// 颜色工具 — 纯函数，无额外依赖
// ================================================================

function darken(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `rgb(${r},${g},${b})`;
}

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}

// ================================================================
// 常量 — 各阶段持续帧数
// ================================================================
const ENTRY_DURATION = 24; // 每个块入场动画帧数
const SETTLE_DURATION = 12; // 入场全部完成后等待帧数
const DOMINO_DURATION = 24; // 每块多米诺倒塌动画帧数

// ================================================================
// 确定性 Y 旋转值
// ================================================================

function getBlockYRotation(
  index: number,
  min: number,
  max: number,
): number {
  // 基于索引的确定性值，不在动画中再变化
  const t = ((index * 7 + index * index * 3) % 100) / 100;
  return min + t * (max - min);
}

// ================================================================
// Props 接口
// ================================================================

interface DominoCascadeProps {
  /** 多米诺骨牌数量（默认 4） */
  count?: number;
  /** 块宽度 px（默认 20） */
  blockWidth?: number;
  /** 块高度 px（默认 150） */
  blockHeight?: number;
  /** 块深度 px（默认 100） */
  blockDepth?: number;
  /** 入场错帧（默认 12 = 0.2s @60fps） */
  entryStagger?: number;
  /** 多米诺倒塌错帧（默认 3） */
  dominoStagger?: number;
  /** Y 轴旋角范围 [min, max]（默认 [3, 8]） */
  yRotationRange?: [number, number];
  /** 组中心 X 坐标（默认 960） */
  xOffset?: number;
  /** 基线 Y 坐标（默认 400） */
  yOffset?: number;
  /** 正面主色（默认 "#CBC0D3"） */
  baseColor?: string;
  /** 侧面辅助色（默认 "#4E4D5C"） */
  accentColor?: string;
  /** 可选每块正面文字（长度必须匹配 count） */
  texts?: string[];
  /** 兜底 children */
  children?: React.ReactNode;
}

// ================================================================
// DominoCascade — 3D 多米诺入场 + 级联倒塌
//
// 【阶段模型】
//   Phase A — Entry（frames 0 ~ count × entryStagger + 24）
//     每块从下方弹入，0.2s 错帧，Y 旋角逐渐建立
//   Phase B — Settle（frames 后 ~ 再 + 12）
//     所有块就位，轻微呼吸
//   Phase C — Domino（frames 后 ~ 继续）
//     从左到右级联倒塌，每块绕 Z 轴旋转至 85°
//     以底部中央为轴心 (transform-origin: center bottom)
// ================================================================

export const DominoCascade: React.FC<DominoCascadeProps> = ({
  count = 4,
  blockWidth = 20,
  blockHeight = 150,
  blockDepth = 100,
  entryStagger = 12,
  dominoStagger = 3,
  yRotationRange = [3, 8],
  xOffset = 960,
  yOffset = 400,
  baseColor = "#CBC0D3",
  accentColor = "#4E4D5C",
  texts,
  children,
}) => {
  const frame = useCurrentFrame();

  // ---- 派生边界 ----
  const entryEnd = count * entryStagger + ENTRY_DURATION;
  const dominoStart = entryEnd + SETTLE_DURATION;

  // ---- 块间距 ----
  const verticalSpacing = blockHeight + 20;
  const gap = verticalSpacing;

  // ---- 各面颜色（光照模拟） ----
  const frontColor = baseColor;
  const backColor = darken(accentColor, 30);
  const topColor = lighten(baseColor, 40);
  const bottomColor = darken(accentColor, 50);
  const leftColor = accentColor;
  const rightColor = lighten(accentColor, 20);

  // ---- 半尺寸常量（3D 面定位用） ----
  const hw = blockWidth / 2; // half width
  const hh = blockHeight / 2; // half height
  const hd = blockDepth / 2; // half depth

  // ---- 文本样式 ----
  const textColor = "#1D1B20"; // 浅灰紫背景上使用深色文字
  const fontSize = Math.min(blockWidth * 0.5, 14);

  // ================================================================
  // 每块动画计算
  // ================================================================

  const blocks: React.ReactNode[] = [];

  for (let i = 0; i < count; i++) {
    // ---- 布局 ----
    const blockCenterX = xOffset + (i - (count - 1) / 2) * gap;
    const blockTop = yOffset - blockHeight;

    // ---- 确定 Y 旋角（基于索引） ----
    const yRot = getBlockYRotation(i, yRotationRange[0], yRotationRange[1]);

    // ---- Phase A: Entry ----
    const entryStart = i * entryStagger;
    const entryLocal = frame - entryStart;

    // 入场进度 [0, 1]
    let entryProgress = 0;
    if (entryLocal <= 0) {
      entryProgress = 0;
    } else if (entryLocal < ENTRY_DURATION) {
      entryProgress = entryLocal / ENTRY_DURATION;
    } else {
      entryProgress = 1;
    }

    // Y 偏移：从下方 300px 弹入最终位置
    const entryYOffset = interpolate(
      entryProgress,
      [0, 1],
      [300, 0],
      { easing: Easing.out(Easing.back(1.2)), extrapolateRight: "clamp" },
    );

    // 透明度淡入：前 6 帧
    const entryOpacity = interpolate(entryLocal, [-6, 0, 6], [0, 0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    // 入场时 Y 旋角逐渐建立
    const entryYRot = entryProgress * yRot;

    // ---- Phase B: Settle — 轻微呼吸 ----
    const settleLocal = frame - entryEnd;
    const breatheScale =
      settleLocal >= 0 && settleLocal < SETTLE_DURATION
        ? 1 +
          Math.sin((settleLocal / SETTLE_DURATION) * Math.PI * 2) * 0.003
        : 1;

    // ---- Phase C: Domino 倒塌 ----
    const dominoLocal = frame - dominoStart - i * dominoStagger;

    let dominoRotation = 0;
    let dominoScaleX = 1;
    let dominoOpacity = 1;

    if (dominoLocal >= 0 && dominoLocal < DOMINO_DURATION) {
      // 正在倒塌
      dominoRotation = interpolate(
        dominoLocal,
        [0, DOMINO_DURATION],
        [0, 85],
        {
          easing: Easing.in(Easing.quad),
          extrapolateRight: "clamp",
        },
      );
      dominoScaleX = 1;
      dominoOpacity = 1;
    } else if (dominoLocal >= DOMINO_DURATION) {
      // 倒塌完成
      dominoRotation = 85;
      dominoScaleX = 1;
      dominoOpacity = 0.7;
    }

    // ---- 合成变换 ----
    // 变换顺序：先下落（Y）→ 再 3D 倾斜（Y旋）→ 最后多米诺（Z旋）
    const transform = [
      `translateY(${-entryYOffset}px)`,
      `rotateY(${entryYRot}deg)`,
      `rotateZ(${dominoRotation}deg)`,
      `scaleX(${dominoScaleX})`,
    ].join(" ");

    const currentOpacity = entryOpacity * dominoOpacity;

    const blockStyle: React.CSSProperties = {
      position: "absolute",
      left: blockCenterX - hw,
      top: blockTop,
      width: blockWidth,
      height: blockHeight,
      transformOrigin: "center bottom",
      transform,
      opacity: currentOpacity,
      willChange: "transform, opacity",
    };

    const blockFaceBase: React.CSSProperties = {
      position: "absolute",
      backfaceVisibility: "hidden",
    };

    blocks.push(
      <div key={i} style={blockStyle}>
        {/* ---- 6 面 3D 块 ---- */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transformStyle: "preserve-3d",
            transformOrigin: "center center",
            willChange: "transform",
            transform: `scale(${breatheScale})`,
          }}
        >
          {/* Front — translateZ(+hd) */}
          <div
            style={{
              ...blockFaceBase,
              width: blockWidth,
              height: blockHeight,
              left: 0,
              top: 0,
              backgroundColor: frontColor,
              transform: `translateZ(${hd}px)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {texts?.[i] && (
              <span
                style={{
                  color: textColor,
                  fontFamily: '"MapleMono-NF-CN", "Helvetica Neue", sans-serif',
                  fontSize,
                  fontWeight: 700,
                  lineHeight: 1,
                  textAlign: "center",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: blockWidth - 4,
                }}
              >
                {texts[i]}
              </span>
            )}
          </div>

          {/* Back — rotateY(180deg) translateZ(+hd) */}
          <div
            style={{
              ...blockFaceBase,
              width: blockWidth,
              height: blockHeight,
              left: 0,
              top: 0,
              backgroundColor: backColor,
              transform: `rotateY(180deg) translateZ(${hd}px)`,
            }}
          />

          {/* Right — rotateY(90deg) translateZ(+hw), size: d × h */}
          <div
            style={{
              ...blockFaceBase,
              width: blockDepth,
              height: blockHeight,
              left: (blockWidth - blockDepth) / 2,
              top: 0,
              backgroundColor: rightColor,
              transform: `rotateY(90deg) translateZ(${hw}px)`,
            }}
          />

          {/* Left — rotateY(-90deg) translateZ(+hw), size: d × h */}
          <div
            style={{
              ...blockFaceBase,
              width: blockDepth,
              height: blockHeight,
              left: (blockWidth - blockDepth) / 2,
              top: 0,
              backgroundColor: leftColor,
              transform: `rotateY(-90deg) translateZ(${hw}px)`,
            }}
          />

          {/* Top — rotateX(-90deg) translateZ(+hh), size: w × d */}
          <div
            style={{
              ...blockFaceBase,
              width: blockWidth,
              height: blockDepth,
              left: 0,
              top: (blockHeight - blockDepth) / 2,
              backgroundColor: topColor,
              transform: `rotateX(-90deg) translateZ(${hh}px)`,
            }}
          />

          {/* Bottom — rotateX(90deg) translateZ(+hh), size: w × d */}
          <div
            style={{
              ...blockFaceBase,
              width: blockWidth,
              height: blockDepth,
              left: 0,
              top: (blockHeight - blockDepth) / 2,
              backgroundColor: bottomColor,
              transform: `rotateX(90deg) translateZ(${hh}px)`,
            }}
          />
        </div>
      </div>,
    );
  }

  // ================================================================
  // 容器旋转 — 轻微 Y 轴旋转增加空间感
  // ================================================================

  const containerRotateY = interpolate(
    frame,
    [0, entryEnd, entryEnd + 120],
    [0, 3, 5],
    { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) },
  );

  // ================================================================
  // 渲染
  // ================================================================

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "transparent",
        perspective: 1500,
        transformStyle: "preserve-3d",
        transform: `rotateY(${containerRotateY}deg)`,
        transformOrigin: "center center",
        willChange: "transform",
      }}
    >
      {blocks}
      {children}
    </div>
  );
};

// ================================================================
// Catalog 条目
// ================================================================

export const catalogEntry = {
  name: "DominoCascade",
  category: "entrance" as const,
  description:
    "3D 多米诺骨牌入场 + 级联倒塌 — 六面体 CSS 3D 块，支持每块文字",
  params: {
    count: {
      type: "number",
      default: "4",
      desc: "多米诺骨牌数量",
    },
    blockWidth: {
      type: "number",
      default: "20",
      desc: "块宽度（px）",
    },
    blockHeight: {
      type: "number",
      default: "150",
      desc: "块高度（px）",
    },
    blockDepth: {
      type: "number",
      default: "100",
      desc: "块深度（px）",
    },
    entryStagger: {
      type: "number",
      default: "12",
      desc: "入场错帧（0.2s @60fps）",
    },
    dominoStagger: {
      type: "number",
      default: "3",
      desc: "多米诺倒塌错帧",
    },
    baseColor: {
      type: "string",
      default: '"#CBC0D3"',
      desc: "正面主色",
    },
    accentColor: {
      type: "string",
      default: '"#4E4D5C"',
      desc: "侧面辅助色",
    },
  },
};
