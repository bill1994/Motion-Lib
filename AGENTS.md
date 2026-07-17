# AGENTS.md — motion-lib

## Commands

| Action | Command |
|--------|---------|
| Dev server | `npm run dev` (alias for `remotion studio`) |
| Bundle | `npm run build` (`remotion bundle`) |
| Lint + typecheck | `npm run lint` (runs `eslint src && tsc`) |
| Render composition | `npx remotion render <compositionId> <outputPath>` |
| ProRes 4444 with alpha | `npx remotion render <id> out/<name>.mov --codec=prores --prores-profile=4444 --image-format=png --pixel-format=yuva444p10le` |
| Render with seed variant | `npx remotion render <id> out/<name>.mov --props='{"seed":"variant-B"}'` |

No test command exists.

## Compositions

All 5 compositions in `src/Root.tsx` (`AnimeDrop`, `PhysicsDrop`, `OrbitalRelaunch`, `HeroReveal`, `TextIntro`): 1920×1080, 60fps, 180 frames (3s). Default codec is ProRes 4444 with alpha (set via `calculateMetadata` in `Root.tsx:11-18`).

Each composition accepts `children?: React.ReactNode` and renders on a transparent background.

## Architecture

- Entry: `src/index.ts` → `registerRoot(RemotionRoot)`
- Config: `remotion.config.ts` — Sets `setVideoImageFormat("png")` for alpha transparency support, overwrite, Tailwind v4 webpack override.
- Tailwind v4: single `@import "tailwindcss"` in `src/index.css`
- TypeScript: `tsconfig.json` excludes `remotion.config.ts`, targets ES2018, commonjs, strict, noUnusedLocals
- ESLint: flat config via `@remotion/eslint-config-flat`
- Prettier: 2-space, bracketSpacing=true, no tabs
- `.gitignore` ignores: `node_modules`, `dist`, `out/`, `public/`, `.env`

## GSAP & Remotion Integration Rules (MANDATORY)

To guarantee deterministic, frame-accurate renders at 60fps without layout drops, the Agent MUST adhere to these rules:
1. **The Paused Law**: All GSAP timelines MUST be instantiated with `{ paused: true }` via `gsap.timeline({ paused: true })`. Direct auto-play tweens are strictly banned.
2. **The Seconds-Seek Formula**: You MUST convert Remotion frames to exact float seconds using `tl.seek(frame / fps)`. Never use `.progress()` with raw percentages or raw frame counts in `.seek()`.
3. **Context Lifecycle**: ALWAYS encapsulate your GSAP sequence inside `gsap.context(( ) => { ... }, containerRef)` to prevent timeline duplication and memory leaking during Puppeteer rendering.

## Design System — Color Palette (MANDATORY)

The project enforces a personal brand color system. All compositions, pages, and UI elements MUST adhere to these tokens:

| Token | Hex | Usage |
|-------|-----|-------|
| **Page primary** | `#CBC0D3` | Page backgrounds, decorative surfaces, large accent areas |
| **Text primary** | `#1D1B20` | Main body text, large headings (h1/h2), primary labels |
| **Text secondary** | `#4E4D5C` | Subtitles, captions, meta info, secondary labels |

**Dark-background rule**: When the background is dark (e.g. `#1D1B20` or near-black), use `#CBC0D3` as the text color for readability.

These three values form a cohesive purple-gray family. No other colors should be introduced unless a specific design brief explicitly calls for an accent. Where possible, prefer opacity/alpha variations of these three over adding new hex values.

## Animation Architecture Rules (MANDATORY)

Universal principles for organizing multi-step animations. These apply regardless of animation library (GSAP, Framer Motion, or raw CSS transitions).

### 1. Phase-Based Progression Model

Any multi-step animation must be split into mathematically defined phases. Each phase has a clear input domain and a function mapping input → normalized `progress ∈ [0, 1]`. Prohibit implicit "magic-number chains" where one animation's end triggers another by timing accident.

```
// ✅ GOOD — explicit phases with normalized progress
function computePhase(frame: number, fps: number) {
  const ENTER = 60, LOOP = 60, EXIT = 60;
  if (frame < ENTER)  return { phase: 'enter', progress: frame / ENTER };
  if (frame < ENTER + LOOP)
                      return { phase: 'loop',  progress: (frame - ENTER) / LOOP };
  return { phase: 'exit',  progress: (frame - ENTER - LOOP) / EXIT };
}

// ❌ BAD — implicit timing, magic numbers, no way to test in isolation
// Sequence A ends → Sequence B starts → hard to reason about or test
```

### 2. Single-Frame Snapshot Principle

Every animation state in a given frame must be derived from a SINGLE input snapshot (`useCurrentFrame()`, `scrollY`, `timestamp`). Prohibit writing to different properties from different event listeners or state hooks within the same frame — this creates inconsistency where different properties see different moments in time.

```
// ✅ GOOD — one frame value drives everything
const frame = useCurrentFrame();
tl.seek(frame / fps);
opacityRef.current.style.opacity = interpolate(frame, [0, 60], [0, 1]);

// ❌ BAD — different sources produce inconsistent state
useEffect(() => { tl.seek(frame / fps) }, [frame]);
const [opacity, setOpacity] = useState(0);
useEffect(() => { setOpacity(computeSomething()) }, [someOtherTrigger]);
```

In scroll-driven contexts, use a single `requestAnimationFrame` loop that reads `scrollY` once and computes ALL transforms from that snapshot — never attach individual scroll event listeners that each write to separate properties.

### 3. The Ready Guard

Before issuing any command to an asynchronous system (video element, animation timeline, audio buffer), check that the system is in a ready state. Issuing commands to a busy system creates a queue of stale operations that fight each other.

```
// ✅ GOOD
if (!video.seeking) video.currentTime = newTime;
if (tl.progress() === 0) tl.play();

// ❌ BAD
video.currentTime = newTime;  // interrupts an ongoing seek
```

Apply this to: video/audio `seeking` / `readyState`, GSAP timeline `progress() === 0` or `isActive()`, image `complete`, font `status === 'loaded'`.

### 4. CSS Over JS Principle

Prefer solving design problems with a single CSS property over computing the same effect in JavaScript. CSS properties run on the compositor thread, cost zero JS heap, and cannot trigger re-render storms.

```
// ✅ GOOD — CSS does the work
mix-blend-mode: exclusion;     // text visible on any background
aspect-ratio: 2/3;             // maintain proportions
will-change: transform;        // GPU promotion hint
transform-origin: right bottom; // animation anchor
position: absolute;            // remove from flow

// ❌ BAD — JS does what CSS already offers
// JS sampling background color → computing luminance → switching text class
// JS computing width/height ratio on every resize
// JS adding/removing will-change imperatively
```

This is the same philosophy as "NEVER animate width/height/top/left" — extend it to: if a CSS property exists that can do the job declaratively, use it before reaching for JS.

## Style & Performance Conventions (1080P 60fps Optimization)

- Deterministic PRNG (djb2 hash + mulberry32) used in `HeroReveal` and `OrbitalRelaunch` — seed prop `"default"` by default, guarantees reproducible renders across frames and machines.
- **GPU-Accelerated Transforms**: All GSAP animations MUST animate `x`, `y`, `scale`, `rotation`, and `opacity`. NEVER animate `width`, `height`, `top`, or `left` directly as they trigger layout thrashing and slow down 60fps rendering.
- All transforms use `position: absolute` on transparent wrappers.
- `render` call uses `--props='{"key":"val"}'` for overrides, not env vars.
- CSS-only `@import "tailwindcss"` (v4) — no `tailwind.config`, no PostCSS.

