---
name: mcp-setup
description: configure MCP servers and validate connectivity
---

## Purpose
- Add or update MCP server configs and confirm they connect.

## When to use
- Setting up new MCP servers (GitHub, Bio‑MCP, UniProt).
- Troubleshooting MCP connection/auth issues.

## Workflow
1. Review `.opencode/opencode.jsonc` for MCP entries.
2. Add or update MCP configs with correct URLs/commands.
3. Set required environment variables.
4. Run `orcai mcp list` to verify status.
5. If OAuth is required, run `orcai mcp auth <name>`.

## Output format
- Updated config changes (files + summary)
- MCP status results
- Any blockers or missing credentials
