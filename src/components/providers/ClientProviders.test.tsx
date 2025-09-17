import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClientProviders } from './ClientProviders';

vi.mock('react-hot-toast', () => ({
  Toaster: vi.fn(() => <div data-testid='toaster' />),
}));

import * as logger from '@/log';
const dbgSpy = vi.spyOn(logger, 'dbg');

describe('ClientProviders Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('should render its children correctly', () => {
    render(
      <ClientProviders>
        <div>Hello World</div>
      </ClientProviders>,
    );
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should render the Toaster component', () => {
    render(<ClientProviders>children</ClientProviders>);
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });

  it('should use the toast duration from environment variables if set', () => {
    vi.stubEnv('NEXT_PUBLIC_TOAST_DURATION', '9999');

    render(<ClientProviders>children</ClientProviders>);

    expect(dbgSpy).toHaveBeenCalledWith('toastDuration=', 9999);
  });

  it('should use the default toast duration if the environment variable is not set', () => {
    render(<ClientProviders>children</ClientProviders>);

    expect(dbgSpy).toHaveBeenCalledWith('toastDuration=', 5000);
  });
});
