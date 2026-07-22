---
slug: card-scene-content-update
status: awaiting-approval
intent: clear
pending-action: write .omo/plans/card-scene-content-update.md
approach: Modify 4 existing files under src/AnimatedCardScene/ + update Root.tsx defaultProps — DefaultCardContent gets new content layout (no image, Claude Code + AI程序员), CardReveal gets glassmorphism + content-adaptive height + motion blur, AnimatedCardScene threading
---

# Draft: card-scene-content-update

## Components (topology ledger)
| id | outcome | status | evidence path |
|----|---------|--------|---------------|
| DefaultCardContent.tsx | New content layout: rounded bg placeholder + "Claude Code" title + "AI程序员" subtitle, text shadows, margin 10px | to-modify | source: 9-64 |
| CardReveal.tsx | Glassmorphism (brand-color semi-transparent bg + backdrop-filter + light border), content-adaptive height (auto), opacity 0.7, motion blur via central-difference velocity, auto-looping glowing edge overlay | to-modify | source: 35-244 |
| config.ts | Add motionBlur config (intensity, maxBlur) + glowEdge config (enabled, color, rotationDuration, pulseDuration, intensity) | to-modify | source: 1-82 |
| AnimatedCardScene.tsx | Pass cardWidth 672, no fixed cardHeight, wire motion blur + glow edge | to-modify | source: 26-117 |
| Root.tsx | Update defaultProps for AnimatedCardScene composition | to-modify | Root.tsx:164-178 |

## Open assumptions (announced defaults)
| assumption | adopted default | rationale | reversible? |
|------------|----------------|-----------|-------------|
| 35vw card width in px | `672px` (1920 × 0.35) computed via `width * 0.35` from useVideoConfig | 1920 is the fixed composition width | Yes — user can override cardWidth prop |
| Content-adaptive card height | Omit fixed `height` in style, use estimated 280px for Y-centering math | Content (title+subtitle+decorative block) is ~200-250px, 280 is safe | Yes — pass explicit cardHeight to override |
| Glassmorphism background | `rgba(203,192,211,0.25)` + `backdrop-filter: blur(10px)` + `border: 1px solid rgba(203,192,211,0.2)` | Brand primary `#CBC0D3` with 0.25 alpha gives subtle glass; 10px blur standard | Yes — backgroundColor prop overrides |
| opacity 0.7 | Applied to card wrapper div, text remains at full color strength with text-shadow compensator | User explicitly asked 0.7 | Yes — card style prop |
| Motion blur intensity | `0.08` blurFactor, `6px` maxBlur | Based on HeroReveal blurIntensity=0.45 scaled for card speeds | Yes — configurable via config prop |
| Text colors | Title `#1D1B20`, subtitle `#4E4D5C` — similar purple-gray family, different value | Brand text-primary and text-secondary, with text-shadow for readability | Yes — DefaultCardContent props |
| Decorative block (image placeholder) | 100% width, `160px` height, `borderRadius: 20px`, gradient `#4E4D5C → #1D1B20` | Visual placeholder matching brand palette | Yes — can swap for real image later |
| Glowing edge auto-loop | Continuous rotation (360° per ~120 frames), pulsing opacity via sin wave, glow color `#CBC0D3` hsla equivalent | Reference CSS uses pointer-driven glow; adapted to frame-driven auto-loop for Remotion | Yes — glowEdge.enabled config toggle or full override via config prop |
| Glowing edge layers | Four components: (1) outbound glow via negative-inset div with multi-layer box-shadow, (2) conic-gradient mask for sweep window, (3) mix-blend-mode for composite, (4) sin-wave pulse for breathing | Reference uses 12 box-shadow layers for depth; simplified to 6 for perf | Yes — all tunable via config |

## Findings (cited - path:lines)

1. **HeroReveal already implements motion blur via central difference**: HeroReveal.tsx:108-112 has `blurIntensity` and `maxBlur` config, and computes blur from velocity. Confirms feasibility; same pattern reusable in CardReveal.
2. **CardReveal uses fixed cardHeight for layout math**: CardReveal.tsx:44-52 uses `cardHeight` default 420 for centering `centerY`. Changing to auto-height means centerY needs a fallback estimate.
3. **Composition uses AnimatedCardScene directly with defaultProps**: Root.tsx:164-178 passes title/subtitle/description via defaultProps, no `children`. Changing DefaultCardContent changes the composition's default output.
4. **AnimatedCardScene props include cardWidth/cardHeight/borderRadius/backgroundColor/boxShadow**: AnimatedCardScene.tsx:36-41 — these flow to CardReveal. Changing defaults here affects the composition.
5. **Brand palette is mandatory**: AGENTS.md mandates `#CBC0D3` (page primary), `#1D1B20` (text primary), `#4E4D5C` (text secondary). No other colors without explicit brief.

## Decisions (with rationale)

1. **Modify existing files, no new files needed**: The existing component structure (DefaultCardContent / CardReveal / AnimatedCardScene / config) covers all requirements. Adding a new file would be unnecessary.
2. **DefaultCardContent uses semantic props but hardcodes default text**: Title "Claude Code" and subtitle "AI程序员" as default props, can still be overridden via `title`/`subtitle` props from external usage. The imageUrl branch is removed (not just hidden).
3. **Central-difference motion blur over analytical**: Central difference `(pos(f+1) - pos(f-1)) / 2` works for any position function (interpolate, spring, sin) without manual derivative math. Matches HeroReveal's pattern.
4. **Height adaptive via CSS `height: auto`, centerY uses fallback estimate**: Card div gets no fixed height. The centerY animation uses estimated 280px for positioning math. The card itself flows naturally.
5. **Glassmorphism layer is separate from content**: The card outer gets glass background + blur + border + opacity:0.7; the children (text) render normally inside at full opacity within the 0.7 wrapper.

## Scope IN

- Modify `DefaultCardContent.tsx` — remove image/description/accent-line, add rounded gradient placeholder, "Claude Code" title, "AI程序员" subtitle with text shadows, margin 0 10px
- Modify `CardReveal.tsx` — glassmorphism defaults (bg, backdrop-filter, border, boxShadow, opacity 0.7), content-adaptive height, central-difference motion blur, auto-looping glowing edge overlay (conic-gradient mask, multi-layer box-shadow, mix-blend-mode)
- Modify `config.ts` — add `motionBlur` config + `glowEdge` config (enabled, color, rotationDuration, pulseDuration, intensity) to MotionConfig
- Modify `AnimatedCardScene.tsx` — default cardWidth=672, pass motionBlur + glowEdge config to CardReveal
- Modify `Root.tsx` — update defaultProps to match new content
- Motion blur driven by frame-difference velocity — isotropic CSS blur applied during animation
- Glowing edge auto-loop: continuous angle rotation frame-driven, pulsing intensity via sin wave

## Scope OUT (Must NOT have)

- NO new files created — modify existing ones only
- NO GSAP dependency or usage
- NO stateful particle system changes
- NO Math.random() in rendering path
- NO removal of existing animation phases (intro/hold/outro still work)
- NO directional/vector motion blur — isotropic CSS blur only (GSAP plugin needed for directional)
- NO Tailwind animation classes or CSS keyframes
- NO change to particle system or existing particle animation behavior
- NO modification to Root.tsx except the AnimatedCardScene defaultProps

## Open questions

None — all forks resolved from codebase or user spec.

## Approval gate
status: awaiting-approval
pending-action: write .omo/plans/card-scene-content-update.md
