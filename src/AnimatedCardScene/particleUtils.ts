import { ParticleState } from './types'

export function hashString(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

export function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createRng(seed: string): () => number {
  return mulberry32(hashString(seed))
}

const PARTICLE_COLORS = [
  "rgba(255,182,193,", // 淡粉
  "rgba(173,216,230,", // 淡蓝
  "rgba(216,191,216,", // 淡紫
  "rgba(255,218,185,", // 桃色
  "rgba(240,230,140,", // 淡金
  "rgba(152,251,152,", // 淡绿
  "rgba(255,192,203,", // 粉红
];

export interface ParticleFrameState {
  x: number
  y: number
  size: number
  opacity: number
  color: string
}

export function createParticle(
  index: number,
  rng: () => number,
  cx: number,
  cy: number,
  minSpeed: number,
  maxSpeed: number,
  minSize: number,
  maxSize: number,
  introDuration: number,
): ParticleState {
  const angle = rng() * 2 * Math.PI
  const speed = minSpeed + rng() * (maxSpeed - minSpeed)
  return {
    originX: cx,
    originY: cy,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size: minSize + rng() * (maxSize - minSize),
    color: PARTICLE_COLORS[Math.floor(rng() * PARTICLE_COLORS.length)],
    delay: Math.max(0, introDuration - 8 + Math.floor(rng() * 6)),
  }
}

export function createParticles(
  count: number,
  seed: string,
  cx: number,
  cy: number,
  minSpeed: number,
  maxSpeed: number,
  minSize: number,
  maxSize: number,
  introDuration: number,
): ParticleState[] {
  const rng = createRng(seed)
  const particles: ParticleState[] = []
  for (let i = 0; i < count; i++) {
    particles.push(
      createParticle(i, rng, cx, cy, minSpeed, maxSpeed, minSize, maxSize, introDuration),
    )
  }
  return particles
}

function geometricSeriesSum(rate: number, terms: number): number {
  if (rate === 1) return terms
  return (1 - Math.pow(rate, terms)) / (1 - rate)
}

export function getParticleState(
  p: ParticleState,
  frame: number,
  introEnd: number,
  fadeDuration: number,
  gravity: number,
  drag: number,
): ParticleFrameState {
  const t = Math.max(0, frame - p.delay)

  let x: number
  let y: number

  if (drag === 1) {
    x = p.originX + p.vx * t
    y = p.originY + p.vy * t + 0.5 * gravity * t * (t - 1)
  } else {
    const gs = geometricSeriesSum(drag, t)
    const invDrag = 1 / (1 - drag)
    x = p.originX + p.vx * gs
    y = p.originY + p.vy * gs + gravity * invDrag * (t - gs)
  }

  let opacity: number
  if (frame < p.delay) {
    opacity = 0
  } else if (frame < introEnd) {
    opacity = 1
  } else {
    opacity = Math.max(0, 1 - (frame - introEnd) / (fadeDuration * 0.7))
  }

  const shrinkProgress = t / (fadeDuration * 0.6)
  const size = p.size * Math.max(0, 1 - shrinkProgress)

  return { x, y, size, opacity, color: `${p.color}${opacity})` }
}
