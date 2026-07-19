import type { ReactNode } from 'react'

/** Card visual variant — controls layout and animation behaviour */
export type GlassCardVariant = 'title' | 'showcase'

/**
 * Per-frame animation state returned by phase functions.
 * All values are derived from the current Remotion frame via interpolate/spring.
 */
export interface PhaseState {
  /** Card left position in pixels */
  x: number
  /** Card top position in pixels */
  y: number
  /** Uniform scale (1 = normal size) */
  scale: number
  /** X-axis rotation in degrees */
  rotateX: number
  /** Y-axis rotation in degrees */
  rotateY: number
  /** Rim glow opacity, 0 (off) to 1 (full) */
  glowIntensity: number
  /** Card overall opacity, 0 (invisible) to 1 (fully opaque) */
  opacity: number
}

/** Parameters that control the glass visual layer */
export interface GlassVisualConfig {
  /** CSS colour for the neon rim glow */
  rimColor: string
  /** CSS colour for the bottom accent rail */
  accentColor: string
  /** Glass surface RGBA alpha, 0-1 */
  glassOpacity: number
  /** backdrop-filter blur radius in pixels */
  blurRadius: number
  /** Card border radius in pixels */
  borderRadius: number
}

/** Public props for the GlassCard component */
export interface GlassCardProps {
  children?: ReactNode
  variant: GlassCardVariant
  /** Card width in pixels (default: 400) */
  cardWidth?: number
  /** Card height in pixels (default: 280) */
  cardHeight?: number
  /** CSS colour for the neon rim glow */
  rimColor?: string
  /** CSS colour for the bottom accent rail */
  accentColor?: string
  /** Glass surface RGBA alpha (default: 0.06) */
  glassOpacity?: number
  /** backdrop-filter blur radius in px (default: 16) */
  blurRadius?: number
  /** Total animation duration in Remotion frames (default: 180 = 3s @ 60fps) */
  durationInFrames?: number
  /** Frame delay before animation starts */
  delay?: number
  /** Showcase fan rotateY in degrees (used when variant='showcase') */
  fanAngle?: number
  /** Showcase fan X offset from centre in px */
  fanOffsetX?: number
  /** Showcase fan Y offset from centre in px */
  fanOffsetY?: number
  /** CSS colour for text content inside the card */
  textColor?: string
}

export const DEFAULTS = {
  cardWidth: 400,
  cardHeight: 280,
  rimColor: '#CBC0D3',
  accentColor: '#CBC0D3',
  glassOpacity: 0.06,
  blurRadius: 16,
  borderRadius: 16,
  durationInFrames: 180,
  delay: 0,
  fanAngle: 0,
  fanOffsetX: 0,
  fanOffsetY: 0,
  textColor: '#CBC0D3',
} as const
