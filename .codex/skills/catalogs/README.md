# Skills Catalogs (Submodules)

This folder is reserved for vendored skills catalogs via git submodules.

Planned submodules:
- `openai-skills` (https://github.com/openai/skills)
- `anthropic-skills` (https://github.com/anthropics/skills)

If DNS or network is unavailable, add them later:
```
git submodule add https://github.com/openai/skills .codex/skills/catalogs/openai-skills
git submodule add https://github.com/anthropics/skills .codex/skills/catalogs/anthropic-skills
```
