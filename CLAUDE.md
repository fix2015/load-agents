# CLAUDE.md

## Project Overview

**load-agents** is a CLI tool to discover, search, and install AI agent definitions for Claude Code, Cursor, Codex, Copilot, and more.

## Architecture

- `bin/load-agents.js` — CLI entry point using Commander
- `src/registry.js` — Agent registry loader and query functions
- `src/installer.js` — Downloads and installs agent files to tool-specific paths
- `src/commands/` — CLI command handlers (install, list, search, info, tags, sources, update)
- `src/scraper/index.js` — GitHub scraper to rebuild registry from remote sources
- `data/agents-registry.json` — Pre-built registry of agent definitions
- `test/` — Node.js built-in test runner tests

## Commands

```bash
npm start              # Run the CLI
npm test               # Run tests
npm run scrape         # Rebuild registry from GitHub
```

## Key Conventions

- CommonJS modules (no ESM)
- chalk v4, ora v5 (CJS-compatible versions)
- node-fetch v2 (CJS-compatible)
- All agents install as `<name>.md` files
- Tests use Node.js built-in test runner (`node:test`)
