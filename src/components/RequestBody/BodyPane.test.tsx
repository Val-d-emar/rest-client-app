import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import BodyPane, { type Props as BodyPaneProps } from './BodyPane';

const dictionary: Record<string, string> = {
  prettifyButton: 'Prettify',
  JSONPlaceholder: 'Enter JSON',
  textPlaceholder: 'Enter plain text',
  prettifyError: 'Invalid JSON format',
};

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => dictionary[key] ?? key,
}));

const toastError = vi.hoisted(() => vi.fn());
vi.mock('react-hot-toast', () => ({
  default: { error: toastError },
}));

vi.mock('./RequestBody.module.css', () => ({
  default: {
    'status-neutral': 'status-neutral',
    'status-ok': 'status-ok',
    'status-error': 'status-error',
  },
}));

describe('BodyPane', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProps = (partialProps: Partial<BodyPaneProps> = {}) => {
    const props: React.ComponentProps<typeof BodyPane> = {
      body: partialProps.body ?? '',
      setBody: partialProps.setBody ?? vi.fn(),
      readonly: partialProps.readonly ?? false,
      status: partialProps.status,
      statusText: partialProps.statusText,
    };
    render(<BodyPane {...props} />);
  };

  it('renders JSON/Text select, prettify button', () => {
    renderWithProps();

    const select = screen.getByLabelText('Body mode') as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(select.value).toBe('json');

    expect(screen.getByRole('button', { name: 'Prettify' })).toBeInTheDocument();
  });

  it('renders status code & status text for readonly mode and applies correct status class', () => {
    renderWithProps({ readonly: true, status: 200, statusText: 'OK' });

    const statusElement = screen.getByText('200 OK');
    expect(statusElement).toBeInTheDocument();
    expect(statusElement).toHaveClass('status-ok');
  });

  it('does not render mode-select and prettify-button in readonly mode', () => {
    renderWithProps({ readonly: true });

    expect(screen.queryByLabelText('Body mode')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Prettify' })).not.toBeInTheDocument();
  });

  it.each([
    { status: 199, statusClass: 'status-neutral' },
    { status: 200, statusClass: 'status-ok' },
    { status: 300, statusClass: 'status-neutral' },
    { status: 500, statusClass: 'status-error' },
  ])('status code $status should have status class $statusClass', ({ status, statusClass }) => {
    renderWithProps({ readonly: true, status, statusText: 'status' });
    expect(screen.getByText(/status/)).toHaveClass(statusClass);
  });

  it('prettifies body and calls setBody with prettified value on Prettify button click', () => {
    const setBody = vi.fn();
    renderWithProps({ body: '{"test":"body"}', setBody });

    fireEvent.click(screen.getByRole('button', { name: 'Prettify' }));

    expect(setBody).toHaveBeenCalledWith('{\n  "test": "body"\n}');
    expect(toastError).not.toHaveBeenCalled();
  });

  it('calls toast.error when body is not a valid JSON on Prettify button click', () => {
    renderWithProps({ body: 'not a JSON' });

    fireEvent.click(screen.getByRole('button', { name: 'Prettify' }));

    expect(toastError).toHaveBeenCalledWith('Invalid JSON format');
  });

  it('on textarea change calls setBody when readonly=false', () => {
    const setBody = vi.fn();
    renderWithProps({ body: '', setBody, readonly: false });

    const textarea = screen.getByLabelText('Request body editor');
    fireEvent.change(textarea, { target: { value: 'body' } });

    expect(setBody).toHaveBeenCalledWith('body');
  });

  it('on textarea change does not call setBody when readonly=true', () => {
    const setBody = vi.fn();
    renderWithProps({ body: '', setBody, readonly: true });

    const textarea = screen.getByLabelText('Request body editor');
    fireEvent.change(textarea, { target: { value: 'body' } });

    expect(setBody).not.toHaveBeenCalled();
  });

  it('renders correct placeholder', () => {
    renderWithProps();

    const select = screen.getByLabelText('Body mode');
    const textarea = screen.getByLabelText('Request body editor');
    expect(textarea).toHaveAttribute('placeholder', 'Enter JSON');

    fireEvent.change(select, { target: { value: 'text' } });
    expect(textarea).toHaveAttribute('placeholder', 'Enter plain text');
  });
});
