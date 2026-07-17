# skill-animation-catalog-reference - Work Plan

## TL;DR (For humans)

**What you'll get:** The video-storyboard-agent skill will natively know about your animation catalog. Every time it generates a storyboard, it'll produce a 6-column table (including "参考效果") and automatically reference your existing compositions where appropriate. New compositions you add to the catalog will be picked up automatically.

**Why this approach:** Instead of manually adding the reference column after every storyboard generation, baking the logic into the skill means all future storyboards are born with the reference system. The agent reads `.omo/animation-catalog.md` on the fly, so new compositions are auto-discovered.

**What it will NOT do:** Won't modify the existing storyboard or catalog. Won't change any code. Won't affect other skills.

**Effort:** Short (single file, 3 targeted modifications)
**Risk:** Low — markdown-only, additive changes to one skill file.
**Decisions to sanity-check:** The exact content of the new "🎪 动画库引用系统" section.

Your next move: **Approve** to proceed, or request changes to the section content below.

---

> TL;DR (machine): Short | Low risk | 1 todo: modify skill file with 3 region changes.

## Scope

### Must have
- `.agents/skills/video-storyboard-agent/SKILL.md`: 3 targeted changes (see Region A/B/C below)

### Must NOT have (guardrails, anti-slop, scope boundaries)
- NO changes to `.omo/animation-catalog.md`
- NO changes to any `src/` files
- NO changes to the existing storyboard

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: none (markdown-only, no tests)
- Evidence: Read the modified skill file, verify:
  1. New "🎪 动画库引用系统" section exists with correct content
  2. Table header now has 6 columns
  3. Self-check has 6 items (new reference validity check)

## Execution strategy

### Dependency matrix
| Todo | Depends on | Blocks |
| --- | --- | --- |
| 1. Modify skill file | — | — |

## Todo

