# char-reveal - Work Plan

## TL;DR (For humans)

**What you'll get:** A new Remotion composition called `CharReveal` that reveals text one character at a time with a 3D flip-up effect — each letter appears to flip upright from the bottom of the text baseline, creating a wave-like staggered reveal across the full sentence.

**Why this approach:** The reference HTML's `origin-bottom` class signals a bottom-origin transform animation (likely `rotateX` 3D flip). GSAP's `rotationX` with `transformOrigin: "bottom center"` precisely replicates this, while the project's established `gsap.context()` + `paused: true` + `seek(frame/fps)` pattern guarantees deterministic 60fps Remotion rendering. A new composition keeps this animation style decoupled from the existing `TextIntro` (which uses translateY slide-up).

**What it will NOT do:** Won't modify any existing file except `Root.tsx` (to register the new composition). Won't add any new npm dependencies. Won't create test infrastructure. Won't use CSS animations (forbidden in Remotion). Won't animate layout properties (width/height/top/left — only transforms).

**Effort:** Short — 1 new component file (src/CharReveal.tsx) + 1 registration change (src/Root.tsx)
**Risk:** Low — well-known GSAP pattern used across 3+ existing compositions
**Decisions to sanity-check:** rotationX vs scaleY animation technique, stagger timing value, perspective amount

Your next move: Approve this plan, or request modifications. Full execution detail follows below.

---

> TL;DR (machine): Short | Low | NEW `src/CharReveal.tsx` (GSAP rotationX char-flip) + MODIFY `src/Root.tsx` (register composition)

## Scope
### Must have
- New `src/CharReveal.tsx` component with character-by-character 3D flip reveal
- GSAP timeline using `{ paused: true }` + `gsap.context()` + `tl.seek(frame/fps)`
- `rotationX` from ~90° to 0° with `transformOrigin: "bottom center"` per character
- Stagger per character (wave-like reveal)
- Word-grouped whitespace wrapping (no mid-word line breaks)
- Accessibility: `sr-only` span + `aria-hidden="true"` on visual version
- CONFIG object for all animation parameters
- Standard 1920×1080, 60fps, 180 frames (3s), transparent bg
- Registration in `src/Root.tsx` as a new Composition
- Use project font (`"MapleMono-NF-CN", sans-serif`) and brand color scheme
- Lint + typecheck pass

### Must NOT have (guardrails, anti-slop, scope boundaries)
- Do NOT modify `TextIntro.tsx` or any existing composition except Root.tsx
- Do NOT add `@gsap/react` or any new npm dependency
- Do NOT create test files
- Do NOT use CSS animations or Tailwind animation classes
- Do NOT animate layout properties (width/height/top/left)
- Do NOT change project color system, font stack, or config
- Do NOT implement interactive variants or runtime control beyond frame-driven seek

## Verification strategy
- Test decision: none (no test framework in project). Agent-executed QA via CLI still renders.
- Evidence: Run `npx remotion still CharReveal --frame=0 --scale=0.25` → all chars invisible
- Evidence: Run `npx remotion still CharReveal --frame=60 --scale=0.25` → some chars mid-reveal
- Evidence: Run `npx remotion still CharReveal --frame=179 --scale=0.25` → all chars fully visible

## Execution strategy
### Parallel execution waves
**Wave 1:** Create + register + verify. 3 sequential todos (each depends on prior).

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. Create CharReveal.tsx | — | 2 | — |
| 2. Register in Root.tsx | 1 | 3 | — |
| 3. Build verification | 2 | — | — |

## Todos
> Implementation + Verification = ONE todo. Never separate.

