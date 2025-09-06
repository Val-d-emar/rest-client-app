import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Header from './Header';
import { ImageProps } from 'next/image';

const dictionary: Record<string, string> = {
  logoAlt: 'REST Client Logo',
  title: 'REST Client App',
  SignInLabel: 'Sign in',
  SignUpLabel: 'Sign up',
};

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => dictionary[key] ?? key,
}));

vi.mock('@/i18n/navigation', () => ({
  Link: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));

vi.mock('@/components/LocaleSwitcher', () => ({
  default: () => <div data-testid='locale-switcher' />,
}));

vi.mock('next/image', () => ({
  default: ({ alt, ...rest }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img alt={alt} {...rest} />
  ),
}));

vi.mock('./Header.module.css', () => ({
  default: {
    scrolled: 'scrolled',
  },
}));

describe('Header', () => {
  it('renders logo, title, locale switcher and auth links', () => {
    render(<Header />);

    const logo = screen.getByRole('img', { name: dictionary.logoAlt });
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/logo.png');

    expect(screen.getByText(dictionary.title)).toBeInTheDocument();

    expect(screen.getByTestId('locale-switcher')).toBeInTheDocument();

    const signIn = screen.getByRole('link', { name: dictionary.SignInLabel });
    expect(signIn).toHaveAttribute('href', '/auth/signin');

    const signUp = screen.getByRole('link', { name: dictionary.SignUpLabel });
    expect(signUp).toHaveAttribute('href', '/auth/signup');
  });

  it('adds "scrolled" class on window scroll and removes it on scroll to the top', () => {
    render(<Header />);

    const header = screen.getByRole('banner');
    expect(header).not.toHaveClass('scrolled');

    fireEvent.scroll(window, { target: { scrollY: 100 } });
    expect(header).toHaveClass('scrolled');

    fireEvent.scroll(window, { target: { scrollY: 0 } });
    expect(header).not.toHaveClass('scrolled');
  });
});
