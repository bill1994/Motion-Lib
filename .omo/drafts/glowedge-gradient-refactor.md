---
slug: glowedge-gradient-refactor
status: awaiting-approval
intent: clear
pending-action: write .omo/plans/glowedge-gradient-refactor.md
approach: Replace GlowEdge's box-shadow-based single-color glow with filter:blur()+conic-gradient for multi-color gradient presets + custom gradient support
---

# Draft: glowedge-gradient-refactor

## Components (topology ledger)
| id | outcome | status | evidence |
|---|---|---|---|
| C1: GlowEdge.tsx | Rewrite rendering: filter:blur()+conic-gradient instead of box-shadow | active | code review |
| C2: colorPresets.ts (new) | Extract variant definitions | active | code review |
| C3: AnimatedCardScene.tsx | Pass through new props | active | code review |
| C4: CardReveal.tsx | Pass through new props | active | code review |

## Open assumptions (announced defaults)
| assumption | adopted default | rationale | reversible? |
|---|---|---|---|
| Blur radius default | 10px | Matches visual spread of outermost 50px box-shadow ring (~3σ) | Yes via blurAmount prop |
| Rainbow preset colors | #ff3264 → #ff2080 → #cc44ff → #6446ff → #288cff → #1db9aa → #32c850 → #ffcc00 → #ff6600 → #ff3264 | Full spectrum, warm-cool-warm loop | Yes — just data |
| Ocean preset | Blues/purples/teals: #6446ff → #288cff → #1db9aa | Cool-toned | Yes |
| Sunset preset | Oranges/reds/yellows: #ff3264 → #ff6600 → #ffcc00 | Warm-toned | Yes |
| colorVariant default | 'mono' | Backward compatible | Yes |
| mixBlendMode | 'plus-lighter' | Additive blending keeps alpha channel clean | Yes |
| Backward compat with old `color` prop | When variant='mono', color controls the single color | Preserve existing API | Yes |

## Findings (cited - path:lines)
- GlowEdge.tsx:14-61 — current implementation uses 14 box-shadow layers with single color alpha stack
- GlowEdge.tsx:24 — angle = (frame * 360 / rotationDuration) % 360 (Remotion frame-driven)
- Border-beam source: uses radial-gradient ellipses + CSS @property, not conic-gradient mask
- Border-beam: does NOT use filter:blur() — uses hard gradient → transparent without blur

## Decisions (with rationale)
1. **Replace box-shadow with filter:blur() + conic-gradient** — box-shadow不支持渐变颜色，conic-gradient+blur 是唯一能实现「渐变扫光」的纯 CSS 方案
2. **Unified rendering for all variants** — 同一个 div 结构，Variant 只改变 conic-gradient 的色值列表，mono 就是两个相同色
3. **colorVariant presets 数据抽到单独文件** — 便于扩展和测试
4. **保持 mask 旋转机制不变** — frame-driven angle 计算，Remotion 确定性不受影响

## Scope IN
- GlowEdge.tsx 重写渲染（box-shadow → conic-gradient + blur + mask）
- 新增 colorPresets.ts（rainbow/ocean/sunset/mono 预设定义）
- AnimatedCardSceneProps 新增 colorVariant / blurAmount prop
- CardReveal pass-through props

## Scope OUT (Must NOT have)
- 不改 border-beam 那种 radial-gradient 光斑方案
- 不改 AnimatedCardScene 的整体结构（只是加 prop forwarding）
- 不动 particle / entranceStyle / breathe 等其它特效
- 不动 Root.tsx 的 composition 注册
- 不新增 npm 依赖

## Open questions
（无 — 所有设计决策已确定）

## Approval gate
status: awaiting-approval
<!-- When exploration is exhausted and unknowns are answered, set status: awaiting-approval. -->
<!-- That durable record is the loop guard: on a later turn read it and resume at the gate instead of re-running exploration. -->
