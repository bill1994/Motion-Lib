# domino-cascade - Work Plan

## TL;DR (For humans)

**What you'll get:** A Remotion video composition that shows 3D domino blocks dashing into the scene center one by one, then collapsing in a smooth domino cascade — all configurable (block count, size, stagger, rotation, position).

**Why this approach:** Pure CSS 3D transforms inside Remotion (no Three.js overhead) keeps the footprint small and renders deterministic 60fps with alpha transparency for compositing.

**What it will NOT do:** Touch any existing component. No Three.js. No GSAP. No physics engine.

**Effort:** Short
**Risk:** Low — pure CSS 3D transforms, well-understood pattern, deterministic frame-by-frame animation
**Decisions to sanity-check:** Block dimensions (width/height/depth) and color palette matching the design system

Your next move: Approve this plan, or ask for refinements. Full execution detail follows below.

---

> TL;DR (machine): Short | Low | New DominoCascade.tsx component + Root.tsx registration

## Scope
### Must have
- New `src/DominoCascade.tsx` with configurable props
- 6-faced 3D block construction (front/back/top/bottom/left/right)
- Entry phase: blocks dash into view from below, staggered 0.2s
- Domino fall phase: cascading collapse left-to-right
- Configurable: count, blockWidth, blockHeight, blockDepth, entryStagger, dominoStagger, yRotationRange, xOffset, yOffset, zOffset, texts (optional)
- Color-adaptable: each block can render individual text
- Composition registration in Root.tsx
- ProRes 4444 alpha compatibility

### Must NOT have (guardrails, anti-slop, scope boundaries)
- No Three.js
- No GSAP timelines
- No external packages beyond current deps
- No particle effects or physics sims
- No changes to existing components
- No test files (no test infra exists in project)

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: none — project has no test infrastructure (verified in AGENTS.md)
- Evidence: Visual verification via `npx remotion studio`

## Execution strategy
### Parallel execution waves
Wave 1 (Todo 1): Create DominoCascade component (new file)
Wave 1 (Todo 2): Register in Root.tsx (edit existing file)
Then: Manual verification via dev server

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. DominoCascade component | — | 2 | — |
| 2. Root.tsx registration | 1 | — | — |

## Todos
> Implementation + Test = ONE todo. Never separate.
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->

