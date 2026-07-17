---
slug: design-system-color-palette
status: awaiting-approval
intent: clear
pending-action: write .omo/plans/design-system-color-palette.md
approach: 向 AGENTS.md 追加一个 Design System — Color Palette 章节，包含三色方案和深色背景规则
---

# Draft: design-system-color-palette

## Components (topology ledger)
- AGENTS.md — 追加新章节，不修改现有内容

## Open assumptions (announced defaults)
| assumption | adopted default | rationale | reversible? |
|---|---|---|---|
| 章节插入位置 | 放在 `Style & Performance Conventions` 之前，作为独立章节 | 色板是更高层的设计约束，风格/性能约定应该引用它 | 是，纯排版问题 |
| 命名 | "Design System — Color Palette (MANDATORY)" | 与现有 "MANDATORY" 标签风格一致 | 是 |
| 是否需要强调色 | 暂不需要，三色系统已自洽 | 用户没说需要，不多加 | 是，未来可追加 |

## Findings (cited - path:lines)
- AGENTS.md 当前结构: 45行，已有 Commands / Compositions / Architecture / GSAP Rules / Style & Performance 章节 — `.omo/drafts/design-system-color-palette.md`
- 代码库中已有硬编码颜色: `TextIntro.tsx:134` 使用 `#ffffff`, `LiquidGlass.tsx:15` 使用 `#ffffff`, `LiquidGlass.tsx:18` 使用 `#0a0c14` — 这些是具体组件样式，未来可逐步迁移

## Decisions (with rationale)
1. **色板三色值按用户指定录入** — `#CBC0D3` 主色 / `#1D1B20` 文字主色 / `#4E4D5C` 次要文字
2. **深色背景规则** — 当背景为深色时，使用 `#CBC0D3` 包裹文字
3. **格式用表格** — 与 AGENTS.md 现有的简洁风格一致，一目了然
4. **标记 MANDATORY** — 与 GSAP 规则一致，强调这是必须遵守的约束

## Scope IN
- 在 AGENTS.md 中新增 Design System — Color Palette 章节
- 包含三色值表格 + 深色背景规则 + 约束说明

## Scope OUT (Must NOT have)
- 不改动现有任何章节内容
- 不改动任何组件代码中的硬编码颜色
- 不添加尾随 emoji
- 不添加设计原理大段论述（保持 AGENTS.md 的简洁风格）

## Open questions
无。用户已明确指定所有色值和规则。

## Approval gate
status: awaiting-approval
