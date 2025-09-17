import { render, screen } from '@testing-library/react';
import NavLinks from './NavLinks';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mockUsePathname = vi.fn();

vi.mock('@/i18n/navigation', () => ({
  Link: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
  usePathname: () => mockUsePathname(),
}));

const dictionary: Record<string, string> = {
  clientNavLink: 'Client',
  historyLink: 'History',
  variablesLink: 'Variables',
};

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => dictionary[key] ?? key,
}));

vi.mock('./NavLinks.module.css', () => ({
  default: {
    links: 'links',
  },
}));

describe('NavLinks', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the links with correct labels and hrefs', () => {
    render(<NavLinks />);

    expect(screen.getByRole('link', { name: 'Client' })).toHaveAttribute('href', '/client');
    expect(screen.getByRole('link', { name: 'History' })).toHaveAttribute('href', '/history');
    expect(screen.getByRole('link', { name: 'Variables' })).toHaveAttribute('href', '/variables');
  });

  it('highlights active link', () => {
    mockUsePathname.mockReturnValue('/client');
    render(<NavLinks />);

    expect(screen.getByRole('link', { name: 'Client' })).toHaveClass('active-link');
    expect(screen.getByRole('link', { name: 'History' })).not.toHaveClass('active-link');
    expect(screen.getByRole('link', { name: 'Variables' })).not.toHaveClass('active-link');
  });
});
