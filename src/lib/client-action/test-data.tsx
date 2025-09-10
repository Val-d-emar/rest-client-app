import { HttpRequestLog } from '@/type/type';

/**
 * Простые тестовые данные для разработки
 */
export const testLogData: HttpRequestLog = {
  userId: 'test-user-123',
  latency: 150,
  statusCode: 200,
  statusText: 'OK',
  timestamp: new Date(),
  method: 'POST',
  requestSize: 256,
  responseSize: 512,
  url: '/api/test-endpoint',
  requestBody: JSON.stringify({ test: 'data' }),
  headers: { 'Content-Type': 'application/json' },
};
