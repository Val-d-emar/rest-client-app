import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FormContent from './form-content';

const mockTranslations: Record<string, string | Record<string, string>> = {
  email: 'Email',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  signIn: 'Sign In',
  signUp: 'Sign Up',
  submit: 'Submit',
  submitting: 'Submitting...',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  showConfirmPassword: 'Show confirm password',
  hideConfirmPassword: 'Hide confirm password',
  validation: {
    emailRequired: 'Email is required',
    emailIncorrect: 'Incorrect email',
    passwordRequired: 'Password is required',
    passwordMinLength: 'At least 8 characters',
    passwordUppercase: 'Need at least one uppercase letter',
    passwordLowercase: 'Need at least one lowercase letter',
    passwordDigit: 'Need at least one digit',
    passwordSpecial: 'Need at least one special character',
    passwordUnicode: 'Password must be in valid Unicode format',
    confirmPasswordRequired: 'Confirm password is required',
    passwordsMatch: 'Passwords must match',
  },
};

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const keys = key.split('.');
    let result: unknown = mockTranslations;

    for (const k of keys) {
      if (result && typeof result === 'object' && k in (result as Record<string, unknown>)) {
        result = (result as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }

    return typeof result === 'string' ? result : key;
  },
}));

describe('FormContent Password Visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders password fields with hidden text by default', () => {
    render(<FormContent onSignUp={vi.fn()} />);

    const passwordInput = screen.getByTestId('password');
    const confirmPasswordInput = screen.getByTestId('confirm-password');

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });

  it('shows password toggle buttons', () => {
    render(<FormContent onSignUp={vi.fn()} />);

    const passwordToggleButton = screen
      .getAllByRole('button')
      .find((button) => button.getAttribute('aria-label') === 'Show password');
    const confirmPasswordToggleButton = screen
      .getAllByRole('button')
      .find((button) => button.getAttribute('aria-label') === 'Show confirm password');

    expect(passwordToggleButton).toBeInTheDocument();
    expect(confirmPasswordToggleButton).toBeInTheDocument();
  });

  it('toggles password visibility when clicking toggle button', () => {
    render(<FormContent onSignUp={vi.fn()} />);

    const passwordInput = screen.getByTestId('password');
    const passwordToggleButton = screen
      .getAllByRole('button')
      .find((button) => button.getAttribute('aria-label') === 'Show password');

    expect(passwordInput).toHaveAttribute('type', 'password');

    if (passwordToggleButton) {
      fireEvent.click(passwordToggleButton);
    }

    expect(passwordInput).toHaveAttribute('type', 'text');

    if (passwordToggleButton) {
      fireEvent.click(passwordToggleButton);
    }

    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('toggles confirm password visibility independently', () => {
    render(<FormContent onSignUp={vi.fn()} />);

    const passwordInput = screen.getByTestId('password');
    const confirmPasswordInput = screen.getByTestId('confirm-password');
    const confirmPasswordToggleButton = screen
      .getAllByRole('button')
      .find((button) => button.getAttribute('aria-label') === 'Show confirm password');

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    if (confirmPasswordToggleButton) {
      fireEvent.click(confirmPasswordToggleButton);
    }

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');
  });

  it('toggle buttons have proper accessibility attributes', () => {
    render(<FormContent onSignUp={vi.fn()} />);

    const passwordToggleButton = screen
      .getAllByRole('button')
      .find((button) => button.getAttribute('aria-label') === 'Show password');
    const confirmPasswordToggleButton = screen
      .getAllByRole('button')
      .find((button) => button.getAttribute('aria-label') === 'Show confirm password');

    if (passwordToggleButton && confirmPasswordToggleButton) {
      [passwordToggleButton, confirmPasswordToggleButton].forEach((button) => {
        expect(button).toHaveAttribute('type', 'button');
        expect(button).toHaveAttribute('tabIndex', '-1');
        expect(button).toHaveAttribute('aria-label');
      });
    }
  });

  it('changes button aria-label when password visibility changes', () => {
    render(<FormContent onSignUp={vi.fn()} />);

    const passwordToggleButton = screen
      .getAllByRole('button')
      .find((button) => button.getAttribute('aria-label') === 'Show password');

    if (passwordToggleButton) {
      expect(passwordToggleButton).toHaveAttribute('aria-label', 'Show password');

      fireEvent.click(passwordToggleButton);

      expect(passwordToggleButton).toHaveAttribute('aria-label', 'Hide password');
    }
  });

  it('renders form with all required fields', () => {
    render(<FormContent onSignUp={vi.fn()} />);

    expect(screen.getByTestId('password')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-password')).toBeInTheDocument();
    expect(screen.getByTestId('email')).toBeInTheDocument();

    // Кнопку ищем по тексту
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });
});

describe('FormContent Unicode Password Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('accepts password with valid Unicode characters', async () => {
    render(<FormContent onSignUp={vi.fn()} />);

    const passwordInput = screen.getByTestId('password');
    const emailInput = screen.getByTestId('email');
    const confirmPasswordInput = screen.getByTestId('confirm-password');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Test123@пароль' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Test123@пароль' } });

    fireEvent.blur(passwordInput);

    await waitFor(() => {
      const errorMessages = screen.queryAllByText(/Password must be in valid Unicode format/i);
      expect(errorMessages).toHaveLength(0);
    });
  });

  it('accepts password with Cyrillic uppercase and lowercase letters', async () => {
    render(<FormContent onSignUp={vi.fn()} />);

    const passwordInput = screen.getByTestId('password');
    const emailInput = screen.getByTestId('email');
    const confirmPasswordInput = screen.getByTestId('confirm-password');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Пароль123@' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Пароль123@' } });

    fireEvent.blur(passwordInput);

    await waitFor(() => {
      const uppercaseError = screen.queryAllByText(/Need at least one uppercase letter/i);
      const lowercaseError = screen.queryAllByText(/Need at least one lowercase letter/i);
      expect(uppercaseError).toHaveLength(0);
      expect(lowercaseError).toHaveLength(0);
    });
  });

  it('accepts password with emoji and special Unicode characters', async () => {
    render(<FormContent onSignUp={vi.fn()} />);

    const passwordInput = screen.getByTestId('password');
    const emailInput = screen.getByTestId('email');
    const confirmPasswordInput = screen.getByTestId('confirm-password');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Test123@🔒🛡️' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Test123@🔒🛡️' } });

    fireEvent.blur(passwordInput);

    await waitFor(() => {
      const errorMessages = screen.queryAllByText(/Password must be in valid Unicode format/i);
      expect(errorMessages).toHaveLength(0);
    });
  });

  it('accepts password with various Unicode scripts', async () => {
    render(<FormContent onSignUp={vi.fn()} />);

    const passwordInput = screen.getByTestId('password');
    const emailInput = screen.getByTestId('email');
    const confirmPasswordInput = screen.getByTestId('confirm-password');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Test123@こんにちは' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Test123@こんにちは' } });

    fireEvent.blur(passwordInput);

    await waitFor(() => {
      const errorMessages = screen.queryAllByText(/Password must be in valid Unicode format/i);
      expect(errorMessages).toHaveLength(0);
    });
  });

  it('validates empty password correctly', async () => {
    render(<FormContent onSignUp={vi.fn()} />);

    const passwordInput = screen.getByTestId('password');

    fireEvent.change(passwordInput, { target: { value: '' } });
    fireEvent.blur(passwordInput);

    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });
});