- [ ] **1. Create `src/CharReveal.tsx` — full component**
  - Create the file with the following structure:
    ```
    - CONFIG object (all animation params: charDuration, stagger, ease, perspective, fontSize, etc.)
    - tokenize() function: splits text into word/space tokens with character arrays
    - CharReveal component:
      - Ref: containerRef (for gsap.context scope)
      - Ref: tlRef (Timeline reference for seek)
      - Ref: charRefs (flat array of per-character HTMLSpanElement refs)
      - Accessibility: `<span className="sr-only">` with full text + `<span aria-hidden="true">` for visual
      - Word grouping: each word in `<span style={{display:"inline-block", whiteSpace:"nowrap"}}>`
      - Each character: `<span style={{display:"inline-block", transformOrigin:"bottom center"}}>`
      - Container perspective: `perspective: 800px` on an outer wrapper
      - useEffect#1 (init): gsap.context() → gsap.timeline({paused: true}) → fromTo(
          validChars, {rotationX: 90, opacity: 0}, {rotationX: 0, opacity: 1, duration, stagger, ease}
        ) → store tl → cleanup: tl.kill() + ctx.revert()
      - useEffect#2 (per frame): tlRef.current.seek(frame / fps)
    ```
    - Must NOT: use CSS animations, animate layout properties, add new imports beyond react/remotion/gsap
    - Must NOT: skip gsap.context() wrapping (follow ClawdDrop.tsx pattern)
    - Must NOT: animate space characters (they should fade in simply or appear static)
  - Parallelization: Wave 1 | Blocked by: — | Blocks: 2
  - References:
    - Reference HTML structure (user-provided): word-grouped chars with origin-bottom
    - ClawdDrop.tsx GSAP pattern: src/ClawdDrop.tsx:66-158 (gsap.context + paused + seek)
    - TextIntro.tsx CONFIG + charRefs pattern: src/TextIntro.tsx:8-23, 36-38, 60-65, 153-163
    - AGENTS.md design system: color tokens (#ffffff on transparent), font (MapleMono-NF-CN)
    - AGENTS.md GSAP rules: paused: true mandatory, seek(frame/fps) formula, gsap.context()
    - AGENTS.md performance: use x/y/scale/rotation only, never width/height/top/left
    - remotion-best-practices: no CSS animations, no Tailwind animation classes
  - Acceptance criteria: File exists at `src/CharReveal.tsx`, exports `CharReveal` as named export, follows project GSAP pattern, no lint errors when imported
  - QA scenarios:
    - Happy: `npx remotion still CharReveal --frame=0 --scale=0.25 --props='{"text":"Test"}' -o /dev/null 2>&1` (should not error)
    - Structure: grep for "rotationX" in src/CharReveal.tsx (confirms GSAP rotationX usage)
    - Structure: grep for "gsap.context" in src/CharReveal.tsx (confirms context wrapping)
  - Commit: N (will commit at end)

- [ ] **2. Register `CharReveal` in `src/Root.tsx`**
  - Add: `import { CharReveal } from "./CharReveal";`
  - Add: `<Composition id="CharReveal" component={CharReveal} durationInFrames={180} fps={60} width={1920} height={1080} calculateMetadata={calculateMetadata} />`
  - Must NOT: remove any existing imports or compositions
  - Must NOT: change calculateMetadata function
  - Parallelization: Wave 1 | Blocked by: 1 | Blocks: 3
  - References: src/Root.tsx:26-92 (full file layout)
  - Acceptance criteria: `npx tsc --noEmit` passes, new composition appears in `npx remotion compositions` output
  - QA scenarios:
    - Happy: `npx remotion compositions 2>&1 | grep CharReveal` → outputs the composition
    - Happy: `npx tsc --noEmit 2>&1` → exits 0
  - Commit: N (will commit at end)

- [ ] **3. Build verification — lint + typecheck + still renders**
  - Run: `npm run lint` (eslint + tsc)
  - Run: 3 still renders at key frames to verify animation phases
  - Must NOT: test beyond the scope of this composition
  - Parallelization: Wave 1 | Blocked by: 2 | Blocks: —
  - References: npm scripts in package.json:29-34
  - Acceptance criteria:
    - `npm run lint` exits 0
    - `npx remotion still CharReveal --frame=0 --scale=0.25 -o /tmp/char-reveal-f0.png` → exits 0
    - `npx remotion still CharReveal --frame=60 --scale=0.25 -o /tmp/char-reveal-f60.png` → exits 0
    - `npx remotion still CharReveal --frame=179 --scale=0.25 -o /tmp/char-reveal-f179.png` → exits 0
  - QA scenarios: All above commands must exit 0. If any fails, fix the issue.
  - Commit: Y | `feat(char-reveal): add character flip-up reveal composition with GSAP rotationX`

## Final verification wave
- [ ] F1. Plan compliance audit — verify all scope items delivered, no scope violations
- [ ] F2. Code quality review — review the code for correct GSAP pattern, proper cleanup, no anti-patterns
- [ ] F3. Real manual QA — open `npx remotion studio` and visually verify CharReveal plays correctly
- [ ] F4. Scope fidelity — confirm no modifications to TextIntro.tsx, no new dependencies

## Commit strategy
Single commit after all verification passes: `feat(char-reveal): add character flip-up reveal composition with GSAP rotationX`

## Success criteria
- `npm run lint` passes
- All 3 still renders complete without error
- CharReveal appears in `npx remotion compositions`
- Component follows all AGENTS.md GSAP rules (paused timeline, gsap.context, seek(frame/fps))
- Visual effect matches reference: characters flip up from bottom baseline with stagger
