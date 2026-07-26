# glowedge-gradient-refactor - Work Plan

## TL;DR (For humans)

**What you'll get:** GlowEdge 扫光效果支持 4 套渐变配色（rainbow/ocean/sunset/mono）以及自定义 CSS 渐变，视觉从 box-shadow 环状衰减升级为高斯模糊平滑光晕。

**Why this approach:** box-shadow 不支持渐变颜色，改用 `filter: blur()` + `conic-gradient` 是唯一能在保持旋转 slit mask 架构下实现彩色渐变扫光的纯 CSS 方案，且 Remotion frame 驱动逻辑完全不变。

**What it will NOT do:** 不改卡片粒子系统、入场动画、呼吸动画。不改 Root.tsx。不新增 npm 依赖。

**Effort:** Short
**Risk:** Low - 视觉变化（box-shadow → blur）可能轻微影响光晕手感，可通过 blurAmount prop 微调
**Decisions to sanity-check:** blur 默认值（10px）、rainbow 颜色序列

Your next move: 批准计划，然后执行 `npm run dev` 在 Remotion Studio 里即时看效果。

---

> TL;DR (machine): Short effort, Low risk. Rewrite GlowEdge rendering from box-shadow to blur+conic-gradient. Add colorVariant presets (rainbow/ocean/sunset/mono) + custom gradient support.

## Scope
### Must have
- GlowEdge.tsx 渲染重写：box-shadow → conic-gradient background + filter:blur() + mask
- colorPresets.ts: 4 套预设定义（mono/rainbow/ocean/sunset）+ 自定义 gradient
- AnimatedCardSceneProps 新增 colorVariant / blurAmount
- CardReveal pass-through
- 向后兼容：variant='mono' + 默认 color='#CBC0D3' 时视觉效果应该接近当前

### Must NOT have (guardrails, anti-slop, scope boundaries)
- 不改 entranceStyle / particle / breathe 系统
- 不改 Root.tsx
- 不新增 npm 依赖
- 不改成 border-beam 的 radial-gradient 光斑方案
- 不改 GlowEdgeProps 原有 prop（只新增不删除）

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: tests-after — TypeScript compile + Remotion Studio 视觉确认
- Evidence: .omo/evidence/task-1-glowedge-gradient-refactor.txt

## Execution strategy
### Parallel execution waves
- Wave 1: colorPresets.ts（新文件，无依赖）
- Wave 2: GlowEdge.tsx（重写，依赖 Wave 1）
- Wave 3: AnimatedCardScene.tsx + CardReveal.tsx（prop forwarding，依赖 Wave 2）

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| T1: colorPresets.ts | — | T2 | — |
| T2: GlowEdge.tsx | T1 | T3 | — |
| T3: Props forwarding | T2 | — | — |

## Todos
- [x] 1. 创建 colorPresets.ts — 渐变配色预设定义
  What to do / Must NOT do:
  新建 `src/AnimatedCardScene/colorPresets.ts`，导出：
  - `type GlowColorVariant = 'mono' | 'rainbow' | 'ocean' | 'sunset'`
  - `getGradientString(variant: GlowColorVariant, color?: string): string` — 返回 conic-gradient(...) CSS 字符串
  - 每个 variant 定义一个颜色数组，通过 `conic-gradient(from 0deg, ${colors.join(', ')})` 拼接
  - mono 模式：用传入的 color 值（默认 #CBC0D3），生成 `conic-gradient(from 0deg, ${c}, ${c})`
  - 预设色值参考 border-beam 的配色感觉但精简到 4-6 色
  - 不要引入外部依赖
  - 导出的函数必须是纯函数，不涉及 React/Remotion
  Parallelization: Wave 1 | Blocked by: — | Blocks: T2
  References: 当前 GlowEdge.tsx:14-61（现有 props 结构）；border-beam styles.ts colorPalettes（配色灵感，但不需要照搬）
  Acceptance criteria: 文件创建成功，tsc 无报错
  QA scenarios: 在测试文件中调用 getGradientString('rainbow') 确认返回合法的 conic-gradient CSS 字符串
  Commit: Y | feat(glowedge): add color variant presets

