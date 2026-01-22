# Ralph Loop (Orcai)

Ralph Loop is an iterative automation mode that repeatedly runs Orcai on a task until completion, using persistent artifacts as memory.

## Concept
Each iteration is a fresh run. Memory persists via:
- Git history (commits from prior iterations)
- `progress.md` (append-only learnings)
- `prd.json` (task list with pass/fail state)

## When to use
- POC programs or research projects with clear acceptance criteria.
- Tasks that benefit from repeated test → fix → commit loops.

## Workflow
1. Define a PRD and convert to `prd.json`.
2. Start a Ralph Loop run.
3. Orcai picks the highest-priority story that `passes: false`.
4. Orcai implements the story, runs checks, and commits if successful.
5. Orcai marks the story as `passes: true`, appends learnings to `progress.md`.
6. Repeat until all stories pass or max iterations reached.

## Stop conditions
- All stories pass.
- Max iterations reached.
- Manual cancel.

## Required artifacts
- `prd.json` (task list)
- `progress.md` (append-only learnings)
- Git commits per completed story

## Safety
- Always set a max iteration limit.
- Require tests or lint to pass before marking a story complete.

## Planned command (proposal)
```
/ralph-loop "<prompt>" --max-iterations 20 --completion-promise "COMPLETE"
```

## Notes on /commands
- Orcai already supports slash commands; Ralph Loop would be implemented as a new command.
- A stop-hook loop (like Claude’s plugin) is also possible, but the current plan is to run it as a command.

## Notes
- This is a doc-only proposal. Implementation is tracked in `docs/tasks.md`.
