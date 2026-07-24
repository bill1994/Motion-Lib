# title-reveal-new-modes - Work Plan

## TL;DR (For humans)
<!-- Fill this LAST -->

**What you'll get:** 5 new TitleReveal animation modes—scramble (hacker decryption), depthZoom (cinematic zoom+blur), shimmer (Apple-style gradient sweep), jellyWave (squash & stretch bounce), splitSlide (characters split and slide from opposite sides)—all usable via the existing `mode` prop and registered as new compositions in Remotion Studio.

**Why this approach:** Adding modes inline in TitleReveal.tsx follows the existing branching pattern (3 modes already there). 4/5 modes share the default character-span layout, minimizing JSX changes. Only splitSlide needs a special render path with clip‑p. All modes use GSAP for consistency, with scramble's character substitution being frame-based (keeping the per‑frame logic in render, where it belongs).

**What it will NOT do:** Won't refactor/extract modes into separate files. Won't add npm dependencies. Won't modify existing 3 modes (backwards compatible). Won't touch standalone TextScramble.tsx. No canvas/SVG implementations.

**Effort:** Medium
**Risk:** Low — all modes use well-proven patterns (GSAP fromTo, CSS clip-path, background-clip gradient). The only mild risk is splitSlide's clip-path per-character layout needing careful offset math.
**Decisions to sanity-check:** (1) scramble reuses TitleReveal's frame-based render rather than GSAP onUpdate (2) splitSlide's clip-path approach vs SVG alternatives

Your next move: **Approve** this plan, or I'll run a high-accuracy Momus review first. Full execution detail below.

---

> TL;DR (machine): Medium effort, Low risk. Extend TitleReveal.tsx mode union + C configs + GSAP branches + catalog/Root.tsx. 5 todos, 2 waves.

## Scope
### Must have
1. 5 new `mode` values: `"scramble"`, `"depthZoom"`, `"shimmer"`, `"jellyWave"`, `"splitSlide"`
2. Per-mode `C` config entries with duration/stagger/easing defaults
3. Mode branching in GSAP `useEffect` (tl.fromTo logic)
4. Mode branching in JSX return (splitSlide needs custom; others share default)
5. `mode` prop union type updated + `params.mode.desc` in catalogEntry
6. 5 new `catalogEntry.compositions` entries
7. 5 new `<Composition>` registrations in Root.tsx
8. `npm run update-catalog` → regenerate `.omo/animation-catalog.md`

### Must NOT have (guardrails, anti-slop, scope boundaries)
- Do NOT extract/refactor TitleReveal into multiple files
- Do NOT add new npm dependencies
- Do NOT modify or touch existing 3 modes' animation code (slideUp / flip3d / panel)
- Do NOT touch standalone TextScramble.tsx
- Do NOT introduce canvas, SVG filters, or WebGL
- Do NOT use `any` type — extend the union properly
- Do NOT use `onUpdate` in GSAP for character scrambling (frame-based render only)
- Each mode's C config MUST be a `as const` literal like the existing ones
- GSAP timelines MUST follow AGENTS.md rules: `{ paused: true }`, `seek(frame / fps)`, `gsap.context(...)`

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- **Test decision**: Tests-after — `npm run lint` must pass, visual verification in Remotion Studio
- **Evidence**: `.omo/evidence/task-*-title-reveal-new-modes.*`

## Execution strategy
### Parallel execution waves
| Wave | Todos | Description |
|------|-------|-------------|
| 1 | #1 | Types + C constants + catalogEntry update — blocks everything |
| 2 | #2, #3, #4, #5, #6 | Implementation + Root.tsx registration — parallelizable |

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. Types+Config+Catalog | — | 2,3,4,5,6 | — |
| 2. scramble | 1 | — | 3,4,5,6 |
| 3. depthZoom | 1 | — | 2,4,5,6 |
| 4. shimmer | 1 | — | 2,3,5,6 |
| 5. jellyWave | 1 | — | 2,3,4,6 |
| 6. splitSlide + Root.tsx | 1 | — | 2,3,4,5 |

## Todos
> Implementation + Test = ONE todo. Never separate.
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->

