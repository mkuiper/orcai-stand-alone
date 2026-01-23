---
description: bootstrap a new project with Orcai agents and skills
agent: orchestrator
subtask: true
---

Bootstrap this repo using Orcai templates.

Steps:
1) Determine the source repo path from the environment variable ORCAI_TEMPLATE_REPO.
   - If missing, ask the user to provide the path.
2) Verify the source exists and contains `.opencode/agent/` and/or `.opencode/skill/`.
3) Ensure `.opencode/` exists in this repo.
4) If `.opencode/agent/` or `.opencode/skill/` already exist, move them to a timestamped backup:
   - `.opencode/agent.bak-YYYYMMDD-HHMMSS`
   - `.opencode/skill.bak-YYYYMMDD-HHMMSS`
5) Copy the source directories into `.opencode/agent/` and `.opencode/skill/`.
6) Run `/init` to generate or update AGENTS.md for this repo.

Notes:
- Do not delete data outside `.opencode/`.
- If the source repo is missing one of the directories, copy only what exists and report it.

Output:
- Which paths were copied
- Where backups were written (if any)
- Any missing directories
