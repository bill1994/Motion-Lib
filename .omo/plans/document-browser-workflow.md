# document-browser-workflow - Work Plan

## TL;DR (For humans)

**What you'll get:** Two new sections added to `~/.opencode/AGENTS.md` — one saying the environment is WSL (not native Linux), one documenting the `chrome-wsl` + Playwright MCP workflow so future agent sessions automatically know how to browse the web.

**Why this approach:** The global AGENTS.md already has `alwaysApply: true`, meaning it's loaded in every opencode session across all projects. This is the single place where environment context and workflows belong.

**What it will NOT do:** No changes to project-level AGENTS.md files, no skill modifications, no MCP config changes.

**Effort:** Quick
**Risk:** Low - adding documentation sections to an already-existing markdown file

Your next move: Approve, then `$start-work` to apply.

---

> TL;DR (machine): Quick, Low risk - add two sections to ~/.opencode/AGENTS.md: WSL environment annotation + chrome-wsl/playwright browser workflow

## Scope
### Must have
- Add **WSL 工作环境** section to `~/.opencode/AGENTS.md` stating this is WSL2, Chrome is on Windows side
- Add **浏览器浏览工作流** section documenting the chrome-wsl → playwright MCP workflow

### Must NOT have (guardrails, anti-slop, scope boundaries)
- Do NOT modify any other sections of AGENTS.md
- Do NOT modify any config files or project code

## Verification strategy
- Test decision: none (documentation only)
- Evidence: .omo/evidence/task-1-document-browser-workflow.txt
- Verify by: reading the file to confirm both new sections are present and properly formatted

## Execution strategy
Single todo, no waves needed.

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1 | - | - | - |

## Todos
- [ ] 1. Add WSL environment and browser workflow sections to global AGENTS.md
  What to do / Must NOT do: Append two new sections BEFORE the existing content in `~/.opencode/AGENTS.md` (after the frontmatter but before `# 🛸 CYBER-ALCHEMIST`):
  
  Section 1 - WSL 工作环境:
  ```markdown
  ## 🪟 WSL 工作环境
  
  - 本机运行在 **WSL2**（Windows Subsystem for Linux）下，不是原生 Linux
  - Chrome 安装在 Windows 端，不在 WSL 内
  - 所有需要浏览器操作（网页浏览、截图、调试）必须通过 `chrome-wsl` 桥接 + Playwright MCP
  ```
  
  Section 2 - 浏览器浏览工作流:
  ```markdown
  ## 🌐 浏览器浏览工作流
  
  当用户要求查看网页、搜索信息、截图或任何需要浏览器操作时：
  
  1. **先检查** `chrome-wsl` 是否在运行（WSL 内 `curl -s http://127.0.0.1:9222/json/version` 看是否返回 Chrome 版本信息）
  2. 如果未运行，告知用户先执行：
     ```bash
     chrome-wsl            # 有头模式，可看到 Windows Chrome 窗口
     # 或
     chrome-wsl --headless # 无头模式
     ```
  3. 然后使用 `skill_mcp(mcp_name="playwright")` 调用 Playwright MCP 的 browser_* 工具
     Playwright MCP 通过 `--cdp-endpoint=http://127.0.0.1:9222` 连接 Windows 端的 Chrome
  ```
  
  Must NOT do: Do not change or remove any existing content in the file.
  
  Parallelization: Wave 1 | Blocked by: - | Blocks: -
  References: ~/.opencode/AGENTS.md (existing file with frontmatter + CYBER-ALCHEMIST section)
  Acceptance criteria: `grep -c "WSL 工作环境" ~/.opencode/AGENTS.md` returns 1 AND `grep -c "浏览器浏览工作流" ~/.opencode/AGENTS.md` returns 1
  QA scenarios: Happy: Read file, confirm both new sections exist with proper content. Failure: N/A.
  Evidence: .omo/evidence/task-1-document-browser-workflow.txt
  Commit: N (personal config file outside project)

## Final verification wave
- [x] F1. Plan compliance audit — single-todo, scope matches
- [x] F2. Code quality review — clear markdown, no overlap with existing content
- [ ] F3. Real manual QA — executor reads file to verify sections are inserted correctly
- [x] F4. Scope fidelity — only adds new sections, nothing else changed

## Commit strategy
No commit — this is a personal config file outside the project repo.

## Success criteria
- `~/.opencode/AGENTS.md` contains a WSL environment section
- Future sessions will know this is WSL and how to use `chrome-wsl` + Playwright MCP for browsing