- [x] 2. 重写 GlowEdge.tsx — 改用 filter:blur() + conic-gradient
  What to do / Must NOT do:
  修改 `GlowEdge.tsx`：
  - 新增 props: `colorVariant?: GlowColorVariant`（默认 'mono'）、`blurAmount?: number`（默认 10）
  - 保持原有 props 不变：width, height, frame, borderRadius, color, intensity, rotationDuration, enabled
  - 删除内部嵌套的 `<div>`（box-shadow 层），渲染改为单层 `<div>`
  - 新渲染结构：
    ```
    <div style={{
      position: 'absolute', inset: -OUTSET, borderRadius, pointerEvents: 'none', zIndex: 3,
      background: getGradientString(colorVariant, color),
      filter: `blur(${blurAmount}px)`, WebkitFilter: `blur(${blurAmount}px)`,
      maskImage: `conic-gradient(from ${angle}deg at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%)`,
      WebkitMaskImage: 同上,
      mixBlendMode: 'plus-lighter',
      opacity: Math.min(1, intensity),
    }} />
    ```
  - 当 `colorVariant === 'mono'` 时，视觉效果应接近原版（颜色来自 color prop，默认 #CBC0D3）
  - 当 `colorVariant !== 'mono'` 时，color prop 被忽略，使用预设渐变
  - Must NOT: 删除 GlowEdgeProps 的导出接口，不要改 GlowEdgeProps 的 field 名
  Parallelization: Wave 2 | Blocked by: T1 | Blocks: T3
  References: GlowEdge.tsx:14-61（当前实现，全部替换）；colorPresets.ts（新增依赖）
  Acceptance criteria: `npx tsc --noEmit` 无报错，组件正常渲染
  QA scenarios: `npm run lint`（eslint + tsc）通过
  Commit: Y | feat(glowedge): rewrite rendering with blur+conic-gradient for color variant support

- [x] 3. AnimatedCardScene + CardReveal prop forwarding
  What to do / Must NOT do:
  修改 `AnimatedCardScene.tsx`：
  - AnimatedCardSceneProps 新增: `glowEdgeColorVariant?: GlowColorVariant`、`glowEdgeBlurAmount?: number`
  - 在 `<CardReveal>` 调用处传递新 props
  修改 `CardReveal.tsx`：
  - CardRevealProps 新增: `glowEdgeColorVariant`、`glowEdgeBlurAmount`
  - 在 `<GlowEdge>` 调用处传递新 props
  - 两端 default 值保持一致（mono, 10）
  Parallelization: Wave 3 | Blocked by: T2 | Blocks: —
  References: AnimatedCardScene.tsx:24-29（现有 glowEdgeXXX props 模式完全一致）; CardReveal.tsx:57-80（现有 pass-through 模式）
  Acceptance criteria: `npx tsc --noEmit` 无报错
  QA scenarios: `npm run lint` 通过
  Commit: Y | feat(glowedge): add colorVariant/blurAmount props to AnimatedCardScene and CardReveal

## Final verification wave
- [x] F1. Plan compliance audit — 3 个 todo 全部完成，scope in/out 匹配
- [x] F2. Code quality — `npm run lint` (eslint + tsc) 通过
- [ ] F3. Real manual QA — `npm run dev` 启动 Remotion Studio，在 AnimatedCardScene 里切换不同 colorVariant 预览效果
- [x] F4. Scope fidelity — 仅改动 4 个预期文件 (colorPresets.ts + GlowEdge.tsx + AnimatedCardScene.tsx + CardReveal.tsx)，Root.tsx 未改动

- [x] 4. 修复 glow 偏淡：加亮核层（无 blur slit）+ blur 光晕层叠加

## Commit strategy
- 1 commit per todo (3 commits), push after F2 passes
- Commit messages format: `feat(glowedge): <summary>`

## Success criteria
- GlowEdge 支持 colorVariant='mono' | 'rainbow' | 'ocean' | 'sunset'
- 自定义渐变：color prop 可传入完整 conic-gradient() 字符串（配合 variant='custom'）
- `npm run lint` 通过，无 ts 错误
- `npm run dev` 可以在 Studio 中看到不同变体的扫光效果
