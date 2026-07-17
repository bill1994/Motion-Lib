---
slug: pixel-sprite-animation
status: awaiting-approval
intent: clear
pending-action: write .omo/plans/pixel-sprite-animation.md
approach: React div-based PixelSprite 组件 + GSAP timeline 驱动的像素角色动画
---

# Draft: pixel-sprite-animation

## Components (topology ledger)
<!-- Lock the SHAPE before depth. One row per top-level component that can succeed or fail independently. -->
<!-- id | outcome (one line) | status: active|deferred | evidence path -->

| id | outcome | status | evidence path |
|----|---------|--------|---------------|
| A. PixelSprite 组件 | 像素精灵渲染引擎，接受 PixelSpriteDef + facial feature + frame → div 矩阵 | active | template.html, CLAWD_BODY pattern |
| B. GSAP 动画编排模板 | 基于 TextIntro 的 gsap.timeline({paused:true}) + seek 模式 | active | src/TextIntro.tsx:70-120 |
| C. 示例角色 (Clawd/小猫) | 用 PixelSprite + GSAP 做一段 3s 180帧 composition | active | 待定 |
| D. 工具函数 | getPhase, particle system, 缓动函数 | active | Clawd template.html easing functions |
| E. 文档/AGENTS.md | 记录像素角色创作规范 | deferred | -- |

## Open assumptions (announced defaults)
<!-- Record any default you adopt instead of asking, so the user can veto it at the gate. -->
<!-- assumption | adopted default | rationale | reversible? -->

| assumption | adopted default | rationale | reversible? |
|-----------|----------------|-----------|-------------|
| 像素网格每格大小 | 20×20 CSS px，逻辑网格 36×36（与 Clawd 一致） | 兼容现有 1920×1080 画面，角色尺寸约 14-20 宽 | 容易改 |
| 角色精灵格式 | 二维数组 + 调色板映射（同 Clawd 的 CLAWD_BODY） | 最简洁的精灵表示 | 容易改 |
| 表情系统 | anchor 偏移 + 像素覆盖（同 Clawd's EYES pattern） | 已验证可工作 | 容易改 |

## Findings (cited - path:lines)

### 项目已有动画模式

1. **GSAP timeline 模式**（src/TextIntro.tsx:70-120）：`gsap.timeline({paused: true})` → `tl.seek(frame / fps)` → `gsap.context(() => {...}, containerRef)`。用于多元素序列动画。

2. **Remotion native 模式**（src/AnimeDrop.tsx:64-302, src/PhysicsDrop.tsx:25-251）：直接用 `interpolate()` + `spring()` + `useCurrentFrame()` 计算每帧状态。用于物理轨迹动画。

3. **确定性 PRNG **（src/HeroReveal.tsx:16-32）：`hashString + mulberry32`，seed 参数保证跨机器渲染一致。

4. **GPU 加速约束**（AGENTS.md）：只允许 animate `x, y, scale, rotation, opacity`，禁止 `width/height/top/left`。

5. **所有 composition 统一规格**（src/Root.tsx:22-79）：1920×1080, 60fps, 180帧, ProRes 4444 alpha。

### Clawd Skill 萃取方法论

1. **像素网格系统**：36×36 逻辑网格，`px(gx,gy,color)` 绘像素，`image-rendering: pixelated`
2. **精灵即二维数组**：`CLAWD_BODY` 14×8，数字索引映射调色板
3. **阶段驱动**：`getPhase(t)` → phase name + phase progress `pt`，每个阶段独立缓动
4. **无嘴表情**：anchor 偏移眼睛 + bounce + 粒子 + 气泡，四维表达
5. **粒子系统**：`addParticle` + `tickParticles`，生命周期+速度+重力
6. **锚点系统**：anchors 定义角色关键点（眼/手/脚顶），供外部定位

## Decisions (with rationale)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| 示例角色 | Clawd（螃蟹） | 直接对照 Clawd 原始 template.html 验证引擎的正确性，减少变量 |
| 动画驱动 | GSAP timeline | TextIntro 已验证的 paused+seek 模式最灵活，适合角色动画的复杂编排 |
| 组件定位 | 独立 composition | 自包含、可独立渲染/预览，后续再抽离可复用接口 |

## Scope IN

- PixelSprite 基础渲染组件
- 示例角色定义 + 表情映射
- GSAP 驱动的一段 3s 像素角色动画
- 粒子系统
- 新 composition 注册到 Root.tsx

## Scope OUT (Must NOT have)

- Canvas 渲染（除非用户指定）
- 复杂的多角色场景
- 交互式动画（点击/拖拽）
- sprite sheet 预渲染流程
- AI 自动生成精灵（那是 AGENTS.md 的后续）

## Open questions

以下是要你决定的叉路：

### Q1: 第一个示例角色用什么？
- **A**: Clawd（复刻原作螃蟹，直接对比验证）
- **B**: 刚才的小猫（你的原创，继续完善）
- **C**: 你自己设计一个角色（告诉我描述，我生成）

### Q2: 像素动画用哪种驱动方式？
- **A**: GSAP timeline（复用 TextIntro 的 `paused+seek` 模式，适合复杂编排）
- **B**: Remotion native `interpolate/spring`（复用 AnimeDrop 模式，适合数学轨迹）
- **C**: 混合（GSAP 驱动整体位姿，组件内部用 frame 计算表情/粒子）

### Q3: 新组件是独立的 composition，还是可嵌入其他 composition 的通用组件？
- **A**: 独立 composition（像现有的 5 个一样，在 Root.tsx 注册）
- **B**: 可复用组件（可以被 AnimeDrop/PhysicsDrop 等现有 composition 的 children 使用）
- **C**: 两者都要

## Approval gate
status: momus-reviewed (fixes applied)
<!-- When exploration is exhausted and unknowns are answered, set status: awaiting-approval. -->
<!-- That durable record is the loop guard: on a later turn read it and resume at the gate instead of re-running exploration. -->
