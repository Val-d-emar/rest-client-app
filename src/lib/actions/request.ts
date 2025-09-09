'use server';
import { err } from '@/log';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

interface RequestPayload {
  userId: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
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

    try {
      await addDoc(collection(db, 'history'), {
        userId: payload.userId,
        method: payload.method,
        url: payload.url,
        statusCode: response.status,
        latency: latency,
        requestSize: payload.body ? new Blob([payload.body]).size : 0,
        responseSize: new Blob([responseText]).size,
        errorDetails: null,
        headers: payload.headers,
        requestBody: payload.body || null,
        timestamp: serverTimestamp(),
      });
    } catch (historyError) {
      err('Failed to save request to history:', historyError);
    }

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

    try {
      await addDoc(collection(db, 'history'), {
        userId: payload.userId,
        method: payload.method,
        url: payload.url,
        statusCode: null,
        latency: latency,
        requestSize: payload.body ? new Blob([payload.body]).size : 0,
        responseSize: 0,
        errorDetails: error.message || 'Network Error',
        headers: payload.headers,
        requestBody: payload.body || null,
        timestamp: serverTimestamp(),
      });
    } catch (historyError) {
      err('Failed to save ERROR request to history:', historyError);
    }

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
