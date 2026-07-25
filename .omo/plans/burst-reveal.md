# burst-reveal - Work Plan

## TL;DR (For humans)

**What you'll get:** 一个叫 BurstReveal 的 Remotion 动画组件 — 一个小方块先收缩抖动蓄力，然后"嘭"地爆开成一个圆形大框，内部的文字/内容再分批淡入。总共 2 秒，60fps，ProRes 4444 带透明通道。

**Why this approach:** 你用 GSAP 语法（back.out, power2.out, stagger）给的时序，正好 GSAP 做这种精细时间轴动画最顺手。项目本来就用了 GSAP，AGENTS.md 也强行规定了 GSAP 用法，没理由不用。

**What it will NOT do:**
- 不会改变已有的任何组件（HeroReveal 照常工作）
- 不会动 borderRadius/width/height 等触发布局的属性（只动 scale/position/opacity/rotation）
- 不会产生随种子不同的随机抖动（每次渲染都是确定性的）

**Effort:** Short
**Risk:** Low — 模式单一组件，已有 5 个 GSAP 组件可参考
**Decisions to sanity-check:** 使用了 `back.out(1.7)`（而不是 1.8）如果 CustomEase 插件不可用；clip-path 或 borderRadius 过渡是否满足你的视觉期望

Your next move: 批准后直接执行，或先跑高精度 review。

---

> TL;DR (machine): Short effort, Low risk. Deliverable: BurstReveal.tsx + Root.tsx registration, GSAP-powered, deterministic PRNG, 120 frames.

## Scope
### Must have
- `src/BurstReveal.tsx` — GSAP-based Remotion 组件，实现三段动画
  - Phase 1 (0-30f): Scale 1→0.55 squeeze + 高频抖动（position jitter + rotation jitter）
  - Phase 2 (30-66f): 爆发 expand 到 target size（scale 0.55→1, back.out(1.8)）+ 方形→圆形（clip-path 或 borderRadius via interpolate）
  - Phase 3 (66-120f): 内容 children stagger 淡入（opacity 0→1, y 20→0, scale 0.96→1, stagger 0.08s, power3.out）
- `catalogEntry` 导出，category: 'entrance'
- `src/Root.tsx` — 注册 `<Composition id="BurstReveal">`

### Must NOT have (guardrails, anti-slop, scope boundaries)
- **不得**通过 GSAP 动画化 borderRadius / clip-path / width / height / top / left — GSAP 只处理 x / y / scale / rotation / opacity
- **不得**使用 `Math.random()` — 所有随机抖动必须用 `hashString` + `mulberry32` 确定性 PRNG
- **不得**在 GSAP timeline 上使用 auto-play / `{ paused: false }`
- **不得**添加超出 Props 最小集合的参数（children / seed / squeezeDuration / burstDuration / revealDuration / size / color / jitterAmplitude / staggerSeconds）
- **不得**创建需要人工视觉验收的 QA 步骤 — 全部 agent-executable

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: tests-after + none（项目无测试框架）
- Evidence: .omo/evidence/task-<N>-burst-reveal.<ext>
- 关键验证点：
  - `npx remotion render BurstReveal out/burst-reveal-test.mov` — 渲染成功退出码 0
  - 两次同 seed 渲染 → 逐字节相同（确定性验证）
  - 不同 seed 渲染 → 文件不同（种子影响抖动）
  - `npm run lint` — 零 error
  - `npm run update-catalog` — catalog 包含 BurstReveal 条目

## Execution strategy
### Parallel execution waves
- Wave 1 (独立): Todo 1 — GSAP 依赖检查
- Wave 2 (核心): Todo 2 — BurstReveal.tsx 组件实现
- Wave 3 (串联): Todo 3 — Root.tsx 注册，依赖 Todo 2
- Wave 4 (验证): Todo 4 — QA 验证，依赖 Todo 3

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. GSAP check | — | — | — |
| 2. BurstReveal.tsx | — | 3 | 1 |
| 3. Root.tsx | 2 | 4 | — |
| 4. QA | 3 | — | — |

