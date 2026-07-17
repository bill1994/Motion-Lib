---
slug: scene-transition
status: drafting
intent: clear
pending-action: write .omo/plans/scene-transition.md
approach: Two tasks: 1) Add staggerMode prop to CharReveal. 2) Create SceneTransition with SVG rotation wipe.
---

# Draft: scene-transition

## Components (topology ledger)
| id | outcome (one line) | status | evidence path |
|---|---|---|---|
| CharReveal.tsx | Add `staggerMode` prop (sequential/random/center/edges) | active | GSAP stagger config change |
| SceneTransition.tsx | New composition: red→yellow bg, text case change + SVG rotation wipe | active | Root.tsx registration |
| Root.tsx | Register SceneTransition + no changes for CharReveal (already registered) | active | |

## Open assumptions (announced defaults)
| assumption | adopted default | rationale | reversible? |
|---|---|---|---|
| SVG wipe: regular polygon clip-path that rotates + scales down | Convex polygon (8 sides), start scale 1.8, rotation 0→360 over 90 frames | Best visual impact with minimal complexity | Yes - polygon sides, timing in CONFIG |
| Transition timing: 90 frames for wipe | Hold Scene A 45f → wipe 45-135f → hold Scene B 135-180f | Fits 180f @ 60fps standard | Yes - CONFIG params |
| Text case transition: crossfade via opacity | "zhanweifu" fades out as "ZHANWEIFU" fades in during the wipe | Simple, robust, complements the SVG effect | Yes - can change animation style |
| staggerMode default: "sequential" | Backward compatible with existing behavior | Existing compositions don't pass the prop | Yes |

## Findings (cited - path:lines)

1. **itsoffbrand.com `.s.is-hsc`** uses scroll-driven SVG rotation with `will-change: transform` and `mix-blend-mode`. (CSS from fetch)

2. **GSAP stagger supports `from: "random"`** — `stagger: { each: 0.04, from: "random" }` randomizes animation order. (gsap-core skill, Stagger section)

3. **Remotion supports CSS `mask` with SVG masks** — reliable for Puppeteer rendering as long as SVG `<mask>` is inline. (remotion-best-practices)

4. **CharReveal existing structure**: `CONFIG.stagger` as number, GSAP `fromTo` with `stagger: CONFIG.stagger`. (src/CharReveal.tsx:130-141)

5. **All compositions** 1920×1080, 60fps, 180 frames, ProRes 4444 via `calculateMetadata`. (src/Root.tsx)

## Decisions (with rationale)

1. **SceneTransition as new composition** — keeps the SVG transition self-contained, not mixing concerns with CharReveal.

2. **Polygon clip-path rotation** — SVG mask with regular polygon. Starts fully covering the frame (scale 1.8), rotates 360°, and shrinks (scale 0) to reveal Scene B. Most visually dramatic for a "default" transition demo.

3. **CharReveal staggerMode uses GSAP object syntax** — when `staggerMode` is not "sequential", pass `stagger: { each: CONFIG.stagger, from: staggerMode }` for GSAP to handle.

4. **Colors**: Red = `#E53935`, Light yellow = `#FFF8E1` — clear contrast, good visual demo.

## Scope IN
- Modify `src/CharReveal.tsx` to accept `staggerMode` prop
- Create `src/SceneTransition.tsx` with SVG rotation wipe transition
- Register in `src/Root.tsx`

## Scope OUT (Must NOT have)
- Do NOT modify compositions other than CharReveal.tsx and Root.tsx
- Do NOT add npm dependencies
- Do NOT use external SVG assets (inline only)
- Do NOT implement scroll-based animation

## Open questions
None.

## Approval gate
status: awaiting-approval
