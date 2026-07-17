# pixel-sprite-animation - Work Plan

## TL;DR (For humans)

**What you'll get:** A reusable pixel-art character animation engine for Remotion, plus a 3-second composition of Clawd (Claude's crab mascot) bouncing onto screen with expressive eyes, particle effects, and seamless looping — all rendered at 60fps with transparent alpha for ProRes 4444 output.

**Why this approach:** The div-based PixelSprite component integrates directly into your existing GSAP + Remotion pipeline (same paused+seek pattern as TextIntro), so all the animation expertise you already have carries over. A standalone composition keeps things testable and independent before you reuse the component in other contexts.

**What it will NOT do:** Canvas rendering, interactive/draggable characters, multi-character scenes, or AI-automated sprite generation.

**Effort:** Short
**Risk:** Low - all patterns (GSAP timeline, Remotion composition, ProRes export) already proven in project
**Decisions to sanity-check:** The PixelSpriteDef type shape (anchor system, facial feature mapping) and the grid resolution (px size)

Your next move: **Approve this plan**, then start work to execute it.

---

> TL;DR (machine): Short effort, low risk. Deliver: `PixelSpriteDef` types + `PixelSprite` div-grid component + Clawd sprite data + `ClawdDrop` composition + particle system. 4 waves, ~7 todos.

## Scope
### Must have
- `src/pixel/PixelSpriteDef.ts` — core types: `PixelSpriteDef`, `PixelSpriteVariant`, `FacialFeatureSet`, `PixelParticle`
- `src/pixel/PixelSprite.tsx` — React component: renders sprite grid as absolute-positioned divs, supports anchors + facial features + opacity
- `src/pixel/ClawdSprite.ts` — Clawd sprite data: body 14×8 grid, anchors, palette, eye variants (forward/right/left/down/blink) — data inlined in Todo 3
- `src/pixel/useParticleSystem.ts` — particle hook: add, tick, lifecycle, render overlay divs
- `src/pixel/easing.ts` — easeOut, easeInOut, lerp, getPhase utilities
- `src/ClawdDrop.tsx` — new composition: GSAP timeline driven Clawd animation, ~3s/180fps, enter + bounce + eyes + particles + hearts
- `src/Root.tsx` — register `<ClawdDrop>` as new composition
- `src/index.css` — add `image-rendering: pixelated` base style
- All existing lint rules pass, ProRes 4444 alpha renders correctly

