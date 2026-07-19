# composition-catalog - Work Plan

## TL;DR (For humans)

**What you'll get:** motion-lib 的 20 个 composition 按「文字 / 卡片 / 入场 / 转场 / 特效 / 角色」六类分好。Root.tsx 里加了分区注释一眼能找到想用的组件，animation-catalog.md 按类分组展示，每个组件标注了自己的类别。

**Why this approach:** 三分层互不干扰——改 catalogEntry 是给代码加元数据，改 Root.tsx 是改善日常导航体验，改 catalog 是给人看的文档。每个层面改动都是独立的，风险极低。

**What it will NOT do:** 不改任何动画逻辑，不改组件行为，不改文件名和路径。

**Effort:** Short
**Risk:** Low — 纯元数据 + 注释 + 文档改动

Your next move: approve, then I dispatch execution.

---

> TL;DR (machine): Short, Low. 3 layers of categorization. ~20 file edits (add category field), 1 new type file, Root.tsx reorder+comments, catalog rewrite.

## Scope

### Must have
1. `src/catalog-types.ts` — 定义 `CompositionCategory` union type
2. 所有 18 个已有 `catalogEntry` 加 `category` 字段
3. `WordReveal.tsx` 新增 `catalogEntry`（含 category）
4. `Root.tsx` 按 category 分区 + 同 category 的 composition 对齐放置
5. `.omo/animation-catalog.md` 按 category 分组重写，包含全部 composition
6. 验证：`npm run lint` + `npx tsc --noEmit` 通过

### Must NOT have
1. ❌ 不改 catalogEntry 的 name/description/params
2. ❌ 不改任何动画行为或渲染结果
3. ❌ 不移动文件路径
4. ❌ 不引入新 npm 依赖
5. ❌ 不改 AGENTS.md 或其他配置文件

## Verification strategy
- Test decision: tests-after — lint + tsc + catalog 内容完整性检查
- Evidence: `.omo/evidence/task-1-catalog/`

## Dependency matrix
| Todo | Depends on | Blocks |
| --- | --- | --- |
| 1. catalog-types.ts | — | 2 |
| 2. 加 category 到 18 个 catalogEntry + WordReveal | 1 | 3, 4 |
| 3. Root.tsx 分区注释 | 2 | 5 |
| 4. animation-catalog.md 重写 | 2 | 5 |
| 5. 验证 lint + tsc | 3, 4 | — |

## Todos

- [ ] 1. `src/catalog-types.ts` — 定义 CompositionCategory 类型
  What to do / Must NOT do:
  创建文件 `/home/fanstic_b/video-product/motion-lib/src/catalog-types.ts`，内容：
  ```typescript
  export type CompositionCategory =
    | 'typography'
    | 'card'
    | 'entrance'
    | 'transition'
    | 'vfx'
    | 'character';
  ```
  同时定义一个 CatalogEntry 接口供后续类型检查使用（可选，不强制改用）：
  ```typescript
  export interface CatalogEntry {
    name: string;
    category: CompositionCategory;
    description: string;
    params?: Record<string, { type: string; default: string; desc: string }>;
  }
  ```
  Must NOT: 超过 30 行；引入任何外部依赖。
  Parallelization: Wave 1 | Blocked by: — | Blocks: 2
  Acceptance criteria: `npx tsc --noEmit` 通过
  QA: happy — tsc 无错误

- [ ] 2. 给 18 个 catalogEntry 加 category 字段 + WordReveal 新增 catalogEntry
  What to do / Must NOT do:
  对以下 18 个文件，在 catalogEntry 对象中添加 `category: 'xxx'` 字段（跟在 name 后面，加在 description 前面）：
  
  **typography (5):**
  - `src/TextIntro.tsx` — category: 'typography'
  - `src/TextScramble.tsx` — category: 'typography'
  - `src/WordReveal.tsx` — 新增完整的 catalogEntry（含 category: 'typography', name: 'WordReveal', description: '单词逐字从左至右展开揭示'）
  - `src/MediaTitle.tsx` — category: 'typography'
  - `src/GlassCard/GlassTitleCard.tsx` — category: 'typography'
  - `src/CharReveal.tsx` — category: 'typography'（standalone，不在 Root.tsx）
  
  **card (3):**
  - `src/CardFlyUp.tsx` — category: 'card'
  - `src/AnimatedCardScene/AnimatedCardScene.tsx` — category: 'card'
  - `src/GlassCard/GlassShowcaseStack.tsx` — category: 'card'
  
  **entrance (4):**
  - `src/AnimeDrop.tsx` — category: 'entrance'
  - `src/HeroReveal.tsx` — category: 'entrance'
  - `src/GridReveal.tsx` — category: 'entrance'
  - `src/CurtainReveal.tsx` — category: 'entrance'
  
  **transition (2):**
  - `src/MovieScreen.tsx` — category: 'transition'
  - `src/SceneTransition.tsx` — category: 'transition'（standalone）
  
  **vfx (2):**
  - `src/LiquidGlass.tsx` — category: 'vfx'
  - `src/WaterOrb.tsx` — category: 'vfx'
  
  **character (2):**
  - `src/ClawdDrop.tsx` — category: 'character'
  - `src/ClawdAction.tsx` — category: 'character'
  
  每个文件编辑方式：找到 `export const catalogEntry = {` 行，在 `name:` 后面加一行 `category: 'xxx',`。
  对于 WordReveal.tsx，在文件末尾（最后一个 `}` 之前或文件底部）新增完整的 catalogEntry 导出。
  
  Must NOT: 不改 catalogEntry 其他字段；不改组件逻辑；不改 import。
  Parallelization: Wave 2 | Blocked by: 1 | Blocks: 3, 4
  References: 各文件的 catalogEntry 位置（grep 已确认全部 18 个位置）
  Acceptance criteria: `npx tsc --noEmit` 通过
  QA: happy — tsc 无错误；failure — 任一文件漏改则 tsc 不会报错（string 类型），需人工 grep 确认所有 19 个（18+1）都有 category

