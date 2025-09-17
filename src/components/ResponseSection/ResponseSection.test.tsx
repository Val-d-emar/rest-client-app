import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ResponseSection from './ResponseSection';
import { ServerResponse } from '@/lib/actions/request';
import { Dispatch, SetStateAction } from 'react';

const dictionary: Record<string, string> = {
  title: 'Response',
  responseBody: 'Response body',
  responseHeaders: 'Headers',
  responseEmptyHeaders: 'No headers',
  responsePlaceholder: 'Send a request to see the response here.',
  error: 'Error',
};

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => dictionary[key] ?? key,
}));

type BodyProps = {
  body: string;
  setBody?: Dispatch<SetStateAction<string>>;
  readonly: boolean;
  status?: number;
  statusText?: string;
};
const BodyPaneMock = vi.fn((props: BodyProps) => (
  <div
    data-testid='body-pane'
    data-body={props.body}
    data-readonly={String(props.readonly)}
    data-status={String(props.status)}
    data-statustext={String(props.statusText)}
  />
));
vi.mock('../RequestBody/BodyPane', () => ({
  default: (props: BodyProps) => BodyPaneMock(props),
}));

type HeadersProps = {
  headers: Record<string, string> | null;
};
const ResponseHeadersMock = vi.fn((props: HeadersProps) => (
  <div
    data-testid='response-headers'
    data-headers={Object.entries(props.headers ?? {})
      .map(([key, value]) => `${key}=${value}`)
      .join(',')}
  />
));
vi.mock('./ResponseHeaders', () => ({
  default: (props: HeadersProps) => ResponseHeadersMock(props),
}));

describe('ResponseSection', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders spinner when loading=true', () => {
    render(<ResponseSection loading={true} response={null} />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders body placeholder if there is no response', () => {
    render(<ResponseSection loading={false} response={null} />);
    expect(screen.getByText('Send a request to see the response here.')).toBeInTheDocument();
  });

  it('renders error if there is response.error', () => {
    render(<ResponseSection loading={false} response={{ error: 'Oops...' } as ServerResponse} />);
    const err = screen.getByText('Error: Oops...');
    expect(err).toBeInTheDocument();
  });

  it('renders ResponseHeaders and BodyPane with correct props', () => {
    const response = {
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      body: { test: 1 },
      error: null,
    } as ServerResponse;

    render(<ResponseSection loading={false} response={response} />);

    expect(screen.getByRole('heading', { level: 3, name: 'Response' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: 'Response body:' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: 'Headers:' })).toBeInTheDocument();

    const bodyPane = screen.getByTestId('body-pane');
    expect(bodyPane).toHaveAttribute('data-body', JSON.stringify(response.body, null, 2));
    expect(bodyPane).toHaveAttribute('data-readonly', 'true');
    expect(bodyPane).toHaveAttribute('data-status', '200');
    expect(bodyPane).toHaveAttribute('data-statustext', 'OK');

    const headers = screen.getByTestId('response-headers');
    expect(headers).toHaveAttribute('data-headers', 'content-type=application/json');
  });

  it('sets status/statusText undefined if they are equal to null', () => {
    const response = {
      status: null,
      statusText: null,
    } as ServerResponse;

    render(<ResponseSection loading={false} response={response} />);

    const bodyPane = screen.getByTestId('body-pane');
    expect(bodyPane).toHaveAttribute('data-status', 'undefined');
    expect(bodyPane).toHaveAttribute('data-statustext', 'undefined');
  });
});
