# Ralph Loop CLI (Draft)

This is a proposed interface for running Ralph Loop from Orcai.

## Command
```
/ralph-loop "<prompt>" --max-iterations 20 --completion-promise "COMPLETE"
```

## Options
- `--max-iterations <n>`: stop after N iterations.
- `--completion-promise <text>`: exact text signaling completion.

## Expected behavior
1. Load `prd.json` and pick the highest-priority story with `passes: false`.
2. Run Orcai for that story only.
3. Require tests/quality checks to pass.
4. Commit changes and update `prd.json` and `progress.md`.
5. Repeat until all stories pass or max iterations reached.

## Safety
- Always set a max iteration limit.
- Require tests before marking a story complete.

## Status
- Documentation-only; command not yet implemented.
