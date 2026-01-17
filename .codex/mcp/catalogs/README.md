# MCP Catalogs (Submodules)

This folder is reserved for vendored MCP catalogs via git submodules.

Planned submodules:
- `mcp-servers` (https://github.com/modelcontextprotocol/servers)
- `mcp-registry` (https://github.com/modelcontextprotocol/registry)
- `docker-mcp-registry` (https://github.com/docker/mcp-registry)

If DNS or network is unavailable, add them later:
```
git submodule add https://github.com/modelcontextprotocol/servers .codex/mcp/catalogs/mcp-servers
git submodule add https://github.com/modelcontextprotocol/registry .codex/mcp/catalogs/mcp-registry
git submodule add https://github.com/docker/mcp-registry .codex/mcp/catalogs/docker-mcp-registry
```
