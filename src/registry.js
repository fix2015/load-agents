'use strict';

const path = require('path');
const fs = require('fs');

const REGISTRY_PATH = path.join(__dirname, '..', 'data', 'agents-registry.json');

let _cache = null;

function loadRegistry() {
  if (_cache) return _cache;
  const raw = fs.readFileSync(REGISTRY_PATH, 'utf-8');
  _cache = JSON.parse(raw);
  return _cache;
}

function getAllAgents() {
  return loadRegistry().agents;
}

function getSources() {
  return loadRegistry().sources;
}

function getVersion() {
  return loadRegistry().version;
}

function getUpdatedAt() {
  return loadRegistry().updated_at;
}

function findAgent(name) {
  const agents = getAllAgents();
  // Exact match first
  const exact = agents.find(a => a.name === name);
  if (exact) return exact;
  // Case-insensitive
  const lower = name.toLowerCase();
  return agents.find(a => a.name.toLowerCase() === lower);
}

function searchAgents(query, { tag, tool } = {}) {
  let agents = getAllAgents();

  if (tag) {
    agents = agents.filter(a => a.tags.includes(tag.toLowerCase()));
  }
  if (tool) {
    agents = agents.filter(a => a.compatible.includes(tool.toLowerCase()));
  }

  if (!query) return agents;

  const q = query.toLowerCase();
  return agents.filter(a => {
    return (
      a.name.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.tags.some(t => t.includes(q))
    );
  });
}

function filterAgents({ source, tag, tool } = {}) {
  let agents = getAllAgents();
  if (source) {
    agents = agents.filter(a => a.source === source);
  }
  if (tag) {
    agents = agents.filter(a => a.tags.includes(tag.toLowerCase()));
  }
  if (tool) {
    agents = agents.filter(a => a.compatible.includes(tool.toLowerCase()));
  }
  return agents;
}

function getAllTags() {
  const agents = getAllAgents();
  const tagMap = {};
  for (const agent of agents) {
    for (const tag of agent.tags) {
      tagMap[tag] = (tagMap[tag] || 0) + 1;
    }
  }
  return Object.entries(tagMap)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));
}

function clearCache() {
  _cache = null;
}

module.exports = {
  loadRegistry,
  getAllAgents,
  getSources,
  getVersion,
  getUpdatedAt,
  findAgent,
  searchAgents,
  filterAgents,
  getAllTags,
  clearCache,
  REGISTRY_PATH,
};
