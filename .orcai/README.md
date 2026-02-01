# OrcAI Organization Directory

This directory contains the AI Organization OS state and configuration.

## Structure

- **organization/** - Agent definitions, teams, hierarchy
- **projects/** - Active and archived projects with team assignments
- **memory/** - Three-tier memory system (corporate, team, agent)
- **learning/** - Learning outcomes, retrospectives, reusable patterns
- **meetings/** - Meeting schedules, notes, and templates
- **tools/** - Tool registry and container configurations
- **intelligence/** - Intelligence gathering and monitoring

## Key Files

- `organization/org.json` - Organizational structure and hierarchy
- `organization/agents/*.json` - Individual agent definitions
- `meetings/schedule.json` - Recurring meetings and scheduled tasks
- `tools/registry.json` - Available tools and permissions

## Philosophy

Everything is stored as human-readable JSON or Markdown files:
- Version controlled with git
- Easy to inspect and modify
- No database required
- Portable and backup-friendly

## Getting Started

1. Define your organization in `organization/org.json`
2. Create agents in `organization/agents/`
3. Set up initial corporate memory in `memory/corporate/`
4. Configure meetings in `meetings/schedule.json`
5. Launch the dashboard to visualize and manage

See `docs/architecture-org-os.md` for full documentation.
