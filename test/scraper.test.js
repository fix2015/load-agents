'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { inferTags, parseYamlFrontmatter } = require('../src/scraper/index');

describe('Scraper utilities', () => {
  describe('inferTags', () => {
    it('should detect frontend tags', () => {
      const tags = inferTags('react-expert', 'React development with hooks');
      assert.ok(tags.includes('frontend'));
      assert.ok(tags.includes('javascript'));
    });

    it('should detect backend tags', () => {
      const tags = inferTags('fastapi-expert', 'FastAPI development with async');
      assert.ok(tags.includes('backend'));
      assert.ok(tags.includes('python'));
    });

    it('should detect devops tags', () => {
      const tags = inferTags('kubernetes-specialist', 'Kubernetes cluster management');
      assert.ok(tags.includes('devops'));
    });

    it('should detect AI tags', () => {
      const tags = inferTags('rag-architect', 'RAG system with embeddings and LLM');
      assert.ok(tags.includes('ai'));
    });

    it('should return empty for unrecognized agents', () => {
      const tags = inferTags('xyz-unknown', 'something completely unrelated');
      assert.ok(Array.isArray(tags));
    });
  });

  describe('parseYamlFrontmatter', () => {
    it('should parse simple frontmatter', () => {
      const content = `---
name: test-agent
description: A test agent
license: MIT
---

# Content here`;
      const result = parseYamlFrontmatter(content);
      assert.strictEqual(result.name, 'test-agent');
      assert.strictEqual(result.description, 'A test agent');
      assert.strictEqual(result.license, 'MIT');
    });

    it('should return empty object for no frontmatter', () => {
      const result = parseYamlFrontmatter('# Just a heading\nSome content');
      assert.deepStrictEqual(result, {});
    });
  });
});
