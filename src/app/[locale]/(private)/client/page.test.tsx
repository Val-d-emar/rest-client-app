import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import ClientRoute from './page';
import { useAuth } from '@/context/AuthContext';
import { redirect } from '@/i18n/navigation';
import { useParams } from 'next/navigation';

vi.mock('@/context/AuthContext');
vi.mock('@/i18n/navigation', () => ({
  redirect: vi.fn(),
}));
vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/navigation')>();
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

vi.mock('@/components/ClientPage/ClientPage', () => ({
  default: () => <div data-testid='client-page-mock'>Client Page Content</div>,
}));

describe('ClientRoute Component', () => {
  const mockedRedirect = vi.mocked(redirect);
  const mockedUseParams = vi.mocked(useParams);

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseParams.mockReturnValue({ locale: 'en' });
  });

  it('should redirect to main page if user is not authenticated', () => {
    (useAuth as Mock).mockReturnValue({
      user: null,
    });

    render(<ClientRoute />);

    expect(mockedRedirect).toHaveBeenCalledWith({ href: '/', locale: 'en' });
  });

  it('should render the ClientPage inside Suspense when user is authenticated', async () => {
    (useAuth as Mock).mockReturnValue({
      user: { uid: '123' },
    });

    render(<ClientRoute />);

    expect(screen.getByTestId('spinner')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('client-page-mock')).toBeInTheDocument();
    });

    expect(screen.getByText('Client Page Content')).toBeInTheDocument();
    expect(mockedRedirect).not.toHaveBeenCalled();
  });
});
