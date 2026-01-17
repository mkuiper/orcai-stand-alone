# Gemini Skills Placeholder

Gemini does not publish an official "skills catalog" repo. The supported model extension path
is tools/function calling and MCP servers. This placeholder documents where Gemini integrations
should be recorded once an official catalog exists.

Recommended pattern:
- Track tool definitions (JSON schema) in `tools/`.
- Track reusable prompts/templates in `prompts/`.
- Track MCP connections in `.codex/mcp/catalogs/`.

Primary references:
- Gemini function calling: https://ai.google.dev/gemini-api/docs/function-calling
- Gemini + MCP guidance: https://ai.google.dev/gemini-api/docs/mcp
