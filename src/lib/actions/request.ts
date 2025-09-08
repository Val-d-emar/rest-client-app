'use server';
import { err } from '@/log';

interface RequestPayload {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  headers: Record<string, string>;
  body?: string;
}

export interface ServerResponse {
  status: number | null;
  headers: Record<string, string> | null;
  body: unknown | null;
  error: string | null;
}

export async function forwardRequest(payload: RequestPayload): Promise<ServerResponse> {
  try {
    const response = await fetch(payload.url, {
      method: payload.method,
      headers: payload.headers,
      body: payload.method !== 'GET' ? payload.body : undefined,
    });

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    let responseBody: unknown;
    try {
      responseBody = await response.json();
    } catch (e) {
      responseBody = await response.text();
    }

    return {
      status: response.status,
      headers: responseHeaders,
      body: responseBody,
      error: null,
    };
  } catch (error: any) {
    err('Server Action fetch error:', error);

    return {
      status: null,
      headers: null,
      body: null,
      error: error.message || 'An unknown network error occurred.',
    };
  }
}
