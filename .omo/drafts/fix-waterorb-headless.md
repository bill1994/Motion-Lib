---
slug: fix-waterorb-headless
status: awaiting-approval
intent: clear
pending-action: write .omo/plans/fix-waterorb-headless.md
approach: Add `#extension GL_OES_standard_derivatives : enable` to the fragment shader for WebGL 1.0 fallback compatibility in headless Chrome rendering
---

# Draft: fix-waterorb-headless

## Components (topology ledger)
| id | outcome | status | evidence path |
|----|---------|--------|---------------|
| WaterOrb fragment shader | Add extension directive | active | src/WaterOrb.tsx:123-151 |
| WaterOrb JSX props | Remove test props (glslVersion, gl, color background) | active | src/WaterOrb.tsx:153-211 |
| File restoration | Restore original shader from .bak2 backup | active | src/WaterOrb.tsx.bak2 |
| Headless render test | `remotion still WaterOrb --frame=30` produces visible sphere | active | /tmp/waterorb-fixed.png |

## Open assumptions (announced defaults)
| assumption | adopted default | rationale | reversible? |
|-----------|----------------|-----------|-------------|
| Headless Chrome uses WebGL 1.0 fallback | Add `#extension` for dFdx/dFdy WebGL 1.0 compat | Studio shows sphere (WebGL 2), headless doesn't (WebGL 1) | Yes - extension is harmless in WebGL 2 |
| Three.js handles gl_FragColor conversion | Keep `gl_FragColor`, do NOT add explicit `out vec4` | Three.js r184 adds `#define gl_FragColor pc_fragColor` for WebGL 2 | No - if wrong, shader fails |

## Findings (cited - path:lines)
- `dFdx`/`dFdy` used in fragment shader (src/WaterOrb.tsx:133-135) require `#extension GL_OES_standard_derivatives : enable` in WebGL 1.0
- Three.js r184 WebGLProgram.js:816-817 handles `gl_FragColor` via `#define gl_FragColor pc_fragColor` for WebGL 2 (non-GLSL3 path)
- Three.js r184 WebGLProgram.js:805 sets `versionString = '#version 300 es\n'` for ALL non-raw ShaderMaterial
- R3F creates WebGLRenderer with `alpha: true` by default (dist/events-*.js:15615-15620)
- User confirmed "一个大圆" visible in Studio but `remotion still` renders black
- Test renders show: 5088/5184 sampled pixels are pure black with `glslVersion={THREE.GLSL3}`

## Decisions (with rationale)
1. **Restore original shader from .bak2** — current file is a test shim from explore agent, not the real composition
2. **Add `#extension` directive** — `#extension GL_OES_standard_derivatives : enable` immediately after `#version` for WebGL 1 fallback
3. **Remove `glslVersion={THREE.GLSL3}`** — letting Three.js auto-detect WebGL version is more robust; GLSL3 mode broke `#version 300 es` in WebGL 1
4. **Keep `gl_FragColor`** — Three.js already converts it; explicit `out vec4 fragColor` + `glslVersion=GLSL3` = duplicate output variable
5. **Add `gl={{ alpha: false }}`** — avoids transparent canvas compositing issues in headless capture

## Scope IN
- src/WaterOrb.tsx: fragment shader extension + JSX props cleanup
- Render test at frame 0 and frame 30
- Lint check

## Scope OUT (Must NOT have)
- No changes to any other composition (Root.tsx, LiquidGlass, etc.)
- No changes to GSAP or other non-WebGL code
- No changes to package.json or remotion.config.ts
- No new dependencies

## Open questions
(none — resolved by exploration)

## Approval gate
status: awaiting-approval
<!-- To approve: user confirms the approach. Then write the plan file with full todos, Metis check, and TL;DR. -->
