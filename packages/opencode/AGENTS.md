# opencode agent guidelines

This file is for agentic coding tools working in `packages/opencode`.

## Quickstart commands

- Install deps: `bun install`
- Run CLI in dev mode: `bun dev` (same as `bun run --conditions=browser ./src/index.ts`)
- Typecheck: `bun run typecheck`
- Run all tests: `bun test`
- Run one test file: `bun test test/tool/grep.test.ts`
- Run one test by name (regex): `bun test -t "tool.grep" test/tool/grep.test.ts`

## Build / run

- Build: `bun run build` (runs `script/build.ts`)
- Dev entrypoint: `src/index.ts` (Bun + ESM)
- Package type: ESM (`"type": "module"` in `package.json`)

## Test commands (Bun test)

Tests live in `test/**/*.test.ts` and use `bun:test`.

- All tests: `bun test`
- Single file: `bun test test/session/session.test.ts`
- Multiple files/patterns: `bun test test/tool test/util`
- Single test name (regex): `bun test -t "should handle"`
- Update snapshots: `bun test -u`

Notes:

- Bun test config is in `bunfig.toml`.
- `bunfig.toml` sets `[test].preload = ["./test/preload.ts"]` to isolate test state.
- Coverage is enabled by default via `bunfig.toml` (`[test].coverage = true`).

## Lint / format

- No ESLint/Biome config is currently present in this package.
- Treat `bun run typecheck` + `bun test` as the primary CI-quality gates.
- Keep formatting consistent with the existing code (no semicolons, 2-space indent, trailing commas).

## Monorepo notes

- Default branch: `dev`.
- To regenerate the JavaScript SDK (from repo root): `./packages/sdk/js/script/build.ts`.
- Cursor rules: none found (`.cursor/rules/` or `.cursorrules`).
- Copilot rules: none found (`.github/copilot-instructions.md`).

## Imports

- Use ESM imports everywhere.
- Prefer `@/` path alias for internal modules under `src/` (see `tsconfig.json` paths).
  - Example: `import { Log } from "@/util/log"`
- Use relative imports for sibling files when it improves locality (common within a small folder).
- Use `import type` for type-only imports.
- Import ordering (keep it stable):
  1. Node built-ins (`path`, `fs/promises`, `url`, etc.)
  2. External deps (`zod`, `hono`, etc.)
  3. Internal modules (`@/…` or `../…`)

## Runtime validation and types

- Zod is the standard for runtime validation and public schemas.
  - Prefer `const Schema = z.object({ ... })` and `export type X = z.infer<typeof Schema>`.
  - Many files use `import z from "zod"`; follow local convention.
- Use TypeScript types/interfaces for internal structure when runtime validation is not needed.
- Avoid `any` unless you are bridging a 3rd-party boundary or a typed escape hatch is unavoidable.

## Naming conventions

- Variables/functions: `camelCase`.
- Types/classes/namespaces: `PascalCase`.
- Files: `kebab-case.ts` is common for leaf utilities, but match the existing folder’s convention.
- Prefer single-word names where reasonable (see `/home/mike/orcai/STYLE_GUIDE.md`).

## Formatting and control flow (local style)

From `/home/mike/orcai/STYLE_GUIDE.md` (this repo follows it):

- Prefer `const`; avoid `let` especially when paired with `if/else` assignment.
- Avoid `else`; prefer early returns.
- Avoid unnecessary destructuring; prefer `obj.prop` access to preserve context.
- Avoid `try/catch` where possible; use it only at boundaries (CLI entrypoints, IO, parsing).

## Error handling

- Prefer domain errors using `NamedError` (`@opencode-ai/util/error`) for expected failures.
  - Define errors with `NamedError.create("Name", z.object({...}))`.
  - Bubble `NamedError` up to the server/router layer; `src/server/server.ts` serializes them.
- Throw regular `Error` only for programmer errors or truly exceptional cases.
- Tools may throw to signal invalid calls, but messages should be actionable for an LLM/tool caller.

## Logging

- Use structured logging via `Log.create({ service: "name" })`.
- Prefer `log.info("message", { key: value })` over string concatenation.
- Keep PII/secrets out of logs.

## Project architecture patterns

- Namespaces are used heavily as a module pattern:
  - Example: `export namespace Server { ... }`, `export namespace Tool { ... }`.
- Dependency injection/context is usually done via `X.provide({ ... fn })` (ex: `Instance.provide`).
- Lazy initialization is done with `lazy(() => ...)` to keep startup fast.

## Tools system (agent tools)

Tools are defined with `Tool.define()` in `src/tool/*`.

- Shape:
  - `description`: plain text (often loaded from `*.txt`)
  - `parameters`: Zod schema
  - `execute(args, ctx)`: returns `{ title, metadata, output, attachments? }`
- Inputs must be validated with Zod; `Tool.define()` enforces this.
- Keep `metadata` small (intended for UI/state), and put large content in `output`.
- Output truncation:
  - Most tools rely on `Tool.define()` to apply truncation via `Truncate.output()`.
  - If a tool manages its own truncation, it should set `metadata.truncated` explicitly.

## Server notes

- Server uses Hono (`src/server/server.ts`) and routes in `src/server/routes/*`.
- OpenAPI spec generation is available via `Server.openapi()`; see `src/cli/cmd/generate.ts`.

## Testing conventions

- Prefer pure unit tests with `bun:test`.
- Use `test/fixture/fixture.ts` helpers (ex: `tmpdir`) for filesystem isolation.
- Tests assume the preload in `test/preload.ts` sets XDG dirs and clears provider env vars.
- Prefer Bun APIs (`Bun.file()`, `Bun.write()`, `Bun.spawn()`) when interacting with the runtime.
