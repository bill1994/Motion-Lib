# Plan: Claude Code Tutorial Video Implementation

## Overview

Implement a ~13-minute Claude Code installation tutorial video using the existing remotion-hammer project (Remotion 60fps + GSAP paused timeline + `#CBC0D3/#1D1B20/#4E4D5C` design system). The video alternates between **animated storytelling segments** (visual metaphors, text slams, transitions) and **screen recording placeholders** (tutorial walkthroughs).

## Architecture

### Composition Split Strategy

The video is entirely too long (47,760f) for a single Composition. Split into **6 acts + 1 screen recording segment**:

| Composition ID | Frames | Time | Content |
|---|---|---|---|
| `TutorialAct01` | 3,420 | 0:57 | Hook: zero-to-one story |
| `TutorialAct02` | 8,040 | 2:14 | Step 1: Node.js (animated segments only, recording gaps handled by `<Sequence>`) |
| `TutorialAct03` | 1,320 | 0:22 | First error conquered |
| `TutorialAct04` | 1,740 | 0:29 | Step 2: Git |
| `TutorialAct05` | 5,760 | 1:36 | NPM reveal + Claude Code install |
| `TutorialAct06` | 4,020 | 1:07 | Conclusion + CTA |

**Screen recording segments** (≈9min) are represented as placeholder components within each act via `<Sequence>` gaps. Actual recordings are stitched in post-production.

Each composition is registered in `Root.tsx` with `calculateMetadata` (ProRes 4444 alpha).

### Component Tree

```
TutorialAct01 (etc.)
├── SceneRenderer        ← orchestrator: maps frame ranges → active scene
├── Shared Components
│   ├── StepTitle         ← "STEP 01 / 02 / 03" chapter divider
│   ├── Card              ← reusable configurable card (bg, text, radius, shadow)
│   ├── TerminalWindow    ← terminal mockup: `#1D1B20` bg, green monospace text
│   ├── TypewriterText    ← character-by-character typing effect
│   ├── WindowPaper       ← semi-transparent paper layer + finger poke → fragments
│   ├── DualCardSlam      ← two cards slamming from left/right simultaneously
│   ├── TreasureChest     ← chest with opening lid + glow burst
│   ├── ScreenOverlay     ← minimal screen recording overlay (timer, frame, corner avatar)
│   └── ParticleBurst     ← configurable confetti/star/spark burst
└── [Act-specific scenes]
    ├── TerminalReveal    ← MacBook silhouette, cursor blink
    ├── ZeroCodeSlam      ← "0行代码" large text slam with dark overlay
    ├── ClaudeLogo        ← Claude Code icon + rotating halo
    ├── PitCards          ← staggered "坑" cards 
    ├── FistBump          ← fist pushing up from bottom
    ├── QA_Bubble         ← question bubble pop-in
    ├── CoffeeAnalogy     ← coffee machine + power system card
    ├── TreasureChestScene← act 5 chest open + NPM app store
    ├── ErrorFlashback    ← red error texture callback
    ├── CommandReveal     ← npm command typewriter
    ├── PaperTear         ← window paper metaphor climax (act 6)
    ├── DifficultyGauge   ← pointer from HARD→EASY
    └── CTA_Buttons       ← like/follow/subscribe buttons
```

### Data Flow

Each act component reads `useCurrentFrame()` and uses a **frame-to-scene mapper**:

```ts
// Scene mapping: [startFrame, endFrame) → sceneName
const SCENE_MAP: [number, number, string][] = [
  [0, 253, "terminal-reveal"],
  [253, 423, "ai-programmer-card"],
  [423, 543, "website-mockup"],
  // ...
];

