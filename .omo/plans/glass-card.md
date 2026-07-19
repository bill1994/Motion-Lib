# glass-card - Work Plan

## TL;DR (For humans)

**What you'll get:** 两个新视频 composition——一个带霓虹玻璃质感的片头标题卡，和一个 4 张卡片像扇子一样层叠展开的产品展示卡。纯 CSS 玻璃效果（不依赖 Three.js），深色背景 + 电光 accent 点缀。

**Why this approach:** 用统一的 GlassCard 组件 + variant prop 避免重复写两套玻璃视觉层代码。动画用纯 Remotion interpolate（不用 GSAP），因为卡片动效就是简单的 transform 组合，interpolate 更轻量、确定性天然保证。

**What it will NOT do:** 不会有鼠标交互、不会有粒子爆发、不会动现有的 AnimatedCardScene/CardReveal 组件、不引入新 npm 包。

**Effort:** Medium
**Risk:** Low - 纯 CSS + Remotion API，无外部依赖，不碰已有代码
**Decision to sanity-check:** GlassTitleCard 默认 3 秒，GlassShowcaseStack 默认 4 秒（因为 4 卡 stagger）；色彩使用项目已有的 #CBC0D3 / #1D1B20 体系

Your next move: 审核 plan，approve 后 `$start-work` 执行。

---

> TL;DR (machine): Medium effort, Low risk. New GlassCard component (variant='title'|'showcase') + 2 composition wrappers + Root.tsx registration. Pure CSS glassmorphism + Remotion interpolate. ~7 todos.

## Scope

### Must have
1. `GlassCard` 组件——单张玻璃卡片，variant prop 控制入场动效
2. 玻璃视觉层：`backdrop-filter: blur()` 磨砂面、霓虹 rim glow、电光 accent rail、投影
3. `variant='title'` 入场：scale(0.6→1) + rotateX(-15°→0°) + glow 渐亮 → micro breathing → spring settle
4. `variant='showcase'` 入场：从画面中心层叠展开到扇面位置（translate + rotate），每卡 staggered 20 帧
5. `GlassTitleCard` composition：居中单卡 + 标题文字，3s（180帧）
6. `GlassShowcaseStack` composition：4 张卡片扇面层叠，4s（240帧）
7. `Root.tsx` 注册两个新 composition
8. 验证：`npm run lint` + `npx tsc --noEmit` 通过

### Must NOT have (guardrails, anti-slop, scope boundaries)
1. ❌ 不引入 Three.js 或 WebGL
2. ❌ 不使用 GSAP
3. ❌ 不修改 `CardFlyUp` / `AnimatedCardScene` / `CardReveal`
4. ❌ 不新增 npm 依赖
5. ❌ 不做鼠标/触控交互
6. ❌ 不做粒子系统
7. ❌ 不做轮播（用户指定的层叠堆叠）
8. ❌ 不做多语言 i18n
9. ❌ 每个文件不超过 250 行——如果超过必须拆分

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: tests-after（组件验证通过 lint + typecheck + studio 渲染检查）
- Evidence: `.omo/evidence/task-N-glass-card/`

## Execution strategy

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. types.ts | — | 2, 3, 4 | — |
| 2. animations.ts | 1 | 4 | 3 |
| 3. glassVisuals.ts | 1 | 4 | 2 |
| 4. GlassCard.tsx | 2, 3 | 5, 6 | — |
| 5. GlassTitleCard.tsx | 4 | 7 | 6 |
| 6. GlassShowcaseStack.tsx | 4 | 7 | 5 |
| 7. Root.tsx + verify | 5, 6 | — | — |

## Todos

- [ ] 1. `src/GlassCard/types.ts` — 类型定义
  What to do / Must NOT do:
  定义 GlassCardProps（variant, cardWidth/Height, borderRadius, rimColor, accentColor, glassOpacity, blurRadius, durationInFrames, delay, fanAngle, fanOffsetX/Y, textColor, children）+ GlassCardVariant 联合类型 + PhaseState 接口 + GlassVisualConfig 接口 + 各字段默认值常量 DEFAULTS。
  Must NOT: 不要引入 React 以外的类型依赖；不要超过 80 行。
  Parallelization: Wave 1 | Blocked by: — | Blocks: 2, 3, 4
  References: `src/AnimatedCardScene/types.ts`（项目类型模式参考）、`src/AnimatedCardScene/config.ts`（默认值模式参考）
  Acceptance criteria: `npx tsc --noEmit` 通过 types.ts 无错误
  QA scenarios: happy — 检查 tsc 输出无错误。Evidence `.omo/evidence/task-1-types/tsc-output.txt`
  Commit: N（先不 commit，等全部完成后统一）

