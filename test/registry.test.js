'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  getAllAgents,
  findAgent,
  searchAgents,
  filterAgents,
  getAllTags,
  getSources,
} = require('../src/registry');

describe('Registry', () => {
  it('should load all agents', () => {
    const agents = getAllAgents();
    assert.ok(agents.length > 0, 'Should have at least one agent');
  });

  it('should find agent by exact name', () => {
    const agent = findAgent('code-reviewer');
    assert.ok(agent, 'Should find code-reviewer');
    assert.strictEqual(agent.name, 'code-reviewer');
  });

  it('should find agent case-insensitively', () => {
    const agent = findAgent('Code-Reviewer');
    assert.ok(agent, 'Should find agent regardless of case');
  });

  it('should return undefined for unknown agent', () => {
    const agent = findAgent('nonexistent-agent-xyz');
    assert.strictEqual(agent, undefined);
  });

  it('should search by keyword in name', () => {
    const results = searchAgents('security');
    assert.ok(results.length > 0, 'Should find security-related agents');
    assert.ok(results.some(a => a.name.includes('security')));
  });

  it('should search by keyword in description', () => {
    const results = searchAgents('testing');
    assert.ok(results.length > 0, 'Should find testing-related agents');
  });

  it('should filter by tag', () => {
    const results = searchAgents('', { tag: 'frontend' });
    assert.ok(results.length > 0);
    assert.ok(results.every(a => a.tags.includes('frontend')));
  });

  it('should filter by source', () => {
    const results = filterAgents({ source: 'anthropics' });
    assert.ok(results.length > 0);
    assert.ok(results.every(a => a.source === 'anthropics'));
  });

  it('should filter by tool', () => {
    const results = filterAgents({ tool: 'claude-code' });
    assert.ok(results.length > 0);
    assert.ok(results.every(a => a.compatible.includes('claude-code')));
  });

  it('should get all tags with counts', () => {
    const tags = getAllTags();
    assert.ok(tags.length > 0);
    assert.ok(tags[0].tag);
    assert.ok(tags[0].count > 0);
    // Should be sorted by count descending
    for (let i = 1; i < tags.length; i++) {
      assert.ok(tags[i].count <= tags[i - 1].count, 'Tags should be sorted by count desc');
    }
  });

  it('should get sources', () => {
    const sources = getSources();
    assert.ok(sources.length > 0);
    assert.ok(sources[0].id);
    assert.ok(sources[0].repo);
  });

  it('every agent should have required fields', () => {
    const agents = getAllAgents();
    for (const agent of agents) {
      assert.ok(agent.name, `Agent missing name`);
      assert.ok(agent.description, `Agent ${agent.name} missing description`);
      assert.ok(Array.isArray(agent.tags), `Agent ${agent.name} tags should be array`);
      assert.ok(agent.source, `Agent ${agent.name} missing source`);
      assert.ok(Array.isArray(agent.compatible), `Agent ${agent.name} compatible should be array`);
    }
  });
});
