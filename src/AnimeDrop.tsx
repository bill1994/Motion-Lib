import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

// ================================================================
// AnimeDrop Props —— 全部关键节律参数均可从外部微调
// ================================================================
interface AnimeDropProps {
  /** 主体内容，为空时自动渲染 "ZHanWeiFU" 兜底占位 */
  children?: React.ReactNode;

  // ---- 定位 & 尺寸 ----
  /** 主体正方形边长（px），默认画面宽度的 30% */
  targetSize?: number;
  /** 左下角锚点 X 坐标（transformOrigin 为 bottom left），默认居中 */
  anchorX?: number;
  /** 左下角锚点 Y 坐标（transformOrigin 为 bottom left），默认居中偏上 */
  anchorY?: number;

  // ---- 阶段一：爆破入场 & 逆时针倾斜 ----
  /** 初始逆时针倾斜角度（度），默认 -20（CCW） */
  initialTiltAngle?: number;
  /** 爆破阶段帧数 @30fps，默认 15（约 0.5s） */
  burstFrames?: number;

  // ---- 阶段二：顺时针重力倒下 ----
  /** 倒下阶段帧数 @30fps，默认 20（约 0.67s） */
  fallFrames?: number;

  // ---- 阶段三：克制物理晃动 ----
  /**
   * 最大回弹角度占初始倾斜幅度的比例
   * 例：initialTiltAngle=-20, maxBounceAngleRatio=0.2 → 最大回弹 ±4°
   * 默认 0.2
   */
  maxBounceAngleRatio?: number;
  /**
   * 最大垂直形变占主体尺寸的比例（Squash 压缩比）
   * 范围建议 0.03-0.05，默认 0.04（4%）
   */
  maxSquashRatio?: number;
  /** 晃动频率（Hz），默认 12 — 越大晃得越快 */
  frequency?: number;
  /** 衰减系数（阻尼），默认 8 — 越大停得越快 */
  decay?: number;

  // ---- 动态模糊 ----
  /** 运动模糊强度系数（velocity × factor = 模糊像素），默认 45 */
  blurFactor?: number;
}

/**
 * AnimeDrop — 二次元爆破式入场 + 重力倒下 + 克制晃动
 *
 * 动效节奏（90 帧 @ 30fps）：
 *   Frame 0-15   | 爆破入场：scale 0→1，逆时针倾斜至 -20°，叠加速度模糊
 *   Frame 15-35  | 重力倒下：quad.in 加速顺时针回正至 0°
 *   Frame 35-90  | 克制晃动：高刚度高阻尼 Spring 微幅往复，角度 ≤20% 初始倾斜，
 *                |            垂直形变 ≤4%，迅速卸力回归静止
 *
 * 所有变形轴心锁定于 bottom left（左下角），透明背景适合 ProRes 4444 导出。
 */
