# media-title - Work Plan

## TL;DR (For humans)

**What you'll get:** 一个叫 "MediaTitle" 的新 Remotion 动画组件，效果来自 matvoyce.tv 的 "wrapper-red" 大标题 — 青色背景从左向右刷开，同时 "media" 几个字母逐个从下方滑入，然后字母开始像液体一样微微变形（字重/宽度/倾斜循环波动）。

**Why this approach:** 入场动画用 GSAP（跟项目现有 TextIntro/CharReveal 同一个模式），字体的波动效果直接用帧号计算 sin 曲线——入场完成后自动启动，不需要额外库。

**What it will NOT do:** 不会一模一样像素级复制原网站（没有 F37Judge 字体，用 MapleMono 替代），不会影响其他 composition，不引入新依赖。

**Effort:** Short
**Risk:** Low — 完全遵循既有 pattern，只改两个文件
**Decisions to sanity-check:** 字体波动延迟到 frame 90 才启动（让入场先走完）

Your next move: **approve**（或要求先跑 high-accuracy review）

---

> TL;DR (machine): Short | Low — 新建 MediaTitle 组件 + 注册到 Root，用 GSAP 做入场 + useCurrentFrame 做字体 morphing

## Scope
### Must have
- 新建 `src/MediaTitle.tsx`，包含：
  - Cyan 背景从左向右 scaleX 展开（GSAP .fromTo）
  - 字符从 overflow:hidden 下方向上滑入（GSAP staggered）
  - 字体 font-variation-settings 随时间正弦波动（frame 驱动）
- 注册 `<Composition id="MediaTitle" />` 到 `src/Root.tsx`
- 遵循项目 color palette：文字 #1D1B20，背景透明
### Must NOT have (guardrails, anti-slop, scope boundaries)
- 不改动已有 composition
- 不引入新 npm 依赖
- 不做滚动驱动效果
- 不像素级克隆原站

## Verification strategy
- Test decision: none — 纯视觉 composition，使用 Remotion Studio 手动验证
- Evidence: .omo/evidence/media-title-Verified.txt

## Execution strategy
### Parallel execution waves
Wave 1: 两个文件可并行修改（独立文件）

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. MediaTitle.tsx | — | — | 2 |
| 2. Root.tsx 注册 | 1 | — | 1 |

## Todos

- [ ] 1. 创建 src/MediaTitle.tsx 组件
  What to do / Must NOT do:
  - 创建文件 `src/MediaTitle.tsx`，内容如下要点：
    - interface MediaTitleProps: text, children, bgColor, textColor, enableMorph, fontSizeVw
    - GSAP timeline { paused: true } 放在 gsap.context 内
    - 背景 div（ref: bgRef）做 scaleX 0→1 动画
    - 字符 span 数组（ref: charRefs）做 y 100%→0% + opacity 0→1 动画（staggered）
    - 每个字符通过 useCurrentFrame 计算 fontVariationSettings（wght, wdth, slnt 三轴 sin 波）
    - morphing 在 frame >= 90 才启动（入场动画大约 1.5s @60fps 完成）
    - 使用项目现有字体 MapleMono-NF-CN
    - 每个字符 willChange: "transform, font-variation-settings"
  - 必须 NOT 使用 repeat/yo-yo 的 GSAP 动画（因为 paused:true + seek 模式不支持循环）
  - 组件接收 children 作为副标题/额外内容
  References:
  - src/TextIntro.tsx — GSAP timeline + charRefs 模式
  - src/CharReveal.tsx — gsap.context + staggered fromTo
  - AGENTS.md — color palette, GSAP rules
  - CSS 分析结果 — wrapper-red 效果规格
  Parallelization: Wave 1 | Blocked by: — | Blocks: 2
  Acceptance criteria:
  - 文件存在，无 lint 错误（`npx eslint src/MediaTitle.tsx`）
  - TypeScript 编译通过（`npx tsc --noEmit` 无 MediaTitle 相关错误）
  QA: happy — 组件导出正常，Props 有默认值; failure — 空字符串 text 显示空，无 crash; lint/tsc 通过
  Commit: Y | feat: add MediaTitle composition with wrapper-red style entrance

- [ ] 2. 注册 MediaTitle 到 Root.tsx
  What to do / Must NOT do:
  - 在 `src/Root.tsx` 顶部 import { MediaTitle } from "./MediaTitle"
  - 在 `<RemotionRoot>` 内添加 `<Composition id="MediaTitle" component={MediaTitle} durationInFrames={180} fps={60} width={1920} height={1080} calculateMetadata={calculateMetadata} />`
  - 位置放在 CircleGlow 之后
  References:
  - src/Root.tsx:120-128 — CircleGlow 注册位置
  Parallelization: Wave 1（可与 todo 1 并行）
  Acceptance criteria:
  - `npx remotion studio` 启动后能看到 "MediaTitle" 在 composition 列表中
  - `npx tsc --noEmit` 通过
  QA: happy — import 无错误，composition 出现在列表; failure — 无
  Commit: Y | feat: register MediaTitle composition in Root.tsx

## Final verification wave
- [ ] F1. Plan compliance audit — 两个 todos 都完成，scope 内无遗漏
- [ ] F2. Code quality — `npx eslint src && npx tsc --noEmit` 通过
- [ ] F3. Real manual QA — 在 Remotion Studio 中打开 MediaTitle，确认以下效果：
      1. 青色背景从左向右刷入
      2. 字符从下方滑入（staggered）
      3. 约 1.5s 后字母开始波动
- [ ] F4. Scope fidelity — 未修改已有 composition，未引入新依赖

## Commit strategy
- 两个 TODO 合并为一个 commit: `feat: add MediaTitle composition with wrapper-red style entrance`
- 规避：暂不推送

## Success criteria
- [ ] MediaTitle.tsx 编译无错误
- [ ] Root.tsx 注册的 composition 完整
- [ ] Remotion Studio 中可见并可播放 MediaTitle
- [ ] 三个效果层均正常展示
