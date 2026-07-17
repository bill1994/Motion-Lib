# text-scramble-grid-reveal - Work Plan

## TL;DR (For humans)
<!-- Fill this LAST, after the detailed plan below is written, so it summarizes the REAL plan. -->
<!-- Plain English for a non-engineer: NO file paths, NO todo numbers, NO wave/agent/tool names. -->

**What you'll get:** Two new Remotion compositions in the studio — "TextScramble" shows a character-by-character glitch/scramble reveal effect with a sweeping light bar; "GridReveal" shows a grid of cells appearing from center outward in a radial ripple, followed by title text. Both run 3 seconds at 60fps, 1920×1080, on transparent backgrounds.

**Why this approach:** Pure Remotion (no GSAP) keeps the code simple and deterministic — both effects are just per-frame math (which character to show, what opacity for each grid cell). The project's existing color palette (`#1D1B20` / `#CBC0D3`) gives a cohesive look.

**What it will NOT do:** Won't use GSAP, won't have hover/mouse interaction, won't modify existing compositions.

**Effort:** Quick
**Risk:** Low - two small components following established patterns
**Decisions to sanity-check:** (none — all follow project conventions)

Your next move: approve, then run `$start-work` to execute. Full execution detail follows below.

---

> TL;DR (machine): Quick | Low | 2 new composition files + Root.tsx registration

## Scope
### Must have
- `src/TextScramble.tsx` — character scramble/glitch reveal, 180 frames, dark bg (`#1D1B20`), light text (`#CBC0D3`), per-char stagger 4f, scramble 28f, sweep light bar
- `src/GridReveal.tsx` — grid radial ripple reveal, 12×8 cols/rows, center-out distance stagger, cells scale .4→1, title/subtitle fade in after grid fills
- `src/Root.tsx` — register both as `<Composition id="TextScramble" ...>` and `<Composition id="GridReveal" ...>`

### Must NOT have (guardrails, anti-slop, scope boundaries)
- NO GSAP imports in either new file
- NO new npm packages
- NO modification to existing compositions
- NO scroll/mouse interaction logic

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: none (no test framework exists in project; verification via `npm run lint` + studio preview)
- Evidence: inline

## Execution strategy
### Parallel execution waves
> Wave 1: both files are independent — parallel.

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. TextScramble.tsx | — | — | 2 |
| 2. GridReveal.tsx | — | — | 1 |
| 3. Root.tsx update | 1, 2 | — | — |

## Todos
> Implementation + Test = ONE todo. Never separate.
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->
- [ ] 1. Create `src/TextScramble.tsx`
  What to do / Must NOT do: Write the character scramble composition. Pure `useCurrentFrame` + `interpolate`, no GSAP. Font: `"MapleMono-NF-CN", "Courier New", monospace`. Color: bg `#1D1B20`, text `#CBC0D3`. Per-char stagger 4f delay, 28f scramble duration cycling random chars from pool `"!<>-_\\/[]{}—=+*^?#%"`, then settle. Scale animation 0.2 → 1.3 → 1. Sweep light bar linear across 150f. Props: `text?` (default "ZhanWeiFu"), `fontSize?` (default 5 rem), `children?`.
  Parallelization: Wave 1 | Blocked by: — | Blocks: 3
  References (executor has NO interview context - be exhaustive):
    - Existing CharReveal.tsx (full file) — project pattern for transparent-bg compositions with font family
    - Existing HeroReveal.tsx:115-130 (interpolate import + usage pattern)
    - AGENTS.md (project rules: color palette `#1D1B20`/`#CBC0D3`/`#4E4D5C`, dark-bg rule)
    - This draft `.omo/drafts/text-scramble-grid-reveal.md` (full design decisions)
  Acceptance criteria (agent-executable): `npm run lint` passes without errors
  QA scenarios: Read the written file; verify imports are from "remotion" only (no gsap); verify `useCurrentFrame` and `interpolate` are used; verify bg `#1D1B20`, text `#CBC0D3`; run `npm run lint`
  Commit: N (one commit at end)

- [ ] 2. Create `src/GridReveal.tsx`
  What to do / Must NOT do: Write the grid radial ripple composition. Pure `useCurrentFrame` + `interpolate`, no GSAP. 12×8 grid of `#CBC0D3` cells (50px, gap 4px, border-radius 6px). Center-out distance stagger: appearFrame = 18 + (distance/maxDistance) * 88. Cells scale 0.4→1 over 14f. After grid fills (~f115), title + subtitle fade in with slide-up 24px over 25f. Props: `cols?`(12), `rows?`(8), `cellSize?`(50), `gap?`(4), `title?`("Rebooot"), `subtitle?`("Grid Reveal · Radial Ripple"), `children?`.
  Parallelization: Wave 1 | Blocked by: — | Blocks: 3
  References: Same as Todo 1 + GridReveal design decisions in draft
  Acceptance criteria: `npm run lint` passes without errors
  QA scenarios: Read the written file; verify no gsap import; verify grid computes distance-based appear frames; verify content appears after ~f115; run `npm run lint`
  Commit: N (one commit at end)

- [ ] 3. Register both in `src/Root.tsx`
  What to do / Must NOT do: Import `TextScramble` from `./TextScramble` and `GridReveal` from `./GridReveal`. Add two `<Composition>` entries matching existing pattern (180f, 60fps, 1920×1080, calculateMetadata). IDs: `"TextScramble"` and `"GridReveal"`. Insert after the existing compositions, before the closing `</>`.
  Parallelization: Wave 2 | Blocked by: 1, 2 | Blocks: —
  References:
    - src/Root.tsx:26-89 (existing composition registration pattern)
  Acceptance criteria: `npm run lint` passes; `npx remotion studio` starts without error (optional check)
  QA scenarios: Read Root.tsx to verify imports and entries are correct; run `npm run lint`
  Commit: Y | feat(compositions): add TextScramble and GridReveal compositions

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [ ] F1. Plan compliance audit — verify no GSAP imports, no extra deps, no modified existing files
- [ ] F2. Code quality — `npm run lint` passes cleanly
- [ ] F3. TypeScript check — `npx tsc --noEmit` passes (or `npm run lint` includes tsc)
- [ ] F4. Scope fidelity — confirm only 3 files touched (2 new + 1 edit)

## Commit strategy
Single commit at end: `feat(compositions): add TextScramble and GridReveal compositions`

## Success criteria
- `npm run lint` passes
- Both "TextScramble" and "GridReveal" appear in the Remotion Studio composition list
- Each composition renders for 180 frames at 60fps without errors
