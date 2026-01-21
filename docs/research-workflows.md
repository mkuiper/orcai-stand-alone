# Research Workflows

This document defines how Orcai runs research jobs and updates dynamic documents safely.

## Goals
- Run repeatable, auditable research sweeps.
- Update documents with citations and minimal drift.
- Capture deltas and summarize changes.

## Non-goals
- Replace peer review or primary-source validation.
- Perform unsourced, speculative edits.
- Automatically merge changes without review for sensitive domains.

## Roles
- Intake: clarify topic, scope, success criteria, cadence.
- Orchestrator: design the job, delegate research, verify evidence, approve updates.
- Executor(s): perform focused research tasks and return sources + summaries.
- Docs: draft document updates and changelog from verified evidence.

## Research job lifecycle
1. Define scope: topic, timeframe, priority sources, and exclusions.
2. Baseline: load existing dynamic doc and identify stale sections.
3. Discover: delegate targeted research tasks per section.
4. Verify: cross-check claims, prefer primary sources.
5. Update: patch doc sections with citations and deltas.
6. Summarize: create changelog and open questions.

## Evidence rules
- Every new claim must have at least one citation.
- Prefer primary sources; secondary sources only if primary unavailable.
- Conflicting sources must be noted with a brief neutral comparison.

## Update policy
- Avoid rewriting stable sections without evidence of change.
- Keep edits scoped to verified findings.
- Maintain a short changelog for each update run.

## Output artifacts
- Updated dynamic document (e.g. `docs/dynamic/ai-chem-synthesis.md`)
- `docs/dynamic/changelog.md` entry
- Research run summary (timestamp, sources, open questions)

## Cadence
- Manual runs are allowed at any time.
- Scheduled runs should be defined per document (monthly/quarterly).

## How to run a research job
1. Choose the job from `.opencode/research-jobs.md`.
2. Open the target dynamic document and note stale sections.
3. Delegate research tasks per section with citations required.
4. Verify sources and apply updates.
5. Add a changelog entry in `docs/dynamic/changelog.md`.
6. Record the run in `docs/research-run-summary.md`.

## Minimal job config (proposal)
```
name: ai-chem-synthesis
doc: docs/dynamic/ai-chem-synthesis.md
cadence: quarterly
sources:
  - primary: journals, arxiv, vendor docs
  - secondary: blogs, newsletters
sections:
  - models
  - datasets
  - tools
  - benchmarks
  - industry
```
