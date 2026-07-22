# card-scene-content-update - Work Plan

## TL;DR (For humans)

**What you'll get:** The existing AnimatedCardScene composition gets a visual refresh — card content shows a gradient rounded block + "Claude Code" title + "AI程序员" subtitle (both with text shadows), the card itself becomes a glassmorphism panel with brand colors, opacity 0.7, light shadow, motion blur that follows the card's speed, and an auto-looping glowing edge that sweeps around the card with a conic-gradient mask and layered box-shadows. No GSAP, no new files.

**Why this approach:** Modify existing components rather than creating new ones — the architecture already separates content (DefaultCardContent), card shell (CardReveal), and orchestrator (AnimatedCardScene). Motion blur uses the same central-difference velocity pattern as HeroReveal (proven working). Glowing edge adapts the pointer-driven reference CSS to frame-driven continuous rotation for Remotion. Height-adaptive via CSS auto height.

**What it will NOT do:** Won't create new files, won't use GSAP, won't change particle/animation behavior, won't affect other compositions, won't remove the existing animation phases (intro/hold/outro still work), motion blur is isotropic (not directional), glowing edge is purely CSS overlay (no canvas/WebGL).

**Effort:** Short — 5 focused file modifications
**Risk:** Low — self-contained within AnimatedCardScene module, no new dependencies
**Decisions to sanity-check:** Glassmorphism bg color/opacity (brand primary #CBC0D3 at 0.25 alpha), blur intensity 0.08 × speed (clamped 6px), glow edge rotation speed (360° per 120 frames), glow color (CBC0D3), number of box-shadow layers (6, simplified from reference's 12)

Your next move: **Approve this updated plan**, then `$start-work` to execute.

---

> TL;DR (machine): Short | Low | 5 file modifications — DefaultCardContent redesigned, CardReveal glassmorphism + motion blur + auto-height + glowing edge, config motionBlur + glowEdge entries, Root.tsx defaultProps updated

## Scope
### Must have
- DefaultCardContent.tsx: Remove image/description/accent-line; add rounded gradient placeholder block; "Claude Code" title (#1D1B20, text-shadow); "AI程序员" subtitle (#4E4D5C, text-shadow); margin 0 10px on wrapper
- CardReveal.tsx: Glassmorphism style (rgba(203,192,211,0.25) bg + backdrop-filter blur(10px) + border + box-shadow); opacity 0.7 on card wrapper; content-adaptive height (not fixed); central-difference motion blur via computed velocity; auto-looping glowing edge overlay (conic-gradient mask sweeping around, multi-layer inset+outset box-shadows, mix-blend-mode, sin-wave pulse)
- config.ts: Add `motionBlur: { intensity, maxBlur }` + `glowEdge: { enabled, color, rotationDuration, pulseDuration, intensity }` to MotionConfig
- AnimatedCardScene.tsx: Default cardWidth=672; pass motionBlur + glowEdge config to CardReveal
- Root.tsx: Update defaultProps for AnimatedCardScene composition

### Must NOT have (guardrails, anti-slop, scope boundaries)
- NO new files created
- NO GSAP dependency or usage
- NO directional/vector motion blur (isotropic CSS blur only)
- NO Math.random() in rendering path
- NO removal or modification of existing animation phases (intro/hold/outro)
- NO change to particle system logic
- NO Tailwind animation classes or CSS keyframes
- NO modification to Root.tsx beyond AnimatedCardScene defaultProps
- NO React state for glow animation (pure computed from useCurrentFrame)
- NO pseudo-elements (::before/::after) — use actual React div elements for glow layers
- NO requestAnimationFrame — all frame-driven via Remotion loop

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: **tests-after** — run `npm run lint` (eslint + tsc) for type safety
- Evidence: `.omo/evidence/lint-output-card-scene-content.txt`

## Execution strategy
### Parallel execution waves

**Wave 1 (Foundation)** — Dependency-free config change
- T1: config.ts — add motionBlur config

**Wave 2 (Leaf Components)** — Depends on T1, no interdependence
- T2: DefaultCardContent.tsx — redesign content layout
- T3: CardReveal.tsx — glassmorphism + auto-height + motion blur (depends on T1 for motionBlur config)

**Wave 3 (Orchestration)** — Depends on T2, T3
- T4: AnimatedCardScene.tsx — update defaults, wire motion blur

**Wave 4 (Registration)** — Depends on T4
- T5: Root.tsx — update defaultProps

**Wave 5 (Verification)** — Depends on all
- T6: Lint + typecheck

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. config.ts | — | 3 | — |
| 2. DefaultCardContent.tsx | — | 4 | 1, 3 |
| 3. CardReveal.tsx | 1 | 4 | 2 |
| 4. AnimatedCardScene.tsx | 2, 3 | 5 | — |
| 5. Root.tsx | 4 | 6 | — |
| 6. Verification | 1–5 | — | — |

## Todos
> Implementation + Test = ONE todo. Never separate.
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->
- [x] 1. `src/AnimatedCardScene/config.ts` — Add motionBlur + glowEdge config entries
  What to do / Must NOT do: Add two new config interfaces and entries:
  (a) `MotionBlurConfig`: `{ intensity: number (0.08), maxBlur: number (6) }`
  (b) `GlowEdgeConfig`: `{ enabled: boolean (true), color: string ('#CBC0D3'), rotationDuration: number (120), pulseDuration: number (60), intensity: number (0.6) }`
  Add both to `MotionConfig` interface as `motionBlur: MotionBlurConfig` and `glowEdge: GlowEdgeConfig`. Add default values to `DEFAULT_MOTION_CONFIG`. Update `PartialMotionConfig` type to include both. Update `mergeConfig` to merge both. Must NOT change any existing config values or rename existing interfaces.
  Parallelization: Wave 1 | Blocked by: — | Blocks: 3
  References: Config.ts:1-82 (existing interfaces, mergeConfig); HeroReveal.tsx:110-112 (blur reference); user-provided reference CSS for glow edge
  Acceptance criteria: `node -e "import('./src/AnimatedCardScene/config.ts').then(m => console.log(m.DEFAULT_MOTION_CONFIG.motionBlur.intensity, m.DEFAULT_MOTION_CONFIG.glowEdge.rotationDuration))"` prints `0.08 120`
  QA scenarios: Verify mergeConfig correctly merges partial overrides for both motionBlur and glowEdge. Evidence: .omo/evidence/task-1-motionblur-glow-config.txt
  Commit: Y | feat(config): add motionBlur and glowEdge config entries with defaults

- [x] 2. `src/AnimatedCardScene/DefaultCardContent.tsx` — Redesign card content
  What to do / Must NOT do: Replace entire render output with: (1) a decorative rounded block as image placeholder — `width: '100%', height: 160, borderRadius: 20, background: 'linear-gradient(135deg, #4E4D5C, #1D1B20)'`; (2) title "Claude Code" — fontSize ~28-32, fontWeight 700, color `#1D1B20`, textShadow `'0 2px 8px rgba(0,0,0,0.12)'`; (3) subtitle "AI程序员" — fontSize ~18-20, fontWeight 500, color `#4E4D5C`, textShadow `'0 1px 4px rgba(0,0,0,0.08)'`, marginTop 4-6px. Wrapper div gets `margin: '0 10px'`, uses flex col layout. Remove imageUrl render, description render, accentColor accent line. Keep `title` and `subtitle` as props with defaults `'Claude Code'` and `'AI程序员'`. Must NOT use Tailwind classes (opacity 0.7 card wrapper may break Tailwind styling). Must NOT import Img from remotion. Must NOT remove CardContentProps interface dependency.
  Parallelization: Wave 2 | Blocked by: — | Blocks: 4 | Can parallelize with: 1, 3
  References: DefaultCardContent.tsx:1-67 (current implementation); AGENTS.md color tokens #1D1B20 / #4E4D5C / #CBC0D3; user spec "带圆角bg代替" / "左右margin就只要10px" / "大标题Claude Code" / "小标题:AI程序员" / "相近但不一样的颜色" / "文字都是带阴影的"
  Acceptance criteria: DefaultCardContent renders title "Claude Code" in #1D1B20 and subtitle "AI程序员" in #4E4D5C. No Img import. Wrapper has margin 0 10px. Rounded gradient block present.
  QA scenarios: Mount with default props — verify DOM contains "Claude Code" and "AI程序员". Evidence: run `npx tsc --noEmit src/AnimatedCardScene/DefaultCardContent.tsx` passes.
  Commit: Y | feat(DefaultCardContent): redesign card content with Claude Code title, AI程序员 subtitle, rounded placeholder, text shadows

- [x] 3. `src/AnimatedCardScene/CardReveal.tsx` — Glassmorphism, auto-height, motion blur, glowing edge
  What to do / Must NOT do: Four changes:
  (a) **Glassmorphism + opacity**: Update defaults — `cardWidth=672` (35vw), `cardHeight` becomes optional (default `undefined` = auto), `backgroundColor` defaults to `'rgba(203,192,211,0.25)'`, add `backdropFilter: 'blur(10px)'` with `WebkitBackdropFilter: 'blur(10px)'` to card style, `border: '1px solid rgba(203,192,211,0.2)'`, `boxShadow` default `'0 8px 32px rgba(0,0,0,0.08)'`. Card wrapper gets `opacity: 0.7`. When `cardHeight` is undefined, do NOT set `height` in card style (content determines height); for centerY calculation fallback to 280px.
  (b) **Motion blur**: After computing position (x, y, scale, rotateY), compute velocity via central difference: compute positions at `frame+1` and `Math.max(0, frame-1)`, derive `vx` and `vy`, then `speed = Math.sqrt(vx*vx + vy*vy)`, `blurRadius = Math.min(speed * config.motionBlur.intensity, config.motionBlur.maxBlur)`. Apply `filter: \`blur(${blurRadius}px)\`` to card wrapper. Keep blur at 0 during hold phase (near-zero velocity).
  (c) **Glowing edge overlay**: When `config.glowEdge.enabled`, render an overlay div inside the card shell with:
    - Position: absolute, inset: -40px (extends beyond card for glow overflow), borderRadius: inherit
    - pointerEvents: none, zIndex: 2
    - maskImage: `conic-gradient(from ${angle}deg at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%)` with Webkit prefix
    - opacity pulsing: `0.3 + 0.4 * Math.sin(frame * 2 * PI / config.glowEdge.pulseDuration)` × config.glowEdge.intensity
    - mixBlendMode: 'plus-lighter'
    - Inside the overlay, a child div with inset: 40px (matching the card bounds) with boxShadow:
      ```
      inset 0 0 0 1px hsl(glowColor / 100%),
      inset 0 0 3px 0 hsl(glowColor / 60%),
      inset 0 0 6px 0 hsl(glowColor / 40%),
      inset 0 0 15px 0 hsl(glowColor / 30%),
      inset 0 0 50px 2px hsl(glowColor / 10%),
      0 0 1px 0 hsl(glowColor / 60%),
      0 0 3px 0 hsl(glowColor / 50%),
      0 0 6px 0 hsl(glowColor / 40%),
      0 0 15px 0 hsl(glowColor / 30%),
      0 0 50px 2px hsl(glowColor / 10%)
      ```
    - Angle driven by: `(frame * 360 / config.glowEdge.rotationDuration) % 360`
    - Convert hex color `#CBC0D3` → HSL for glowColor via a utility or use hsla directly
  (d) The card outer wrapper needs `overflow: visible` so the glow can extend beyond. The inner child wrapper keeps `overflow: hidden` for content clipping.
  Must NOT change intro/hold/outro animation math. Must NOT remove backface visibility or 3D transform. Must NOT change particle trigger logic. Must NOT introduce stateful tracking (pure computed from frame). Must NOT use pseudo-elements. Must NOT use React state for glow animation.
  Parallelization: Wave 2 | Blocked by: 1 | Blocks: 4 | Can parallelize with: 2
  References: CardReveal.tsx:35-244 (current implementation); HeroReveal.tsx:108-112 (blur config pattern); AGENTS.md brand colors; user-provided reference CSS for glowing edge (conic-gradient mask + multi-layer box-shadow + mix-blend-mode); user spec "宽度35vw" / "高度根据内容物自适应" / "品牌里面的亮色" / "opacity:0.7" / "带毛玻璃效果" / "带淡阴影" / "动画加上motion blur" / "自动循环的glowing edge"
  Acceptance criteria: Card at frame=0 has glass background + backdrop-filter + border + opacity:0.7. At frame=1 (intro moving), blur radius > 0. At frame=50 (hold), blur radius ≈ 0. Glowing edge overlay present with conic-gradient mask. Angle changes continuously across frames. Sin-wave pulse in opacity. Box-shadow layers visible on glow element.
  QA scenarios: Verify centerY fallback uses 280 when cardHeight undefined. Verify backdropFilter appears in inline style. Verify filter contains blur(Npx) during intro. Verify glowEdge overlay div is rendered when enabled. Verify angle changes at expected rate. Evidence: .omo/evidence/task-3-card-reveal-modified.txt
  Commit: Y | feat(CardReveal): add glassmorphism, content-adaptive height, motion blur, and auto-looping glowing edge

- [x] 4. `src/AnimatedCardScene/AnimatedCardScene.tsx` — Update defaults, wire config
  What to do / Must NOT do: Change default `cardWidth` from 320 to 672 (35vw at 1920px). Remove `cardHeight` default (undefined → auto in CardReveal). Update `backgroundColor` default from `'#2b2b2b'` to `'rgba(203,192,211,0.25)'`. Update `boxShadow` default from `undefined` to `'0 8px 32px rgba(0,0,0,0.08)'`. The motion blur + glow edge computation lives in CardReveal (Todo 3) and uses `mergedConfig.motionBlur` and `mergedConfig.glowEdge` — already passed via `config` prop. No additional wiring needed since mergedConfig flows to CardReveal. Keep all other props and logic unchanged.
  Must NOT change particle logic, seed handling, z-ordering, or existing prop forwarding. Must NOT remove children/default content fallback logic.
  Parallelization: Wave 3 | Blocked by: 2, 3 | Blocks: 5
  References: AnimatedCardScene.tsx:26-117 (current defaults: cardWidth=320, cardHeight=420, backgroundColor='#2b2b2b')
  Acceptance criteria: Default cardWidth=672, cardHeight not passed (undefined → CardReveal handles auto). npm run lint passes on this file.
  QA scenarios: Verify mergedConfig.motionBlur and mergedConfig.glowEdge exist after merge. Verify cardWidth=672 is passed to CardReveal. Evidence: .omo/evidence/task-4-ascene-updated.txt
  Commit: Y | feat(AnimatedCardScene): update cardWidth to 672, glassmorphism bg defaults, auto-height, wire glowEdge

- [x] 5. `src/Root.tsx` — Update AnimatedCardScene defaultProps
  What to do / Must NOT do: In the AnimatedCardScene `<Composition>` block (Root.tsx:164-178), update `defaultProps` to: `{ title: "Claude Code", subtitle: "AI程序员", seed: "default" }`. Remove `description` from defaultProps (no longer rendered). Keep all other props and the import unchanged. Must NOT modify any other composition. Must NOT change import style.
  Parallelization: Wave 4 | Blocked by: 4 | Blocks: 6
  References: Root.tsx:164-178 (current defaultProps: title "Card Title", subtitle "Subtitle", description "...", seed "default")
  Acceptance criteria: Root.tsx has `title: "Claude Code"` and `subtitle: "AI程序员"` in AnimatedCardScene defaultProps. No `description` key. `npm run lint` passes.
  QA scenarios: Check import `/AnimatedCardScene/AnimatedCardScene` still exists in Root.tsx. Evidence: .omo/evidence/task-5-root-updated.txt
  Commit: Y | feat(Root.tsx): update AnimatedCardScene defaultProps for new card content

- [x] 6. Verification — Lint + typecheck
  What to do / Must NOT do: Run `npm run lint` (eslint + tsc). Save output to `.omo/evidence/lint-output-card-scene-content.txt`. If lint errors exist, fix them — target only the error source, never working code. Must NOT consider the task complete until lint passes with exit code 0.
  Parallelization: Wave 5 | Blocked by: 1–5 | Blocks: —
  References: AGENTS.md — "Lint + typecheck: npm run lint"
  Acceptance criteria: `npm run lint` exits with code 0. `.omo/evidence/lint-output-card-scene-content.txt` shows no errors.
  QA scenarios: Run after all files written. Each error traced to its source file and fixed minimally. Evidence: see saved file.
  Commit: N (squash into prior commits)

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [x] F1. Plan compliance audit — All 5 files modified ✅. Card displays "Claude Code" + "AI程序员" ✅. Glassmorphism present ✅. Motion blur applied ✅. Glowing edge overlay present ✅. cardWidth=672 ✅. Auto height ✅.
- [x] F2. Code quality review — No GSAP ✅, no Math.random ✅, no stateful velocity/animation ✅, no new files ✅, no Tailwind animation classes ✅, no imageUrl branch ✅, no pseudo-elements for glow ✅.
- [x] F3. Real manual QA — `npm run lint` passes ✅. `npm run build` succeeds ✅. Composition compiles without runtime error ✅.
- [x] F4. Scope fidelity — Git diff shows exactly 5 files, no unintended changes ✅.

## Commit strategy
One commit per todo (5 feature commits + squashed fixup):
1. `feat(config): add motionBlur and glowEdge config entries with defaults`
2. `feat(DefaultCardContent): redesign card content with Claude Code title, AI程序员 subtitle, rounded placeholder, text shadows`
3. `feat(CardReveal): add glassmorphism, content-adaptive height, motion blur, auto-looping glowing edge`
4. `feat(AnimatedCardScene): update cardWidth to 672, glassmorphism bg defaults, auto-height, wire glowEdge`
5. `feat(Root.tsx): update AnimatedCardScene defaultProps for new card content`

## Success criteria
1. All 5 modified files pass `npm run lint` with zero errors
2. `DefaultCardContent` renders "Claude Code" (title) and "AI程序员" (subtitle) with text shadows
3. `CardReveal` uses glassmorphism background (rgba CBC0D3 + backdrop-filter + border), opacity 0.7
4. `CardReveal` computes motion blur via central-difference and applies CSS blur proportional to velocity
5. `CardReveal` renders auto-looping glowing edge overlay with conic-gradient mask sweeping continuously
6. Card width = 672px (35vw), height = auto (content-adaptive)
7. No new files created
8. No GSAP or Math.random in rendering path
9. Existing animation phases (intro/hold/outro) and particle system unchanged
