---
slug: storyboard-talking-head
status: awaiting-approval
intent: clear
pending-action: write .omo/plans/storyboard-talking-head.md
approach: Add compositing model spec + edit ~15 "背景" references in storyboard table cells
---

# Draft: storyboard-talking-head

## Components (topology ledger)
| id | outcome | status | evidence path |
|---|---|---|---|
| compositing-spec | Add 3-layer compositing model note to storyboard header | active | `.omo/storyboard-claude-code-tutorial.md` header |
| cell-edits-act1 | Edit ACT1 "视觉呈现" cells that reference pure backgrounds | active | `.omo/storyboard-claude-code-tutorial.md:68-116` |
| cell-edits-act2-4 | Edit ACT2-4 cells | active | `.omo/storyboard-claude-code-tutorial.md:139-196` |
| cell-edits-act5-6 | Edit ACT5-6 cells | active | `.omo/storyboard-claude-code-tutorial.md:206-279` |
| verify | Read-through verify all cells consistent with compositing model | active | `.omo/storyboard-claude-code-tutorial.md` |

## Open assumptions (announced defaults)
| assumption | adopted default | rationale | reversible? |
|---|---|---|---|
| 口播视频铺满全屏作底层 | 口播视频占满 1920×1080 帧，动画元素叠加在上 | User confirmed in Q1 | Yes |
| 全屏色彩/遮罩效果 | 半透明色彩覆盖层叠加于口播视频之上，视频始终可见 | User confirmed in Q2 | Yes |
| 屏幕录制段 | 口播视频完全消失，录屏独占画面 | User confirmed in Q3 | Yes |

## Findings (cited - path:lines)
- Storyboard file: `.omo/storyboard-claude-code-tutorial.md` (310 lines total)
- Has ~50+ table rows, ~15 with "背景: <color>", "全屏突变", "全屏暗遮罩" type descriptions incompatible with talking-head model
- 3 screen recording segments (🖥️) already correct, need no change
- "纯口播" entries (no visual elements) already match talking-head format
- Remotion Root at `src/Root.tsx` registers 12 short compositions (180f each), NOT the long-form tutorial — the storyboard is for a separate long-form project

## Decisions (with rationale)
1. **Add compositing model spec, not edit every cell**: Adding a single header note + editing only incompatible background references is more efficient than rewriting every cell. The spec serves as the universal rule; cell edits fix contradictions.
2. **Batch edits by ACT**: Split edits into ACT1 / ACT2-4 / ACT5-6 waves to keep each edit batch focused and verifiable.
3. **Preserve all animation properties**: Only change "视觉呈现" column background descriptions. Never touch animation timing, stagger, colors, or effect parameters.

## Scope IN
- `.omo/storyboard-claude-code-tutorial.md` only (one file)
- Add compositing model section to header
- Edit ~15 "视觉呈现" cells where background/color descriptions conflict with talking-head model
- Ensure 🖥️↔口播 transition notes are clear

## Scope OUT (Must NOT have)
- NO changes to animation properties (timing, stagger, easing, colors)
- NO changes to screen recording segments (🖥️)
- NO changes to pure narration segments that have no visual elements
- NO changes to Remotion React code (`src/`)
- NO changes to other `.omo/` files

## Open questions
None. All forks resolved via user Q&A.

## Approval gate
status: awaiting-approval
<!-- When exploration is exhausted and unknowns are answered, set status: awaiting-approval. -->
<!-- That durable record is the loop guard: on a later turn read it and resume at the gate instead of re-running exploration. -->
