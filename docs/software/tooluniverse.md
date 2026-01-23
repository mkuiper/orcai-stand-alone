# ToolUniverse

## Purpose
- Access a large catalog of tools/APIs via MCP for AI‑scientist workflows.

## Install
```
pip install tooluniverse
tooluniverse-smcp
```

## Configuration
- Enable in `.opencode/opencode.jsonc`:
```
"tooluniverse": {
  "type": "local",
  "command": ["script/mcp/tooluniverse"],
  "enabled": true
}
```

## Common commands
- Check MCP status:
```
orcai mcp list
```

## Known issues
- Requires Python and compatible system dependencies for some tools.

## References
- https://github.com/mims-harvard/ToolUniverse
