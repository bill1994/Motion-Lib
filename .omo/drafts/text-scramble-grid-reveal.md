---
slug: text-scramble-grid-reveal
status: awaiting-approval
intent: clear
pending-action: write .omo/plans/text-scramble-grid-reveal.md
approach: Create two new Remotion composition components (TextScramble + GridReveal) inspired by rebooot.me effects; register them in Root.tsx
---

# Draft: text-scramble-grid-reveal

## Components (topology ledger)
| id | outcome | status | evidence |
|---|---|---|---|
| TextScramble.tsx | Character scramble/glitch reveal effect, 180 frames, 60fps | active | rebooot.me button hover effect analysis (previous session) |
| GridReveal.tsx | Grid radial ripple reveal effect, 180 frames, 60fps | active | rebooot.me tooltip-1 grid analysis (previous session) |
| Root.tsx update | Register both new compositions | active | src/Root.tsx:71-89 (pattern: existing composition registration) |

## Open assumptions (announced defaults)
| assumption | adopted default | rationale | reversible? |
|---|---|---|---|
| No GSAP needed for either effect | Pure Remotion `useCurrentFrame()` + `interpolate()` | Both effects are simple frame-driven state computations, not animation timelines | Yes - can add GSAP later |
| Color palette | `#1D1B20` bg, `#CBC0D3` text/cells, `#4E4D5C` secondary | Project design system mandates these three tokens; dark-bg rule applies | Yes |
| Composition duration | 180 frames (3s @60fps) | All existing compositions use 180f | Yes |
| Glitch sweep bar in TextScramble | Linear sweep from left-right over 150 frames | Adds visual interest without complexity | Yes |

## Findings (cited - path:lines)
- rebooot.me scramble effect: GSAP-driven, two-layer `.orinal` + `.chars`, `mix-blend-mode: difference`, per-char textContent cycling on hover
- rebooot.me tooltip-1 grid: 12×10 grid, `Math.hypot(cell-mouseX, cell-mouseY) / 2130 * 1.8` delay, CSS glitch keyframe
- Existing pattern `CharReveal.tsx:91-296`: GSAP timeline `{paused:true}` + `seek(frame/fps)` for per-char animation
- Existing pattern `HeroReveal.tsx:1-30`: Pure Remotion `useCurrentFrame` + `interpolate` for frame-driven effects
- Root.tsx registration pattern at lines 26-89: `<Composition id="..." component={...} durationInFrames={180} fps={60} width={1920} height={1080}>`
- Project packages: `remotion` v4.0.479, `gsap` v3.15.0, `react` v19.2.3

## Decisions (with rationale)
1. **Pure Remotion over GSAP** - Both new effects are simple per-frame state computations (scramble: which char to show; grid: cell opacity from distance). No timeline needed. Lighter, more deterministic, fewer imports.
2. **Use project color palette exactly** - `#1D1B20` background for dark scenes, `#CBC0D3` as the primary accent/text color, `#4E4D5C` for secondary text.
3. **TextScramble: character-by-character staggered scramble** - Each char gets `index * 4` frames stagger delay, 28 frames of cycling random symbols, then settles. Scale animation from 0.2→1.3→1 for "pop" feel.
4. **GridReveal: radial distance-based stagger** - Center distance normalized to [0,1], mapped to appear frames [18, 106]. Cells scale from 0.4→1 over 14 frames.
5. **Content fades in after grid completes** (~frame 115+) to give the composition a narrative arc.

## Scope IN
- Create `src/TextScramble.tsx` with character scramble reveal effect
- Create `src/GridReveal.tsx` with grid radial ripple reveal effect  
- Register both in `src/Root.tsx` as new compositions
- Both at 1920×1080, 60fps, 180 frames

## Scope OUT (Must NOT have)
- NO GSAP integration for these two components
- NO external dependencies beyond what exists in package.json
- NO scroll-based or mouse-based interaction (Remotion is frame-driven)
- NO modification to existing compositions
- NO new npm packages

## Open questions
None - intent is clear and all forks are resolvable from the codebase.

## Approval gate
status: awaiting-approval
<!-- Plan is ready for user approval. Once approved, run `$start-work` to execute. -->
