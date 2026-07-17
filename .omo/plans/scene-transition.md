# scene-transition - Work Plan

## TL;DR (For humans)

**What you'll get:** Two things: (1) CharReveal now supports 4 stagger modes — sequential (original), random, center, edges — via a new `staggerMode` prop. (2) A new composition `SceneTransition` that demonstrates an SVG rotation wipe transition: red background with "zhanweifu" smoothly rotates through an 8-point polygon mask to reveal a light yellow background with "ZHANWEIFU".

**Why this approach:** The itsoffbrand site's hero text animates chars in random order (achieved via GSAP `stagger: { from: "random" }`), and the `.s.is-hsc` SVG rotation is the most interesting transition reference for video. Adding `staggerMode` as a prop keeps CharReveal backward-compatible. Building SceneTransition as a self-contained composition with an inline SVG mask avoids Puppeteer rendering issues.

**What it will NOT do:** Won't modify any existing composition beyond CharReveal.tsx (staggerMode prop) and Root.tsx (registration). Won't add dependencies. Won't use external SVG assets. Won't implement scroll-based or interactive animation.

**Effort:** Short — 1 prop addition + 1 new component + 1 registration
**Risk:** Low — both follow established patterns (CharReveal GSAP timeline, inline SVG mask)
**Decisions to sanity-check:** SVG polygon points calculation, transition timing (45f hold → 90f wipe → 45f hold)

Your next move: Approve this plan, then enter `$start-work` to execute.

---

> TL;DR (machine): Short | Low | MODIFY `src/CharReveal.tsx` (staggerMode prop) + CREATE `src/SceneTransition.tsx` (SVG rotation wipe) + MODIFY `src/Root.tsx`

