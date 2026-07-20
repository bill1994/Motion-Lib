export interface CardContentProps {
  title: string
  subtitle?: string
  imageUrl?: string
  description?: string
  accentColor?: string
}

export interface ParticleState {
  originX: number
  originY: number
  vx: number
  vy: number
  size: number
  color: string
  delay: number
}

export type EntranceStyle = 'default' | 'cardFlyUp'

export type CardPhase = 'intro' | 'hold' | 'outro'

export interface PhaseInfo {
  phase: CardPhase
  progress: number
}
