import React, { useRef, useEffect } from "react";
import { useCurrentFrame, useVideoConfig, random } from "remotion";
import gsap from "gsap";
import { PixelSprite } from "./pixel/PixelSprite";
import { CLAWD_SPRITE, CLAWD_EXPRESSIONS } from "./pixel/ClawdSprite";
import { useParticleSystem } from "./pixel/useParticleSystem";
import type { FacialExpression } from "./pixel/PixelSpriteDef";

// ================================================================
// 表情选择器 —— 根据当前时间（秒）计算 Clawd 的面部表情
// ================================================================
function getExpression(
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
// ClawdDrop — 像素 Clawd 入场 + 弹跳 + 表情变化 + 爱心粒子
//
// 【GSAP + Remotion 帧同步方案】
//   1. gsap.timeline({ paused: true }) —— 禁止自动播放
//   2. 嵌套在 gsap.context(() => { ... }, containerRef) 内
//      防止 Puppeteer 渲染时内存泄漏和多实例冲突
//   3. 通过 useEffect 每一帧调用 tl.seek(frame / fps)
//      将 GSAP 时间线严格锁定到 Remotion 的当前帧
//   4. 仅对 wrapper div 进行 transform 动画（x, y, scale, rotation）
//      避免与 PixelSprite 内部变换冲突
//   5. 容器无 backgroundColor —— 保障 ProRes 4444 alpha 通道透明
// ================================================================
export const ClawdDrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerRef = useRef<HTMLDivElement>(null);
  const spriteWrapperRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const { addParticle, tickParticles, ParticleLayer } = useParticleSystem();

  const t = frame / fps;
  const expression = getExpression(CLAWD_EXPRESSIONS, t);

  // ================================================================
  // ① 初始化 GSAP 时间线（仅执行一次）
  // ================================================================
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

  // ================================================================
  // ② 每一帧驱动 GSAP 时间线
  // ================================================================
  useEffect(() => {
    if (tlRef.current) {
      tlRef.current.seek(frame / fps);
    }
  }, [frame, fps]);

  // ================================================================
  // ③ 粒子系统 — 每帧更新 + Act 4 生成爱心
  // ================================================================
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

export const catalogEntry = {
  name: "ClawdDrop",
  category: 'character',
  description:
    "像素 Clawd 角色从左侧滑入 + 弹跳 + 表情互动 + 爱心粒子系统",
  params: {},
};
