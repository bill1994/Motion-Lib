---
slug: storyboard-animation-reference
status: awaiting-approval
intent: clear
pending-action: write .omo/plans/storyboard-animation-reference.md
approach: Add a "参考效果" (Reference Effect) column to the storyboard table that points to any of the 11 existing Remotion compositions, plus create an animation catalog file documenting each composition's props and usage.
---

# Draft: storyboard-animation-reference

## Components (topology ledger)

| id | outcome (one line) | status | evidence path |
|----|-------------------|--------|---------------|
| animation-catalog.md | Create `.omo/animation-catalog.md` documenting all 11 compositions | active | src: 11 .tsx files in src/Root.tsx + their Props interfaces |
| storyboard-column | Modify `.omo/storyboard-claude-code-tutorial.md`: add 参考效果 column, audit ~80 rows | active | .omo/storyboard-claude-code-tutorial.md:66-279 (all table rows) |
| skill-update | Update video-storyboard-agent skill format to include 参考效果 column (optional stretch) | deferred | skill: video-storyboard-agent output format section |

## Open assumptions (announced defaults)

| assumption | adopted default | rationale | reversible? |
|-----------|----------------|-----------|-------------|
| Reference syntax | `@ComponentName(param=value, ...)` | Matches React JSX mental model, parseable, concise | yes - only affects storyboard format |
| Column cooperation | 参考效果有值 → 动画属性列变为参数覆写；参考效果空 → 回退 raw 描述 | Backwards compatible, no data loss | yes - internal convention |
| Catalog granularity | One entry per Composition in Root.tsx (11 entries) | Complete coverage of all reusable assets | yes - can add more later |

## Findings (cited - path:lines)

- Current storyboard has ~80 table rows across ACT 1-6, all using inline raw animation descriptors (`.omo/storyboard-claude-code-tutorial.md:66-279`)
- 11 compositions registered in `src/Root.tsx:31-138`, each with distinct animation patterns
- 7 compositions have explicit Props interfaces suitable for parameter override: TextScramble, CharReveal, TextIntro, MediaTitle, CircleGlow, CurtainReveal, GridReveal, HeroReveal
- 2 compositions (SceneTransition, LiquidGlass, WaterOrb) use hardcoded CONFIG objects — not directly referenceable via props
- The video-storyboard-agent skill defines the output format (5 columns) — would need updating for new column

## Decisions (with rationale)

1. **Syntax: `@ComponentName(k1=v1, k2=v2)`** — Short, JSX-like, parseable. The `@` prefix visually distinguishes references from raw text. Parameters map 1:1 to component Props.
2. **Catalog as standalone file** — `.omo/animation-catalog.md` is a separate lookup table, not embedded in storyboard. Keeps storyboard lean.
3. **Reference column added, nothing removed** — All existing columns stay. "动画属性" column repurposes as parameter overrides when reference is set.
4. **Skill update deferred** — Modifying the skill is nice-to-have. The storyboard itself is the deliverable.

## Scope IN

- `.omo/animation-catalog.md`: document all 11 compositions with props table and reference syntax
- `.omo/storyboard-claude-code-tutorial.md`: add "参考效果" column header, audit all ~80 rows for reference assignments
- Verification: all references in storyboard resolve to entries in catalog

## Scope OUT (Must NOT have)

- No modification of any `src/` code — catalog is documentation only
- No code generation or transformation tools — all manual edits
- No updating the video-storyboard-agent skill itself (deferred)
- No automated validation scripts — just visual/manual consistency check

## Open questions

None. Syntax and approach approved by user.

## Approval gate
status: awaiting-approval
<!-- When exploration is exhausted and unknowns are answered, set status: awaiting-approval. -->
<!-- That durable record is the loop guard: on a later turn read it and resume at the gate instead of re-running exploration. -->
