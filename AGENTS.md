# AGENTS.md — remotion-hammer

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

## Style & Performance Conventions (1080P 60fps Optimization)

- Deterministic PRNG (djb2 hash + mulberry32) used in `HeroReveal` and `OrbitalRelaunch` — seed prop `"default"` by default, guarantees reproducible renders across frames and machines.
- **GPU-Accelerated Transforms**: All GSAP animations MUST animate `x`, `y`, `scale`, `rotation`, and `opacity`. NEVER animate `width`, `height`, `top`, or `left` directly as they trigger layout thrashing and slow down 60fps rendering.
- All transforms use `position: absolute` on transparent wrappers.
- `render` call uses `--props='{"key":"val"}'` for overrides, not env vars.
- CSS-only `@import "tailwindcss"` (v4) — no `tailwind.config`, no PostCSS.