- [ ] 2. `src/GlassCard/animations.ts` — 动画计算函数
  What to do / Must NOT do:
  实现：
  - `computePhase(frame, durationInFrames): { phase: 'enter'|'hold'|'settle', progress: number }` ——三段 phase 计算，enter [0, 0.35)、hold [0.35, 0.9)、settle [0.9, 1.0]
  - `getTitleAnimationState(frame, fps, config): PhaseState` ——返回 x/ y/ scale/ rotateX/ rotateY/ glowIntensity/ opacity/ translateY
    - Phase enter: `scale` interpolate(progress, [0,1], [0.6, 1]) ease out; `rotateX` interpolate(progress, [0,1], [-15, 0]) ease out; `opacity` interpolate(progress, [0, 0.2], [0, 1]); `glowIntensity` interpolate(progress, [0,1], [0.2, 1])
    - Phase hold: 正弦微呼吸 `translateY = 3*sin(2π * frame/120)`; `scale = 1 + 0.005*sin(2π * frame/100)`; `glowIntensity` 正弦脉冲
    - Phase settle: `spring({ frame: localF, fps, config: { stiffness: 200, damping: 15, mass: 0.5 } })` 驱动微幅 scale overshoot ±1% + rotateY overshoot ±0.5°
  - `getShowcaseAnimationState(frame, fps, config, delay): PhaseState` ——和 title 类似但增加 fan 位置插值：enter 阶段从 (center, center) → (fanOffsetX, fanOffsetY)；rotateY 从 0 → fanAngle
  - 每个函数返回 PhaseState { x, y, scale, rotateX, rotateY, glowIntensity, opacity }
  Must NOT: 不引用 GSAP；不包含视觉层样式代码；不依赖 React hooks（纯函数）。
  Parallelization: Wave 1 | Blocked by: 1 | Blocks: 4
  References: `src/CardFlyUp.tsx:96-153`（interpolate + spring 模式）、`src/AnimatedCardScene/CardReveal.tsx:22-118`（phase 计算模式）
  Acceptance criteria: `npx tsc --noEmit` 通过
  QA scenarios: happy — tsc 无错误。Evidence `.omo/evidence/task-2-animations/tsc-output.txt`
  Commit: N

- [ ] 3. `src/GlassCard/glassVisuals.ts` — 玻璃视觉层 style 生成器
  What to do / Must NOT do:
  纯函数集合，每个返回 React.CSSProperties：
  - `getGlassSurfaceStyle(config: GlassVisualConfig): CSSProperties` ——glass 背景: `rgba(255,255,255,config.glassOpacity)`; `backdropFilter: blur(${config.blurRadius}px)`; `border: 1px solid rgba(255,255,255,0.08)`; `borderRadius`
  - `getRimGlowStyle(config: GlassVisualConfig, intensity: number): CSSProperties` ——`boxShadow`: 0 0 ${10*intensity}px config.rimColor; 0 0 ${30*intensity}px config.rimColor; inset 0 1px 0 rgba(255,255,255,0.1)
  - `getAccentRailStyle(config: GlassVisualConfig): CSSProperties` ——`position: absolute; bottom: 0; left: 20%; right: 20%; height: 2px; background: linear-gradient(90deg, transparent, ${config.accentColor}, transparent)`
  - `getCardContainerStyle(state: PhaseState, config: GlassVisualConfig): CSSProperties` ——`position: absolute; left: ${state.x}; top: ${state.y}; width; height; borderRadius; transform: perspective(1000px) rotateX(${state.rotateX}deg) rotateY(${state.rotateY}deg) scale(${state.scale}); opacity: ${state.opacity}`
  - `getDefaultVisualConfig(variant: GlassCardVariant): GlassVisualConfig` ——title 版: rimColor `#CBC0D3`, accentColor `#CBC0D3`, glassOpacity 0.06, blurRadius 16; showcase 版: rimColor `#4E4D5C`, accentColor `#CBC0D3`, glassOpacity 0.04, blurRadius 12
  Must NOT: 不包含动画逻辑；不包含 JSX；每个函数不超过 30 行。
  Parallelization: Wave 1 | Blocked by: 1 | Blocks: 4
  References: 项目颜色体系 AGENTS.md（#CBC0D3 / #1D1B20 / #4E4D5C）；DepthFold 的 CSS glassmorphism 模式参考
  Acceptance criteria: `npx tsc --noEmit` 通过
  QA scenarios: happy — tsc 无错误。Evidence `.omo/evidence/task-3-visuals/tsc-output.txt`
  Commit: N

