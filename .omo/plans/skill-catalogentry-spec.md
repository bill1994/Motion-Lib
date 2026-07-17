# skill-catalogentry-spec - 给 skill 加入 catalogEntry 规范

## TL;DR

在 `video-storyboard-agent` skill 中新增「🏗 动画组件规范（catalogEntry）」区域，定义可引用组件必须导出的元数据格式，以及项目初始化时要创建的脚本和 npm script。同时替换旧的「维护规则」为自动化 workflow。

## 改动内容

### 文件
`/home/fanstic_b/.agents/skills/video-storyboard-agent/SKILL.md`

### Region A: 新增「🏗 动画组件规范」区域
**位置**: 插入在「🎪 动画库引用系统」之前（line 58 之前），紧接在 ⚡ 节奏引擎 的 `---` 之后。

内容：
```
---

## 🏗 动画组件规范（catalogEntry）

任何可被本 Storyboard 引用的 Remotion Composition，**必须在源文件中导出一个 `catalogEntry` 对象**，作为自动生成组件目录的数据源。

### catalogEntry 格式

```ts
export const catalogEntry = {
  name: 'CharReveal',
  description: '字符从底部 3D 翻转显现（rotationX:90→0）',
  params: {
    text:        { type: 'string',  default: '"Hello"',  desc: '显示文字' },
    fontSize:    { type: 'number',  default: '48',       desc: '字号' },
    staggerMode: { type: 'enum',    default: 'sequential', values: ['sequential','random','center','edges'], desc: '散开模式' },
  },
};
```

| 字段 | 必需 | 说明 |
|------|------|------|
| `name` | ✅ | 与 Composition ID 完全一致 |
| `description` | ✅ | 一句话描述动画效果 |
| `params` | ✅ | 所有可通过 props 传入的参数 |
| `params.*.type` | ✅ | `string` / `number` / `boolean` / `enum` |
| `params.*.default` | ✅ | 默认值（字符串表示） |
| `params.*.desc` | ✅ | 参数作用说明 |
| `params.*.values` | 仅 enum | 可选值的数组 |

### 首次初始化工作

当在一个新项目中使用此 skill 时，执行以下步骤：

1. **创建生成脚本** `scripts/generate-catalog.ts`
   - 读取 `src/*.tsx` 中所有导出 `catalogEntry` 的文件
   - 按 name 排序输出为 `.omo/animation-catalog.md`
   - 格式：每个组件一条 h3 条目 + props 表格

2. **添加 npm script**
   在 `package.json` 的 `scripts` 中添加：
   ```json
   "update-catalog": "tsx scripts/generate-catalog.ts"
   ```

3. **运行生成**
   ```bash
   npm run update-catalog
   ```

### 后续维护

- **不要手写 `.omo/animation-catalog.md`**
- 修改组件或新建组件后，只需更新源码中的 `catalogEntry`
- 然后执行 `npm run update-catalog` 自动同步
- `.omo/animation-catalog.md` 应加入 `.gitignore` 或每次提交时重新生成
```

**注意**: 
- `catalogEntry` 的 TypeScript 定义不作强制，可以用 inline type，也可以导出一个共享类型
- `scripts/generate-catalog.ts` 脚本本身不需要作为严格的类型检查目标

### Region B: 替换旧的「维护规则」
**位置**: 当前 `### 维护规则`（line 117-119）

**删除**: 旧的 3 行维护规则

**替换为**:
```markdown
### 维护规则

> **不要手写 `.omo/animation-catalog.md`**
> 它由 `npm run update-catalog` 自动生成。
>
> 修改流程：
> 1. 编辑组件源码中的 `catalogEntry`
> 2. 运行 `npm run update-catalog`
> 3. 提交源码变更 + 新的 catalog 文件
```

### Region C: 更新自检项
**位置**: 当前第 6 条自检（line 165）

**旧**: `- [x] 参考效果引用有效 — 每个 `@组件名` 均可解析到 `.omo/animation-catalog.md` 中的条目`

**新**: 
```markdown
- [x] 参考效果引用有效 — 每个 `@组件名` 可解析到 `.omo/animation-catalog.md` 中的对应条目
- [x] catalog 非手写 — `.omo/animation-catalog.md` 由 `npm run update-catalog` 生成（如有`)
```

- [x] catalog 非手写 — `.omo/animation-catalog.md` 由 `npm run update-catalog` 生成

## Scope

- YES: 修改 skill 文件（3 处变化）
- NO: 不动项目代码
- NO: 不动 catalog 文件
- NO: 不生成 generate-catalog.ts 脚本

## Todo

- [ ] 编辑 SKILL.md — Region A: 在「🎪 动画库引用系统」前插入「🏗 动画组件规范」区域
- [ ] 编辑 SKILL.md — Region B: 替换旧维护规则为新 workflow
- [ ] 编辑 SKILL.md — Region C: 更新自检项（细化第 6 条 + 加第 7 条）
- [ ] 验证 3 处修改正确
