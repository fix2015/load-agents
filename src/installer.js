'use strict';

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const os = require('os');

const TOOL_PATHS = {
  'claude-code': {
    global: path.join(os.homedir(), '.claude', 'agents'),
    local: '.claude/agents',
  },
  'cursor': {
    global: path.join(os.homedir(), '.cursor', 'agents'),
    local: '.cursor/agents',
  },
  'codex': {
    global: path.join(os.homedir(), '.codex', 'agents'),
    local: '.codex/agents',
  },
  'copilot': {
    global: path.join(os.homedir(), '.github', 'agents'),
    local: '.github/agents',
  },
};

async function fetchAgentContent(agent) {
  if (!agent.raw_url) {
    throw new Error(`No download URL available for agent "${agent.name}". Visit: ${agent.repo_url}`);
  }

  const response = await fetch(agent.raw_url);
  if (!response.ok) {
    throw new Error(`Failed to fetch agent: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

function getInstallPath(agent, { tool = 'claude-code', global: isGlobal = false, output } = {}) {
  if (output) return output;

  const toolConfig = TOOL_PATHS[tool];
  if (!toolConfig) {
    throw new Error(`Unknown tool: ${tool}. Supported: ${Object.keys(TOOL_PATHS).join(', ')}`);
  }

  const base = isGlobal ? toolConfig.global : toolConfig.local;

  return path.join(base, `${agent.name}.md`);
}

async function installAgent(agent, options = {}) {
  const content = await fetchAgentContent(agent);
  const installPath = getInstallPath(agent, options);
  const dir = path.dirname(installPath);

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(installPath, content, 'utf-8');

  return { installPath, size: content.length };
}

module.exports = {
  fetchAgentContent,
  getInstallPath,
  installAgent,
  TOOL_PATHS,
};
