import React, { useMemo } from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

// ================================================================
// 确定性 PRNG 工具函数
//   字符串种子 → djb2 哈希 → mulberry32 → 可复现随机序列
//   保证同一种子下渲染结果完全一致，消除分布式渲染抖动
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
// 帧状态
// ================================================================

interface FrameState {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  blur: number;
}

// ================================================================
// 统一配置对象 —— 所有可调参数集中在此，每个参数均有默认值
// ================================================================

interface HeroRevealConfig {
  /** 随机种子，默认 "default" */
  seed: string;
  /** 总帧数 @60fps，默认 180（3 秒） */
  durationInFrames: number;

  // ---- 阶段比例 ----
  /** 阶段 1（Launch）占总帧比例，默认 0.25 */
  phase1Ratio: number;
  /** 阶段 2（Showcase）占总帧比例，默认 0.50 */
  phase2Ratio: number;

  // ---- 阶段 1：Launch 轨迹 ----
  /** 水平速度范围 [min, max] px/frame（幅度），方向随机左右 */
  vxRange: [number, number];
  /** 垂直初速度范围 [min, max] px/frame */
  vyRange: [number, number];
  /** 重力加速度 px/frame² */
  gravity: number;
  /**
   * 发射段有效时间映射指数
   * ef = P1 * (f / P1)^power
   * power < 0.5 → 前半段极快、后半段极慢（爆炸视觉）
   * 默认 0.5（平方根曲线，50% 帧数 → ~71% 位移）
   */
  launchEasingPower: number;

  // ---- 阶段 2：Bullet Time 缩放 ----
  /** 弹道时间缩放系数，默认 0.05（5% 速度） */
  bulletTimeScale: number;

  // ---- 阶段 2：Showcase Section 比例 ----
  /** Section A 占 Phase2 比例，默认 0.20 */
  sectionARatio: number;
  /** Section B 占 Phase2 比例，默认 0.60 */
  sectionBRatio: number;

  /** 最大放大倍率，默认 1.12 */
  scaleUpTarget: number;
  /** 假 Z 深度偏移量（px），放大时上移，缩小时回位，默认 20 */
  zDepthOffset: number;

  /** Section A 摆锤振幅系数，默认 11.3（产生 0° → -8° → +4° → 0°） */
  rotationAmplitudeA: number;
  /** Section C 摆锤振幅系数，默认 8.5（产生 0° → +6° → -3° → 0°） */
  rotationAmplitudeC: number;
  /** 摆锤阻尼系数，默认 1.39 */
  rotationDamping: number;

  /** Section B 微幅摆动幅度（度），默认 1.0 */
  swayAmplitude: number;
  /** Section B 微幅摆动频率（Hz），默认 0.8 */
  swayFrequency: number;

  // ---- 尺寸 ----
  /** 主体占画面宽度比例，默认 0.30 */
  targetSizeRatio: number;

  // ---- 动态模糊 ----
  /** 模糊强度系数（velocity × factor），默认 0.45 */
  blurIntensity: number;
  /** 最大模糊半径 px，默认 16 */
  maxBlur: number;

  // ---- Spring 微沉（Showcase 结束后的微幅归位） ----
  /** Spring 微沉帧数，0 表示关闭，默认 0 */
  springSettleFrames: number;
  /** 微沉弹簧刚度，默认 150 */
  springStiffness: number;
  /** 微沉弹簧阻尼，默认 12 */
  springDamping: number;
}

const DEFAULTS: HeroRevealConfig = {
  seed: "default",
  durationInFrames: 180,
  phase1Ratio: 0.25,
  phase2Ratio: 0.5,
  vxRange: [8, 16],
  vyRange: [50, 65],
  gravity: 1.8,
  launchEasingPower: 0.5,
  bulletTimeScale: 0.05,
  sectionARatio: 0.2,
  sectionBRatio: 0.6,
  scaleUpTarget: 1.12,
  zDepthOffset: 20,
  rotationAmplitudeA: 11.3,
  rotationAmplitudeC: 8.5,
  rotationDamping: 1.39,
  swayAmplitude: 1.0,
  swayFrequency: 0.8,
  targetSizeRatio: 0.3,
  blurIntensity: 0.45,
  maxBlur: 16,
  springSettleFrames: 0,
  springStiffness: 150,
  springDamping: 12,
};

