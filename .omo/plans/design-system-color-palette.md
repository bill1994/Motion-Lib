# design-system-color-palette - Work Plan

## TL;DR (For humans)

**What you'll get:** 你的个人品牌色板（`#CBC0D3` / `#1D1B20` / `#4E4D5C`）被写进 AGENTS.md，以后所有 AI 代理和协作者在这个项目里做页面、视频、UI 时都会自动遵守这套配色。

**Why this approach:** 直接在 AGENTS.md 追加一个独立章节，与现有的 GSAP 规则、性能规范并列。改动最小，不影响现有内容，且 AGENTS.md 是每个 AI 代理进入项目时最先读取的文件。

**What it will NOT do:** 不改动任何组件代码中的硬编码颜色（TextIntro 的 `#ffffff`、LiquidGlass 的 `#0a0c14` 等保持不变），不添加多余的设计理论，不引入强调色。

**Effort:** Quick
**Risk:** Low — 纯文档追加，不涉及代码逻辑
**Decisions to sanity-check:** 无 — 色值和规则已由你完全指定

Your next move: approve，然后 worker 执行。

---

> TL;DR (machine): Quick / Low / 向 AGENTS.md 追加 Design System 色板章节

## Scope
### Must have
- 在 AGENTS.md 中 `## Style & Performance Conventions` 之前插入新章节 `## Design System — Color Palette (MANDATORY)`
- 包含三色值表格：Page primary / Text primary / Text secondary
- 包含深色背景规则
- 标注 MANDATORY

### Must NOT have (guardrails, anti-slop, scope boundaries)
- 不改动现有章节内容
- 不改动组件代码
- 不加 emoji
- 不加大段设计原理

## Verification strategy
- Test decision: none（纯文档改动）
- Evidence: 审阅最终 AGENTS.md 渲染效果

## Execution strategy
- 单文件单任务，无需并行

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |

## Todos
- [ ] 1. 向 AGENTS.md 追加 Design System 色板章节
  What to do / Must NOT do: 在 `## Style & Performance Conventions` 行之前插入完整色板章节。不能删除或修改现有任何内容。
  Parallelization: Wave 1 | Blocked by: 无 | Blocks: 无
  References:
  - AGENTS.md: 当前内容（45行），需在 `## Style & Performance Conventions` 前插入
  - 色值: `#CBC0D3`（页面主色） / `#1D1B20`（文字主色） / `#4E4D5C`（次要文字）
  - 规则: 深色背景时用 `#CBC0D3` 做文字色
  Acceptance criteria: AGENTS.md 第 45 行后出现 Design System 章节，内容与 draft 一致
  QA scenarios: read AGENTS.md 确认新章节存在、表格格式正确、不影响后续章节
  Commit: N（等你确认后再决定是否提交）

## Final verification wave
- [ ] F1. 读取 AGENTS.md 确认章节已正确追加
- [ ] F2. 确认无现有内容被意外修改
- [ ] F3. 确认色值、规则、表格准确无误

## Commit strategy
暂不提交，等你确认后再决定

## Success criteria
AGENTS.md 中包含 Design System 色板章节，且所有 AI 代理可读可遵守