- [ ] 4. `src/GlassCard/GlassCard.tsx` — 主组件
  What to do / Must NOT do:
  实现 GlassCard React 组件：
  1. 接收 `GlassCardProps` + `children`
  2. 调用 `useCurrentFrame()` 和 `useVideoConfig()`
  3. 根据 `variant` 路由到对应的 animation state 函数（`getTitleAnimationState` 或 `getShowcaseAnimationState`）
  4. 调用 `getDefaultVisualConfig(variant)` 获取视觉配置
  5. 渲染：
     ```
     <div> // perspective container
       <div style={getCardContainerStyle(state, visualCfg)}> // 3D transform 容器
         {/* 玻璃表面 */}
         <div style={getGlassSurfaceStyle(visualCfg)}>
           {/* 内容 */}
           <div>{children}</div>
         </div>
         {/* rim glow 层 - pointer-events: none */}
         <div style={getRimGlowStyle(visualCfg, state.glowIntensity)} />
         {/* accent rail 层 - 底部亮条 */}
         <div style={getAccentRailStyle(visualCfg)} />
       </div>
     </div>
     ```
  6. `getCardContainerStyle` 返回的样式加入 `transformStyle: 'preserve-3d'`
  Must NOT: variant='showcase' 时不处理多卡布局（那是 `GlassShowcaseStack` 的职责）；不包含文字样式（由 children 自行控制）；绝对定位 left/top 基于 phase state 计算值。
  Parallelization: Wave 2 | Blocked by: 2, 3 | Blocks: 5, 6
  References: `src/AnimatedCardScene/CardReveal.tsx:122-144`（组件结构模式）、`src/CardFlyUp.tsx:158-233`（3D 容器模式）
  Acceptance criteria: `npx tsc --noEmit` 通过；组件在 studio 渲染无崩溃
  QA scenarios: happy — tsc 通过；failure — 缺少必填 variant prop 应有类型错误。Evidence `.omo/evidence/task-4-glasscard/`
  Commit: N

- [ ] 5. `src/GlassCard/GlassTitleCard.tsx` — 片头标题卡 composition
  What to do / Must NOT do:
  实现 180 帧 composition：
  ```
  export const GlassTitleCard: React.FC = () => {
    return (
      <GlassCard variant="title" cardWidth={800} cardHeight={400}>
        <div style={标题文字样式}>
          <h1 style={fontSize: 72px, fontWeight: 800, color: '#CBC0D3', ...}>
            DIMENSIONAL<br/>INTERFACE
          </h1>
          <p style={fontSize: 20px, color: '#4E4D5C', ...}>
            Glass · Neon · Depth
          </p>
        </div>
      </GlassCard>
    );
  };
  ```
  文字区域在卡片内居中。标题大字用 `#CBC0D3`（深色背景规则），副标题用 `#4E4D5C`。卡片相对 1920×1080 居中（left/top 计算：`(1920-800)/2` = 560, `(1080-400)/2` = 340）。
  导出 `catalogEntry`（参考其他组件的 catalogEntry 格式）。
  Must NOT: 不包含动画逻辑；不定义自己的 duration（用默认 180 帧）；不多于 80 行。
  Parallelization: Wave 2 | Blocked by: 4 | Blocks: 7
  References: `src/TextIntro.tsx:51-190`（composition 结构模式）、AGENTS.md 颜色体系
  Acceptance criteria: `npx tsc --noEmit` 通过
  QA scenarios: happy — tsc 通过。Evidence `.omo/evidence/task-5-titlecard/tsc-output.txt`
  Commit: N

