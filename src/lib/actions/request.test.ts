import { describe, it, expect, vi, beforeEach } from 'vitest';
import { forwardRequest } from './request';
import { HttpMethods } from '@/type/type';

vi.mock('@/log', () => ({
  err: vi.fn(),
}));

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('forwardRequest Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle a successful GET request with a JSON response', async () => {
    const mockPayload = {
      userId: 'user-123',
      url: 'https://api.example.com/data',
      method: 'GET' as HttpMethods,
      headers: { 'X-Test': 'true' },
    };
    const mockJsonResponse = { message: 'success' };

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      text: () => Promise.resolve(JSON.stringify(mockJsonResponse)),
      json: () => Promise.resolve(mockJsonResponse),
    });

    const result = await forwardRequest(mockPayload);

    expect(fetchMock).toHaveBeenCalledWith(mockPayload.url, {
      method: 'GET',
      headers: { 'X-Test': 'true' },
      body: undefined,
    });

    expect(result.status).toBe(200);
    expect(result.body).toEqual(mockJsonResponse);
    expect(result.error).toBeNull();
    expect(result.headers).toEqual({ 'content-type': 'application/json' });
  });

  it('should handle a successful POST request with a body', async () => {
    const mockPayload = {
      userId: 'user-123',
      url: 'https://api.example.com/data',
      method: 'POST' as HttpMethods,
      headers: {},
      body: JSON.stringify({ data: 'payload' }),
    };

    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      statusText: 'Created',
      headers: new Headers(),
      text: () => Promise.resolve(''),
      json: () => Promise.resolve({}),
    });

    await forwardRequest(mockPayload);

    expect(fetchMock).toHaveBeenCalledWith(
      mockPayload.url,
      expect.objectContaining({
        method: 'POST',
        body: mockPayload.body,
      }),
    );
  });

  it('should handle a response with a non-JSON body', async () => {
    const mockPayload = {
      userId: 'user-123',
      url: 'https://api.example.com/text',
      method: 'GET' as HttpMethods,
      headers: {},
    };

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      text: () => Promise.resolve('Just plain text'),
      json: () => Promise.reject(new SyntaxError('Unexpected token...')),
    });

    const result = await forwardRequest(mockPayload);

    expect(result.body).toBe('Just plain text');
    expect(result.error).toBeNull();
  });

  it('should handle a network error when fetch rejects', async () => {
    const mockPayload = {
      userId: 'user-123',
      url: 'https://api.example.com/data',
      method: 'GET' as HttpMethods,
      headers: {},
    };
    const networkError = new Error('Failed to fetch');

    fetchMock.mockRejectedValue(networkError);

    const result = await forwardRequest(mockPayload);

    expect(result.status).toBeNull();
    expect(result.body).toBeNull();
    expect(result.error).toBe('Failed to fetch');
  });
});
