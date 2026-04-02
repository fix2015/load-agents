# load-agents

> CLI tool to discover, search, and install AI agent definitions for Claude Code, Cursor, Codex, Copilot, and more.

[![npm version](https://img.shields.io/npm/v/load-agents.svg)](https://www.npmjs.com/package/load-agents)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**load-agents** aggregates agent definitions from multiple sources into a single searchable registry, letting you install any agent with one command. No more cloning repos or manually copying files.

## Quick Start

```bash
# Install an agent instantly (no install needed)
npx load-agents install code-reviewer

# Or install globally
npm install -g load-agents
load-agents install security-auditor
```

## Features

- **30+ agents** from official and community sources, pre-indexed and ready to install
- **Multi-tool support** — install agents for Claude Code, Cursor, Codex, or Copilot
- **Fast search** — find agents by name, description, or tags
- **Auto-scraper** — update the registry from GitHub sources with `load-agents update`
- **Programmatic API** — use as a library in your own tools

## Commands

### Install an agent

```bash
load-agents install <name>                # Install for Claude Code (default)
load-agents install <name> --tool copilot # Install for GitHub Copilot
load-agents install <name> --tool cursor  # Install for Cursor
load-agents install <name> --global       # Install globally (~/.claude/agents/)
load-agents install <name> -o ./my-path   # Custom output path
load-agents <name>                        # Shorthand for install
```

### Search & browse

```bash
load-agents list                       # List all agents
load-agents list --source anthropics   # Filter by source
load-agents list --tag devops          # Filter by tag
load-agents list --tool copilot        # Filter by compatible tool

load-agents search security            # Search by keyword
load-agents search "api design" --tag backend

load-agents info code-reviewer         # Detailed info about an agent
load-agents tags                       # Show all tags with counts
load-agents sources                    # Show all agent sources
```

### Update registry

```bash
load-agents update                           # Fetch latest agents from GitHub
GITHUB_TOKEN=ghp_xxx load-agents update      # Use token for higher rate limits
```

### JSON output

```bash
load-agents list --json                # Machine-readable output
load-agents search react --json
load-agents info code-reviewer --json
```

## Supported Tools

| Tool | Install Location (local) | Install Location (global) |
|------|-------------------------|--------------------------|
| Claude Code | `.claude/agents/<name>.md` | `~/.claude/agents/<name>.md` |
| Cursor | `.cursor/agents/<name>.md` | `~/.cursor/agents/<name>.md` |
| Codex | `.codex/agents/<name>.md` | `~/.codex/agents/<name>.md` |
| Copilot | `.github/agents/<name>.md` | `~/.github/agents/<name>.md` |

## Agent Sources

| Source | Repository | Type | Agents |
|--------|-----------|------|--------|
| Copilot Developer | [ABilenduke/copilot-developer](https://github.com/ABilenduke/copilot-developer) | Community | 20 |
| Anthropic | [anthropics/skills](https://github.com/anthropics/skills) | Official | 3 |
| Antigravity | [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills) | Community | 17 |

## Programmatic API

```javascript
const { findAgent, searchAgents, installAgent } = require('load-agents');

// Search
const results = searchAgents('security', { tag: 'devops' });

// Get agent info
const agent = findAgent('code-reviewer');

// Install programmatically
await installAgent(agent, { tool: 'copilot', global: true });
```

## Rebuild the Registry

The scraper fetches agent metadata from all configured GitHub sources:

```bash
npm run scrape                          # Rebuild from GitHub
GITHUB_TOKEN=ghp_xxx npm run scrape     # With auth for higher rate limits
```

## Contributing

1. Fork the repo
2. Add agents to `data/agents-registry.json` or add a new source in `src/scraper/index.js`
3. Submit a PR

### Adding a new agent source

Add an entry to the `SOURCES` array in `src/scraper/index.js`:

```javascript
{
  id: 'your-source',
  repo: 'owner/repo',
  path: 'agents',
  type: 'community',
  url: 'https://github.com/owner/repo',
  compatible: ['claude-code', 'copilot', 'cursor'],
}
```

## License

MIT
