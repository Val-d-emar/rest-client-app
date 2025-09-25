import { fireEvent, render, screen, waitFor, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import Header from './Header';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/i18n/navigation';
import toast from 'react-hot-toast';

vi.mock('@/context/AuthContext');

const dictionary: Record<string, string> = {
  logoAlt: 'logo',
  SignInLabel: 'Sign in',
  SignUpLabel: 'Sign up',
  SignOutLabel: 'Sign out',
  MainPage: 'Main page',
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

vi.mock('../NavLinks/NavLinks', () => ({
  default: () => <div data-testid='nav-links' />,
}));

vi.mock('./Header.module.css', () => ({
  default: {
    scrolled: 'scrolled',
  },
}));

vi.mock('react-hot-toast', () => {
  const loading = vi.fn(() => 'id1');
  const success = vi.fn();
  const error = vi.fn();
  return {
    default: { loading, success, error },
  };
});

describe('Header', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      (useAuth as Mock).mockReturnValue({
        user: null,
        loading: false,
      });
    });

    it('renders logo, locale switcher and auth links but not nav links', async () => {
      await act(async () => {
        render(<Header />);
      });

      const logo = screen.getByRole('img', { name: dictionary.logoAlt });
      expect(logo).toBeInTheDocument();
      expect(logo.getAttribute('src')).toContain('logo.png');

      expect(screen.getByTestId('locale-switcher')).toBeInTheDocument();

      const signIn = screen.getByRole('link', { name: dictionary.SignInLabel });
      expect(signIn).toHaveAttribute('href', '/auth/signin');

      const signUp = screen.getByRole('link', { name: dictionary.SignUpLabel });
      expect(signUp).toHaveAttribute('href', '/auth/signup');

      expect(screen.queryByTestId('nav-links')).not.toBeInTheDocument();
    });

    it('adds "scrolled" class on window scroll and removes it on scroll to the top', async () => {
      await act(async () => {
        render(<Header />);
      });

      const header = screen.getByRole('banner');
      expect(header).not.toHaveClass('scrolled');

      await act(async () => {
        fireEvent.scroll(window, { target: { scrollY: 100 } });
      });
      expect(header).toHaveClass('scrolled');

      await act(async () => {
        fireEvent.scroll(window, { target: { scrollY: 0 } });
      });
      expect(header).not.toHaveClass('scrolled');
    });

    it('when loading=true shows only logo & LocaleSwitcher', async () => {
      (useAuth as Mock).mockReturnValue({
        user: null,
        loading: true,
      });
      await act(async () => {
        render(<Header />);
      });

      const logo = screen.getByRole('img', { name: dictionary.logoAlt });
      expect(logo).toBeInTheDocument();
      expect(logo.getAttribute('src')).toContain('logo.png');

      expect(screen.getByTestId('locale-switcher')).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: dictionary.SignInLabel })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: dictionary.SignUpLabel })).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: dictionary.SignOutLabel }),
      ).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: dictionary.MainPage })).not.toBeInTheDocument();
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

    it('renders NavLinks, MainPage and Sign out)', async () => {
      await act(async () => {
        render(<Header />);
      });

      expect(screen.getByTestId('nav-links')).toBeInTheDocument();

      expect(screen.getByRole('button', { name: dictionary.MainPage })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: dictionary.SignOutLabel })).toBeInTheDocument();

      expect(screen.queryByRole('link', { name: dictionary.SignInLabel })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: dictionary.SignUpLabel })).not.toBeInTheDocument();
    });

    it('calls signOut and redirects on button click', async () => {
      await act(async () => {
        render(<Header />);
      });
      const signOutButton = screen.getByRole('button', { name: dictionary.SignOutLabel });

      await act(async () => {
        fireEvent.click(signOutButton);
      });

      expect(mockSignOut).toHaveBeenCalledTimes(1);
      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith('/');
      });
    });

    it('on signOut error shows toast.error', async () => {
      mockSignOut.mockRejectedValue(new Error('Oops'));

      await act(async () => {
        render(<Header />);
      });
      const signOutButton = screen.getByRole('button', { name: dictionary.SignOutLabel });

      await act(async () => {
        fireEvent.click(signOutButton);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Oops', { id: 'id1' });
      });

      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });
});
