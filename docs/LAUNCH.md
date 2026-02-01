# Launching OrcAI (orcai-stand-alone)

## What is This?

You're in **orcai-stand-alone** - a fork of OpenCode that's being extended into an AI Organization OS.

- **Location**: `/home/mike/orcai`
- **GitHub**: `git@github.com:mkuiper/orcai-stand-alone.git`
- **Current Branch**: `feature/org-os` (for organization OS development)

## Quick Start

### 1. Launch OrcAI CLI

From this directory:

```bash
./orcai
```

Or from anywhere if you add it to your PATH:

```bash
export PATH="/home/mike/orcai:$PATH"
orcai
```

### 2. What the launcher does

The `./orcai` script:
- Sets up model caching in `~/.cache/orcai/` or `.orcai-cache/`
- Disables external model fetching (uses local cache)
- Runs the local build from `packages/opencode/` using bun
- Loads your custom agents, skills, and commands from `.opencode/`

### 3. Environment Variables (Optional)

```bash
# Custom orcai installation path
export ORCAI_ROOT=/path/to/orcai

# GitHub auto-push token (for orchestrator)
export ORCAI_GITHUB_TOKEN=your_github_pat

# Voice features (ElevenLabs)
export ORCAI_ELEVENLABS_API_KEY=your_key
export ORCAI_ELEVENLABS_VOICE_ID=your_voice_id
```

## Development Workflow

### Build the project

```bash
bun install
bun run build
```

### Run in dev mode

```bash
cd packages/opencode
bun run dev
```

### Test your changes

```bash
./orcai
# Or
bun run --cwd packages/opencode src/index.ts
```

## Custom Features

Your orcai-stand-alone includes:

- **Custom Agents**: orchestrator, executor, intake (see `.opencode/agent/`)
- **Custom Commands**: `/init-orcai`, `/prd`, `/ralph-loop` (see `.opencode/command/`)
- **Custom Skills**: md-openmm, mcp-setup (see `.opencode/skill/`)
- **Voice Integration**: Configured in `.opencode.toml`
- **Auto-push**: Configured in `.opencode/orchestrator.json`

## Branches

- `dev` - Stable orcai code assistant
- `feature/org-os` - NEW: AI Organization OS architecture (current)

## What's Next?

We're building the Organization OS features:
- Multi-agent orchestration with human names
- Corporate memory and learning outcomes
- Scheduled meetings and intelligence gathering
- Dashboard for org management

See `docs/architecture-org-os.md` (coming soon) for details.