- [ ] 1. Types, C constants & catalogEntry update
  What to do / Must NOT do:
  - Extend mode union at line 16: `"slideUp" | "flip3d" | "panel" | "scramble" | "depthZoom" | "shimmer" | "jellyWave" | "splitSlide"`
  - Add these new `C` entries (all `as const`):
    - `C.sc`: scramble config `{ cd: 0.7, sg: 0.04, es: "power2.out" }`
    - `C.dz`: depthZoom config `{ cd: 1.0, sg: 0, es: "power3.out", blur: 20, scale: 2.5 }`
    - `C.sh`: shimmer config `{ cd: 1.2, sg: 0, es: "power2.out", sweepDur: 0.8 }`
    - `C.jw`: jellyWave config `{ cd: 0.6, sg: 0.06, es: "elastic.out(1, 0.4)", squashDur: 0.12, squashEase: "power2.in" }`
    - `C.ss`: splitSlide config `{ cd: 0.7, sg: 0.05, es: "power3.inOut" }`
  - Update `params.mode.desc` in catalogEntry to list all 8 modes
  - Do NOT change any existing C entry values
  - Do NOT change existing catalogEntry.compositions — only APPEND new ones

  Parallelization: Wave 1 | Blocked by: — | Blocks: 2-6
  References: `src/TitleReveal.tsx:5-10` (C constants), `:16-17` (mode type), `:184-213` (catalogEntry)
  Acceptance criteria (agent-executable): `npx tsc --noEmit` passes, mode union includes new values
  QA scenarios: happy = `npx tsc --noEmit` exits 0; failure = verify existing modes still compile
  Commit: Y | feat(title-reveal): add 5 new mode types and C config constants

- [ ] 2. Implement scramble mode
  What to do / Must NOT do:
  - In the GSAP `useEffect`, add `m === "scramble"` branch:
    - GSAP: `tl.fromTo(vc, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: C.sc.cd, stagger: C.sc.sg, ease: C.sc.es }, 0)`
    - No character-scrambling in GSAP (frame-based, done in render)
  - In the render path (inside the default JSX, around line 166-182), add scramble character logic:
    - Each char span: if not yet settled (frame < startFr + SCRAMBLE_FRAMES), display random char from pool `"!<>-_\\/[]{}—=+*^?#%$&"` using deterministic `(i * 7 + Math.floor(frame / 2)) * 13 % POOL.length`
    - Use `STAGGER = 4` frames, `SCRAMBLE = 28` frames per character (matching TextScramble.tsx timing)
    - Opacity for scrambled-state chars: `0.15` fading to `1` as settle approaches
    - Font overrides: use `fontFamily: '"MapleMono-NF-CN", "Courier New", monospace'` when rendering scrambled chars for the "tech" look, switch to default font on settle
  - Must NOT use GSAP `onUpdate` for character substitution
  - Must NOT reuse TextScramble.tsx component logic directly (inline only)

  Parallelization: Wave 2 | Blocked by: 1 | Blocks: —
  References: `src/TitleReveal.tsx:87-108` (GSAP effect body), `:166-182` (default JSX), `src/TextScramble.tsx:67-126` (scramble logic pattern)
  Acceptance criteria (agent-executable): `npm run lint` passes; Remotion Studio plays TitleRevealScramble with correct scramble→reveal sequence
  QA scenarios: happy = `npx tsc --noEmit && npx eslint src/TitleReveal.tsx`; failure = empty `mode` prop falls through to default slideUp
  Commit: N (squash with Wave 2 commits)

- [ ] 3. Implement depthZoom mode
  What to do / Must NOT do:
  - In GSAP `useEffect`, add `m === "depthZoom"` branch:
    - `tl.fromTo(cr.current, { scale: C.dz.scale, filter: \`blur(${C.dz.blur}px)\`, opacity: 0 }, { scale: 1, filter: "blur(0px)", opacity: 1, duration: C.dz.cd, ease: C.dz.es }, 0)`
  - In JSX: add a wrapper `<div>` with `perspective: "800px"` around the existing text container (only for depthZoom mode)
  - Use the default character-span layout (same JSX as slideUp)
  - Must NOT use `scaleZ` or 3D transforms beyond perspective
  - Must NOT change character-level animation (entire container animates as one unit)

  Parallelization: Wave 2 | Blocked by: 1 | Blocks: —
  References: `src/TitleReveal.tsx:78-116` (GSAP effect), AGENTS.md GPU rules (animate scale/opacity, not width/height)
  Acceptance criteria (agent-executable): `npm run lint` passes; Remotion Studio plays TitleRevealDepthZoom with zoom-in+blur dissolve
  QA scenarios: happy = `npx tsc --noEmit`; failure = verify mode="slideUp" still works (regression check)
  Commit: N (squash)

