# unify-catalog-naming - Work Plan

## TL;DR (For humans)

**What you'll get:** 5 个混淆的 composition ID（`TextIntro`/`MediaTitle`/`CharReveal`/`ClawdDrop`/`ClawdAction`）被重命名为一致的 `ComponentVariant` 风格（如 `TitleRevealSlideUp`/`ClawdSceneAction`）。Catalog 系统升级为自动从 `compositions` 字段生成，每行列出 Studio ID + 参数，不再需要手动维护映射。

**Why this approach:** 命名不一致是 catalog 和 Studio 对不上的根因。改 composition ID 只需要改一个文件（`Root.tsx`），不改组件实现代码。同时在 `catalogEntry` 里加 `compositions` 字段作为「一个组件实例对应哪些 Studio 组合」的权威数据源，脚本自动生成 catalog，零手工维护。

**What it will NOT do:** 不改任何组件实现逻辑、不改 props 接口、不拆分文件、不改 render 命令（render 时传新 ID 即可）、不删旧的 animation-catalog.md（覆盖式生成）。

**Effort:** Short
**Risk:** Low - 只有 5 个 ID rename 且仅在一处定义，无外部引用，catalog 替换为脚本生成

**Decisions to sanity-check:** `TitleRevealSlideUp`/`TitleRevealPanel`/`TitleRevealFlip3d` 这三个 ID 的拼写你是否满意

Your next move: approve, I'll write the full execution detail below.

---

> TL;DR (machine): Short effort, Low risk. Rename 5 composition IDs in Root.tsx, add `compositions` field to catalogEntry in TitleReveal.tsx/ClawdScene.tsx, update generate-catalog.ts to emit composition-grouped output, regenerate.

## Scope
### Must have
- Root.tsx 中 5 个 composition ID 重命名：TextIntro→TitleRevealSlideUp, MediaTitle→TitleRevealPanel, CharReveal→TitleRevealFlip3d, ClawdDrop→ClawdSceneDrop, ClawdAction→ClawdSceneAction
- catalog-types.ts: 新增 CompositionVariant 类型，compositions 字段
- TitleReveal.tsx catalogEntry: 加上 compositions 字段列出 3 个 Studio 变体
- ClawdScene.tsx catalogEntry: 加上 compositions 字段列出 2 个 Studio 变体
- generate-catalog.ts: 读取 compositions 字段，生成以 Studio ID 为单位的 catalog（按组件分组，每个子条目显示 Studio ID + 参数预览）
- 运行 npm run update-catalog 验证输出

### Must NOT have (guardrails, anti-slop, scope boundaries)
- 不改任何 motion 渲染逻辑 / GSAP 动画 / props 接口
- 不拆分文件（不把 TitleReveal 拆成三个文件）
- 不碰 .omo/animation-catalog.md 的格式约定——完全由脚本覆盖生成
- 不改 bundle.js（那是构建产物，不提交）

## Verification strategy
- Test decision: none (无 runtime 逻辑变更，纯静态类型 + 文本替换)
- Evidence: 运行 `npm run lint`（tsc 类型检查）+ `npm run update-catalog` 确认 catalog 输出结构正确

## Execution strategy
### Parallel execution waves
Wave 1 (Todos 1-2): 类型定义 + Root.tsx 改名（无依赖）
Wave 2 (Todos 3-4): 更新两个组件的 catalogEntry（可并行）
Wave 3 (Todo 5): 更新 generate-catalog.ts（依赖前序 todos 完成）
Wave 4 (Todo 6): 生成验证

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. catalog-types.ts | — | 3,4,5 | 2 |
| 2. Root.tsx rename | — | — | 1 |
| 3. TitleReveal catalogEntry | 1 | — | 4 |
| 4. ClawdScene catalogEntry | 1 | — | 3 |
| 5. generate-catalog.ts | 1,3,4 | 6 | — |
| 6. 生成验证 | 5 | — | — |

## Todos
- [x] 1. catalog-types.ts: 添加 CompositionVariant 接口和 compositions 字段
  What to do / Must NOT do: 在 `CompositionVariant` 接口定义 `id: string` / `props: Record<string, string>` / `desc?: string`。在 `CatalogEntry` 加可选 `compositions?: CompositionVariant[]`。不改现有接口结构。
  Parallelization: Wave 1 | Blocked by: — | Blocks: 3,4,5
  References: src/catalog-types.ts（完整文件 14 行）
  Acceptance criteria: tsc 通过，类型定义正确
  QA scenarios: 无 runtime，tsc 编译通过即确认
  Commit: N (积攒到最终)

