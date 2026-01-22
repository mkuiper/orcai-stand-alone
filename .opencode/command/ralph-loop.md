---
description: Ralph loop (single-iteration)
agent: orchestrator
subtask: true
---

You are running one Ralph Loop iteration. Do NOT loop. The user will rerun /ralph-loop to continue.

Inputs:
- prd.json (task list with passes status)
- progress.md (append-only learnings)

Steps:
1) Load prd.json and pick the highest priority story with passes: false.
2) If none exist, respond with: <promise>COMPLETE</promise> and stop.
3) Implement ONLY that story. Keep changes minimal.
4) Run required checks (tests/typecheck). If unknown, ask the user for commands.
5) If checks pass:
   - Commit changes with message: "ralph: <story id> <title>"
   - Update prd.json to passes: true for that story
   - Append a short entry to progress.md (date, iteration, story, outcome, tests)
6) If checks fail:
   - Do not commit
   - Append a short entry to progress.md with failure reason and next steps

Output:
- Summary of changes
- Tests run (or why not)
- Next step: rerun /ralph-loop