- [ ] 4. Implement shimmer mode
  What to do / Must NOT do:
  - In the render JSX (default path, line 166-182):
    - Apply `background: "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.9) 50%, transparent 70%)"` on the text div
    - Set `WebkitBackgroundClip: "text"`, `backgroundClip: "text"`, `color: "transparent"`, `WebkitTextFillColor: "transparent"`
    - Set `backgroundSize: "200% 100%"`, `backgroundPosition: "100% 0"` (initial offset to the right)
  - In GSAP `useEffect`, add `m === "shimmer"` branch:
    - Target the text container: `tl.fromTo(textContainer, { backgroundPosition: "200% 0" }, { backgroundPosition: "-100% 0", duration: C.sh.sweepDur, ease: "power2.inOut" }, 0)`
    - Combined with opacity fade-in: `tl.fromTo(textContainer, { opacity: 0 }, { opacity: 1, duration: C.sh.cd, ease: C.sh.es }, 0)`
    - Must animate both simultaneously (sweep + fade)
  - Must NOT use characters' individual refs for shimmer (container-level is correct)
  - Must NOT change color of the actual text (use gradient as mask)

  Parallelization: Wave 2 | Blocked by: 1 | Blocks: —
  References: `src/TitleReveal.tsx:166-182` (default JSX), `:78-116` (GSAP effect)
  Acceptance criteria (agent-executable): `npm run lint` passes; Remotion Studio shows gradient sweep across text
  QA scenarios: happy = `npx tsc --noEmit`; failure = shimmer without gradient still shows readable text (transparent fallback)
  Commit: N (squash)

