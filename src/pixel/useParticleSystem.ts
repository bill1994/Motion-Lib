import React, { useState, useCallback } from "react";
import type { PixelParticle } from "./PixelSpriteDef";

/**
 * A lightweight React component that renders an array of `PixelParticle`
 * as absolutely-positioned 20×20 pixel divs.
 *
 * Each particle's opacity fades with its remaining `life` value so particles
 * smoothly disappear as they die.
 *
 * @param particles – The current frame's particle array.
 */
export const ParticleLayer: React.FC<{ particles: PixelParticle[] }> = ({
  particles,
}) => {
  return React.createElement(
    React.Fragment,
    null,
    particles.map((p, i) =>
      React.createElement("div", {
        key: i,
        style: {
          position: "absolute",
          left: p.x,
          top: p.y,
          width: 20,
          height: 20,
          backgroundColor: p.color,
          opacity: Math.max(0, p.life),
          pointerEvents: "none",
        },
      }),
    ),
  );
};

/**
 * Result returned by {@link useParticleSystem}.
 */
export interface UseParticleSystemResult {
  /** All active particles for the current frame. */
  particles: PixelParticle[];

  /** Spawn a new particle at `(x, y)` with upward velocity and the given color. */
  addParticle: (x: number, y: number, color: string) => void;

  /**
   * Advance every particle one tick: apply velocity, gravity (`vy += 0.04`),
   * decay life (`life -= 0.02`), and remove dead (`life <= 0`) particles.
   *
   * **Must be called each frame** (e.g. via `useCurrentFrame()` + `useEffect`
   * or inside a Remotion `<Sequence>`).
   */
  tickParticles: () => void;

  /**
   * A zero-prop convenience component that renders the hook's internal
   * particles via {@link ParticleLayer}.
   *
   * Because it reads `particles` from the hook's closure you do **not** need
   * to pass particles manually — just drop `<result.ParticleLayer />` in your
   * component's JSX.
   */
  ParticleLayer: React.FC;
}

/**
 * `useParticleSystem` — React hook for a lightweight pixel-particle system
 * designed for Remotion compositions.
 *
 * **Usage pattern:**
 *
 * ```tsx
 * const { addParticle, tickParticles, ParticleLayer } = useParticleSystem();
 *
 * // Inside a `useEffect` / `useCallback` driven by `useCurrentFrame()`:
 * React.useEffect(() => {
 *   tickParticles();
 *   if (shouldSpawn) {
 *     addParticle(200, 300, "#FF69B4");
 *   }
 * }, [frame]);
 *
 * // In JSX:
 * return <ParticleLayer />;
 * ```
 *
 * Particles are 20×20 coloured divs with opacity = remaining life, driven by
 * a simple Euler-integration physics tick (velocity + gravity + lifetime
 * decay).
 */
export function useParticleSystem(randomFn?: () => number): UseParticleSystemResult {
  const rng = randomFn ?? Math.random.bind(Math);
  const [particles, setParticles] = useState<PixelParticle[]>([]);

  const addParticle = useCallback(
    (x: number, y: number, color: string) => {
      const vx = rng() * 2 - 1;
      const vy = rng() * -2 + -2;

      setParticles((prev) => [
        ...prev,
        { x, y, vx, vy, life: 1.0, color },
      ]);
    },
    [rng],
  );

  const tickParticles = useCallback(() => {
    setParticles((prev) => {
      const next: PixelParticle[] = [];

      for (let i = 0; i < prev.length; i++) {
        const p = prev[i];
        // Apply velocity, gravity, and decay
        const newX = p.x + p.vx;
        const newY = p.y + p.vy;
        const newVy = p.vy + 0.04;
        const newLife = p.life - 0.02;

        if (newLife > 0) {
          next.push({
            x: newX,
            y: newY,
            vx: p.vx,
            vy: newVy,
            life: newLife,
            color: p.color,
          });
        }
      }

      return next;
    });
  }, []);

  const ParticleLayerComponent: React.FC = useCallback(() => {
    return React.createElement(ParticleLayer, { particles });
  }, [particles]);

  return {
    particles,
    addParticle,
    tickParticles,
    ParticleLayer: ParticleLayerComponent,
  };
}
