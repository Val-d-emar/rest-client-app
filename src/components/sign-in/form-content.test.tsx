import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FormContent from './form-content';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('FormContent Password Visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders password fields with hidden text by default', () => {
    render(<FormContent />);

    const passwordInput = screen.getByLabelText('Password:');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password:');

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });

  it('shows password toggle buttons', () => {
    render(<FormContent />);

    const passwordToggleButton = screen.getByRole('button', { name: 'Show password' });
    const confirmPasswordToggleButton = screen.getByRole('button', {
      name: 'Show confirm password',
    });

    expect(passwordToggleButton).toBeInTheDocument();
    expect(confirmPasswordToggleButton).toBeInTheDocument();
  });

  it('toggles password visibility when clicking toggle button', () => {
    render(<FormContent />);

    const passwordInput = screen.getByLabelText('Password:');
    const passwordToggleButton = screen.getByRole('button', { name: 'Show password' });

    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(passwordToggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(passwordToggleButton);

    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('toggles confirm password visibility independently', () => {
    render(<FormContent />);

    const passwordInput = screen.getByLabelText('Password:');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password:');
    const confirmPasswordToggleButton = screen.getByRole('button', {
      name: 'Show confirm password',
    });

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    fireEvent.click(confirmPasswordToggleButton);

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');
  });

  it('toggle buttons have proper accessibility attributes', () => {
    render(<FormContent />);

    const passwordToggleButton = screen.getByRole('button', { name: 'Show password' });
    const confirmPasswordToggleButton = screen.getByRole('button', {
      name: 'Show confirm password',
    });

    [passwordToggleButton, confirmPasswordToggleButton].forEach((button) => {
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveAttribute('tabIndex', '-1');
      expect(button).toHaveAttribute('aria-label');
    });
  });

  it('changes button aria-label when password visibility changes', () => {
    render(<FormContent />);

    const passwordToggleButton = screen.getByRole('button', { name: 'Show password' });

    expect(passwordToggleButton).toHaveAttribute('aria-label', 'Show password');

    fireEvent.click(passwordToggleButton);

    expect(passwordToggleButton).toHaveAttribute('aria-label', 'Hide password');
  });

  it('renders form with all required fields', () => {
    render(<FormContent />);

    expect(screen.getByLabelText('Password:')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password:')).toBeInTheDocument();
    expect(screen.getByLabelText('Email:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });
});

describe('FormContent Unicode Password Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('accepts password with valid Unicode characters', async () => {
    render(<FormContent />);

    const passwordInput = screen.getByLabelText('Password:');
    const emailInput = screen.getByLabelText('Email:');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password:');

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
    render(<FormContent />);

    const passwordInput = screen.getByLabelText('Password:');
    const emailInput = screen.getByLabelText('Email:');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password:');

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
    render(<FormContent />);

    const passwordInput = screen.getByLabelText('Password:');
    const emailInput = screen.getByLabelText('Email:');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password:');

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
    render(<FormContent />);

    const passwordInput = screen.getByLabelText('Password:');
    const emailInput = screen.getByLabelText('Email:');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password:');

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
    render(<FormContent />);

    const passwordInput = screen.getByLabelText('Password:');

    fireEvent.change(passwordInput, { target: { value: '' } });
    fireEvent.blur(passwordInput);

    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });
});
