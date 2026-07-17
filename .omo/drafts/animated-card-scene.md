---
slug: animated-card-scene
status: drafting
intent: clear
pending-action: write .omo/plans/animated-card-scene.md
approach: Create 6 files under src/AnimatedCardScene/ — config, types, physics utils, Canvas particles, card shell, card content — then register in Root.tsx
---

# Draft: animated-card-scene

## Components (topology ledger)
| id | outcome | status | evidence path |
|----|---------|--------|---------------|
| config.ts | Motion system config center | active | user spec + existing CardFlyUp/HeroReveal default patterns |
| types.ts | TypeScript interfaces | active | user spec |
| particleUtils.ts | Closed-form particle physics + seed RNG | active | HeroReveal.tsx:16-32 (hashString+mulberry32); useParticleSystem.ts:109-134 (FORBIDDEN stateful pattern) |
| ParticleCanvas.tsx | Canvas rendering component | active | user spec + WaterOrb.tsx:142-151 (canvas render pattern) |
| CardReveal.tsx | Card reveal shell (rotation, scale, position, breathing) | active | CardFlyUp.tsx:77-234 (existing card pattern, CSS 3D transforms) |
| DefaultCardContent.tsx | Content layout with Tailwind | active | user spec |
| AnimatedCardScene.tsx | Scene orchestrator | active | user spec |
| Root.tsx registration | Register new composition | active | Root.tsx:32-148 (existing registration pattern) |

## Open assumptions (announced defaults)
| assumption | adopted default | rationale | reversible? |
|------------|----------------|-----------|-------------|
| Particle color palette | Use project palette `#CBC0D3`, `#4E4D5C`, `#1D1B20` with alpha | ALIGN: project AGENTS.md mandates these colors; no external design brief specifies others | Yes — user can pass custom colors |
| PRNG algorithm | Reuse djb2 hash + mulberry32 (from HeroReveal) as standalone copy in particleUtils.ts | ALIGN: existing project pattern; closed-form deterministic seed fits user's "基于 Seed 的确定性随机" requirement | Yes |
| Card CSS transforms | Use CSS `rotateY` w/ `perspective` for 3D card flip (via useCurrentFrame + interpolate) | ALIGN: CardFlyUp does same 3D transform approach; user spec says "绕垂直轴自转" = rotateY | No — spec explicitly requires this |
| Duration at composition level | 175 frames = (40 + 100 + 35) per config, registered as 180 to round up | SAFE: default config sums to 175; 180 gives 5-frame margin | Yes |
| Composition metadata | Use same calculateMetadata with ProRes 4444 alpha defaults | ALIGN: Root.tsx:20-27 all use this; AGENTS.md mandates transparent output | No — project standard |

## Findings (cited - path:lines)
1. **Existing stateful particle system MUST NOT be reused**: `useParticleSystem.ts` uses `velocity += gravity` Euler integration (line 118) with `useState` accumulation — exactly the forbidden pattern. User's spec mandates closed-form `position = f(frame)` exclusively.
2. **Existing PRNG exists in HeroReveal**: `hashString` (djb2) + `mulberry32` at `HeroReveal.tsx:16-32` — deterministic seed-based, frame-independent. Reusable as copy in particleUtils.ts.
3. **All compositions are flat in `src/`**: Root.tsx imports `"./ComponentName"` directly. Subdirectory `AnimatedCardScene/` will be first nested structure; imports become `"./AnimatedCardScene/AnimatedCardScene"`.
4. **Project uses CSS 3D transforms for card effects**: CardFlyUp uses `perspective`, `rotateX`, `translateZ`, `scale` — matches user's `rotateY` + `scale` spec.
5. **All compositions 1920×1080, 60fps, ~180 frames**: Root.tsx confirms consistent format. 175-frame config stays aligned.
6. **Tailwind v4 is available**: `index.css` has `@import "tailwindcss"` — DefaultCardContent can use Tailwind classes legally (not animation classes).

## Decisions (with rationale)

1. **File location: `src/AnimatedCardScene/`** — User explicitly specified this directory structure. First subdirectory component in project, but spec is clear.
2. **Standalone PRNG copy in particleUtils.ts** — Rather than refactoring HeroReveal.tsx (scope creep), particleUtils.ts gets its own copy of `hashString` + `mulberry32`. Both exports can be consolidated later if needed.
3. **Canvas HIDPI via `devicePixelRatio` scaling** — User spec demands sharp 4K output. Canvas context gets `canvas.width = width * dpr; canvas.height = height * dpr; ctx.scale(dpr, dpr)`. Required for any Canvas rendering in Remotion.
4. **Hold phase `Math.sin` phase continuity at t=0** — sin(0) = 0 enforced by using `phaseStartFrame` as t=0 in the sin calculation, preventing Y jump at intro→hold transition.
5. **Outro `rotateY` returns to `rotateYStart`** — Symmetric with intro, animating from 0° back to 90°, preventing card orientation discontinuity.

## Scope IN

- 6 new files under `src/AnimatedCardScene/` — config, types, particleUtils, ParticleCanvas, CardReveal, DefaultCardContent, AnimatedCardScene
- Register `AnimatedCardScene` composition in `Root.tsx` with ID `"AnimatedCardScene"`
- All animation driven by `useCurrentFrame()` — no GSAP, no CSS keyframes, no CSS animation classes
- Canvas particles via closed-form analytical trajectory — no stateful Euler integration
- Deterministic PRNG based on seed prop — no `Math.random()`
- HIDPI Canvas rendering for sharp 4K output
- `catalogEntry` export per project convention
- ProRes 4444 with alpha support via existing `calculateMetadata`

## Scope OUT (Must NOT have)

- NO modification to HeroReveal.tsx or any existing component except Root.tsx for registration
- NO GSAP dependency or usage — all frame-driven with `useCurrentFrame` + `interpolate` + `Easing`
- NO stateful particle system (no `useState` for particle positions, no `velocity += gravity`)
- NO `Math.random()` in rendering path
- NO CSS keyframes or Tailwind animation classes
- NO `useParticleSystem.ts` reuse or modification
- NO `requestAnimationFrame` — only Remotion frame loop
- NO hardcoded dimensions — always use `useVideoConfig()`

## Open questions

None — all forks resolved from codebase or user spec.

## Approval gate
status: approved
pending-action: execute .omo/plans/animated-card-scene.md
