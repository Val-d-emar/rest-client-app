import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SignInContent from './signin-content';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('SignInContent Password Visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders password fields with hidden text by default', () => {
    render(<SignInContent />);

    const passwordInput = screen.getByLabelText('Password:');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password:');

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });

  it('shows password toggle buttons', () => {
    render(<SignInContent />);

    const passwordToggleButton = screen.getByRole('button', { name: 'Show password' });
    const confirmPasswordToggleButton = screen.getByRole('button', {
      name: 'Show confirm password',
    });

    expect(passwordToggleButton).toBeInTheDocument();
    expect(confirmPasswordToggleButton).toBeInTheDocument();
  });

  it('toggles password visibility when clicking toggle button', () => {
    render(<SignInContent />);

    const passwordInput = screen.getByLabelText('Password:');
    const passwordToggleButton = screen.getByRole('button', { name: 'Show password' });

    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(passwordToggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(passwordToggleButton);

    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('toggles confirm password visibility independently', () => {
    render(<SignInContent />);

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
    render(<SignInContent />);

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
    render(<SignInContent />);

    const passwordToggleButton = screen.getByRole('button', { name: 'Show password' });

    expect(passwordToggleButton).toHaveAttribute('aria-label', 'Show password');

    fireEvent.click(passwordToggleButton);

    expect(passwordToggleButton).toHaveAttribute('aria-label', 'Hide password');
  });

  it('renders form with all required fields', () => {
    render(<SignInContent />);

    expect(screen.getByLabelText('Password:')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password:')).toBeInTheDocument();
    expect(screen.getByLabelText('Email:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });
});
