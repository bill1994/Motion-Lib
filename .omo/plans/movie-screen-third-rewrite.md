# Plan: MovieScreen 第三版 — beforeContent clipPath 转场重写

## TL;DR (For humans)

重写 `src/MovieScreen.tsx`，新增 `beforeContent` prop，实现"before 内容全屏 → 居中电影屏幕幕布打开 → after 内容全屏"的完整转场。不支持 `beforeContent` 时保持向后兼容。核心手法：`clip-path: polygon(evenodd, ...)` 在 before 内容上挖出屏幕区域孔洞，露出下方的幕布列 + after 内容。

## Files

| File | Action |
|------|--------|
| `src/MovieScreen.tsx` | Rewrite — add `beforeContent` prop + clipPath hole approach |
| `src/Root.tsx` | No change needed (already registered) |

## Implementation Steps

### Step 1: Rewrite `src/MovieScreen.tsx` ✅

**Goal**: Complete file rewrite with the clipPath-based architecture.

**Architecture (when `beforeContent` is provided)**:

| Layer | Z-index | Content | Role |
|-------|---------|---------|------|
| Layer 1 | z=0 | `children` (after content) | Full screen, always rendered |
| Layer 2 | z=5 | Screen container + curtain columns | Centered, scaled, with dark curtainColor columns |
| Layer 3 | z=10 | `beforeContent` | Full screen with clipPath hole |

**How clipPath hole works**:

Use `clip-path: polygon(evenodd, outerCW, innerCCW)` to punch a rectangular hole in Layer 3 that reveals Layers 1+2 underneath. The hole:
- Starts collapsed at center (zero area) → beforeContent fully visible
- Grows synchronously with the screen zoom to match the visual screen rect
- Uses `evenodd` fill rule so the counter-clockwise inner polygon creates a transparent hole

**Timeline constants**:

| Constant | Value | Meaning |
|----------|-------|---------|
| `CURTAIN_APPEAR` | 12 | Frame when curtain becomes visible |
| `ZOOM_END` | 30 | Screen scale reaches 1.0 |
| `PHASE1_END` | 67 (= 12 + 55) | Columns finish sliding open |
| `PHASE2_END` | 102 (= 67 + 35) | Columns fully faded out |
| `FADE_OUT_END` | 132 | Before content fully faded out |

**Phase breakdown**:

```
Frame 0-12   HOLD:     beforeContent covers full screen, no curtain visible
Frame 12-30  ZOOM-IN:  screen scales 0.65→1.0, clipPath hole grows from center
Frame 12-67  PHASE 1:  curtain columns slide open (staggered outward)
Frame 67-102 PHASE 2:  columns stretch + fade out
Frame 102-132 FADE-OUT: beforeContent fades out, revealing full after content
```

**Variables to compute per frame**:

```
screenScale = interpolate([0, ZOOM_END], [screenInitialScale, 1.0])

visualSW = sw * screenScale
visualSH = sh * screenScale
visualLeft = centerX - visualSW/2
visualTop  = centerY - visualSH/2
visualRight = centerX + visualSW/2
visualBottom = centerY + visualSH/2

revealProgress = interpolate([CURTAIN_APPEAR, ZOOM_END], [0, 1])

holeLeft   = interpolate(revealProgress, [0,1], [centerX, visualLeft])
holeTop    = interpolate(revealProgress, [0,1], [centerY, visualTop])
holeRight  = interpolate(revealProgress, [0,1], [centerX, visualRight])
holeBottom = interpolate(revealProgress, [0,1], [centerY, visualBottom])
```

**clipPath polygon string**:
```
polygon(evenodd,
  0% 0%, 100% 0%, 100% 100%, 0% 100%,
  holeLeft%  holeTop%,
  holeLeft%  holeBottom%,
  holeRight% holeBottom%,
  holeRight% holeTop%
)
```

(Coordinates as percentage of `width`/`height`.)

**Code structure**:
- Extract column-building logic into `buildColumns()` helper function (shared between both paths)
- If `beforeContent` is falsy: render the old backward-compatible path (full dark bg, centered screen, curtain reveals children)
- If `beforeContent` is truthy: render the new 3-layer clipPath path

**Props interface** — add `beforeContent?: React.ReactNode` to `MovieScreenProps`

**Existing constants to re-use**:

| Constant | Value | Notes |
|----------|-------|-------|
| `STAGGER_INTERVAL` | 2 | Per-column stagger frames |
| `MAX_SLIDE_PCT` | 35 | Max column slide offset (%) |
| `COL_GAP_RATIO` | 0.03 | Column gap in Phase 1 |
| `STRETCH_FACTOR` | 2 | Column stretch in Phase 2 |
| `CURVE_HEIGHT_PCT` | 12 | Curved mask height |
| `CURVE_START` | 10 | Curve start (relative to curtain appear) |
| `CURVE_DURATION` | 25 | Curve slide duration |
| `EASING` | `Easing.inOut(Easing.cubic)` | Shared easing |

### Step 2: Verify ✅

Run these commands and fix any issues:

```bash
npx tsc --noEmit
npm run lint
```

**Expected**: Zero errors.

### Must-Haves

- `beforeContent?: React.ReactNode` prop added to interface
- When `beforeContent` is provided: 3-layer z-index clipPath architecture
- clipPath uses `polygon(evenodd, ...)` with animated hole coordinates
- Hole starts collapsed at center (CURTAIN_APPEAR) and grows with screen zoom
- Curtain columns use `curtainFrame = Math.max(0, frame - CURTAIN_APPEAR)` for timing
- Before content fades out from PHASE2_END to FADE_OUT_END
- When `beforeContent` is NOT provided: backward-compatible render path (dark bg, centered screen, curtain→children)
- Column animation logic extracted into `buildColumns()` reused function
- `npx tsc --noEmit` passes with zero errors
- `npm run lint` passes with zero errors

### Must-NOT-Haves

- No external dependencies added
- No GSAP (using `interpolate` only, as before)
- No changes to `src/Root.tsx` or other files
- No breaking changes to existing API when `beforeContent` is omitted
- No edits outside `src/MovieScreen.tsx`

## QA Checklist

1. `npx tsc --noEmit` → zero errors
2. `npm run lint` → zero errors
3. Verify `beforeContent` renders correctly: provide `<div style={{background:'red'}}><h1>BEFORE</h1></div>` as prop
4. Verify no `beforeContent` → same behavior as current version
5. Verify clipPath hole transitions from center-point to full screen rect
6. Verify curtain columns start at CURTAIN_APPEAR, not frame 0
