# storyboard-animation-reference - Work Plan

## TL;DR (For humans)

**What you'll get:** Your storyboard gets a new "参考效果" column so each text/animation row can reference one of your 11 existing Remotion compositions by name (e.g. `@TextScramble`, `@CharReveal`, `@MediaTitle`). A companion animation catalog file lists every composition, its adjustable props, and an example reference. ~40 of your 80 storyboard rows will be updated to use references, making the storyboard more modular and developer-friendly.

**Why this approach:** The animation properties were written inline as raw values, making it hard to see when a scene should reuse an existing composition. Adding a reference column + catalog creates a formal bridge between "what to animate" and "which component to use," with zero code changes.

**What it will NOT do:** Won't modify any TypeScript/React source files. Won't automatically generate compositions from the storyboard. Won't change the existing raw animation description format — it stays as fallback.

**Effort:** Short
**Risk:** Low — all changes are markdown documentation, no code.
**Decisions to sanity-check:** The reference syntax `@ComponentName(param=value)` and the column interaction rules.

Your next move: **Approve** to proceed, or request changes. Full execution detail follows below.

---

> TL;DR (machine): Short | Low risk | 3 todos: catalog file, storyboard column addition + row audit, consistency verification.

## Scope

### Must have
- `.omo/animation-catalog.md` — catalog of all 11 compositions with props tables and reference syntax examples
- `.omo/storyboard-claude-code-tutorial.md` — "参考效果" column added as 6th column; animation props column header updated; ~40 rows filled with references
- Verification: all references resolve to catalog entries

### Must NOT have (guardrails, anti-slop, scope boundaries)
- NO changes to `src/` TypeScript/React files
- NO automated scripts or parsers
- NO changes to the video-storyboard-agent skill
- NO renaming or deleting existing columns — only adding

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: none (markdown-only, no code)
- Evidence: `.omo/evidence/task-1-storyboard-animation-reference/`
  1. Count of references in storyboard vs catalog entries
  2. Verify every `@ComponentName` in storyboard exists in catalog
  3. Verify catalog has exactly 11 entries

## Execution strategy

### Parallel execution waves
- **Wave 1** (parallel): Todo 1 (catalog) + Todo 2 prep (storyboard row analysis)
- **Wave 2** (sequential): Todo 2 (storyboard edits) 
- **Wave 3** (parallel): Todo 3 (verification)

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. Create animation catalog | — | — | 2 (prep phase) |
| 2. Modify storyboard | — | — | 1 |
| 3. Verify consistency | 1, 2 | — | — |

## Todos

