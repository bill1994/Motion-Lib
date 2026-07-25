import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import gsap from "gsap";

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

interface BurstRevealProps {
  children?: React.ReactNode;
  seed?: string;
  squeezeDuration?: number;
  burstDuration?: number;
  revealDuration?: number;
  size?: number;
  color?: string;
  jitterAmplitude?: number;
  jitterRotationAmplitude?: number;
  staggerSeconds?: number;
  targetBorderRadius?: number;
}

interface PhaseState {
  phase: "squeeze" | "burst" | "reveal";
  progress: number;
}

function computePhase(
  frame: number,
  fps: number,
  squeezeDuration: number,
  burstDuration: number,
  revealDuration: number,
): PhaseState {
  if (frame < 0) return { phase: "squeeze", progress: 0 };
  if (frame < squeezeDuration)
    return { phase: "squeeze", progress: frame / squeezeDuration };
  if (frame < squeezeDuration + burstDuration)
    return {
      phase: "burst",
      progress: (frame - squeezeDuration) / burstDuration,
    };
  if (frame < squeezeDuration + burstDuration + revealDuration)
    return {
      phase: "reveal",
      progress: (frame - squeezeDuration - burstDuration) / revealDuration,
    };
  return { phase: "reveal", progress: 1 };
}

const DEFAULTS = {
  seed: "default",
  squeezeDuration: 30,
  burstDuration: 36,
  revealDuration: 54,
  size: 80,
  color: "#CBC0D3",
  jitterAmplitude: 3,
  jitterRotationAmplitude: 4,
  staggerSeconds: 0.08,
  targetBorderRadius: 50,
};

export const BurstReveal: React.FC<BurstRevealProps> = ({
  children,
  ...configOverrides
}) => {
  const cfg = { ...DEFAULTS, ...configOverrides };

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const phase = computePhase(
    frame,
    fps,
    cfg.squeezeDuration,
    cfg.burstDuration,
    cfg.revealDuration,
  );

  const shapeProgress =
    phase.phase === "squeeze"
      ? 0
      : phase.phase === "burst"
        ? phase.progress
        : 1;

  const borderRadius = interpolate(shapeProgress, [0, 1], [0, cfg.targetBorderRadius], {
    easing: Easing.bezier(0.22, 1, 0.36, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const jitterTargets = useMemo(() => {
    const numericSeed = hashString(cfg.seed);
    const rng = mulberry32(numericSeed);
    return Array.from({ length: 8 }, () => ({
      x: (rng() * 2 - 1) * cfg.jitterAmplitude,
      y: (rng() * 2 - 1) * cfg.jitterAmplitude,
      rotation: (rng() * 2 - 1) * cfg.jitterRotationAmplitude,
    }));
  }, [cfg.seed, cfg.jitterAmplitude, cfg.jitterRotationAmplitude]);

  useEffect(() => {
    const el = containerRef.current;
    const contentEl = contentRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });

      tl.set(
        el,
        { xPercent: -50, yPercent: -50, x: 0, y: 0, rotation: 0, scale: 1 },
        0,
      );

      tl.to(el, { scale: 0.55, duration: 0.2, ease: "power2.out" }, 0);

      let t = 0.2;
      const halfCycle = 0.035 / 2;
      for (let i = 0; i < 8; i++) {
        const target = jitterTargets[i];
        tl.to(
          el,
          {
            x: target.x,
            y: target.y,
            rotation: target.rotation,
            duration: halfCycle,
            ease: "none",
          },
          t,
        );
        t += halfCycle;
        tl.to(
          el,
          {
            x: 0,
            y: 0,
            rotation: 0,
            duration: halfCycle,
            ease: "none",
          },
          t,
        );
        t += halfCycle;
      }

      tl.to(
        el,
        {
          scale: 1,
          x: 0,
          y: 0,
          rotation: 0,
          duration: 0.6,
          ease: "back.out(1.7)",
        },
        0.5,
      );

      const hasExternalChildren =
        children !== undefined && children !== null;
      if (hasExternalChildren && contentEl && contentEl.children.length > 0) {
        tl.set(
          Array.from(contentEl.children),
          { opacity: 0, y: 20, scale: 0.96 },
          0,
        );
        tl.fromTo(
          Array.from(contentEl.children),
          { opacity: 0, y: 20, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: cfg.staggerSeconds,
            ease: "power3.out",
          },
          1.1,
        );
      } else if (contentEl) {
        tl.set(contentEl, { opacity: 0, y: 20, scale: 0.96 }, 0);
        tl.fromTo(
          contentEl,
          { opacity: 0, y: 20, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: "power3.out",
          },
          1.1,
        );
      }

      tlRef.current = tl;
    }, el);

    return () => {
      tlRef.current?.kill();
      tlRef.current = null;
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tlRef.current) {
      tlRef.current.seek(frame / fps);
    }
  }, [frame, fps]);

  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "transparent" }}>
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: cfg.size,
          height: cfg.size,
          backgroundColor: cfg.color,
          borderRadius,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div ref={contentRef}>
          {children ?? (
            <span
              style={{
                color: "#4E4D5C",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              Burst Reveal
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const catalogEntry = {
  name: "BurstReveal",
  category: "entrance" as const,
  description: "物体高频收缩抖动 → 爆发圆形展开 → 内容交错淡入",
  params: {
    seed: { type: "string", default: '"default"', desc: "随机种子" },
    squeezeDuration: { type: "number", default: "30", desc: "蓄力阶段帧数" },
    burstDuration: { type: "number", default: "36", desc: "爆发阶段帧数" },
    revealDuration: { type: "number", default: "54", desc: "淡入阶段帧数" },
    size: { type: "number", default: "80", desc: "初始物体尺寸 px" },
    color: { type: "string", default: '"#CBC0D3"', desc: "物体背景色" },
  },
};
