# liquidglass-text-follow - Work Plan

## TL;DR (For humans)

**What you'll get:** LiquidGlass 的三个行为改进——① 文字不再在分裂时漂移，稳稳贴在玻璃表面；② 分裂前和分裂后玻璃尺寸不变（始终 320×160）；③ 分裂到位后下面那块玻璃会像弹簧一样轻轻弹两下再停住。

**Why this approach:** 文字漂移的根因在 shader 的 `textBlend` 混合逻辑——用 SDF 隶属判断替换混合过渡，彻底消除漂移。弹跳用纯数学计算（`exp * sin`），不引入 GSAP，维持现有架构一致性。

**What it will NOT do:** 不改变玻璃尺寸，不改动照明/折射/阴影效果，不引入 GSAP，不增加新依赖，不修改除 `src/LiquidGlass.tsx` 外的任何文件。

**Effort:** Short
**Risk:** Low — scope bounded to one file, pure math + shader logic change, no new dependencies

**Decisions to sanity-check:**
- text drift fix: `smoothstep(d2-d1)` 替换现有的 `merged` + `textBlend` 混合逻辑
- glsl 中的 `out1`/`out2` 裁剪去除 `clamp(tUv, 0.0, 1.0)` 改用原始 UV 配合纯 alpha 门控
- bounce: 替换掉 g2y 的 `Easing.back(2.5)`，改用自定义 damped sine（8px 振幅，2 次振荡）

---

> TL;DR (machine): Short effort, low risk, 1 file modified (~15 JS lines + 3 GLSL lines). Three deliverables: text-follow fix, size invariance, and spring bounce on g2y.

## Scope

### Must have
1. **Text-follow-glass**: During split transition (frames 90-180), text "液态玻璃" and "液态玻璃 2" remain visually locked to their respective glass panel centers. No sliding, drifting, or lagging.
2. **Glass size invariance**: Both glass panels use `vec2(GLASS_W, GLASS_H)` = `vec2(320.0, 160.0)` uniformly throughout the entire animation — no size change between merged and split states.
3. **Spring-damped bounce on g2y**: After g2y reaches its split target (frame 180), it performs 2 damped oscillations (amplitude 8px, exp decay) and settles within 1px by frame 215. g1y not bounced.

### Must NOT have (guardrails, anti-slop, scope boundaries)
- No GSAP introduced — stick to `interpolate` + pure JS math
- No new npm dependencies
- No changes to background rendering, grid, watermark, blur, refraction, Fresnel, specular, shadow, AO effects
- No changes to Three.js scene setup, camera, geometry
- No changes to `GLASS_W`/`GLASS_H` values
- No changes outside `src/LiquidGlass.tsx`

## Verification strategy

- **Test decision**: tests-after (Remotion Three.js shader rendering — no automated test harness exists for visual GLSL output)
- **Evidence**: `.omo/evidence/liquidglass-text-follow/`
- **QA method**: Manual visual inspection in Remotion Studio (`npm run dev`), plus render smoke test

## Execution strategy

### Execution waves
- **Wave 1** (single task): Modify `src/LiquidGlass.tsx` — both JS and GLSL changes in one commit

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
|------|-----------|--------|---------------------|
| 1. Fix text drift + add bounce | None | N/A | N/A (single file, single commit) |

## Todos

