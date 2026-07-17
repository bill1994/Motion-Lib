---
slug: skill-animation-catalog-reference
status: awaiting-approval
intent: clear
pending-action: write .omo/plans/skill-animation-catalog-reference.md
approach: Modify the video-storyboard-agent SKILL.md to add a "🎪 动画库引用系统" section, update the output format to 6 columns, and add catalog-reference self-check.
---

# Draft: skill-animation-catalog-reference

## Components (topology ledger)

| id | outcome (one line) | status | evidence path |
|----|-------------------|--------|---------------|
| skill-modification | Modify `.agents/skills/video-storyboard-agent/SKILL.md` with reference system | active | `.agents/skills/video-storyboard-agent/SKILL.md` (179 lines) |
| catalog-file | `.omo/animation-catalog.md` already exists — no changes needed | deferred | `.omo/animation-catalog.md` (already created in previous plan) |

## Findings (cited - path:lines)

- Current skill defines 5-column storyboard table (`.agents/skills/video-storyboard-agent/SKILL.md:77-79`)
- Skill has no awareness of project-level `.omo/animation-catalog.md` or the reference system
- `.omo/animation-catalog.md` already exists with 14 composition entries — skill just needs to point to it
- Skill's self-check section has 5 items (lines 90-94), needs a 6th for reference validity

## Decisions (with rationale)

1. **New section named "🎪 动画库引用系统"** — placed between "节奏引擎" and "输入数据格式", makes it a core workflow step, same emoji/styling convention as existing sections
2. **No catalog content duplication** — skill references `.omo/animation-catalog.md` externally rather than embedding the 14 entries, so it auto-updates when catalog grows
3. **Output format column header change** — "动画属性" → "动画属性（参数覆写）", add 6th column "参考效果" — exactly matching the format already applied to the storyboard
4. **Matching rules table included in skill** — the pattern-mapping table (动画特征 → 推荐引用) lives in the skill so the agent can match on the fly without reading the catalog first

## Scope IN

- `.agents/skills/video-storyboard-agent/SKILL.md`: Modify 3 specific regions
  - Region A: Add "🎪 动画库引用系统" section (between 节奏引擎 and 输入数据格式)
  - Region B: Update output format table (5 col → 6 col), add header and notes
  - Region C: Add 6th self-check item for reference validity

## Scope OUT (Must NOT have)

- NO changes to `.omo/animation-catalog.md` — it's already correct
- NO changes to `src/` files
- NO changes to any other skill files
- NO changes to the storyboard

## Open questions

None. Changes are well-defined.

## Approval gate
status: awaiting-approval
