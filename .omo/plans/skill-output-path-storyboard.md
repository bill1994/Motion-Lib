# skill-output-path-storyboard — 修改 skill 输出路径指令

## TL;DR

在 `video-storyboard-agent` skill 的「📤 输出数据格式」节首添加一段说明，指导 agent 将生成的 storyboard 写入 `storyboard/storyboard.md`，而不是 `.omo/` 目录。

改动量：3 行 markdown，1 处编辑。

## 改动内容

**文件**: `/home/fanstic_b/.agents/skills/video-storyboard-agent/SKILL.md`

**位置**: 第 134 行 `## 📤 输出数据格式（严格遵循 Markdown 表格）` 下方

**插入内容**（放在「你必须严格输出以下四个部分：」之前）：
```markdown
> **输出路径**：在当前项目的根目录下创建 `storyboard/` 目录，将生成的完整 Storyboard 保存为 `storyboard/storyboard.md`。不要写入 `.omo/` 目录。
```

## Scope

- YES: 仅添加上述 3 行到 skill 文件
- NO: 不修改任何其他内容
- NO: 不生成 storyboard 本身

## 验证

- 确认 `## 📤 输出数据格式` 节首已有输出路径说明
- 确认原有 4 个部分内容未被意外修改

## Todo

- [ ] 编辑 `.agents/skills/video-storyboard-agent/SKILL.md`：在 `## 📤 输出数据格式` 下添加输出路径说明
