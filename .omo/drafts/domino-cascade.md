---
slug: domino-cascade
status: awaiting-approval
intent: clear
pending-action: write .omo/plans/domino-cascade.md
approach: Create a new Remotion component DominoCascade.tsx that implements a 3D domino entry + cascade animation using the existing CSS 6-face block construction pattern and project color system.
---

# Draft: domino-cascade

## Components (topology ledger)
| id | outcome | status |
|----|---------|--------|
| DominoCascade component | New Remotion component for 3D domino entry + fall animation | active |
| Root.tsx registration | Composition entry for DominoCascade | active |

## Open assumptions (announced defaults)
| assumption | adopted default | rationale | reversible? |
|-----------|----------------|-----------|-------------|
| Block count | 4 | User's primary example | Yes - configurable param |
| Stagger between blocks entry | 12 frames (0.2s @60fps) | User specified 0.2s | Yes - configurable |
| Block dimensions | 20×150×100 px (width×height×depth) | Matches original CSS | Yes - configurable |
| Entry animation type | Slide up from below viewport | Cleanest entry for domino blocks | Yes - can be changed |
| Y-axis rotation range | 3-8° | User specified for 3D look | Yes - configurable |
| Block colors | Orange palette matching CSS, adapted to design system | Preserves the original visual while fitting the project | Yes - easy to change |
| Text on individual blocks | Supported via `texts` prop | User requested in approval note | Yes - optional param |
| Entry timing per block | 0.2s stagger (12 frames) | User specified | Yes - configurable |
| Domino fall stagger | 3 frames between blocks | Creates natural cascade | Yes - configurable |

## Findings (cited - path:lines)
- Project uses Remotion v4.0.479, GSAP v3.15.0, Tailwind v4 (package.json:8-19)
- Existing 3D work uses Three.js (@react-three/fiber) for WaterOrb and LiquidGlass (WaterOrb.tsx:179-188)
- GlassCard uses CSS 3D transforms with perspective (GlassCard.tsx:59)
- Phase-based animation pattern exists in animations.ts (computePhase function)
- Color system: #CBC0D3 primary, #4E4D5C secondary, #1D1B20 text primary (AGENTS.md)
- All compositions: 1920×1080, 60fps, 180 frames default (Root.tsx:81-87)
- Deterministic PRNG (djb2+mulberry32) used for reproducible renders (HeroReveal.tsx:16-32)
- GSAP integration rules: {paused: true} timelines, seconds-seek formula, gsap.context lifecycle (AGENTS.md)
- Animation Architecture Rules: Phase-Based Progression, Single-Frame Snapshot, Ready Guard, CSS Over JS (AGENTS.md)
- CSS 3D block construction uses 6-walled box (front/back/top/bottom/left/right) with transform-style: preserve-3d

## Decisions (with rationale)
1. **New component vs extend GlassCard**: New standalone DominoCascade component. GlassCard is specialized for glass-morphism card reveal animations; the domino effect is fundamentally different (3D block physics with entry + fall phases). Clean separation avoids complexity.
2. **Pure CSS transforms vs Three.js**: Use pure CSS 3D transforms (preserve-3d) since the effect is a CSS-based visual. Three.js would be overkill for simple 3D blocks. The CSS approach matches the original code and is lighter.
3. **Phase-based progression**: Follow the Animation Architecture Rules with explicit phases (entry → settle → domino) using Single-Frame Snapshot Principle.
4. **Block construction**: Build each block as 6 absolutely-positioned `<div>` faces (front/back/top/bottom/left/right) nested in a `transform-style: preserve-3d` container, exactly matching the original CSS approach.

## Scope IN
- New `src/DominoCascade.tsx` component
- Composition registration in `src/Root.tsx`
- Configurable props: count, blockWidth, blockHeight, blockDepth, stagger (entry), yRotation range, xOffset, yOffset, zOffset, texts
- Entry phase: blocks slide up from below into Y-determined position, staggered 0.2s each
- Domino fall phase: leftmost block falls first, cascading right with stagger
- 3D appearance via 3-8° Y-axis rotation per block
- 6-faced 3D block rendering
- Text rendering on block front faces
- Transparent alpha support (ProRes 4444 compatible)

## Scope OUT (Must NOT have)
- NO Three.js or @react-three/fiber usage for this component
- NO external dependencies beyond current project packages
- NO GSAP timeline usage (use Remotion's useCurrentFrame for frame-accurate rendering)
- NO changes to existing GlassCard, AnimatedCardScene, or other components
- NO particle systems or complex physics simulations
- NO test files (project has no test infrastructure per AGENTS.md)

## Open questions
None resolved. Intent is clear: user specified exact behavior.
