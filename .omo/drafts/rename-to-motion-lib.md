---
slug: rename-to-motion-lib
status: awaiting-approval
intent: clear
pending-action: write .omo/plans/rename-to-motion-lib.md
approach: Straight rename, move, and reference update — all mechanical, no code logic changes.
---

# Draft: rename-to-motion-lib

## Components (topology ledger)
<!-- Lock the SHAPE before depth. One row per top-level component that can succeed or fail independently. -->
<!-- id | outcome (one line) | status: active|deferred | evidence path -->

| id | outcome | status | evidence |
|----|---------|--------|----------|
| project-move | remotion-hammer dir moved to ~/video_product/animation-res | active | verified: ~/video_product/animation-res exists with old HyperFrames project, no cross-references |
| package-rename | package.json name → motion-lib | active | src/package.json:2 |
| agents-rename | AGENTS.md:1 title → motion-lib | active | src/AGENTS.md:1 |
| readme-update | README.md title → motion-lib | active | src/README.md:1 — "# Remotion video" → "# motion-lib" |
| skill-reference | ~/.agents/skills/video-storyboard-agent/SKILL.md:119 updated | active | confirmed single hardcoded ref at that line |
| git-remote | update origin URL to motion-lib repo + fix typo | active | current: bill1994/remotion-harmer (harmer vs hammer) |
| codegraph-cleanup | old ~/.omo/codegraph/projects/remotion-hammer-* will be stale | deferred | auto-evacuated on next codegraph init; no manual action needed |
| npm-install | npm install at new location | active | ensures native modules rebuild for new path |

## Open assumptions (announced defaults)
<!-- Record any default you adopt instead of asking, so the user can veto it at the gate. -->
<!-- assumption | adopted default | rationale | reversible? -->
| assumption | default | rationale | reversible? |
|-----------|---------|-----------|-------------|
| Git repo name | rename repo from `remotion-harmer` to `motion-lib` on GitHub | package/dir aligns | yes, `git remote set-url` to undo |
| New remote URL format | `https://github.com/bill1994/motion-lib.git` | match new name | yes |
| README.md title | "# motion-lib" | match new identity | yes |

## Findings (cited - path:lines)

1. **No absolute paths in source** — All imports are `./Component` relative. Verified via grep for `/home/fanstic|__dirname|process.cwd` — only false positives from `position: absolute` CSS in source files. (src/:219+ lines)
2. **Scripts use relative paths** — `scripts/generate-catalog.ts:17-18` uses `__dirname + ".."` which resolves relative to script, not project root — safe.
3. **Only one external skill hardcodes project name** — `~/.agents/skills/video-storyboard-agent/SKILL.md:119` — "Target project: remotion-hammer"
4. **`.codegraph/` in project** — Contains db/cache + daemon.sock. Will be stale after move — should be deleted so it auto-rebuilds.
5. **Git remote has typo** — `remotion-harmer` (should be `hammer` / now `motion-lib`). (git remote -v)
6. **Target `~/video_product/animation-res/` exists** — old HyperFrames project, no other projects in `~/video_product/` reference it.
7. **`out/` directory** — Contains rendered `.mov` artifacts, can be kept or deleted (no code references them).
8. **Tailwind/Remotion config** — No path references in `remotion.config.ts` or `tsconfig.json`.

## Decisions (with rationale)

1. **Name: `motion-lib`** — User explicitly chose it. Package name in package.json, README, AGENTS.md, git remote all align.
2. **Clean `.codegraph/` before move** — Old embedded codegraph db references old path. Let next codegraph init rebuild fresh.
3. **Clean `out/` before move** — Old rendered videos are large artifacts unrelated to the new identity. Optional, recommended.
4. **Remove old `~/video_product/animation-res/` first** — Replace, not merge. Ensure old HyperFrames project is fully deleted.
5. **Run npm install after move** — Even with node_modules moved, some native deps (Chromium-related) benefit from rebuild.

## Scope IN

- Move project directory from `~/opencode/remotion-hammer` to `~/video_product/animation-res`
- Rename project identity everywhere to `motion-lib`
- Update the one external skill reference
- Clean stale cached artifacts
- Update git remote

## Scope OUT (Must NOT have)

- No code changes to any `.tsx/.ts` source files
- No changes to animation logic, configs, or dependencies
- No restructuring of the animation components
- No modification of the animation catalog system

## Open questions

None — all explored, all findings recorded.

## Approval gate

status: awaiting-approval
<!-- When exploration is exhausted and unknowns are answered, set status: awaiting-approval. -->
<!-- That durable record is the loop guard: on a later turn read it and resume at the gate instead of re-running exploration. -->
