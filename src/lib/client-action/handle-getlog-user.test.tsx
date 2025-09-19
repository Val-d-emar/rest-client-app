import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleGetLogUserById } from './handle-getlog-user';
import { getHistoryByUserAction } from '@/lib/actions/server-actions';
import { TimeoutError, withTimeout } from '../utils/timeout';
import { TIMEOUT_DURATION } from '@/constants/constants';
import { GetLogsResult, HttpRequestLog } from '@/type/type';

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  Timestamp: {
    fromDate: vi.fn((date) => ({ toDate: () => date })),
    now: vi.fn(() => ({ toDate: () => new Date() })),
  },
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  orderBy: vi.fn(),
}));

vi.mock('@/lib/firebase/config', () => ({
  db: {},
  auth: {},
  app: {},
}));

vi.mock('@/lib/actions/server-actions');
vi.mock('../utils/timeout');

const mockGetHistoryByUserAction = vi.mocked(getHistoryByUserAction);
const mockWithTimeout = vi.mocked(withTimeout);

describe('handleGetLogUserById', () => {
  const testUserId = 'test-user-123';

  const mockHttpRequestLog: HttpRequestLog = {
    userId: testUserId,
    latency: 150,
    statusCode: 200,
    statusText: 'OK',
    timestamp: new Date('2023-12-01T10:00:00Z'),
    method: 'GET',
    requestSize: 1024,
    responseSize: 2048,
    url: 'https://api.example.com/test',
    requestBody: '{"test": "data"}',
    headers: { 'Content-Type': 'application/json' },
  };

  const mockSuccessResult: GetLogsResult = {
    success: true,
    data: [mockHttpRequestLog],
    count: 1,
    message: 'Logs retrieved successfully',
    messageCode: 'LOGS_SUCCESS',
  };

  const mockFailureResult: GetLogsResult = {
    success: false,
    data: [],
    count: 0,
    message: 'Failed to retrieve logs',
    error: 'Database connection error',
    messageCode: 'DB_ERROR',
  };

  const mockTranslationFunction = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      networkError: 'Network error occurred',
      timeoutError: 'Operation timed out',
      refreshError: 'Failed to refresh data',
    };
    return translations[key] || key;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockWithTimeout.mockImplementation((promise) => promise);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Successful scenarios', () => {
    it('returns successful result when server action succeeds', async () => {
      mockGetHistoryByUserAction.mockResolvedValue(mockSuccessResult);

      const result = await handleGetLogUserById(testUserId);

      expect(mockWithTimeout).toHaveBeenCalledWith(expect.any(Promise), TIMEOUT_DURATION);
      expect(mockGetHistoryByUserAction).toHaveBeenCalledWith(testUserId);
      expect(result).toEqual({
        success: true,
        data: mockSuccessResult.data,
        count: mockSuccessResult.count,
        message: mockSuccessResult.message,
      });
    });

    it('returns successful result with empty data', async () => {
      const emptySuccessResult: GetLogsResult = {
        success: true,
        data: [],
        count: 0,
        message: 'No logs found',
        messageCode: 'NO_LOGS',
      };
      mockGetHistoryByUserAction.mockResolvedValue(emptySuccessResult);

      const result = await handleGetLogUserById(testUserId);

      expect(result).toEqual({
        success: true,
        data: [],
        count: 0,
        message: 'No logs found',
      });
    });

    it('returns successful result with multiple logs', async () => {
      const multipleLogs: HttpRequestLog[] = [
        { ...mockHttpRequestLog, url: 'https://api.example.com/endpoint1' },
        { ...mockHttpRequestLog, url: 'https://api.example.com/endpoint2', statusCode: 404 },
        { ...mockHttpRequestLog, url: 'https://api.example.com/endpoint3', method: 'POST' },
      ];
      const multipleLogsResult: GetLogsResult = {
        success: true,
        data: multipleLogs,
        count: 3,
        message: 'Multiple logs retrieved',
      };
      mockGetHistoryByUserAction.mockResolvedValue(multipleLogsResult);

      const result = await handleGetLogUserById(testUserId);

      expect(result).toEqual({
        success: true,
        data: multipleLogs,
        count: 3,
        message: 'Multiple logs retrieved',
      });
    });

    it('handles successful result with translation function', async () => {
      mockGetHistoryByUserAction.mockResolvedValue(mockSuccessResult);

      const result = await handleGetLogUserById(testUserId, mockTranslationFunction);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSuccessResult.data);
      expect(mockTranslationFunction).not.toHaveBeenCalled();
    });
  });

  describe('Server action failure scenarios', () => {
    it('returns failure result when server action fails', async () => {
      mockGetHistoryByUserAction.mockResolvedValue(mockFailureResult);

      const result = await handleGetLogUserById(testUserId);

      expect(result).toEqual({
        success: false,
        data: [],
        count: 0,
        message: mockFailureResult.message,
        error: mockFailureResult.error,
      });
    });

    it('handles server action failure with translation function', async () => {
      mockGetHistoryByUserAction.mockResolvedValue(mockFailureResult);

      const result = await handleGetLogUserById(testUserId, mockTranslationFunction);

      expect(result).toEqual({
        success: false,
        data: [],
        count: 0,
        message: mockFailureResult.message,
        error: mockFailureResult.error,
      });
      expect(mockTranslationFunction).not.toHaveBeenCalled();
    });

    it('preserves all error information from server action', async () => {
      const detailedFailureResult: GetLogsResult = {
        success: false,
        data: [],
        count: 0,
        message: 'Authentication failed',
        error: 'Invalid user token',
        messageCode: 'AUTH_ERROR',
      };
      mockGetHistoryByUserAction.mockResolvedValue(detailedFailureResult);

      const result = await handleGetLogUserById(testUserId);

      expect(result).toEqual({
        success: false,
        data: [],
        count: 0,
        message: 'Authentication failed',
        error: 'Invalid user token',
      });
    });
  });

  describe('Network error scenarios', () => {
    it('handles network error without translation function', async () => {
      const networkError = new TypeError('fetch failed');
      mockGetHistoryByUserAction.mockRejectedValue(networkError);

      const result = await handleGetLogUserById(testUserId);

      expect(result).toEqual({
        success: false,
        data: [],
        count: 0,
        message: 'Critical error occurred',
        error: 'TypeError: fetch failed',
      });
    });

    it('handles network error with translation function', async () => {
      const networkError = new TypeError('Network request failed during fetch');
      mockGetHistoryByUserAction.mockRejectedValue(networkError);

      const result = await handleGetLogUserById(testUserId, mockTranslationFunction);

      expect(result).toEqual({
        success: false,
        data: [],
        count: 0,
        message: 'Network error occurred',
        error: 'TypeError: Network request failed during fetch',
      });
      expect(mockTranslationFunction).toHaveBeenCalledWith('networkError');
    });

    it('identifies network errors correctly', async () => {
      const fetchError = new TypeError('Failed to fetch');
      mockGetHistoryByUserAction.mockRejectedValue(fetchError);

      const result = await handleGetLogUserById(testUserId, mockTranslationFunction);

      expect(mockTranslationFunction).toHaveBeenCalledWith('networkError');
      expect(result.message).toBe('Network error occurred');
    });
  });

  describe('Timeout error scenarios', () => {
    it('handles timeout error without translation function', async () => {
      const timeoutError = new TimeoutError(15000);
      mockGetHistoryByUserAction.mockRejectedValue(timeoutError);

      const result = await handleGetLogUserById(testUserId);

      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
      expect(result.message).toBe('Critical error occurred');
      expect(typeof result.error).toBe('string');
    });

    it('handles timeout error with translation function', async () => {
      const timeoutError = new TimeoutError(15000);
      mockGetHistoryByUserAction.mockRejectedValue(timeoutError);

      const result = await handleGetLogUserById(testUserId, mockTranslationFunction);

      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
      expect(result.message).toBe('Operation timed out');
      expect(typeof result.error).toBe('string');
      expect(mockTranslationFunction).toHaveBeenCalledWith('timeoutError');
    });

    it('identifies timeout errors correctly', async () => {
      const timeoutError = new TimeoutError(10000);
      mockGetHistoryByUserAction.mockRejectedValue(timeoutError);

      const result = await handleGetLogUserById(testUserId, mockTranslationFunction);

      expect(mockTranslationFunction).toHaveBeenCalledWith('timeoutError');
      expect(result.message).toBe('Operation timed out');
    });
  });

  describe('Generic error scenarios', () => {
    it('handles generic error without translation function', async () => {
      const genericError = new Error('Something went wrong');
      mockGetHistoryByUserAction.mockRejectedValue(genericError);

      const result = await handleGetLogUserById(testUserId);

      expect(result).toEqual({
        success: false,
        data: [],
        count: 0,
        message: 'Critical error occurred',
        error: 'Error: Something went wrong',
      });
    });

    it('handles generic error with translation function', async () => {
      const genericError = new Error('Database connection failed');
      mockGetHistoryByUserAction.mockRejectedValue(genericError);

      const result = await handleGetLogUserById(testUserId, mockTranslationFunction);

      expect(result).toEqual({
        success: false,
        data: [],
        count: 0,
        message: 'Failed to refresh data',
        error: 'Error: Database connection failed',
      });
      expect(mockTranslationFunction).toHaveBeenCalledWith('refreshError');
    });

    it('handles non-Error objects as errors', async () => {
      const stringError = 'Something went wrong';
      mockGetHistoryByUserAction.mockRejectedValue(stringError);

      const result = await handleGetLogUserById(testUserId, mockTranslationFunction);

      expect(result).toEqual({
        success: false,
        data: [],
        count: 0,
        message: 'Failed to refresh data',
        error: 'Something went wrong',
      });
    });

    it('handles null/undefined errors', async () => {
      mockGetHistoryByUserAction.mockRejectedValue(null);

      const result = await handleGetLogUserById(testUserId, mockTranslationFunction);

      expect(result).toEqual({
        success: false,
        data: [],
        count: 0,
        message: 'Failed to refresh data',
        error: 'null',
      });
    });
  });

  describe('Error prioritization', () => {
    it('prioritizes network error over generic error when both conditions could apply', async () => {
      const networkTypeError = new TypeError('fetch operation failed');
      mockGetHistoryByUserAction.mockRejectedValue(networkTypeError);

      const result = await handleGetLogUserById(testUserId, mockTranslationFunction);

      expect(mockTranslationFunction).toHaveBeenCalledWith('networkError');
      expect(result.message).toBe('Network error occurred');
    });

    it('prioritizes timeout error over network error when timeout occurs', async () => {
      const timeoutError = new TimeoutError(5000);
      mockGetHistoryByUserAction.mockRejectedValue(timeoutError);

      const result = await handleGetLogUserById(testUserId, mockTranslationFunction);

      expect(mockTranslationFunction).toHaveBeenCalledWith('timeoutError');
      expect(result.message).toBe('Operation timed out');
    });
  });

  describe('Parameter validation', () => {
    it('handles empty userId', async () => {
      mockGetHistoryByUserAction.mockResolvedValue(mockSuccessResult);

      const result = await handleGetLogUserById('');

      expect(mockGetHistoryByUserAction).toHaveBeenCalledWith('');
      expect(result.success).toBe(true);
    });

    it('handles userId with special characters', async () => {
      const specialUserId = 'user@example.com';
      mockGetHistoryByUserAction.mockResolvedValue(mockSuccessResult);

      const result = await handleGetLogUserById(specialUserId, mockTranslationFunction);

      expect(mockGetHistoryByUserAction).toHaveBeenCalledWith(specialUserId);
      expect(result.success).toBe(true);
    });

    it('works without translation function parameter', async () => {
      mockGetHistoryByUserAction.mockResolvedValue(mockSuccessResult);

      const result = await handleGetLogUserById(testUserId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSuccessResult.data);
    });
  });

  describe('Integration with timeout utility', () => {
    it('calls withTimeout with correct parameters', async () => {
      const mockPromise = Promise.resolve(mockSuccessResult);
      mockGetHistoryByUserAction.mockReturnValue(mockPromise);
      mockWithTimeout.mockResolvedValue(mockSuccessResult);

      await handleGetLogUserById(testUserId);

      expect(mockWithTimeout).toHaveBeenCalledWith(mockPromise, TIMEOUT_DURATION);
    });

    it('propagates timeout configuration correctly', async () => {
      mockWithTimeout.mockImplementation((promise, duration) => {
        expect(duration).toBe(TIMEOUT_DURATION);
        return promise;
      });
      mockGetHistoryByUserAction.mockResolvedValue(mockSuccessResult);

      await handleGetLogUserById(testUserId);

      expect(mockWithTimeout).toHaveBeenCalledTimes(1);
    });
  });

  describe('Return type validation', () => {
    it('always returns GetLogsResult structure', async () => {
      mockGetHistoryByUserAction.mockResolvedValue(mockSuccessResult);

      const result = await handleGetLogUserById(testUserId);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('count');
      expect(result).toHaveProperty('message');
      expect(typeof result.success).toBe('boolean');
      expect(Array.isArray(result.data)).toBe(true);
      expect(typeof result.count).toBe('number');
      expect(typeof result.message).toBe('string');
    });

    it('includes error property when appropriate', async () => {
      const error = new Error('Test error');
      mockGetHistoryByUserAction.mockRejectedValue(error);

      const result = await handleGetLogUserById(testUserId);

      expect(result).toHaveProperty('error');
      expect(typeof result.error).toBe('string');
    });
  });
});
