# video-storyboard-skill-refine - Work Plan

## TL;DR (For humans)

**What you'll get:** 一份完整的 `video-storyboard-agent` skill 文件（SKILL.md），可以全局复用。它保留了你的原始设计（节奏引擎、PI、四件套输出），同时在颜色和 GSAP 规则上做了"优先遵循项目定义，无定义才用 skill 默认值"的处理。

**Why this approach:** 单独一套硬编码颜色会跟项目的 AGENTS.md 打架，用 fallback 模式让 skill 在任何项目里都能用，不冲突、不污染。

**What it will NOT do:** 不改你的 AGENTS.md，不改 src/ 下的代码，不改 `.omo/` 里的计划，不新建任何项目级文件。

**Effort:** Quick (single file creation)
**Risk:** Low - 纯 skill 文件创建，不影响任何运行时
**Decisions to sanity-check:** 存放路径（当前选 `~/.agents/skills/`），SplitText 付费说明的表述方式

Your next move: 审批这个计划，然后执行。Full execution detail follows below.

---

> TL;DR (machine): Quick | Low — 创建 `~/.agents/skills/video-storyboard-agent/SKILL.md`，将颜色和 GSAP 规则改为 fallback 模式，增加 Remotion 集成映射

## Scope
### Must have
- 在 `~/.agents/skills/video-storyboard-agent/SKILL.md` 创建完整的 skill 文件
- 保留用户原始设计全部内容：角色定义、动画军火库、节奏引擎、PI 规则、输出四件套
- 🎨 颜色规范改为"优先遵循项目定义，无定义时 fallback 到默认色"
- ⚡ 增加 GSAP+Remotion 通用规则（Paused Law, Seconds-Seek, Context Lifecycle）
- 📐 增加 GSAP → Remotion 属性等价映射表
- 🔌 SplitText 付费说明 + CharReveal 替代方案

### Must NOT have (guardrails, anti-slop, scope boundaries)
- 不修改 AGENTS.md
- 不修改 src/ 下任何产品代码
- 不修改 .omo/ 下任何现有 plan/draft

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: none（纯文档型 skill，无代码可测试）
- Evidence: .omo/evidence/skill-final-content.txt

## Execution strategy
### Parallel execution waves
单文件创建，一个 todo。

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. Create SKILL.md | — | — | — |

## Todos
> Implementation + Test = ONE todo. Never separate.
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->
- [ ] 1. 创建 `~/.agents/skills/video-storyboard-agent/SKILL.md`
  What to do / Must NOT do:
    1. 确保目录存在 → 写入 SKILL.md
    2. 内容包含用户原始完整 skill（角色定义、动画军火库、节奏引擎 Pattern Interrupt、🎨 颜色、📥 输入、📤 输出四件套、约束自检）
    3. 🎨 颜色部分改为：
       - 优先遵循项目既有设计系统（如 AGENTS.md 中定义的颜色令牌）
       - 如项目未定义，使用默认配色：#FFFFFF / #D4A5A5 / #e74c3c / #9B8AA5 / #F5F0F0
    4. ⚡ 增加 Remotion+GSAP 集成映射表（Paused Law / Seconds-Seek / Context Lifecycle）
    5. 📐 增加 GSAP→Remotion 属性等价表（back.out → spring, stagger → Sequence 等）
    6. 🔌 SplitText 注明是 Club 付费插件，提供 CharReveal 免替代方案引用
    7. ❌ 不修改 AGENTS.md 或任何 src/.omo 文件
  Parallelization: Wave 1 | Blocked by: — | Blocks: —
  References:
    - Skill 存放位置参考: ~/.agents/skills/remotion-best-practices/SKILL.md (格式)
    - AGENTS.md 颜色规则: AGENTS.md:39-51
    - AGENTS.md GSAP 规则: AGENTS.md:32-37
    - CharReveal 替代方案: src/CharReveal.tsx
    - 已完成的分镜参考: .omo/drafts/full-storyboard.md
    - GSAP→Remotion 映射来源: .omo/drafts/full-storyboard.md:6
  Acceptance criteria (agent-executable):
    - 文件存在: `ls ~/.agents/skills/video-storyboard-agent/SKILL.md`
    - 包含 frontmatter: `head -5 ~/.agents/skills/video-storyboard-agent/SKILL.md | grep -q "^---$"`
    - 包含"优先遵循项目": `grep -c "优先遵循项目" ~/.agents/skills/video-storyboard-agent/SKILL.md` ≥ 1
    - 包含 Paused Law: `grep -c "paused: true" ~/.agents/skills/video-storyboard-agent/SKILL.md` ≥ 1
    - 包含 Seconds-Seek: `grep -c "seek(frame / fps)" ~/.agents/skills/video-storyboard-agent/SKILL.md` ≥ 1
    - 包含 Context Lifecycle: `grep -c "gsap.context" ~/.agents/skills/video-storyboard-agent/SKILL.md` ≥ 1
    - 包含 SplitText 付费说明: `grep -c "SplitText" ~/.agents/skills/video-storyboard-agent/SKILL.md` ≥ 1
    - 包含 CharReveal: `grep -c "CharReveal" ~/.agents/skills/video-storyboard-agent/SKILL.md` ≥ 1
    - 包含 GSAP→Remotion 映射: `grep -c "interpolate\|spring" ~/.agents/skills/video-storyboard-agent/SKILL.md` ≥ 1
    - 未修改 AGENTS.md: `git diff --name-only AGENTS.md` 为空
    - 未修改 src/: `git diff --name-only src/` 为空
  QA scenarios:
    - happy: 文件存在，frontmatter 完整，关键词全包含
    - failure: 如果 grep 找不到关键词，提示缺失项
    - Evidence: .omo/evidence/skill-final-content.txt (cat 文件全文)
  Commit: N（skill 文件通常不进项目 repo，不进 git）

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [ ] F1. Plan compliance audit — 确认只创建了 skill 文件，没有改动项目代码
- [ ] F2. Content completeness — 确认所有关键部分（角色、节奏、PI、输出、映射、替代方案）都在
- [ ] F3. Compatibility check — 确认颜色部分有"优先遵循项目"前缀，GSAP 规则含 Remotion 映射
- [ ] F4. Scope fidelity — 确认没有越界修改 AGENTS.md 或 src/

## Commit strategy
不提交。Skill 文件属于用户全局 agent 配置，不进项目 repo。

## Success criteria
1. `~/.agents/skills/video-storyboard-agent/SKILL.md` 存在，frontmatter 格式正确
2. 文件中包含"优先遵循项目"的 fallback 模式
3. 文件中包含 Paused Law / Seconds-Seek / Context Lifecycle 三条 GSAP+Remotion 规则
4. 文件中包含 SplitText 付费说明 + CharReveal 替代方案
5. 文件中包含 GSAP→Remotion 映射表
6. AGENTS.md 和 src/ 无任何改动
