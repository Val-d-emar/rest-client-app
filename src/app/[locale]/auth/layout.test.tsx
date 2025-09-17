import { render, screen, waitFor } from '@/lib/utils/test-utils';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import AuthLayout from './layout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/i18n/navigation';

vi.mock('@/context/AuthContext');
vi.mock('@/i18n/navigation', () => ({ useRouter: vi.fn() }));

describe('AuthLayout', () => {
  const mockRouterReplace = vi.fn();

  beforeEach(() => {
    (useRouter as Mock).mockReturnValue({ replace: mockRouterReplace });
    vi.clearAllMocks();
  });

  it('should show a spinner while auth state is loading', () => {
    (useAuth as Mock).mockReturnValue({
      user: null,
      loading: true,
    });

    render(
      <AuthLayout>
        <div>Child Content</div>
      </AuthLayout>,
    );

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(screen.queryByText('Child Content')).not.toBeInTheDocument();
  });

  it('should render children if user is not authenticated', () => {
    (useAuth as Mock).mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <AuthLayout>
        <div>Child Content</div>
      </AuthLayout>,
    );

    expect(screen.getByText('Child Content')).toBeInTheDocument();
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it('should redirect to home if user is authenticated', async () => {
    (useAuth as Mock).mockReturnValue({
      user: { uid: '123', email: 'test@test.com' },
      loading: false,
    });

    render(
      <AuthLayout>
        <div>Child Content</div>
      </AuthLayout>,
    );

    expect(screen.queryByText('Child Content')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith('/');
    });
  });
});
