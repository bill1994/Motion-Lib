---
slug: animedrop-jiggle-fix
status: awaiting-approval
intent: clear
pending-action: write .omo/plans/animedrop-jiggle-fix.md
approach: 将 AnimeDrop.tsx 阶段三的 spring 映射替换为阻尼正弦波，消除 FALL_END 边界的角度/形变跳变
---

# Draft: animedrop-jiggle-fix

## Components (topology ledger)
| id | outcome | status | evidence path |
|----|---------|--------|---------------|
| AnimeDrop.tsx | 替换阶段三晃动逻辑，删除 spring import | active | src/AnimeDrop.tsx:200-234 |

## Open assumptions (announced defaults)
| assumption | adopted default | rationale | reversible? |
|-----------|----------------|-----------|-------------|
| 阻尼正弦波参数 | frequency=12, decay=8 | 分析验证：频率12Hz≈原弹簧自然频率，decay=8使晃动在7-8帧完成，视觉上"克制有分量" | 是（props 参数可调） |

## Findings (cited - path:lines)
1. **断层根因确认** — `spring({frame:0})` 返回 0，`interpolate([0,1],[maxBounceAngle,0])` 将 0 映射为 +4°，导致 Frame 34→35 产生 ~6° 硬跳变 (src/AnimeDrop.tsx:200-219)
2. **弹簧实际过阻尼** — stiffness=250, damping=20, mass=0.3 → 阻尼比 ζ≈1.15 > 1，弹簧单调衰减不振荡，与注释描述的"往复晃动"矛盾 (src/AnimeDrop.tsx:204-208)
3. **阻尼正弦波 sin(0)=0** 数学级保证零跳变，且产生真实振荡 (src/AnimeDrop.tsx:200-234)
4. **decay=12 过于激进** — 有效晃动仅 4-5 帧，55 帧阶段三剩余 50 帧完全静止

## Decisions (with rationale)
1. **用阻尼正弦波替换 spring** — 根治断层，物理更真实，代码更简洁
2. **默认参数 frequency=12, decay=8** — 经逐帧仿真验证：峰值 ~1.7°（摆动最高点），7-8 帧衰减完毕，符合"克制晃动"设计意图
3. **maxBounceAngleRatio / maxSquashRatio 保持现有 props 接口** — 参数不改，外部兼容

## Scope IN
- 替换 `AnimeDrop.tsx` 阶段三逻辑（行 200-234）
- 删除不再使用的 `spring` import
- 更新阶段三注释文档
- 参数 frequency/decay 作为可选 props 暴露，便于微调

## Scope OUT (Must NOT have)
- 不修改阶段一（爆破入场）和阶段二（重力倒下）逻辑
- 不修改其他 composition（PhysicsDrop, OrbitalRelaunch 等）
- 不修改 props 接口的默认值命名和语义
- 不添加新的外部依赖
- 不做视觉风格变更，仅修复物理连续性

## Open questions
无 — 用户已确认方向

## Approval gate
status: awaiting-approval
<!-- 用户已确认方向，等待 plan 编写完成后的正式审批 -->
