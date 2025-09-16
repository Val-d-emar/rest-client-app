import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SignInForm from './signin-form';
import { useAuth } from '@/context/__mocks__/AuthContext';
import { useRouter } from '@/i18n/navigation';
import toast from 'react-hot-toast';
import userEvent from '@testing-library/user-event';

vi.mock('@/context/AuthContext');
vi.mock('@/i18n/navigation', () => ({ useRouter: vi.fn() }));
vi.mock('react-hot-toast');
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key.split('.').pop() || key,
}));

describe('SignInForm', () => {
  describe('Integration Tests', () => {
    const mockSignIn = vi.fn();
    const mockRouterPush = vi.fn();

    beforeEach(() => {
      (useAuth as Mock).mockReturnValue({ signIn: mockSignIn });
      (useRouter as Mock).mockReturnValue({ push: mockRouterPush });
      vi.clearAllMocks();
    });

    it('should allow user to type and submit the form', async () => {
      mockSignIn.mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(<SignInForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^\* password:/i);
      const submitButton = screen.getByRole('button', { name: /signIn/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123!');

      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith(
          'test@example.com',
          'Password123!',
          expect.any(Function),
        );

        expect(toast.success).toHaveBeenCalledWith('welcomeBack', expect.any(Object));
      });
    });

    it('should show an error toast if sign in fails', async () => {
      const errorMessage = 'Firebase: Error (auth/wrong-password).';
      mockSignIn.mockRejectedValue(new Error(errorMessage));
      const user = userEvent.setup();

      render(<SignInForm />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^\* password:/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /signIn/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(errorMessage, expect.any(Object));
        expect(mockRouterPush).not.toHaveBeenCalled();
      });
    });
  });

  describe('Structural Tests', () => {
    it('renders the form wrapper and its content', () => {
      const { container } = render(<SignInForm />);

      const wrapperDiv = container.querySelector('.wrapper');
      expect(wrapperDiv).toBeInTheDocument();

      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /signIn/i })).toBeInTheDocument();
    });
  });
});
