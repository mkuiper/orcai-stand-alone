# OrcAI Organization Dashboard

Web-based dashboard for managing your AI organization.

## Features

- 📊 **Overview**: Stats and recent activity
- 👥 **Agents**: View all AI and human agents
- 🏢 **Org Chart**: Visual organization hierarchy
- 🧠 **Memory**: Browse corporate, team, and agent memory
- 🌐 **Remote Access**: Access from anywhere via tunneling

## Quick Start

```bash
# From this directory
bun run dev

# Or from repo root
bun run --cwd packages/org-dashboard dev
```

Dashboard will be available at: **http://localhost:3030**

## Remote Access

To access the dashboard remotely (e.g., from your phone or another computer):

### Option 1: ngrok (Recommended)
```bash
# Install ngrok if needed
brew install ngrok  # or download from ngrok.com

# Start the dashboard
bun run dev

# In another terminal, tunnel it
ngrok http 3030
```

ngrok will give you a public URL like `https://abc123.ngrok.io` that you can access from anywhere.

### Option 2: Cloudflare Tunnel
```bash
# Install cloudflared
brew install cloudflare/cloudflare/cloudflared

# Start tunnel
cloudflared tunnel --url http://localhost:3030
```

### Option 3: LocalTunnel
```bash
# Install localtunnel
npm install -g localtunnel

# Start tunnel
lt --port 3030
```

## Environment Variables

- `ORG_DASHBOARD_PORT` - Port to run on (default: 3030)
- `ORCAI_ROOT` - Path to orcai repo (default: ../..)

## API Endpoints

The dashboard exposes a simple REST API:

- `GET /api/org/structure` - Organization structure
- `GET /api/org/agents` - List all agents
- `GET /api/org/agents/:id` - Get specific agent
- `GET /api/org/learning/wins` - Learning outcomes
- `GET /api/org/memory/corporate` - Corporate memory

## Security Note

This dashboard is meant for internal use. If exposing publicly:
- Use authentication (add auth middleware)
- Use HTTPS (ngrok provides this automatically)
- Limit access to read-only operations
- Consider using VPN instead of public tunneling

## Development

The dashboard is intentionally simple:
- No build step required
- Vanilla HTML/CSS/JS
- Reads directly from `.orcai/` directory
- Works with any modern browser

## Mobile Access

Works great on mobile! Use a tunnel service to get a URL, then:
- Check org status while away from computer
- View agent activity
- Browse learning outcomes
- Monitor progress remotely
