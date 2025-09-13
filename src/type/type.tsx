import { METHODS } from '@/constants/constants';

export interface HttpRequestLog {
  userId: string;
  latency: number;
  statusCode: number;
  statusText?: string;
  timestamp: Date;
  method: string;
  requestSize: number;
  responseSize: number;
  errorDetails?: string;
  url: string;
  requestBody?: string;
  headers?: Record<string, string>;
}

export interface AddLogResult {
  success: boolean;
  id?: string;
  error?: string;
  message: string;
  messageCode?: string;
}

export interface GetLogsResult {
  success: boolean;
  data: HttpRequestLog[];
  count: number;
  error?: string;
  message: string;
  messageCode?: string;
}

export type HttpMethods = (typeof METHODS)[number];

export function isHttpMethod(method: string): method is HttpMethods {
  return (METHODS as readonly string[]).includes(method.toUpperCase());
}
