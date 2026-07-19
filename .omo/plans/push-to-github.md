# push-to-github - Work Plan

## TL;DR (For humans)
<!-- Fill this LAST, after the detailed plan below is written, so it summarizes the REAL plan. -->
<!-- Plain English for a non-engineer: NO file paths, NO todo numbers, NO wave/agent/tool names. -->

**What you'll get:** Current state of the project pushed to GitHub — all the new components (CardFlyUp, MovieScreen, WordReveal, AnimatedCardScene), deleted old ones, and config changes will be committed and uploaded. The session cache files (`.omo/run-continuation/`) are cleaned out first so they don't clutter the repo.

**Why this approach:** There are already 6 unpushed commits — those go up too. The run-continuation cache is transient agent state, not project source, so we untrack it before committing.

**What it will NOT do:** Won't force-push, won't delete anything from disk, won't touch any other branches.

**Effort:** Quick
**Risk:** Low — git operations are standard, all auth is already configured
**Decisions to sanity-check:** The `.gitignore` addition for `.omo/run-continuation/`

Your next move: **Approve this plan**, then run `$start-work` to execute.

---

> TL;DR (machine): Quick | Low | Stage + commit all changes (excl .omo/run-continuation/), push to origin master

## Scope
### Must have
- Add `.omo/run-continuation/` to `.gitignore`
- `git rm --cached` all tracked files under `.omo/run-continuation/`
- Stage all modified/deleted/new source files + .omo drafts/plans
- Commit
- Push `master` to `origin`

### Must NOT have (guardrails, anti-slop, scope boundaries)
- No `--force` push
- No modifications to source code semantics
- No changes to remote branches other than master
- No disk deletion of run-continuation files

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: none (git operations don't need unit tests)
- Evidence: `.omo/evidence/task-1-push-to-github.txt` (git status output before/after), `.omo/evidence/task-2-push-to-github.txt` (push output)

## Execution strategy
### Parallel execution waves
Wave 1: git config + cleanup (sequential due to git rm --cached dependency)
Wave 2: commit + push

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. Update .gitignore | — | 2 | — |
| 2. Untrack run-continuation | 1 | 3 | — |
| 3. Stage + commit changes | 2 | 4 | — |
| 4. Push to origin | 3 | — | — |

## Todos
> Implementation + Test = ONE todo. Never separate.
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->
- [x] 1. Add `.omo/run-continuation/` to `.gitignore`
  What to do / Must NOT do: Append a line `.omo/run-continuation/` to `.gitignore`. Do NOT overwrite existing content. Do NOT add any other entries.
  Parallelization: Wave 1 | Blocked by: — | Blocks: 2
  References: `.gitignore` (read first, then edit)
  Acceptance criteria (agent-executable): `grep -q ".omo/run-continuation/" .gitignore` exits 0
  QA scenarios: verify with `grep` after edit. Evidence `.omo/evidence/task-1-push-to-github.txt`
  Commit: N (part of the big commit in todo 3)

- [x] 2. Untrack tracked run-continuation files
  What to do / Must NOT do: Run `git rm --cached .omo/run-continuation/*.json` to stop tracking all session cache files without deleting them from disk. Must NOT add `--force` or any other flag.
  Parallelization: Wave 1 | Blocked by: 1 | Blocks: 3
  References: `.omo/run-continuation/` directory (verify files exist with `ls`)
  Acceptance criteria (agent-executable): `git ls-files .omo/run-continuation/` returns empty
  QA scenarios: `git status --short .omo/run-continuation/` should show `??` (untracked) or nothing if gitignored. Evidence same as task 1.
  Commit: N

- [x] 3. Stage and commit all remaining changes
  What to do / Must NOT do: Stage everything: `git add -A`. The `.omo/run-continuation/` files are now gitignored+untracked so they won't be included. Commit with message: `chore: push current project state to GitHub`. Must NOT stage any file individually or selectively — let `-A` handle it. Must NOT include `.omo/run-continuation/` files (verify with `git status --short` before committing).
  Parallelization: Wave 2 | Blocked by: 2 | Blocks: 4
  References: `git status` output from exploration session
  Acceptance criteria (agent-executable): `git status` shows nothing to commit (clean working tree except ignored files)
  QA scenarios: Check `git status --short` shows no staged/modified files other than possibly gitignored ones. Evidence `.omo/evidence/task-3-push-to-github.txt`
  Commit: Y | `chore: push current project state to GitHub`

- [x] 4. Push to origin master
  What to do / Must NOT do: Run `git push origin master`. Must NOT use `--force`. Must NOT push any other branch.
  Parallelization: Wave 2 | Blocked by: 3 | Blocks: —
  References: `git remote -v` (confirm origin URL)
  Acceptance criteria (agent-executable): `git log --oneline origin/master..master` shows 0 commits (everything pushed)
  QA scenarios: Check push output for success message. Verify with `git status` (should say "Your branch is up to date with 'origin/master'"). Evidence `.omo/evidence/task-4-push-to-github.txt`
  Commit: N

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [x] F1. Plan compliance audit — verify all 4 todos completed, no scope creep
- [x] F2. Remote verification — `git log --oneline origin/master -3` shows the latest commit
- [x] F3. Real manual QA — `gh repo view bill1994/motion-lib --json name,url` to confirm remote repo is up to date

## Commit strategy
Single commit: `chore: push current project state to GitHub`
Contains: source code changes (modified, deleted, new), `.gitignore` update, `.omo/` drafts/plans
Excludes: `.omo/run-continuation/` files

## Success criteria
- `git status` shows clean working tree
- `git log origin/master..master` shows 0 commits (all pushed)
- GitHub repo `bill1994/motion-lib` has the latest state with the commit visible

## Evidence
- Commit: `769b5ff` — `chore: push current project state to GitHub` (181 files, +1813/-2372)
- git status: clean, branch up to date with origin/master
- Push: `git push origin master` — new branch created, all 7 commits pushed
- Remote: verified via `gh repo view` — `bill1994/Motion-Lib` (redirected from motion-lib)
- Note: GitHub redirected to `bill1994/Motion-Lib` (capitalized); update remote if desired
