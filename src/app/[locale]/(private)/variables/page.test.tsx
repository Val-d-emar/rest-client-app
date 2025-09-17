import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import VariablesRoute from './page';
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

vi.mock('@/components/variables/variables-page', () => ({
  default: () => <div data-testid='variables-page-mock'>Variables Page Content</div>,
}));

describe('VariablesRoute Component', () => {
  const mockedRedirect = vi.mocked(redirect);
  const mockedUseParams = vi.mocked(useParams);

  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseParams.mockReturnValue({ locale: 'en' });
  });

  it('should redirect to signin if user is not authenticated', () => {
    (useAuth as Mock).mockReturnValue({
      user: null,
    });

    render(<VariablesRoute />);

    expect(mockedRedirect).toHaveBeenCalledWith({ href: '/signin', locale: 'en' });
  });

  it('should render the VariablesPage inside Suspense when user is authenticated', async () => {
    (useAuth as Mock).mockReturnValue({
      user: { uid: '123' },
    });

    render(<VariablesRoute />);

    expect(screen.getByTestId('spinner')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('variables-page-mock')).toBeInTheDocument();
    });

    expect(screen.getByText('Variables Page Content')).toBeInTheDocument();

    expect(mockedRedirect).not.toHaveBeenCalled();
  });
});
