import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import MainPage from './MainPage';
import { useAuth } from '@/context/AuthContext';

vi.mock('@/context/AuthContext');

const dictionary: Record<string, string> = {
  SignInLabel: 'Sign In',
  SignUpLabel: 'Sign Up',
  welcomeUnauth: 'Welcome!',
  welcomeAuth: 'Welcome back, {user}!',
  defaultUser: 'user',
  clientLink: 'REST Client',
  historyLink: 'History',
  variablesLink: 'Variables',
};

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, vars?: Record<string, string>) => {
    if (key === 'welcomeAuth') {
      const name = vars?.user ?? dictionary.defaultUser;
      return dictionary.welcomeAuth.replace('{user}', name);
    }
    return dictionary[key] ?? key;
  },
}));

vi.mock('@/i18n/navigation', () => ({
  Link: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));

describe('MainPage', () => {
  it('renders guest view if user is not logged in', () => {
    render(<MainPage />);

    expect(screen.getByRole('heading', { level: 1, name: /welcome!/i })).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/auth/signin');
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/auth/signup');

    expect(screen.queryByRole('link', { name: /rest client/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /history/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /variables/i })).not.toBeInTheDocument();
  });

  it.skip('renders user view if user is logged in', () => {
    render(<MainPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: /welcome back, student!/i }),
    ).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /client/i })).toHaveAttribute('href', '/client');
    expect(screen.getByRole('link', { name: /history/i })).toHaveAttribute('href', '/history');
    expect(screen.getByRole('link', { name: /variables/i })).toHaveAttribute('href', '/variables');

    expect(screen.queryByRole('link', { name: /sign in/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /sign up/i })).not.toBeInTheDocument();
  });

  it.skip('uses defaultUser when user is not specified', () => {
    render(<MainPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: /welcome back, user!/i }),
    ).toBeInTheDocument();
  });
});
