import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import HistoryTable from './history-table';
import { useTranslations } from 'next-intl';
import { HttpRequestLog } from '@/type/type';
import * as urlConstructor from '@/lib/utils/url-constructor';

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href} data-testid='history-link'>
      {children}
    </a>
  ),
}));

vi.mock('@/lib/utils/url-constructor', () => ({
  constructClientUrl: vi.fn(),
}));

describe('HistoryTable', () => {
  const mockTranslations = {
    'table.method': 'Method',
    'table.url': 'URL',
    'table.status': 'Status',
    'table.latency': 'Latency',
    'table.timestamp': 'Timestamp',
    'table.requestSize': 'Request Size',
    'table.responseSize': 'Response Size',
    'table.error': 'Error',
    noData: 'No data',
  };

  const mockLogs: HttpRequestLog[] = [
    {
      userId: 'user-123',
      latency: 250,
      statusCode: 200,
      statusText: 'OK',
      timestamp: new Date('2023-01-01T10:00:00Z'),
      method: 'GET',
      requestSize: 0,
      responseSize: 1024,
      url: 'https://api.example.com/test',
      requestBody: '',
      headers: { 'Content-Type': 'application/json' },
      errorDetails: '',
    },
    {
      userId: 'user-123',
      latency: 180,
      statusCode: 201,
      statusText: 'Created',
      timestamp: new Date('2023-01-01T11:00:00Z'),
      method: 'POST',
      requestSize: 512,
      responseSize: 256,
      url: 'https://api.example.com/create',
      requestBody: '{"test": true}',
      headers: { 'Content-Type': 'application/json' },
      errorDetails: 'Validation error',
    },
    {
      userId: 'user-123',
      latency: 450,
      statusCode: 500,
      statusText: 'Internal Server Error',
      timestamp: new Date('2023-01-01T12:00:00Z'),
      method: 'DELETE',
      requestSize: 0,
      responseSize: 0,
      url: 'https://api.example.com/delete/123',
      requestBody: '',
      headers: {},
      errorDetails: 'Server crashed',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useTranslations).mockReturnValue(((key: string) => {
      return mockTranslations[key as keyof typeof mockTranslations] || key;
    }) as ReturnType<typeof useTranslations>);

    vi.mocked(urlConstructor.constructClientUrl).mockReturnValue('/client/test-url');
  });

  describe('Table Structure', () => {
    it('renders table with correct headers', () => {
      render(<HistoryTable logs={[]} />);

      expect(screen.getByText('Method')).toBeInTheDocument();
      expect(screen.getByText('URL')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Latency')).toBeInTheDocument();
      expect(screen.getByText('Timestamp')).toBeInTheDocument();
      expect(screen.getByText('Request Size')).toBeInTheDocument();
      expect(screen.getByText('Response Size')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('renders table with correct CSS classes', () => {
      const { container } = render(<HistoryTable logs={[]} />);

      expect(container.querySelector('.data-table-container')).toBeInTheDocument();
      expect(container.querySelector('.data-table')).toBeInTheDocument();
    });

    it('renders empty table body when no logs provided', () => {
      render(<HistoryTable logs={[]} />);

      const tbody = screen.getByRole('table').querySelector('tbody');
      expect(tbody).toBeInTheDocument();
      expect(tbody?.children).toHaveLength(0);
    });
  });

  describe('Data Rendering', () => {
    it('renders log data correctly', () => {
      render(<HistoryTable logs={[mockLogs[0]]} />);

      expect(screen.getByText('GET')).toBeInTheDocument();
      expect(screen.getByText('https://api.example.com/test')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
      expect(screen.getByText('250')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('1024')).toBeInTheDocument();
    });

    it('renders multiple logs correctly', () => {
      render(<HistoryTable logs={mockLogs} />);

      expect(screen.getByText('GET')).toBeInTheDocument();
      expect(screen.getByText('POST')).toBeInTheDocument();
      expect(screen.getByText('DELETE')).toBeInTheDocument();

      expect(screen.getByText('200')).toBeInTheDocument();
      expect(screen.getByText('201')).toBeInTheDocument();
      expect(screen.getByText('500')).toBeInTheDocument();

      expect(screen.getByText('250')).toBeInTheDocument();
      expect(screen.getByText('180')).toBeInTheDocument();
      expect(screen.getByText('450')).toBeInTheDocument();

      expect(screen.getByText('https://api.example.com/test')).toBeInTheDocument();
      expect(screen.getByText('https://api.example.com/create')).toBeInTheDocument();
      expect(screen.getByText('https://api.example.com/delete/123')).toBeInTheDocument();
    });

    it('formats timestamp correctly', () => {
      render(<HistoryTable logs={[mockLogs[0]]} />);

      const expectedTimestamp = new Date('2023-01-01T10:00:00Z').toLocaleString();
      expect(screen.getByText(expectedTimestamp)).toBeInTheDocument();
    });

    it('handles invalid timestamp', () => {
      const logWithInvalidTimestamp = {
        ...mockLogs[0],
        timestamp: new Date('invalid-date'),
      };

      render(<HistoryTable logs={[logWithInvalidTimestamp]} />);

      expect(screen.getByText('Invalid Date')).toBeInTheDocument();
    });

    it('handles edge case timestamp values', () => {
      const logWithEpochTimestamp = {
        ...mockLogs[0],
        timestamp: new Date(0),
      };

      render(<HistoryTable logs={[logWithEpochTimestamp]} />);

      const expectedTimestamp = new Date(0).toLocaleString();
      expect(screen.getByText(expectedTimestamp)).toBeInTheDocument();
    });
  });

  describe('Links and Navigation', () => {
    it('creates links for all data cells', () => {
      render(<HistoryTable logs={[mockLogs[0]]} />);

      const links = screen.getAllByTestId('history-link');
      expect(links).toHaveLength(8);
    });

    it('calls constructClientUrl with correct parameters', () => {
      const mockConstructClientUrl = vi.mocked(urlConstructor.constructClientUrl);

      render(<HistoryTable logs={[mockLogs[0]]} />);

      expect(mockConstructClientUrl).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.example.com/test',
        body: '',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('handles invalid HTTP method by defaulting to GET', () => {
      const logWithInvalidMethod = {
        ...mockLogs[0],
        method: 'INVALID_METHOD',
      };

      const mockConstructClientUrl = vi.mocked(urlConstructor.constructClientUrl);

      render(<HistoryTable logs={[logWithInvalidMethod]} />);

      expect(mockConstructClientUrl).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.example.com/test',
        body: '',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('converts HTTP method to uppercase', () => {
      const logWithLowercaseMethod = {
        ...mockLogs[0],
        method: 'post',
      };

      const mockConstructClientUrl = vi.mocked(urlConstructor.constructClientUrl);

      render(<HistoryTable logs={[logWithLowercaseMethod]} />);

      expect(mockConstructClientUrl).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.example.com/test',
        body: '',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('all links have correct href attribute', () => {
      render(<HistoryTable logs={[mockLogs[0]]} />);

      const links = screen.getAllByTestId('history-link');
      links.forEach((link) => {
        expect(link).toHaveAttribute('href', '/client/test-url');
      });
    });
  });

  describe('Error Handling', () => {
    it('renders error details when present', () => {
      render(<HistoryTable logs={[mockLogs[1]]} />);

      expect(screen.getByText('Validation error')).toBeInTheDocument();
    });

    it('renders empty error cell when no error details', () => {
      render(<HistoryTable logs={[mockLogs[0]]} />);

      const links = screen.getAllByTestId('history-link');
      const errorLink = links[7];
      expect(errorLink).toHaveTextContent('');
    });
  });

  describe('Edge Cases', () => {
    it('handles logs with special characters in URL', () => {
      const logWithSpecialChars = {
        ...mockLogs[0],
        url: 'https://api.example.com/test?query=hello%20world&id=123',
      };

      render(<HistoryTable logs={[logWithSpecialChars]} />);

      expect(
        screen.getByText('https://api.example.com/test?query=hello%20world&id=123'),
      ).toBeInTheDocument();
    });

    it('handles logs with zero values', () => {
      const logWithZeroValues = {
        ...mockLogs[0],
        latency: 0,
        requestSize: 0,
        responseSize: 0,
        statusCode: 0,
      };

      render(<HistoryTable logs={[logWithZeroValues]} />);

      const zeroTexts = screen.getAllByText('0');
      expect(zeroTexts.length).toBeGreaterThanOrEqual(4);
    });

    it('handles logs with large numbers', () => {
      const logWithLargeNumbers = {
        ...mockLogs[0],
        latency: 999999,
        requestSize: 1048576,
        responseSize: 2097152,
        statusCode: 599,
      };

      render(<HistoryTable logs={[logWithLargeNumbers]} />);

      expect(screen.getByText('999999')).toBeInTheDocument();
      expect(screen.getByText('1048576')).toBeInTheDocument();
      expect(screen.getByText('2097152')).toBeInTheDocument();
      expect(screen.getByText('599')).toBeInTheDocument();
    });

    it('handles empty request body', () => {
      const mockConstructClientUrl = vi.mocked(urlConstructor.constructClientUrl);

      render(<HistoryTable logs={[mockLogs[0]]} />);

      expect(mockConstructClientUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          body: '',
        }),
      );
    });

    it('handles empty headers object', () => {
      const logWithEmptyHeaders = {
        ...mockLogs[0],
        headers: {},
      };

      const mockConstructClientUrl = vi.mocked(urlConstructor.constructClientUrl);

      render(<HistoryTable logs={[logWithEmptyHeaders]} />);

      expect(mockConstructClientUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {},
        }),
      );
    });
  });

  describe('Table Row Structure', () => {
    it('applies correct CSS classes to table rows', () => {
      const { container } = render(<HistoryTable logs={[mockLogs[0]]} />);

      const row = container.querySelector('.body-line.history-row');
      expect(row).toBeInTheDocument();
    });

    it('renders correct number of table rows', () => {
      render(<HistoryTable logs={mockLogs} />);

      const rows = screen.getByRole('table').querySelectorAll('tbody tr');
      expect(rows).toHaveLength(mockLogs.length);
    });

    it('renders correct number of cells per row', () => {
      render(<HistoryTable logs={[mockLogs[0]]} />);

      const row = screen.getByRole('table').querySelector('tbody tr');
      const cells = row?.querySelectorAll('td');
      expect(cells).toHaveLength(8);
    });
  });

  describe('Internationalization', () => {
    it('calls useTranslations with correct namespace', () => {
      render(<HistoryTable logs={[]} />);

      expect(useTranslations).toHaveBeenCalledWith('HistoryPage');
    });

    it('uses translated strings for table headers', () => {
      const customTranslations = {
        'table.method': 'Метод',
        'table.url': 'URL адрес',
        'table.status': 'Статус',
        'table.latency': 'Задержка',
        'table.timestamp': 'Время',
        'table.requestSize': 'Размер запроса',
        'table.responseSize': 'Размер ответа',
        'table.error': 'Ошибка',
        noData: 'Нет данных',
      };

      vi.mocked(useTranslations).mockReturnValue(((key: string) => {
        return customTranslations[key as keyof typeof customTranslations] || key;
      }) as ReturnType<typeof useTranslations>);

      render(<HistoryTable logs={[]} />);

      expect(screen.getByText('Метод')).toBeInTheDocument();
      expect(screen.getByText('URL адрес')).toBeInTheDocument();
      expect(screen.getByText('Статус')).toBeInTheDocument();
      expect(screen.getByText('Задержка')).toBeInTheDocument();
      expect(screen.getByText('Время')).toBeInTheDocument();
      expect(screen.getByText('Размер запроса')).toBeInTheDocument();
      expect(screen.getByText('Размер ответа')).toBeInTheDocument();
      expect(screen.getByText('Ошибка')).toBeInTheDocument();
    });

    it('uses translated "No data" text when timestamp is falsy', () => {
      const logWithFalsyTimestamp = {
        ...mockLogs[0],
        timestamp: null as unknown as Date,
      };

      render(<HistoryTable logs={[logWithFalsyTimestamp]} />);

      expect(screen.getByText('No data')).toBeInTheDocument();
    });

    it('uses custom translated "No data" text when timestamp is falsy', () => {
      const customTranslations = {
        ...mockTranslations,
        noData: 'Данные отсутствуют',
      };

      vi.mocked(useTranslations).mockReturnValue(((key: string) => {
        return customTranslations[key as keyof typeof customTranslations] || key;
      }) as ReturnType<typeof useTranslations>);

      const logWithFalsyTimestamp = {
        ...mockLogs[0],
        timestamp: null as unknown as Date,
      };

      render(<HistoryTable logs={[logWithFalsyTimestamp]} />);

      expect(screen.getByText('Данные отсутствуют')).toBeInTheDocument();
    });
  });
});