- [ ] 3. Root.tsx 分区注释 + composition 重排
  What to do / Must NOT do:
  在 `/home/fanstic_b/video-product/motion-lib/src/Root.tsx` 中：
  1. 在 import 区域末尾加一个注释分隔
  2. 在 RemotionRoot 内部，用注释块将 composition 按 category 分组：
     ```
     // ================================================================
     // 🅰️ Typography — 文字动画
     // ================================================================
     <Composition id="TextIntro" ... />
     <Composition id="TextScramble" ... />
     <Composition id="WordReveal" ... />
     <Composition id="MediaTitle" ... />
     <Composition id="GlassTitleCard" ... />
     
     // ================================================================
     // 🃏 Card — 卡片动画
     // ================================================================
     <Composition id="CardFlyUp" ... />
     <Composition id="AnimatedCardScene" ... />
     <Composition id="GlassShowcaseStack" ... />
     
     // ================================================================
     // 🚀 Entrance — 入场展示
     // ================================================================
     <Composition id="AnimeDrop" ... />
     <Composition id="HeroReveal" ... />
     <Composition id="GridReveal" ... />
     <Composition id="CurtainReveal" ... />
     
     // ================================================================
     // 🔄 Transition — 场景转场
     // ================================================================
     <Composition id="MovieScreen" ... />
     
     // ================================================================
     // ✨ VFX — 视觉特效
     // ================================================================
     <Composition id="LiquidGlass" ... />
     <Composition id="WaterOrb" ... />
     
     // ================================================================
     // 🎭 Character — 角色动画
     // ================================================================
     <Composition id="ClawdDrop" ... />
     <Composition id="ClawdAction" ... />
     ```
  3. Composition 顺序按上表重排（只移 `<Composition>` 块的位置，不改内容）
  4. 注释中的 emoji 保留，增强视觉识别
  Must NOT: 不改任何 Composition 的 props 或组件引用；不改 calculateMetadata；不改 import 行（只加注释）。
  Parallelization: Wave 3 | Blocked by: 2 | Blocks: 5
  Acceptance criteria: `npm run lint` + `npx tsc --noEmit` 通过
  QA: happy — lint + tsc 双通过；failure — 顺序错误导致 props 不匹配？不，只移动块不改变内容不会引起错误

- [ ] 4. animation-catalog.md 按 category 分组重写
  What to do / Must NOT do:
  重写 `/home/fanstic_b/video-product/motion-lib/.omo/animation-catalog.md`，按 category 分组展示所有 composition：
  ```markdown
  # 🎪 动画组件目录
  
  > 按类别分组 · 共 N 个组件
  
  ## 🅰️ Typography — 文字动画
  
  ### TextIntro
  字符逐字弹性弹入（y:100%→0, back.out）
  | 参数 | ... |
  
  ### TextScramble
  ...
  
  ## 🃏 Card — 卡片动画
  
  ...
  ```
  包含所有有 catalogEntry 的 composition（19 个，含 CharReveal 和 SceneTransition）。
  Must NOT: 删除或修改已有组件的参数说明；不要生成不存在的参数。
  Parallelization: Wave 3 | Blocked by: 2 | Blocks: 5
  Acceptance criteria: catalog 文件格式正确、所有 composition 都有分类
  QA: happy — 手动检查每个 category 下 composition 数量正确

- [ ] 5. 最终验证
  What to do / Must NOT do:
  运行 `npm run lint` 和 `npx tsc --noEmit`，确保零错误。
  然后运行 `grep -c "category:" src/**/*.tsx src/**/**/*.tsx` 确认 category 字段数量 ≥ 19。
  Must NOT: 跳过任何 lint 或 tsc 错误
  Parallelization: Wave 4 | Blocked by: 3, 4 | Blocks: —
  QA: happy — lint + tsc 通过 + category count ≥ 19

## Final verification wave
- [ ] F1. `npm run lint` 零错误
- [ ] F2. `npx tsc --noEmit` 零错误
- [ ] F3. category 字段数 ≥ 19（覆盖所有 composition）
- [ ] F4. Root.tsx 6 个分区注释都存在

## Commit strategy
```
git add src/ src/GlassCard/ .omo/animation-catalog.md
git commit -m "chore: categorize compositions by type

- Add CompositionCategory type (typography/card/entrance/transition/vfx/character)
- Add category field to all catalogEntry exports (18 files + WordReveal new)
- Root.tsx grouped by category with section comments
- animation-catalog.md reorganized by category"
```
