# Organization Dashboard Guide

## Overview

The OrcAI Organization Dashboard is a web-based interface for managing and monitoring your AI organization. It provides real-time visibility into agents, hierarchy, memory, and learning outcomes.

## Quick Start

### 1. Start the Dashboard

```bash
# From repo root
cd packages/org-dashboard
bun run dev

# Dashboard available at: http://localhost:3030
```

### 2. Access Locally

Open your browser to: **http://localhost:3030**

### 3. Access Remotely

To check on your organization from anywhere (phone, laptop, remote computer):

#### Option A: ngrok (Recommended)

```bash
# Install ngrok
brew install ngrok

# Start dashboard first
cd packages/org-dashboard && bun run dev

# In another terminal, create tunnel
ngrok http 3030

# You'll get a URL like: https://abc123.ngrok.io
# Access from anywhere!
```

#### Option B: Cloudflare Tunnel

```bash
# Install cloudflared
brew install cloudflare/cloudflare/cloudflared

# Start tunnel
cloudflared tunnel --url http://localhost:3030
```

#### Option C: LocalTunnel

```bash
# Install localtunnel
npm install -g localtunnel

# Start tunnel
lt --port 3030
```

## Dashboard Features

### Overview Tab
- **Stats**: Total agents, AI vs human count, active agents
- **Recent Activity**: Latest learning outcomes and decisions
- At-a-glance organizational health

### Agents Tab
- **Grid View**: All agents with avatars and badges
- **Agent Details**: Role, team, model, reporting structure
- **Type Badges**: AI (blue) vs Human (purple)
- **Status Badges**: Active (green) vs inactive
- **Contact Info**: For human agents

### Org Chart Tab
- **Visual Hierarchy**: Tree view of reporting structure
- **Interactive**: Click to focus on specific branches
- **Color-coded**: AI agents (blue), humans (purple)

### Memory Tab
- **Corporate Memory**: Principles, decisions, knowledge base
- **Team Memory**: Team-specific knowledge
- **Agent Memory**: Personal context and notes

## Human Agents

### Adding a Human to Your Org

1. Create a new JSON file in `.orcai/organization/agents/`:

```json
{
  "id": "your-name",
  "name": "Your Name",
  "role": "Your Role",
  "type": "human",
  "avatar": "👤",

  "org_structure": {
    "reports_to": null,
    "manages": ["agent-id-1", "agent-id-2"],
    "team": "executive"
  },

  "contact": {
    "email": "you@example.com",
    "slack": "@you"
  },

  "responsibilities": [
    "Guide strategic direction",
    "Review AI agent work",
    "Make final decisions"
  ],

  "status": "active"
}
```

2. Add yourself to `org.json` hierarchy

3. Refresh the dashboard

### Human vs AI Agents

**Human Agents:**
- Don't need `llm` configuration
- Can have `contact` info
- Participate in org structure
- Can be assigned tasks
- Make final decisions
- Provide domain expertise

**AI Agents:**
- Require `llm` configuration
- Have `memory` settings
- Execute tasks autonomously
- Report to humans or other AIs

## Mobile Access

The dashboard is mobile-optimized! Once you have a tunnel URL:

1. Visit the ngrok/tunnel URL on your phone
2. View agent status on the go
3. Check learning outcomes
4. Monitor organizational health
5. Bookmark for quick access

## Use Cases

### 1. Remote Monitoring
Check on your organization while traveling:
- Are agents active?
- What have they learned recently?
- Any blockers or issues?

### 2. Team Collaboration
Share the dashboard with team members:
- Everyone sees current org state
- Understand who does what
- Track progress together

### 3. Presentations
Use for demos and presentations:
- Visual org chart
- Real-time stats
- Professional appearance

### 4. Mobile Check-ins
Quick status checks from anywhere:
- Phone-friendly interface
- Fast loading
- No login required (if tunneled)

## Security Considerations

### For Internal Use
- Dashboard reads directly from `.orcai/` files
- No authentication by default
- Safe for local/VPN access

### For Public Access
If exposing via tunnel:
- ✅ Use HTTPS (ngrok provides this)
- ✅ Consider adding authentication
- ✅ Make it read-only (already is)
- ⚠️ Don't commit sensitive data to `.orcai/`
- ⚠️ Use temporary tunnel URLs
- 💡 Better: Use VPN instead of public tunnel

### Recommended: VPN Access
Best approach for teams:
1. Set up Tailscale or similar VPN
2. Access dashboard via VPN
3. No public exposure needed
4. Secure by default

## Customization

### Change Port

```bash
ORG_DASHBOARD_PORT=4000 bun run dev
```

### Custom ORCAI Directory

```bash
ORCAI_ROOT=/path/to/orcai bun run dev
```

### Styling

Edit `packages/org-dashboard/index.html` CSS to customize:
- Colors
- Layout
- Fonts
- Animations

## Troubleshooting

### Dashboard won't load
- Check that `.orcai/` directory exists
- Verify `organization/org.json` is present
- Ensure agents/*.json files exist

### API errors
- Make sure ORCAI_ROOT points to correct location
- Check file permissions on `.orcai/` directory

### Remote access not working
- Verify dashboard is running locally first
- Check firewall settings
- Try a different tunnel service

## What's Next

Future dashboard features planned:
- ✅ View agents and org chart (done)
- ✅ Remote access (done)
- 🚧 Edit agent details via UI
- 🚧 Create new agents from UI
- 🚧 View learning outcomes inline
- 🚧 Real-time updates (websockets)
- 🚧 Agent chat interface
- 🚧 Task assignment UI
- 🚧 Meeting scheduling
- 🚧 Analytics and charts

## Related Docs

- `docs/architecture-org-os.md` - Full architecture
- `docs/LAUNCH.md` - How to launch orcai
- `packages/org-dashboard/README.md` - Technical details
