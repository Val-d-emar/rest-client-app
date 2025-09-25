import { describe, it, expect } from 'vitest';
import { constructClientUrl } from './url-constructor';
import { HttpMethods } from '@/type';

const safeBtoa = (str: string): string => btoa(encodeURIComponent(str));

describe('constructClientUrl utility', () => {
  it('should construct a basic URL for a GET request', () => {
    const params = {
      method: 'GET' as HttpMethods,
      url: 'https://api.example.com/data',
    };
    const searchParams = new URLSearchParams({
      method: params.method,
      url: safeBtoa(params.url),
    });
    const expectedUrl = `/client?${searchParams.toString()}`;

    expect(constructClientUrl(params)).toBe(expectedUrl);
  });

  it('should include a base64 encoded body for a POST request', () => {
    const params = {
      method: 'POST' as HttpMethods,
      url: 'https://api.example.com/users',
      body: JSON.stringify({ name: 'John Doe' }),
    };

    const searchParams = new URLSearchParams();
    searchParams.set('method', params.method);
    searchParams.set('url', safeBtoa(params.url));

    if (params.body) {
      searchParams.set('body', safeBtoa(params.body));
    }

    const expectedUrl = `/client?${searchParams.toString()}`;
    expect(constructClientUrl(params)).toBe(expectedUrl);
  });

  it('should correctly URL-encode headers as query parameters', () => {
    const params = {
      method: 'GET' as HttpMethods,
      url: 'https://api.example.com/data',
      headers: {
        'Content-Type': 'application/json',
        'X-Custom-Header': 'my-value',
      },
    };

    const searchParams = new URLSearchParams({
      method: params.method,
      url: safeBtoa(params.url),
      ...params.headers,
    });
    const expectedUrl = `/client?${searchParams.toString()}`;

    expect(constructClientUrl(params)).toBe(expectedUrl);
  });

  it('should handle unicode characters in url and body correctly', () => {
    const params = {
      method: 'POST' as HttpMethods,
      url: 'https://api.example.com/search?q=тест',
      body: JSON.stringify({ query: 'тестовый запрос' }),
    };

    const searchParams = new URLSearchParams();
    searchParams.set('method', params.method);
    searchParams.set('url', safeBtoa(params.url));

    if (params.body) {
      searchParams.set('body', safeBtoa(params.body));
    }

    const expectedUrl = `/client?${searchParams.toString()}`;
    expect(constructClientUrl(params)).toBe(expectedUrl);
  });

  it('should not include body or headers if they are null, undefined, or empty', () => {
    const params1 = {
      method: 'GET' as HttpMethods,
      url: 'https://api.example.com/data',
      body: null,
      headers: null,
    };
    const expectedUrl1 = `/client?method=GET&url=${safeBtoa(params1.url)}`;
    expect(constructClientUrl(params1)).toBe(expectedUrl1);

    const params2 = {
      method: 'GET' as HttpMethods,
      url: 'https://api.example.com/data',
      body: '',
      headers: {},
    };

    const expectedUrl2 = `/client?method=GET&url=${safeBtoa(params2.url)}`;
    expect(constructClientUrl(params2)).toBe(expectedUrl2);
  });
});