- [ ] 1. Create `.omo/animation-catalog.md` with 11 composition entries
  What to do / Must NOT do:
  Create a new markdown file `.omo/animation-catalog.md` that documents every composition registered in `src/Root.tsx`.
  Each entry must include:
  - Reference ID (the `@Name` used in storyboard)
  - Source file path
  - One-line animation summary
  - Props table (parameter name, type, default value, description) — extracted from the component's Props interface
  - Reference column syntax example
  
  The 11 compositions are (in order from Root.tsx):
  1. @AnimeDrop — `src/AnimeDrop.tsx` (wrapped by Composition.tsx → MyComposition)
  2. @PhysicsDrop — `src/PhysicsDrop.tsx`
  3. @OrbitalRelaunch — `src/OrbitalRelaunch.tsx`
  4. @HeroReveal — `src/HeroReveal.tsx` — Props: see HeroRevealConfig interface (seed, durationInFrames, phase1Ratio, phase2Ratio, vxRange, vyRange, gravity, launchEasingPower, bulletTimeScale, sectionARatio, sectionBRatio, scaleUpTarget, zDepthOffset, rotationAmplitudeA, rotationAmplitudeC, rotationDamping, swayAmplitude, swayFrequency, targetSizeRatio, blurIntensity, maxBlur, springSettleFrames, springStiffness, springDamping)
  5. @TextIntro — `src/TextIntro.tsx` — Props: mainText (string, default "ZhanWeiFu"), subText (string, default "")
  6. @LiquidGlass — `src/LiquidGlass.tsx` — Props: none (hardcoded CONFIG, TEXT_* constants)
  7. @WaterOrb — `src/WaterOrb.tsx` — Props: none (hardcoded uniforms)
  8. @TextScramble — `src/TextScramble.tsx` — Props: text (string, default "ZhanWeiFu"), fontSize (number, default 5)
  9. @GridReveal — `src/GridReveal.tsx` — Props: cols (number, default 12), rows (number, default 8), cellSize (number, default 50), gap (number, default 0), title (string, default "Rebooot"), subtitle (string, default "Grid Reveal · Radial Ripple")
  10. @CurtainReveal — `src/CurtainReveal.tsx` — Props: direction ("reveal"|"cover"|"cycle", default "cycle"), columnCount (number, default 5), backgroundColor (string, default "#000000")
  11. @CircleGlow — `src/CircleGlow.tsx` — Props: text (string, default "creative"), fontSize (number, default 80), glowColor (string, default "#D3FD50"), strokeWidth (number, default 2), backgroundColor (string, default "#1D1B20")
  12. @MediaTitle — `src/MediaTitle.tsx` — Props: text (string, default "media"), bgColor (string, default "#00d3ff"), textColor (string, default "#1D1B20"), fontSizeVw (number, default 13)
  13. @SceneTransition — `src/SceneTransition.tsx` — Props: none (hardcoded CONFIG)
  14. @CharReveal — `src/CharReveal.tsx` — Props: text (string), staggerMode ("sequential"|"random"|"center"|"edges", default "sequential")

  For compositions with no props interface (LiquidGlass, WaterOrb, SceneTransition), note "Hardcoded — no adjustable params" and describe the fixed animation.

  Template for each entry:
  ```markdown
  ## @ComponentName

  **Source:** `src/ComponentName.tsx`
  **Animation:** One-line description of what it does.

  | Parameter | Type | Default | Description |
  |-----------|------|---------|-------------|
  | paramName | type | defaultValue | description |

  **Storyboard reference:** `@ComponentName(param=value)`
  ```

  Must NOT do:
  - Do NOT modify any `.tsx` file
  - Do NOT include implementation details beyond props
  - Do NOT include the `children` prop in the table (it's a React built-in)

  Parallelization: Wave 1 | Blocked by: none | Blocks: none
  References: `src/Root.tsx:31-138` (composition list), each component's source file for Props interface
  Acceptance criteria: File exists at `.omo/animation-catalog.md`, contains exactly 14 entries (one per @Name), each with props table
  QA scenarios: Count entries in catalog = 14, spot-check 3 random entries match source code props
  Commit: Y | docs(animation-catalog): create reference catalog for all 14 Remotion compositions

- [ ] 2. Modify `.omo/storyboard-claude-code-tutorial.md` — add 参考效果 column + populate references
  What to do / Must NOT do:

  **Step A — Column header changes:**
  1. Rename the 4th column header from `动画属性` to `动画属性（参数覆写）`
  2. Add a 6th column header `参考效果` after `曲线 & Stagger`
  3. Update the column header line in ALL table sections of the storyboard

  **Step B — Row audit:**
  For each of the ~80 rows in the storyboard, decide whether it should reference a composition or stay raw.
  Here is the recommended mapping guide — implementer should use judgment for each row:

  | Storyboard pattern | Suggested reference | Notes |
  |---|---|---|
  | 字符逐字/Stagger 弹入 | `@CharReveal` or `@TextIntro` | Lines with character-by-character reveal |
  | 文字弹性放大砸入 (back.out) | `@TextIntro` | Lines with main text "Slam" bounce-in |
  | 文字从底部滑入 | `@CharReveal(staggerMode="sequential")` | Sequential character entry |
  | 随机/中心扩散字符出现 | `@CharReveal(staggerMode="center\|random")` |
  | 背景网格 + 标题 reveal | `@GridReveal` | Lines describing grid backgrounds |
  | SVG 椭圆/圆描边在文字周围 | `@CircleGlow` | Lines with glowing outline |
  | 帘幕/幕布转场 | `@CurtainReveal` | Scene transitions |
  | 多边形/形状转场 | `@SceneTransition` | Chapter transitions |
  | 媒体标题 + 背景展开 | `@MediaTitle` | Strong title reveals |
  | 3D 液体玻璃质感 | `@LiquidGlass` | Background/ambient scenes |
  | 水球效果 | `@WaterOrb` | Background/ambient scenes |
  | 物理发射/弹道轨迹 | `@HeroReveal` | Dynamic object entries |
  | 普通淡入淡出/位移 (无特定动画) | (empty — raw) | Keep raw description |
  | 多元素复合动画 (如 卡片+文字+粒子) | (empty — raw) | Too complex for single reference |

  **Step C — Update animation props column:**
  For rows assigned a reference, replace the animation property description with parameter overrides in `key=value` format.
  For rows not assigned a reference, keep the existing raw animation property description unchanged.

  The `曲线 & Stagger` column should remain as-is for all rows; when a reference is set, this column is informational/documentation only.

  Must NOT do:
  - Do NOT change any text content, timing, or visual descriptions
  - Do NOT remove any existing columns
  - Do NOT delete any rows
  - Do NOT leave any row with both a reference AND detailed raw animation props (parameters only)
  - Do NOT add references to "屏幕录制段" rows (those are screen recordings, not animations)

  Parallelization: Wave 2 | Blocked by: none | Blocks: Todo 3
  References: `.omo/storyboard-claude-code-tutorial.md:66-279` (all table rows), `.omo/animation-catalog.md` (reference syntax)
  Acceptance criteria: 
  - Storyboard has 6 columns instead of 5
  - All column headers updated correctly
  - At least 30 rows have a non-empty reference
  - Every reference uses valid `@ComponentName` syntax from catalog
  - No screen recording rows have references
  QA scenarios: 
  - Verify column count = 6 in all table sections
  - Verify every @Name resolves to a catalog entry
  - Verify empty-reference rows still have valid raw animation descriptions
  Evidence: `.omo/evidence/task-2-storyboard-animation-reference/column-count.txt`, `ref-validity.txt`
  Commit: Y | docs(storyboard): add reference effect column and populate ~40 rows with composition references

- [ ] 3. Verify consistency between catalog and storyboard
  What to do / Must NOT do:
  
  1. Extract every `@` reference from `.omo/storyboard-claude-code-tutorial.md`
  2. Check each reference name resolves to an entry in `.omo/animation-catalog.md`
  3. For references with params, check param names match the catalog's props table
  4. Count total references used per composition — verify diversity (not just one composition everywhere)
  5. Report results as verification evidence

  Must NOT do:
  - No code changes
  - No modification of either file — read-only verification

  Parallelization: Wave 3 | Blocked by: Todo 1, Todo 2 | Blocks: none
  References: `.omo/storyboard-claude-code-tutorial.md`, `.omo/animation-catalog.md`
  Acceptance criteria: 
  - 100% of references in storyboard resolve to catalog entries
  - No orphan references (referencing a composition not in catalog)
  - At least 4 different compositions referenced across the storyboard
  QA scenarios:
  - Extract all @Name patterns from storyboard → verify each in catalog
  - Count distinct composition IDs used
  - Report findings as evidence files
  Evidence: `.omo/evidence/task-3-storyboard-animation-reference/`
  Commit: N (verification only, combined with Todo 2 commit)

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [ ] F1. Plan compliance audit — check todos 1, 2, 3 all completed with evidence
- [ ] F2. Content quality review — verify all 14 catalog entries are accurate (props match source); storyboard references are contextually appropriate
- [ ] F3. Real manual review — open both output files, skim for visual consistency
- [ ] F4. Scope fidelity — confirm no src/ files were touched

## Commit strategy
- Commit 1: `docs(animation-catalog): create reference catalog for all 14 Remotion compositions`
- Commit 2: `docs(storyboard): add reference effect column and populate ~40 rows with composition references`
  (includes verification results in evidence)

## Success criteria
1. `.omo/animation-catalog.md` exists with 14 entries, each documenting props and reference syntax
2. `.omo/storyboard-claude-code-tutorial.md` has a 6th "参考效果" column
3. At least 30 storyboard rows use `@ComponentName` references
4. 100% reference/catalog cross-validation passes
5. No source code files modified
