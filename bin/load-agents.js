#!/usr/bin/env node

'use strict';

const { program } = require('commander');
const pkg = require('../package.json');

const installCmd = require('../src/commands/install');
const listCmd = require('../src/commands/list');
const searchCmd = require('../src/commands/search');
const infoCmd = require('../src/commands/info');
const updateCmd = require('../src/commands/update');
const tagsCmd = require('../src/commands/tags');
const sourcesCmd = require('../src/commands/sources');

program
  .name('load-agents')
  .version(pkg.version)
  .description('Discover, search, and install AI agent definitions for Claude Code, Cursor, Codex, Copilot, and more');

program
  .command('install <name>')
  .alias('i')
  .description('Install an agent by name')
  .option('-t, --tool <tool>', 'Target tool: claude-code, cursor, codex, copilot (default: claude-code)', 'claude-code')
  .option('-g, --global', 'Install globally for the tool (e.g. ~/.claude/agents/)')
  .option('-o, --output <path>', 'Custom output path for the agent file')
  .action(installCmd);

program
  .command('list')
  .alias('ls')
  .description('List all available agents')
  .option('-s, --source <source>', 'Filter by source (anthropics, copilot-developer, antigravity, etc.)')
  .option('-t, --tag <tag>', 'Filter by tag')
  .option('--tool <tool>', 'Filter by compatible tool')
  .option('-j, --json', 'Output as JSON')
  .action(listCmd);

program
  .command('search <query>')
  .alias('s')
  .description('Search agents by name, description, or tags')
  .option('-t, --tag <tag>', 'Also filter by tag')
  .option('--tool <tool>', 'Filter by compatible tool')
  .option('-j, --json', 'Output as JSON')
  .action(searchCmd);

program
  .command('info <name>')
  .description('Show detailed information about an agent')
  .option('-j, --json', 'Output as JSON')
  .action(infoCmd);

program
  .command('tags')
  .description('List all available tags with agent counts')
  .action(tagsCmd);

program
  .command('sources')
  .description('List all agent sources/repositories')
  .action(sourcesCmd);

program
  .command('update')
  .description('Update the agents registry from remote sources')
  .action(updateCmd);

// Default: if first arg matches an agent name, install it
program.arguments('[name]').action((name, opts) => {
  if (name) {
    installCmd(name, { tool: 'claude-code' });
  } else {
    program.help();
  }
});

program.parse(process.argv);
