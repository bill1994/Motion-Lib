# water-orb - Work Plan

## TL;DR (For humans)

**What you'll get:** A self-animating 3D water orb composition (`WaterOrb`) in Remotion that visually reproduces the itsoffbrand.com effect — a sphere with flowing water-like surface deformation, edge glow, and reflective highlights, using project brand colors (#CBC0D3) on a dark background.

**Why this approach:** Three.js + `@react-three/fiber` is already installed. `LiquidGlass.tsx` proves the `ThreeCanvas` + `shaderMaterial` pattern works. The 2-pass pipeline (noise heightmap → matcap render) avoids stateful wave physics (which breaks Remotion's random-frame seeking) while keeping the visual quality — fBm multi-octave noise naturally looks like water.

**What it will NOT do:** No interactive mouse control. No offscreen multi-pass rendering (Metis confirmed `useFrame` is forbidden in `@remotion/three` — `ThreeCanvas` sets `frameloop='never'`). No stateful wave physics (incompatible with Remotion's frame-independent rendering). Not a pixel-perfect clone of the website (the original uses persistent WebGL render targets for interactive multi-pass).

**Effort:** Medium — 1 new file + 1 edit to Root.tsx
**Risk:** Low — all dependencies already installed, pattern proven by LiquidGlass
**Decisions to sanity-check:** Simulated mouse movement pattern (Lissajous curve), noise parameters, color values

---

> TL;DR (machine): Medium effort, Low risk. Create src/WaterOrb.tsx with custom GLSL shaders (Simplex noise + fBm in single shader, simulated mouse UV deformation, Fresnel + Lambert + Blinn-Phong), single-pass on ThreeCanvas following LiquidGlass pattern (no useFrame, no offscreen rendering), register in Root.tsx.

## Scope
### Must have
- `src/WaterOrb.tsx` — Remotion composition with auto-animating water orb
- GLSL shaders: Simplex noise (snoise3), fBm multi-octave noise computed per-vertex, simulated mouse UV-space deformation via uniform, Fresnel + Lambert + Blinn-Phong lighting in fragment shader
- **Single-pass**: One ShaderMaterial on one mesh — NO offscreen rendering, NO useFrame, NO RenderTargets
- Normals computed via `dFdx(vPosition)` / `dFdy(vPosition)` in fragment shader (GPU screen-space derivatives — accurate for displaced surface)
- All uniforms updated in `useEffect` driven by `useCurrentFrame()` — identical pattern to LiquidGlass
- 1920×1080, 180 frames @ 60fps, dark background (#1D1B20)
- Auto-rotation of the orb (Y axis) via `useEffect` on meshRef
- Registration in `src/Root.tsx` as `<Composition id="WaterOrb">`
- Passes `npm run lint`

### Must NOT have (guardrails, anti-slop, scope boundaries)
- No new npm dependencies (Three.js stack already installed)
- No CSS/Tailwind animation classes
- No GSAP
- **NO `useFrame`** — forbidden in `@remotion/three` (`ThreeCanvas` sets `frameloop='never'`)
- **NO offscreen rendering** — no `WebGLRenderTarget`, no multi-pass, no `gl.setRenderTarget()`
- No pixel-precision match to itsoffbrand (the original's interactive multi-pass pipeline is fundamentally different from Remotion's frameloop)
- No modification to any existing composition files other than Root.tsx
- No external texture dependencies (no matcap PNGs, no staticFile assets)
- No non-deterministic animation (`Math.random`, `Date.now`, clock-based timing)

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: none (visual composition — verified via lint + still renders)
- Evidence: .omo/evidence/task-1-waterorb-component.txt, .omo/evidence/task-2-root-and-lint.txt

## Execution strategy
### Parallel execution waves
Wave 1: Todo 1 (WaterOrb.tsx — file creation) → Todo 2 (Root.tsx registration + lint) — sequential dependency
Since both tasks touch different files, they could be done in parallel, but Task 2 depends on Task 1 creating the file first.

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. WaterOrb.tsx (full file) | — | — | — |
| 2. Root.tsx registration + verification | 1 | — | — |

## Todos

- [x] 1. Write src/WaterOrb.tsx (single file with all GLSL + React component)
  What to do / Must NOT do:
  Create `src/WaterOrb.tsx` containing everything — shader strings + component + uniform update logic.
  Follow LiquidGlass.tsx pattern EXACTLY: ThreeCanvas + shaderMaterial + useEffect for uniform updates.

  ### GLSL Shaders (module-level const strings):

  **a) `SPHERE_VERTEX`** — Vertex shader with in-shader noise computation:
  - Include full `snoise(vec3)` function (Ashima Arts, public domain, ~40 lines)
  - fBm function: 4 octaves, 2× frequency, 0.5× amplitude per octave
  - Compute noise displacement per-vertex: `float n = fBm(position * uFreq + uTime * uSpeed);`
  - Apply simulated mouse deformation: compute mouse position in UV space, apply cos-based falloff based on distance from vertex UV to mouse center
  - `pos = position + normal * (n * uAmp + mouseEffect * uMouseStrength);`
  - Pass `vPosition` (world space, after displacement) and `vUv` to fragment shader
  - Uniforms: `uTime`, `uAmplitude`, `uFrequency`, `uSpeed`, `uMouseRadius`, `uMouseStrength`, `uMouseU` (float), `uMouseV` (float)

  **b) `SPHERE_FRAGMENT`** — Fragment shader with dFdx/dFdy normals + lighting:
  - Compute normals from displaced position: `vec3 normal = normalize(cross(dFdx(vPosition), dFdy(vPosition)));`
  - Fresnel rim light: `float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);`
  - Lambert diffuse: `float diff = max(dot(normal, normalize(uLightPos)), 0.0);`
  - Blinn-Phong specular: `float spec = pow(max(dot(normal, halfDir), 0.0), 64.0);`
  - Color mixing:
    - Base: `uColorBase` (#CBC0D3)
    - Fresnel glow: lighter version (interpolate toward white)
    - Specular: white
    - Combine: `base * (0.3 + 0.7 * diff) + fresnel * uColorFresnel + spec * vec3(1.0)`
  - No lighting pass — everything computed in one shader
  - Uniforms: `uTime`, `uLightPos` (vec3), `uColorBase` (vec3), `uColorFresnel` (vec3), `uDisplaceScale`

  ### React Component:
  a) Imports:
  ```typescript
  import { useCurrentFrame, useVideoConfig } from "remotion";
  import { ThreeCanvas } from "@remotion/three";
  import { useMemo, useRef, useEffect } from "react";
  import * as THREE from "three";
  ```

  b) `WaterOrb` component:
  ```
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  ```

  c) `useEffect` driven by `[frame]`:
  ```typescript
  useEffect(() => {
    const mat = materialRef.current;
    const mesh = meshRef.current;
    if (!mat || !mesh) return;

    const time = frame / fps;

    // Animate uniforms
    mat.uniforms.uTime.value = time;
    mat.uniforms.uLightPos.value.set(
      5 * Math.cos(time * 0.3),
      3 + 2 * Math.sin(time * 0.2),
      5 * Math.sin(time * 0.3)
    );

    // Simulated mouse in UV space (Lissajous)
    mat.uniforms.uMouseU.value = 0.5 + 0.3 * Math.sin(time * 0.4);
    mat.uniforms.uMouseV.value = 0.5 + 0.3 * Math.cos(time * 0.5);

    // Auto-rotate
    mesh.rotation.y = time * 0.3;
  }, [frame, fps]);
  ```

  d) JSX:
  ```tsx
  <ThreeCanvas
    style={{ backgroundColor: "#1D1B20" }}
    camera={{ position: [0, 0, 2.8], fov: 45, near: 0.1, far: 10 }}
  >
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={{
          uTime: { value: 0 },
          uAmplitude: { value: 0.15 },
          uFrequency: { value: 2.0 },
          uSpeed: { value: 0.5 },
          uMouseRadius: { value: 0.3 },
          uMouseStrength: { value: 0.15 },
          uMouseU: { value: 0.5 },
          uMouseV: { value: 0.5 },
          uLightPos: { value: new THREE.Vector3(5, 5, 5) },
          uColorBase: { value: new THREE.Color("#CBC0D3") },
          uColorFresnel: { value: new THREE.Color("#D8D0E0") },
          uDisplaceScale: { value: 0.15 },
        }}
        vertexShader={SPHERE_VERTEX}
        fragmentShader={SPHERE_FRAGMENT}
      />
    </mesh>
  </ThreeCanvas>
  ```

  Must NOT do:
  - Do NOT use `useFrame` from `@react-three/fiber` — it is forbidden in @remotion/three
  - Do NOT create WebGLRenderTargets
  - Do NOT use `gl.setRenderTarget()` or any offscreen rendering
  - Do NOT use `@react-three/drei` (not installed)
  - Do NOT import anything from `@react-three/fiber` directly (ThreeCanvas wraps it; useThree/useFrame etc are not needed)
  - Do NOT use GSAP
  - Do NOT use non-deterministic values (Math.random, Date.now)
  - Do NOT add new npm dependencies

  References:
  - LiquidGlass.tsx: `src/LiquidGlass.tsx:240-380` (the exact pattern to follow)
  - AGENTS.md: "Design System — Color Palette" section for brand colors
  - Simplex noise: Ashima Arts snoise3 (public domain, standard GLSL implementation)
  - Metis finding R1: useFrame is forbidden in @remotion/three; ThreeCanvas sets frameloop='never'
  Acceptance criteria:
  - `npm run lint` passes with 0 errors
  - Component renders in Remotion Studio without WebGL errors
  - Sphere deforms smoothly over 180 frames
  QA scenarios:
  - Happy: `npm run lint` passes; sphere renders at frames 0, 60, 120, 179 with visible deformation and brand colors
  - Failure: Shader compilation error → check console output, fix GLSL syntax
  Evidence: `.omo/evidence/task-1-waterorb-component.txt` (lint output)
  Commit: Y | `feat(composition): add WaterOrb with single-pass Three.js shader water effect`

