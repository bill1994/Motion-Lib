# k72-effects - Work Plan

## TL;DR (For humans)

**What you'll get:** Two new Remotion compositions — `CurtainReveal` (5-column black curtain transition like K72's loader) and `CircleGlow` (SVG ellipse that draws itself around text with a bidirectional glow loop).

**Why this approach:** Pure Remotion with `interpolate()` and SVG `stroke-dashoffset` — no GSAP needed for either effect. The curtain uses staggered `scaleY` transforms per column; the circle glow uses `pathLength` + `stroke-dasharray` to animate the ellipse stroke.

**What it will NOT do:** No GSAP, no new dependencies, no CSS animations (forbidden in Remotion), no modifications to existing compositions.

**Effort:** Short
**Risk:** Low — both effects are visual-only, stateless, and deterministic
**Decisions to sanity-check:** Column width proportions; circle glow color; animation timing (frame ranges for each phase)

Your next move: approve, then a worker executes the 3 todos below.

---

> TL;DR (machine): Short, Low risk. 2 new files + 1 edit. Pure Remotion. ~200 LOC total.

## Scope
### Must have
- `src/CurtainReveal.tsx` — 5-column staggered curtain with reveal/hold/cover cycle
- `src/CircleGlow.tsx` — SVG ellipse stroke-dashoffset animation around text, bidirectional loop
- `src/Root.tsx` — register both as 1920×1080 60fps 180-frame compositions

### Must NOT have (guardrails, anti-slop, scope boundaries)
- No GSAP usage
- No CSS animations or Tailwind classes
- No new dependencies
- No editing any existing composition other than Root.tsx registration
- No external assets

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- **Test decision**: tests-after (manual visual verification via Remotion Studio + `tsc` typecheck + eslint)
- **Evidence**: `npm run lint` must pass; compositions must render without error in Studio

## Execution strategy
### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. CurtainReveal.tsx | — | 3 | 2 |
| 2. CircleGlow.tsx | — | 3 | 1 |
| 3. Root.tsx registration | 1, 2 | — | — |

## Todos

