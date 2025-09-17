import { useState } from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import RequestHeaders, { type HeaderItem } from './RequestHeaders';

const dictionary: Record<string, string> = {
  title: 'HTTP headers',
  headerKeyPlaceholder: 'Header',
  headerValuePlaceholder: 'Value',
};

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => dictionary[key] ?? key,
}));

vi.mock('./RequestHeaders.module.css', () => ({
  default: {
    row: 'row',
  },
}));

function HeadersWrapper({ initial }: { initial: HeaderItem[] }) {
  const [headers, setHeaders] = useState<HeaderItem[]>(initial);
  return <RequestHeaders headers={headers} setHeaders={setHeaders} />;
}

describe('RequestHeaders', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const initial: HeaderItem[] = [
    { id: 'id-1', enabled: true, key: 'content-type', value: 'application/json' },
  ];

  it('renders title and headers rows with correct values', () => {
    const { container } = render(<HeadersWrapper initial={initial} />);

    expect(screen.getByRole('heading', { level: 3, name: 'HTTP headers' })).toBeInTheDocument();

    const rows = Array.from(container.querySelectorAll('.row'));
    expect(rows.length).toBe(1);

    const inputs = container.querySelectorAll('input[type="text"]');
    expect(inputs[0]).toHaveValue('content-type');
    expect(inputs[1]).toHaveValue('application/json');

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);
  });

  it('add button adds empty enabled header row', () => {
    const { container } = render(<HeadersWrapper initial={initial} />);

    const buttons = screen.getAllByRole('button');
    const addButton = buttons[buttons.length - 1];
    fireEvent.click(addButton);

    const rows = Array.from(container.querySelectorAll('.row'));
    expect(rows.length).toBe(2);

    const lastRow = rows[rows.length - 1] as HTMLElement;
    const lastCheckbox = within(lastRow).getByRole('checkbox');
    expect((lastCheckbox as HTMLInputElement).checked).toBe(true);

    const [keyInput, valueInput] = within(lastRow).getAllByRole('textbox');
    expect(keyInput).toHaveValue('');
    expect(valueInput).toHaveValue('');
  });

  it('remove button removes selected header row', () => {
    const { container } = render(<HeadersWrapper initial={initial} />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);

    const rows = Array.from(container.querySelectorAll('.row'));
    expect(rows.length).toBe(0);
    expect(screen.queryAllByDisplayValue('content-type').length).toBe(0);
    expect(screen.queryAllByDisplayValue('application/json').length).toBe(0);
  });

  it('changes header key and value in header row', () => {
    const { container } = render(<HeadersWrapper initial={initial} />);

    const [keyInput, valueInput] = container.querySelectorAll('input[type="text"]');

    fireEvent.change(keyInput, { target: { value: 'connection' } });
    fireEvent.change(valueInput, { target: { value: 'keep-alive' } });

    expect(keyInput).toHaveValue('connection');
    expect(valueInput).toHaveValue('keep-alive');
  });
});