- [ ] 6. `src/GlassCard/GlassShowcaseStack.tsx` — 层叠展示 composition
  What to do / Must NOT do:
  实现 240 帧 composition：
  1. 定义 4 张卡片的 fan 布局数据：
     ```
     const CARDS = [
       { label: "01", sub: "Signal",    fanAngle: -6, offsetX: -220, offsetY: -30 },
       { label: "02", sub: "Mesh",      fanAngle: -2, offsetX: -70,  offsetY: -70 },
       { label: "03", sub: "Vault",     fanAngle: 2,  offsetX: 70,   offsetY: -70 },
       { label: "04", sub: "Pulse",     fanAngle: 6,  offsetX: 220,  offsetY: -30 },
     ];
     ```
  2. 渲染 4 个 `<GlassCard variant="showcase" delay={i * 20} fanAngle=... fanOffsetX=... fanOffsetY=... cardWidth={260} cardHeight={340}>` 
  3. 每张卡片内容：编号大字 + 副标题文字
  4. 所有卡片以画面中心为基准做 fan 偏移，计算 left/top: 画面中心 + offsetX/Y - 卡片尺寸/2
  5. 整个 composition 容器绝对定位占满 1920×1080
  6. 导出 catalogEntry
  Must NOT: 不硬编码卡片绝对位置（用 center + offset 计算）；不定义粒子或其他装饰；不多于 100 行。
  Parallelization: Wave 2 | Blocked by: 4 | Blocks: 7
  References: DepthFold spotlight deck 的 4 面板布局模式（来自原 pen 的 card data）
  Acceptance criteria: `npx tsc --noEmit` 通过
  QA scenarios: happy — tsc 通过。Evidence `.omo/evidence/task-6-showcase/tsc-output.txt`
  Commit: N

- [ ] 7. `Root.tsx` 注册 + 最终验证
  What to do / Must NOT do:
  1. 在 `src/Root.tsx` 添加 import：
     ```
     import { GlassTitleCard } from "./GlassCard/GlassTitleCard";
     import { GlassShowcaseStack } from "./GlassCard/GlassShowcaseStack";
     ```
  2. 添加两个 Composition 条目（跟在 WordReveal 后面）：
     ```
     <Composition
       id="GlassTitleCard"
       component={GlassTitleCard as unknown as React.FC<Record<string, unknown>>}
       durationInFrames={180}
       fps={60}
       width={1920}
       height={1080}
       calculateMetadata={calculateMetadata}
     />
     <Composition
       id="GlassShowcaseStack"
       component={GlassShowcaseStack as unknown as React.FC<Record<string, unknown>>}
       durationInFrames={240}
       fps={60}
       width={1920}
       height={1080}
       calculateMetadata={calculateMetadata}
     />
     ```
  3. 运行 `npm run lint` 确认零错误
  4. 运行 `npx tsc --noEmit` 确认零错误
  5. 将所有 evidence 汇总到 `.omo/evidence/`
  6. 如果 lint 或 tsc 有错误，修复后重新验证直到通过
  Must NOT: 不修改其他 composition 的注册；不修改 `calculateMetadata` 函数。
  Parallelization: Wave 3 | Blocked by: 5, 6 | Blocks: —
  References: `src/Root.tsx:166-177`（WordReveal 注册模式）
  Acceptance criteria: `npm run lint` 通过 + `npx tsc --noEmit` 通过
  QA scenarios: happy — lint + tsc 双通过；failure — lint 有 error 时修复。Evidence `.omo/evidence/task-7-verify/`

## Final verification wave
- [ ] F1. Plan compliance audit — 所有入口文件存在、所有 todo 完成
- [ ] F2. Code quality review — lint + tsc 双通过
- [ ] F3. Scope fidelity — Must NOT have 列表逐条确认没有被违反
- [ ] F4. 文件行数审计 — 每个文件不超过 250 行

## Commit strategy
全部 7 个 todo 完成 + 验证通过后，一起 commit：
```
git add src/GlassCard/ src/Root.tsx
git commit -m "feat: add GlassCard component with title and showcase variants

- GlassCard component with variant='title'|'showcase'
- Neo surface glassmorphism + neon rim glow visuals
- GlassTitleCard composition (180f, centered title card)
- GlassShowcaseStack composition (240f, 4-card fan stack)
- Pure Remotion interpolate, no GSAP/Three.js deps
- Root.tsx registration"
```

## Success criteria
1. `npm run lint` → 零错误
2. `npx tsc --noEmit` → 零错误
3. GlassTitleCard 在 Remotion studio 可选中、渲染无崩溃
4. GlassShowcaseStack 在 Remotion studio 可选中、渲染无崩溃
5. 每个文件 ≤ 250 行
6. 所有 Must NOT have 条目未被违反