## Todos
> Implementation + Test = ONE todo. Never separate.
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->
- [ ] 1. **GSAP 依赖检查 + CustomEase 注册确认**
  What to do:
  - 检查 `npm list gsap` 确认 GSAP 已安装
  - 检查 `CustomEase` 插件是否在 `node_modules/gsap/CustomEase.js` 中存在
  - 如果未安装 `CustomEase`，它包含在 GSAP 核心包内（GSAP v3 会员插件；免费版不含 → 需要确认项目使用的是 GSAP 会员版还是免费版；如果免费版，将 `back.out(1.8)` 替换为 `"back.out(1.7)"` 因为 GSAP 免费版包含 back easing 但无 CustomEase）
  - 在 BurstReveal.tsx 顶部添加 `import { CustomEase } from "gsap/CustomEase"; gsap.registerPlugin(CustomEase);`
  - **关键**：GSAP 免费版包含 `back.out(1.7)` 等 back easing，但 `CustomEase` 插件是会员功能。如果无法注册 CustomEase，用 `back.out(1.7)` 作为备选
  Must NOT do: 不要安装额外 npm 包；只验证现有依赖
  Parallelization: Wave 1 | Blocked by: — | Blocks: —
  References:
  - AGENTS.md "GSAP & Remotion Integration Rules" section
  - `src/WordReveal.tsx` — 参考 GSAP CustomEase 注册模式
  - GSAP 文档: back.out easing 是 GSAP 核心的一部分，不需要额外插件
  Acceptance criteria:
  - `npm list gsap` 返回 gsap@3.12.x 或更高
  - 终端确认 CustomEase 可用或用 `back.out(1.7)` 替代
  QA scenarios:
  - Happy: `node -e "const gsap = require('gsap'); console.log(gsap.parseEase('back.out(1.7)'))"` → 返回函数
  - Failure: 如果 CustomEase 不可用，确保代码中 fallback 到 `back.out(1.7)`
  - Evidence: `.omo/evidence/task-1-burst-reveal.txt`
  Commit: N（脏活，与 Todo 2 合并）

- [ ] 2. **实现 `src/BurstReveal.tsx` — 组件骨架 + Phase Progression + Props**
  What to do:
  1. 创建 `src/BurstReveal.tsx`，按以下结构：
     - 顶部 import：React, useRef, useEffect, useCallback; remotion (useCurrentFrame, useVideoConfig, interpolate, Easing); gsap (含 CustomEase 注册)
     - `BurstRevealProps` 接口：
       ```ts
       interface BurstRevealProps {
         children?: React.ReactNode;
         /** 随机种子 */
         seed?: string;
         /** 蓄力阶段帧数 */
         squeezeDuration?: number;
         /** 爆发阶段帧数 */
         burstDuration?: number;
         /** 淡入阶段帧数 */
         revealDuration?: number;
         /** 初始物体尺寸 px */
         size?: number;
         /** 物体/容器背景色 */
         color?: string;
         /** 抖动幅度 px */
         jitterAmplitude?: number;
         /** 抖动旋转幅度 deg */
         jitterRotationAmplitude?: number;
         /** 交错淡入间隔秒 */
         staggerSeconds?: number;
         /** 最终 borderRadius（0=方形, 50=圆形） */
         targetBorderRadius?: number;
       }
       ```
     - `DEFAULTS` 配置对象（参考 HeroReveal.tsx:123-148 模式）
     - `computePhase()` 函数实现 Phase-Based Progression Model
     - 确定性 PRNG：`hashString` + `mulberry32`（直接 inline 在文件内，参考 HeroReveal.tsx:16-32）
     - `catalogEntry` 导出，category: 'entrance':
       ```ts
       export const catalogEntry = {
         name: 'BurstReveal',
         category: 'entrance',
         description: '物体高频收缩抖动 → 爆发圆形展开 → 内容交错淡入',
         params: { ... }
       };
       ```
  2. 组件渲染结构：
     ```tsx
     <div style={{ position: 'absolute', inset: 0, backgroundColor: 'transparent' }}>
       <div ref={containerRef} style={{
         position: 'absolute',
         left: '50%', top: '50%',
         transform: 'translate(-50%, -50%)',  // GSAP 操作 x/y 覆盖此项
         width: size, height: size,
         backgroundColor: color,
         borderRadius,                        // Remotion interpolate 驱动
         overflow: 'hidden',
         display: 'flex', alignItems: 'center', justifyContent: 'center',
       }}>
         <div ref={contentRef} style={{ opacity: 0 }}>
           {children ?? <span style={{ color: '#4E4D5C' }}>Burst Reveal</span>}
         </div>
       </div>
     </div>
     ```
  Must NOT do:
  - 不要用 GSAP 动画化 borderRadius
  - 不要用 Math.random()
  - 不要 auto-play timeline
  - 不要加超出 Props 接口的额外参数
  Parallelization: Wave 2 | Blocked by: — | Blocks: Todo 3
  References:
  - AGENTS.md "Animation Architecture Rules" — Phase-Based Progression Model
  - AGENTS.md "GSAP & Remotion Integration Rules" — paused timeline, seek(frame/fps), gsap.context
  - AGENTS.md "GPU-Accelerated Transforms" — 只动 x/y/scale/rotation/opacity
  - AGENTS.md "Design System" — #CBC0D3 / #1D1B20 / #4E4D5C
  - `src/HeroReveal.tsx` — 整体组件结构 + PRNG + config 模式
  - `src/WordReveal.tsx` — GSAP context + timeline + cleanup 模式
  Acceptance criteria:
  - 文件存在，无 TypeScript 编译错误
  - Props 接口只包含上述字段，不多不少
  - `computePhase(0, 60)` → `{ phase: 'squeeze', progress: 0 }`
  - `computePhase(30, 60)` → `{ phase: 'burst', progress: 0 }`
  - `computePhase(66, 60)` → `{ phase: 'reveal', progress: 0 }`
  - `computePhase(120, 60)` → `{ phase: 'reveal', progress: 1 }`
  QA scenarios:
  - Happy: `npx tsc --noEmit src/BurstReveal.tsx` → 零错误
  - Failure: `computePhase(-1, 60)` → clamp 到 squeeze phase
  - Evidence: `.omo/evidence/task-2-burst-reveal.tsx`
  Commit: N（与 Todo 3 合并）

