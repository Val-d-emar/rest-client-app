'use server';
import { err } from '@/log';
import { HttpMethods } from '@/type/type';

interface RequestPayload {
  userId: string;
  url: string;
  method: HttpMethods;
  headers: Record<string, string>;
  body?: string;
}

export interface ServerResponse {
  status: number | null;
  statusText: string | null;
  headers: Record<string, string> | null;
  body: unknown | null;
  error: string | null;
}

export async function forwardRequest(payload: RequestPayload): Promise<ServerResponse> {
  const startTime = performance.now();
  try {
    const response = await fetch(payload.url, {
      method: payload.method,
      headers: payload.headers,
      body: payload.method !== 'GET' ? payload.body : undefined,
    });

    // const latency = Math.round(performance.now() - startTime);

    const responseText = await response.text();
    let responseBody: unknown;
    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = responseText;
    }

    // Логирование перенесено в ClientPage.tsx через handleAddLog

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
      error: null,
    };
  } catch (error: unknown) {
    // const latency = Math.round(performance.now() - startTime);

    // Логирование ошибок перенесено в ClientPage.tsx через handleAddLog

    err('Server Action fetch error:', error);
    return {
      status: null,
      statusText: null,
      headers: null,
      body: null,
      error: error instanceof Error ? error.message : 'An unknown network error occurred.',
    };
  }
}
