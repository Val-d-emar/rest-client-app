import { METHODS } from '@/constants/constants';

export interface HttpRequestLog {
  userId: string; // ID пользователя
  latency: number; // Длительность запроса в мс
  statusCode: number; // HTTP статус-код ответа
  statusText?: string; // Текстовый статус-код (опционально)
  timestamp: Date; // Timestamp запроса
  method: string; // HTTP метод (GET, POST и т.д.)
  requestSize: number; // Размер запроса в байтах
  responseSize: number; // Размер ответа в байтах
  errorDetails?: string; // Детали ошибки (опционально)
  url: string; // Endpoint/URL запроса
  requestBody?: string; // Тело запроса (опционально)
  headers?: Record<string, string>; // Заголовки (опционально)
}

export interface AddLogResult {
  success: boolean;
  id?: string;
  error?: string;
  message: string;
  messageCode?: string; // Код для перевода сообщения
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
