# storyboard-talking-head - Work Plan

## TL;DR (For humans)

**What you'll get:** The storyboard (`storyboard-claude-code-tutorial.md`) updated so every non-screen-recording segment correctly reflects that your talking-head video plays full-screen as the background. All existing animations (text, cards, icons, effects) appear on top. Color washes and dark overlays become semi-transparent covers on the video.

**Why this approach:** Your素材 (assets) for the non-🖥️ sections are talking-head videos, not animated backgrounds. Rather than rewrite every cell, we add a compositing spec at the top that establishes the universal 3-layer rule, then fix only the ~15 cells where "全屏暗遮罩" and "背景突变" directly contradict this model. This minimizes error while maintaining full consistency.

**What it will NOT do:** Not change any animation timing, easing, colors, or effects. Not touch screen recording segments. Not modify any Remotion code.

**Effort:** Short
**Risk:** Low - all changes are to "视觉呈现" text descriptions in one file
**Decisions to sanity-check:** The compositing model spec + the ~15 edited cells

Your next move: Approve this plan, then I'll write the detailed plan file.

---

> TL;DR (machine): Short effort, Low risk. One file. Add compositing model to header + edit ~15 table cells.

## Scope
### Must have
- Add 3-layer compositing model section to `.omo/storyboard-claude-code-tutorial.md` header
- Edit ~15 "视觉呈现" (Visual Presentation) table cells in ACT1-6 where background/color descriptions conflict with talking-head-as-background model
- Ensure 🖥️↔口播 transition notes are clear

### Must NOT have (guardrails, anti-slop, scope boundaries)
- DO NOT edit any animation property (timing, stagger, easing, color values, font sizes)
- DO NOT edit screen recording (🖥️) segment cells
- DO NOT edit pure narration rows that have no visual elements
- DO NOT touch any `src/` code
- DO NOT touch any other `.omo/` files

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: tests-after (manual review of the diff)
- Evidence: Read the final file and verify every non-🖥️ cell that mentions a background color/遮罩 now correctly references the talking-head video base layer

## Execution strategy
### Parallel execution waves
- Wave 1 (sequential, all edits in one file): Todo 1 → Todo 2 → Todo 3 → Todo 4 → Todo 5

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. Compositing spec | - | 2 | - |
| 2. ACT1 edits | 1 | 3 | - |
| 3. ACT2-4 edits | 2 | 4 | - |
| 4. ACT5-6 edits | 3 | 5 | - |
| 5. Final verification | 4 | - | - |

## Todos

- [ ] 1. **Add compositing model spec to storyboard header**
  What to do / Must NOT do: Insert a new section `### 📐 合成架构 (Compositing Model)` right before `## 2. 逐帧分镜表` (after line 56, before line 58 in current file). Define the 3-layer compositing model:
  - Layer 1 (Base): 口播视频全屏铺满 — always present during non-🖥️ segments
  - Layer 2 (Overlay): 色彩/遮罩覆盖层 — "全屏暗遮罩", "背景 颜色" effects become semi-transparent overlays on Layer 1
  - Layer 3 (Foreground): 动画元素叠加 — all text, cards, icons, diagrams, effects remain unchanged
  - Screen recording mode: Layer 1 switches from talking-head video to screen recording footage
  - Transition: Fade between talking-head and screen recording at 🖥️ boundaries
  Must NOT edit any existing content in the file (insert only).
  Parallelization: Wave 1 | Blocked by: - | Blocks: 2
  References: User answers on compositing model (talking-head full-screen, overlays semi-transparent, screen recording full-replace)
  Acceptance criteria: New section visible in file at correct location, 3 layers clearly defined, no existing content modified
  QA scenarios: `Read .omo/storyboard-claude-code-tutorial.md` — verify new section appears between lines 56-58, content matches the compositing model decisions
  Commit: Y | `docs(storyboard): add 3-layer compositing model for talking-head video background`

