import { useLayoutEffect, useRef } from 'react';
import type { ParticleState } from './types';
import { getParticleState } from './particleUtils';

export interface ParticleCanvasProps {
  particles: ParticleState[];
  frame: number;
  introDuration: number;
  fadeDuration: number;
  gravity: number;
  drag: number;
  width: number;
  height: number;
}

export function ParticleCanvas({
  particles,
  frame,
  introDuration,
  fadeDuration,
  gravity,
  drag,
  width,
  height,
}: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    for (const particle of particles) {
      const state = getParticleState(
        particle,
        frame,
        introDuration,
        fadeDuration,
        gravity,
        drag,
      );

      ctx.beginPath();
      ctx.arc(state.x, state.y, state.size, 0, Math.PI * 2);
      ctx.fillStyle = state.color;
      ctx.fill();
    }
  }, [frame, particles, introDuration, fadeDuration, gravity, drag, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