## Scope
### Must have
- `staggerMode` prop on CharReveal: `"sequential" | "random" | "center" | "edges"`, default `"sequential"`
- GSAP stagger object syntax: `{ each: CONFIG.stagger, from: staggerMode }` when not sequential
- New `src/SceneTransition.tsx` with:
  - Scene A: red (#E53935) background, "zhanweifu" text (lowercase, white)
  - Scene B: light yellow (#FFF8E1) background, "ZHANWEIFU" text (uppercase, dark)
  - SVG mask with 8-point polygon that rotates (0°→360°) and scales down (1.8→0)
  - Timing: hold Scene A (0-45f) → wipe transition (45-135f) → hold Scene B (135-180f)
  - CONFIG object for all timing/animation parameters
  - GSAP-driven animation using the same `paused: true` + `seek(frame/fps)` pattern
  - Transparent fallback (scene backgrounds cover the frame)
- Registration in `src/Root.tsx`

### Must NOT have (guardrails, anti-slop, scope boundaries)
- Do NOT modify any composition except CharReveal.tsx and Root.tsx
- Do NOT add `@gsap/react` or any npm dependency
- Do NOT use external SVG files (inline only)
- Do NOT use CSS animations or Tailwind animation classes
- Do NOT implement interactive variants or runtime control beyond frame-driven seek
- SceneTransition must NOT have `children` prop (self-contained demo)

## Verification strategy
- Test decision: none (no test framework). Agent-executed QA via CLI still renders.
- Evidence: still renders at key frames for both CharReveal (with staggerMode="random") and SceneTransition

## Execution strategy
### Parallel execution waves
**Wave 1:** 3 sequential todos. Tasks 1-2 can be parallelized, Task 3 depends on both.

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. CharReveal staggerMode | — | 3 | 2 |
| 2. Create SceneTransition | — | 3 | 1 |
| 3. Root.tsx + verification | 1, 2 | — | — |

## Todos
> Implementation + Verification = ONE todo. Never separate.

- [ ] **1. Add `staggerMode` prop to `src/CharReveal.tsx`**
  - Add to props interface: `staggerMode?: "sequential" | "random" | "center" | "edges"`
  - Default: `"sequential"` (backward compatible)
  - Update GSAP `fromTo` call:
    - If `staggerMode === "sequential"`: keep `stagger: CONFIG.stagger` (number, same as before)
    - Else: use `stagger: { each: CONFIG.stagger, from: staggerMode }`
  - Must NOT: change existing behavior when prop is not passed
  - Must NOT: modify any other part of the component
  - Parallelization: Wave 1 | Blocked by: — | Blocks: 3 | Can parallelize with: 2
  - References: src/CharReveal.tsx:28-31 (props interface), 130-141 (GSAP fromTo with stagger)
  - Acceptance criteria: `npx tsc --noEmit` passes, existing still renders unchanged, `staggerMode="random"` renders without error
  - QA scenarios:
    - Happy: `npx remotion still CharReveal --frame=60 --scale=0.25 --props='{"staggerMode":"random"}'` → exits 0
    - Default: `npx remotion still CharReveal --frame=60 --scale=0.25` → works (no prop = sequential)
  - Commit: N

- [ ] **2. Create `src/SceneTransition.tsx` — SVG rotation wipe composition**
  - Create new component with the following structure:
    ```
    CONFIG = {
      transitionStart: 45,      // frame to start wipe
      transitionDuration: 90,   // frames for wipe animation
      polygonSides: 8,
      startScale: 1.8,
      endScale: 0,
      startRotation: 0,
      endRotation: 360,
      sceneAColor: "#E53935",   // red
      sceneBColor: "#FFF8E1",   // light yellow
      fontFamily: '"MapleMono-NF-CN", sans-serif',
    }

    polygonPoints(cx, cy, r, sides, rotation): string
      → calculate regular polygon vertices, return "x1,y1 x2,y2 ..."

    SceneTransition component:
      - useCurrentFrame() / useVideoConfig()
      - Calculate progress: interpolate(frame, [CONFIG.transitionStart, CONFIG.transitionStart + CONFIG.transitionDuration], [0, 1])
      - Calculate: rotation = lerp(startRotation, endRotation, progress)
      - Calculate: scale = lerp(startScale, endScale, progress) using ease (power3.inOut or similar)
      - Polygon radius = Math.hypot(1920/2, 1080/2) * scale (diagonal to cover frame)
      - Render:
        <div style={{position:"absolute", inset:0}}>
          {/* Scene B (underneath) */}
          <div style={{position:"absolute", inset:0, backgroundColor:CONFIG.sceneBColor,
              display:"flex", alignItems:"center", justifyContent:"center"}}>
            <span style={{fontSize:"5rem", fontWeight:"bold", fontFamily, color:"#1D1B20"}}>
              ZHANWEIFU
            </span>
          </div>
          
          {/* Scene A (on top, masked by SVG wipe) */}
          <div style={{position:"absolute", inset:0, 
              mask:`url(#wipe-mask)`, WebkitMask:`url(#wipe-mask)`}}>
            <div style={{position:"absolute", inset:0, backgroundColor:CONFIG.sceneAColor,
                display:"flex", alignItems:"center", justifyContent:"center"}}>
              <span style={{fontSize:"5rem", fontWeight:"bold", fontFamily, color:"#FFFFFF"}}>
                zhanweifu
              </span>
            </div>
          </div>

          {/* SVG mask definition */}
          <svg width="1920" height="1080" style={{position:"absolute", top:0, left:0, pointerEvents:"none"}}>
            <defs>
              <mask id="wipe-mask">
                <polygon points={computedPoints} fill="white"
                  style={{transformOrigin:"960px 540px"}} />
              </mask>
            </defs>
          </svg>
        </div>
    ```
  - The wipe: polygon starts covering entire viewport (startScale 1.8), rotates 360° and shrinks to 0, gradually revealing Scene B underneath
  - Use `interpolate()` for rotation/scale, NOT GSAP (no animations to sequence, just a single transition)
  - Could also use GSAP on the polygon for consistency, but `interpolate()` is simpler and sufficient
  - Must NOT: use GSAP for the wipe (interpolate is sufficient and more reliable for a single-driver animation)
  - Must NOT: use external SVG, CSS animations, npm deps
  - Must NOT: have children prop
  - Parallelization: Wave 1 | Blocked by: — | Blocks: 3 | Can parallelize with: 1
  - References:
    - Remotion interpolate pattern: src/PhysicsDrop.tsx:74-117
    - SVG polygon mask is standard CSS + SVG
    - CharReveal.tsx font/family/sizing convention for reference
  - Acceptance criteria: `npx tsc --noEmit` passes, still renders with `--props='{"text":"zhanweifu"}'` work
  - QA scenarios:
    - Happy: `npx remotion still SceneTransition --frame=0 --scale=0.25` → exits 0 (shows red + "zhanweifu")
    - Happy: `npx remotion still SceneTransition --frame=90 --scale=0.25` → exits 0 (mid-transition)
    - Happy: `npx remotion still SceneTransition --frame=179 --scale=0.25` → exits 0 (shows yellow + "ZHANWEIFU")
  - Commit: N

- [ ] **3. Register in `src/Root.tsx` + full verification**
  - Add: `import { SceneTransition } from "./SceneTransition";`
  - Add: `<Composition id="SceneTransition" component={SceneTransition} durationInFrames={180} fps={60} width={1920} height={1080} calculateMetadata={calculateMetadata} />`
  - Run full lint + typecheck + still renders for both compositions
  - Must NOT: remove any existing imports or compositions
  - Parallelization: Wave 1 | Blocked by: 1, 2 | Blocks: —
  - References: src/Root.tsx (full file)
  - Acceptance criteria:
    - `npx remotion compositions | grep SceneTransition` → found
    - `npx remotion compositions | grep CharReveal` → found (still there)
    - `npm run lint` → no errors from modified files
    - 6 still renders total (3 for CharReveal random mode, 3 for SceneTransition frames)
  - QA scenarios: All 6 still renders exit 0
  - Commit: Y | `feat(char-reveal): add staggerMode prop; feat(scene-transition): add SVG rotation wipe composition`

## Final verification wave
- [ ] F1. Plan compliance audit
- [ ] F2. Code quality review
- [ ] F3. Real manual QA — open studio, verify CharReveal with staggerMode="random" and SceneTransition
- [ ] F4. Scope fidelity

## Commit strategy
Single commit: `feat(char-reveal): add staggerMode prop; feat(scene-transition): add SVG rotation wipe composition`

## Success criteria
- CharReveal renders correctly with `staggerMode` values: "sequential" (default), "random", "center", "edges"
- SceneTransition renders Scene A (red + "zhanweifu") → wipe → Scene B (yellow + "ZHANWEIFU")
- All still renders pass
- `npm run lint` passes on modified files
