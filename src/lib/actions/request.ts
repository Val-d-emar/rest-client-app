'use server';
import { err } from '@/log';
import { addHistoryLogAction } from './server-actions';
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

    const latency = Math.round(performance.now() - startTime);

    const responseText = await response.text();
    let responseBody: unknown;
    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = responseText;
    }

    await addHistoryLogAction({
      userId: payload.userId,
      method: payload.method,
      url: payload.url,
      statusCode: response.status,
      latency: latency,
      requestSize: payload.body ? new Blob([payload.body]).size : 0,
      responseSize: new Blob([responseText]).size,
      errorDetails: undefined,
      headers: payload.headers,
      requestBody: payload.body || undefined,
      timestamp: new Date(),
    });

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
  } catch (error: any) {
    const latency = Math.round(performance.now() - startTime);

    await addHistoryLogAction({
      userId: payload.userId,
      method: payload.method,
      url: payload.url,
      statusCode: 0,
      latency: latency,
      requestSize: payload.body ? new Blob([payload.body]).size : 0,
      responseSize: 0,
      errorDetails: error.message || 'Network Error',
      headers: payload.headers,
      requestBody: payload.body || undefined,
      timestamp: new Date(),
    });

    err('Server Action fetch error:', error);
    return {
      status: null,
      statusText: null,
      headers: null,
      body: null,
      error: error.message || 'An unknown network error occurred.',
    };
  }
}
