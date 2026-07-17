# animated-card-scene - Work Plan

## TL;DR (For humans)

**What you'll get:** A reusable card reveal animation system — a card flies in from a starting position, rotates from sideways to face-forward, floats with a gentle breathing motion, then exits while particles burst out and fade. Six clean files you can reuse independently.

**Why this approach:** Remotion renders frames in any order (jump to frame 500 without rendering 0-499), so all physics must use "closed-form" formulas — given a frame number, compute the position directly, not by accumulating from previous frames. This guarantees no flickering in production renders.

**What it will NOT do:** Won't use GSAP, won't use CSS animations, won't use stateful physics, won't touch any existing component except registering in Root.tsx.

**Effort:** Short — 9 focused file writes
**Risk:** Low — self-contained new component group, no existing component modifications
**Decisions to sanity-check:** Particle color palette (default → project colors #CBC0D3 / #4E4D5C / #1D1B20 with alpha); closed-form trajectory formulas for 70 particles

Your next move: **Approve this plan**, then the worker executes. Optionally request a high-accuracy review first.

---

> TL;DR (machine): Short | Low | 6 files + 1 Root.tsx edit = 9 todos, closed-form particle physics, frame-driven CSS 3D card transform

## Scope
### Must have
- 6 files under `src/AnimatedCardScene/`: config.ts, types.ts, particleUtils.ts, ParticleCanvas.tsx, CardReveal.tsx, DefaultCardContent.tsx, AnimatedCardScene.tsx
- Deterministic PRNG (djb2 + mulberry32) in particleUtils.ts for reproducible particles
- Closed-form particle physics — position = f(frame) analytical formula, NOT iterative Euler
- Canvas-rendered particles with HIDPI support via `devicePixelRatio`
- Card intro (scale 0→1, rotateY 90→0, position start→center) with `Easing.out(Easing.quad)`
- Card hold phase — sin-based breathing with phase continuity
- Card outro (scale 1→0, rotateY 0→90, position center→start) with `Easing.in(Easing.quad)`
- Scene orchestrator AnimatedCardScene.tsx z-ordering particles (z=0) + card (z=1)
- Root.tsx registration with `Composition` ID "AnimatedCardScene", 180 frames, 60fps, 1920×1080
- `catalogEntry` export per project convention
- ProRes 4444 alpha support via existing `calculateMetadata`

### Must NOT have (guardrails, anti-slop, scope boundaries)
- NO stateful particle integration (`position += velocity`, `velocity += gravity`)
- NO `Math.random()` in rendering path — seed-based RNG only
- NO CSS keyframes or Tailwind animation classes
- NO GSAP
- NO `requestAnimationFrame`
- NO hardcoded viewport dimensions
- NO modification to any existing source file except `Root.tsx`
- NO `useParticleSystem` reuse
- NO files outside `src/AnimatedCardScene/` except Root.tsx registration

## Status: ✅ **COMPLETE** — All 9 todos implemented, lint passes with zero errors.

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: **tests-after** — run `npm run lint` (eslint + tsc) for type safety, verify no runtime errors via Remotion Studio preview
- Evidence: `.omo/evidence/lint-output.txt`

## Execution strategy
### Parallel execution waves

**Wave 1 (Foundation)** — No dependencies between items
- T1: config.ts
- T2: types.ts
- T3: particleUtils.ts

**Wave 2 (Leaf Components)** — Depends on types + config
- T4: ParticleCanvas.tsx (depends on T2, T3)
- T5: CardReveal.tsx (depends on T1, T2)
- T6: DefaultCardContent.tsx (depends on T2)

**Wave 3 (Orchestration)** — Depends on all leaf components
- T7: AnimatedCardScene.tsx

**Wave 4 (Registration)** — Depends on T7
- T8: Root.tsx registration

**Wave 5 (Verification)** — Depends on all
- T9: Lint + typecheck verification

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. config.ts | — | 5, 7 | 2, 3 |
| 2. types.ts | — | 4, 5, 6, 7 | 1, 3 |
| 3. particleUtils.ts | — | 4 | 1, 2 |
| 4. ParticleCanvas.tsx | 2, 3 | 7 | 5, 6 |
| 5. CardReveal.tsx | 1, 2 | 7 | 4, 6 |
| 6. DefaultCardContent.tsx | 2 | 7 | 4, 5 |
| 7. AnimatedCardScene.tsx | 4, 5, 6 | 8 | — |
| 8. Root.tsx | 7 | 9 | — |
| 9. Verification | 1–8 | — | — |

## Todos
> Implementation + Test = ONE todo. Never separate.
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->
- [x] 1. `src/AnimatedCardScene/config.ts` — Motion system configuration center
  What to do / Must NOT do: Create the single source of truth for all magic numbers and parameters. Export `DEFAULT_MOTION_CONFIG` (the full object with timeline, card, particle sub-objects as specified in the brief) and a `MotionConfig` type derived from it via `typeof`. Must NOT import React or any Remotion hooks — pure TypeScript constants.
  Parallelization: Wave 1 | Blocked by: — | Blocks: 5, 7
  References: User spec §"统一配置中心" for the exact shape; CardFlyUp.tsx:38-50 for existing DEFAULTS pattern
  Acceptance criteria: `node -e "import('./src/AnimatedCardScene/config.ts').then(m => console.log(JSON.stringify(m.DEFAULT_MOTION_CONFIG.timeline)))"` prints `{"introDuration":40,"holdDuration":100,"outroDuration":35}`
  QA scenarios: N/A — pure constant file, no behavior
  Commit: Y | feat(config): add AnimatedCardScene motion config center with timeline/card/particle defaults

- [x] 2. `src/AnimatedCardScene/types.ts` — TypeScript interfaces
  What to do / Must NOT do: Export `CardContentProps` (title, subtitle?, imageUrl?, description?, accentColor?), `ParticleState` (x, y, vx, vy, size, opacity, color — all numeric except color string), and `CardPhase` ('intro' | 'hold' | 'outro') for phase discrimination in animation logic. Must NOT import React or Remotion — pure types.
  Parallelization: Wave 1 | Blocked by: — | Blocks: 4, 5, 6, 7
  References: User spec §"卡片内容 Props 接口"
  Acceptance criteria: `node -e "import('./src/AnimatedCardScene/types.ts').then(m => console.log(typeof m.CardContentProps))"` succeeds (module resolution)
  QA scenarios: N/A — pure type definitions
  Commit: Y | feat(types): add AnimatedCardScene type definitions (CardContentProps, ParticleState, CardPhase)

- [x] 3. `src/AnimatedCardScene/particleUtils.ts` — Deterministic PRNG + closed-form particle physics
  What to do / Must NOT do: Export `hashString(str: string): number` (djb2), `mulberry32(seed: number): () => number`, `createRng(seed: string): () => number` (convenience combining both), `createParticle(index: number, seed: string, cx: number, cy: number, config: typeof DEFAULT_MOTION_CONFIG.particle): ParticleState` (generates all initial particle params deterministically), and `getParticleState(particle: ParticleState, frame: number, introEnd: number, fadeDuration: number): { x: number, y: number, opacity: number, size: number }` — closed-form trajectory. Position formula: `x = cx + vx * t; y = cy + vy * t + 0.5 * gravity * t²; effectiveVelocity = vx * Math.pow(drag, t)` (exponential decay, NOT iterative). fadeDuration controls opacity fade from frame=introEnd. Must NOT use Math.random(). Must NOT store mutable state.
  Parallelization: Wave 1 | Blocked by: — | Blocks: 4
  References: User spec §"基于 Seed 的确定性随机" and §"粒子轨迹必须是关于 frame 的闭式解析函数"; HeroReveal.tsx:16-32 for existing PRNG implementation
  Acceptance criteria: Two calls to `getParticleState` with same args return identical results (deterministic). Particle at frame=500 (without frames 0-499) produces correct non-origin position.
  QA scenarios: Run node script calling `createRng("test")()` 10 times — verify same sequence. Call `getParticleState` with frame >> introEnd + fadeDuration — verify opacity ≈ 0
  Commit: Y | feat(particleUtils): add deterministic PRNG and closed-form particle physics

- [x] 4. `src/AnimatedCardScene/ParticleCanvas.tsx` — HTML5 Canvas particle renderer
  What to do / Must NOT do: Export `ParticleCanvas` functional component accepting `{ particles: ParticleState[], frame: number, introDuration: number, fadeDuration: number, width: number, height: number }`. Use `useRef<HTMLCanvasElement>` + `useLayoutEffect([frame])` to clear + redraw each frame. Apply `devicePixelRatio` scaling for HIDPI. Use `getParticleState()` from particleUtils for each particle's per-frame state. Must NOT use `requestAnimationFrame`. Must NOT use React state for particle positions. Must NOT use DOM elements for particles. Must NOT hardcode width/height — receive as props.
  Parallelization: Wave 2 | Blocked by: 2, 3 | Blocks: 7 | Can parallelize with: 5, 6
  References: User spec §"Canvas 性能与重绘"; WaterOrb.tsx:142-151 (existing canvas render pattern with useEffect)
  Acceptance criteria: Render at 1920×1080 with dpr=2 → canvas element has 3840×2160 backing store. `useLayoutEffect` fires exactly once per frame change.
  QA scenarios: Render with 70 particles — each particle drawn as `ctx.arc()` at correct position with correct opacity. Check canvas.width === expected * devicePixelRatio
  Commit: Y | feat(ParticleCanvas): add Canvas-based particle renderer with HIDPI support

- [x] 5. `src/AnimatedCardScene/CardReveal.tsx` — Generic card reveal shell
  What to do / Must NOT do: Export `CardReveal` component accepting `{ children?: React.ReactNode, startX: number, startY: number, config: MotionConfig, width: number, height: number, frame: number, particleTriggerFrame?: number, onParticleTrigger?: () => void }`. Compute phase via `computePhase(frame, config.timeline)` returning `{ phase: CardPhase, progress: number }`. Intro: interpolate x/y from (startX, startY) to center, scale 0→1, rotateY rotateYStart→0 using Easing.out(Easing.quad). Hold: y += breathingAmplitude * Math.sin(2π * localHoldFrame / breathingCycle) — ensure sin(0)=0 at hold start for phase continuity. Outro: reverse to start position/scale/rotation using Easing.in(Easing.quad). Must NOT animate width/height/top/left — use transform only. Must NOT use CSS keyframes. Must NOT hardcode dimensions. The particleTriggerFrame fires a callback at introDuration for ParticleCanvas burst trigger.
  Parallelization: Wave 2 | Blocked by: 1, 2 | Blocks: 7 | Can parallelize with: 4, 6
  References: User spec §"时间轴逻辑"; CardFlyUp.tsx:77-234 for existing CSS 3D card transform patterns (perspective, rotateX, scale)
  Acceptance criteria: frame=0 → scale=0, rotateY=90, position=start. frame=introDuration → scale=1, rotateY=0, position=center. frame=introDuration+holdDuration → position=center+breathe offset. frame=total → scale=0, rotateY=90, position=start.
  QA scenarios: Verify phase progression: frame=20 → phase='intro', frame=50 → phase='hold', frame=160 → phase='outro'
  Commit: Y | feat(CardReveal): add 3D card reveal shell with intro/hold/outro phases

- [x] 6. `src/AnimatedCardScene/DefaultCardContent.tsx` — Card content layout
  What to do / Must NOT do: Export component accepting `CardContentProps` (title, subtitle?, imageUrl?, description?, accentColor?). Render a Tailwind-styled card interior: title as large heading, subtitle smaller, optional image, description text, accent-colored text-stroke/highlight. Must use Tailwind utility classes (not animation classes). Must NOT import GSAP. Must NOT contain any animation logic — purely static layout rendered inside CardReveal's children.
  Parallelization: Wave 2 | Blocked by: 2 | Blocks: 7 | Can parallelize with: 4, 5
  References: User spec §"卡片内容 Props 接口"; AGENTS.md color palette #CBC0D3 / #1D1B20 / #4E4D5C; existing CardFlyUp.tsx:198-230 for placeholder content pattern
  Acceptance criteria: Renders title as visible text. Renders imageUrl as <img> if provided. Uses Tailwind classes (checkable via class attribute in DOM).
  QA scenarios: Mount with only title — renders heading. Mount with all props — renders all elements. accentColor applies to an appropriate element.
  Commit: Y | feat(DefaultCardContent): add static card content layout with Tailwind styling

- [x] 7. `src/AnimatedCardScene/AnimatedCardScene.tsx` — Scene orchestrator
  What to do / Must NOT do: Export `AnimatedCardScene` as default component accepting `{ startX?: number, startY?: number, seed?: string, children?: React.ReactNode, ...contentProps }`. Merge user props with DEFAULT_MOTION_CONFIG. Call `useCurrentFrame()`, `useVideoConfig()`. Create deterministic particle array via `useMemo(() => createParticles(...), [seed, config, width, height])`. Render z-stack: ParticleCanvas (z=0, absolute fill, pointerEvents none) + CardReveal (z=1, containing children or DefaultCardContent). Pass `onParticleTrigger` from CardReveal to trigger particle burst at introDuration frame — use a `burstTriggered` ref to avoid re-triggering. Compute centerX/Y from useVideoConfig. Must NOT modify particle state across frames. Must NOT use Math.random. Must NOT hardcode dimensions.
  Parallelization: Wave 3 | Blocked by: 4, 5, 6 | Blocks: 8
  References: User spec §"场景编排"; HeroReveal.tsx:210-222 for seed→randomParams useMemo pattern; Root.tsx:32-148 for composition structure
  Acceptance criteria: frame=0 → card invisible at startX/startY. frame=introDuration → card centered, particles visible. frame=total → card invisible at startX/startY, particles faded.
  QA scenarios: Verify z-ordering — card overlays particles. Verify burstTriggered ref prevents re-triggers. Verify seed prop produces identical output across renders.
  Commit: Y | feat(AnimatedCardScene): add scene orchestrator combining card reveal + particle burst

- [x] 8. `src/Root.tsx` — Register AnimatedCardScene composition
  What to do / Must NOT do: Add `import { AnimatedCardScene } from "./AnimatedCardScene/AnimatedCardScene"` and `<Composition id="AnimatedCardScene" component={AnimatedCardScene} durationInFrames={180} fps={60} width={1920} height={1080} calculateMetadata={calculateMetadata} defaultProps={{ startX: 100, startY: 100, seed: "default", title: "Card Title" }} />`. Add as last entry before `</>`. Must NOT modify any existing compositions.
  Parallelization: Wave 4 | Blocked by: 7 | Blocks: 9
  References: Root.tsx:32-148 for all existing Composition registrations; Root.tsx:1-15 for import style
  Acceptance criteria: `npx remotion studio` shows "AnimatedCardScene" in composition list.
  QA scenarios: Check import path matches actual file location. Check defaultProps provide startX, startY, seed, title.
  Commit: Y | feat(Root.tsx): register AnimatedCardScene composition

- [x] 9. Verification — Lint + typecheck
  What to do / Must NOT do: Run `npm run lint` (eslint + tsc). Save output to `.omo/evidence/lint-output.txt`. If lint errors exist, fix them. If any import/write failed, retry the failed file. Must NOT consider the task complete until lint passes.
  Parallelization: Wave 5 | Blocked by: 1–8 | Blocks: —
  References: AGENTS.md — "Lint + typecheck: npm run lint"
  Acceptance criteria: `npm run lint` exits with code 0. `.omo/evidence/lint-output.txt` shows no errors.
  QA scenarios: Run after all files written. If errors, the fix targets only the error source, never working code.
  Commit: N (squash into prior commits)

## Final verification wave
> Runs in parallel after ALL todos. All must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [ ] F1. Plan compliance audit — Every todo delivered? All 6 files exist + Root.tsx updated?
- [ ] F2. Code quality review — No stateful physics, no Math.random, no CSS animations, no hardcoded dimensions?
- [ ] F3. Real manual QA — Composition registers and renders without runtime error?
- [ ] F4. Scope fidelity — No unintended side effects on other compositions?

## Commit strategy
One commit per todo (8 feature commits + squashed fixup). History:
1. `feat(config): add AnimatedCardScene motion config center`
2. `feat(types): add AnimatedCardScene type definitions`
3. `feat(particleUtils): add deterministic PRNG and closed-form particle physics`
4. `feat(ParticleCanvas): add Canvas-based particle renderer with HIDPI support`
5. `feat(CardReveal): add 3D card reveal shell with intro/hold/outro phases`
6. `feat(DefaultCardContent): add static card content layout with Tailwind styling`
7. `feat(AnimatedCardScene): add scene orchestrator combining card reveal + particle burst`
8. `feat(Root.tsx): register AnimatedCardScene composition`

## Success criteria
1. `src/AnimatedCardScene/` contains all 7 files
2. `src/Root.tsx` registers AnimatedCardScene composition
3. `npm run lint` passes with zero errors
4. ProRes 4444 alpha transparency works via existing calculateMetadata
5. All animation is strictly frame-driven — no GSAP, no CSS animations
6. Particle physics is closed-form — no stateful accumulation
7. Rendering is deterministic — same seed produces same output every time