- [ ] 2. **Edit ACT1 visual presentation cells**
  What to do / Must NOT do: Edit the following specific lines in `.omo/storyboard-claude-code-tutorial.md`. Replace ONLY the background/color description at the START of each cell (keep all animation details):
  
  1. **Line 68** — `"背景: #CBC0D3 满屏柔和渐变。中央 MacBook 剪影线稿..."` → `"底层: 口播视频全屏铺满。前景: 中央 MacBook 剪影线稿 (stroke #4E4D5C, fill none, strokeWidth 2)。光标在终端图标上闪烁。"`
  
  2. **Line 72** — `"全屏暗遮罩 rgba(0,0,0,0.45)。中央大字 "0 行代码"..."` → `"口播视频持续，半透明暗遮罩 rgba(0,0,0,0.45) 叠加覆盖。中央大字 "0 行代码" (#FFFFFF, 120px)。下方小字 "全程只说了几句话" (#CBC0D3, 36px)"`
  
  3. **Line 82** — `"全屏突变: 背景 #CBC0D3 → #1D1B20。Claude Code 图标抖动碎裂飞出..."` → `"口播视频持续，半透明色彩覆盖层从 #CBC0D3→#1D1B20 过渡 (opacity 0→0.6)。Claude Code 图标抖动碎裂飞出。大字 "😖 痛苦" (#CBC0D3, 96px) 左右微颤"`
  
  4. **Line 98** — `"全屏 Slam: 背景 #1D1B20。满屏红色报错纹理平铺..."` → `"口播视频持续，半透明 #1D1B20 深色覆盖层 (opacity ~0.7) + 红色报错纹理平铺叠加 (#FF4444, op 0.1–0.3)。中央大字 "报错红字" (#FF4444, 120px, 900w) 弹性砸入，3px text-shadow: #FF4444"`
  
  5. **Line 105** — `"黑暗中微光从底部升起。柔光 radial-gradient..."` → `"口播视频持续，半透明暗覆盖层保留。柔光 radial-gradient(circle at center, #CBC0D3 0%, #1D1B20 100%) 从底部升起。拳头线稿 (stroke #CBC0D3) 从底部上推"`
  
  6. **Line 107** — `"全屏 #CBC0D3。中央竖排 "📖 零基础安装教程"..."` → `"口播视频持续，#CBC0D3 半透明色彩 wash (opacity ~0.4) 叠加覆盖。中央竖排 "📖 零基础安装教程" (#1D1B20)，逐字从左到右 reveal"`
  
  7. **Line 116** — `"画面缩小 scale:1→0.8 + blur:0→4px。右侧滑入 "STEP 01"..."` → `"口播视频缩小 (scale:1→0.8) 并叠加模糊 (blur:0→4px)。右侧滑入 "STEP 01" (#4E4D5C, 180px, 900w, letterSpacing 20px)。下方 "安装 Node.js""`
  
  Must NOT change any text after the initial background description, animation properties, frame ranges, or emoji.
  Parallelization: Wave 1 | Blocked by: 1 | Blocks: 3
  References: `.omo/storyboard-claude-code-tutorial.md:68-116`
  Acceptance criteria: All 7 cells have updated background descriptions matching the compositing model. Each cell's animation properties are preserved verbatim.
  QA scenarios: Read lines 68-116 of the storyboard file, verify each of the 7 edits above. Cross-check that no animation property (curve, stagger, frame range, color hex) was changed.
  Commit: Y | `docs(storyboard): update ACT1 visual cells for talking-head background`