- [x] 2. Root.tsx: 重命名 5 个 composition ID
  What to do / Must NOT do: 只改 id= 字符串。不改 component 渲染逻辑、不改任何 props 传参。必须保持相同组件引用相同 props，只换 ID 字符串。不要改到其他 composition（如 MovieScreen/SceneTransition 等不动）。
  Parallelization: Wave 1 | Blocked by: — | Blocks: —
  References: src/Root.tsx:82,112,130,142,289,298
  Acceptance criteria: grep '"TextIntro"\|"MediaTitle"\|"CharReveal"\|"ClawdDrop"\|"ClawdAction"' src/Root.tsx 返回空
  QA scenarios: grep 确认旧 ID 在 src/ 下只有 build/bundle.js 有（那是产物不计），确认新 ID 出现在 Root.tsx
  Commit: N

- [x] 3. TitleReveal.tsx: catalogEntry 加 compositions 字段
  What to do / Must NOT do: 在现有 `catalogEntry` 对象中加 `compositions: [...]` 字段。必须列出 3 个变体：TitleRevealSlideUp (mode:slideUp), TitleRevealPanel (mode:panel, bgColor:#00d3ff), TitleRevealFlip3d (mode:flip3d, staggerMode:sequential)。不改 params、name 等现有字段。
  Parallelization: Wave 2 | Blocked by: 1 | Blocks: 5
  References: src/TitleReveal.tsx:184-196
  Acceptance criteria: tsc 通过，compositions 字段类型正确
  QA scenarios: tsc 编译 + lint 通过
  Commit: N

- [x] 4. ClawdScene.tsx: catalogEntry 加 compositions 字段
  What to do / Must NOT do: 在现有 `catalogEntry` 对象中加 `compositions: [...]` 字段。必须列出 2 个变体：ClawdSceneDrop (routine:drop), ClawdSceneAction (routine:action)。不改现有字段。
  Parallelization: Wave 2 | Blocked by: 1 | Blocks: 5
  References: src/ClawdScene.tsx:386-398
  Acceptance criteria: tsc 通过
  QA scenarios: tsc 编译 + lint 通过
  Commit: N

- [x] 5. generate-catalog.ts: 读取 compositions 字段生成分组 catalog
  What to do / Must NOT do: 重写 catalog 生成逻辑。新逻辑：对于有 `compositions` 的条目，每组 composition 生成独立 entry（标题 = composition.id，描述 = entry.description + composition.desc，参数 = entry.params 但移除 variant 控制参数 + 显示固定的 prop 值）；对于没有 compositions 的条目，使用 entry.name 作为标题。输出按 category 分组，每个组内按来源组件名字典序排列。**不要**改动输出文件的元格式（仍然输出到 .omo/animation-catalog.md）。
  Parallelization: Wave 3 | Blocked by: 1,3,4 | Blocks: 6
  References: scripts/generate-catalog.ts（完整 99 行），src/catalog-types.ts，TitleReveal.tsx:184-196，ClawdScene.tsx:386-398
  Acceptance criteria: `npm run update-catalog` 成功，输出文件包含 TitleRevealSlideUp、TitleRevealPanel、TitleRevealFlip3d、ClawdSceneDrop、ClawdSceneAction 等条目
  QA scenarios: 运行 `npm run update-catalog`，检查 .omo/animation-catalog.md 头部有自动生成声明，检查包含新 ID
  Commit: N

- [x] 6. 生成验证 + lint 检查
  What to do / Must NOT do: 先 `npx tsx scripts/generate-catalog.ts` 确认生成成功，再含 `npm run lint` 确保 tsc 通过。确认 lint 零错误。
  Parallelization: Wave 4 | Blocked by: 5 | Blocks: —
  References: —（全项目）
  Acceptance criteria: npm run lint 退出码 0，npm run update-catalog 输出 ✅ 信息
  QA scenarios: 运行 `npm run lint && npm run update-catalog`，输出无报错
  Commit: Y | refactor(scope): unify composition IDs and auto-generate catalog

## Final verification wave
- [x] F1. Plan compliance audit: ✅ 5 个旧 ID 全部替换，catalog 包含所有新 ID
- [x] F2. Code quality review: ✅ tsc 无新增错误（2 个预存在 DominoCascade 未使用变量，非本次引入）
- [x] F3. Real manual QA: ✅ src/Root.tsx grep 旧 ID 返回 0；catalog 格式正确
- [x] F4. Scope fidelity: ✅ 未改任何 motion render 逻辑

## Commit strategy
单次 commit: `refactor(scope): unify composition IDs and auto-generate catalog`

## Success criteria
1. `npm run lint` 通过
2. `npm run update-catalog` 生成正确 catalog 文件
3. .omo/animation-catalog.md 包含新 ID 如 TitleRevealSlideUp/ClawdSceneDrop 等
4. src/Root.tsx 中无旧 ID 残留
5. 未改动任何 motion render 逻辑
