---
slug: composition-catalog
status: awaiting-approval
intent: clear
pending-action: write plan (done)
approach: "三层分类：1) catalogEntry 加 category 字段 2) Root.tsx 分区注释 3) animation-catalog.md 按类分组"
---

# Draft: composition-catalog

## Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | 6 个分类：typography / card / entrance / transition / vfx / character | 覆盖所有现有 composition，分类互斥、直觉易找 |
| D2 | category 用 string literal union，不引入 enum | 保持轻量，不增加 bundle，和现有 catalogEntry 风格一致 |
| D3 | catalogEntry 加在 WordReveal 上（它目前没有） | 保持一致性，所有 composition 都有 catalogEntry |
| D4 | CharReveal / SceneTransition 虽然不在 Root.tsx 但也加 category | 它们存在于代码库，有 catalogEntry，保持数据完整 |

## Category mapping

| Composition | Category | 说明 |
|---|---|---|
| TextIntro | typography | 字符弹性弹入 |
| TextScramble | typography | 乱码翻滚 |
| WordReveal | typography | 单词揭示 |
| MediaTitle | typography | 面板+字符滑入 |
| GlassTitleCard | typography | 玻璃标题卡 |
| CharReveal | typography | 字符 3D 翻转（standalone） |
| CardFlyUp | card | 卡片旋转升入 |
| AnimatedCardScene | card | 卡片+粒子 |
| GlassShowcaseStack | card | 玻璃卡层叠 |
| AnimeDrop | entrance | 爆破入场 |
| HeroReveal | entrance | 弹道+慢动作 |
| GridReveal | entrance | 网格波纹展开 |
| CurtainReveal | entrance | 帘幕 reveal |
| MovieScreen | transition | 百叶窗转场 |
| SceneTransition | transition | SVG 多边形转场（standalone） |
| LiquidGlass | vfx | 液体玻璃 |
| WaterOrb | vfx | 水球噪波 |
| ClawdDrop | character | Clawd 入场 |
| ClawdAction | character | Clawd 动作序列 |

## Scope

### Layer 1 — catalogEntry 新增 category 字段
- 18 个已有 catalogEntry + WordReveal 新增 catalogEntry
- 所有文件统一加 `category: 'xxx'`
- 创建 `src/catalog-types.ts` 定义 CompositionCategory 类型（供类型检查）

### Layer 2 — Root.tsx 分区注释
- 用 `// ========== [category name] ==========` 分割 Composition 组
- 同一个 category 的 composition 紧挨在一起

### Layer 3 — animation-catalog.md 重写
- 按 category 分组展示
- 重新生成（或手动重写）包含所有 composition

## Must NOT have
1. ❌ 不修改 catalogEntry 的 name/description/params 等现有字段
2. ❌ 不改变 composition 行为或渲染结果
3. ❌ 不移动组件文件位置
4. ❌ 不引入新依赖

## Approval gate
status: awaiting-approval