- [x] 1. Create `src/DominoCascade.tsx` component
  What to do / Must NOT do:
  Create a new Remotion component with:
  - **Props interface `DominoCascadeProps`**: 
    - `count: number` (default 4)
    - `blockWidth: number` (default 20)
    - `blockHeight: number` (default 150)
    - `blockDepth: number` (default 100)
    - `entryStagger: number` (default 12 — frames, = 0.2s @60fps)
    - `dominoStagger: number` (default 3 — frames between domino falls)
    - `yRotationRange: [number, number]` (default [3, 8] — degrees)
    - `xOffset: number` (default 960 — center X of group)
    - `yOffset: number` (default 400 — baseline Y)
    - `baseColor: string` (default '#CBC0D3')
    - `accentColor: string` (default '#4E4D5C')
    - `texts?: string[]` (optional per-block text, length must match count)
    - `children?: React.ReactNode`
  - **3D Block construction**: Each block is a `transform-style: preserve-3d` container with 6 absolutely-positioned wall `<div>`s:
    - Front wall: `translateZ(blockDepth/2)`, shows text
    - Back wall: `rotateX(180deg) translateZ(blockDepth/2)` 
    - Top wall: `rotateX(90deg) translateZ(blockDepth/2)`, size: blockWidth × blockDepth
    - Bottom wall: `rotateX(-90deg) translateZ(-blockDepth/2 + blockHeight)`, size: blockWidth × blockDepth
    - Left wall: `rotateY(-90deg) translateZ(blockDepth/2)`, size: blockDepth × blockHeight
    - Right wall: `rotateY(90deg) translateZ(-blockDepth/2 + blockWidth)`, size: blockDepth × blockHeight
  - **Color shading**: Apply different opacity/brightness per face to simulate lighting (front/baseColor solid, top/accentColor lighter, bottom/accentColor darker, sides/accentColor medium)
  - **Phase system** (following Animation Architecture Rules):
    - Phase A — Entry (frames 0 to count * entryStagger + 24): Each block slides up from below (yStart = yOffset + 300 → yOffset - i * verticalSpacing) with entryStagger stagger. Opacity fades in on first 6 frames. Y-rotation starts at 0°, interpolates to random value in yRotationRange.
    - Phase B — Settle (frames after entry → entry + 12): Blocks hold at final position, slight breathing animation.
    - Phase C — Domino (frames after settle): Leftmost block (index 0) starts rotating around Z-axis (transform-origin: 100% 100%) from 0° to 85° over 24 frames. Each subsequent block starts dominoStagger frames later.
  - **Block positioning**: Each block's Y position should determine its horizontal distance — blocks with larger Y values are further apart. Formula: `gap = verticalSpacing * (1 - i / count * 0.3)` where verticalSpacing = blockHeight + 20.
  - **Use `useCurrentFrame()`** for all timing (Single-Frame Snapshot Principle). Never use GSAP or useEffect-based animation.
  - **Container**: Group wrapper with `perspective: 1500px` and `transform-style: preserve-3d`. If the group needs Y-axis rotation for visual flair, animate rotateY from 0 to 5° slowly.
  - **Must NOT**: Use Three.js, GSAP, or any external animation library. Use Remotion's `interpolate`, `spring`, `Easing` from `remotion` package only.
  - **Must NOT**: Animate width/height/top/left. Use `transform: translateX/Y` and `transform-origin` instead.
  - **Text rendering**: On the front face of each block, render text centered. If `texts` prop is provided, show `texts[i]`; if not, show nothing. Text color should be readable against the block face (white or light color). Follow dark-background rule: if block face is dark, use #CBC0D3 text color.
  
  References:
  - `src/HeroReveal.tsx:460-493` — current transform pattern
  - `src/GlassCard/GlassCard.tsx:59-77` — perspective + container pattern
  - `AGENTS.md:27-33` — Color Palette mandatory tokens
  - `AGENTS.md:50-104` — Animation Architecture Rules (Phase model, Single-Frame Snapshot)
  - User's original CSS: 6-walled block construction with color shading
  
  Parallelization: Wave 1 | Blocked by: — | Blocks: 2
  Acceptance criteria: Component renders without TypeScript errors with all default props. Dev server shows blocks entering and domino-falling.
  QA: Run `npm run lint` (eslint + tsc) — must pass. No visual QA tooling in project; confirm component renders in `npx remotion studio`.
  Commit: N (will commit in final verification wave)

- [x] 2. Register DominoCascade in `src/Root.tsx`
  What to do / Must NOT do:
  - Add `import { DominoCascade } from "./DominoCascade";` to the imports (line ~13 area)
  - Add a `<Composition>` entry in the Entrance section (after GridReveal, around line ~232):
    ```tsx
    <Composition
      id="DominoCascade"
      component={DominoCascade as unknown as React.FC<Record<string, unknown>>}
      durationInFrames={240}
      fps={60}
      width={1920}
      height={1080}
      calculateMetadata={calculateMetadata}
    />
    ```
  - Set durationInFrames = `Math.max(240, count * entryStagger + count * dominoStagger + 120)` — use 240 as safe default for count=4
  - Must NOT: Change any existing composition or import line ordering beyond the additions
  
  References:
  - `src/Root.tsx:1-16` — import pattern
  - `src/Root.tsx:216-224` — composition registration pattern (Entrance section)
  - `src/Root.tsx:21-28` — calculateMetadata function
  
  Parallelization: Wave 1 | Blocked by: Todo 1 | Blocks: —
  Acceptance criteria: `npm run lint` passes. Composition appears in Remotion Studio.
  QA: Run `npm run lint` (eslint + tsc) — must pass. Open Remotion Studio and confirm DominoCascade composition is listed.
  Commit: N (will commit in final wave)

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [x] F1. Plan compliance audit — verify both todos match scope, Must NOT have not violated
- [x] F2. Code quality — `npm run lint` passes
- [x] F3. Visual check — confirm Remotion Studio renders the animation with entry and domino phases visible
- [x] F4. Scope fidelity — no glass-card or three.js leaks

## Commit strategy
Single commit after final verification:
`feat(compositions): add DominoCascade 3D domino entry + fall animation`

## Success criteria
- `npm run lint` passes (eslint + tsc)
- DominoCascade composition shows in Remotion Studio
- Blocks dash into center one by one (0.2s stagger)
- Blocks cascade domino-fall left-to-right after entry
- All props configurable; defaults produce a visually compelling animation
- No Three.js or GSAP used in new code