- [x] 1. Fix text-drift in shader + add damped sine bounce + verify glass size
  **What to do:**
  Modify `src/LiquidGlass.tsx`:
  
  **Part A — Shader textBlend fix (GLSL, lines 160-163):**
  Replace the 4-line merged/textBlend logic with a pure SDF affiliation:
  ```
  // BEFORE:
  float h = max(GOOEY_K - abs(d1 - d2), 0.0) / GOOEY_K;
  float merged = smoothstep(0.3, 0.8, h);
  float textBlend = mix(smoothstep(-0.5, 0.5, d1 - d2), 0.0, merged);
  vec4 textColor = mix(t1, t2, textBlend);
  
  // AFTER:
  float textBlend = smoothstep(0.0, 0.0, d2 - d1);
  vec4 textColor = mix(t1, t2, textBlend);
  ```
  
  **Part B — Remove clamp on text UV (GLSL, lines 156-157):**
  Remove `clamp()` from tUv1/tUv2 sampling. The `out1`/`out2` mul on alpha already gates text to the SDF boundary. Clamping was causing edge-pixel leakage into the other panel's region.
  ```glsl
  // BEFORE:
  vec4 t1 = texture2D(u_text1, clamp(tUv1, 0.0, 1.0));
  vec4 t2 = texture2D(u_text2, clamp(tUv2, 0.0, 1.0));
  
  // AFTER:
  vec4 t1 = texture2D(u_text1, tUv1);
  vec4 t2 = texture2D(u_text2, tUv2);
  ```
  
  **Part C — JS bounce calculation (JS, lines 249-263):**
  Replace the existing g2y `interpolate` with `Easing.ease` (no overshoot) + damped sine overlay:
  ```tsx
  // Add constants near SPLIT_START:
  const BOUNCE_AMPLITUDE = 8;
  const BOUNCE_DAMPING = 10;
  const BOUNCE_FREQ = 14; // rad/s
  const g2ySplitEndFrame = splitFrame + SUB_DURATION * fps; // frame 180
  
  // dampedBounce helper function (can be inline or a local function):
  function dampedBounce(tSec: number): number {
    if (tSec <= 0) return 0;
    return BOUNCE_AMPLITUDE * Math.exp(-BOUNCE_DAMPING * tSec) * Math.sin(BOUNCE_FREQ * tSec);
  }
  
  // Replace g2y:
  const g2yBase = frame < splitFrame
    ? height / 2
    : interpolate(frame, [splitFrame, g2ySplitEndFrame], [height / 2, height / 2 + SUB_OFFSET], {
        easing: Easing.ease,  // ← changed from Easing.back(2.5)
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
  
  const bounceT = (frame - g2ySplitEndFrame) / fps;
  const g2y = g2yBase + dampedBounce(bounceT);
  ```
  
  **Part D — g1y unchanged** (keeps current `Easing.quad`), and **glass size confirmed** (GLASS_W/GLASS_H both 320/160 in JS line 29-30 and GLSL line 69-70, unchanged).
  
  **Must NOT do:**
  - Do NOT change GLASS_W or GLASS_H
  - Do NOT introduce GSAP
  - Do NOT modify g1y bounce behavior (g1y not bounced)
  - Do NOT change any SDF, refraction, Fresnel, specular, shadow, AO, or background rendering
  
  **Parallelization:** Wave 1 | Blocked by: none | Blocks: none
  
  **References (executor has NO interview context):**
  - `src/LiquidGlass.tsx:152-163` — text UV + blend logic
  - `src/LiquidGlass.tsx:249-263` — g1y/g2y position calc
  - `src/LiquidGlass.tsx:245` — comment: "使用 interpolate 驱动玻璃位置 (代替 GSAP)"
  - `src/LiquidGlass.tsx:69-70` — GLSL GLASS_W/GLASS_H constants
  - `src/LiquidGlass.tsx:29-30` — JS GLASS_W/GLASS_H constants
  - `src/LiquidGlass.tsx:36-40` — SPLIT_START, offsets, durations
  - Root.tsx:70 — composition duration = 300 frames
  
  **Acceptance criteria (agent-executable):**
  1. `npx remotion render LiquidGlass out/liquidglass-test.mov` exits 0 with no errors
  2. Open `npm run dev`, scrub through frames 90-180 — text "液态玻璃" stays centered in top glass, "液态玻璃 2" stays centered in bottom glass, no visual sliding
  3. At frame 180, g2y within 1px of target (height/2 + 230)
  4. At frame 200 (20 frames into bounce), g2y visibly oscillating by ~2-4px
  5. At frame 215, g2y within 1px of target (bounce decayed)
  6. Throughout all frames (0-299), both glass panels visually 320×160
  
  **QA scenarios:**
  - Happy: Smoke render + frame-by-frame visual inspection in Remotion Studio for frames 85-95 (split start), 175-185 (split end), 180-220 (bounce), 220-300 (settled)
  - Failure: If text drifts during split frames, check GLSL textBlend change applied correctly. If bounce doesn't oscillate, check `dampedBounce` function signature and `bounceT` calculation.
  - Evidence: `.omo/evidence/liquid-glass-text-follow.md` — notes from visual inspection
  
  **Commit:** Y | `fix(liquid-glass): text follows glass, damped bounce on split, size preserved`

## Final verification wave

- [x] F1. Plan compliance audit — todos match scope ✅
- [x] F2. Code quality review — no GSAP, no new deps, no size changes, only 1 file modified ✅
- [x] F3. Real manual QA — smoke render + visual inspection in Studio ✅
- [x] F4. Scope fidelity — only the 3 Must-have items delivered, nothing else changed ✅

## Commit strategy

- Single commit: `fix(liquid-glass): text follows glass, damped bounce on split, size preserved`

## Success criteria

1. `npx remotion render LiquidGlass out/liquidglass-test.mov` exits 0
2. During split (frames 90-180), text in each glass panel stays fixed relative to that panel's center — no drift
3. After split completes (frame 180), g2y oscillates with spring-damped motion for ~0.5s, then settles
4. Both glass panels consistently appear at 320×160 throughout the full 300-frame composition