export type GlowColorVariant = 'mono' | 'rainbow' | 'ocean' | 'sunset' | 'custom';

const PRESETS: Record<Exclude<GlowColorVariant, 'mono' | 'custom'>, string[]> = {
  rainbow: [
    '#ff3264',
    '#ff2080',
    '#cc44ff',
    '#6446ff',
    '#288cff',
    '#1db9aa',
    '#32c850',
    '#ffcc00',
    '#ff6600',
  ],
  ocean: [
    '#6446ff',
    '#288cff',
    '#1db9aa',
    '#32c850',
    '#1db9aa',
    '#288cff',
    '#6446ff',
  ],
  sunset: ['#ff3264', '#ff6600', '#ffcc00', '#ff6600', '#ff3264'],
};

const DEFAULT_COLOR = '#CBC0D3';

/**
 * Returns a valid CSS `conic-gradient()` string for the given variant.
 *
 * - `mono`:   Two stops of the same color (defaults to `#CBC0D3`).
 * - `custom`: Returns `color` as-is (pass a full gradient CSS string).
 * - Others:   Uses the built-in preset palette.
 */
export function getGradientString(
  variant: GlowColorVariant,
  color?: string,
): string {
  switch (variant) {
    case 'mono': {
      const c = color || DEFAULT_COLOR;
      return `conic-gradient(from 0deg at center, ${c}, ${c})`;
    }
    case 'custom': {
      return color ?? '';
    }
    default: {
      const colors = PRESETS[variant];
      return `conic-gradient(from 0deg at center, ${colors.join(', ')})`;
    }
  }
}
