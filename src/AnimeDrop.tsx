import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";

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
  /** 弹簧刚度（越大越硬），默认 250 */
  springStiffness?: number;
  /** 弹簧阻尼（越大衰减越快），默认 20 */
  springDamping?: number;
  /** 弹簧质量，默认 0.3 */
  springMass?: number;
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
  springStiffness = 250,
  springDamping = 20,
  springMass = 0.3,
  maxBounceAngleRatio = 0.2,
  maxSquashRatio = 0.04,
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
  // 阶段三：克制物理晃动 (Restrained Jiggle)
  //
  // 核心克制逻辑：
  //
  // 1. **角度克制**：
  //    最大回弹角度 = |initialTiltAngle| × maxBounceAngleRatio
  //    例：20° × 0.2 = 4°，即无论弹簧如何 overshoot，
  //    角度浮动被锁定在初始倾斜幅度的 20% 以内。
  //
  // 2. **形变克制**：
  //    maxSquashRatio = 0.04 → 垂直压缩不超过主体尺寸的 4%
  //    即 scaleY ∈ [0.96, 1.04]，极其微妙的果冻质感，拒绝浮夸。
  //
  // 3. **弹簧配置**：
  //    stiffness ≥ 200 + damping ≥ 18 → 高刚度 + 高阻尼 =
  //    "沉稳、有分量、迅速卸力" 的高级物理质感
  //    — stiffness 250：触地瞬间极速反馈，无延迟
  //    — damping 20：1-2 个周期内完成衰减，拒绝无休止晃动
  //    — mass 0.3：轻质惯性，进一步提升响应速度
  //
  // Spring 从 0→1（0=撞击瞬间，1=恢复静止）
  // 通过 extrapolateRight: "extend" 允许 Spring 的 overshoot
  // 产生往复晃动（角度在 ±maxBounceAngle 之间交替衰减）
  // ================================================================
  let jiggleRotation = 0;
  let jiggleScaleX = 1;
  let jiggleScaleY = 1;

  if (frame >= FALL_END) {
    const jiggleSpring = spring({
      frame: frame - FALL_END,
      fps,
      config: {
        stiffness: springStiffness,
        damping: springDamping,
        mass: springMass,
      },
    });

    // ---- 角度晃动 ----
    // spring=0 → maxBounceAngle（正向 bounce，延续倾倒方向的动量）
    // spring=1 → 0（静止）
    // spring>1 → 负向（overshoot 回弹，往复交替）
    const maxBounceAngle = Math.abs(initialTiltAngle) * maxBounceAngleRatio;
    jiggleRotation = interpolate(jiggleSpring, [0, 1], [maxBounceAngle, 0], {
      extrapolateRight: "extend",
      extrapolateLeft: "clamp",
    });

    // ---- 垂直压缩（Squash）----
    // spring=0 → 压缩至 1-maxSquashRatio（触地瞬间被"拍扁"）
    // spring=1 → 1（恢复）
    // spring>1 → 轻微拉伸（overshoot 回弹）
    // 形变幅度严格控制在 3-5%
    jiggleScaleY = interpolate(jiggleSpring, [0, 1], [1 - maxSquashRatio, 1], {
      extrapolateRight: "extend",
      extrapolateLeft: "clamp",
    });

    // ---- 体积守恒 (Area Preservation) ----
    // scaleX × scaleY ≈ 1：压扁时横向扩张，拉伸时横向收缩
    jiggleScaleX = 1 / jiggleScaleY;
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
