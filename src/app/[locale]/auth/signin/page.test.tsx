import { render, screen } from '@/lib/utils/test-utils';
import { describe, it, expect, vi } from 'vitest';
import SignInPage from './page';

vi.mock('@/components/sign-in/signin-form', () => ({
  default: () => <div data-testid='signin-form-mock' />,
}));

vi.mock('next-intl', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next-intl')>();
  return {
    ...actual,
    useTranslations: () => (key: string) => `Translated: ${key}`,
  };
});

describe('SignInPage', () => {
  it('should render the title and the SignInForm component', () => {
    render(<SignInPage />);

    expect(screen.getByRole('heading', { name: /Translated: signInTitle/i })).toBeInTheDocument();

    expect(screen.getByTestId('signin-form-mock')).toBeInTheDocument();
  });
});
