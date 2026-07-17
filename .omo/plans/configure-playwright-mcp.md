# configure-playwright-mcp - Work Plan

## TL;DR (For humans)

**What you'll get:** Playwright MCP server registered in `opencode.jsonc`, so when agent calls `skill_mcp(mcp_name="playwright")` it will connect to Windows Chrome (via CDP bridge from `chrome-wsl`) instead of failing.

**Why this approach:** Using `--cdp-endpoint=http://127.0.0.1:9222` lets Playwright control your Windows-side Chrome (started by `chrome-wsl`), avoiding the "Chrome not installed inside WSL" problem and giving you a visible debug browser.

**What it will NOT do:** Does NOT install or configure `chrome-wsl` itself — you'll run that separately before using Playwright tools.

**Effort:** Quick
**Risk:** Low - single JSON config addition
**Decisions to sanity-check:** The `--cdp-endpoint` port (9222) must match what `chrome-wsl` uses.

Your next move: Approve, then `$start-work` to apply.

---

> TL;DR (machine): Quick, Low risk - add playwright MCP entry to ~/.config/opencode/opencode.jsonc with --cdp-endpoint

## Scope
### Must have
- Add `"playwright"` MCP server entry to `~/.config/opencode/opencode.jsonc` `mcp` section
- Use `@playwright/mcp@latest` with `--browser=chrome --isolated --cdp-endpoint=http://127.0.0.1:9222`

### Must NOT have (guardrails, anti-slop, scope boundaries)
- Do NOT modify any other existing config (mcpvault, plugins, providers, agents)
- Do NOT install or modify `chrome-wsl`
- Do NOT change any project code in `remotion-hammer`

## Verification strategy
- Test decision: none (config change only)
- Evidence: .omo/evidence/task-1-configure-playwright-mcp.txt
- Verify by: reading the edited file to confirm JSON is valid and the playwright entry is present

## Execution strategy
### Parallel execution waves
Single todo, no waves needed.

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1 | - | - | - |

## Todos
- [ ] 1. Add playwright MCP to opencode.jsonc
  What to do / Must NOT do: Add a `"playwright"` entry under the `mcp` section of `~/.config/opencode/opencode.jsonc` with type `"local"` and command `["npx", "@playwright/mcp@latest", "--browser=chrome", "--isolated", "--cdp-endpoint=http://127.0.0.1:9222"]`. Do NOT touch any other section.
  Parallelization: Wave 1 | Blocked by: - | Blocks: -
  References: ~/.config/opencode/opencode.jsonc:46-55 (existing mcp section)
  Acceptance criteria: `grep -A6 '"playwright"' ~/.config/opencode/opencode.jsonc` returns the config block
  QA scenarios: Happy: Read the file and confirm JSON is valid syntax and the playwright block is properly nested under `mcp`. Failure: N/A for config add.
  Evidence: .omo/evidence/task-1-configure-playwright-mcp.txt
  Commit: N (personal config file)

## Final verification wave
- [x] F1. Plan compliance audit — single-todo plan, scope matches
- [x] F2. Code quality review — standard MCP config pattern, same shape as mcpvault
- [ ] F3. Real manual QA — after approval, executor edits file and runs `jq .mcp.playwright` to confirm
- [x] F4. Scope fidelity — only adds playwright entry, nothing else changed

## Commit strategy
No commit — this is a personal config file outside the project repo.

## Success criteria
- `~/.config/opencode/opencode.jsonc` has a valid `playwright` MCP entry
- After running `chrome-wsl` then using the agent, `skill_mcp(mcp_name="playwright")` connects successfully
