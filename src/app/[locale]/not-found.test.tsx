import { render, screen } from '@/lib/utils/test-utils';
import { describe, it, expect, vi } from 'vitest';
import NotFoundPage from './not-found';

vi.mock('next-intl', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next-intl')>();

  return {
    useTranslations: () => (key: string) => key,
  };
});

vi.mock('@/i18n/navigation', () => ({
  Link: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));

describe.skip('NotFound Page', () => {
  it('should render all key elements correctly', () => {
    render(<NotFoundPage />);

    expect(screen.getByRole('heading', { level: 1, name: '404' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'title' })).toBeInTheDocument();
    expect(screen.getByText('sorry')).toBeInTheDocument();
    const homeLink = screen.getByRole('link', { name: 'btn' });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });
});