function getActiveScene(frame: number): string | null {
  for (const [start, end, name] of SCENE_MAP) {
    if (frame >= start && frame < end) return name;
  }
  return null;
}
```

Each scene is a thin React component that:
- Uses `gsap.timeline({ paused: true })` wrapped in `gsap.context(() => { ... }, ref)`
- Drives via `tl.seek(frame / fps)` in a frame-effect
- Cleans up with `ctx.revert()` on unmount

---

## Implementation Steps

### Step 1: Create shared infrastructure (4 files)

| # | File | Description |
|---|------|-------------|
| 1 | `src/tutorial/SceneRenderer.tsx` | Frame-to-scene mapper + scene registry |
| 2 | `src/tutorial/TutorialTypes.ts` | Shared TypeScript types (SceneConfig, CardProps, etc.) |
| 3 | `src/tutorial/useTutorialFrame.ts` | Custom hook: `useCurrentFrame()` → seek GSAP timeline pattern |
| 4 | `src/tutorial/colors.ts` | Color tokens derived from project design system |

**Key decisions**: 
- `useTutorialFrame` encapsulates the `useEffect(() => { tl.seek(frame / fps) }, [frame, fps])` pattern so each scene component just calls one hook
- `colors.ts` exports `COLORS = { primary: '#CBC0D3', text: '#1D1B20', secondary: '#4E4D5C', error: '#FF4444' }` etc.

### Step 2: Build reusable components (8 files)

| # | File | Description |
|---|------|-------------|
| 5 | `src/tutorial/StepTitle.tsx` | Chapter divider: "STEP N" large text + subtitle, entrance animation |
| 6 | `src/tutorial/Card.tsx` | Configurable card: bg/text/border/radius/shadow props, pop-in animation |
| 7 | `src/tutorial/TerminalWindow.tsx` | Terminal mockup: dark bg, green monospace, optional command text + cursor blink |
| 8 | `src/tutorial/TypewriterText.tsx` | Text reveal effect: clip-path or character-by-character typing |
| 9 | `src/tutorial/WindowPaper.tsx` | Semi-transparent paper + finger poke → fragment burst → light reveal |
| 10 | `src/tutorial/DualCardSlam.tsx` | Two cards from left/right `x: ±200→0` with `back.out(2)` easing |
| 11 | `src/tutorial/ScreenOverlay.tsx` | Recording overlay: corner avatar, timer bar, frame border |
| 12 | `src/tutorial/ParticleBurst.tsx` | Configurable particle burst (stars/confetti/sparks), size/density/color props |

### Step 3: Build Act 1 — Hook (0:00–0:57 / 3,420f)

| # | File | Description |
|---|------|-------------|
| 13 | `src/tutorial/Act01.tsx` | Act 1 orchestrator + scene registration |
| 14 | `src/tutorial/scenes/Act01_TerminalReveal.tsx` | MacBook line art, cursor blink |
| 15 | `src/tutorial/scenes/Act01_AiProgrammerCard.tsx` | "AI Programmer" identity card pop-in |
| 16 | `src/tutorial/scenes/Act01_WebsiteMockup.tsx` | Browser mockup |
| 17 | `src/tutorial/scenes/Act01_FeatureTags.tsx` | Three feature check tags staggered |
| 18 | `src/tutorial/scenes/Act01_ZeroCodeSlam.tsx` | "0行代码" dark overlay + big text slam |
| 19 | `src/tutorial/scenes/Act01_ChatBubbles.tsx` | Three chat bubbles staggered |
| 20 | `src/tutorial/scenes/Act01_ClaudeLogo.tsx` | Claude Code icon + rotating halo |
| 21 | `src/tutorial/scenes/Act01_PainTransition.tsx` | PI#01: icon flies out, "痛苦" shake |
| 22 | `src/tutorial/scenes/Act01_PitCards.tsx` | Three "坑" cards staggered |
| 23 | `src/tutorial/scenes/Act01_NpmRedError.tsx` | PI#02: red error texture slam |
| 24 | `src/tutorial/scenes/Act01_FistBump.tsx` | Fist pushing up from dark |
| 25 | `src/tutorial/scenes/Act01_PitFill.tsx` | Pit cards checked → filled |
| 26 | `src/tutorial/scenes/Act01_TutorialTitle.tsx` | "零基础安装教程" word reveal |
| 27 | `src/tutorial/scenes/Act01_WalkIn.tsx` | Stick figure walking in |
| 28 | `src/tutorial/scenes/Act01_Step01Transition.tsx` | PI#03: scene shrink → "STEP 01" slide |

### Step 4: Build Act 2 — Node.js (0:57–3:11 / 8,040f)

| # | File | Description |
|---|------|-------------|
| 29 | `src/tutorial/Act02.tsx` | Act 2 orchestrator |
| 30 | `src/tutorial/scenes/Act02_QA_Bubble.tsx` | Question bubble: "不是装Claude Code吗?" |
| 31 | `src/tutorial/scenes/Act02_CoffeeAnalogy.tsx` | PI#04: coffee machine + power system cards |
| 32 | `src/tutorial/scenes/Act02_TerminalNpm.tsx` | `npm -v` terminal mockup |
| 33 | `src/tutorial/scenes/Act02_EyeBlink.tsx` | Big eye SVG open + blink |
| 34 | `src/tutorial/scenes/Act02_ArrowDiagram.tsx` | Node→arrow→NPM diagram |
| 35 | `src/tutorial/scenes/Act02_TreasureChest.tsx` | Treasure chest teaser (bouncing, no open) |
| 36 | `src/tutorial/scenes/Act02_RecordingGap.tsx` | Screen recording placeholder (2320f gap) |

### Step 5: Build Act 3 — Error conquered (3:34–3:56 / 1,320f)

| # | File | Description |
|---|------|-------------|
| 37 | `src/tutorial/Act03.tsx` | Act 3 orchestrator |
| 38 | `src/tutorial/scenes/Act03_Clap.tsx` | Clapping hands + star particles |
| 39 | `src/tutorial/scenes/Act03_Step01Complete.tsx` | "Step 01 ✅" fade in |
| 40 | `src/tutorial/scenes/Act03_ErrorFlashback.tsx` | PI#05: red error flashback + "吓人?" shake |
| 41 | `src/tutorial/scenes/Act03_CommandReveal.tsx` | npm command typewriter |
| 42 | `src/tutorial/scenes/Act03_PaperTear.tsx` | Window paper metaphor: poke → break → light |

### Step 6: Build Act 4 — Git (3:56–4:25 / 1,740f)

| # | File | Description |
|---|------|-------------|
| 43 | `src/tutorial/Act04.tsx` | Act 4 orchestrator |
| 44 | `src/tutorial/scenes/Act04_Step02Transition.tsx` | "STEP 02" slide in |
| 45 | `src/tutorial/scenes/Act04_LinuxVsWindows.tsx` | Tux icon + Windows dim + ❌ |
| 46 | `src/tutorial/scenes/Act04_TranslationLayer.tsx` | Translation layer card + arrow path |
| 47 | `src/tutorial/scenes/Act04_DualCardSlam.tsx` | PI#06: "电力系统" vs "翻译官" dual slam |

### Step 7: Build Act 5 — NPM + Claude Code install (5:51–7:27 / 5,760f)

| # | File | Description |
|---|------|-------------|
| 48 | `src/tutorial/Act05.tsx` | Act 5 orchestrator |
| 49 | `src/tutorial/scenes/Act05_ProgressBar.tsx` | Progress bar rising to 60% |
| 50 | `src/tutorial/scenes/Act05_TreasureOpen.tsx` | Treasure chest opens |
| 51 | `src/tutorial/scenes/Act05_NpmAppStore.tsx` | PI#07: "NPM = 🏪 应用商店" slam + shelf |
| 52 | `src/tutorial/scenes/Act05_Foundation.tsx` | 3 foundation blocks stagger in |
| 53 | `src/tutorial/scenes/Act05_ClaudeCodeSlam.tsx` | PI#08: "CLAUDE CODE" back.out(3) slam |
| 54 | `src/tutorial/scenes/Act05_Celebration.tsx` | Confetti burst + "恭喜!" |
| 55 | `src/tutorial/scenes/Act05_LaunchButton.tsx` | Pulsing "🚀 Launch" button |

### Step 8: Build Act 6 — Conclusion (12:09–13:16 / 4,020f)

| # | File | Description |
|---|------|-------------|
| 56 | `src/tutorial/Act06.tsx` | Act 6 orchestrator |
| 57 | `src/tutorial/scenes/Act06_CodeCard.tsx` | Code snippet card slide-in |
| 58 | `src/tutorial/scenes/Act06_FeishuWindow.tsx` | Feishu UI mockup expand |
| 59 | `src/tutorial/scenes/Act06_FinishLine.tsx` | "🏁 安装之旅 终点站" radial reveal |
| 60 | `src/tutorial/scenes/Act06_DifficultyGauge.tsx` | Pointer from HARD→EASY |
| 61 | `src/tutorial/scenes/Act06_PaperTearClimax.tsx` | PI#09: 3-layer paper tear climax |
| 62 | `src/tutorial/scenes/Act06_IdentityCard.tsx` | "文科生" card + error flashback |
| 63 | `src/tutorial/scenes/Act06_YouAreStronger.tsx` | "你们肯定比我更强" flip up |
| 64 | `src/tutorial/scenes/Act06_LikeButton.tsx` | Like button + heart particles |
| 65 | `src/tutorial/scenes/Act06_FollowCard.tsx` | Follow button + "学习搭子" card |
| 66 | `src/tutorial/scenes/Act06_NextEpisode.tsx` | "📺 下期预告" 3D flip panel |
| 67 | `src/tutorial/scenes/Act06_FadeOut.tsx` | "👋 拜拜" fade → black out |

### Step 9: Register compositions in Root.tsx

Add 6 `<Composition>` entries to `Root.tsx`, each referencing the act component with its duration.

### Step 10: Lint + typecheck

Run `npm run lint` and fix any issues.

---

## Files Created Summary

**Total: ~67 files** — shared infra (12) + act orchestrators (6) + scene components (49)

## Key Constraints Checklist

- [ ] All GSAP timelines use `{ paused: true }`
- [ ] All GSAP wrapped in `gsap.context(() => { ... }, containerRef)`
- [ ] All frame sync via `tl.seek(frame / fps)`
- [ ] All animations use GPU-accelerated transforms only (x, y, scale, rotation, opacity, blur)
- [ ] Colors strictly follow `#CBC0D3` / `#1D1B20` / `#4E4D5C` (with `#FF4444` only for error states)
- [ ] Screen recording segments marked by `<div>` placeholders with overlay
- [ ] `npm run lint` passes (tsc + eslint)
