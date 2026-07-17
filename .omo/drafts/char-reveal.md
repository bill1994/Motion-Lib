---
slug: char-reveal
status: awaiting-approval
intent: clear
pending-action: write .omo/plans/char-reveal.md
approach: Create new CharReveal composition with GSAP rotationX bottom-origin character flip
---

# Draft: char-reveal

## Components (topology ledger)
| id | outcome (one line) | status | evidence path |
|---|---|---|---|
| CharReveal.tsx | New composition: character-by-character flip reveal with GSAP | active | Root.tsx registration |
| Root.tsx | Register CharReveal composition with standard 180f/60fps/1080p | active | |

## Open assumptions (announced defaults)
| assumption | adopted default | rationale | reversible? |
|---|---|---|---|
| Animation style: rotateX 90→0 from bottom | rotationX per char with origin-bottom | Matches HTML `origin-bottom` class semantics | Yes - easing/duration params in CONFIG |
| Stagger timing: 0.04s per char | 0.04s | 40 chars × 0.04 + 0.6s duration ≈ 2.16s, fits 3s timeline | Yes - CONFIG param |
| Easing: back.out(1.7) | Same as TextIntro mainEase | Consistent overshoot feel across compositions | Yes - CONFIG param |
| CharRef array pattern | Array of refs, same as TextIntro | Proven pattern in this codebase | No - architecture |
| perspective: 800px on container | CSS perspective on wrapper | Required for proper 3D rotationX foreshortening | Yes - CONFIG param |
| Animation duration: 180 frames @ 60fps | Same as all other compositions | Project consistency | No - Root.tsx default |
| Color: white (#ffffff) text on transparent bg | Matches TextIntro/HeroReveal | Transparent bg for ProRes alpha output | Yes - props |
| Font: "MapleMono-NF-CN", sans-serif | Same as all other compositions | Project standard | Yes - props |

## Findings (cited - path:lines)

1. **Reference HTML structure**: Characters split into `inline-block` spans with `origin-bottom` class, words grouped in `whitespace-nowrap` spans, with `sr-only` + `aria-hidden` accessibility pattern. (user-provided HTML snippet)

2. **GSAP + Remotion pattern**: Project mandates `gsap.timeline({ paused: true })` + `gsap.context(() => {...}, containerRef)` + `tl.seek(frame / fps)`. (AGENTS.md + ClawdDrop.tsx:66-158)

3. **ClawdDrop.tsx** is the most complete GSAP pattern reference: `gsap.context()` wrapping around timeline, `tlRef.current` for seeking, `ctx.revert()` + `tl.kill()` in cleanup. (src/ClawdDrop.tsx:66-158)

4. **TextIntro.tsx** shows existing character-based approach: each char as `inline-block`, ref array, `fromTo` with stagger. (src/TextIntro.tsx:51-190) — but it **lacks** `gsap.context()` wrapping.

5. **All compositions** 1920×1080, 60fps, 180 frames (3s), ProRes 4444 with alpha via `calculateMetadata`. (src/Root.tsx:11-92)

6. **Package.json**: `gsap ^3.15.0` installed; no `@gsap/react`. (package.json:8-20)

7. **Design System**: Text primary `#1D1B20`, page primary `#CBC0D3`, dark-bg text `#CBC0D3`. Transparent bg for ProRes alpha. (AGENTS.md)

8. **GSAP rotateX behavior**: `rotationX` is a 3D transform requiring `perspective` on parent for correct 3D foreshortening effect. (gsap-core skill)

## Decisions (with rationale)

1. **New composition `CharReveal`** — not modifying TextIntro. Rationale: different animation style (rotationX flip vs translateY slide), different HTML structure (word-grouped vs flat), cleaner separation.

2. **Use `rotationX` from 90 to 0 with `transformOrigin: "bottom center"`** — matches the HTML `origin-bottom` signal. Characters appear to flip up from their baseline.

3. **Match reference accessibility pattern**: `sr-only` span for screen readers + `aria-hidden="true"` on visual version. This is a best practice the reference demonstrates.

4. **Perspective 800px on container** — required for 3D rotationX to produce correct foreshortening. Also set `transformStyle: "preserve-3d"` on character spans.

5. **CONFIG object for all animation params** — follows TextIntro.tsx pattern (lines 8-23), makes tuning easy.

6. **Full gsap.context() pattern** — follows ClawdDrop.tsx (lines 66-158), NOT TextIntro's bare pattern.

## Scope IN

- Create `src/CharReveal.tsx` with the GSAP-driven character flip reveal
- Register in `src/Root.tsx` as a new Composition
- Accessibility: sr-only text + aria-hidden visual
- Animation parameters in CONFIG object
- Standard 180f @ 60fps, 1920×1080, ProRes 4444 with alpha

## Scope OUT (Must NOT have)

- Do NOT modify existing TextIntro.tsx
- Do NOT add animationStyle prop to any existing component
- Do NOT add new dependencies (no @gsap/react)
- Do NOT create test files (project has no test infrastructure)
- Do NOT implement CSS animation alternative
- Do NOT change project color system or font stack

## Open questions

None — all forks resolved via exploration and adopted defaults.

## Approval gate
status: awaiting-approval
<!-- Plan written to .omo/plans/char-reveal.md — awaiting user okay before submission -->
