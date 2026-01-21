# Research Jobs

This file defines minimal, repo-local research job configs.

## Minimal format
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

## Notes
- `name` must be unique per repo.
- `doc` is the target dynamic document to update.
- `cadence` is advisory (manual runs are always allowed).
- `sources` is a priority list; primary sources are preferred.
- `sections` map to headings in the target doc.
