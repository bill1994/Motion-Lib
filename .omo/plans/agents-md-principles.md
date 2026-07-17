# agents-md-principles - Work Plan

## TL;DR (For humans)

**What you'll get:** Your project's AGENTS.md gets 4 new permanent coding rules that prevent bad animation architecture: phase-based progression (instead of magic-number chains), single-frame snapshot (instead of state fragmentation), the Ready Guard (instead of fighting async queues), and CSS Over JS (instead of reaching for JS when CSS already does it).

**Why this approach:** These 4 rules were extracted from a high-quality reference prompt that demonstrates production-grade animation architecture. They extend your existing Remotion/GSAP rules with universal principles that apply to any frontend work, not just Remotion.

**What it will NOT do:** Won't change or remove any existing rule, won't touch any source code, won't add any project-specific or Remotion-specific content — these are universal architecture rules.

**Effort:** Quick
**Risk:** Low — single file, append-only change, zero source code touched
**Decisions to sanity-check:** Section placement (between Design System and Style & Performance), the 4-rule selection, the code example style

Your next move: Type `$start-work` to execute. Full execution detail follows below.

---

> TL;DR (machine): quick | low — append 4 new Animation Architecture Rules to AGENTS.md, single todo

## Scope
### Must have
- New "## Animation Architecture Rules (MANDATORY)" section in AGENTS.md with 4 subsections
- Each subsection: title, explanation, ✅ GOOD / ❌ BAD code examples
- All existing content preserved verbatim (append-only)

### Must NOT have (guardrails, anti-slop, scope boundaries)
- No edits to any source code, components, config files, or other docs
- No removal or reordering of existing AGENTS.md content
- No extra principles beyond the 4 agreed ones
- No test files (AGENTS.md is not executable)

## Verification strategy
- Test decision: none (AGENTS.md is documentation, not code)
- Evidence: .omo/evidence/task-1-agents-md-principles.txt

## Execution strategy
### Parallel execution waves
Single task, no waves needed.

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. Add section | — | — | — |

