# skill-gsap-free-update — 移除 GSAP Club 付费说明

## TL;DR

GSAP 已全面免费（取消 Club 付费墙）。Skill 中两处 SplitText 付费说明需要移除。

## 改动

**文件**: `/home/fanstic_b/.agents/skills/video-storyboard-agent/SKILL.md`

### 1. Line 21
**旧**: `- **核心插件**：\`SplitText\`（用于文本逐字/逐词拆解 — ⚠️ 见下方付费说明）`
**新**: `- **核心插件**：\`SplitText\`（用于文本逐字/逐词拆解）`

### 2. Lines 23-24 (付费说明 blockquote)
**旧**:
```
> **💡 SplitText 付费说明**：SplitText 是 GSAP Club 会员付费插件。如项目无 Club 授权，可使用 `CharReveal` 手工 tokenize 拆字方案替代（逐字拆分为 `<span>`，效果等价）。
```

**新**:
```
> **💡 SplitText 说明**：SplitText 可用于文本逐字/逐词拆解动画。如果 Remotion 项目不希望引入 DOM 操作，也可使用 `CharReveal` 组件的手工 tokenize 拆字方案替代（逐字拆分为 `<span>`，效果等价）。
```

## Scope

- YES: 仅修改这 2 行
- NO: 不修改其他内容

## Verification

- 确认文件中不再出现 "Club" "付费" "paid" 等词
