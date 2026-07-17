---
slug: k72-effects
status: awaiting-approval
intent: clear
pending-action: write .omo/plans/k72-effects.md
approach: Two new Remotion compositions reproducing K72's 5-column loader curtain and SVG circle glow, both pure Remotion (no GSAP needed — simple SVG stroke-dashoffset + CSS scaleY)
---

# Draft: k72-effects

## Components (topology ledger)
| id | outcome | status | evidence path |
|----|---------|--------|---------------|
| CurtainReveal | 5-column black curtain transition, staggered scaleY per column, cycle mode (reveal → hold → cover) | active | k72.ca inline CSS lines ~1647-1770 |
| CircleGlow | SVG ellipse with animated stroke-dashoffset wrapping around text, bidirectional loop | active | k72.ca Circle module JS lines 8711-8768 + CSS lines 2751-2787 |

## Open assumptions (announced defaults)
| assumption | adopted default | rationale | reversible? |
|-----------|----------------|-----------|-------------|
| Both comps use pure Remotion (no GSAP) | useCurrentFrame() + interpolate() for scaleY; stroke-dashoffset SVG for circle | Simpler, deterministic in Puppeteer, matches existing non-GSAP comps like GridReveal | Yes — could swap to GSAP + DrawSVGPlugin later |
| Default colors follow project design system | Curtain: black (#000000); Circle: glow #D3FD50, text #CBC0D3 on #1D1B20 bg | AGENTS.md design tokens mandate this | Language in props already |
| 5 columns with specific width ratios | Widths: [4,4,6,3,3] / 20 + gutters | Direct reproduction of k72.ca CSS | Yes — can be customized via props |
| Circle text wraps dynamically | useLayoutEffect + ref to measure text bounds, set ellipse rx/ry accordingly | K72 original does same via getBoundingClientRect() | Yes |

## Findings (cited - path:lines)
- **5-column loader CSS**: columns use `scale3d(1,0,1)` initial, `scale3d(1,1,1)` on `html:not(.is-loaded)`, staggered transition-delay from 0.075s (rightmost) to 0.255s (leftmost). Widths formula: `(100vw - 13.125rem) * N/20 + offset` — k72.ca inline `<style>` lines 1676-1732
- **Circle glow JS**: creates `<ellipse>` sized to `el.getBoundingClientRect()`, uses DrawSVGPlugin with `drawSVG: "200% 200%"` to `"100%"` intro, loop alternates with `scaleX(-1)` — app.js lines 8711-8768
- **Circle glow CSS**: `.c-circle { position:absolute; top:0; left:0; width:100%; height:100% }` with SVG stroke `#D3FD50` 2px — main.css lines 2751-2787 + 2937-2946
- **Existing comp pattern**: Root.tsx registers `<Composition id="..." component={...} durationInFrames={180} fps={60} width={1920} height={1080} />` — see GridReveal, TextScramble (pure Remotion) and CharReveal (GSAP)

## Decisions (with rationale)
1. **Pure Remotion for both comps** — no GSAP lifecycle needed for simple scaleY transforms or SVG stroke animation. Avoids GSAP context/paused/seeking ceremony. K72's circle CAN be done with SVG `pathLength` + `stroke-dashoffset` + `scaleX(-1)` — no DrawSVGPlugin dependency.
2. **Column widths split into 20 equal units** + gutter offsets — faithful to the original 4/4/6/3/3 proportions.
3. **Curtain cycle mode**: reveal (0→1)→hold(1)→cover(1→0) for demo. Standalone reveal or cover via props.
4. **Circle loop**: draw-in (stroke-dashoffset 100→0) → pause → scaleX(-1) + undraw (0→100) → scaleX(1) + redraw — full bidirectional cycle in 180 frames.

## Scope IN
- `src/CurtainReveal.tsx` — new composition
- `src/CircleGlow.tsx` — new composition
- `src/Root.tsx` — register both compositions

## Scope OUT (Must NOT have)
- No GSAP — pure Remotion interpolate
- No external assets or images
- No new npm packages
- No modification to existing compositions
- No Tailwind classes (they don't render in Remotion)
- No CSS animations/transitions (forbidden in Remotion)

## Open questions
None — all design decisions are adopted as defaults above.

## Approval gate
status: awaiting-approval
<!-- User has the brief below. Awaiting explicit go-ahead to write the final plan. -->
