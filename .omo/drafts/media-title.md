---
slug: media-title
status: drafting
intent: clear
pending-action: write .omo/plans/media-title.md
approach: 新建 MediaTitle.tsx 组件 + 注册到 Root.tsx
---

# Draft: media-title

## Components (topology ledger)
| id | outcome | status |
|---|---|---|
| MediaTitle.tsx | 新建组件，包含背景 swipe + 文字 line reveal + 字体 morphing | active |
| Root.tsx | 注册 MediaTitle 为 Composition | active |

## Open assumptions (announced defaults)
| assumption | adopted default | rationale | reversible? |
|---|---|---|---|
| 字体 morphing 用 fontVariationSettings 实现 | 使用 CSS fontVariationSettings + sin 波驱动 | 无需额外字体文件，与 Remotion 渲染兼容 | 是 |
| 背景色默认青色 #00d3ff | 网站 --red 实际是青色 | 与 matvoyce.tv 一致 | 是（通过 bgColor prop 可改） |
| GSAP 用于入场动画，morphing 用 frame 计算 | 入场用 GSAP pattern，morphing 用 useCurrentFrame | 遵循项目既有 GSAP 模式 + Remotion 帧驱动 | 是 |
| 持续时间保持 180 frames @60fps | 与其他 composition 一致 | 项目标准 | 是 |

## Findings (cited - path:lines)
- Root.tsx 已注册 11 个 Composition（src/Root.tsx:30-128）
- 既有 GSAP 使用模式：tl.paused + tl.seek(frame/fps) + gsap.context（src/TextIntro.tsx:70-111, src/CharReveal.tsx:123-182）
- TextIntro 使用 charRefs 逐个元素控制（src/TextIntro.tsx:60）
- 项目使用 MapleMono-NF-CN 字体 + transparent 背景（src/TextIntro.tsx:133-134）
- 项目的 color palette: #1D1B20 (text primary), #CBC0D3 (page primary)（AGENTS.md）
- GSAP v3.15.0 已安装（package.json:14）
- wrapper-red CSS: position:relative, 内含 "media" 超大文字（grep CSS output）
- 网站文字动效: SplitText chars/words/lines + font-variation-settings 过渡 + line masking overflow:hidden（CSS analysis）

## Decisions (with rationale)
1. 使用 GSAP 驱动入场（背景 scaleX + 字符 y 位移）— 遵循项目既有 pattern
2. 字符 morphing 用 useCurrentFrame + sin 波计算 — 因为 morphing 需要持续循环，不适合用 paused timeline 的 repeat
3. 组件名为 MediaTitle，id 为 "MediaTitle" — 与现有命名风格一致
4. 字体用 MapleMono-NF-CN（项目现有）— 不引入新字体依赖，fontVariationSettings 如果字体不支持会自动忽略
5. morphing 延迟到 frame 90 才开始 — 让入场动画完成后再启动，不互相干扰

## Scope IN
1. 新建 src/MediaTitle.tsx 组件
2. 注册到 src/Root.tsx
3. 三种效果：背景 swipe、line reveal、字体 morphing

## Scope OUT (Must NOT have)
1. 不修改已有 composition
2. 不引入新 npm 依赖
3. 不实现滚动驱动（Remotion 无滚动概念）
4. 不与网站完全像素级一致（是"复刻风格"而非"克隆"）

## Open questions
无 — 代码探索已充分，默认值已明确

## Approval gate
status: awaiting-approval
