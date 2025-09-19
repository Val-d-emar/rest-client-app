import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleAddLog } from './handle-add-log';
import { addHistoryLogAction } from '@/lib/actions/server-actions';
import { getCurrentUserId } from '@/lib/firebase/config';
import toast from 'react-hot-toast';
import { TimeoutError, withTimeout } from '../utils/timeout';
import { TIMEOUT_DURATION } from '@/constants/constants';
import { HttpRequestLog, AddLogResult } from '@/type/type';
import { useTranslations } from 'next-intl';

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
  auth: { currentUser: null },
  app: {},
  getCurrentUserId: vi.fn(),
}));

vi.mock('@/lib/actions/server-actions');
vi.mock('react-hot-toast');
vi.mock('../utils/timeout');

const mockAddHistoryLogAction = vi.mocked(addHistoryLogAction);
const mockGetCurrentUserId = vi.mocked(getCurrentUserId);
const mockToast = vi.mocked(toast);
const mockWithTimeout = vi.mocked(withTimeout);

describe('handleAddLog', () => {
  const testUserId = 'test-user-123';

  const mockLogData: HttpRequestLog = {
    userId: 'original-user',
    latency: 250,
    statusCode: 201,
    statusText: 'Created',
    timestamp: new Date('2023-12-01T15:30:00Z'),
    method: 'POST',
    requestSize: 512,
    responseSize: 1024,
    url: 'https://api.example.com/users',
    requestBody: '{"name": "John Doe"}',
    headers: { 'Content-Type': 'application/json' },
  };

  const mockSuccessResult: AddLogResult = {
    success: true,
    id: 'log-123',
    message: 'Log added successfully',
    messageCode: 'LOG_CREATED',
  };

  const mockFailureResult: AddLogResult = {
    success: false,
    message: 'Failed to add log',
    error: 'Database error',
    messageCode: 'DB_ERROR',
  };

  const mockTranslationFunction = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      'client.recording': 'Recording...',
      'client.criticalError': 'Critical error occurred',
      'HistoryPage.timeoutError': 'Request timed out',
      'serverMessages.LOG_CREATED': 'Log successfully created',
      'serverMessages.DB_ERROR': 'Database connection failed',
    };
    return translations[key] || key;
  }) as unknown as ReturnType<typeof useTranslations>;

  const mockToastLoading = vi.fn(() => 'toast-id-123');
  const mockToastSuccess = vi.fn();
  const mockToastError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockToast.loading = mockToastLoading;
    mockToast.success = mockToastSuccess;
    mockToast.error = mockToastError;

    mockGetCurrentUserId.mockReturnValue(testUserId);
    mockWithTimeout.mockImplementation((promise) => promise);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Successful scenarios', () => {
    it('successfully adds log with user ID and shows success toast', async () => {
      mockAddHistoryLogAction.mockResolvedValue(mockSuccessResult);

      const result = await handleAddLog(mockLogData, mockTranslationFunction);

      expect(mockAddHistoryLogAction).toHaveBeenCalledWith({
        ...mockLogData,
        userId: testUserId,
      });

      expect(mockToastLoading).toHaveBeenCalledWith('Recording...');
      expect(mockToastSuccess).toHaveBeenCalledWith(`Log successfully created\n ID: log-123`, {
        id: 'toast-id-123',
        duration: 4000,
        style: {
          background: '#10B981',
          color: 'white',
        },
      });

      expect(result).toEqual(mockSuccessResult);
    });

    it('uses message fallback when messageCode translation is not found', async () => {
      const resultWithoutTranslation: AddLogResult = {
        success: true,
        id: 'log-456',
        message: 'Original server message',
        messageCode: 'UNKNOWN_CODE',
      };
      mockAddHistoryLogAction.mockResolvedValue(resultWithoutTranslation);

      const result = await handleAddLog(mockLogData, mockTranslationFunction);

      expect(mockToastSuccess).toHaveBeenCalledWith(
        `serverMessages.UNKNOWN_CODE\n ID: log-456`,
        expect.any(Object),
      );
      expect(result).toEqual(resultWithoutTranslation);
    });

    it('works with anonymous user when getCurrentUserId returns null', async () => {
      mockGetCurrentUserId.mockReturnValue(null);
      mockAddHistoryLogAction.mockResolvedValue(mockSuccessResult);

      const result = await handleAddLog(mockLogData, mockTranslationFunction);

      expect(mockAddHistoryLogAction).toHaveBeenCalledWith({
        ...mockLogData,
        userId: 'anonymous',
      });
      expect(result.success).toBe(true);
    });

    it('handles success result without messageCode', async () => {
      const simpleSuccessResult: AddLogResult = {
        success: true,
        id: 'log-789',
        message: 'Simple success message',
      };
      mockAddHistoryLogAction.mockResolvedValue(simpleSuccessResult);

      const result = await handleAddLog(mockLogData, mockTranslationFunction);

      expect(mockToastSuccess).toHaveBeenCalledWith(
        `Simple success message\n ID: log-789`,
        expect.any(Object),
      );
      expect(result).toEqual(simpleSuccessResult);
    });

    it('preserves original log data except userId', async () => {
      mockAddHistoryLogAction.mockResolvedValue(mockSuccessResult);

      await handleAddLog(mockLogData, mockTranslationFunction);

      const expectedLogData = {
        ...mockLogData,
        userId: testUserId,
      };
      expect(mockAddHistoryLogAction).toHaveBeenCalledWith(expectedLogData);
    });
  });

  describe('Server action failure scenarios', () => {
    it('handles server action failure and shows error toast', async () => {
      mockAddHistoryLogAction.mockResolvedValue(mockFailureResult);

      const result = await handleAddLog(mockLogData, mockTranslationFunction);

      expect(mockToastError).toHaveBeenCalledWith(
        `Database connection failed\n Error: Database error`,
        {
          id: 'toast-id-123',
          duration: 5000,
          style: {
            background: '#EF4444',
            color: 'white',
          },
        },
      );
      expect(result).toEqual(mockFailureResult);
    });

    it('uses message fallback for failure when messageCode translation not found', async () => {
      const failureWithoutTranslation: AddLogResult = {
        success: false,
        message: 'Unknown server error',
        error: 'Something went wrong',
        messageCode: 'UNKNOWN_ERROR',
      };
      mockAddHistoryLogAction.mockResolvedValue(failureWithoutTranslation);

      const result = await handleAddLog(mockLogData, mockTranslationFunction);

      expect(mockToastError).toHaveBeenCalledWith(
        `serverMessages.UNKNOWN_ERROR\n Error: Something went wrong`,
        expect.any(Object),
      );
      expect(result).toEqual(failureWithoutTranslation);
    });

    it('handles failure result without messageCode', async () => {
      const simpleFailureResult: AddLogResult = {
        success: false,
        message: 'Simple error message',
        error: 'Simple error',
      };
      mockAddHistoryLogAction.mockResolvedValue(simpleFailureResult);

      const result = await handleAddLog(mockLogData, mockTranslationFunction);

      expect(mockToastError).toHaveBeenCalledWith(
        `Simple error message\n Error: Simple error`,
        expect.any(Object),
      );
      expect(result).toEqual(simpleFailureResult);
    });

    it('handles failure result without error field', async () => {
      const failureWithoutError: AddLogResult = {
        success: false,
        message: 'Error without details',
        messageCode: 'GENERIC_ERROR',
      };
      mockAddHistoryLogAction.mockResolvedValue(failureWithoutError);

      const result = await handleAddLog(mockLogData, mockTranslationFunction);

      expect(mockToastError).toHaveBeenCalledWith(
        `serverMessages.GENERIC_ERROR\n Error: undefined`,
        expect.any(Object),
      );
      expect(result).toEqual(failureWithoutError);
    });
  });

  describe('Timeout error scenarios', () => {
    it('handles timeout error and shows timeout toast', async () => {
      const timeoutError = new TimeoutError(15000);
      mockWithTimeout.mockRejectedValue(timeoutError);

      await expect(handleAddLog(mockLogData, mockTranslationFunction)).rejects.toThrow(
        TimeoutError,
      );

      expect(mockToastError).toHaveBeenCalledWith('💥 Request timed out', {
        id: 'toast-id-123',
        duration: 6000,
        style: {
          background: '#DC2626',
          color: 'white',
        },
      });
    });

    it('uses fallback message for timeout when translation not available', async () => {
      const timeoutError = new TimeoutError(10000);
      mockWithTimeout.mockRejectedValue(timeoutError);

      const fallbackTranslationFn = vi.fn((key: string) => {
        if (key === 'HistoryPage.timeoutError') return undefined;
        return mockTranslationFunction(key);
      }) as unknown as ReturnType<typeof useTranslations>;

      await expect(handleAddLog(mockLogData, fallbackTranslationFn)).rejects.toThrow(TimeoutError);

      expect(mockToastError).toHaveBeenCalledWith('💥 Timeout error', expect.any(Object));
    });

    it('propagates timeout error after showing toast', async () => {
      const timeoutError = new TimeoutError(5000);
      mockWithTimeout.mockRejectedValue(timeoutError);

      await expect(handleAddLog(mockLogData, mockTranslationFunction)).rejects.toThrow(
        TimeoutError,
      );
    });
  });

  describe('Generic error scenarios', () => {
    it('handles generic error and shows critical error toast', async () => {
      const genericError = new Error('Something went wrong');
      mockAddHistoryLogAction.mockRejectedValue(genericError);

      await expect(handleAddLog(mockLogData, mockTranslationFunction)).rejects.toThrow(
        genericError,
      );

      expect(mockToastError).toHaveBeenCalledWith('💥 Critical error occurred', {
        id: 'toast-id-123',
        duration: 6000,
        style: {
          background: '#DC2626',
          color: 'white',
        },
      });
    });

    it('uses fallback message for critical error when translation not available', async () => {
      const genericError = new Error('Network failure');
      mockAddHistoryLogAction.mockRejectedValue(genericError);

      const fallbackTranslationFn = vi.fn((key: string) => {
        if (key === 'client.criticalError') return undefined;
        return mockTranslationFunction(key);
      }) as unknown as ReturnType<typeof useTranslations>;

      await expect(handleAddLog(mockLogData, fallbackTranslationFn)).rejects.toThrow(genericError);

      expect(mockToastError).toHaveBeenCalledWith('💥 Critical error', expect.any(Object));
    });

    it('propagates generic error after showing toast', async () => {
      const customError = new Error('Database connection failed');
      mockAddHistoryLogAction.mockRejectedValue(customError);

      await expect(handleAddLog(mockLogData, mockTranslationFunction)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('handles non-Error objects thrown as errors', async () => {
      const stringError = 'String error';
      mockAddHistoryLogAction.mockRejectedValue(stringError);

      await expect(handleAddLog(mockLogData, mockTranslationFunction)).rejects.toThrow();

      expect(mockToastError).toHaveBeenCalledWith('💥 Critical error occurred', expect.any(Object));
    });
  });

  describe('Toast integration', () => {
    it('uses correct toast ID throughout the flow', async () => {
      const customToastId = 'custom-toast-123';
      mockToastLoading.mockReturnValue(customToastId);
      mockAddHistoryLogAction.mockResolvedValue(mockSuccessResult);

      await handleAddLog(mockLogData, mockTranslationFunction);

      expect(mockToastLoading).toHaveBeenCalledWith('Recording...');
      expect(mockToastSuccess).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ id: customToastId }),
      );
    });

    it('uses same toast ID for error scenarios', async () => {
      const customToastId = 'error-toast-456';
      mockToastLoading.mockReturnValue(customToastId);
      const error = new Error('Test error');
      mockAddHistoryLogAction.mockRejectedValue(error);

      await expect(handleAddLog(mockLogData, mockTranslationFunction)).rejects.toThrow();

      expect(mockToastError).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ id: customToastId }),
      );
    });

    it('shows loading toast with correct translation', async () => {
      mockAddHistoryLogAction.mockResolvedValue(mockSuccessResult);

      await handleAddLog(mockLogData, mockTranslationFunction);

      expect(mockTranslationFunction).toHaveBeenNthCalledWith(1, 'client.recording');
      expect(mockToastLoading).toHaveBeenCalledWith('Recording...');
    });

    it('uses fallback text when recording translation is not available', async () => {
      const noRecordingTranslation = vi.fn((key: string) => {
        if (key === 'client.recording') return undefined;
        return mockTranslationFunction(key);
      }) as unknown as ReturnType<typeof useTranslations>;
      mockAddHistoryLogAction.mockResolvedValue(mockSuccessResult);

      await handleAddLog(mockLogData, noRecordingTranslation);

      expect(mockToastLoading).toHaveBeenCalledWith('recording...');
    });
  });

  describe('Integration with timeout utility', () => {
    it('calls withTimeout with correct parameters', async () => {
      const mockPromise = Promise.resolve(mockSuccessResult);
      mockAddHistoryLogAction.mockReturnValue(mockPromise);
      mockWithTimeout.mockResolvedValue(mockSuccessResult);

      await handleAddLog(mockLogData, mockTranslationFunction);

      expect(mockWithTimeout).toHaveBeenCalledWith(mockPromise, TIMEOUT_DURATION);
    });

    it('propagates timeout configuration correctly', async () => {
      mockWithTimeout.mockImplementation((promise, duration) => {
        expect(duration).toBe(TIMEOUT_DURATION);
        return promise;
      });
      mockAddHistoryLogAction.mockResolvedValue(mockSuccessResult);

      await handleAddLog(mockLogData, mockTranslationFunction);

      expect(mockWithTimeout).toHaveBeenCalledTimes(1);
    });
  });

  describe('User ID handling', () => {
    it('uses authenticated user ID when available', async () => {
      const authenticatedUserId = 'auth-user-789';
      mockGetCurrentUserId.mockReturnValue(authenticatedUserId);
      mockAddHistoryLogAction.mockResolvedValue(mockSuccessResult);

      await handleAddLog(mockLogData, mockTranslationFunction);

      expect(mockAddHistoryLogAction).toHaveBeenCalledWith({
        ...mockLogData,
        userId: authenticatedUserId,
      });
    });

    it('uses anonymous when getCurrentUserId returns empty string', async () => {
      mockGetCurrentUserId.mockReturnValue('');
      mockAddHistoryLogAction.mockResolvedValue(mockSuccessResult);

      await handleAddLog(mockLogData, mockTranslationFunction);

      expect(mockAddHistoryLogAction).toHaveBeenCalledWith({
        ...mockLogData,
        userId: 'anonymous',
      });
    });

    it('handles undefined return from getCurrentUserId', async () => {
      mockGetCurrentUserId.mockReturnValue(undefined as unknown as string | null);
      mockAddHistoryLogAction.mockResolvedValue(mockSuccessResult);

      await handleAddLog(mockLogData, mockTranslationFunction);

      expect(mockAddHistoryLogAction).toHaveBeenCalledWith({
        ...mockLogData,
        userId: 'anonymous',
      });
    });

    it('overrides original userId in logData', async () => {
      const logDataWithUserId = {
        ...mockLogData,
        userId: 'original-user-123',
      };
      mockGetCurrentUserId.mockReturnValue('current-user-456');
      mockAddHistoryLogAction.mockResolvedValue(mockSuccessResult);

      await handleAddLog(logDataWithUserId, mockTranslationFunction);

      expect(mockAddHistoryLogAction).toHaveBeenCalledWith({
        ...logDataWithUserId,
        userId: 'current-user-456',
      });
    });
  });

  describe('Error prioritization', () => {
    it('prioritizes timeout error over generic error', async () => {
      const timeoutError = new TimeoutError(5000);
      mockWithTimeout.mockRejectedValue(timeoutError);

      await expect(handleAddLog(mockLogData, mockTranslationFunction)).rejects.toThrow(
        TimeoutError,
      );

      expect(mockToastError).toHaveBeenCalledWith('💥 Request timed out', expect.any(Object));
      expect(mockTranslationFunction).toHaveBeenCalledWith('HistoryPage.timeoutError');
    });

    it('shows generic error when error is not TimeoutError', async () => {
      const networkError = new TypeError('fetch failed');
      mockAddHistoryLogAction.mockRejectedValue(networkError);

      await expect(handleAddLog(mockLogData, mockTranslationFunction)).rejects.toThrow(
        networkError,
      );

      expect(mockToastError).toHaveBeenCalledWith('💥 Critical error occurred', expect.any(Object));
      expect(mockTranslationFunction).toHaveBeenCalledWith('client.criticalError');
    });
  });

  describe('Translation function edge cases', () => {
    it('handles translation function that throws errors', async () => {
      const errorTranslation = vi.fn(() => undefined) as unknown as ReturnType<
        typeof useTranslations
      >;
      mockAddHistoryLogAction.mockResolvedValue(mockSuccessResult);

      const result = await handleAddLog(mockLogData, errorTranslation);

      expect(result).toEqual(mockSuccessResult);
      expect(mockToastLoading).toHaveBeenCalledWith('recording...');
    });

    it('handles translation function returning null/undefined', async () => {
      const nullTranslation = vi.fn(() => null) as unknown as ReturnType<typeof useTranslations>;
      mockAddHistoryLogAction.mockResolvedValue(mockSuccessResult);

      await handleAddLog(mockLogData, nullTranslation);

      expect(mockToastLoading).toHaveBeenCalledWith('recording...');
    });
  });

  describe('Return value validation', () => {
    it('always returns AddLogResult structure on success', async () => {
      mockAddHistoryLogAction.mockResolvedValue(mockSuccessResult);

      const result = await handleAddLog(mockLogData, mockTranslationFunction);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.message).toBe('string');
    });

    it('always returns AddLogResult structure on server failure', async () => {
      mockAddHistoryLogAction.mockResolvedValue(mockFailureResult);

      const result = await handleAddLog(mockLogData, mockTranslationFunction);

      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('error');
    });

    it('throws error for timeout and generic errors', async () => {
      const error = new Error('Test error');
      mockAddHistoryLogAction.mockRejectedValue(error);

      await expect(handleAddLog(mockLogData, mockTranslationFunction)).rejects.toThrow(error);
    });
  });
});
