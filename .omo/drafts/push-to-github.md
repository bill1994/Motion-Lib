---
slug: push-to-github
status: awaiting-approval
intent: clear
pending-action: write .omo/plans/push-to-github.md
approach: Stage uncommitted changes (excluding .omo/run-continuation/ cache), commit, push to origin
---

# Draft: push-to-github

## Components (topology ledger)
<!-- Lock the SHAPE before depth. One row per top-level component that can succeed or fail independently. -->
<!-- id | outcome (one line) | status: active|deferred | evidence path -->
N/A — single linear sequence, no parallel sub-components.

## Open assumptions (announced defaults)
<!-- Record any default you adopt instead of asking, so the user can veto it at the gate. -->
<!-- assumption | adopted default | rationale | reversible? -->

None. All decisions were confirmed with the user.

## Findings (cited - path:lines)

1. **Remote already configured**: `origin` → `https://github.com/bill1994/motion-lib.git` (same as `Motion-Lib` — GitHub case-insensitive). `bash: git remote -v`
2. **GitHub CLI authenticated**: `bill1994` account, token scopes include `repo`. `bash: gh auth status`
3. **6 unpushed commits** on `master` ahead of `origin/master`. `bash: git log --oneline -10`
4. **Uncommitted changes exist**: 7 modified, 3 deleted, 4+ new files. `bash: git status`
5. **`.omo/run-continuation/` tracked with many session cache files** — user chose to exclude them. `bash: git ls-files .omo/`
6. **`.omo/` not in `.gitignore`** — run-continuation files are accidentally tracked.

## Decisions (with rationale)

1. **Add `.omo/run-continuation/` to `.gitignore`** — session continuation state is transient development artifact, not project source. User confirmed.
2. **`git rm --cached` on existing tracked run-continuation files** — stops tracking without deleting from disk.
3. **Stage all other changed/new files** — source code changes (src/), config (package.json), scripts, plans/drafts (purposeful .omo artifacts).
4. **Single commit** — these changes are all part of "current state" push.
5. **Push to origin master** — standard push, no force needed.

## Scope IN

- Stage all modified source files, new components, deleted old components
- Include `.omo/drafts/` and `.omo/plans/` (purposeful plan artifacts)
- Commit and push to `origin master`

## Scope OUT (Must NOT have)

- Do NOT include `.omo/run-continuation/*.json` files
- Do NOT force-push (`--force`)
- Do NOT touch any remote branches other than master
- Do NOT modify any source code

## Open questions

None. All forks resolved.

## Approval gate
status: awaiting-approval
<!-- When exploration is exhausted and unknowns are answered, set status: awaiting-approval. -->
<!-- That durable record is the loop guard: on a later turn read it and resume at the gate instead of re-running exploration. -->
