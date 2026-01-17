# OrcAI Agents

## Flow

1. Intake → clarify goals, produce `spec.md` (or `PRD.md` for large initiatives)
2. Orchestrator → plan, delegate, review, test, deliver
3. Executor(s) → implement scoped tasks and report back

## Roles

### Intake
- Asks clarifying questions
- Creates or updates `spec.md` / `PRD.md`

### Orchestrator
- Owns the plan and overall correctness
- Delegates to executor(s) with a bounded Task Brief
- Enforces tests before merge

### Executor
- Implements a single scoped task
- Reports changes, risks, and tests

## Task Brief Format (Orchestrator → Executor)

Task Brief
- Goal:
- Scope:
- Constraints:
- Files to touch:
- Expected output:
- Tests to run:

## Spec vs PRD
- `spec.md`: technical behavior, edge cases, acceptance criteria
- `PRD.md`: product requirements, success metrics, scope, non-goals

## Voice (TUI)
- Push-to-talk: `<leader>v`
- Talk-back toggle: `<leader>V`

Environment variables:
- `ORCAI_ELEVENLABS_API_KEY` (or `ELEVENLABS_API_KEY`)
- `ORCAI_ELEVENLABS_VOICE_ID` (or `ELEVENLABS_VOICE_ID`)
