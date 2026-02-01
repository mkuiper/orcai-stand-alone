# AI Organization OS Architecture

## Vision

Transform orcai from a code assistant into a complete AI organization management system where human-named agents collaborate on projects, maintain corporate memory, conduct meetings, and continuously learn from outcomes.

## Core Capabilities

1. **Multi-Agent Orchestration**: Define agents with human names, roles, and specialized LLMs
2. **Organizational Structure**: Hierarchies, teams, reporting relationships
3. **Corporate Memory**: Three-tier memory (personal, team, corporate) + learning outcomes
4. **Scheduled Operations**: Meetings, maintenance, intelligence gathering
5. **Project Management**: Multiple concurrent projects with team assignments
6. **Learning System**: Capture wins/failures/experiments, extract reusable patterns
7. **Dashboard**: Visual management of the entire organization
8. **Tool Ecosystem**: Containerized tools with authorization

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Dashboard (Web UI)                        │
│  • Org Chart  • Projects  • Meetings  • Memory  • Learning  │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                  Orchestration Engine                        │
│  • Scheduler  • Agent Manager  • Memory Sys  • Tool Manager │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                      Agent Layer                             │
│  Alice (CEO) • Bob (CTO) • Carol (Research) • David (Dev)   │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                   Storage & Memory                           │
│  Agent Memory • Corporate Memory • Learning Library          │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

See `.orcai/` directory for:
- `organization/` - Agent definitions, teams, hierarchy
- `projects/` - Active and archived projects
- `memory/` - Three-tier memory system
- `learning/` - Outcomes, retrospectives, patterns
- `meetings/` - Schedules, notes, templates
- `tools/` - Container registry and configs
- `intelligence/` - Monitoring and reports

## Implementation Phases

### Phase 1: Foundation (Current)
- [x] Create feature branch
- [x] Project planning
- [ ] Agent identity system
- [ ] Organizational hierarchy
- [ ] Directory structure setup

### Phase 2: Memory System
- [ ] Personal agent memory
- [ ] Team memory
- [ ] Corporate knowledge base
- [ ] Learning outcomes capture

### Phase 3: Scheduling & Meetings
- [ ] Cron scheduler
- [ ] Meeting facilitator
- [ ] Automated note-taking
- [ ] Decision logging

### Phase 4: Intelligence & Learning
- [ ] Intelligence gathering agents
- [ ] Pattern recognition
- [ ] Retrospective automation

### Phase 5: Dashboard
- [ ] Org chart visualization
- [ ] Project management UI
- [ ] Memory search interface
- [ ] Analytics and metrics

## Key Design Decisions

### 1. File-Based Storage
All state stored as JSON/Markdown files for:
- Git version control
- Human readability
- Easy backup/restore
- No database dependencies

### 2. Human-Named Agents
Agents have names (Alice, Bob, Carol) instead of IDs:
- More intuitive for users
- Easier to track in conversations
- Personality and role association

### 3. Three-Tier Memory
- **Personal**: Agent-specific context and notes
- **Team**: Shared team knowledge
- **Corporate**: Organization-wide principles and decisions

### 4. Learning-First Culture
Every significant action creates learning outcomes:
- Wins (what worked)
- Failures (what didn't)
- Experiments (what we tried)
- Patterns (what we'll reuse)

## Getting Started

See `docs/LAUNCH.md` for setup instructions.

## Contributing

This is experimental work. See the task list and pick up an available task, or propose new features.

## Related Docs

- `docs/LAUNCH.md` - Setup and launch instructions
- `docs/org-os-tasks.md` - Detailed task breakdown
- `.orcai/organization/README.md` - Org structure docs (coming soon)
