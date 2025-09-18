import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GlobalNotFound from './not-found';

vi.mock('@next/link', () => ({
  Link: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));

describe('GlobalNotFound Page', () => {
  it('should render all static elements correctly', () => {
    render(<GlobalNotFound />);

    expect(screen.getByRole('heading', { level: 1, name: '404' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Page Not Found' })).toBeInTheDocument();
    expect(
      screen.getByText('Sorry, the page you are looking for does not exist.'),
    ).toBeInTheDocument();

    const homeLink = screen.getByRole('link');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');

    expect(homeLink).toContainElement(screen.getByRole('button', { name: 'Return to Home' }));
  });
});
