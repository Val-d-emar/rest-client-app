import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GlobalError from './global-error';

const mockReload = vi.fn();

Object.defineProperty(window, 'location', {
  value: {
    reload: mockReload,
  },
  writable: true,
});

describe('GlobalError Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the error message passed via props', () => {
    const testError = new Error('This is a specific test error message');

    render(<GlobalError error={testError} reset={() => {}} />);

    expect(screen.getByRole('heading', { name: 'Something went wrong!' })).toBeInTheDocument();
    expect(
      screen.getByText('An unexpected error occurred. Please try to reload the page.'),
    ).toBeInTheDocument();
    expect(screen.getByText('This is a specific test error message')).toBeInTheDocument();
  });

  it('should call window.location.reload when the button is clicked', async () => {
    const testError = new Error('Another error');
    const user = userEvent.setup();

    render(<GlobalError error={testError} reset={() => {}} />);

    const reloadButton = screen.getByRole('button', { name: /reload the page/i });

    await user.click(reloadButton);

    expect(mockReload).toHaveBeenCalledTimes(1);
  });
});
