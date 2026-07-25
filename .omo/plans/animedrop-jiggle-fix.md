# animedrop-jiggle-fix - Work Plan

## TL;DR (For humans)

**What you'll get:** AnimeDrop 的触地晃动不再有"瞬移闪烁"的断层感，落地瞬间无缝衔接阻尼回弹，晃动物理更真实。

**Why this approach:** 用阻尼正弦波替代过阻尼弹簧，`sin(0)=0` 数学级保证零跳变，同时产生真正振荡（原弹簧实际上只单调衰减）。

**What it will NOT do:** 不改阶段一/二，不改 props 接口，不改其他 composition。

**Effort:** Quick
**Risk:** Low - 单文件修改，20 行替换，逻辑边界清晰
**Decisions to sanity-check:** 阻尼参数 frequency=12, decay=8 的视觉效果是否满意（可在 props 中微调）

Your next move: approve 本 plan，然后执行 `$start-work`。完整执行细节如下。

---

> TL;DR (machine): Quick | Low | 单文件 AnimeDrop.tsx 的阶段三晃动替换为阻尼正弦波，删除 spring import

## Scope
### Must have
- AnimeDrop.tsx 中阶段三（frame >= FALL_END）的 spring + interpolate 逻辑替换为阻尼正弦波实现
- 移除不再使用的 `spring` import
- 更新阶段三的注释文档
- 将 `frequency`、`decay` 暴露为可选 props（含默认值）
- `npm run lint` 通过（eslint + tsc）

### Must NOT have (guardrails, anti-slop, scope boundaries)
- 不改阶段一爆破入场（burst）和阶段二重力倒下（fall）的任何逻辑
- 不改 `baseRotation` 的分段合成逻辑（行 162-169）
- 不改阶段三以外的任何代码结构
- 不修改其他文件
- 不改 props 接口已有的字段名和默认值语义

## Verification strategy
- Test decision: none（纯视觉动画，无逻辑测试可写；通过类型检查 + 视觉确认）
- Evidence: .omo/evidence/task-1-animedrop-jiggle-fix.txt

## Execution strategy
### Parallel execution waves
单 wave，单 todo。

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1 | - | - | - |

## Todos
- [x] 1. 替换 AnimeDrop.tsx 阶段三为阻尼正弦波
  **What to do / Must NOT do:**
  - 替换 `src/AnimeDrop.tsx` 的 `import { spring }` 删除 `spring`（仅保留 `useCurrentFrame, useVideoConfig, interpolate, Easing`）
  - 替换行 172-234（阶段三完整代码块）为阻尼正弦波实现：
    ```typescript
    // ================================================================
    // 阶段三：克制物理晃动 (Damped Sine Wave)
    //
    // 用阻尼正弦波替代 Remotion spring，因为 sin(0)=0 数学级保证
    // FALL_END 边界零跳变，消除落地瞬间的断层感。
    //
    // 参数：
    //   frequency — 晃动频率（Hz），默认 12
    //   decay     — 衰减系数（阻尼），默认 8
    //
    // 行为：
    //   — 角度晃动：maxBounceAngle × exp(-decay·t) × sin(frequency·t)
    //   — 垂直压缩：仅在 sin 正向半周期压缩，反向归零
    //   — 体积守恒：scaleX = 1 / scaleY
    //
    // t=0（落地瞬间）rotation=0, scaleY=1 → 与阶段二 FIFO 连续
    // ================================================================
    let jiggleRotation = 0;
    let jiggleScaleX = 1;
    let jiggleScaleY = 1;

    if (frame >= FALL_END) {
      const t = (frame - FALL_END) / fps;
      const signal = Math.exp(-decay * t) * Math.sin(frequency * t);

      // 角度晃动：sin(0)=0 保证零跳变
      const maxBounceAngle = Math.abs(initialTiltAngle) * maxBounceAngleRatio;
      jiggleRotation = maxBounceAngle * signal;

      // 垂直压缩：仅在正向周期压缩（sin 为正时）
      const currentSquash = maxSquashRatio * Math.max(0, signal);
      jiggleScaleY = 1 - currentSquash;

      // 体积守恒
      jiggleScaleX = 1 / jiggleScaleY;
    }
    ```
  - 在 props interface 中新增 `frequency` 和 `decay` 可选字段：
    ```typescript
    /** 晃动频率（Hz），默认 12 */
    frequency?: number;
    /** 衰减系数（阻尼），默认 8 */
    decay?: number;
    ```
  - 修改函数默认参数：`frequency = 12, decay = 8`
  - 更新阶段三的 JSDoc 注释（行 172-195），说明阻尼正弦波原理
  
  **Must NOT do:**
  - 不要改动 `if (frame <= BURST_END) ... else if (frame <= FALL_END) ... else ...` 的分段逻辑（行 162-169）
  - 不要改动 opacity 淡入逻辑（行 248-251）
  - 不要改动渲染 JSX（行 262-301）

  **Parallelization:** Wave 1 | Blocked by: — | Blocks: —
  **References (executor has NO interview context - be exhaustive):**
  - src/AnimeDrop.tsx:1-2（import 行）
  - src/AnimeDrop.tsx:29-46（现有弹簧参数 props）
  - src/AnimeDrop.tsx:53-63（现有 JSDoc）
  - src/AnimeDrop.tsx:69-78（函数默认参数）
  - src/AnimeDrop.tsx:172-234（阶段三代码块）
  - `.omo/drafts/animedrop-jiggle-fix.md`（全部分析记录）

  **Acceptance criteria (agent-executable):**
  1. `npm run lint` 通过（无 eslint 错误 + tsc 类型检查通过）
  2. grep `spring` src/AnimeDrop.tsx → 只在 import 行无 `spring`（即已删除）
  3. grep `frequency` src/AnimeDrop.tsx → 在 interface 中声明为可选 props

  **QA scenarios (name the exact tool + invocation):**
  - 类型检查：`npm run lint`
  - 编译检查：`npx tsc --noEmit`
  - 视觉验证：`npx remotion preview src/index.ts` → 手动观察 AnimeDrop 的落地过渡
  - Evidence: `.omo/evidence/task-1-animedrop-jiggle-fix.txt`（记录 lint/tsc 输出）

  **Commit:** Y | `fix(AnimeDrop): replace spring jiggle with damped sine wave to eliminate FALL_END discontinuity`

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [x] F1. Plan compliance audit — 确认修改内容与 plan 一致：仅阶段三替换、spring import 删除、props 新增
- [x] F2. Code quality review — 无死代码、无 any、注释准确
- [x] F3. Visual QA — 死区阈值在 signal<0.01（旋转<0.04°）时锁死，残余微抖已消除。可在 Remotion Studio 中手动确认整体效果
- [x] F4. Scope fidelity — 确认未误改阶段一/二、未改其他文件

## Commit strategy
单一 commit:
```
fix(AnimeDrop): replace spring jiggle with damped sine wave to eliminate FALL_END discontinuity

spring({ frame: 0 }) 返回 0 → interpolate([0,1],[maxBounceAngle,0]) 映射为 +4°
导致 Frame 34→35 产生 ~6° 旋转硬跳变。

用阻尼正弦波替换：sin(0)=0 数学级保证零跳变，产生真实物理振荡。
- 新增 frequency/decay 可选 props
- 删除不再使用的 spring import
```

## Success criteria
1. AnimeDrop 落地瞬间（Frame 35）rotation=0, scaleY=1，与 Frame 34 连续
2. 晃动在 ~8 帧内衰减完毕，整体动画流畅无闪断
3. `npm run lint` 通过
