# Research Job Runner (Spec)

This spec defines how Orcai executes a research job and reports outcomes.

## Inputs
- Job config (see `.opencode/research-jobs.md`)
- Target document path
- Optional run scope (sections, date range)

## Outputs
- Updated document with citations
- Changelog entry
- Run summary: sources, deltas, open questions

## Execution flow
1. Load job config and target document.
2. Identify stale sections (by date or missing citations).
3. Create Task Briefs per section for executor agents.
4. Collect sources and summaries from executors.
5. Verify claims against primary sources.
6. Apply doc updates and add citations.
7. Write changelog and run summary.

## Success criteria
- Every updated claim is cited.
- No unverified edits are merged into the document.
- Run summary includes sources and open questions.

## Failure modes
- Missing sources → skip section and log as open question.
- Conflicting sources → note conflict and defer update.
- Tool failures → halt update and preserve original doc.
