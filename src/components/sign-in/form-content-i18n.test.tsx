import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import FormContent from './form-content';

const mockTranslations = {
  en: {
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    submit: 'Submit',
    submitting: 'Submitting...',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    validation: {
      emailRequired: 'Email is required',
      emailIncorrect: 'Incorrect email',
      passwordRequired: 'Password is required',
      passwordMinLength: 'At least 8 characters',
    },
  },
  ru: {
    email: 'Электронная почта',
    password: 'Пароль',
    confirmPassword: 'Подтвердите пароль',
    signIn: 'Войти',
    signUp: 'Регистрация',
    submit: 'Отправить',
    submitting: 'Отправка...',
    showPassword: 'Показать пароль',
    hidePassword: 'Скрыть пароль',
    validation: {
      emailRequired: 'Электронная почта обязательна',
      emailIncorrect: 'Неверный формат электронной почты',
      passwordRequired: 'Пароль обязателен',
      passwordMinLength: 'Минимум 8 символов',
    },
  },
};

let currentLocale = 'en';

vi.mock('next-intl', () => ({
  useTranslations: (_namespace: string) => (key: string) => {
    const keys = key.split('.');
    let value: any = mockTranslations[currentLocale as keyof typeof mockTranslations];

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  },
}));

describe('FormContent Internationalization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('English translations', () => {
    beforeEach(() => {
      currentLocale = 'en';
    });

    it('renders form labels in English', () => {
      const mockSignUp = vi.fn();
      render(<FormContent onSignUp={mockSignUp} />);

      expect(screen.getByText('Email:')).toBeInTheDocument();
      expect(screen.getByText('Password:')).toBeInTheDocument();
      expect(screen.getByText('Confirm Password:')).toBeInTheDocument();
    });

    it('renders signin form labels without confirmPassword in English', () => {
      const mockSignIn = vi.fn();
      render(<FormContent onSignIn={mockSignIn} />);

      expect(screen.getByText('Email:')).toBeInTheDocument();
      expect(screen.getByText('Password:')).toBeInTheDocument();
      expect(screen.queryByText('Confirm Password:')).not.toBeInTheDocument();
    });

    it('renders submit button in English', () => {
      render(<FormContent />);

      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('renders Sign In button when onSignIn prop is provided', () => {
      const mockSignIn = vi.fn();
      render(<FormContent onSignIn={mockSignIn} />);

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('renders Sign Up button when onSignUp prop is provided', () => {
      const mockSignUp = vi.fn();
      render(<FormContent onSignUp={mockSignUp} />);

      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });
  });

  describe('Russian translations', () => {
    beforeEach(() => {
      currentLocale = 'ru';
    });

    it('renders form labels in Russian', () => {
      const mockSignUp = vi.fn();
      render(<FormContent onSignUp={mockSignUp} />);

      expect(screen.getByText('Электронная почта:')).toBeInTheDocument();
      expect(screen.getByText('Пароль:')).toBeInTheDocument();
      expect(screen.getByText('Подтвердите пароль:')).toBeInTheDocument();
    });

    it('renders signin form labels without confirmPassword in Russian', () => {
      const mockSignIn = vi.fn();
      render(<FormContent onSignIn={mockSignIn} />);

      expect(screen.getByText('Электронная почта:')).toBeInTheDocument();
      expect(screen.getByText('Пароль:')).toBeInTheDocument();
      expect(screen.queryByText('Подтвердите пароль:')).not.toBeInTheDocument();
    });

    it('renders submit button in Russian', () => {
      render(<FormContent />);

      expect(screen.getByRole('button', { name: /отправить/i })).toBeInTheDocument();
    });

    it('renders Sign In button in Russian when onSignIn prop is provided', () => {
      const mockSignIn = vi.fn();
      render(<FormContent onSignIn={mockSignIn} />);

      expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
    });

    it('renders Sign Up button in Russian when onSignUp prop is provided', () => {
      const mockSignUp = vi.fn();
      render(<FormContent onSignUp={mockSignUp} />);

      expect(screen.getByRole('button', { name: /регистрация/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility with translations', () => {
    it('has proper aria-labels in English', () => {
      currentLocale = 'en';
      render(<FormContent />);

      const passwordToggle = screen
        .getAllByRole('button')
        .find((button) => button.getAttribute('aria-label')?.includes('Show password'));
      expect(passwordToggle).toBeInTheDocument();
    });

    it('has proper aria-labels in Russian', () => {
      currentLocale = 'ru';
      render(<FormContent />);

      const passwordToggle = screen
        .getAllByRole('button')
        .find((button) => button.getAttribute('aria-label')?.includes('Показать пароль'));
      expect(passwordToggle).toBeInTheDocument();
    });
  });
});
