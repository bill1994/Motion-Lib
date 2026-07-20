import React, { useRef, useEffect } from "react";
import { useCurrentFrame, useVideoConfig, random } from "remotion";
import gsap from "gsap";
import { PixelSprite } from "./pixel/PixelSprite";
import { CLAWD_SPRITE, CLAWD_EXPRESSIONS as CLAWD_EXPRESSIONS_DROP } from "./pixel/ClawdSprite";
import { CLAWD_VARIANTS, CLAWD_EXPRESSIONS as CLAWD_EXPRESSIONS_ACTION } from "./pixel/ClawdSpriteVariants";
import type { PixelSpriteDef, FacialExpression } from "./pixel/PixelSpriteDef";
import { useParticleSystem } from "./pixel/useParticleSystem";

interface ClawdSceneProps {
  routine: "drop" | "action";
}

// ================================================================
// 表情选择器 —— 根据当前时间（秒）计算 Clawd 的面部表情（drop 模式）
// ================================================================
function getDropExpression(
  expressions: FacialExpression[],
  t: number,
): FacialExpression {
  // Act 1 (0–0.5s) — 滑入中，正视前方
  if (t < 0.5) return expressions[0]; // forward
  // Act 2 (0.5–1.0s) — 发现目标，向右看 → 恢复
  if (t < 0.8) return expressions[1]; // look_right
  if (t < 1.0) return expressions[0]; // forward
  // Act 3 (1.0–2.0s) — 开心舞动，循环表情
  if (t < 2.0) {
    const cycle = Math.floor(t * 6) % 3;
    if (cycle === 0) return expressions[2]; // look_left
    if (cycle === 1) return expressions[0]; // forward
    return expressions[1]; // look_right
  }
  // Act 4 (2.0–2.7s) — 爱心阶段，交替 forward / blink
  if (t < 2.7) {
    const blinkCycle = Math.floor(t * 3) % 2;
    return blinkCycle === 0 ? expressions[0] : expressions[4];
  }
  // Act 5 (2.7–3.0s) — 归位闪烁
  return expressions[4]; // blink
}

// ================================================================
// Sprite variant selector — runs every frame based on elapsed time (action 模式)
// ================================================================
function getActionSpriteVariant(t: number): PixelSpriteDef {
  if (t < 0.1) return CLAWD_VARIANTS.idle;
  if (t < 0.85) return CLAWD_VARIANTS.jump;
  if (t < 2.0) return CLAWD_VARIANTS.idleActive;
  return Math.floor(t * 5) % 2 === 0
    ? CLAWD_VARIANTS.run1
    : CLAWD_VARIANTS.run2;
}

// ================================================================
// Expression selector for action mode
// ================================================================
function getActionExpression(t: number): FacialExpression {
  const ex = CLAWD_EXPRESSIONS_ACTION;
  if (t < 0.85) return ex[0]; // forward during jump
  if (t < 2.0) {
    const cycle = Math.floor(t * 4) % 2;
    return cycle === 0 ? ex[0] : ex[4]; // forward / blink alternating
  }
  return ex[1]; // look_right during run
}

