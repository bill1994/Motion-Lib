# project-catalogentry-implementation — 在 remotion-hammer 项目实现 catalogEntry

## TL;DR (For humans)

给 14 个动画组件文件添加 `catalogEntry` 导出，写一个自动生成 `.omo/animation-catalog.md` 的脚本，加 npm script，跑一次生成，提交。

**工作量**: 中（14 个文件各加一段 + 一个脚本 + npm script）
**风险**: 低（纯添加，不改变现有逻辑）
**依赖**: Plan A（skill 已更新）——已完成

---

**TL;DR (machine)**: Medium | Low risk | 3 tasks: add catalogEntry to 14 files, write generate script, npm script + generate + commit

## Scope

### Must have
- 14 个 composition 文件加 `catalogEntry` 导出
- `scripts/generate-catalog.ts` 脚本
- `package.json` 加 `"update-catalog"` script
- 跑一次脚本，生成 `.omo/animation-catalog.md`
- 提交所有变更

### Must NOT have
- NO 修改现有动画逻辑
- NO 重构组件代码
- NO 改技能文件

## Verification strategy

- `npx tsc --noEmit` 通过（catalogEntry 是纯 const 对象，不影响类型检查）
- `npm run update-catalog` 成功运行
- 生成的 `.omo/animation-catalog.md` 包含全部 14 个组件
- `git diff --name-only` 列出所有预期文件

## Execution strategy

### 任务隔离
| Todo | 描述 | 依赖 |
|------|------|------|
| 1 | 读 14 个文件，加 catalogEntry | — |
| 2 | 写 scripts/generate-catalog.ts | — |
| 3 | 改 package.json + 跑脚本 + commit | 1, 2 |

Todo 1 和 2 可以并行。

---

## Todo

- [ ] 1. 给 14 个 composition 文件添加 `catalogEntry` 导出

  需要处理的文件：

  | 文件 | catalogEntry.name | 关键参数 |
  |------|-------------------|---------|
  | `src/AnimeDrop.tsx` | AnimeDrop | children, targetSize, initialTiltAngle, seed |
  | `src/PhysicsDrop.tsx` | PhysicsDrop | children, endX, endY, targetSize |
  | `src/OrbitalRelaunch.tsx` | OrbitalRelaunch | children, seed, gravity, bulletTimeScale |
  | `src/HeroReveal.tsx` | HeroReveal | children, seed, gravity, durationInFrames |
  | `src/TextIntro.tsx` | TextIntro | children, mainText, subText, fontSize, color |
  | `src/LiquidGlass.tsx` | LiquidGlass | (fixed effect) |
  | `src/WaterOrb.tsx` | WaterOrb | (fixed effect) |
  | `src/TextScramble.tsx` | TextScramble | text, fontSize, fontFamily |
  | `src/GridReveal.tsx` | GridReveal | cols, rows, title, subtitle |
  | `src/CurtainReveal.tsx` | CurtainReveal | direction, columnCount, backgroundColor |
  | `src/CircleGlow.tsx` | CircleGlow | text, glowColor, fontSize |
  | `src/MediaTitle.tsx` | MediaTitle | text, bgColor, textColor, fontSizeVw |
  | `src/CharReveal.tsx` | CharReveal | text, staggerMode |
  | `src/SceneTransition.tsx` | SceneTransition | (fixed effect) |

  具体说明：
  - 每个文件的 `catalogEntry` 放在文件**最末尾**（最后一个 `}`, `)` 或 `;` 之后）
  - 参数列表从组件的 Props 类型/函数签名中提取
  - 对于 `children?: ReactNode` 这种不需要在 storyboard 中引用的参数，**不列入** params
  - `description` 写中文一句话描述动画效果
  - 注意不要插入到组件函数或 return 语句内部——必须在**模块顶层**导出

  > 💡 如果文件末已有 `;` 或空行，直接在文件最后追加 `export const catalogEntry = ...` 即可。如果文件是单一 `export default` 函数或 `export const`，在最后一个顶层导出后面追加。

  这一步可以并行处理多个文件。用多个 task 或直接逐个 edit。

  建议工作流（推荐用 task 并行）：
  - 先读 `src/Root.tsx` 确认所有 composition 的 props（已有）
  - 对每个 .tsx 文件，读文件 → 写 edit → 追加 catalogEntry
  - 不需要修改 Root.tsx

  完成后验证：`grep -l "catalogEntry" src/*.tsx | wc -l` 应为 14

  References: `src/*.tsx` 文件

- [ ] 2. 创建 `scripts/generate-catalog.ts`

  脚本要求：
  - 读取 `src/*.tsx`，查找顶层 `export const catalogEntry` 声明
  - 用正则或 AST 解析提取 name, description, params
  - 按 name 排序
  - 输出到 `.omo/animation-catalog.md`
  - 输出格式：每个组件一个 `### name` 段落 + props 表格

  可用 `tsx scripts/generate-catalog.ts` 运行（因为这是一个非严格类型检查的脚本，不需要编译通过 `tsc`）

  一个参考实现思路（约 60-80 行）：
  ```ts
  import { readFileSync, writeFileSync, readdirSync } from 'fs';
  import { join } from 'path';

  // 扫描 src/*.tsx
  const files = readdirSync('src').filter(f => f.endsWith('.tsx') && f !== 'Root.tsx');
  
  const entries: Entry[] = [];
  for (const file of files) {
    const content = readFileSync(join('src', file), 'utf-8');
    // 用正则提取 catalogEntry
    const match = content.match(/export const catalogEntry\s*=\s*(\{[\s\S]*?\n\});/);
    if (!match) continue;
    // eval 或直接匹配提取 name, description, params
    // ... 
  }
  
  // 排序并生成 markdown
  // 写入 .omo/animation-catalog.md
  ```

  注意点：
  - 正则匹配 `export const catalogEntry = {` 到 `};` 之间的内容
  - 不依赖第三方库
  - `description` 直接取字符串字面量
  - `params` 对象遍历生成表格行

  References: `.omo/animation-catalog.md`（当前版本，可供参考输出格式）

- [ ] 3. 更新 package.json + 运行脚本 + 提交

  3a. 在 package.json scripts 中添加：
  ```json
  "update-catalog": "tsx scripts/generate-catalog.ts"
  ```

  3b. 运行：`npm run update-catalog`

  3c. 生成后检查 `.omo/animation-catalog.md` 是否包含 14 个条目

  3d. 检查 tsc：`npx tsc --noEmit` 应通过

  3e. 提交：
  ```
  git add src/ scripts/ package.json .omo/animation-catalog.md
  git commit -m "feat: add catalogEntry system with auto-generated animation catalog"
  ```

## Final verification wave

- [ ] F1. 所有 14 个 .tsx 文件都有 `export const catalogEntry`
- [ ] F2. `npm run update-catalog` 成功运行
- [ ] F3. `.omo/animation-catalog.md` 包含 14 个组件条目
- [ ] F4. `npx tsc --noEmit` 无错误
- [ ] F5. 只有预期文件被修改（git diff --name-only）

## Commit strategy

- 单一 commit: `feat: add catalogEntry system with auto-generated animation catalog`
