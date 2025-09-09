export interface HttpRequestLog {
  userId: string; // ID пользователя
  latency: number; // Длительность запроса в мс
  statusCode: number; // HTTP статус-код ответа
  timestamp: Date; // Timestamp запроса
  method: string; // HTTP метод (GET, POST и т.д.)
  requestSize: number; // Размер запроса в байтах
  responseSize: number; // Размер ответа в байтах
  errorDetails?: string; // Детали ошибки (опционально)
  url: string; // Endpoint/URL запроса
  requestBody?: string; // Тело запроса (опционально)
  headers?: Record<string, string>; // Заголовки (опционально)
}