### Must NOT have (guardrails, anti-slop, scope boundaries)
- NO Canvas 2D API usage — only div-based CSS rendering
- NO width/height/top/left animations — use x, y, scale, rotation, opacity only (AGENTS.md rule)
- NO external dependencies beyond existing (React, Remotion, GSAP)
- NO AI sprite generation — all sprite data hand-authored in this plan
- NO multi-character scenes — single character only
- NO interactive controls — frame-deterministic, playthrough only
- NOTE ON COLOR SYSTEM: Clawd character sprite uses its own palette (#CD6E58 body, #000000 eyes, #FF6B8A hearts) which are intentionally outside the project's brand color system (#CBC0D3 / #1D1B20 / #4E4D5C). This is acceptable because character art has independent color needs. The brand colors are for page backgrounds and UI text, not for character sprites.

## Verification strategy
- Test decision: tests-after (manual verification via Remotion Studio preview + lint + typecheck)
- Evidence: `.omo/evidence/pixel-sprite-animation/` — screenshots of composition in Remotion Studio, lint output, render output metadata

## Execution strategy
### Parallel execution waves

| Wave | Focus | Todos |
|------|-------|-------|
| 1 — Foundation | Types + rendering engine | 1, 2 |
| 2 — Sprite data | Clawd definition + utilities | 3, 4, 5 |
| 3 — Composition | ClawdDrop + Root registration | 6, 7 |
| 4 — Verify | Lint, typecheck, Studio preview, render test | 8 |

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. Types | — | 2 | — |
| 2. PixelSprite | 1 | 6 | 3, 4, 5 |
| 3. Clawd sprite data | — | 6 | 1, 4, 5 |
| 4. Particles | — | 6 | 1, 3, 5 |
| 5. Easing | — | 6 | 1, 3, 4 |
| 6. ClawdDrop | 2, 3, 4, 5 | 7 | — |
| 7. Root registration | 6 | 8 | — |
| 8. Verify | 7 | — | — |

## Todos
> Implementation + Test = ONE todo. Never separate.
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->

### Wave 1: Foundation

- [x] 1. `src/pixel/PixelSpriteDef.ts` — Define core types
  What to do: Create the pixel-sprite type system covering all data structures needed for the engine. Export every type used by downstream todos.
  What to do / Must NOT do:
  - Define `PixelSpriteDef`: `{ name, width, height, palette: Record<number, string>, grid: number[][], anchors?: Record<string, {x:number, y:number}> }`
  - Define `FacialFeatureVariant`: `{ anchor: string, offset?: {dx:number, dy:number}, hidden?: boolean }`
  - Define `FacialExpression`: `{ name: string, features: FacialFeatureVariant[] }`
  - Define `PixelParticle`: `{ x: number, y: number, vx: number, vy: number, life: number, color: string }`
  - Define `SpritePhase`: `{ name: string, start: number, end: number }`, and `PhaseState`: `{ phase: string, progress: number }`
  - MUST NOT include any rendering or GSAP code — pure types only
  - MUST NOT use `any` — all types exhaustively defined
  Parallelization: Wave 1 | Blocked by: — | Blocks: 2
  References: Clawd sprite data is inlined in Todo 3 of this plan. No external file needed.
  Acceptance criteria: `npx tsc --noEmit` passes; types importable and structurally complete
  QA scenarios: happy = `import { PixelSpriteDef } from './pixel/PixelSpriteDef'; const test: PixelSpriteDef = { ... }` compiles
  Commit: Y | feat(pixel): add core PixelSpriteDef type system

- [x] 2. `src/pixel/PixelSprite.tsx` — React pixel-grid rendering component
  What to do: Implement a React component that renders a `PixelSpriteDef` as a grid of absolute-positioned `<div>` elements (one per non-zero grid cell), with support for facial expression overlays and external transform control.
  What to do / Must NOT do:
  - Accept props: `sprite: PixelSpriteDef`, `expression: FacialExpression`, `x: number`, `y: number`, `scale?: number`, `rotation?: number`, `opacity?: number`, `children?: React.ReactNode`
  - Each pixel cell = `PX_SIZE × PX_SIZE` (constant 20px) div with `backgroundColor: palette[value]`
  - Outer container uses `position: absolute; transform: translate(Xpx, Ypx) scale(N) rotate(Ndeg)` for GPU-accelerated transform
  - Facial expression features rendered as overlay divs on top of base grid, using anchor offsets
  - `image-rendering: pixelated` on container
  - MUST NOT animate width/height/top/left
  - MUST NOT use Canvas API
  - MUST NOT add external state or effects — pure rendering from props
  - Children rendered inside container (for overlay content like particles)
  Parallelization: Wave 1 | Blocked by: 1 | Blocks: 6
  References: pixel grid rendering concept from CLAWD_BODY + drawClawd() pattern (analyzed earlier, data inlined in Todo 3); GPU-accelerated transforms rule from AGENTS.md
  Acceptance criteria: Renders a 14×8 Clawd shape in Remotion Studio when given Clawd sprite data; each pixel is a colored div at correct position
  QA scenarios: happy = mount in test composition with test sprite data; failure = empty sprite (all zeros) renders nothing
  Commit: Y | feat(pixel): add PixelSprite div-grid component

### Wave 2: Sprite data + Utilities

- [x] 3. `src/pixel/ClawdSprite.ts` — Clawd character sprite definition (DATA INLINED BELOW)
  What to do: Create the Clawd sprite definition using the data provided below. This is pure data — no rendering or animation logic.
  What to do / Must NOT do:
  - Define `CLAWD_SPRITE: PixelSpriteDef` with the following exact data:
    ```typescript
    export const CLAWD_SPRITE: PixelSpriteDef = {
      name: 'clawd',
      width: 14,
      height: 8,
      palette: { 1: '#CD6E58', 2: '#000000' },
      grid: [
        [0,0,0,1,1,1,1,1,1,1,1,0,0,0],  // row 0 — head
        [0,0,0,1,1,1,1,1,1,1,1,0,0,0],  // row 1 — head
        [0,1,1,1,1,1,1,1,1,1,1,1,1,0],  // row 2 — arms spread (12 wide)
        [0,1,1,1,1,1,1,1,1,1,1,1,1,0],  // row 3 — arms
        [0,0,0,1,1,1,1,1,1,1,1,0,0,0],  // row 4 — belly
        [0,0,0,1,1,1,1,1,1,1,1,0,0,0],  // row 5 — belly
        [0,0,0,1,0,1,0,0,1,0,1,0,0,0],  // row 6 — 4 legs (cols 3,5,8,10)
        [0,0,0,1,0,1,0,0,1,0,1,0,0,0],  // row 7 — legs
      ],
      anchors: {
        eyeLeft:  { x: 4, y: 1 },
        eyeRight: { x: 9, y: 1 },
        hatTop:   { x: 7, y: -1 },
        handLeft: { x: 0, y: 2 },
        handRight:{ x: 13, y: 2 },
        sitBottom:{ x: 7, y: 8 },
      },
    };
    ```
  - Define CLAWD_EXPRESSIONS as 5 variants, each is a `FacialExpression` with features that use anchor offsets:
    ```typescript
    // forward: eyes at default anchor position (offset 0,0)
    { name: 'forward', features: [
      { anchor: 'eyeLeft',  offset: {dx: 0, dy: 0} },
      { anchor: 'eyeRight', offset: {dx: 0, dy: 0} },
    ]}
    // look_right: pupils shift right 1 pixel
    { name: 'look_right', features: [
      { anchor: 'eyeLeft',  offset: {dx: 1, dy: 0} },
      { anchor: 'eyeRight', offset: {dx: 1, dy: 0} },
    ]}
    // look_left: pupils shift left 1 pixel
    { name: 'look_left', features: [
      { anchor: 'eyeLeft',  offset: {dx: -1, dy: 0} },
      { anchor: 'eyeRight', offset: {dx: -1, dy: 0} },
    ]}
    // look_down: pupils shift down 1 pixel
    { name: 'look_down', features: [
      { anchor: 'eyeLeft',  offset: {dx: 0, dy: 1} },
      { anchor: 'eyeRight', offset: {dx: 0, dy: 1} },
    ]}
    // blink: both eyes hidden (shown as body color)
    { name: 'blink', features: [
      { anchor: 'eyeLeft',  hidden: true },
      { anchor: 'eyeRight', hidden: true },
    ]}
    ```
  - The 14×8 grid uses palette index 1 for body (#CD6E58) and 2 for eye pupils. Rows 6-7 have `1,0,1,0,0,1,0,1` pattern meaning legs at columns 3, 5, 8, 10 (= four legs).
  - Clawd is a pixel-art crab with a flat-wide body (14 wide × 8 tall), coral-orange color.
  - MUST NOT contain any rendering or animation code
  - These colors (#CD6E58 body, #000000 eyes) are the Clawd character's intrinsic colors and are intentionally outside the project's brand color system (#CBC0D3 / #1D1B20 / #4E4D5C), since character art has independent color needs.
  Parallelization: Wave 2 | Blocked by: — | Blocks: 6
  References: Clawd sprite data is inlined above in this todo. No external file needed.
  Acceptance criteria: `npx tsc --noEmit` passes; `CLAWD_SPRITE.width === 14`, `CLAWD_SPRITE.grid.length === 8`
  QA scenarios: happy = import and verify grid has 14 columns, 8 rows, correct number of 1s (body cells) and 2s (eye cells); failure = grid with wrong dimensions causes type error
  Commit: Y | feat(pixel): add Clawd sprite data

- [x] 4. `src/pixel/useParticleSystem.ts` — Particle system hook
  What to do: React hook for a lightweight pixel-particle system. Manages a particle array with add/tick/render lifecycle, renders particles as colored divs.
  What to do / Must NOT do:
  - `useParticleSystem()` returns `{ particles, addParticle, tickParticles, ParticleLayer }`
  - `addParticle(x, y, color)` spawns a particle with random velocity + upward bias
  - `tickParticles()` updates positions (vx/vy → x/y, gravity 0.04, life -= 0.02)
  - `ParticleLayer` is a React component that renders current particles as 20×20 colored divs
  - Auto-cleanup: particles with life <= 0 removed
  - MUST NOT use Canvas
  - MUST NOT leak memory — particles array cleaned each frame
  Parallelization: Wave 2 | Blocked by: — | Blocks: 6
  References: particle system design (addParticle, tickParticles, life/velocity/gravity) described in this todo; pattern from Clawd template analyzed earlier
  Acceptance criteria: 20 particles added → tickParticles called → particles move upward then fall, life decreases, auto-removed at zero
  QA scenarios: happy = add 5 particles, tick 60 frames, all expired; failure = add 0 particles, tick runs without error
  Commit: Y | feat(pixel): add useParticleSystem hook

- [x] 5. `src/pixel/easing.ts` — Easing + phase utilities
  What to do: Extract Clawd's easing functions and phase system into reusable utilities matching the Remotion pattern.
  What to do / Must NOT do:
  - `easeOut(t: number): number` = 1 - (1-t)^3
  - `easeInOut(t: number): number` = t<0.5 ? 4t³ : 1-(-2t+2)³/2
  - `lerp(a, b, t): number` = a + (b-a)*t
  - `getPhase(phases: SpritePhase[], t: number): PhaseState | null` — find active phase by normalized time
  - MUST NOT duplicate Remotion's built-in `interpolate`/`Easing` — these are convenience wrappers for GSAP timeline usage
  Parallelization: Wave 2 | Blocked by: — | Blocks: 6
  References: standard cubic easing formulas (easeOut = 1-(1-t)³, easeInOut = t<0.5 ? 4t³ : 1-(-2t+2)³/2, lerp = a+(b-a)*t), phase system defined in Todo 1 types
  Acceptance criteria: easeOut(0)=0, easeOut(1)=1, easeInOut(0.5)=0.5, getPhase returns correct phase for t values
  QA scenarios: happy = easeOut(0.5) ≈ 0.875 (verify math); failure = getPhase with empty phases returns null
  Commit: Y | feat(pixel): add easing and phase utilities

### Wave 3: Composition

- [x] 6. `src/ClawdDrop.tsx` — ClawdDrop composition
  What to do: Create a full Remotion composition that renders a pixel Clawd entering the frame, bouncing, changing expressions, with particles and loop.
  What to do / Must NOT do:
  - 1920×1080, 180 frames, 60fps (same as existing compositions)
  - GSAP pattern: `gsap.timeline({ paused: true })` + `gsap.context(() => {...}, containerRef)` + `tl.seek(frame / fps)`
  - Import and use: `PixelSprite` + `CLAWD_SPRITE` + `CLAWD_EXPRESSIONS` + `useParticleSystem` + easing
  - Animate sequence:
    - 0-0.5s: Clawd slides in from left with easeOut
    - 0.5-1.0s: Spot something (eye look_right, surprise bounce)
    - 1.0-2.0s: Bob/happy dance (alternating expressions, bounce on y)
    - 2.0-2.5s: Heart particles float up
    - 2.5-3.0s: Settle + blink → loop ready
  - Particles from useParticleSystem: hearts (palette #FF6B8A) during happy phase
  - Background: `backgroundColor: "transparent"` for alpha export (preferred). If a non-transparent background is desired, use the brand color `#CBC0D3` (page primary from AGENTS.md).
  - Container must have `backgroundColor: "transparent"` for alpha export
  - MUST NOT animate width/height/top/left
  - MUST NOT use Canvas
  - MUST follow AGENTS.md GSAP rules: paused, seek(frame/fps), context(), no auto-play
  Parallelization: Wave 3 | Blocked by: 2, 3, 4, 5 | Blocks: 7
  References: TextIntro.tsx:70-120 (GSAP paused+seek pattern — note: TextIntro uses manual useEffect cleanup; this composition MUST use gsap.context()), AGENTS.md GSAP rules, Todo 5 getPhase/timing utilities
  - Hint for using SpritePhase: define `const PHASES: SpritePhase[] = [{name:'enter', start:0, end:0.25}, {name:'spot', start:0.25, end:0.5}, {name:'dance', start:0.5, end:0.8}, {name:'settle', start:0.8, end:1.0}]` then use `getPhase(PHASES, frame/180)` to drive expression/position logic per phase. This is optional — pure GSAP timeline keyframes work too.
  Acceptance criteria: `npx remotion studio` shows ClawdDrop in composition list; `npx remotion render ClawdDrop out/clawd-test.png --frames=0-0` produces a transparent PNG with Clawd visible; `npx remotion render ClawdDrop out/clawd-test.mov --frames=0-179 --codec=prores --prores-profile=4444` completes without error
  QA scenarios: happy = render frame 0 as PNG, file exists with 1920×1080 dimensions, alpha channel is preserved; failure = render with invalid frame range errors gracefully; full render = `npx remotion render ClawdDrop out/clawd-preview.mov --codec=prores --prores-profile=4444 --image-format=png --pixel-format=yuva444p10le` produces valid ProRes file
  Commit: Y | feat: add ClawdDrop pixel-animation composition

- [x] 7. Register ClawdDrop in `src/Root.tsx`
  What to do: Add the new composition to the Remotion root alongside existing 6 compositions.
  What to do / Must NOT do:
  - Add `import { ClawdDrop } from "./ClawdDrop";`
  - Add `<Composition id="ClawdDrop" component={ClawdDrop} durationInFrames={180} fps={60} width={1920} height={1080} calculateMetadata={calculateMetadata} />`
  - MUST preserve all existing composition registrations unchanged
  - MUST use the same `calculateMetadata` for ProRes 4444 alpha
  Parallelization: Wave 3 | Blocked by: 6 | Blocks: 8
  References: src/Root.tsx:22-79 (existing registration pattern)
  Acceptance criteria: `npx remotion compositions` lists ClawdDrop among available compositions
  QA scenarios: happy = composition appears in Remotion Studio sidebar, renders without error
  Commit: Y | feat: register ClawdDrop composition in Root

### Wave 4: Verify

- [x] 8. Final verification — lint, typecheck, render preview
  What to do: Run the full verification suite, capture evidence, confirm everything works.
  What to do / Must NOT do:
  - `npx eslint src && npx tsc --noEmit` — must pass with 0 errors
  - `npx remotion compositions` — ClawdDrop listed
  - `npx remotion render ClawdDrop out/clawd-test.png --frames=0-0` — produces PNG with transparent background
  - `npx remotion render ClawdDrop out/clawd-preview.mov --frames=0-179` — renders full ProRes 4444 with alpha
  - Capture output of lint + typecheck to `.omo/evidence/pixel-sprite-animation/lint.txt`
  - Capture composition list to `.omo/evidence/pixel-sprite-animation/compositions.txt`
  - Confirm output PNG has correct dimensions (1920×1080)
  - MUST NOT skip any lint/typecheck step
  Parallelization: Wave 4 | Blocked by: 7 | Blocks: —
  References: AGENTS.md Commands section (lint, render commands)
  Acceptance criteria: All steps pass with zero errors; output ProRes file exists at `out/clawd-preview.mov`
  QA scenarios: happy = full pipeline passes; failure = lint has errors → must be fixed before declaring done
  Commit: N (verification only)

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [x] F1. Plan compliance audit — run `npx eslint src && npx tsc --noEmit`
- [x] F2. Code quality review — verify no Canvas usage, no width/height/top/left animations, GSAP paused+seek pattern correct
- [x] F3. Render QA — render 1 frame as PNG, confirm alpha transparency; render full composition as ProRes 4444 with alpha
- [x] F4. Scope fidelity — confirm no Must NOT have violations

## Commit strategy
- 7 commits (one per task 1-7), each with conventional commit format
- No squashing at end — each commit is atomic and independently reviewable
- Commit order follows dependency order: types → component → sprite data → particles → easing → composition → root registration

## Success criteria
- [x] `npm run lint` passes (0 errors, 0 warnings)
- [x] `npx tsc --noEmit` passes (0 errors)
- [x] Remotion Studio shows ClawdDrop composition playing at 60fps
- [x] Rendered ProRes 4444 output has transparent background and Clawd visible
- [x] PixelSprite component can accept any valid PixelSpriteDef (not just Clawd)
- [x] GSAP timeline follows AGENTS.md rules: paused, seek(frame/fps), gsap.context()
- [x] All existing compositions continue to work unchanged
