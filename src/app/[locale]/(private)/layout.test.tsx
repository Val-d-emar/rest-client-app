import { render, screen, waitFor } from '@/lib/utils/test-utils';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import PrivateLayout from './layout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'react-hot-toast';
import messages from '@/../messages/en.json';

vi.mock('@/context/AuthContext');
vi.mock('@/i18n/navigation', () => ({ useRouter: vi.fn() }));
vi.mock('react-hot-toast');

describe('PrivateLayout', () => {
  const mockRouterReplace = vi.fn();
  const mockSignOut = vi.fn();

  beforeEach(() => {
    (useRouter as Mock).mockReturnValue({ replace: mockRouterReplace });
    vi.clearAllMocks();
  });

  it('should show a spinner while auth state is loading', () => {
    (useAuth as Mock).mockReturnValue({
      user: null,
      loading: true,
      signOut: mockSignOut,
    });

    render(
      <PrivateLayout>
        <div>Child Content</div>
      </PrivateLayout>,
    );

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('should redirect to signin if user is not authenticated', async () => {
    (useAuth as Mock).mockReturnValue({
      user: null,
      loading: false,
      signOut: mockSignOut,
    });

    render(
      <PrivateLayout>
        <div>Child Content</div>
      </PrivateLayout>,
    );

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith('/auth/signin');
    });
  });

  it('should render children if user is authenticated and session is valid', async () => {
    (useAuth as Mock).mockReturnValue({
      user: {
        uid: '123',
        email: 'test@test.com',
        getIdToken: vi.fn().mockResolvedValue('fake-token'),
      },
      loading: false,
      signOut: mockSignOut,
    });

    render(
      <PrivateLayout>
        <div>Child Content</div>
      </PrivateLayout>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Child Content')).toBeInTheDocument();
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });
  it('should sign out and redirect if session verification fails', async () => {
    const testError = new Error('Invalid token');
    (useAuth as Mock).mockReturnValue({
      user: { uid: '123', getIdToken: vi.fn().mockRejectedValue(testError) },
      loading: false,
      signOut: mockSignOut,
    });

    render(
      <PrivateLayout>
        <div>Child</div>
      </PrivateLayout>,
    );

    await waitFor(() => {
      const mockedToastError = vi.mocked(toast.error);
      expect(mockedToastError).toHaveBeenCalled();

      const expectedMessage = messages.ClientPage.errorSessionExpired;
      expect(mockedToastError.mock.calls[0][0]).toContain(expectedMessage);

      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(mockRouterReplace).toHaveBeenCalledWith('/auth/signin');
    });
  });
});
