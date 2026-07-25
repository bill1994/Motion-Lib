# BurstReveal — Draft

## Intent
CLEAR — 用户指定了完整动画时序：蓄力收缩+高频抖动(0-30帧) → 爆发弹开+弹性回弹(30-66帧) → 内容错峰淡入(66-120帧)

## Approach
GSAP timeline 实现 burst reveal 入场动画，遵循项目 AGENTS.md 的 GSAP 规范：
- `gsap.timeline({ paused: true })`
- `tl.seek(frame / fps)`
- `gsap.context(() => { ... }, containerRef)`

## Topology
1. `src/BurstReveal.tsx` — 核心组件
2. `src/Root.tsx` — 注册 Composition
3. GSAP 依赖检查 (CustomEase plugin)

## Decisions
- Engine: GSAP ✅ (用户确认)
- 组件名: BurstReveal, category: entrance
- 总帧数: 120 (60fps → 2s), 因为用户给的三段时间加起来正好 120 帧。
- Demo: 小方块(初始~80×80) → 缩放抖动 → 爆发成圆形(用 clip-path 或 borderRadius) → 文字内容淡入
- borderRadius 过渡用 Remotion `interpolate()` 驱动，不通过 GSAP 动画化（符合 Metis 建议）

## Metis Findings Incorporated

### Critical Fixes
- 🟢 H1: borderRadius → 用 Remotion interpolate 驱动，不用 GSAP。GSAP 只动 x/y/scale/rotation/opacity
- 🟢 H2: 抖动用 djb2+mulberry32 确定性 PRNG（HeroReveal.tsx:16-32 模式）
- 🟢 H3: 收缩(scale 0.55) → 爆发(scale→1 + back.out 过冲) 在帧 30 处切换，时序连续
- 🟢 H4: 小方块默认 80×80, bg `#CBC0D3`, 内含 children 区域
- 🟢 H5: 120 帧是用户指定的三段式，明确即可

### Medium Fixes
- 🟡 M1: `computePhase()` 函数实现 Phase-Based Progression Model
- 🟡 M2: 抖动参数化为 props: `jitterAmplitude`, `jitterFrequency`, `jitterRotation`
- 🟡 M3: `import { CustomEase } from "gsap/CustomEase"; gsap.registerPlugin(CustomEase);`
- 🟡 M4: category = 'entrance', 中文描述
- 🟡 M5: 默认配色遵循 #CBC0D3 / #1D1B20 / #4E4D5C

### Low Fixes
- 🔵 L1: Props 锁定最小集合（children, seed, squeezeDuration, burstDuration, revealDuration, size, color）
- 🔵 L2: staggerSeconds 默认 0.08s
- 🔵 L3: useEffect 清理中 tlRef.current?.kill() + ctx.revert()
- 🔵 L4: catalogEntry description 用中文
- 🔵 L5: QA 步骤含 catalog 验证

## Components Ledger
| id | outcome | status | evidence |
|----|---------|--------|----------|
| BurstReveal.tsx | GSAP动画组件 | resolved | HeroReveal.tsx 模式 + GSAP规范(AGENTS.md) |
| Root.tsx注册 | 新增Composition | resolved | Root.tsx:243-278 已有9个entrance类 |
| GSAP依赖 | gsap + CustomEase | resolved | 5个组件在用，需确认CustomEase |

## Status
awaiting-approval → approved ✅
pending-action: write .omo/plans/burst-reveal.md