- [ ] 1. Create `src/CurtainReveal.tsx`
  **What to do / Must NOT do:** Create a new Remotion composition with 5 absolutely-positioned `<div>` columns that animate `transform: scaleY(...)` with staggered timing. The composition must:
  - Accept props via `CurtainRevealProps` interface: `direction?: "reveal" | "cover" | "cycle"` (default "cycle"), `columnCount?: number` (default 5), `backgroundColor?: string` (default "#000000"), `children?: React.ReactNode`
  - Use `useCurrentFrame()` and `interpolate()` from Remotion (NOT gsap, NOT CSS transitions)
  - Calculate each column's width using proportional fractions summing to 1 (default: `[4, 6, 4, 3, 3] / 20` — matching K72 proportions exactly, arranged left-to-right as: 4/20, 6/20, 4/20, 3/20, 3/20)
  - Apply staggered start frames per column: [15, 13, 10, 7, 5] (converted from K72 delays 0.255s, 0.21s, 0.165s, 0.12s, 0.075s at 60fps ≈ 15, 13, 10, 7, 5 frames)
  - For "reveal": columns animate `scaleY: 0→1` with `transformOrigin: "center bottom"` (growing upward)
  - For "cover": columns animate `scaleY: 1→0` with `transformOrigin: "center top"` (shrinking downward)
  - For "cycle" (default): reveal phase 0→45 → hold phase 45→90 → cover phase 90→135 → hidden 135→180
  - Easing function: `Easing.bezier(0.215, 0.61, 0.355, 1)` (matching K72's `cubic-bezier(0.215, 0.61, 0.355, 1)`)
  - Color palette: follow AGENTS.md design system (#1D1B20 background, #CBC0D3 text)
  - Must NOT use CSS `transition` or `animation` properties
  - Must NOT use GSAP

  **Parallelization:** Wave 1 | Blocked by: — | Blocks: 3
  **References:** K72 CSS loader (growing-from-bottom / shrinking-from-top columns with staggered delays); existing `GridReveal.tsx` for pure-Remotion pattern; `src/AnimeDrop.tsx` for `interpolate()` + `Easing` usage. Column widths from k72.ca: col1≈4/20, col2≈6/20, col3≈4/20, col4≈3/20, col5≈3/20. Delay mapping: rightmost→shortest delay, leftmost→longest.
  **Acceptance criteria (agent-executable):** File compiles with `npx tsc --noEmit` and `npm run lint` passes.
  **QA scenarios:**
  - Happy: Verify file exists at `src/CurtainReveal.tsx`, has named export `CurtainReveal`, passes typecheck
  - Visual: Open in Remotion Studio (`npx remotion studio`), scrub through frames 0-180 to see staggered column animation
  **Commit:** Y | feat(compositions): add CurtainReveal — 5-column staggered curtain transition

- [ ] 2. Create `src/CircleGlow.tsx`
  **What to do / Must NOT do:** Create a new Remotion composition with an SVG ellipse that draws itself around text using `stroke-dashoffset` animation. The composition must:
  - Accept props via `CircleGlowProps` interface: `text?: string` (default "creative"), `fontSize?: number` (default 80, in px), `glowColor?: string` (default "#D3FD50" — K72's fluorescent green), `strokeWidth?: number` (default 2), `backgroundColor?: string` (default "#1D1B20"), `children?: React.ReactNode`
  - Render the text centered in the container with `fontFamily: '"MapleMono-NF-CN", sans-serif'` and `color: "#CBC0D3"`
  - After mount, measure the text bounding box using `useLayoutEffect` + `useRef<HTMLDivElement>` to determine the exact dimensions
  - Render an SVG `<ellipse>` as an overlay positioned over the text, with:
    - `pathLength="100"` attribute
    - `strokeDasharray="100"` 
    - `rx` and `ry` computed from measured text width/height + 20px padding on each side
    - `stroke={glowColor}` and `strokeWidth={strokeWidth}` and `fill="transparent"`
  - Use `useCurrentFrame()` to drive `strokeDashoffset` in a bidirectional loop:
    - Frame 0→45: `stroke-dashoffset: 100 → 0` (draw in, easing `Easing.inOut(Easing.cubic)`)
    - Frame 45→60: stay at 0 (pause, full visibility)
    - Frame 60→105: flip SVG with `scaleX(-1)` via a wrapping `<g>`, `stroke-dashoffset: 0 → 100` (undraw from the other side)
    - Frame 105→120: stay at 100 (pause, hidden)
    - Frame 120→165: unflip SVG (`scaleX(1)`), `stroke-dashoffset: 100 → 0` (redraw)
    - Frame 165→180: stay at 0 (pause)
  - The SVG wrapper must use `transformOrigin: "center"` for the flip to work correctly
  - Must NOT use GSAP or DrawSVGPlugin
  - Must NOT use CSS transitions/animations
  - Color: #D3FD50 for glow, #CBC0D3 for text, #1D1B20 for background

  **Parallelization:** Wave 1 | Blocked by: — | Blocks: 3
  **References:** K72 Circle module (JS: creates SVG ellipsis matching text BCR, animates DrawSVGPlugin with direction swap via scaleX(-1)); `src/CharReveal.tsx` for `useLayoutEffect` + ref pattern; SVG `pathLength` attribute MDN docs. Existing `GridReveal.tsx` for pure Remotion pattern.
  **Acceptance criteria (agent-executable):** File compiles with `npx tsc --noEmit` and `npm run lint` passes.
  **QA scenarios:**
  - Happy: Verify file exists at `src/CircleGlow.tsx`, has named export `CircleGlow`, passes typecheck
  - Visual: Open in Remotion Studio, scrub through frames to see ellipse draw around text, flip direction mid-cycle
  - Edge: Test with long text string — ellipse should size-wrap accordingly
  **Commit:** Y | feat(compositions): add CircleGlow — SVG stroke-dashoffset ellipse glow around text

- [ ] 3. Register both compositions in `src/Root.tsx`
  **What to do / Must NOT do:** Add two new `<Composition>` entries in `RemotionRoot()`:
  - Import `CurtainReveal` from `"./CurtainReveal"`
  - Import `CircleGlow` from `"./CircleGlow"`
  - Add `<Composition id="CurtainReveal" component={CurtainReveal} durationInFrames={180} fps={60} width={1920} height={1080} calculateMetadata={calculateMetadata} />`
  - Add `<Composition id="CircleGlow" component={CircleGlow} durationInFrames={180} fps={60} width={1920} height={1080} calculateMetadata={calculateMetadata} />`
  - Must NOT remove or modify any existing Composition entries
  - Place CurtainReveal after existing GridReveal, CircleGlow after CurtainReveal

  **Parallelization:** Wave 2 | Blocked by: 1, 2 | Blocks: —
  **References:** `src/Root.tsx` lines 1-110 (current composition registrations, import style, calculateMetadata)
  **Acceptance criteria (agent-executable):** `npm run lint` passes. Remotion Studio lists both new compositions in the sidebar.
  **QA scenarios:**
  - Happy: `npx tsc --noEmit` passes, `npm run lint` passes
  - Studio: `npx remotion studio` (just verify it starts without import errors)
  **Commit:** Y | feat(root): register CurtainReveal and CircleGlow compositions

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE.
- [ ] F1. **Plan compliance audit**: Verify all 3 todos completed exactly as specified — files exist, exports match, no extra changes
- [ ] F2. **Typecheck + lint**: `npm run lint` exits 0 with no errors or warnings
- [ ] F3. **Studio smoke test**: `npx remotion studio` starts and lists both new compositions
- [ ] F4. **Scope fidelity**: No existing compositions modified, no new dependencies added, no GSAP usage

## Commit strategy
Three commits, one per todo:
1. `feat(compositions): add CurtainReveal — 5-column staggered curtain transition`
2. `feat(compositions): add CircleGlow — SVG stroke-dashoffset ellipse glow around text`
3. `feat(root): register CurtainReveal and CircleGlow compositions`

## Success criteria
1. `npm run lint` passes with zero errors
2. `npx remotion studio` shows 11 compositions (9 original + 2 new)
3. CurtainReveal: columns animate in staggered sequence, scaleY from bottom (reveal) and top (cover)
4. CircleGlow: SVG ellipse draws around "creative" text, alternates drawing direction at midpoint