export const AnimeDrop: React.FC<AnimeDropProps> = ({
  children,
  targetSize: propTargetSize,
  anchorX: propAnchorX,
  anchorY: propAnchorY,
  initialTiltAngle = -20,
  burstFrames = 15,
  fallFrames = 20,
  maxBounceAngleRatio = 0.2,
  maxSquashRatio = 0.04,
  frequency = 12,
  decay = 8,
  blurFactor = 45,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  // ================================================================
  // 动态画面自适应默认值
  // ================================================================

  /** 主体尺寸：默认画面宽的 30% */
  const targetSize = propTargetSize ?? width * 0.3;
  /** 锚点 X：左下角定位，居中时 bottom-left 在画面中线偏左半身 */
  const anchorX = propAnchorX ?? width / 2 - targetSize / 2;
  /** 锚点 Y（左下角 Y 坐标）：screenCenterY + 半身高 → 上边缘 = anchorY - targetSize */
  const anchorY = propAnchorY ?? height / 2 + targetSize / 2;

  // ================================================================
  // 阶段时间点计算
  // ================================================================
  const BURST_END = burstFrames;
  const FALL_END = BURST_END + fallFrames;

  // ================================================================
  // 阶段一：爆破式入场 & 逆时针倾斜
  //
  // 使用 Easing.bezier(0.16, 1, 0.3, 1)：
  // — 超强蓄力极速爆破曲线（CSS "ease-out-quint" 风格）
  // — 初始近乎垂直攀升，末端平滑减速归位
  // — 同时驱动 scale (0→1) 和 rotation (0→initialTiltAngle)
  // ================================================================
  const burstProgress = interpolate(frame, [0, BURST_END], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  /** 爆破缩放：从 0 瞬间放大至 1 */
  const burstScale = burstProgress;
  /** 爆破旋转：逆时针倾斜至 initialTiltAngle（如 -20°） */
  const burstRotation = interpolate(burstProgress, [0, 1], [0, initialTiltAngle]);

  // ================================================================
  // 运动模糊模拟（仅阶段一）
  //
  // 模糊量 = |帧间速度| × blurFactor
  //
  // 速度 (velocity) 由 burstProgress 的相邻帧差分近似：
  // — 在 Bézier 曲线最陡处（约 progress 0.3-0.6），速度达到峰值
  // — 峰值速度 × blurFactor ≈ 8-12px 动态模糊（取决于 targetSize）
  // — 阶段一结束时 velocity 自动归零，模糊平滑消失
  //
  // 这是对真实镜头 Motion Blur 的频域近似：速度越快 → 位移越大 → 模糊越强
  // ================================================================
  const burstProgressPrev =
    frame > 0
      ? interpolate(frame - 1, [0, BURST_END], [0, 1], {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        })
      : 0;
  const velocity = Math.abs(burstProgress - burstProgressPrev);
  const motionBlur = frame <= BURST_END ? velocity * blurFactor : 0;

  // ================================================================
  // 阶段二：顺时针重力倒下
  //
  // 使用 Easing.in(Easing.quad) 二次方加速曲线：
  // — 初始缓慢（对象"抵抗"倾倒），随后加速砸向水平
  // — quad.in 相当于 CSS cubic-bezier(0.55, 0, 1, 0.45)
  // — 动作干净利落，模拟重力力矩对自由端的作用
  //
  // 旋转从 initialTiltAngle 顺时针回到 0°（直立）
  // ================================================================
  const fallProgress = interpolate(frame, [BURST_END, FALL_END], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: Easing.in(Easing.quad),
  });
  const fallRotation = interpolate(fallProgress, [0, 1], [initialTiltAngle, 0]);

  // ================================================================
  // 合成前两阶段的旋转
  // 阶段三会在此基础之上叠加 jiggleRotation
  // ================================================================
  let baseRotation: number;
  if (frame <= BURST_END) {
    baseRotation = burstRotation;
  } else if (frame <= FALL_END) {
    baseRotation = fallRotation;
  } else {
    baseRotation = 0;
  }

  // ================================================================
  // 阶段三：克制物理晃动 (Damped Sine Wave)
  //
  // 用阻尼正弦波替代 Remotion spring，因为 sin(0)=0 数学级保证
  // FALL_END 边界零跳变，消除落地瞬间的断层感。
  //
  // 参数：
  //   frequency — 晃动频率（Hz），默认 12
  //   decay     — 衰减系数（阻尼），默认 8
  //
  // 行为：
  //   — 角度晃动：maxBounceAngle × exp(-decay·t) × sin(frequency·t)
  //   — 垂直压缩：仅在 sin 正向半周期压缩，反向归零
  //   — 体积守恒：scaleX = 1 / scaleY
  //
  // t=0（落地瞬间）rotation=0, scaleY=1 → 与阶段二 FIFO 连续
  // ================================================================
  let jiggleRotation = 0;
  let jiggleScaleX = 1;
  let jiggleScaleY = 1;

  if (frame >= FALL_END) {
    const t = (frame - FALL_END) / fps;
    const signal = Math.exp(-decay * t) * Math.sin(frequency * t);

    // 死区阈值：信号幅度 < 0.01 时直接锁死，消除残余微抖
    // 对应旋转角 < 0.04°、形变 < 0.04%，肉眼不可感知
    if (Math.abs(signal) < 0.01) {
      jiggleRotation = 0;
      jiggleScaleX = 1;
      jiggleScaleY = 1;
    } else {
      // 角度晃动：sin(0)=0 保证落地瞬间零跳变
      const maxBounceAngle = Math.abs(initialTiltAngle) * maxBounceAngleRatio;
      jiggleRotation = maxBounceAngle * signal;

      // 垂直压缩（Squash）：仅在正向周期压缩（sin 为正时）
      const currentSquash = maxSquashRatio * Math.max(0, signal);
      jiggleScaleY = 1 - currentSquash;

      // 体积守恒 (Area Preservation)
      jiggleScaleX = 1 / jiggleScaleY;
    }
  }

  // ================================================================
  // 最终变换合成
  // ================================================================

  /** 最终旋转：基础旋转 + 晃动偏移 */
  const finalRotation = baseRotation + jiggleRotation;
  /** 最终 X 缩放：飞行缩放 × 晃动 X */
  const finalScaleX = burstScale * jiggleScaleX;
  /** 最终 Y 缩放：飞行缩放 × 晃动 Y */
  const finalScaleY = burstScale * jiggleScaleY;

  // 透明度淡入 —— 避免主体第一帧突兀出现
  const opacity = interpolate(frame, [0, 6], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // ================================================================
  // 渲染输出
  // ================================================================

  /**
   * 外层容器：
   * — AbsoluteFill 等价物，铺满全屏
   * — backgroundColor: "transparent" → Alpha 通道绝对纯净
   */
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "transparent",
      }}
    >
      {/**
       * 主体容器：
       *
       * — left/top 直接定位左下角锚点，配合 transformOrigin: "bottom left"
       *   实现所有变形（放大、倾斜、倒下、晃动）均以此锚点为轴心
       * — 无 backgroundColor，完全透明以承载外部 children
       * — 方形 box (width = height = targetSize)，使用 flexbox 居中内容
       */}
      <div
        style={{
          position: "absolute",
          left: anchorX,
          top: anchorY - targetSize,
          width: targetSize,
          height: targetSize,
          transform: `scaleX(${finalScaleX}) scaleY(${finalScaleY}) rotate(${finalRotation}deg)`,
          transformOrigin: "bottom left",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: '"MapleMono-NF-CN", sans-serif',
          fontSize: targetSize * 0.12,
          fontWeight: "bold",
          color: "#ffffff",
          opacity,
          ...(motionBlur > 0 ? { filter: `blur(${motionBlur}px)` } : {}),
        }}
      >
        {children || "ZHanWeiFU"}
      </div>
    </div>
  );
};

export const catalogEntry = {
  name: 'AnimeDrop',
  category: 'entrance',
  description: '动漫式爆发弹入 + 重力倒下 + 阻尼正弦波归位',
  params: {
    targetSize: { type: 'number', desc: '主体正方形边长（px），默认画面宽度 30%' },
    initialTiltAngle: { type: 'number', default: '-20', desc: '初始逆时针倾斜角度（度）' },
    frequency: { type: 'number', default: '12', desc: '晃动频率（Hz），越大晃得越快' },
    decay: { type: 'number', default: '8', desc: '衰减系数（阻尼），越大停得越快' },
    seed: { type: 'string', desc: '随机种子，用于确定性动画变体' },
  },
};