// ================================================================
// ClawdScene — 内部子组件（drop 模式）
// ================================================================
const ClawdSceneDrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerRef = useRef<HTMLDivElement>(null);
  const spriteWrapperRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const { addParticle, tickParticles, ParticleLayer } = useParticleSystem();

  const t = frame / fps;
  const expression = getDropExpression(CLAWD_EXPRESSIONS_DROP, t);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });

      // ---- Act 1: 从左侧滑入 + 弹性 bounce (0–0.5s) ----
      tl.fromTo(
        spriteWrapperRef.current,
        { x: -300, y: 450, scale: 1, rotation: 0 },
        { x: 700, y: 400, duration: 0.5, ease: "back.out(1.7)" },
        0,
      );

      // ---- Act 2: 发现目标 — 惊讶上跳 (0.5–0.8s) ----
      tl.to(
        spriteWrapperRef.current,
        { y: 360, duration: 0.12, ease: "power2.out" },
        0.5,
      );
      tl.to(
        spriteWrapperRef.current,
        { y: 400, duration: 0.18, ease: "bounce.out" },
        0.62,
      );

      // ---- Act 3: 开心 dance — y 轴上下弹动 (1.0–2.0s) ----
      tl.to(
        spriteWrapperRef.current,
        { y: 385, duration: 0.1, ease: "sine.inOut" },
        1.0,
      );
      tl.to(
        spriteWrapperRef.current,
        { y: 410, duration: 0.1, ease: "sine.inOut" },
        1.1,
      );
      tl.to(
        spriteWrapperRef.current,
        { y: 385, duration: 0.1, ease: "sine.inOut" },
        1.2,
      );
      tl.to(
        spriteWrapperRef.current,
        { y: 410, duration: 0.1, ease: "sine.inOut" },
        1.3,
      );
      tl.to(
        spriteWrapperRef.current,
        { y: 385, duration: 0.1, ease: "sine.inOut" },
        1.4,
      );
      tl.to(
        spriteWrapperRef.current,
        { y: 410, duration: 0.1, ease: "sine.inOut" },
        1.5,
      );
      tl.to(
        spriteWrapperRef.current,
        { y: 385, duration: 0.1, ease: "sine.inOut" },
        1.6,
      );
      tl.to(
        spriteWrapperRef.current,
        { y: 410, duration: 0.1, ease: "sine.inOut" },
        1.7,
      );
      tl.to(
        spriteWrapperRef.current,
        { y: 385, duration: 0.1, ease: "sine.inOut" },
        1.8,
      );
      tl.to(
        spriteWrapperRef.current,
        { y: 400, duration: 0.2, ease: "bounce.out" },
        1.9,
      );

      // ---- Act 5: 归位 + 静止 (2.5–3.0s) ----
      tl.to(
        spriteWrapperRef.current,
        { y: 400, duration: 0.1, ease: "none" },
        2.5,
      );

      tlRef.current = tl;
    }, containerRef);

    return () => {
      if (tlRef.current) {
        tlRef.current.kill();
        tlRef.current = null;
      }
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    if (tlRef.current) {
      tlRef.current.seek(frame / fps);
    }
  }, [frame, fps]);

  useEffect(() => {
    tickParticles();

    // Act 4 (2.0–2.5s) — 从 Clawd 附近生成爱心粒子
    if (t >= 2.0 && t <= 2.5) {
      addParticle(
        750 + random(null) * 100 - 50, // x: ~700–800 (Clawd 附近)
        360 + random(null) * 40 - 20, // y: ~340–380 (Clawd 头顶)
        "#FF6B8A",
      );
    }
  }, [frame, t, addParticle, tickParticles]);

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", width: 1920, height: 1080 }}
    >
      {/* GSAP 动画 wrapper — 负责位移/缩放/旋转 */}
      <div ref={spriteWrapperRef} style={{ position: "absolute" }}>
        <PixelSprite
          sprite={CLAWD_SPRITE}
          expression={expression}
          x={0}
          y={0}
          scale={1}
          rotation={0}
        />
      </div>

      {/* 粒子覆盖层 — 自动渲染所有活跃粒子 */}
      <ParticleLayer />
    </div>
  );
};

