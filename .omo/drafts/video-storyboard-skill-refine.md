---
slug: video-storyboard-skill-refine
status: awaiting-approval
intent: clear
pending-action: write .omo/plans/video-storyboard-skill-refine.md
approach: create ~/.agents/skills/video-storyboard-agent/SKILL.md with the user's original skill design, modified to use "项目优先、skill 为 fallback" 的分层模式
---

# Draft: video-storyboard-skill-refine

## Components (topology ledger)
<!-- Lock the SHAPE before depth. One row per top-level component that can succeed or fail independently. -->
| id | outcome | status | evidence path |
|---|---|---|---|
| skill-file | SKILL.md 文件，颜色和 GSAP 部分使用"可被项目覆盖"的 fallback 模式 | active | ~/.agents/skills/video-storyboard-agent/SKILL.md |

## Open assumptions (announced defaults)
<!-- Record any default you adopt instead of asking, so the user can veto it at the gate. -->
| assumption | adopted default | rationale | reversible? |
|---|---|---|---|
| skill 存放位置 | `~/.agents/skills/video-storyboard-agent/` | 现有全部 skill 都在这 | Yes，用户可指定其他路径 |
| skill 格式 | frontmatter metadata + Markdown 主体 | 与 `remotion-best-practices` 等已有 skill 一致 | No，框架要求 |
| 颜色方案 | 保留用户设计的 5 色方案作为默认，增加"优先遵循项目设计系统"的前置说明 | 全局可复用 + 不冲突项目 | Yes |
| GSAP 规则 | 增加通用的 Paused Law / Seconds-Seek / Context Lifecycle 规则 | 任何 Remotion+GSAP 项目都适用，既非项目独有也不冲突 | No，最佳实践 |
| SplitText | 保留但增加付费依赖说明 + CharReveal 替代方案 | 让使用者知情选择 | Yes |

## Findings (cited - path:lines)

1. **Skill 存放路径**: `~/.agents/skills/` 下已有 22 个 skill，格式统一为 `<name>/SKILL.md`，带 YAML frontmatter
2. **AGENTS.md 颜色规则**: 第 39-51 行强制 `#CBC0D3 / #1D1B20 / #4E4D5C` 三色体系
3. **AGENTS.md GSAP 规则**: 第 32-37 行三条强制性集成规则（Paused Law, Seconds-Seek, Context Lifecycle）
4. **GSAP+Remotion 桥接**: AGENTS.md 第 53-59 行规定 GPU 属性、position:absolute 要求
5. **现有分镜参考**: `.omo/drafts/full-storyboard.md` 已经有完成的 11.5 分钟分镜，可作为格式参考
6. **CharReveal 组件**: `src/CharReveal.tsx` 实现了手工 tokenize 拆字，无需 SplitText 付费插件

## Decisions (with rationale)

| Decision | Rationale |
|---|---|
| 在 skill 中增加"优先遵循项目设计系统"前缀 | 确保 skill 全局可复用，不硬覆盖项目 AGENTS.md |
| 增加 Paused Law / Seconds-Seek / Context Lifecycle 规则 | 这三条是任何 Remotion+GSAP 项目的通用规范，不是 remotion-hammer 独有，放在 skill 里保证所有使用该 skill 的项目都受益 |
| 保留 SplitText 但增加付费说明 + 替代方案 | 诚实告知成本，同时给项目一个免费的替代路径 |
| 增加 GSAP→Remotion 属性等价映射表 | 让 skill 不仅能做纯 GSAP，还能输出 Remotion 兼容的代码提示 |

## Scope IN
- 创建 `~/.agents/skills/video-storyboard-agent/SKILL.md`
- 写入用户设计的完整 skill 内容，包括：
  - 角色定义、动画军火库、节奏引擎规则
  - 输出四件套（节奏概览 + 逐帧表 + PI 自检 + 约束自检）
- 修改内容（与项目兼容的部分）：
  - 🎨 颜色规范改为"优先遵循项目定义，无定义时 fallback 到默认色"
  - ⚡ 增加 GSAP+Remotion 通用规则（Paused Law, Seconds-Seek, Context Lifecycle）
  - 📐 增加 GSAP→Remotion 属性等价映射表
  - 🔌 SplitText 付费说明 + CharReveal 替代方案

## Scope OUT (Must NOT have)
- 不修改 `AGENTS.md`
- 不修改 `src/` 下任何产品代码
- 不修仍然 `.omo/` 下的任何 pland/plan（`full-storyboard.md` 等维持原样）
- 不引入新的项目级配置

## Open questions
无 — 所有决策均已闭合

## Approval gate
status: awaiting-approval
<!-- When exploration is exhausted and unknowns are answered, set status: awaiting-approval. -->
<!-- That durable record is the loop guard: on a later turn read it and resume at the gate instead of re-running exploration. -->
