import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import SignUpForm from './signup-form';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'react-hot-toast';

vi.mock('@/context/AuthContext');
vi.mock('@/i18n/navigation', () => ({ useRouter: vi.fn() }));
vi.mock('react-hot-toast');
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key.split('.').pop() || key,
}));

describe('SignUpForm', () => {
  describe('Integration Tests', () => {
    const mockSignUp = vi.fn();
    const mockRouterPush = vi.fn();

    beforeEach(() => {
      (useAuth as Mock).mockReturnValue({ signUp: mockSignUp });
      (useRouter as Mock).mockReturnValue({ push: mockRouterPush });
      vi.clearAllMocks();
    });

    it('should successfully sign up a user and redirect', async () => {
      mockSignUp.mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(<SignUpForm />);

      await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
      await user.type(screen.getByLabelText(/^\* password:/i), 'ValidPass123!');

      await user.type(screen.getByLabelText(/^\* confirmPassword:/i), 'ValidPass123!');

      await user.click(screen.getByRole('button', { name: /signUp/i }));

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('newuser@example.com', 'ValidPass123!');
        expect(toast.success).toHaveBeenCalledWith('registrationSuccess', expect.any(Object));
        expect(mockRouterPush).toHaveBeenCalledWith('/');
      });
    });

    it('should show an error toast if sign up fails', async () => {
      const errorMessage = 'Firebase: This email is already in use.';
      mockSignUp.mockRejectedValue(new Error(errorMessage));
      const user = userEvent.setup();

      render(<SignUpForm />);

      await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
      await user.type(screen.getByLabelText(/^\* password:/i), 'ValidPass123!');
      await user.type(screen.getByLabelText(/^\* confirmPassword:/i), 'ValidPass123!');

      await user.click(screen.getByRole('button', { name: /signUp/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(errorMessage, expect.any(Object));
        expect(mockRouterPush).not.toHaveBeenCalled();
      });
    });
  });

  describe('Structural Tests', () => {
    it('renders the form wrapper and its content', () => {
      const { container } = render(<SignUpForm />);

      const wrapperDiv = container.querySelector('.wrapper');
      expect(wrapperDiv).toBeInTheDocument();

      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^\* password:/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^\* confirmPassword:/i)).toBeInTheDocument();
    });
  });
});
