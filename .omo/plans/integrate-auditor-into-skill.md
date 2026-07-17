# Plan: Integrate Storyboard Audit Gate into video-storyboard-agent skill

## Goal
Add a mandatory post-generation quality gate to `/home/fanstic_b/.agents/skills/video-storyboard-agent/SKILL.md` that runs the `remotion-storyboard-auditor` checks before delivering any storyboard.

## Scope
- **Only** modify: `/home/fanstic_b/.agents/skills/video-storyboard-agent/SKILL.md`
- Do NOT touch any other files

## Changeset
Insert the following section between the `Remotion + GSAP 集成规则` section (ending at line 312 with `---`) and the `## 使用方式` section (line 314):

```markdown
## ⚡ 交付物质量门禁（MANDATORY）

在输出最终分镜表之前，必须执行以下自检。如果发现问题，**必须修复后再交付**，确保分镜表"AI 编码就绪"：

1. **帧数一致性检查（Tag A）** — 检查形如 `0:00–0:04 / 0–240f` 的时间戳与帧数在 60fps 下是否一致。如有偏差，优先调用 `fix_frames.py` 自动修复：
   ```bash
   python3 ~/.agents/skills/remotion-storyboard-auditor/scripts/fix_frames.py <故事板文件.md>
   ```
2. **random() 确定性检查（Tag G）** — 标记所有未使用固定 seed 的 `random()` 调用。
3. **模糊描述聚合（Tags I/J/K/L）** — 收集 "大气/科技感/震动/纹理" 等无具体起止参数的描述词，生成人工决策清单。
4. **缺失资产清单（Tag C）** — 列出需要外部提供的 SVG/插画/素材，形成 pre-production 采购清单。

> 此门禁确保分镜表交给代码生成工具时，帧数是精确的，参数是可编码的，随机性是确定性的。

---
```

## Verification
1. The section exists in the SKILL.md between the GSAP integration rules and 使用方式
2. No other content in SKILL.md was modified
3. The file still parses as valid markdown
