# rename-to-motion-lib - Work Plan

## TL;DR (For humans)
<!-- Fill this LAST, after the detailed plan below is written, so it summarizes the REAL plan. -->

**What you'll get:** `remotion-hammer` 搬家到 `~/video_product/animation-res`，改头换面成 `motion-lib`——一个名字一看就是动画资源库的新项目。所有引用同步更新，git remote 顺便修好之前的拼写错误。

**Why this approach:** 这是纯机械操作——目录移动 + 文本替换，没有代码逻辑变更。一次性批量改完，cleanup 收尾，不需要分批。

**What it will NOT do:** 不改任何 `.tsx/.ts` 源码，不改动画逻辑，不改依赖，不改动画目录系统。

**Effort:** Quick (5-6 个 todo，全独立可并行)
**Risk:** Low — 所有操作可逆（git 保底），无代码变更
**Decisions to sanity-check:** Git remote 新 URL 是否要创建新 repo，还是沿用旧仓库改名

Your next move: approve the plan, then run `$start-work` to execute.

---

> TL;DR (machine): Quick | Low | Move + rename remotion-hammer → motion-lib, 6 sequential todos

## Scope
### Must have
- Move project to `~/video_product/animation-res`
- Rename all project identity references to `motion-lib`
- Update external skill reference
- Clean stale artifacts
- Update git remote

### Must NOT have (guardrails, anti-slop, scope boundaries)
- No changes to `.tsx`/`.ts` source files
- No animation logic modifications
- No dependency changes or upgrades
- No restructuring of components or animation catalog

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: none (no code changes — verification is file-exists + grep-based)
- Evidence: `.omo/evidence/task-<N>-rename-to-motion-lib.<ext>`

## Execution strategy
### Parallel execution waves
Wave 1: 清理旧目录 + 更新 skill 引用 + 清理项目内缓存（无依赖）
Wave 2: mv 目录（依赖 Wave 1: 旧目录已删）
Wave 3: 改名 + 更新引用 + git 操作（依赖 Wave 2: 新路径就位）

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. Clean old animation-res | — | — | 2, 3 |
| 2. Update skill reference | — | — | 1, 3 |
| 3. Clean project caches | — | — | 1, 2 |
| 4. mv directory | 1 | — | — |
| 5. Rename project identity | 4 | — | — |
| 6. Npm install + verify | 4, 5 | — | — |
| 7. Update git remote | 4 | — | — |
| 8. Final verification | 4, 5, 6, 7 | — | — |

## Todos
> Implementation + Test = ONE todo. Never separate.
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->
- [ ] 1. **Remove old `~/video_product/animation-res/` directory**
  What to do / Must NOT do: Delete the old HyperFrames project at `~/video_product/animation-res/`. Do NOT use backup — user said "replacement". Verify with `ls` that it exists first.
  Parallelization: Wave 1 | Blocked by: — | Blocks: 4
  References: `~/video_product/animation-res/` (confirmed: exists, old HyperFrames project with meta.json, hyperframes.json, node_modules)
  Acceptance criteria: `ls ~/video_product/animation-res/` returns "No such file or directory"
  QA scenarios: bash `ls ~/video_product/animation-res/ 2>&1 || echo "GONE"` → expect "GONE". Evidence `.omo/evidence/task-1-rename-to-motion-lib.txt`
  Commit: N

- [ ] 2. **Update external skill reference**
  What to do / Must NOT do: Edit `~/.agents/skills/video-storyboard-agent/SKILL.md` line 119. Change `remotion-hammer` to `motion-lib`. Exact match: `remotion-hammer (`.omo/animation-catalog.md`)` → `motion-lib (`.omo/animation-catalog.md`)`. Do NOT touch any other line.
  Parallelization: Wave 1 | Blocked by: — | Blocks: —
  References: `~/.agents/skills/video-storyboard-agent/SKILL.md:119` (confirmed: single occurrence)
  Acceptance criteria: `grep -n "remotion-hammer" ~/.agents/skills/video-storyboard-agent/SKILL.md` returns no matches
  QA scenarios: bash grep after edit → 0 results. Evidence `.omo/evidence/task-2-rename-to-motion-lib.txt`
  Commit: N

- [ ] 3. **Clean stale project-local caches**
  What to do / Must NOT do: Delete `.codegraph/` directory inside the project (it contains db/daemon files referencing old path). Optionally delete `out/` (rendered artifacts, 20MB+.mov files). Optionally delete `.omo/run-continuation/` (session cache files). Delete `node_modules/.cache/` if it exists. Do NOT delete `.omo/plans/` or `.omo/drafts/` (the plan is still live).
  Parallelization: Wave 1 | Blocked by: — | Blocks: 4
  References: `/home/fanstic_b/opencode/remotion-hammer/.codegraph/` (confirmed: daemon.pid references old path); `/home/fanstic_b/opencode/remotion-hammer/out/` (rendered .mov files)
  Acceptance criteria: `.codegraph/` no longer exists inside project
  QA scenarios: bash `ls .codegraph/ 2>&1 || echo "CLEANED"`. Evidence `.omo/evidence/task-3-rename-to-motion-lib.txt`
  Commit: N

