import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ResponseHeaders from './ResponseHeaders';

vi.mock('./ResponseHeaders.module.css', () => ({
  default: {
    row: 'row',
  },
}));

const dictionary: Record<string, string> = {
  responseEmptyHeaders: 'No headers',
};

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => dictionary[key] ?? key,
}));

describe('ResponseHeaders', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders "No headers" if headers is null', () => {
    render(<ResponseHeaders headers={null} />);
    expect(screen.getByText('No headers')).toBeInTheDocument();
  });

  it('renders "No headers" if headers is empty object', () => {
    render(<ResponseHeaders headers={{}} />);
    expect(screen.getByText('No headers')).toBeInTheDocument();
  });

  it('renders key/value pairs for response headers', () => {
    const headers = {
      'content-type': 'application/json',
      connection: 'keep-alive',
      server: 'apache',
    };

    const { container } = render(<ResponseHeaders headers={headers} />);

    const rows = container.querySelectorAll('.row');
    expect(rows.length).toBe(3);

    expect(screen.getByText('content-type')).toBeInTheDocument();
    expect(screen.getByText('application/json')).toBeInTheDocument();
    expect(screen.getByText('connection')).toBeInTheDocument();
    expect(screen.getByText('keep-alive')).toBeInTheDocument();
    expect(screen.getByText('server')).toBeInTheDocument();
    expect(screen.getByText('apache')).toBeInTheDocument();
  });
});
