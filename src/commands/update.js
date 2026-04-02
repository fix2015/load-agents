'use strict';

const chalk = require('chalk');
const ora = require('ora');
const fetch = require('node-fetch');
const fs = require('fs');
const { REGISTRY_PATH, clearCache, loadRegistry } = require('../registry');

const GITHUB_API = 'https://api.github.com';

const SOURCES = [
  {
    id: 'copilot-developer',
    repo: 'ABilenduke/copilot-developer',
    path: 'agents',
    type: 'community',
  },
  {
    id: 'anthropics',
    repo: 'anthropics/skills',
    path: 'skills',
    type: 'official',
  },
  {
    id: 'antigravity',
    repo: 'sickn33/antigravity-awesome-skills',
    path: 'skills',
    type: 'community',
  },
];

async function fetchRepoAgents(source) {
  const url = `${GITHUB_API}/repos/${source.repo}/contents/${source.path}`;
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'load-agents-cli',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error for ${source.repo}: ${response.status}`);
  }

  const items = await response.json();
  return items
    .filter(item => item.type === 'dir' || item.name.endsWith('.md'))
    .map(item => item.name.replace(/\.md$/, ''));
}

module.exports = async function update() {
  const spinner = ora('Checking for registry updates...').start();

  try {
    let newAgentsFound = 0;
    const registry = loadRegistry();
    const existingNames = new Set(registry.agents.map(a => a.name));

    for (const source of SOURCES) {
      spinner.text = `Scanning ${chalk.cyan(source.repo)}...`;
      try {
        const agentNames = await fetchRepoAgents(source);
        for (const name of agentNames) {
          if (!existingNames.has(name)) {
            registry.agents.push({
              name,
              description: `Agent from ${source.repo} (run "load-agents info ${name}" after next update)`,
              tags: [],
              source: source.id,
              compatible: ['claude-code', 'copilot'],
              raw_url: `https://raw.githubusercontent.com/${source.repo}/main/${source.path}/${name}.md`,
              repo_url: `https://github.com/${source.repo}/tree/main/${source.path}/${name}`,
            });
            existingNames.add(name);
            newAgentsFound++;
          }
        }
      } catch (err) {
        spinner.warn(chalk.yellow(`Failed to scan ${source.repo}: ${err.message}`));
        spinner.start();
      }
    }

    registry.updated_at = new Date().toISOString().split('T')[0];
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');
    clearCache();

    if (newAgentsFound > 0) {
      spinner.succeed(chalk.green(`Registry updated! Found ${newAgentsFound} new agent(s). Total: ${registry.agents.length}`));
    } else {
      spinner.succeed(chalk.green(`Registry is up to date. Total agents: ${registry.agents.length}`));
    }
  } catch (err) {
    spinner.fail(chalk.red(`Update failed: ${err.message}`));
    process.exit(1);
  }
};
