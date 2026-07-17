# ulw-plan draft — liquidglass-text-follow

## Intent
**CLEAR** — user specified three concrete behavioral improvements to the LiquidGlass component.

## Components (topology)
1. **文字跟随玻璃移动** (text-follow-glass) — Text textures must track glass panel positions synchronously during split, no sliding/drifting
2. **玻璃大小不被影响** (glass-size-preserved) — Both glasses remain 320×160 (confirmed)
3. **分裂后 y 轴弹跳** (split-bounce) — After reaching final split position, panels do 1-2 spring-damped oscillations on y-axis

## Metis findings (incorporated)

### Gap 1 — u_textPhase removed ❌
Metis confirmed the existing shader (lines 160-163) already cleanly separates t1/t2 via `merged` + `textBlend`. Adding a uniform would risk breaking the merged-phase appearance. **Dropped.**

### Gap 2 — Easing.back vs bounce interaction ✅ ADDRESSED
User confirmed drift is "text moves slower than glass". Root cause: during the split transition, `merged` smoothly goes from 1→0 while `textBlend = mix(smoothstep(d1-d2), 0.0, merged)`. When `merged` is in [0.3, 0.8], `textBlend` is between 0 and `smoothstep(d1-d2)`, causing t1/t2 crossfade that visually lags behind the panel movement. The `u_g1y`/`u_g2y` UVs ARE correct but the alpha blend between t1 and t2 creates a sliding illusion.

**Solution**: Replace the merged textBlend logic with a hard SDF-driven panel affiliation. Instead of blending t1/t2 by `smoothstep(d1-d2)` with a `merged` guard, assign text purely based on which SDF field is closer at each pixel. This eliminates the blended transition that causes drift.

### Gap 3 — Bounce amplitude vs merged threshold ✅ ADDRESSED
- g2y split distance from center = 230px. GLASS_H = 160px. Gap between panels = 230 - 160 = 70px.
- Bounce amplitude: max 8px (well below 70px safety margin). No risk of re-merging.
- g1y bounce: **not applied** — MAIN_OFFSET is only 30px, bounce would be disproportionate. Bounce on g2y only.

### Gap 4 — Timing budget ✅ ADDRESSED
- Split start: frame 90 (1.5s)
- g2y settles at frame 180 (1.5s duration from split start)
- Composition: 300 frames (5s)
- Bounce window: frames 180-220 (40 frames ≈ 0.67s) — 2 oscillations, decays to <1px by frame 215
- Settle window: frames 220-300 (80 frames ≈ 1.33s) — clean settled state before composition ends

### Gap 5 — Which panel bounces ✅ ADDRESSED
- g2y only. g1y not bounced.
- Reason: g1y moves only 30px; bounce would look disproportionate. g2y moves 230px.

### Gap 6 — Implementation method ✅ ADDRESSED
- Pure JS math + `interpolate`, consistent with existing pattern (file comment at line 245: "使用 interpolate 驱动玻璃位置 (代替 GSAP)")
- No GSAP introduced. No new dependencies.
- The damped sine is computed as a JS function of `(frame - splitEndFrame) / fps` and added to the final position.

### Gap 7 — GLASS size duplication
- Acknowledged but out of scope. Plan explicitly modifies nothing size-related.

## Decision ledger

| # | Question | Decision | Source |
|---|----------|----------|--------|
| 1 | text follow mechanism | No new uniform. Fix textBlend to eliminate t1/t2 blend drift. Use pure SDF affiliation. | User + Metis |
| 2 | bounce replaces or augments Easing.back? | **Replaces** — existing Easing.back(2.5) removed, replaced by damped sine | Metis gap 2 |
| 3 | Which panel(s) bounce | g2y only. g1y not bounced. | g1y moves only 30px |
| 4 | Bounce implementation | Pure JS math + interpolate. No GSAP. | Metis gap 6 |
| 5 | Bounce timing | frames 180-210, 2 oscillations, max amplitude 8px | Timing analysis |
| 6 | Glass size | Both remain 320×160 | User confirmed |