## Todos
> Implementation + Test = ONE todo. Never separate.
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->
- [ ] 1. Add "Animation Architecture Rules (MANDATORY)" section to AGENTS.md
  What to do: Append a new section between line 51 (end of "Design System — Color Palette") and line 53 (start of "## Style & Performance Conventions"), containing 4 subsections with titles, explanations, and ✅ GOOD / ❌ BAD code examples. Preserve ALL existing content verbatim.
  
  Must NOT do:
  - Do not remove, reorder, or alter any existing content
  - Do not touch source code, config, or any file outside AGENTS.md
  - Do not add more than the 4 agreed principles
  - Do not rename existing sections
  
  Section content:
  
  ```
  ## Animation Architecture Rules (MANDATORY)
  
  Universal principles for organizing multi-step animations. These apply regardless of animation library (GSAP, Framer Motion, or raw CSS transitions).
  
  ### 1. Phase-Based Progression Model
  
  Any multi-step animation must be split into mathematically defined phases. Each phase has a clear input domain and a function mapping input → normalized `progress ∈ [0, 1]`. Prohibit implicit "magic-number chains" where one animation's end triggers another by timing accident.
  
  ```
  // ✅ GOOD — explicit phases with normalized progress
  function computePhase(frame: number, fps: number) {
    const ENTER = 60, LOOP = 60, EXIT = 60;
    if (frame < ENTER)  return { phase: 'enter', progress: frame / ENTER };
    if (frame < ENTER + LOOP)
                        return { phase: 'loop',  progress: (frame - ENTER) / LOOP };
    return { phase: 'exit',  progress: (frame - ENTER - LOOP) / EXIT };
  }
  
  // ❌ BAD — implicit timing, magic numbers, no way to test in isolation
  // Sequence A ends → Sequence B starts → hard to reason about or test
  ```
  
  ### 2. Single-Frame Snapshot Principle
  
  Every animation state in a given frame must be derived from a SINGLE input snapshot (`useCurrentFrame()`, `scrollY`, `timestamp`). Prohibit writing to different properties from different event listeners or state hooks within the same frame — this creates inconsistency where different properties see different moments in time.
  
  ```
  // ✅ GOOD — one frame value drives everything
  const frame = useCurrentFrame();
  tl.seek(frame / fps);
  opacityRef.current.style.opacity = interpolate(frame, [0, 60], [0, 1]);
  
  // ❌ BAD — different sources produce inconsistent state
  useEffect(() => { tl.seek(frame / fps) }, [frame]);
  const [opacity, setOpacity] = useState(0);
  useEffect(() => { setOpacity(computeSomething()) }, [someOtherTrigger]);
  ```
  
  In scroll-driven contexts, use a single `requestAnimationFrame` loop that reads `scrollY` once and computes ALL transforms from that snapshot — never attach individual scroll event listeners that each write to separate properties.
  
  ### 3. The Ready Guard
  
  Before issuing any command to an asynchronous system (video element, animation timeline, audio buffer), check that the system is in a ready state. Issuing commands to a busy system creates a queue of stale operations that fight each other.
  
  ```
  // ✅ GOOD
  if (!video.seeking) video.currentTime = newTime;
  if (tl.progress() === 0) tl.play();
  
  // ❌ BAD
  video.currentTime = newTime;  // interrupts an ongoing seek
  ```
  
  Apply this to: video/audio `seeking` / `readyState`, GSAP timeline `progress() === 0` or `isActive()`, image `complete`, font `status === 'loaded'`.
  
  ### 4. CSS Over JS Principle
  
  Prefer solving design problems with a single CSS property over computing the same effect in JavaScript. CSS properties run on the compositor thread, cost zero JS heap, and cannot trigger re-render storms.
  
  ```
  // ✅ GOOD — CSS does the work
  mix-blend-mode: exclusion;     // text visible on any background
  aspect-ratio: 2/3;             // maintain proportions
  will-change: transform;        // GPU promotion hint
  transform-origin: right bottom; // animation anchor
  position: absolute;            // remove from flow
  
  // ❌ BAD — JS does what CSS already offers
  // JS sampling background color → computing luminance → switching text class
  // JS computing width/height ratio on every resize
  // JS adding/removing will-change imperatively
  ```
  
  This is the same philosophy as "NEVER animate width/height/top/left" — extend it to: if a CSS property exists that can do the job declaratively, use it before reaching for JS.
  ```
  
  References: AGENTS.md:39-51 (the existing Design System section, insert between it and line 53), the user's discussion of the reference prompt patterns.
  
  Acceptance criteria:
  - `cat AGENTS.md | grep -c "Animation Architecture Rules"` returns 1
  - `cat AGENTS.md | grep -c "Phase-Based Progression"` returns 1
  - `cat AGENTS.md | grep -c "Single-Frame Snapshot"` returns 1
  - `cat AGENTS.md | grep -c "The Ready Guard"` returns 1
  - `cat AGENTS.md | grep -c "CSS Over JS"` returns 1
  - `wc -l AGENTS.md` reports 59 + 66 = ~125 lines (existing 59 + new section ~66 lines)
  - All existing content (commands, compositions, architecture, GSAP rules, design system, style conventions) is preserved — verify by checking that "## Compositions", "## GSAP", "## Design System", "## Style & Performance" all still appear
  
  QA scenarios:
  - Happy: Run the grep checks above; visually inspect the section structure
  - Failure: Intentionally try to break by grepping for removed content (should find none)
  Evidence: `.omo/evidence/task-1-agents-md-principles.txt`
  
  Commit: Y | docs(AGENTS.md): add Animation Architecture Rules — Phase, Snapshot, Ready Guard, CSS Over JS

## Final verification wave
> Single todo, no parallel verification needed. Auto-verify on completion.
- [ ] F1. Grep checks pass (all 5 section keywords found, existing content preserved)
- [ ] F2. Scope fidelity — no source code modified, no existing content removed

## Commit strategy
One conventional commit: `docs(AGENTS.md): add Animation Architecture Rules — Phase, Snapshot, Ready Guard, CSS Over JS`

## Success criteria
- AGENTS.md contains exactly 5 new subsections under a single new heading
- All existing 59 lines of content are preserved byte-for-byte
- No other files changed
- `git diff --stat` shows only AGENTS.md modified
