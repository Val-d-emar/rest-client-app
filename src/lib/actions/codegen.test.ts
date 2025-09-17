import { describe, it, expect } from 'vitest';
import { getAvailableLanguages, generateCodeSnippet } from './codegen';
import type { PostmanRequest } from 'postman-code-generators';

describe('Code Generation Server Actions (Integration Test)', () => {
  describe('getAvailableLanguages', () => {
    it('should return a non-empty array of languages', async () => {
      const languages = await getAvailableLanguages();
      expect(languages.length).toBeGreaterThan(0);
      expect(languages.find((lang) => lang.key === 'curl')).toBeDefined();
      expect(languages.find((lang) => lang.key === 'nodejs')).toBeDefined();
    });
  });

  describe('generateCodeSnippet', () => {
    it('should generate a valid cURL snippet for a simple GET request', async () => {
      const requestData: PostmanRequest = {
        method: 'GET',
        url: 'https://example.com/test',
        header: [{ key: 'X-Test', value: 'true' }],
        body: { mode: 'raw', raw: '' },
      };

      const snippet = await generateCodeSnippet(requestData, 'curl', 'curl');

      expect(snippet).toContain('curl --location');
      expect(snippet).toContain("'https://example.com/test'");
      expect(snippet).toContain("--header 'X-Test: true'");
    });

    it('should generate a valid NodeJS - Request snippet for a POST request', async () => {
      const postRequestData: PostmanRequest = {
        method: 'POST',
        url: 'https://example.com/api',
        header: [{ key: 'Content-Type', value: 'application/json' }],
        body: { mode: 'raw', raw: JSON.stringify({ name: 'test' }) },
      };

      const snippet = await generateCodeSnippet(postRequestData, 'nodejs', 'Request');

      expect(snippet).toContain("var request = require('request');");
      expect(snippet).toContain("'method': 'POST'");
      expect(snippet).toContain("'url': 'https://example.com/api'");
      expect(snippet).toContain('body: JSON.stringify({');
      expect(snippet).toContain('"name": "test"');
    });
  });
});
