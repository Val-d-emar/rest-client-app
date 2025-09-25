import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, afterEach, expect, vi } from 'vitest';
import RequestBar from './RequestBar';
import { HttpMethods } from '@/type';
import { METHODS as CONST_METHODS } from '@/constants';

const dictionary: Record<string, string> = {
  placeholder: 'Enter URL',
  sendButton: 'Send',
  sendingButton: 'Sending',
};

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => dictionary[key] ?? key,
}));

vi.mock('@/constants/constants', () => ({
  METHODS: CONST_METHODS as readonly string[],
}));

const mockSetMethod = vi.fn();
const mockSetUrl = vi.fn();

describe('RequestBar', () => {
  const getProps = (props: Partial<React.ComponentProps<typeof RequestBar>> = {}) => ({
    method: 'GET' as HttpMethods,
    setMethod: mockSetMethod,
    url: 'https://test.com',
    setUrl: mockSetUrl,
    onSend: vi.fn(),
    loading: false,
    ...props,
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders select with provided methods and value', () => {
    render(<RequestBar {...getProps()} />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    const options = screen.getAllByRole('option');

    expect(select.value).toBe('GET');
    expect(options.map((option) => option.textContent)).toEqual(CONST_METHODS);
  });

  it('changes selected method on change event', () => {
    render(<RequestBar {...getProps()} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'POST' } });

    expect(mockSetMethod).toHaveBeenCalledWith('POST');
  });

  it('renders url-input with provided props', () => {
    render(<RequestBar {...getProps()} />);
    const input = screen.getByPlaceholderText('Enter URL') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('https://test.com');
  });

  it('calls setUrl on input change', () => {
    render(<RequestBar {...getProps()} />);
    const input = screen.getByPlaceholderText('Enter URL');
    fireEvent.change(input, { target: { value: 'https://new-test.com' } });

    expect(mockSetUrl).toHaveBeenCalledWith('https://new-test.com');
  });

  it('send button is disabled and shows "Sending" for loading=true', () => {
    render(<RequestBar {...getProps({ loading: true })} />);
    const button = screen.getByRole('button', { name: 'Sending' });
    expect(button).toBeDisabled();
  });

  it('send button is enabled and shows "Send" for loading=false', () => {
    render(<RequestBar {...getProps({ loading: false })} />);
    const button = screen.getByRole('button', { name: 'Send' });
    expect(button).not.toBeDisabled();
  });
});
