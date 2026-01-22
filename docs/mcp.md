# MCP Servers

This doc lists suggested MCP servers for Orcai and how to configure them.

## GitHub MCP (remote)
Use GitHub's MCP server for repository context and GitHub operations.

Config example (requires a GitHub token):
```
"github": {
  "type": "remote",
  "url": "https://api.githubcopilot.com/mcp/",
  "headers": {
    "Authorization": "Bearer YOUR_GITHUB_PAT"
  }
}
```

Notes:
- The MCP server endpoint is provided by GitHub. 
- A GitHub personal access token is required in the `Authorization` header.

## Bio-MCP: BLAST (local)
Run the BLAST MCP server locally (from a cloned repo):
```
git clone https://github.com/bio-mcp/bio-mcp-blast
cd bio-mcp-blast
python -m src.server
```

Set `BIO_MCP_BLAST_DIR` in `.opencode/opencode.jsonc` and use:
```
command: ["script/mcp/bio-blast"]
```

## Bio-MCP: BWA (local)
Run the BWA MCP server locally (from a cloned repo):
```
git clone https://github.com/bio-mcp/bio-mcp-bwa
cd bio-mcp-bwa
python -m src.server
```

Set `BIO_MCP_BWA_DIR` in `.opencode/opencode.jsonc` and use:
```
command: ["script/mcp/bio-bwa"]
```

## UniProt MCP (local)
Install and run the UniProt MCP server:
```
pip install uniprot-mcp
uniprot-mcp
```

Then enable in `.opencode/opencode.jsonc`:
```
"uniprot": {
  "type": "local",
  "command": ["uniprot-mcp"],
  "enabled": true
}
```

## ToolUniverse MCP (local)
ToolUniverse provides a large catalog of real-world tools and APIs exposed through a unified protocol.

Install and run the MCP server:
```
pip install tooluniverse
tooluniverse-mcp
```

Then enable in `.opencode/opencode.jsonc`:
```
"tooluniverse": {
  "type": "local",
  "command": ["tooluniverse-mcp"],
  "enabled": true
}
```

## Verify MCP status
Use the CLI to check connections:
```
orcai mcp list
```
You should see each configured MCP server and its status (connected/failed/needs auth).

## Troubleshooting
- **Auth required**: run `orcai mcp auth <name>` and complete the OAuth flow.
- **Timeouts**: increase `timeout` in the MCP config for the server.
- **Local server failed**: run the server command directly to view stderr.

## References
- https://github.com/mcp/github/github-mcp-server
- https://github.com/bio-mcp/bio-mcp-blast
- https://mcpservers.org/servers/bio-mcp/bio-mcp-bwa
- https://glama.ai/mcp/servers/%40josefdc/Uniprot-MCP
- https://github.com/mims-harvard/ToolUniverse
