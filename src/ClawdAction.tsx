import React, { useRef, useEffect } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import gsap from "gsap";
import { PixelSprite } from "./pixel/PixelSprite";
import { CLAWD_VARIANTS, CLAWD_EXPRESSIONS } from "./pixel/ClawdSpriteVariants";
import type { PixelSpriteDef, FacialExpression } from "./pixel/PixelSpriteDef";

// ================================================================
// Sprite variant selector — runs every frame based on elapsed time
// ================================================================
function getSpriteVariant(t: number): PixelSpriteDef {
  if (t < 0.1) return CLAWD_VARIANTS.idle;
  if (t < 0.85) return CLAWD_VARIANTS.jump;
  if (t < 2.0) return CLAWD_VARIANTS.idleActive;
  return Math.floor(t * 5) % 2 === 0
    ? CLAWD_VARIANTS.run1
    : CLAWD_VARIANTS.run2;
}

// ================================================================
// Expression selector — forward during jump, blink cycle during
// idle-active, look_right during the run
// ================================================================
function getExpression(t: number): FacialExpression {
  const ex = CLAWD_EXPRESSIONS;
  if (t < 0.85) return ex[0]; // forward during jump
  if (t < 2.0) {
    const cycle = Math.floor(t * 4) % 2;
    return cycle === 0 ? ex[0] : ex[4]; // forward / blink alternating
  }
  return ex[1]; // look_right during run
}

// ================================================================
// ClawdAction — 3‑stage action sequence
//
// Stage 1 (0-0.85s): Bounce in from off‑screen bottom‑right,
//   land centre stage with squash & stretch.
// Stage 2 (0.85-2.0s): Idle‑active with 4 vertical bounces +
//   rotation sway.
// Stage 3 (2.0-3.0s): Flip to face right, run off screen with
//   run1/run2 frame alternation.
//
// GSAP + Remotion integration pattern:
//   gsap.timeline({ paused: true })
//   → wrapped in gsap.context(() => …, containerRef)
//   → tl.seek(frame / fps) each frame
// ================================================================
export const ClawdAction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerRef = useRef<HTMLDivElement>(null);
  const spriteWrapperRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const t = frame / fps;
  const sprite = getSpriteVariant(t);
  const expression = getExpression(t);

  // ================================================================
  // ① Build the GSAP timeline once
  // ================================================================
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

  // ================================================================
  // ② Seek GSAP timeline to the current Remotion frame
  // ================================================================
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

export const catalogEntry = {
  name: "ClawdAction",
  description:
    "像素 Clawd 三段式动作序列 — 弹跳入场 → 空闲摇摆 → 旋转跑出屏幕",
  params: {},
};