- [ ] 3. **实现 `src/BurstReveal.tsx` — GSAP Timeline + 动画逻辑**
  What to do:
  在 Todo 2 的组件骨架中，填充 useEffect GSAP 逻辑：
  1. GSAP timeline 设置：
     ```tsx
     useEffect(() => {
       const ctx = gsap.context(() => {
         const tl = gsap.timeline({ paused: true });
         
         // Phase 1: Squeeze (0 → 0.2s)
         tl.to(containerRef.current, {
           scale: 0.55,
           duration: 0.2,
           ease: 'power2.out',
         }, 0);
         
         // Phase 1: Jitter (0.2s → 0.5s) — 8 cycles
         tl.to(containerRef.current, {
           x: `+=${cfg.jitterAmplitude}`,
           y: `-=${cfg.jitterAmplitude}`,
           rotation: cfg.jitterRotationAmplitude,
           duration: 0.035,
           repeat: 8,
           yoyo: true,
           ease: 'none',
         }, 0.2);
         
         // Phase 2: Burst (0.5s → 1.1s)
         tl.to(containerRef.current, {
           scale: 1,
           x: 0, y: 0, rotation: 0,
           duration: 0.6,
           ease: 'back.out(1.7)',  // 或 1.8 取决于 CustomEase
         }, 0.5);
         
         // Phase 3: Content stagger (1.1s → 2.0s)
         if (contentRef.current?.children?.length) {
           tl.fromTo(contentRef.current.children, {
             opacity: 0, y: 20, scale: 0.96,
           }, {
             opacity: 1, y: 0, scale: 1,
             duration: 0.6,
             stagger: cfg.staggerSeconds,
             ease: 'power3.out',
           }, 1.1);
         } else {
           // 单子元素或无子元素
           tl.fromTo(contentRef.current, {
             opacity: 0, y: 20, scale: 0.96,
           }, {
             opacity: 1, y: 0, scale: 1,
             duration: 0.6,
             ease: 'power3.out',
           }, 1.1);
         }
         
         tlRef.current = tl;
       }, containerRef);
       
       return () => {
         tlRef.current?.kill();
         tlRef.current = null;
         ctx.revert();
       };
     }, [cfg.seed]); // seed 变化重建
     ```
  2. 帧同步 seek：
     ```tsx
     useEffect(() => {
       if (tlRef.current) {
         tlRef.current.seek(frame / fps);
       }
     }, [frame, fps]);
     ```
  3. borderRadius 插值（Phase-Based Progression Model + Remotion interpolate）：
     ```tsx
     // 根据当前 phase 驱动 borderRadius
     let shapeProgress = 0;
     if (phase.phase === 'burst') {
       shapeProgress = phase.progress;
     } else if (phase.phase === 'reveal') {
       shapeProgress = 1;
     } // squeeze phase: shapeProgress = 0 (方形)
     
     const borderRadius = interpolate(
       shapeProgress,
       [0, 1],
       [0, cfg.targetBorderRadius ?? 50],
       {
         easing: Easing.bezier(0.22, 1, 0.36, 1), // 接近 back.out 感知
         extrapolateLeft: 'clamp',
         extrapolateRight: 'clamp',
       },
     );
     ```
  Must NOT do:
  - 不能有 `tl.play()` 或 `tl.progress()` — 只能用 `tl.seek(frame / fps)`
  - 不能有多余的 useEffect 依赖导致重复创建 timeline
  - 不能在 cleanup 外操作 tlRef.current
  Parallelization: Wave 2 | Blocked by: Todo 2（同文件，合并实现） | Blocks: Todo 3
  References:
  - AGENTS.md "GSAP & Remotion Integration Rules" — 三条必须规则
  - AGENTS.md "Phase-Based Progression Model" — computePhase 模式
  - AGENTS.md "Single-Frame Snapshot Principle" — 一个 useCurrentFrame() 驱动所有
  - AGENTS.md "The Ready Guard" — seek 前不检查 isActive
  - `src/WordReveal.tsx:51-101` — useGSAP / useEffect + timeline + seek + cleanup 完整模式
  Acceptance criteria:
  - 渲染任何帧时 tlRef.current?.seek() 被调用且不抛异常
  - 第 0 帧: container scale=1, x=0, y=0, rotation=0, borderRadius=0
  - 第 15 帧: container scale≈0.55, borderRadius=0
  - 第 30 帧: container scale=0.55, jitter 活跃, borderRadius=0
  - 第 48 帧: container scale>1 (back.out 过冲), borderRadius 过渡中
  - 第 66 帧: container scale=1, x=0, y=0, rotation=0, borderRadius=50%
  - 第 90 帧: 内容已淡入部分
  QA scenarios:
  - Happy: `npx remotion render BurstReveal out/burst-test.mov` → 退出码 0，文件生成
  - Deterministic: 两次 `--props='{"seed":"test"}'` → 文件 md5 相同
  - Failure: 不用 props 调用 → 使用 DEFAULTS 渲染成功
  - Evidence: `.omo/evidence/task-3-burst-reveal.txt`
  Commit: N（与 Root.tsx 注册合并）

