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

## References
- https://github.com/mcp/github/github-mcp-server
- https://github.com/bio-mcp/bio-mcp-blast
- https://mcpservers.org/servers/bio-mcp/bio-mcp-bwa
- https://glama.ai/mcp/servers/%40josefdc/Uniprot-MCP
