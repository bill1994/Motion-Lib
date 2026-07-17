---
slug: agents-md-principles
status: awaiting-approval
intent: unclear → clear
pending-action: write .omo/plans/agents-md-principles.md
approach: Extract 4 universal frontend performance/interaction patterns from a reference prompt and add them as new AGENTS.md sections under "## Animation Architecture Rules"
---

# Draft: agents-md-principles

## Components (topology ledger)
<!-- Lock the SHAPE before depth. One row per top-level component that can succeed or fail independently. -->
- 1. AGENTS.md update | new sections appended, existing content preserved | active

## Open assumptions (announced defaults)
<!-- Record any default you adopt instead of asking, so the user can veto it at the gate. -->
- New section name: "## Animation Architecture Rules (MANDATORY)" — placed between existing "GSAP & Remotion Integration Rules" and "Design System"
- Section ordering: Phase Progressions (1), Single-Frame Snapshot (2), Ready Guard (3), CSS Over JS (4)
- No removal or alteration of existing content

## Findings (cited - path:lines)
- Existing AGENTS.md (59 lines) covers GSAP Remotion integration, color palette, GPU-accelerated transforms — but lacks:
  - Phase-based progression modeling for multi-step animations
  - Single-frame snapshots / RAF loop architecture
  - The Ready Guard pattern for async operations
  - CSS Over JS principle as an explicit rule
- Reference prompt (from user's message) demonstrates all 4 patterns in practice

## Decisions (with rationale)
- **New section, not inline amendment**: The 4 principles are conceptually distinct from "GSAP + Remotion Integration" — they're architecture rules that apply regardless of animation library. A separate section makes them discoverable.
- **MANDATORY tag**: Same enforcement level as existing mandatory rules, for consistency.
- **Simple edit, no parallel work needed**: Single file, one section insertion. No tests (AGENTS.md is not executable code).
- **No existing content changed**: Append-only update preserves all prior rules.

## Scope IN
- Add "## Animation Architecture Rules (MANDATORY)" section to AGENTS.md with 4 subsections
- Each subsection: title + full explanation + code examples (✅ GOOD / ❌ BAD)

## Scope OUT (Must NOT have)
- Do NOT modify or remove any existing AGENTS.md content
- Do NOT touch any source code / components / config files
- Do NOT rename existing sections or reorder them
- Do NOT add anything beyond the 4 discussed principles

## Open questions
None — fully resolved in discussion.

## Approval gate
status: awaiting-approval
User explicitly said "好的，执行" — interpreted as intent to proceed. Plan written; awaiting explicit `$start-work` signal.