- [ ] 3. **Edit ACT2-4 visual presentation cells**
  What to do / Must NOT do: Edit the following lines:
  
  1. **Line 139** (PI#04) — `"背景暖色 #F5F0F0。左侧咖啡机 SVG..."` → `"口播视频持续，半透明 #F5F0F0 暖色 wash (opacity ~0.35) 叠加。左侧咖啡机 SVG (#4E4D5C 线稿, fill #CBC0D3)。右侧 "Claude Code" (#1D1B20)。蒸汽波浪线飘出"`
  
  2. **Line 162** (ACT3 鼓掌) — `"全屏 #CBC0D3 暖色。鼓掌 emoji..."` → `"口播视频持续，#CBC0D3 半透明暖色 wash (opacity ~0.4) 覆盖。鼓掌 emoji: 手掌开合 scaleY:1→0.8→1。星星粒子 ✧ 从鼓掌处爆发"`
  
  3. **Line 171** (PI#05) — `"背景切换 #1D1B20。ACT1 红色报错纹理闪回..."` → `"口播视频持续，半透明 #1D1B20 覆盖层 (opacity ~0.7) + 红色报错纹理闪回 (0.5s)。大字 "😨 吓人？" (#FF4444, 96px) 震动"`
  
  4. **Line 182** (ACT4 章节过渡) — `"画面 scale:1→0.8, blur:0→4px。左侧滑入 "STEP 02"..."` → `"口播视频缩小 (scale:1→0.8) 并叠加模糊 (blur:0→4px)。左侧滑入 "STEP 02" (#4E4D5C, 180px)。下方 "安装 Git""`
  
  5. **Line 195** (PI#06 双卡Slam) — `"双卡片 Slam: 左右同时砸入。左侧 ⚡ 电力系统 (bg #1D1B20, text #CBC0D3)。右侧 🌐 翻译官 (bg #4E4D5C, text #FFFFFF)。中间 "＋""` → `"口播视频持续。双卡片从左/右侧砸入叠加在视频之上: 左侧 ⚡ 电力系统 (bg #1D1B20, text #CBC0D3) x: −200→0。右侧 🌐 翻译官 (bg #4E4D5C, text #FFFFFF) x: 200→0。中间 "＋""`
  
  Must NOT change animation properties, frame ranges, or color hex values.
  Parallelization: Wave 1 | Blocked by: 2 | Blocks: 4
  References: `.omo/storyboard-claude-code-tutorial.md:139-196`
  Acceptance criteria: All 5 cells edited correctly.
  QA scenarios: Read lines 139-196, verify each edit matches above. Confirm no animation data was changed.
  Commit: Y | `docs(storyboard): update ACT2-4 visual cells for talking-head background`

- [ ] 4. **Edit ACT5-6 visual presentation cells**
  What to do / Must NOT do: Edit the following lines:
  
  1. **Line 206** (ACT5 开头) — `"录屏淡出。背景 #CBC0D3。进度条从底上升..."` → `"录屏淡出，口播视频恢复全屏。#CBC0D3 半透明 wash (opacity ~0.4) 叠加。进度条从底上升 (宽60%, 高4px, bg #4E4D5C)，停60%位置。"🔜 接近中""`
  
  2. **Line 215** (PI#07 NPM商店) — `"宝箱打开。大字 "NPM = 🏪 应用商店"..."` → `"口播视频持续。宝箱弹入画面中央 (scale: 0→1, back.out(1.4))，盖子 rotationX: 0→−120 开盖，金光发出。大字 "NPM = 🏪 应用商店" (#1D1B20, 96px, 900w) 从宝箱弹射升空。下方3个 app icon 方块错拍弹入货架 (color #CBC0D3, 圆角12px)"`
  
  3. **Line 230** (PI#08 重头戏) — `"全屏 #1D1B20 暗色。中央 "⭐ CLAUDE CODE" (#CBC0D3, 120px, 900w) 从顶部砸入回弹..."` → `"口播视频持续，半透明 #1D1B20 暗色覆盖层 (opacity ~0.75) 叠加。中央 "⭐ CLAUDE CODE" (#CBC0D3, 120px, 900w) 从顶部砸入回弹。subtitle "安装进行中…""`
  
  4. **Line 249** (ACT6 开头) — `"录屏缩至左侧。右侧代码卡片..."` → `"录屏淡出，口播视频恢复全屏。右侧代码卡片 (bg #1D1B20, 等宽 #00FF00, 3行代码) 从右侧滑入 (x: 200→0)"`
  
  5. **Line 263** (PI#09 窗户纸) — `"背景 #1D1B20。3张纸垂直堆叠..."` → `"口播视频持续，半透明 #1D1B20 覆盖层 (opacity ~0.7) 叠加。3张纸垂直堆叠 (每张间隔40px, op 0.3→0.15→0.08)，纸表面裂纹纹理"`
  
  6. **Also at line 263**: Keep `"背景 #CBC0D3, 文字 #1D1B20"` in that sentence — this is a text/foreground color note for the "你们肯定比我更强 💪" section, not a background description. Change only the first background reference: `"背景 #1D1B20"="口播视频持续，半透明 #1D1B20 覆盖层"`
  
  Must NOT change animation properties, frame ranges, or color hex values.
  Parallelization: Wave 1 | Blocked by: 3 | Blocks: 5
  References: `.omo/storyboard-claude-code-tutorial.md:206-279`
  Acceptance criteria: All 6 cells edited correctly.
  QA scenarios: Read lines 206-279, verify the 6 edits. Confirm no animation data changed.
  Commit: Y | `docs(storyboard): update ACT5-6 visual cells for talking-head background`

## Final verification wave
- [ ] F1. **Read-through compliance audit**: Read the entire storyboard file. Confirm every non-🖥️ cell's "视觉呈现" column is consistent with the compositing model (or is a pure narration row with no visual elements). Flag any remaining "背景: <color>" or "全屏突变" that wasn't edited.
- [ ] F2. **Animation property integrity**: Scan diff for changes to animation timing (frame ranges), stagger values, curve names (e.g. `back.out`, `power2.in`), and color hex values. Confirm zero changes.
- [ ] F3. **Segment boundary check**: Verify transitions between 🖥️ and 口播 segments are correctly described (fade between talking-head and screen recording).

## Commit strategy
- 4 commits, one per todo (compositing spec + each ACT batch), plus 1 amend if verification fails
- Conventional commits: `docs(storyboard): <summary>`
- Rebase onto current branch head before final merge

## Success criteria
- File `.omo/storyboard-claude-code-tutorial.md` has a clear compositing model section
- All ~15 edited cells correctly reference talking-head video as base layer
- Zero animation property changes
- All 🖥️ segments untouched
- Reader can understand the visual architecture at a glance from the compositing spec