interface HeroRevealProps extends Partial<HeroRevealConfig> {
  children?: React.ReactNode;
}

// ================================================================
// HeroReveal — 对象发射 → Cinematic 展示 → 时间恢复
//
// 【阶段 1：Launch】（25%）
//   从画面底部中央偏下发出发射。
//   ef 从 0 非线性推进到 efStart（轨迹顶点前方），使用 front-loaded easing：
//   — 前半段帧 → 覆盖约 71% 旅行距离（爆炸式起步）
//   — 后半段帧 → 缓慢趋近顶点（可见能量衰减）
//   水平速度随机且不为零，方向随机左右。
//   轨迹公式：x = x₀ + vx·ef , y = y₀ - vy·ef + ½g·ef²
//
// 【阶段 2：Hero Showcase】（50%）
//   ef 范围 [efStart, efEnd]，以轨迹顶点 efApex 为中心对称分布。
//   物体在接近顶点的上升段进入强调 → 顶点达到效果巅峰 → 下降段结束强调。
//   弹道时间缩放至 5%，前 6 帧 smoothstep 过渡避免速度突变。
//   展示效果全速运行：
//   ┌──────────┬──────┬────────────────────────────────────┐
//   │ Sec A    │ 20%  │ Scale 1.00→1.12 + 摆锤旋转 + Z 上移 │
//   │ Sec B    │ 60%  │ 保持 1.12 + 微幅漂浮摆动           │
//   │ Sec C    │ 20%  │ Scale 1.12→1.00 + 摆锤旋转 + Z 回位 │
//   └──────────┴──────┴────────────────────────────────────┘
//
// 【阶段 3：Time Resume】（25%）
//   弹道时间恢复 1× 速度，从 efEnd 继续推进，轨迹连续不间断。
//
// 【全程动态模糊】
//   帧间位移 → speed → blur(0~16px)，快速运动模糊强，慢速时清晰。
// ================================================================

