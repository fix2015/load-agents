#!/usr/bin/env node

'use strict';

/**
 * Scraper that fetches agent definitions from GitHub repositories and rebuilds
 * the local agents-registry.json. Run with: npm run scrape
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, '..', '..', 'data', 'agents-registry.json');
const GITHUB_API = 'https://api.github.com';

const SOURCES = [
  {
    id: 'copilot-developer',
    repo: 'ABilenduke/copilot-developer',
    path: 'agents',
    type: 'community',
    url: 'https://github.com/ABilenduke/copilot-developer',
    compatible: ['copilot', 'claude-code', 'cursor'],
  },
  {
    id: 'anthropics',
    repo: 'anthropics/skills',
    path: 'skills',
    type: 'official',
    url: 'https://github.com/anthropics/skills',
    compatible: ['claude-code'],
  },
  {
    id: 'antigravity',
    repo: 'sickn33/antigravity-awesome-skills',
    path: 'skills',
    type: 'community',
    url: 'https://github.com/sickn33/antigravity-awesome-skills',
    compatible: ['claude-code', 'cursor', 'codex', 'copilot'],
  },
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function githubFetch(url) {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'load-agents-scraper',
  };

  // Use GITHUB_TOKEN if available for higher rate limits
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(url, { headers });

  if (response.status === 403) {
    const resetTime = response.headers.get('x-ratelimit-reset');
    if (resetTime) {
      const waitMs = (parseInt(resetTime) * 1000) - Date.now() + 1000;
      console.log(`  Rate limited. Waiting ${Math.ceil(waitMs / 1000)}s...`);
      await sleep(waitMs);
      return githubFetch(url);
    }
  }

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchAgentDirs(source) {
  if (!source.path) return [];

  const url = `${GITHUB_API}/repos/${source.repo}/contents/${source.path}`;
  try {
    const items = await githubFetch(url);
    return items.filter(item => item.type === 'dir' || item.name.endsWith('.md')).map(item => item.name.replace(/\.md$/, ''));
  } catch (err) {
    console.error(`  Error fetching ${source.repo}: ${err.message}`);
    return [];
  }
}

function parseYamlFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const yaml = match[1];
  const result = {};
  for (const line of yaml.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    result[key] = value;
  }
  return result;
}

function inferTags(name, description = '') {
  const text = `${name} ${description}`.toLowerCase();
  const tagMap = {
    'frontend': ['react', 'vue', 'angular', 'svelte', 'css', 'html', 'frontend', 'ui', 'nextjs', 'tailwind'],
    'backend': ['api', 'server', 'backend', 'express', 'fastapi', 'django', 'rails', 'spring', 'nestjs', 'laravel'],
    'testing': ['test', 'playwright', 'jest', 'cypress', 'qa', 'e2e', 'tdd'],
    'devops': ['devops', 'ci', 'cd', 'docker', 'kubernetes', 'deploy', 'terraform', 'ansible'],
    'database': ['database', 'sql', 'postgres', 'mysql', 'mongo', 'redis', 'db'],
    'ai': ['ai', 'ml', 'llm', 'rag', 'embedding', 'fine-tun', 'prompt', 'claude', 'gpt', 'agent'],
    'security': ['security', 'owasp', 'auth', 'crypto', 'vulnerability', 'forensic', 'audit'],
    'mobile': ['mobile', 'ios', 'android', 'react-native', 'flutter', 'swift', 'kotlin'],
    'cloud': ['cloud', 'aws', 'azure', 'gcp', 'serverless'],
    'python': ['python', 'django', 'fastapi', 'flask', 'pandas'],
    'javascript': ['javascript', 'js', 'node', 'typescript', 'ts', 'react', 'vue', 'angular', 'svelte', 'nextjs'],
    'go': ['golang', 'go-'],
    'rust': ['rust'],
    'java': ['java', 'spring', 'jvm'],
    'documentation': ['doc', 'readme', 'wiki', 'documentation', 'technical-writing'],
    'code-review': ['review', 'pr', 'pull-request', 'code-review', 'reviewer'],
    'architecture': ['architect', 'microservice', 'monolith', 'design-pattern', 'system-design'],
    'performance': ['performance', 'optimize', 'profil', 'benchmark', 'speed'],
    'accessibility': ['accessibility', 'a11y', 'wcag', 'aria', 'screen-reader'],
    'migration': ['migration', 'upgrade', 'legacy', 'refactor', 'moderniz'],
    'debugging': ['debug', 'troubleshoot', 'error', 'fix', 'diagnos'],
  };

  const tags = new Set();
  for (const [tag, keywords] of Object.entries(tagMap)) {
    if (keywords.some(k => text.includes(k))) {
      tags.add(tag);
    }
  }

  return Array.from(tags);
}

async function fetchAgentMetadata(source, agentName) {
  const rawUrl = `https://raw.githubusercontent.com/${source.repo}/main/${source.path}/${agentName}.md`;

  try {
    const response = await fetch(rawUrl, {
      headers: { 'User-Agent': 'load-agents-scraper' },
    });
    if (!response.ok) return null;

    const content = await response.text();
    const frontmatter = parseYamlFrontmatter(content);
    return {
      description: frontmatter.description || '',
      name: frontmatter.name || agentName,
    };
  } catch {
    return null;
  }
}

async function scrapeAll() {
  console.log('Scraping agents from GitHub repositories...\n');

  const agents = [];
  const seenNames = new Set();

  for (const source of SOURCES) {
    console.log(`Scanning ${source.repo}...`);

    const dirs = await fetchAgentDirs(source);
    console.log(`   Found ${dirs.length} agent entries`);

    for (const name of dirs) {
      if (seenNames.has(name)) {
        console.log(`   Skipping duplicate: ${name}`);
        continue;
      }

      let description = '';
      let meta = null;

      if (['copilot-developer', 'anthropics'].includes(source.id)) {
        meta = await fetchAgentMetadata(source, name);
        if (meta?.description) description = meta.description;
        await sleep(100);
      }

      const tags = inferTags(name, description);

      agents.push({
        name,
        description: description || `${name.replace(/-/g, ' ')} agent from ${source.repo}`,
        tags,
        source: source.id,
        compatible: source.compatible,
        raw_url: `https://raw.githubusercontent.com/${source.repo}/main/${source.path}/${name}.md`,
        repo_url: `https://github.com/${source.repo}/tree/main/${source.path}/${name}`,
      });

      seenNames.add(name);
    }

    console.log('');
  }

  const registry = {
    version: '1.0.0',
    updated_at: new Date().toISOString().split('T')[0],
    sources: SOURCES.map(({ id, repo, path: p, type, url }) => ({ id, repo, path: p, type, url })),
    agents,
  };

  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');
  console.log(`Saved ${agents.length} agents to ${REGISTRY_PATH}`);
}

// Run if executed directly
if (require.main === module) {
  scrapeAll().catch(err => {
    console.error('Scraper failed:', err);
    process.exit(1);
  });
}

module.exports = { scrapeAll, inferTags, parseYamlFrontmatter };
