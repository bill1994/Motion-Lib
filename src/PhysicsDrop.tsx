import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";

interface PhysicsDropProps {
  children?: React.ReactNode;
  startX?: number;
  startY?: number;
  peekY?: number;
  endX?: number;
  endY?: number;
  targetSize?: number;
}

/**
 * 物理落体动画组件
 *
 * 三段式物理动效：
 * 1. 蓄力挤压 (Anticipation)：主体在底部短暂挤压蓄力
 * 2. 跃出 (Pop)：主体从小到大极速跃起，接近最高点时速度趋近于 0 产生滞空感
 * 3. 自由落体 (Gravity Drop)：模拟重力加速度砸向目标落点
 * 4. 触地反馈 (Squash & Stretch)：落地瞬间通过 Spring 物理引擎实现挤压拉伸回弹
 *
 * 背景完全透明，支持导出带 Alpha 通道的 ProRes 4444 视频素材。
 */
export const PhysicsDrop: React.FC<PhysicsDropProps> = ({
  children,
  startX: propStartX,
  startY: propStartY,
  peekY: propPeekY,
  endX: propEndX,
  endY: propEndY,
  targetSize: propTargetSize,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  // ================================================================
  // 动态画面自适应默认值 —— 基于 useVideoConfig() 动态计算
  // 所有空间坐标均不硬编码，适配任意分辨率
  // ================================================================

  /** 起点 X —— 默认屏幕水平中央 */
  const startX = propStartX ?? width / 2;
  /** 起点 Y —— 默认屏幕底部边缘之外，从下方进入 */
  const startY = propStartY ?? height + 200;
  /** 跃起最高点 Y —— 默认屏幕上 1/4 处 */
  const peekY = propPeekY ?? height * 0.25;
  /** 落点 X —— 默认屏幕正中央 */
  const endX = propEndX ?? width / 2;
  /** 落点 Y —— 默认屏幕正中央 */
  const endY = propEndY ?? height / 2;
  /** 主体尺寸 —— 默认占据画面宽度的 30% */
  const targetSize = propTargetSize ?? width * 0.3;

  // ================================================================
  // 动画阶段划分（帧序号）
  // 基于 90 帧 @ 30fps（总长 3 秒）进行时间分配
  // ================================================================
  const ANTIC_END = 6; // 蓄力阶段结束（0.2s 快速挤压蓄力）
  const POP_END = 24; // 跃出阶段结束，到达 peekY 最高点（0.8s）
  const LAND_FRAME = 45; // 自由落体结束，触地瞬间（1.5s）
  // 剩余 45 帧用于触地回弹稳定（1.5s）

  // ================================================================
  // Y 轴位置 —— 分阶段合成
  // ================================================================

  /**
   * 阶段一：跃出进度 (ANTIC_END → POP_END)
   * 使用自定义 Bézier 曲线 (0.05, 1.1, 0.3, 1)
   * — 控制点起始 Y=1.1 产生"过冲弹性"，末端平缓使接近最高点时速度趋近于 0
   * — 模拟蓄力弹射的物理滞空感
   */
  const popProgress = interpolate(frame, [ANTIC_END, POP_END], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: Easing.bezier(0.05, 1.1, 0.3, 1),
  });

  /**
   * 阶段二：自由落体进度 (POP_END → LAND_FRAME)
   * 使用 Easing.in(Easing.quad) 二次方加速曲线
   * — 初始速度慢，随时间平方增加，模拟真实重力加速度 g=9.8m/s²
   * — 从 peekY 最高点加速砸向 endY 落点
   */
  const dropProgress = interpolate(frame, [POP_END, LAND_FRAME], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: Easing.in(Easing.quad),
  });

  /** 合成 Y 轴坐标：三段拼接 */
  let y: number;
  if (frame <= ANTIC_END) {
    // 蓄力阶段：保持在起点位置
    y = startY;
  } else if (frame <= POP_END) {
    // 跃出阶段：startY → peekY
    y = interpolate(popProgress, [0, 1], [startY, peekY]);
  } else if (frame <= LAND_FRAME) {
    // 自由落体阶段：peekY → endY
    y = interpolate(dropProgress, [0, 1], [peekY, endY]);
  } else {
    // 落地后：固定在 endY
    y = endY;
  }

  // ================================================================
  // X 轴位置 —— 平滑水平位移
  // 使用 Bézier (0.3, 0, 1, 1) 使水平移动先快后慢，自然收尾
  // ================================================================
  const xProgress = interpolate(frame, [ANTIC_END, LAND_FRAME], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: Easing.bezier(0.3, 0, 1, 1),
  });
  const x = interpolate(xProgress, [0, 1], [startX, endX]);

  // ================================================================
  // 飞行缩放 —— 跃出阶段主体从小到大
  // Bézier (0.16, 1, 0.3, 1) 是经典的"减速入场"曲线
  // ================================================================
  const flightScale = interpolate(frame, [0, POP_END], [0.25, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // ================================================================
  // 蓄力挤压 (Anticipation Squash)
  //
  // 在跃出之前，主体在底部短暂挤压，像是被按入弹簧：
  // — scaleY 从 1→0.75 压缩再反弹回 1
  // — scaleX 反向扩张以保持体积守恒（scaleX ≈ 1/scaleY）
  // — Bézier (0.33, 1, 0.68, 1) 产生温和的压缩-释放曲线
  // ================================================================
  let anticScaleX = 1;
  let anticScaleY = 1;
  if (frame <= ANTIC_END) {
    const anticT = interpolate(frame, [0, ANTIC_END], [0, 1], {
      extrapolateRight: "clamp",
      extrapolateLeft: "clamp",
      easing: Easing.bezier(0.33, 1, 0.68, 1),
    });
    // 蓄力压缩：Y 轴压扁，X 轴相应拉伸
    anticScaleY = interpolate(anticT, [0, 1], [0.75, 1]);
    // 体积守恒：scaleX * scaleY ≈ 1
    anticScaleX = 1 / anticScaleY;
  }

  // ================================================================
  // 触地反馈 (Squash & Stretch)
  //
  // 落地瞬间使用 Remotion 内置 Spring 物理引擎注入撞击反馈：
  // — damping: 8   → 阻尼系数，控制回弹衰减速度
  // — stiffness: 120 → 弹簧刚度，控制初始撞击力度
  // — mass: 0.6    → 质量，让回弹更具"肉质Q弹感"
  //
  // Spring 输出 0→1（0=撞击瞬间最扁，1=完全恢复）
  // scaleY: 0.85 → 1（压扁后弹回，Spring overshoot 产生微幅过冲再回稳）
  // scaleX: 1/0.85 → 1（横向拉伸后缩回，体积守恒）
  //
  // transformOrigin: "bottom center" 确保主体是"踩在地上"被压扁
  // 而非悬空向中心收缩
  // ================================================================
  let landScaleX = 1;
  let landScaleY = 1;
  if (frame >= LAND_FRAME) {
    const landSpring = spring({
      frame: frame - LAND_FRAME,
      fps,
      config: {
        damping: 8,
        stiffness: 120,
        mass: 0.6,
      },
    });

    const SQUASH_AMOUNT = 0.85;
    landScaleY = interpolate(landSpring, [0, 1], [SQUASH_AMOUNT, 1], {
      extrapolateRight: "clamp",
      extrapolateLeft: "clamp",
    });
    // 体积守恒：挤压时横向扩张
    landScaleX = interpolate(landSpring, [0, 1], [1 / SQUASH_AMOUNT, 1], {
      extrapolateRight: "clamp",
      extrapolateLeft: "clamp",
    });
  }

  // ================================================================
  // 最终缩放合成
  // flightScale × anticScale × landScale → 叠加所有缩放变换
  // ================================================================
  const finalScaleX = flightScale * anticScaleX * landScaleX;
  const finalScaleY = flightScale * anticScaleY * landScaleY;

  // 透明度淡入 —— 避免主体突然出现
  const opacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // ================================================================
  // 渲染输出
  // ================================================================

  /**
   * 外层容器：
   * — 绝对定位，铺满全屏
   * — 显式声明 backgroundColor: "transparent"，确保 Alpha 通道绝对纯净
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
       * 内层主体容器：
       * — 通过 left/top 定位到计算好的 (x, y) 坐标
       * — transformOrigin: "bottom center" 确保触地挤压从底部发生
       * — 无 backgroundColor，保持透明以接收外部内容
       */}
      <div
        style={{
          position: "absolute",
          left: x - targetSize / 2,
          top: y - targetSize / 2,
          width: targetSize,
          height: targetSize,
          transform: `scaleX(${finalScaleX}) scaleY(${finalScaleY})`,
          transformOrigin: "bottom center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: '"MapleMono-NF-CN", sans-serif',
          fontSize: targetSize * 0.12,
          fontWeight: "bold",
          color: "#ffffff",
          opacity,
        }}
      >
        {/* 无子组件时显示兜底占位文本 */}
        {children || "ZHanWeiFU"}
      </div>
    </div>
  );
};

export const catalogEntry = {
  name: 'PhysicsDrop',
  description: '三段式物理下落（蓄力→弹射→自由落体→着陆）',
  params: {
    endX: { type: 'number', desc: '目标落点 X 坐标（px）' },
    endY: { type: 'number', desc: '目标落点 Y 坐标（px）' },
    targetSize: { type: 'number', desc: '主体尺寸（px）' },
  },
};