## Implementation approach

### Part A: Fix text drift
**What**: The `merged` guard in shader lines 160-162 causes t1/t2 alpha blending during split transition, creating a text "sliding" illusion. Change to deterministic SDF affiliation: for each pixel, show `t1` if `d1 < d2`, show `t2` otherwise. No blended cross-fade.

**Where**: `src/LiquidGlass.tsx` — GLSL fragment shader lines 160-163

**Current**:
```glsl
float h = max(GOOEY_K - abs(d1 - d2), 0.0) / GOOEY_K;
float merged = smoothstep(0.3, 0.8, h);
float textBlend = mix(smoothstep(-0.5, 0.5, d1 - d2), 0.0, merged);
vec4 textColor = mix(t1, t2, textBlend);
```

**New**:
```glsl
float textBlend = smoothstep(0.0, 0.0, d2 - d1);
vec4 textColor = mix(t1, t2, textBlend);
```

This assigns text purely based on which SDF is closer at the pixel. During the gooey merge phase (`smin`), the SDFs are already merged by the smin, so affiliation is still smooth. No blended cross-fade, no drift.

**Secondary fix**: Add a 0.5px guard band on `out1`/`out2` (line 154-155) to eliminate boundary aliasing:
```glsl
float out1 = step(-0.5, tUv1.x) * step(tUv1.x, 1.5) * ... 
```
No, this is wrong. Instead, leave the clip as-is but add a small slack to `smoothstep` on the SDF comparison. Actually, the simpler approach is to NOT clamp `tUv1`/`tUv2` to [0,1], so text outside the panel texture just samples edge pixels (which are transparent). Remove `clamp(tUv1, 0.0, 1.0)` → use raw UV. The `out1`/`out2` multiplier already gates text to the SDF boundary.

### Step B: Add damped sine bounce to g2y
**Change**: Replace `g2y` position calculation with a custom function that:
1. Uses original `interpolate` for the main split movement (without `Easing.back`)
1. After `splitEndFrame` (frame 180), adds a damped sine oscillation

**Implementation**:
```tsx
const SPLIT_END_FRAME = splitFrame + SUB_DURATION * fps; // frame 180
const BOUNCE_DURATION = 40; // frames (0.67s)
const BOUNCE_AMPLITUDE = 8; // pixels
const BOUNCE_DAMPING = 10;
const BOUNCE_FREQ = 14; // rad/s

function dampedBounce(t: number): number {
  if (t <= 0) return 0;
  return BOUNCE_AMPLITUDE * Math.exp(-BOUNCE_DAMPING * t) * Math.sin(BOUNCE_FREQ * t);
}

const g2yBase = frame < splitFrame
  ? height / 2
  : interpolate(frame, [splitFrame, SPLIT_END_FRAME], [height / 2, height / 2 + SUB_OFFSET], {
      easing: Easing.ease, // ← changed from Easing.back(2.5)
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

const bounceT = (frame - SPLIT_END_FRAME) / fps;
const g2y = g2yBase + dampedBounce(bounceT);
```

The `dampedBounce` function returns 0 for `t < 0` and for `t > BOUNCE_DURATION / fps` (through natural decay).

### Step C: Nothing — glass size already correct ✓

## Acceptance criteria
1. `npx remotion render LiquidGlass out/test.mov` exits 0 with no errors
2. Frames 0-89 (pre-split) are visually identical to current output
3. At frame 180, text "液态玻璃" is centered in the top glass panel (g1y region), text "液态玻璃 2" is centered in the bottom panel (g2y region)
4. During frames 90-180 split, no text drift/slide is visible — text stays fixed relative to its glass panel
5. At frame 210 (bounce decay threshold), g2y within 1px of its target (height/2 + SUB_OFFSET)
6. Both glass panels visually remain at 320×160 throughout

## Status
**awaiting-approval** — pending action: write `.omo/plans/liquidglass-text-follow.md`