export const HeroReveal: React.FC<HeroRevealProps> = ({
  children,
  ...configOverrides
}) => {
  // ---- 合并用户配置与默认值 ----
  const cfg: HeroRevealConfig = { ...DEFAULTS, ...configOverrides };

  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const totalDur = cfg.durationInFrames;

  // ---- 阶段帧边界（自动自适应） ----
  const P1 = Math.round(totalDur * cfg.phase1Ratio);
  const P2 = Math.round(totalDur * cfg.phase2Ratio);

  // ---- Section 边界（Phase2 内部） ----
  const SA = Math.round(P2 * cfg.sectionARatio);
  const SB = Math.round(P2 * cfg.sectionBRatio);

  const targetSize = width * cfg.targetSizeRatio;

  // ================================================================
  // ① 确定性随机参数
  //   种子 → djb2 哈希 → mulberry32 PRNG → 一次生成，稳定复用
  // ================================================================

  const randomParams = useMemo(() => {
    const numericSeed = hashString(cfg.seed);
    const rng = mulberry32(numericSeed);

    const vxMag =
      cfg.vxRange[0] + rng() * (cfg.vxRange[1] - cfg.vxRange[0]);
    const vx = (rng() > 0.5 ? 1 : -1) * vxMag;

    const vy =
      cfg.vyRange[0] + rng() * (cfg.vyRange[1] - cfg.vyRange[0]);

    return { vx, vy };
  }, [cfg.seed, cfg.vxRange, cfg.vyRange]);

  const { vx, vy } = randomParams;

  // ---- 起始坐标：画面底部中央偏下（完全在画外） ----
  const startX = width / 2;
  const startY = height + targetSize * 0.5;

  // ---- Phase 2 ef 范围：以轨迹顶点为中心对称分布 ----
  const efApex = vy / cfg.gravity;                        // 轨迹顶点 ef
  const efSpan = P2 * cfg.bulletTimeScale;                // Phase 2 占用 ef 行程
  const efStart = Math.max(0, efApex - efSpan * 0.5);     // Phase 2 起点（顶点之前）
  const efEnd = efStart + efSpan;                          // Phase 2 终点（顶点之后）

  // ================================================================
  // ② 逐帧预计算完整轨迹
  //
  //    使用有效时间 ef 统一驱动物理公式（x = x₀ + vx·ef,
  //    y = y₀ − vy·ef + ½·g·ef²），三阶段轨迹绝对连续。
  //
  //    Phase 1 [0, P1)     ：ef = efStart · (f/P1)^power
  //                           从 0 非线性推进到 efStart
  //                           （front-loaded，前半程快、后半程慢）
  //    Phase 2 [P1, P1+P2) ：ef = efStart + localF · bulletTimeScale
  //                           前 6 帧 smoothstep 过渡，速度从 Phase 1 末
  //                           速率平滑降至 bulletTimeScale
  //                           ef 范围：[efStart, efEnd]，顶点居中
  //    Phase 3 [P1+P2, ∞) ：ef = efEnd + (f − P1 − P2) × 1.0
  //                           恢复全速，轨迹自然延续
  //
  //    展示效果（scale / rotation / zOffset）叠加在位置之上。
  // ================================================================

  const trajectory = useMemo((): FrameState[] => {
    const states: FrameState[] = [];
    let prevX = startX;
    let prevY = startY;

    for (let f = 0; f < totalDur; f++) {
      // ---- 有效时间 ef ----
      // Phase 2 以轨迹顶点 efApex 为中心对称分布
      // Phase 1 → 2 前 6 帧 smoothstep 过渡，避免速度突变
      let ef: number;
      if (f < P1) {
        const t = Math.min(f / P1, 1);
        ef = efStart * Math.pow(t, cfg.launchEasingPower);
      } else if (f < P1 + P2) {
        const localF = f - P1;
        const TRANSITION_FRAMES = 6;
        if (localF < TRANSITION_FRAMES) {
          const p1Rate = efStart * cfg.launchEasingPower / P1;
          const smoothT = localF / TRANSITION_FRAMES;
          const blend = smoothT * smoothT * (3 - 2 * smoothT);
          const fastStep = localF * p1Rate;
          const slowStep = localF * cfg.bulletTimeScale;
          ef = efStart + fastStep + (slowStep - fastStep) * blend;
        } else {
          ef = efStart + localF * cfg.bulletTimeScale;
        }
      } else {
        ef = efEnd + (f - P1 - P2);
      }

      const px = startX + vx * ef;
      const py = startY - vy * ef + 0.5 * cfg.gravity * ef * ef;

      // ---- 展示效果计算 ----
      let showScale = 1;
      let showRot = 0;
      let zOffset = 0;

      if (f >= P1 && f < P1 + P2) {
        const localF = f - P1;

        if (localF < SA) {
          // === Section A：Scale Up + 摆锤旋转 + Z 上移 ===
          const t = SA > 0 ? localF / SA : 1;

          showScale = interpolate(t, [0, 1], [1, cfg.scaleUpTarget], {
            easing: Easing.in(Easing.quad),
            extrapolateRight: "clamp",
            extrapolateLeft: "clamp",
          });

          // 摆锤公式：A · sin(2π·t) · exp(-d·t)
          // t=0 → 0°, t≈0.25 → -8°, t≈0.5 → 0°, t≈0.75 → +4°, t=1 → 0°
          showRot =
            -cfg.rotationAmplitudeA *
            Math.sin(2 * Math.PI * t) *
            Math.exp(-cfg.rotationDamping * t);

          // Z 上移：0 → -zDepthOffset（负 Y = 向上）
          zOffset = interpolate(t, [0, 1], [0, -cfg.zDepthOffset], {
            easing: Easing.in(Easing.quad),
            extrapolateRight: "clamp",
            extrapolateLeft: "clamp",
          });
        } else if (localF < SA + SB) {
          // === Section B：保持 1.12 + 微幅漂浮 ===
          const t = (localF - SA) / fps;

          // 极微幅的呼吸式缩放波动
          const holdSway =
            1 + 0.01 * Math.sin(2 * Math.PI * 0.5 * t);
          showScale = cfg.scaleUpTarget * holdSway;

          // 低幅正弦摆动
          showRot =
            cfg.swayAmplitude *
            Math.sin(2 * Math.PI * cfg.swayFrequency * t);

          zOffset = -cfg.zDepthOffset;
        } else {
          // === Section C：Scale Down + 摆锤旋转 + Z 回位 ===
          const sectionCLen = P2 - SA - SB;
          const t =
            sectionCLen > 0 ? (localF - SA - SB) / sectionCLen : 1;

          showScale = interpolate(
            t,
            [0, 1],
            [cfg.scaleUpTarget, 1],
            {
              easing: Easing.out(Easing.quad),
              extrapolateRight: "clamp",
              extrapolateLeft: "clamp",
            },
          );

          // 摆锤：正振幅起始，产生 0° → +6° → -3° → 0° 模式
          showRot =
            cfg.rotationAmplitudeC *
            Math.sin(2 * Math.PI * t) *
            Math.exp(-cfg.rotationDamping * t);

          // Z 回位：-zDepthOffset → 0
          zOffset = interpolate(
            t,
            [0, 1],
            [-cfg.zDepthOffset, 0],
            {
              easing: Easing.out(Easing.quad),
              extrapolateRight: "clamp",
              extrapolateLeft: "clamp",
            },
          );
        }
      }

      // ---- Spring 微沉（Showcase 结束后的弹性归位） ----
      if (
        cfg.springSettleFrames > 0 &&
        f >= P1 + P2 &&
        f < P1 + P2 + cfg.springSettleFrames
      ) {
        const sf = f - (P1 + P2);
        const s = spring({
          frame: sf,
          fps,
          config: {
            stiffness: cfg.springStiffness,
            damping: cfg.springDamping,
            mass: 0.5,
          },
        });

        // 微幅 overshoot 补偿：scale ±2%，rotation ±1.5°
        const settleScale = 1 + (s - 1) * 0.02;
        const settleRot = (s - 1) * 1.5;
        showScale *= settleScale;
        showRot += settleRot;
      }

      // ---- 动态模糊：帧间速度 → blur(0 ~ maxBlur) ----
      const dx = px - prevX;
      const dy = py - prevY;
      const speed = Math.sqrt(dx * dx + dy * dy);

      states.push({
        x: px,
        y: py + zOffset,
        scale: showScale,
        rotation: showRot,
        blur: Math.min(speed * cfg.blurIntensity, cfg.maxBlur),
      });

      prevX = px;
      prevY = py;
    }

    return states;
  }, [
    totalDur,
    P1,
    P2,
    SA,
    SB,
    fps,
    startX,
    startY,
    vx,
    vy,
    cfg.launchEasingPower,
    cfg.bulletTimeScale,
    cfg.gravity,
    cfg.scaleUpTarget,
    cfg.zDepthOffset,
    cfg.rotationAmplitudeA,
    cfg.rotationAmplitudeC,
    cfg.rotationDamping,
    cfg.swayAmplitude,
    cfg.swayFrequency,
    cfg.blurIntensity,
    cfg.maxBlur,
    cfg.springSettleFrames,
    cfg.springStiffness,
    cfg.springDamping,
    efStart,
    efEnd,
  ]);

  // ================================================================
  // ③ 当前帧状态
  // ================================================================

  const idx = Math.min(frame, trajectory.length - 1);
  const state = trajectory[idx] ?? trajectory[trajectory.length - 1];

  // ---- 透明度淡入（前 5 帧） ----
  const opacity = interpolate(frame, [0, 5], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // ================================================================
  // ④ 渲染
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
          filter: `blur(${state.blur}px)`,
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
        {children ?? "ZhanWeiFu"}
      </div>
    </div>
  );
};

// ================================================================
// ProRes 4444 + Alpha 导出命令
//
//   npx remotion render HeroReveal out/hero-reveal.mov \
//     --codec=prores --prores-profile=4444 \
//     --image-format=png --pixel-format=yuva444p10le
//
//   更换种子生成变体：
//   npx remotion render HeroReveal out/hero-v2.mov \
//     --props='{"seed":"variant-B"}'
// ================================================================

export const catalogEntry = {
  name: 'HeroReveal',
  description: '物理弹道发射 + 慢动作展示',
  params: {
    seed: { type: 'string', default: '"default"', desc: '随机种子，确保轨迹可复现' },
    gravity: { type: 'number', default: '1.8', desc: '重力加速度（px/frame²）' },
    durationInFrames: { type: 'number', default: '180', desc: '总帧数 @60fps' },
  },
};