- [x] 2. Root.tsx registration + lint verification
  What to do / Must NOT do:
  a) Add `import { WaterOrb } from "./WaterOrb";` to `src/Root.tsx` after ClawdAction import (line ~11)
  b) Add `<Composition id="WaterOrb" component={WaterOrb} durationInFrames={180} fps={60} width={1920} height={1080} calculateMetadata={calculateMetadata} />` after ClawdAction's Composition (after line ~111)
  c) Run `npm run lint` — must pass with 0 errors
  d) Verify WaterOrb.tsx exists at correct path and exports WaterOrb
  Must NOT do:
  - Do NOT remove or modify any existing compositions in Root.tsx
  - Do NOT modify WaterOrb.tsx in this task
  Parallelization: Wave 1 | Blocked by: 1 | Blocks: —
  References:
  - Root.tsx: `src/Root.tsx` lines 1-114 (imports, Composition registrations)
  - AGENTS.md: lint command `npm run lint`
  Acceptance criteria:
  - `npm run lint` exits with code 0
  - WaterOrb composition listed in Root.tsx exports
  QA scenarios:
  - Happy: `npm run lint` passes; `grep "WaterOrb" src/Root.tsx` confirms registration
  - Failure: Lint errors → check import path, component name spelling
  Evidence: `.omo/evidence/task-2-root-and-lint.txt` (lint output)
  Commit: N (included in Task 1 commit)

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [x] F1. Plan compliance audit — WaterOrb.tsx exists (211 lines), Root.tsx has import + Composition, all todo checkboxes done ✅
- [x] F2. Code quality review — single-pass, no useFrame, no RenderTargets, dFdx/dFdy normals, brand colors correct ✅
- [ ] F3. Real manual QA — open Remotion Studio, scrub through WaterOrb at frames 0/30/60/90/120/150/179, confirm surface deformation + rotation + colors (user verification)
- [x] F4. Scope fidelity — no new deps, only WaterOrb.tsx + Root.tsx touched, no GSAP ✅

## Commit strategy
One commit for the full feature:
```
feat(composition): add WaterOrb with Three.js shader-based water effect

- Simplex noise + fBm multi-octave heightmap generation
- Simulated mouse drag with Lissajous trajectory
- Matcap-style rendering with Fresnel + Lambert + Blinn-Phong
- 2-pass pipeline via R3F useFrame + WebGLRenderTarget
- Brand colors (#CBC0D3) on dark background (#1D1B20)
- 1920x1080, 180 frames @ 60fps
```

## Success criteria
1. `npm run lint` passes (0 errors, 0 warnings)
2. Single-pass GLSL: vertex shader computes fBm noise + mouse deformation; fragment shader uses dFdx/dFdy for correct displaced-surface normals
3. WaterOrb composition renders in Remotion Studio without WebGL errors
4. Water orb shows visible surface deformation animated over time
5. Orb slowly rotates (Y axis) throughout the 180 frames
6. Visual: dark background (#1D1B20), purple-gray (#CBC0D3) base color with Fresnel glow and specular highlights
7. All existing 8+ compositions still render correctly
8. No new npm dependencies
9. No useFrame, no WebGLRenderTarget, no offscreen rendering