- [ ] 4. **注册到 `src/Root.tsx` + catalog 更新**
  What to do:
  1. 在 `src/Root.tsx` 顶部添加 import：
     ```tsx
     import { BurstReveal } from "./BurstReveal";
     ```
  2. 在 `RemotionRoot` 组件内 entrance 区域添加 Composition（参考 Root.tsx:243-278）：
     ```tsx
     <Composition
       id="BurstReveal"
       component={BurstReveal as unknown as React.FC<Record<string, unknown>>}
       durationInFrames={120}
       fps={60}
       width={1920}
       height={1080}
       calculateMetadata={calculateMetadata}
     />
     ```
  3. 运行 `npm run lint` 确保零 error
  4. 运行 `npm run update-catalog`（如果有此命令，需确认）
  5. git add + commit（合并 Todo 2/3/4 为一个 commit）
  Must NOT do: 不修改其他 Composition，不影响现有组件
  Parallelization: Wave 3 | Blocked by: Todo 2/3 | Blocks: Todo 5
  References:
  - `src/Root.tsx:243-278` — entrance 类 Composition 注册模式
  - `src/Root.tsx:11-18` — calculateMetadata 定义
  Acceptance criteria:
  - 运行 `npm run lint` → 零 error，零 warning
  - Remotion Studio 中 `BurstReveal` 出现在 compositon 列表
  QA scenarios:
  - Happy: `npm run lint` 通过
  - Failure: `node -e "require('./src/Root.tsx')"` 不需要运行（TS 文件），用 tsc 检查
  - Evidence: `.omo/evidence/task-4-burst-reveal.txt`
  Commit: Y | feat(entrance): add BurstReveal — squeeze-shake-burst-reveal animation