- [ ] 1. Modify `.agents/skills/video-storyboard-agent/SKILL.md` — 3 region changes

  ### Region A: Insert "🎪 动画库引用系统" section
  **Insert after** the "⚡ 节奏引擎：Pattern Interrupt" section (after `---` on line 56), **before** "## 📥 输入数据格式" (line 58).

  Content to insert:

  ```markdown
  ---

  ## 🎪 动画库引用系统

  > **Target project:** remotion-hammer (`.omo/animation-catalog.md`)
  > 如果项目包含 `.omo/animation-catalog.md`（动画组件目录），你必须：
  > 1. 先读取该目录文件，了解项目中已有的复用动画组件
  > 2. 对每个分镜行，判断是否能映射到某个现有组件
  > 3. 能映射 → 使用 `@组件名(参数=值)` 引用；不能映射 → 回退到原始动画属性描述

  ### 引用语法

  | 写法 | 含义 |
  |------|------|
  | `@TextIntro` | 引用组件，全部使用默认参数 |
  | `@TextIntro(mainText="Hello")` | 引用 + 覆写参数 |
  | `@CharReveal(text="你好", staggerMode="center")` | 引用 + 覆写多个参数 |
  | `—` | 无引用，使用「动画属性」列的原始描述 |

  ### 动画特征 ↔ 推荐引用对照表

  按优先级从高到低匹配（匹配第一条即停）：

  | 动画特征 | 推荐引用 | 常用参数 |
  |---------|---------|---------|
  | 字符逐字弹性弹入（y:100%→0, back.out） | `@TextIntro` | mainText, subText |
  | 字符从底部 3D 翻转显现（rotationX:90→0） | `@CharReveal` | text, staggerMode(sequential\|random\|center\|edges) |
  | 字符乱码翻滚→逐步稳定为目标文字 | `@TextScramble` | text, fontSize |
  | 背景面板从左展开 + 字符从底部滑入 | `@MediaTitle` | text, bgColor, textColor, fontSizeVw |
  | 网格细胞径向波纹展开 + 标题淡入 | `@GridReveal` | cols, rows, title, subtitle |
  | SVG 椭圆环绕文字描边绘制 | `@CircleGlow` | text, glowColor, fontSize |
  | 竖向帘幕柱 reveal / cover / cycle | `@CurtainReveal` | direction, columnCount, backgroundColor |
  | SVG 多边形旋转缩放转场 | `@SceneTransition` | (固定效果，无参数) |
  | 3D 液体玻璃质感面板 | `@LiquidGlass` | (固定效果，无参数) |
  | 3D 水球流动噪波效果 | `@WaterOrb` | (固定效果，无参数) |
  | 物理弹道发射 + 慢动作展示 | `@HeroReveal` | seed, gravity, durationInFrames |
  | 动漫式爆发弹入 + 重力下落 + 弹簧归位 | `@AnimeDrop` | targetSize, initialTiltAngle |
  | 三段式物理下落（蓄力→弹射→自由落体→着陆） | `@PhysicsDrop` | endX, endY, targetSize |
  | 弹道轨迹 + 慢动作浮动 + 时间恢复飞出 | `@OrbitalRelaunch` | seed, gravity, bulletTimeScale |
  | 普通淡入 / 位移 / 旋转（无特征模式） | `—` | 回退到「动画属性」列原始描述 |
  | 多元素复合动画（卡片+文字+粒子+图标） | `—` | 回退到「动画属性」列原始描述 |
  | 屏幕录制段（标注 🖥️） | `—` | 不留参考 |

  ### 列间协作规则

  ```
  ┌──────────────────────────────────────────────────────────────┐
  │  参考效果                   动画属性（参数覆写）               │
  ├──────────────────────────────────────────────────────────────┤
  │  @Name (无参数)                 空                           │
  │  → 使用引用组件的全部默认行为                                │
  ├──────────────────────────────────────────────────────────────┤
  │  @Name(k=v, ...)              key=value, ...                 │
  │  → 使用引用组件 + 参数覆写                                   │
  │  「动画属性」列此时为 key=value 格式                          │
  ├──────────────────────────────────────────────────────────────┤
  │  —                              原始 GSAP/Remotion 描述      │
  │  → 回退到原始动画格式（原有行为不变）                        │
  └──────────────────────────────────────────────────────────────┘
  ```

  ### 维护规则

  当项目中新增了动画 Composition 时，同步更新 `.omo/animation-catalog.md` 添加新条目。本 skill 会自动读取该文件，无需修改 skill 本身。

  ### Region B: Update output format table
  **Replace** the current 5-column table (lines 77-79) with a 6-column table:

  Current (5 cols):
  ```
  | 文本片段 (触发词) | 预估发生时间/帧数 | 视觉呈现 (Visual) | 动画属性 (代码级提示) | 节奏曲线 (Easing) & Stagger |
  ```

  New (6 cols):
  ```
  | 文本片段 (触发词) | 预估发生时间/帧数 | 视觉呈现 (Visual) | 动画属性（参数覆写） | 节奏曲线 (Easing) & Stagger | 参考效果 |
  ```

  Full replacement for lines 76-83:

  ```markdown
  ### 2. 逐帧分镜表
  | 文本片段 (触发词) | 预估发生时间/帧数 | 视觉呈现 (Visual) | 动画属性（参数覆写） | 节奏曲线 (Easing) & Stagger | 参考效果 |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | *严禁任何模糊形容词，必须细化到具体的圆角、阴影色值、偏移像素* | *格式：X–Y帧 (As–Bs)* | *描述卡片淡入、嵌套结构、背景和堆叠状态* | *参考效果为空时：原始动画属性描述。参考效果有值时：key=value 参数覆写* | *必须明确定义具体曲线和错拍时间* | *@组件名(参数=值) 或 —（详见 🎪 动画库引用系统）* |
  ```

  Also add a note after the table hint:
  ```markdown
  > **参考效果列说明**：
  > - 可复现项目已有动画组件 → `@组件名(key=value)`
  > - 屏幕录制段 / 复杂多元素 → `—`
  > - 匹配规则和参数表详见「🎪 动画库引用系统」
  ```

  ### Region C: Add 6th self-check item
  **Append** to the self-check list (after line 94):

  ```markdown
  - [x] 参考效果引用有效 — 每个 `@组件名` 均可解析到 `.omo/animation-catalog.md` 中的条目
  ```

  Must NOT do:
  - Do NOT reorder existing sections
  - Do NOT change any existing content outside the 3 regions
  - Do NOT duplicate content that already exists in `.omo/animation-catalog.md`

  Parallelization: Wave 1 | Blocked by: none | Blocks: none
  References: `.agents/skills/video-storyboard-agent/SKILL.md:56-94` (target regions), `.omo/animation-catalog.md` (catalog the skill points to)
  Acceptance criteria:
  1. New "🎪 动画库引用系统" section present with reference syntax, matching table, and column rules
  2. Output format table has 6 headers (added "参考效果")
  3. Self-check has 6 items (new reference validity check)
  QA scenarios: Read the modified file, spot-check each of the 3 regions for correctness
  Content integrity: Verify no content from existing sections was accidentally removed
  Commit: Y | docs(skill): add animation catalog reference system to video-storyboard-agent

## Final verification wave
- [ ] F1. Skill file has all 3 region changes correctly applied
- [ ] F2. No existing content accidentally removed or reordered
- [ ] F3. `.omo/animation-catalog.md` unchanged (git diff shows only skill file)

## Commit strategy
- Commit 1: `docs(skill): add animation catalog reference system to video-storyboard-agent`

## Success criteria
1. `.agents/skills/video-storyboard-agent/SKILL.md` has new "🎪 动画库引用系统" section
2. Output format table is 6 columns
3. Self-check has 6 items
4. Only 1 file modified
