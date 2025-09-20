import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import * as React from 'react';
import * as serverActions from '@/lib/actions/server-actions';
import * as navigation from 'next/navigation';
import HistoryPage from './page';

vi.mock('@/lib/actions/server-actions', () => ({
  getHistoryByUserAction: vi.fn(),
  getCurrentUserIdAction: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      noRequestsYet: 'No requests yet',
      createNewRequest: 'Create new request',
      noLogsAvailable: 'No logs available',
      serverError: 'Server error',
      'serverMessages.NETWORK_ERROR': 'Network error occurred',
      'serverMessages.DATABASE_ERROR': 'Database error occurred',
    };
    return translations[key] || key;
  }),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <div data-testid='link'>{children}</div>,
}));

vi.mock('@/components/history/history-page-client', () => ({
  default: () => <div data-testid='history-page-client'>History Component</div>,
}));

vi.mock('@/components/Spinner/Spinner', () => ({
  default: () => <div data-testid='spinner'>Loading...</div>,
}));

vi.mock('@/log', () => ({
  dbg: vi.fn(),
}));

describe('HistoryPage', () => {
  const mockParams = Promise.resolve({ locale: 'en' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('redirects to main page when user is not authenticated', async () => {
      const mockGetCurrentUserIdAction = vi.mocked(serverActions.getCurrentUserIdAction);
      const mockRedirect = vi.mocked(navigation.redirect);

      mockGetCurrentUserIdAction.mockResolvedValue(null);

      await HistoryPage({ params: mockParams });

      expect(mockRedirect).toHaveBeenCalledWith('/en/');
    });
  });

  describe('Server actions integration', () => {
    it('calls getCurrentUserIdAction when component loads', async () => {
      const mockGetCurrentUserIdAction = vi.mocked(serverActions.getCurrentUserIdAction);
      const mockGetHistoryByUserAction = vi.mocked(serverActions.getHistoryByUserAction);

      mockGetCurrentUserIdAction.mockResolvedValue('user-123');
      mockGetHistoryByUserAction.mockResolvedValue({
        success: true,
        count: 1,
        data: [
          {
            userId: 'user-123',
            latency: 100,
            statusCode: 200,
            statusText: 'OK',
            timestamp: new Date(),
            method: 'GET',
            requestSize: 0,
            responseSize: 512,
            url: 'https://api.example.com',
            requestBody: '',
            headers: {},
          },
        ],
        message: 'Success',
        messageCode: 'SUCCESS',
      });

      await HistoryPage({ params: mockParams });

      expect(mockGetCurrentUserIdAction).toHaveBeenCalledTimes(1);
      expect(mockGetHistoryByUserAction).toHaveBeenCalledWith('user-123');
    });

    it('calls getHistoryByUserAction with correct userId', async () => {
      const mockGetCurrentUserIdAction = vi.mocked(serverActions.getCurrentUserIdAction);
      const mockGetHistoryByUserAction = vi.mocked(serverActions.getHistoryByUserAction);

      mockGetCurrentUserIdAction.mockResolvedValue('user-456');
      mockGetHistoryByUserAction.mockResolvedValue({
        success: true,
        count: 0,
        data: [],
        message: 'No logs found',
        messageCode: 'NO_LOGS_FOUND',
      });

      await HistoryPage({ params: mockParams });

      expect(mockGetHistoryByUserAction).toHaveBeenCalledWith('user-456');
    });
  });

  describe('Locale handling', () => {
    it('handles Russian locale correctly for redirect', async () => {
      const mockParamsRu = Promise.resolve({ locale: 'ru' });
      const mockGetCurrentUserIdAction = vi.mocked(serverActions.getCurrentUserIdAction);
      const mockRedirect = vi.mocked(navigation.redirect);

      mockGetCurrentUserIdAction.mockResolvedValue(null);

      await HistoryPage({ params: mockParamsRu });

      expect(mockRedirect).toHaveBeenCalledWith('/ru/');
    });

    it('handles English locale correctly for redirect', async () => {
      const mockParamsEn = Promise.resolve({ locale: 'en' });
      const mockGetCurrentUserIdAction = vi.mocked(serverActions.getCurrentUserIdAction);
      const mockRedirect = vi.mocked(navigation.redirect);

      mockGetCurrentUserIdAction.mockResolvedValue(null);

      await HistoryPage({ params: mockParamsEn });

      expect(mockRedirect).toHaveBeenCalledWith('/en/');
    });
  });

  describe('Error handling', () => {
    it('handles server action errors gracefully', async () => {
      const mockGetCurrentUserIdAction = vi.mocked(serverActions.getCurrentUserIdAction);
      const mockGetHistoryByUserAction = vi.mocked(serverActions.getHistoryByUserAction);

      mockGetCurrentUserIdAction.mockResolvedValue('user-123');
      mockGetHistoryByUserAction.mockRejectedValue(new Error('Database connection failed'));

      const result = await HistoryPage({ params: mockParams });
      expect(result).toBeDefined();
    });

    it('handles failed history request', async () => {
      const mockGetCurrentUserIdAction = vi.mocked(serverActions.getCurrentUserIdAction);
      const mockGetHistoryByUserAction = vi.mocked(serverActions.getHistoryByUserAction);

      mockGetCurrentUserIdAction.mockResolvedValue('user-123');
      mockGetHistoryByUserAction.mockResolvedValue({
        success: false,
        messageCode: 'NETWORK_ERROR',
        message: 'Network failed',
        count: 0,
        data: [],
      });

      const result = await HistoryPage({ params: mockParams });
      expect(result).toBeDefined();
    });
  });

  describe('Success scenarios', () => {
    it('handles successful history request with data', async () => {
      const mockGetCurrentUserIdAction = vi.mocked(serverActions.getCurrentUserIdAction);
      const mockGetHistoryByUserAction = vi.mocked(serverActions.getHistoryByUserAction);

      const mockHistoryData = {
        success: true,
        count: 2,
        data: [
          {
            userId: 'user-123',
            latency: 250,
            statusCode: 200,
            statusText: 'OK',
            timestamp: new Date(),
            method: 'GET',
            requestSize: 0,
            responseSize: 1024,
            url: 'https://api.example.com',
            requestBody: '',
            headers: { 'Content-Type': 'application/json' },
          },
          {
            userId: 'user-123',
            latency: 180,
            statusCode: 201,
            statusText: 'Created',
            timestamp: new Date(),
            method: 'POST',
            requestSize: 512,
            responseSize: 256,
            url: 'https://api.test.com',
            requestBody: '{"test": true}',
            headers: { 'Content-Type': 'application/json' },
          },
        ],
        message: 'Received 2 entries',
        messageCode: 'LOGS_RECEIVED',
      };

      mockGetCurrentUserIdAction.mockResolvedValue('user-123');
      mockGetHistoryByUserAction.mockResolvedValue(mockHistoryData);

      const result = await HistoryPage({ params: mockParams });
      expect(result).toBeDefined();
    });

    it('handles successful request with no data', async () => {
      const mockGetCurrentUserIdAction = vi.mocked(serverActions.getCurrentUserIdAction);
      const mockGetHistoryByUserAction = vi.mocked(serverActions.getHistoryByUserAction);

      mockGetCurrentUserIdAction.mockResolvedValue('user-123');
      mockGetHistoryByUserAction.mockResolvedValue({
        success: true,
        count: 0,
        data: [],
        message: 'No logs found',
        messageCode: 'NO_LOGS_FOUND',
      });

      const result = await HistoryPage({ params: mockParams });
      expect(result).toBeDefined();
    });
  });

  describe('Component behavior', () => {
    it('returns valid JSX element', async () => {
      const mockGetCurrentUserIdAction = vi.mocked(serverActions.getCurrentUserIdAction);
      const mockGetHistoryByUserAction = vi.mocked(serverActions.getHistoryByUserAction);

      mockGetCurrentUserIdAction.mockResolvedValue('user-123');
      mockGetHistoryByUserAction.mockResolvedValue({
        success: true,
        count: 1,
        data: [
          {
            userId: 'user-123',
            latency: 100,
            statusCode: 200,
            statusText: 'OK',
            timestamp: new Date(),
            method: 'GET',
            requestSize: 0,
            responseSize: 512,
            url: 'https://api.example.com',
            requestBody: '',
            headers: {},
          },
        ],
        message: 'Success',
        messageCode: 'SUCCESS',
      });

      const result = await HistoryPage({ params: mockParams });

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });

  describe('JSX rendering', () => {
    it('renders "no requests yet" section when count is 0', async () => {
      const mockGetCurrentUserIdAction = vi.mocked(serverActions.getCurrentUserIdAction);
      const mockGetHistoryByUserAction = vi.mocked(serverActions.getHistoryByUserAction);

      mockGetCurrentUserIdAction.mockResolvedValue('user-123');
      mockGetHistoryByUserAction.mockResolvedValue({
        success: true,
        count: 0,
        data: [],
        message: 'No logs found',
        messageCode: 'NO_LOGS_FOUND',
      });

      const jsxResult = await HistoryPage({ params: mockParams });

      await act(async () => {
        render(jsxResult as React.ReactElement);
      });

      expect(screen.getByText('No requests yet')).toBeInTheDocument();
      expect(screen.getByTestId('link')).toBeInTheDocument();
      expect(screen.getByText('Create new request')).toBeInTheDocument();

      const historyComponent = screen.queryByTestId('history-page-client');
      const spinnerComponent = screen.queryByTestId('spinner');
      expect(historyComponent || spinnerComponent).toBeInTheDocument();
    });

    it('renders error section when result is not successful', async () => {
      const mockGetCurrentUserIdAction = vi.mocked(serverActions.getCurrentUserIdAction);
      const mockGetHistoryByUserAction = vi.mocked(serverActions.getHistoryByUserAction);

      mockGetCurrentUserIdAction.mockResolvedValue('user-123');
      mockGetHistoryByUserAction.mockResolvedValue({
        success: false,
        messageCode: 'NETWORK_ERROR',
        message: 'Network failed',
        count: 5,
        data: [],
      });

      const jsxResult = await HistoryPage({ params: mockParams });

      await act(async () => {
        render(jsxResult as React.ReactElement);
      });

      expect(
        screen.getByText((content, element) => {
          return (
            element?.tagName.toLowerCase() === 'h2' &&
            content.includes('No logs available') &&
            content.includes('Network error occurred')
          );
        }),
      ).toBeInTheDocument();

      expect(screen.getByTestId('link')).toBeInTheDocument();
      expect(screen.getByText('Create new request')).toBeInTheDocument();
      expect(screen.getByTestId('history-page-client')).toBeInTheDocument();
    });

    it('renders error section with fallback message when messageCode is not available', async () => {
      const mockGetCurrentUserIdAction = vi.mocked(serverActions.getCurrentUserIdAction);
      const mockGetHistoryByUserAction = vi.mocked(serverActions.getHistoryByUserAction);

      mockGetCurrentUserIdAction.mockResolvedValue('user-123');
      mockGetHistoryByUserAction.mockResolvedValue({
        success: false,
        messageCode: undefined,
        message: 'Custom error message',
        count: 5,
        data: [],
      });

      const jsxResult = await HistoryPage({ params: mockParams });

      await act(async () => {
        render(jsxResult as React.ReactElement);
      });

      expect(
        screen.getByText((content, element) => {
          return (
            element?.tagName.toLowerCase() === 'h2' &&
            content.includes('No logs available') &&
            content.includes('Custom error message')
          );
        }),
      ).toBeInTheDocument();

      expect(screen.getByTestId('link')).toBeInTheDocument();
      expect(screen.getByText('Create new request')).toBeInTheDocument();
      expect(screen.getByTestId('history-page-client')).toBeInTheDocument();
    });

    it('renders successful history section with data', async () => {
      const mockGetCurrentUserIdAction = vi.mocked(serverActions.getCurrentUserIdAction);
      const mockGetHistoryByUserAction = vi.mocked(serverActions.getHistoryByUserAction);

      const mockHistoryData = {
        success: true,
        count: 1,
        data: [
          {
            userId: 'user-123',
            latency: 100,
            statusCode: 200,
            statusText: 'OK',
            timestamp: new Date(),
            method: 'GET',
            requestSize: 0,
            responseSize: 512,
            url: 'https://api.example.com',
            requestBody: '',
            headers: {},
          },
        ],
        message: 'Success',
        messageCode: 'SUCCESS',
      };

      mockGetCurrentUserIdAction.mockResolvedValue('user-123');
      mockGetHistoryByUserAction.mockResolvedValue(mockHistoryData);

      const jsxResult = await HistoryPage({ params: mockParams });

      await act(async () => {
        render(jsxResult as React.ReactElement);
      });

      const historyComponent = screen.queryByTestId('history-page-client');
      const spinnerComponent = screen.queryByTestId('spinner');
      expect(historyComponent || spinnerComponent).toBeInTheDocument();

      expect(screen.queryByText('No requests yet')).not.toBeInTheDocument();
      expect(screen.queryByText(/No logs available/)).not.toBeInTheDocument();
      expect(screen.queryByText('Server error')).not.toBeInTheDocument();
    });

    it('renders server error section when exception is thrown', async () => {
      const mockGetCurrentUserIdAction = vi.mocked(serverActions.getCurrentUserIdAction);
      const mockGetHistoryByUserAction = vi.mocked(serverActions.getHistoryByUserAction);

      mockGetCurrentUserIdAction.mockResolvedValue('user-123');
      mockGetHistoryByUserAction.mockRejectedValue(new Error('Database connection failed'));

      const jsxResult = await HistoryPage({ params: mockParams });

      await act(async () => {
        render(jsxResult as React.ReactElement);
      });

      expect(screen.getByText('Server error')).toBeInTheDocument();
      expect(screen.getByTestId('link')).toBeInTheDocument();
      expect(screen.getByText('Create new request')).toBeInTheDocument();
      expect(screen.getByTestId('history-page-client')).toBeInTheDocument();
    });
  });
});
