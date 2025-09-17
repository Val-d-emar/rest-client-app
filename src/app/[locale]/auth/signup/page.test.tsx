import { render, screen } from '@/lib/utils/test-utils';
import { describe, it, expect, vi } from 'vitest';
import SignUpPage from './page';

vi.mock('@/components/sign-up/signup-form', () => ({
  default: () => <div data-testid='signup-form-mock' />,
}));

vi.mock('next-intl', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next-intl')>();
  return {
    ...actual,
    useTranslations: () => (key: string) => `Translated: ${key}`,
  };
});

describe('SignUpPage', () => {
  it('should render the title and the SignUpForm component', () => {
    render(<SignUpPage />);

    expect(screen.getByRole('heading', { name: /Translated: signUpTitle/i })).toBeInTheDocument();

    expect(screen.getByTestId('signup-form-mock')).toBeInTheDocument();
  });
});
