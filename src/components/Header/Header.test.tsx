import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import Header from './Header';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/i18n/navigation';

vi.mock('@/context/AuthContext');

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
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

vi.mock('@/components/LocaleSwitcher', () => ({
  default: () => <div data-testid='locale-switcher' />,
}));

vi.mock('next/image', () => ({
  default: ({
    alt,
    priority,
    ...rest
  }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => (
    <img alt={alt} {...rest} />
  ),
}));

vi.mock('./Header.module.css', () => ({
  default: {
    scrolled: 'scrolled',
  },
}));

describe('Header', () => {
  describe('when user is not authenticated', () => {
    beforeEach(() => {
      (useAuth as Mock).mockReturnValue({
        user: null,
        loading: false,
      });
    });
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
  describe('when user is authenticated', () => {
    const mockSignOut = vi.fn();
    const mockRouterPush = vi.fn();

    beforeEach(() => {
      (useAuth as Mock).mockReturnValue({
        user: { email: 'test@example.com' },
        loading: false,
        signOut: mockSignOut,
      });
      (useRouter as Mock).mockReturnValue({
        push: mockRouterPush,
      });
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('renders Sign Out button', () => {
      render(<Header />);
      expect(screen.getByRole('button', { name: dictionary.SignOutLabel })).toBeInTheDocument();
    });

    it('calls signOut and redirects on button click', async () => {
      render(<Header />);
      const signOutButton = screen.getByRole('button', { name: dictionary.SignOutLabel });

      fireEvent.click(signOutButton);

      expect(mockSignOut).toHaveBeenCalledTimes(1);
      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith('/');
      });
    });
  });
});
