# Decision: File-Based Storage for Organization State

**Date**: 2026-02-01
**Decision Makers**: CEO Agent, CTO Agent
**Status**: Approved
**Impact**: High - affects entire architecture

## Context

Need to store organization state including:
- Agent definitions
- Projects and tasks
- Corporate memory
- Learning outcomes
- Meeting notes

## Options Considered

### 1. Database (PostgreSQL/SQLite)
**Pros**: Fast queries, ACID transactions, mature tooling
**Cons**: Requires setup, harder to inspect, not git-friendly, adds dependency

### 2. File-Based (JSON/Markdown)
**Pros**: Human-readable, git version control, no setup, easy backup, transparent
**Cons**: Slower queries, manual indexing, potential file conflicts

### 3. Hybrid (Files + Vector DB)
**Pros**: Best of both worlds
**Cons**: Complex, two sources of truth

## Decision

**Use file-based storage (JSON/Markdown) with optional vector DB for search later.**

## Rationale

1. **Transparency**: Anyone can inspect and understand the system state
2. **Version Control**: Full git history of all organizational changes
3. **Portability**: Easy backup, restore, and migration
4. **No Dependencies**: Works immediately without database setup
5. **Debugging**: Can inspect files directly during development
6. **Human-Editable**: Users can manually fix issues if needed

For performance-critical features like semantic search, we can add a vector DB later while keeping files as source of truth.

## Implementation

- All state in `.orcai/` directory
- JSON for structured data (agents, org, config)
- Markdown for documents (memory, learnings, notes)
- One file per entity for git-friendly diffs
- Directories organize by domain

## Trade-offs Accepted

- Slower queries (acceptable for small-medium orgs)
- Manual indexing (can optimize later)
- File I/O overhead (not critical for our use case)

## Success Metrics

- Can inspect entire org state by browsing files
- Full git history of all changes
- Zero setup time for new organizations
- Easy to backup and restore

## Related

- See: `.orcai/` directory structure
- See: `docs/architecture-org-os.md`
