# Orcai Bootstrap (/init-orcai)

Use `/init-orcai` to bootstrap a new project with Orcai agents and skills, then generate `AGENTS.md`.

## Prerequisite
Set the source repo path:
```
export ORCAI_TEMPLATE_REPO=/path/to/orcai
```

## What it does
1. Copies `.opencode/agent/` and `.opencode/skill/` from the Orcai repo into the current project.
2. Backs up any existing local agent/skill directories.
3. Runs `/init` to create or update `AGENTS.md` for this repo.

## Command
```
/init-orcai
```

## Notes
- If the source repo doesn’t include an agents or skills directory, that part is skipped.
- The bootstrap does not modify files outside `.opencode/`.
