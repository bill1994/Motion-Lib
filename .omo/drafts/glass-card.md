---
slug: glass-card
status: awaiting-approval
intent: clear
pending-action: ✅ plan written - awaiting approval
approach: "新增 GlassCard 组件（variant='title'|'showcase'）+ 两个 composition wrapper，纯 Remotion interpolate 驱动，CSS glassmorphism + neon glow 纯前端实现"
---

# Draft: glass-card

## Decisions (with rationale)

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | 统一组件 `GlassCard` + `variant` prop | 标题卡和展示卡共享 90% 的玻璃视觉层代码，变体只差异在入场动画和布局。避免重复代码 |
| D2 | 动画引擎用纯 Remotion `interpolate` | 玻璃卡片动效是简单的 transform 动画（tilt/scale/glow），不需要 GSAP timeline 的复杂 sequencing。且 `interpolate` 确定性天然保证，无 GSAP 初始化开销 |
| D3 | 产品展示用层叠堆叠（fan stack）布局 | 用户选择。3-4 张卡片以不同角度围绕中心展开，依次 tilt 入场 |
| D4 | 片头标题卡用 Neo surface 风格 | 用户选择。高对比 rim light + 硬阴影 + 电光 accent rail，锐利适合标题 |
| D5 | 颜色系统遵守项目规范 | `#CBC0D3` / `#1D1B20` / `#4E4D5C`，深色背景上文字用 `#CBC0D3` |
| D6 | 新增文件放在 `src/GlassCard/` 目录 | 项目已有 `src/AnimatedCardScene/` 先例，按文件夹组织组件 |
| D7 | 纯 CSS glassmorphism（无 Three.js） | DepthFold 原版就是纯 CSS 3D transforms，不需要 WebGL。性能更好，导出稳定 |

## Scope IN

1. `GlassCard` 组件——单张玻璃卡片的视觉渲染 + 变体驱动
2. 两张玻璃卡片的视觉层：glass surface、neon rim glow、accent rail、shadow
3. `variant='title'` 入场动效：tilt + scale + glow reveal → 微幅 breathing → spring settle
4. `variant='showcase'` 入场动效：从扇面中心旋转展开
5. `GlassTitleCard` composition wrapper——单卡居中 + 文字内容
6. `GlassShowcaseStack` composition wrapper——多卡层叠堆叠
7. `Root.tsx` 注册两个新 composition
8. 验证：lint + typecheck 通过

## Scope OUT (Must NOT have)

1. ❌ 不引入 Three.js 或任何 WebGL 玻璃渲染
2. ❌ 不使用 GSAP（纯 interpolate）
3. ❌ 不修改已有组件（CardFlyUp / AnimatedCardScene / CardReveal 保持不动）
4. ❌ 不引入 npm 新依赖
5. ❌ 不做鼠标/触控交互（视频没有交互事件）
6. ❌ 不做粒子系统（那是 AnimatedCardScene 的职责）
7. ❌ 不做 Spotlight Deck 轮播（用户选的是层叠堆叠）
8. ❌ 不做 i18n 双语（视频场景不需要）

## Open questions

【已全部通过用户决策关闭】

- Q1 (组件结构) → 统一 GlassCard + variant prop
- Q2 (动画引擎) → 纯 Remotion interpolate
- Q3 (多卡布局) → 层叠堆叠（fan stack）
- Q4 (色彩倾向) → Neo surface

## Approval gate

status: awaiting-approval