- [ ] 4. **Move project directory to new location**
  What to do / Must NOT do: `mv ~/opencode/remotion-hammer ~/video_product/animation-res`. Verify the `~/video_product/` parent exists first. After move, verify key files exist at new path (`package.json`, `src/Root.tsx`, `AGENTS.md`, `README.md`). Do NOT copy — move (no residual files left behind).
  Parallelization: Wave 2 | Blocked by: 1 (old dir must be gone), 3 (caches cleaned) | Blocks: 5, 6, 7
  References: Source `/home/fanstic_b/opencode/remotion-hammer/`, target `~/video_product/animation-res/`
  Acceptance criteria: `ls ~/video_product/animation-res/package.json` exists, `/home/fanstic_b/opencode/remotion-hammer/` no longer exists
  QA scenarios: bash check both paths. Evidence `.omo/evidence/task-4-rename-to-motion-lib.txt`
  Commit: N

- [ ] 5. **Rename project identity to motion-lib**
  What to do / Must NOT do: At the new path `~/video_product/animation-res/`:
    - `package.json`: change `"name": "remotion-hammer"` → `"name": "motion-lib"`
    - `AGENTS.md`: line 1 `# AGENTS.md — remotion-hammer` → `# AGENTS.md — motion-lib`
    - `README.md`: line 1 `# Remotion video` → `# motion-lib` (also update description text if any)
    Do NOT change any other files.
  Parallelization: Wave 3 | Blocked by: 4 (new path) | Blocks: —
  References: `package.json:2`, `AGENTS.md:1`, `README.md:1`
  Acceptance criteria: `grep -rn "remotion-hammer" ~/video_product/animation-res/ --include='*.json' --include='*.md' | grep -v node_modules | grep -v package-lock` returns 0 matches
  QA scenarios: bash grep after edit → 0 results. Evidence `.omo/evidence/task-5-rename-to-motion-lib.txt`
  Commit: N

- [ ] 6. **npm install at new location**
  What to do / Must NOT do: `cd ~/video_product/animation-res && npm install`. This rebuilds native modules for the new path. Do NOT add/remove dependencies.
  Parallelization: Wave 3 | Blocked by: 4 (new path) | Blocks: —
  References: `~/video_product/animation-res/package.json`
  Acceptance criteria: `npm install` exits with code 0, no ERR! in output
  QA scenarios: bash run. Evidence `.omo/evidence/task-6-rename-to-motion-lib.txt`
  Commit: N

- [ ] 7. **Update git remote URL**
  What to do / Must NOT do: At `~/video_product/animation-res/`, update git remote origin: `git remote set-url origin https://github.com/bill1994/motion-lib.git`. This both fixes the old typo (harmer→hammer→motion-lib) and renames to match new project identity. Do NOT push — that's the user's decision for when the new repo is ready.
  Parallelization: Wave 3 | Blocked by: 4 (new path) | Blocks: —
  References: Current remote `https://github.com/bill1994/remotion-harmer.git`
  Acceptance criteria: `git remote -v` shows `https://github.com/bill1994/motion-lib.git`
  QA scenarios: bash check. Evidence `.omo/evidence/task-7-rename-to-motion-lib.txt`
  Commit: N (this is git config, not a commit)

- [ ] 8. **Final verification**
  What to do / Must NOT do: Run all checks in parallel:
    a. `ls ~/video_product/animation-res/` — verify all expected files present
    b. `ls ~/opencode/remotion-hammer/ 2>&1` — expect not found (old dir gone)
    c. `grep -rn "remotion-hammer" ~/video_product/animation-res/ --include='*.json' --include='*.md' --include='*.tsx' --include='*.ts' | grep -v node_modules | grep -v package-lock | grep -v ".omo/plans" | grep -v ".omo/drafts"` — expect 0 results (no stale references anywhere)
    d. `grep -rn "remotion-hammer" ~/.agents/skills/video-storyboard-agent/SKILL.md` — expect 0 results
    e. `cd ~/video_product/animation-res && git remote -v` — verify new URL
    f. `cd ~/video_product/animation-res && git log --oneline -3` — verify git history intact
  Parallelization: Final | Blocked by: all | Blocks: —
  References: All paths
  Acceptance criteria: ALL 6 sub-checks pass
  QA scenarios: Run all checks, save output to evidence file. Evidence `.omo/evidence/task-8-rename-to-motion-lib.txt`
  Commit: N

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [ ] F1. Plan compliance audit — all 8 todos completed as specified
- [ ] F2. No stale `remotion-hammer` references remain in project or skill files
- [ ] F3. At new path: `npm run dev` starts Remotion Studio without error
- [ ] F4. Scope fidelity — no `.tsx`/`.ts` source files changed

## Commit strategy
No commits. This is a rename + move, not a code change. If the user wants to commit the new identity as a fresh start, that's their call after verification.

## Success criteria
- `~/video_product/animation-res/` contains the fully functional project
- `/home/fanstic_b/opencode/remotion-hammer/` no longer exists
- No reference to `remotion-hammer` remains in project files or external skills
- Git remote points to `bill1994/motion-lib`
- `npm install` succeeds, `npm run dev` starts without error
