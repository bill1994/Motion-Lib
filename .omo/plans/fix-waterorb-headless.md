# fix-waterorb-headless - Work Plan

## TL;DR (For humans)

**What you'll get:** The WaterOrb water sphere composition now renders correctly both in Remotion Studio AND via `remotion still` — no more black frame when exporting.

**Why this approach:** The shader works fine in Studio (desktop Chrome with GPU WebGL 2), but `remotion still` uses headless Chrome which falls back to WebGL 1.0. The fix adds a one-line GLSL extension declaration (`#extension GL_OES_standard_derivatives : enable`) that enables `dFdx`/`dFdy` functions in WebGL 1.0 without affecting WebGL 2.0 rendering at all.

**What it will NOT do:** No changes to any other composition, no changes to the sphere's appearance, no new dependencies, no changes to GSAP/Tailwind/other components.

**Effort:** Quick (single file, one-line extension + JSX prop cleanup)
**Risk:** Low — extension directive is harmless in WebGL 2 and required in WebGL 1

**Decisions to sanity-check:** The fix adds `gl={{ alpha: false }}` to override R3F's default transparent canvas — this prevents alpha compositing issues during headless frame capture.

Your next move: Approve, then execute the plan.

---

> TL;DR (machine): Quick, Low. Restore original shader from .bak2, add `#extension GL_OES_standard_derivatives : enable`, remove test props, add `alpha: false`, render-verify at frame 0 and 30.

## Scope
### Must have
- Restore original WaterOrb shader (noise + fBm + dFdx normals + Fresnel lighting) from .bak2
- Add `#extension GL_OES_standard_derivatives : enable` to fragment shader for WebGL 1.0 compatibility
- Remove test-only props (`glslVersion`, `color attach="background"`)
- Add `gl={{ alpha: false }}` for headless render reliability
- Verify `remotion still` produces visible sphere at frame 0 and frame 30
- Verify `npm run lint` passes

### Must NOT have (guardrails, anti-slop, scope boundaries)
- No changes to any file outside src/WaterOrb.tsx
- No changes to Root.tsx, LiquidGlass, or any other composition
- No new npm dependencies
- No changes to remotion.config.ts
- No removal of existing features (mouse drag simulation, auto-rotation, Fresnel glow, specular, etc.)

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: tests-after (render verification + pixel analysis)
- Evidence path:
  1. `npx remotion still WaterOrb --frame=30 --output=/tmp/waterorb-fixed-test.png`
  2. Python pixel analysis: center pixel MUST NOT be RGB(0,0,0) — should be purple-grey shade
  3. `npx remotion still WaterOrb --frame=0 --output=/tmp/waterorb-frame0-test.png`
  4. `npm run lint` output shows 0 errors

## Execution strategy
### Parallel execution waves
> Wave 1 (single todo): Fix WaterOrb.tsx + render test + lint

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. Fix WaterOrb.tsx | — | — | — |

## Todos
> Implementation + Test = ONE todo. Never separate.
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->
- [ ] 1. Fix WaterOrb.tsx — restore original shader + add GL extension + add alpha:false
  
  What to do / Must NOT do:
  1. Restore the original WaterOrb.tsx from `src/WaterOrb.tsx.bak2`
  2. In the fragment shader string (`SPHERE_FRAGMENT`), add `#extension GL_OES_standard_derivatives : enable` as the first line after the opening backtick
  3. Remove `glslVersion={THREE.GLSL3}` from the `<shaderMaterial>` JSX
  4. Remove `<color attach="background" args={["#1D1B20"]} />` from the JSX
  5. Add `gl={{ alpha: false, antialias: true, powerPreference: "high-performance" }}` as prop to `<ThreeCanvas>`
  6. Keep `<sphereGeometry args={[1, 128, 128]} />` (original 128 segments)
  7. Keep `gl_FragColor` in the shader (Three.js handles WebGL 2 conversion)
  8. Restore the `materialRef` and `useEffect` that update uniforms
  9. Must NOT remove any uniform, varying, or lighting code
  10. Must NOT change the shader math/logic in any way
  
  Parallelization: Wave 1 | Blocked by: — | Blocks: —
  
  References (executor has NO interview context - be exhaustive):
  - Original shader backup: src/WaterOrb.tsx.bak2 (full file, 211 lines)
  - Current (broken test) version: src/WaterOrb.tsx (55 lines, test shim)
  - Three.js WebGLProgram.js:816-817 — Three.js r184 adds `#define gl_FragColor pc_fragColor` for WebGL 2, so gl_FragColor works as-is
  - R3F renderer creation at dist/events-*.js:15615-15620 — defaults to `alpha: true`
  - The `#extension` directive must be the FIRST line after the `#version` line (Three.js adds `#version 300 es` in the prefix, so our extension comes after it in the user shader code)
  - Fix location: fragment shader string between lines 123-151, add `#extension GL_OES_standard_derivatives : enable\n` right after the opening backtick
  
  Acceptance criteria (agent-executable):
  - `npm run lint` passes with 0 errors
  - `npx remotion still WaterOrb --frame=30 --output=/tmp/waterorb-fixed-test.png` succeeds
  - Python pixel analysis of /tmp/waterorb-fixed-test.png shows center pixel is NOT RGB(0,0,0) — it should be a shade of purple-grey
  - At least 10% of sampled pixels are not the background color (#1D1B20) — confirming the sphere is visible
  
  QA scenarios:
  - Happy: Frame 30 renders a visible purple-grey sphere (analyze with python3 pixel sampling)
  - Happy: Frame 0 also renders the sphere (test with `--frame=0`)
  - Happy: `npm run lint` reports 0 errors
  - Failure: If center pixel is RGB(0,0,0), the fix is insufficient — try alternative approaches
  
  Evidence: .omo/evidence/task-1-fix-waterorb-headless.txt (render output + pixel analysis results)
  
  Commit: Y | `fix(WaterOrb): add GL_OES_standard_derivatives extension for headless WebGL 1 compat`

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [ ] F1. Plan compliance audit — all todos completed, no scope creep
- [ ] F2. Code quality review — lint passes, no new warnings
- [ ] F3. Real manual QA — user scrubs WaterOrb in Remotion Studio at frames 0/30/60/90/120/150/179
- [ ] F4. Scope fidelity — only WaterOrb.tsx changed, no other files

## Commit strategy
One commit with message: `fix(WaterOrb): add GL_OES_standard_derivatives extension for headless WebGL 1 compat`

## Success criteria
- `npm run lint` passes with 0 errors
- `npx remotion still WaterOrb --frame=30` produces a visible purple-grey sphere (center pixel ≠ RGB(0,0,0))
- `npx remotion still WaterOrb --frame=0` also produces a visible sphere
- User confirms sphere looks correct in Remotion Studio
