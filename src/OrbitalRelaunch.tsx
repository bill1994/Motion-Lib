import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

// ================================================================
// 字符串种子 → 数值种子 → 确定性 PRNG
//   传入 string seed → djb2 哈希 → mulberry32 得到可复现随机序列
//   同一 seed 下每一帧、每一次渲染轨迹完全一致，消除截帧抖动
// ================================================================

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ================================================================
// 帧级状态
// ================================================================
interface FrameState {
  x: number;
  y: number;
  blur: number;
  scale: number;
  rotation: number;
}

// ================================================================
// Props
// ================================================================
interface BulletTimeShowcaseProps {
  children?: React.ReactNode;
  seed?: string;

  /** 总帧数，默认 150。阶段自动按 25%/50%/25% 切分 */
  durationInFrames?: number;

  /** 水平速度范围 [min, max] px/frame，实际值在此区间随机 */
  vxRange?: [number, number];
  /** 垂直初速度范围 [min, max] px/frame */
  vyRange?: [number, number];
  /** 重力加速度 px/frame² */
  gravity?: number;

  /** Bullet Time 时间缩放倍数，默认 0.05（5% 速度） */
  bulletTimeScale?: number;

  /** 阶段 2 展示效果 — 缩放振幅 */
  scaleAmplitude?: number;
  /** 阶段 2 展示效果 — 缩放阻尼 */
  scaleDamping?: number;
  /** 阶段 2 展示效果 — 缩放频率 Hz */
  scaleFrequency?: number;

  /** 阶段 2 展示效果 — 旋转振幅（度） */
  rotationAmplitude?: number;
  /** 阶段 2 展示效果 — 旋转阻尼 */
  rotationDamping?: number;
  /** 阶段 2 展示效果 — 旋转频率 Hz */
  rotationFrequency?: number;

  /** 阶段 2 展示效果 — 横向摆动振幅 px */
  swayAmplitude?: number;
  /** 阶段 2 展示效果 — 摆动频率 Hz */
  swayFrequency?: number;

  /** 主体占画面宽度比例 */
  targetSizeRatio?: number;
  /** 模糊强度系数 */
  blurIntensity?: number;
  /** 最大模糊半径 px */
  maxBlur?: number;
}

/**
 * BulletTimeShowcase — Normal → Bullet Time → Resume
 *
 * ═══════════════════════════════════════════════════
 * 三阶段连续物理轨迹（60fps）
 * ═══════════════════════════════════════════════════
 *
 * 【阶段 1：Launch】（25% 总帧数）
 *   画面底部中央偏下发射。随机水平速度 + 随机垂直初速度 + 重力。
 *   X 轴速度永远不为零（方向随机左/右）。
 *   轨迹公式：x(t)=x₀+vx·t, y(t)=y₀-vy·t+½g·t²
 *   约束：上升段全程不飞出画面上边界。
 *
 * 【阶段 2：Bullet Time Showcase】（50% 总帧数）
 *   物理轨迹时间缩放至 5%（bulletTimeScale=0.05）。
 *   主体沿同一物理轨迹极慢移动，轨迹连续不冻结。
 *   展示效果（全速运行，不受子弹时间影响）：
 *     · 缩放：阻尼振荡 1.00→1.12→1.04→1.08→1.00
 *     · 旋转：阻尼振荡 8°→-6°→4°→-2°→0°
 *     · 横向摆动：低幅正弦波叠加于 X 轴
 *   刚体变换，仅中心缩放与旋转，无压扁拉伸。
 *
 * 【阶段 3：Time Resume】（25% 总帧数）
 *   物理轨迹恢复 100% 速度。无新力、无速度跳变、无轨迹断点。
 *   同一运动自然延续，最终飞出画面。
 *
 * 【全程 60fps 速度派生动态模糊】
 * ═══════════════════════════════════════════════════
 */