// ================================================================
// ClawdScene — 内部子组件（action 模式）
// ================================================================
const ClawdSceneAction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerRef = useRef<HTMLDivElement>(null);
  const spriteWrapperRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const t = frame / fps;
  const sprite = getActionSpriteVariant(t);
  const expression = getActionExpression(t);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });

      // ---- Stage 1: Parabolic arc with physics feel (0-0.7s) ----
      tl.set(
        spriteWrapperRef.current,
        { x: 2100, y: 1200, scaleX: -1, scaleY: 1 },
        0,
      );
      // Continuous horizontal deceleration (0-0.7s)
      tl.to(
        spriteWrapperRef.current,
        { x: 960, duration: 0.7, ease: "power1.out" },
        0,
      );
      // Quick upward burst (0-0.25s)
      tl.to(
        spriteWrapperRef.current,
        { y: 280, duration: 0.25, ease: "power3.out" },
        0,
      );
      // Gravity fall (0.25-0.7s)
      tl.to(
        spriteWrapperRef.current,
        { y: 540, duration: 0.45, ease: "power2.in" },
        0.25,
      );
      // Squash on landing
      tl.to(
        spriteWrapperRef.current,
        { scaleY: 0.7, scaleX: -1.3, duration: 0.08, ease: "power2.in" },
        0.7,
      );
      // Recover from squash
      tl.to(
        spriteWrapperRef.current,
        { scaleY: 1, scaleX: -1, duration: 0.07, ease: "power2.out" },
        0.78,
      );

      // ---- Stage 2: Idle-Active bounces (0.85-2.0s) ----
      // 4 gentle vertical bounces
      const bounceTimes = [0.9, 1.1, 1.3, 1.5];
      bounceTimes.forEach((bt) => {
        tl.to(
          spriteWrapperRef.current,
          { y: 515, duration: 0.08, ease: "power2.out" },
          bt,
        );
        tl.to(
          spriteWrapperRef.current,
          { y: 540, duration: 0.1, ease: "bounce.out" },
          bt + 0.08,
        );
      });

      // Rotation sway during idle-active (sine wave between -3° and 3°)
      tl.to(
        spriteWrapperRef.current,
        { rotation: -3, duration: 0.15, ease: "sine.inOut" },
        1.0,
      );
      tl.to(
        spriteWrapperRef.current,
        { rotation: 3, duration: 0.15, ease: "sine.inOut" },
        1.15,
      );
      tl.to(
        spriteWrapperRef.current,
        { rotation: -3, duration: 0.15, ease: "sine.inOut" },
        1.3,
      );
      tl.to(
        spriteWrapperRef.current,
        { rotation: 3, duration: 0.15, ease: "sine.inOut" },
        1.45,
      );
      tl.to(
        spriteWrapperRef.current,
        { rotation: 0, duration: 0.15, ease: "sine.inOut" },
        1.6,
      );

      // ---- Stage 3: 3D rotationY flip + run off (2.0-3.0s) ----
      // Spin idleActive to side view (rotationY: 0 → -90, 2 frames)
      tl.to(
        spriteWrapperRef.current,
        { rotationY: -90, duration: 0.033, ease: "none" },
        1.967,
      );
      // At edge-on (-90°), sprite switches to run + scaleX flips to face right.
      // Recover from side view to front view (rotationY: -90 → 0, 3 frames)
      tl.to(
        spriteWrapperRef.current,
        { rotationY: 0, scaleX: 1, duration: 0.05, ease: "none" },
        2.0,
      );
      // Run off screen
      tl.to(
        spriteWrapperRef.current,
        { x: 2100, duration: 0.8, ease: "power2.in" },
        2.05,
      );

      tlRef.current = tl;
    }, containerRef);

    return () => {
      if (tlRef.current) {
        tlRef.current.kill();
        tlRef.current = null;
      }
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    if (tlRef.current) {
      tlRef.current.seek(frame / fps);
    }
  }, [frame, fps]);

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", width: 1920, height: 1080 }}
    >
      {/* GSAP animation wrapper — transforms applied here independently */}
      <div ref={spriteWrapperRef} style={{ position: "absolute" }}>
        <PixelSprite
          sprite={sprite}
          expression={expression}
          x={0}
          y={0}
          scale={1}
          rotation={0}
        />
      </div>
    </div>
  );
};

// ================================================================
// ClawdScene — 统一导出组件
// ================================================================
export const ClawdScene: React.FC<ClawdSceneProps> = ({ routine }) => {
  if (routine === "drop") return <ClawdSceneDrop />;
  return <ClawdSceneAction />;
};

export const catalogEntry = {
  name: "ClawdScene",
  category: "character" as const,
  description:
    "像素 Clawd 角色动画 — 支持 drop（滑入爱心）和 action（跑出屏幕）两种模式",
  params: {
    routine: {
      type: "enum",
      default: '"drop"',
      desc: "动画模式: drop | action",
    },
  },
};
