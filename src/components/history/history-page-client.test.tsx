import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import HistoryPageClient from './history-page-client';
import { useAuth } from '@/context/AuthContext';
import * as clientActions from '@/lib/client-action/handle-getlog-user';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { GetLogsResult, HttpRequestLog } from '@/type/type';
import { User } from 'firebase/auth';

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/client-action/handle-getlog-user', () => ({
  handleGetLogUserById: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('@/components/history/history-table', () => ({
  default: ({ logs }: { logs: HttpRequestLog[] }) => (
    <div data-testid='history-table'>History Table with {logs.length} logs</div>
  ),
}));

describe('HistoryPageClient', () => {
  const mockUser = {
    uid: 'user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: 'refresh-token',
    tenantId: null,
    delete: vi.fn(),
    getIdToken: vi.fn(),
    getIdTokenResult: vi.fn(),
    reload: vi.fn(),
    toJSON: vi.fn(),
    phoneNumber: null,
    photoURL: null,
    providerId: 'firebase',
  } as User;

  const mockInitialData: GetLogsResult = {
    success: true,
    count: 2,
    data: [
      {
        userId: 'user-123',
        latency: 250,
        statusCode: 200,
        statusText: 'OK',
        timestamp: new Date('2023-01-01T10:00:00Z'),
        method: 'GET',
        requestSize: 0,
        responseSize: 1024,
        url: 'https://api.example.com/test',
        requestBody: '',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        userId: 'user-123',
        latency: 180,
        statusCode: 201,
        statusText: 'Created',
        timestamp: new Date('2023-01-01T11:00:00Z'),
        method: 'POST',
        requestSize: 512,
        responseSize: 256,
        url: 'https://api.example.com/create',
        requestBody: '{"test": true}',
        headers: { 'Content-Type': 'application/json' },
      },
    ],
    message: 'Success',
    messageCode: 'SUCCESS',
  };

  const mockTranslations = {
    refreshButton: 'Refresh',
    refreshing: 'Refreshing...',
    loading: 'Loading...',
    refreshError: 'Failed to refresh logs',
    userLogs: 'User {{user}} has {{count}} logs',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      loading: false,
    });

    vi.mocked(useTranslations).mockReturnValue(((key: string, params?: Record<string, unknown>) => {
      if (key === 'userLogs' && params) {
        return `User ${params.user} has ${params.count} logs`;
      }
      return mockTranslations[key as keyof typeof mockTranslations] || key;
    }) as ReturnType<typeof useTranslations>);
  });

  describe('Rendering with data', () => {
    it('renders correctly with initial data', () => {
      render(<HistoryPageClient initialData={mockInitialData} />);

      expect(screen.getByText('Refresh')).toBeInTheDocument();
      expect(screen.getByText('User test@example.com has 2 logs')).toBeInTheDocument();
      expect(screen.getByTestId('history-table')).toBeInTheDocument();
      expect(screen.getByText('History Table with 2 logs')).toBeInTheDocument();
    });

    it('renders refresh button when there is no data but user exists', () => {
      render(<HistoryPageClient initialData={null} />);

      expect(screen.getByText('Refresh')).toBeInTheDocument();
      expect(screen.queryByTestId('history-table')).not.toBeInTheDocument();
    });

    it('does not render refresh button when user is null', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        signIn: vi.fn(),
        signOut: vi.fn(),
        signUp: vi.fn(),
        loading: false,
      });

      render(<HistoryPageClient initialData={null} />);

      expect(screen.queryByText('Refresh')).not.toBeInTheDocument();
    });
  });

  describe('Refresh functionality', () => {
    it('calls handleGetLogUserById when refresh button is clicked', async () => {
      const mockHandleGetLogUserById = vi.mocked(clientActions.handleGetLogUserById);
      mockHandleGetLogUserById.mockResolvedValue(mockInitialData);

      render(<HistoryPageClient initialData={null} />);

      const refreshButton = screen.getByText('Refresh');

      await act(async () => {
        fireEvent.click(refreshButton);
      });

      expect(mockHandleGetLogUserById).toHaveBeenCalledWith('user-123', expect.any(Function));
    });

    it('updates state with new data on successful refresh', async () => {
      const newData: GetLogsResult = {
        ...mockInitialData,
        count: 3,
        data: [
          ...(mockInitialData.data ?? []),
          {
            userId: 'user-123',
            latency: 300,
            statusCode: 204,
            statusText: 'No Content',
            timestamp: new Date('2023-01-01T12:00:00Z'),
            method: 'DELETE',
            requestSize: 0,
            responseSize: 0,
            url: 'https://api.example.com/delete',
            requestBody: '',
            headers: {},
          },
        ],
      };

      const mockHandleGetLogUserById = vi.mocked(clientActions.handleGetLogUserById);
      mockHandleGetLogUserById.mockResolvedValue(newData);

      render(<HistoryPageClient initialData={mockInitialData} />);

      const refreshButton = screen.getByText('Refresh');

      await act(async () => {
        fireEvent.click(refreshButton);
      });

      await waitFor(() => {
        expect(screen.getByText('User test@example.com has 3 logs')).toBeInTheDocument();
        expect(screen.getByText('History Table with 3 logs')).toBeInTheDocument();
      });
    });

    it('shows loading state during refresh', async () => {
      const mockHandleGetLogUserById = vi.mocked(clientActions.handleGetLogUserById);
      mockHandleGetLogUserById.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockInitialData), 100)),
      );

      render(<HistoryPageClient initialData={mockInitialData} />);

      const refreshButton = screen.getByText('Refresh');

      await act(async () => {
        fireEvent.click(refreshButton);
      });

      expect(screen.getByText('Refreshing...')).toBeInTheDocument();
      expect(refreshButton).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument();
        expect(refreshButton).not.toBeDisabled();
      });
    });

    it('shows error toast when refresh fails with unsuccessful result', async () => {
      const mockHandleGetLogUserById = vi.mocked(clientActions.handleGetLogUserById);
      const mockToastError = vi.mocked(toast.error);

      const failedResult: GetLogsResult = {
        success: false,
        count: 0,
        data: [],
        message: 'Server error occurred',
        messageCode: 'SERVER_ERROR',
      };

      mockHandleGetLogUserById.mockResolvedValue(failedResult);

      render(<HistoryPageClient initialData={mockInitialData} />);

      const refreshButton = screen.getByText('Refresh');

      await act(async () => {
        fireEvent.click(refreshButton);
      });

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Server error occurred');
      });
    });

    it('shows error toast when refresh throws an exception', async () => {
      const mockHandleGetLogUserById = vi.mocked(clientActions.handleGetLogUserById);
      const mockToastError = vi.mocked(toast.error);

      mockHandleGetLogUserById.mockRejectedValue(new Error('Network connection failed'));

      render(<HistoryPageClient initialData={mockInitialData} />);

      const refreshButton = screen.getByText('Refresh');

      await act(async () => {
        fireEvent.click(refreshButton);
      });

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Network connection failed');
      });
    });

    it('shows generic error when exception is not an Error object', async () => {
      const mockHandleGetLogUserById = vi.mocked(clientActions.handleGetLogUserById);
      const mockToastError = vi.mocked(toast.error);

      mockHandleGetLogUserById.mockRejectedValue('Unknown error');

      render(<HistoryPageClient initialData={mockInitialData} />);

      const refreshButton = screen.getByText('Refresh');

      await act(async () => {
        fireEvent.click(refreshButton);
      });

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Failed to refresh logs');
      });
    });

    it('does not call handleGetLogUserById when user is null', async () => {
      const mockHandleGetLogUserById = vi.mocked(clientActions.handleGetLogUserById);

      vi.mocked(useAuth).mockReturnValue({
        user: null,
        signIn: vi.fn(),
        signOut: vi.fn(),
        signUp: vi.fn(),
        loading: false,
      });

      render(<HistoryPageClient initialData={null} />);

      expect(screen.queryByText('Refresh')).not.toBeInTheDocument();
      expect(mockHandleGetLogUserById).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('handles initial data with empty array', () => {
      const emptyData: GetLogsResult = {
        success: true,
        count: 0,
        data: [],
        message: 'No logs found',
        messageCode: 'NO_LOGS',
      };

      render(<HistoryPageClient initialData={emptyData} />);

      expect(screen.getByText('Refresh')).toBeInTheDocument();
      expect(screen.queryByTestId('history-table')).not.toBeInTheDocument();
    });

    it('handles initial data with success false', () => {
      const failedData: GetLogsResult = {
        success: false,
        count: 0,
        data: [],
        message: 'Failed to load',
        messageCode: 'LOAD_ERROR',
      };

      render(<HistoryPageClient initialData={failedData} />);

      expect(screen.getByText('Refresh')).toBeInTheDocument();
      expect(screen.queryByTestId('history-table')).not.toBeInTheDocument();
    });

    it('handles user with missing email', () => {
      const userWithoutEmail = {
        uid: 'user-123',
        email: null,
        displayName: 'Test User',
        emailVerified: false,
        isAnonymous: false,
        metadata: {
          creationTime: '2023-01-01T00:00:00Z',
          lastSignInTime: '2023-01-01T00:00:00Z',
        },
        providerData: [],
        refreshToken: 'test-refresh-token',
        tenantId: null,
        delete: vi.fn(),
        getIdToken: vi.fn().mockResolvedValue('test-token'),
        getIdTokenResult: vi.fn().mockResolvedValue({
          token: 'test-token',
          authTime: '2023-01-01T00:00:00Z',
          issuedAtTime: '2023-01-01T00:00:00Z',
          expirationTime: '2023-01-01T01:00:00Z',
          signInProvider: 'password',
          signInSecondFactor: null,
          claims: {},
        }),
        reload: vi.fn(),
        toJSON: vi.fn().mockReturnValue({}),
        phoneNumber: null,
        photoURL: null,
        providerId: 'firebase',
      };

      vi.mocked(useAuth).mockReturnValue({
        user: userWithoutEmail,
        signIn: vi.fn(),
        signOut: vi.fn(),
        signUp: vi.fn(),
        loading: false,
      });

      render(<HistoryPageClient initialData={mockInitialData} />);

      expect(screen.getByText('User unknown has 2 logs')).toBeInTheDocument();
    });
  });

  describe('Component state management', () => {
    it('maintains state correctly through multiple refreshes', async () => {
      const mockHandleGetLogUserById = vi.mocked(clientActions.handleGetLogUserById);

      const firstRefreshData: GetLogsResult = {
        ...mockInitialData,
        count: 1,
        data: [(mockInitialData.data ?? [])[0]],
      };

      const secondRefreshData: GetLogsResult = {
        ...mockInitialData,
        count: 3,
        data: [
          ...(mockInitialData.data ?? []),
          {
            userId: 'user-123',
            latency: 400,
            statusCode: 500,
            statusText: 'Internal Server Error',
            timestamp: new Date(),
            method: 'POST',
            requestSize: 256,
            responseSize: 0,
            url: 'https://api.example.com/error',
            requestBody: '{"error": true}',
            headers: {},
          },
        ],
      };

      mockHandleGetLogUserById
        .mockResolvedValueOnce(firstRefreshData)
        .mockResolvedValueOnce(secondRefreshData);

      render(<HistoryPageClient initialData={mockInitialData} />);

      const refreshButton = screen.getByText('Refresh');

      await act(async () => {
        fireEvent.click(refreshButton);
      });

      await waitFor(() => {
        expect(screen.getByText('User test@example.com has 1 logs')).toBeInTheDocument();
        expect(screen.getByText('History Table with 1 logs')).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(refreshButton);
      });

      await waitFor(() => {
        expect(screen.getByText('User test@example.com has 3 logs')).toBeInTheDocument();
        expect(screen.getByText('History Table with 3 logs')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('refresh button has proper disabled state', async () => {
      const mockHandleGetLogUserById = vi.mocked(clientActions.handleGetLogUserById);
      mockHandleGetLogUserById.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockInitialData), 100)),
      );

      render(<HistoryPageClient initialData={mockInitialData} />);

      const refreshButton = screen.getByText('Refresh');
      expect(refreshButton).not.toBeDisabled();

      await act(async () => {
        fireEvent.click(refreshButton);
      });

      expect(refreshButton).toBeDisabled();

      await waitFor(() => {
        expect(refreshButton).not.toBeDisabled();
      });
    });

    it('renders proper heading structure', () => {
      render(<HistoryPageClient initialData={mockInitialData} />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('user-logs');
      expect(heading).toHaveTextContent('User test@example.com has 2 logs');
    });
  });
});