- [ ] 5. Implement jellyWave mode
  What to do / Must NOT do:
  - In GSAP `useEffect`, add `m === "jellyWave"` branch:
    - Per-character squash sequence:
      ```
      tl.to(vc, { scaleY: 1.6, scaleX: 0.7, duration: C.jw.squashDur, ease: C.jw.squashEase, stagger: C.jw.sg }, 0);
      tl.to(vc, { scaleY: 1, scaleX: 1, duration: C.jw.cd, ease: C.jw.es, stagger: C.jw.sg }, C.jw.squashDur);
      ```
    - Ensure `transformOrigin: "center bottom"` on each character span for natural bounce
    - Combined with stagger: characters don't all bounce at once
  - In JSX: same default character-span layout, just add `transformOrigin: "center bottom"` to each span
  - Must NOT use `onComplete` callbacks (paused timeline doesn't fire them reliably)
  - Must NOT animate container-level transforms (per-character is essential)

  Parallelization: Wave 2 | Blocked by: 1 | Blocks: —
  References: `src/TitleReveal.tsx:87-108` (GSAP effect branching), `:170` (character span style)
  Acceptance criteria (agent-executable): `npm run lint` passes; Remotion Studio plays TitleRevealJellyWave with squash-stretch per character
  QA scenarios: happy = `npx tsc --noEmit`; failure = stagger modes still work with jellyWave
  Commit: N (squash)

- [ ] 6. Implement splitSlide mode + Root.tsx registrations
  What to do / Must NOT do:
  - **Implementation in TitleReveal.tsx**:
    - JSX: add new render path for `mode === "splitSlide"` (similar to flip3d's special path):
      - For each character, create two absolutely-positioned `<span>` elements at identical position:
        - Top half: `clipPath: "inset(0 0 50% 0)"`, initial `transform: "translateX(-100%)"`
        - Bottom half: `clipPath: "inset(50% 0 0 0)"`, initial `transform: "translateX(100%)"`
        - Both wrapped in a container `<span>` with `position: "relative"`, `display: "inline-block"`, height matching line-height
      - Characters are references via a new ref array for halves (or double the chr array)
    - GSAP effect: add `m === "splitSlide"` branch:
      - Top halves: `tl.fromTo(topChars, { x: "-100%" }, { x: "0%", duration: C.ss.cd, stagger: C.ss.sg, ease: C.ss.es }, 0)`
      - Bottom halves: `tl.fromTo(bottomChars, { x: "100%" }, { x: "0%", duration: C.ss.cd, stagger: C.ss.sg, ease: C.ss.es }, 0)`
      - Both play simultaneously (same start time, same stagger pattern)
    - Container needs `overflow: "visible"` (not hidden, since halves slide from outside)
    - Need a new ref arrays for the two halves
  - **Root.tsx registration** (src/Root.tsx):
    - Add 5 new `<Composition>` entries in the Typography section (around line 137), after TitleRevealFlip3d:
      - `TitleRevealScramble` → `<TitleReveal mode="scramble" />`
      - `TitleRevealDepthZoom` → `<TitleReveal mode="depthZoom" />`
      - `TitleRevealShimmer` → `<TitleReveal mode="shimmer" />`
      - `TitleRevealJellyWave` → `<TitleReveal mode="jellyWave" />`
      - `TitleRevealSplitSlide` → `<TitleReveal mode="splitSlide" />`
  - Must NOT use SVG `clipPath` (CSS `clip-path: inset()` is sufficient)
  - Must NOT forget the 5 Root.tsx registrations (easy to miss)
  - Do NOT change Root.tsx imports (TitleReveal is already imported at line 5)

  Parallelization: Wave 2 | Blocked by: 1 | Blocks: F1
  References: `src/TitleReveal.tsx:122-145` (flip3d special JSX pattern), `:53-54` (ref array pattern), `src/Root.tsx:81-137` (Typography compositions)
  Acceptance criteria (agent-executable): `npm run lint` passes; all 5 new compositions visible in Remotion Studio; splitSlide shows character split animation
  QA scenarios: happy = `npx tsc --noEmit && npx eslint src/`; failure = mix existing mode="slideUp" with new props (no cross-contamination)
  Commit: Y | feat(title-reveal): implement 5 new title reveal modes and register compositions

- [ ] 7. Update catalog and final lint
  What to do / Must NOT do:
  - Run `npm run update-catalog` (alias: the script that calls `tsx scripts/generate-catalog.ts`)
  - Run `npm run lint` (which runs `eslint src && tsc`)
  - Verify file `.omo/animation-catalog.md` now contains entries for all 8 TitleReveal variants
  - Must NOT manually edit `.omo/animation-catalog.md` (auto-generated)
  - Must NOT skip lint — if it fails the plan is incomplete

  Parallelization: Wave 2 (final) | Blocked by: 6 | Blocks: F1
  References: `scripts/generate-catalog.ts`, `package.json` (scripts section)
  Acceptance criteria (agent-executable): `npm run lint` exits 0; `.omo/animation-catalog.md` contains 8 TitleReveal entries
  QA scenarios: happy = `npm run lint` passes; failure = lint output captured in `.omo/evidence/`
  Commit: N | chore: update animation catalog

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [ ] F1. Plan compliance audit — ensure all 5 modes exist, all 8 compositions registered, no existing modes altered
- [ ] F2. Code quality review — `eslint src && tsc` clean, no `any` types, GSAP AGENTS.md compliance
- [ ] F3. Visual sanity — `npm run dev` launches, each new composition plays without errors
- [ ] F4. Scope fidelity — no new deps, no export changes, no file extraction

## Commit strategy
| # | Message | Type |
|---|---------|------|
| 1 | `feat(title-reveal): add 5 new mode types and C config constants` | atomic |
| 2-6 | squashed into `feat(title-reveal): implement 5 new title reveal modes and register compositions` | squash |
| 7 | `chore: update animation catalog` (if needed) | atomic |

## Success criteria
- All 5 new modes visible and playable in Remotion Studio
- `npm run lint` passes
- Backward compatibility: existing 3 modes unchanged
- `.omo/animation-catalog.md` updated with 8 TitleReveal entries
- No new npm dependencies