export const OrbitalRelaunch: React.FC<BulletTimeShowcaseProps> = ({
  children,
  seed = "default",
  durationInFrames: totalDur = 150,
  vxRange = [10, 18],
  vyRange = [50, 60],
  gravity = 1.35,
  bulletTimeScale = 0.05,
  scaleAmplitude = 0.12,
  scaleDamping = 3,
  scaleFrequency = 1.8,
  rotationAmplitude = 8,
  rotationDamping = 2.2,
  rotationFrequency = 1.6,
  swayAmplitude = 18,
  swayFrequency = 1.4,
  targetSizeRatio = 0.3,
  blurIntensity = 0.45,
  maxBlur = 4,
}) => {
  const { width, height, fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const targetSize = width * targetSizeRatio;

  // ---- 相位帧数（自动按 25%/50%/25% 比例计算）----
  const P1 = Math.round(totalDur * 0.25);
  const P2 = Math.round(totalDur * 0.5);

  // ================================================================
  // ① 确定性随机参数（seed string → hash → mulberry32）
  // ================================================================
  const randomParams = useMemo(() => {
    const numericSeed = hashString(seed);
    const rng = mulberry32(numericSeed);

    // vx：幅度在 [vxMin, vxMax] 区间随机，方向随机左/右
    const vxMag = vxRange[0] + rng() * (vxRange[1] - vxRange[0]);
    const vxSign = rng() > 0.5 ? 1 : -1;
    const vx = vxSign * vxMag;

    // vy：在 [vyMin, vyMax] 区间随机
    const vy = vyRange[0] + rng() * (vyRange[1] - vyRange[0]);

    return { vx, vy };
  }, [seed, vxRange, vyRange]);

  const { vx, vy } = randomParams;

  // ---- 起始坐标：画面底部正中偏下（完全在画外）----
  const startX = width / 2;
  const startY = height + targetSize;

  // ================================================================
  // ② 逐帧预计算完整轨迹
  //
  //    阶段 1：effFrame = displayFrame              （1× 物理时间）
  //    阶段 2：effFrame 仅推进 bulletTimeScale 倍   （物理慢放）
  //    阶段 3：effFrame 恢复 1× 推进                （时间恢复）
  //
  //    轨迹由 effFrame 唯一决定，绝对连续。
  // ================================================================
  const trajectory = useMemo((): FrameState[] => {
    const states: FrameState[] = [];

    let prevX = startX;
    let prevY = startY;

    for (let f = 0; f < totalDur; f++) {
      // 有效帧映射
      let ef: number;
      if (f < P1) {
        ef = f;
      } else if (f < P1 + P2) {
        ef = P1 + (f - P1) * bulletTimeScale;
      } else {
        ef = P1 + P2 * bulletTimeScale + (f - P1 - P2);
      }

      let px = startX + vx * ef;
      const py = startY - vy * ef + 0.5 * gravity * ef * ef;

      let currentScale = 1;
      let currentRotation = 0;

      // ---- 阶段 2 展示效果（全速，不受 bullet time 影响）----
      if (f >= P1 && f < P1 + P2) {
        const localF = f - P1;
        const t = localF / fps; // 秒（全速流逝）

        // 缩放的阻尼振荡：始终 ≥ 1.0（向前弹出后再回落）
        //   公式：1 + A·e^(-d·t) · (b + (1-b)·|sin(ω·t + π/2)|)
        //   其中 b 保证波谷不归零，|sin| 使振荡单向
        const scaleEnv = Math.exp(-scaleDamping * t);
        const scaleOsc = Math.abs(
          Math.sin(2 * Math.PI * scaleFrequency * t + Math.PI / 2),
        );
        const scaleFloor = 0.28; // 波谷最低保留 28% 振幅 → 1.04 vs 1.12
        const scaleShifted =
          scaleFloor + (1 - scaleFloor) * scaleOsc;
        currentScale =
          1 + scaleAmplitude * scaleEnv * scaleShifted;

        // 旋转的阻尼振荡：双向交替
        //   公式：A·e^(-d·t) · sin(ω·t + π/2)
        const rotEnv = Math.exp(-rotationDamping * t);
        const rotOsc = Math.sin(
          2 * Math.PI * rotationFrequency * t + Math.PI / 2,
        );
        currentRotation = rotationAmplitude * rotEnv * rotOsc;

        // 横向摆动（叠加到 X 轴）
        const sway =
          swayAmplitude *
          Math.sin(2 * Math.PI * swayFrequency * t);
        px += sway;
      }

      // 帧间位移 → 动态模糊
      const dx = px - prevX;
      const dy = py - prevY;
      const speed = Math.sqrt(dx * dx + dy * dy);

      states.push({
        x: px,
        y: py,
        blur: speed * blurIntensity,
        scale: currentScale,
        rotation: currentRotation,
      });

      prevX = px;
      prevY = py;
    }

    return states;
  }, [
    totalDur,
    P1,
    P2,
    bulletTimeScale,
    startX,
    startY,
    vx,
    vy,
    gravity,
    fps,
    scaleAmplitude,
    scaleDamping,
    scaleFrequency,
    rotationAmplitude,
    rotationDamping,
    rotationFrequency,
    swayAmplitude,
    swayFrequency,
    blurIntensity,
  ]);

  // ================================================================
  // ⑤ 当前帧状态
  // ================================================================
  const idx = Math.min(frame, trajectory.length - 1);
  const state = trajectory[idx] ?? trajectory[trajectory.length - 1];

  const blurPx = Math.max(0, Math.min(state.blur, maxBlur));

  // 初始淡入（前 5 帧）
  const opacity = interpolate(frame, [0, 5], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // ================================================================
  // ⑥ 渲染
  // ================================================================
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "transparent",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: state.x - targetSize / 2,
          top: state.y - targetSize / 2,
          width: targetSize,
          height: targetSize,
          transform: `scale(${state.scale}) rotate(${state.rotation}deg)`,
          transformOrigin: "center center",
          filter: `blur(${blurPx}px)`,
          opacity,
          backgroundColor: "transparent",
          fontFamily: '"MapleMono-NF-CN", sans-serif',
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: targetSize * 0.2,
          fontWeight: "bold",
          color: "#ffffff",
        }}
      >
        {children ?? "ZHanWeiFU"}
      </div>
    </div>
  );
};

// ================================================================
// ProRes 4444 + Alpha 导出
//
//   npx remotion render OrbitalRelaunch out/bullet-time.mov \
//     --codec=prores --prores-profile=4444 \
//     --image-format=png --pixel-format=yuva444p10le
//
//   更换种子生成变体：
//   npx remotion render OrbitalRelaunch out/bullet-time-v2.mov \
//     --props='{"seed":"variant-B"}'
// ================================================================

export const catalogEntry = {
  name: 'OrbitalRelaunch',
  description: '弹道轨迹 + 慢动作浮动 + 时间恢复飞出',
  params: {
    seed: { type: 'string', default: '"default"', desc: '随机种子，确保轨迹可复现' },
    gravity: { type: 'number', default: '1.35', desc: '重力加速度（px/frame²）' },
    bulletTimeScale: { type: 'number', default: '0.05', desc: '子弹时间缩放系数' },
  },
};
