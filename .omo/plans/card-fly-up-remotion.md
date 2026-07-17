# card-fly-up-remotion - Work Plan

## TL;DR (For humans)

**What you'll get:** 一个 CardFlyUp Remotion 组件，复现 https://incredibles.dev 上卡片从下方旋转飞入的 3D 动效（perspective + rotateX + translateZ），注册到 motion-lib 的 Root.tsx 中可直接渲染预览。

**Why this approach:** 全部用 Remotion 原生 interpolate + spring 实现，不依赖 GSAP，保证无副作用确定性渲染。CSS 3D transform 模拟 GSAP 的 perspective + rotateX + z 效果。

**What it will NOT do:** 不实现卡片堆叠（多个卡片层叠缩放+遮罩）——只做一个单卡升入。不改动任何已有组件或库依赖。

**Effort:** Quick
**Risk:** Low — 纯新增组件，不修改现有逻辑
**Decisions to sanity-check:** 动画参数（duration, easing, perspective 值）是否匹配原始效果

Your next move: 等待两个 todo 执行完毕并验证。

---

> TL;DR (machine): Quick / Low — 一个新增 Remotion 组件 + 注册 + 验证

## Scope
### Must have
- 创建 `src/CardFlyUp.tsx`，复现核心动画
- 在 `src/Root.tsx` 注册 CardFlyUp composition
- 验证渲染帧正确

### Must NOT have (guardrails, anti-slop, scope boundaries)
- 不实现卡片堆叠逻辑
- 不修改已有组件
- 不安装新依赖
- 不加 CSS 文件

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: tests-after — remotion still 抓取中间帧验证 3D 姿态
- Evidence: .omo/evidence/task-2-cardflyup-still.png

## Execution strategy
### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. 创建 CardFlyUp.tsx | 无 | 2 | — |
| 2. 注册 Root.tsx + 验证 | 1 | — | — |

## Todos
- [x] 1. 创建 `src/CardFlyUp.tsx`
  What to do: 在 src/CardFlyUp.tsx 创建 CardFlyUp 组件，复现卡片从下方旋转升入动效
  Must NOT do: 不要堆叠逻辑、不要引入新依赖、不要 outside CSS
  Parallelization: Wave 1 | Blocked by: — | Blocks: 2
  References:
    - src/HeroReveal.tsx (组件风格参考)
    - Obsidian 动画参数: perspective=400, startY=vp*0.5+cardH, rotateX=90→0, z=750→0, ease=power2.inOut (bezier 0.45,0.05,0.55,0.95), transformOrigin=50%-20%
  Acceptance criteria: 文件存在，TypeScript 编译无告警
  QA scenarios: N/A（纯创建）
  Commit: N

- [x] 2. 注册 `Root.tsx` + 验证
  What to do: 在 Root.tsx import CardFlyUp，添加 Composition 注册，然后运行 `npx remotion still CardFlyUp --frame=60 --scale=0.25` 验证
  Must NOT do: 不要改动已有 Composition 条目
  Parallelization: Wave 1 | Blocked by: 1 | Blocks: —
  References:
    - src/Root.tsx (注册点)
    - src/CardFlyUp.tsx (被注册组件)
  Acceptance criteria: remotion still 成功退出，输出文件存在
  QA scenarios:
    - happy: `npx remotion still CardFlyUp --frame=60 --scale=0.25 2>&1`
    - failure: 删除 CardFlyUp.tsx 后应有编译错误
  Evidence: .omo/evidence/task-2-cardflyup-still.png
  Commit: N

## Final verification wave
- [x] F1. Plan compliance audit — 全部 todo 完成，scope 无越界（无堆叠逻辑、无新依赖、无 CSS 文件）
- [x] F2. 多帧验证 — frame=0,30,60,90 全部渲染成功
- [x] F3. 组件审查 — 所有数值常量集中在文件顶部（PERSPECTIVE, START_TRANSLATE_Z, START_ROTATE_X 等），无内联魔法数字

## Commit strategy
不提交——组件库开发，积累后统一处理。

## Success criteria
- CardFlyUp.tsx 在 remotion still 下可渲染中间帧
- 帧 0 处卡片不可见（视口下方 + rotateX=90°）
- 帧 60 处卡片在半空呈 ~45° 旋转
- 帧 120 处卡片直立居中