- [ ] 5. **QA 验证**
  What to do:
  1. 运行 `npm run lint` — 确认零 error
  2. 渲染测试（三次）：
     ```bash
     # Test 1: 默认参数渲染
     npx remotion render BurstReveal out/burst-reveal-default.mov
     
     # Test 2: 自定义种子（抖动变体）
     npx remotion render BurstReveal out/burst-reveal-variant.mov --props='{"seed":"variant-B"}'
     
     # Test 3: 带 children 渲染
     npx remotion render BurstReveal out/burst-reveal-with-content.mov --props='{"size":400}'
     ```
  3. 确定性验证：
     ```bash
     md5sum out/burst-reveal-default.mov > /tmp/md5-1.txt
     npx remotion render BurstReveal out/burst-reveal-repeat.mov
     md5sum out/burst-reveal-repeat.mov > /tmp/md5-2.txt
     diff /tmp/md5-1.txt /tmp/md5-2.txt  # 应完全相同
     ```
  4. 验证 catalog 条目存在：
     ```bash
     # 检查 catalog 文件
     grep -r "BurstReveal" .omo/animation-catalog.md
     ```
  5. 将所有证据存入 `.omo/evidence/`
  Must NOT do:
  - 不用人工视觉验证
  - 不删除已有 `.mov` 文件
  Parallelization: Wave 4 | Blocked by: Todo 4 | Blocks: —
  References:
  - AGENTS.md "Commands" — render 命令模式
  - AGENTS.md "Render with seed variant" — `--props='{"seed":"..."}'`
  Acceptance criteria:
  - `npm run lint` → exit 0
  - 所有渲染命令 → exit 0
  - 两次同 seed 渲染 → md5 一致
  - catalog 含 BurstReveal 条目
  QA scenarios:
  - Happy: 所有检查通过
  - Failure: lint 有 error → fix 后重试
  - Evidence: `.omo/evidence/task-5-burst-reveal.txt`, `.omo/evidence/task-5-burst-reveal-md5.txt`
  Commit: N（验证不提交）

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [ ] F1. **Plan compliance audit** — 验证每个 todo 的 acceptance criteria 和 QA scenarios 是否全部通过
- [ ] F2. **Code quality review** — `npm run lint` + `npx tsc --noEmit` 零错误
- [ ] F3. **Deterministic render proof** — 两次 `seed=default` 渲染 md5 一致
- [ ] F4. **Scope fidelity** — 只新增了 BurstReveal 组件 + 注册，未改动其他文件

## Commit strategy
单一 commit:
```
feat(entrance): add BurstReveal — squeeze-shake-burst-reveal animation

Add GSAP-powered entrance composition: small square shrinks with high-freq
jitter (phase 1), bursts into circle with back.out overshoot (phase 2),
stagger-fades content (phase 3). Deterministic PRNG for repeatable renders.
```

## Success criteria
- [ ] `src/BurstReveal.tsx` — 组件包含完整三段动画，GSAP 规范完全遵循
- [ ] `src/Root.tsx` — Composition 注册，id="BurstReveal", 120 frames
- [ ] `npm run lint` — 零 error
- [ ] `npx remotion render BurstReveal out/burst-reveal-default.mov` — 成功
- [ ] 两次同 seed 渲染 → 逐字节相同（确定性）
- [ ] 不同 seed 渲染 → 文件不同（种子多样性）
- [ ] `.omo/animation-catalog.md` 含 `BurstReveal` 条目
