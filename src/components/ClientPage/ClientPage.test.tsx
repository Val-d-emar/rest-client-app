import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { ENCODING_TOAST_ID } from '@/constants/constants';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import ClientPage from './ClientPage';
import { RequestPayload } from '@/lib/actions/request';

vi.mock('@/context/AuthContext');

const replaceMock = vi.fn();
const searchParams = vi.hoisted(() => ({ params: new URLSearchParams('') }));

vi.mock('@/i18n/navigation', () => ({
  Link: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => '/client',
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => searchParams.params,
}));

const dictionary: Record<string, string> = {
  title: 'REST Client',
  FailedToDecode: 'Failed to decode: ',
  sendButton: 'Send',
};
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => dictionary[key] ?? key,
}));

vi.mock('@/lib/client-action/handle-add-log', () => ({ handleAddLog: vi.fn() }));

vi.mock('react-hot-toast', () => {
  const loading = vi.fn(() => 'id1');
  const success = vi.fn();
  const error = vi.fn();
  return { default: { loading, success, error } };
});

const forwardRequestMock = vi.fn();
vi.mock('@/lib/actions/request', () => ({
  forwardRequest: (payload: RequestPayload) => forwardRequestMock(payload),
}));

describe('ClientPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchParams.params = new URLSearchParams('');
    (useAuth as Mock).mockReturnValue({
      user: { uid: 'user1' },
      loading: false,
    });
  });
  afterEach(() => vi.clearAllMocks());

  it('renders title', () => {
    render(<ClientPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'REST Client' })).toBeInTheDocument();
  });

  it('safeBtoa error calls toast.error', async () => {
    const btoa = globalThis.btoa;
    globalThis.btoa = () => {
      throw new Error('btoa error');
    };

    render(<ClientPage />);

    const urlInput = screen.getByTestId('url-input');
    fireEvent.change(urlInput, { target: { value: 'https://example.com' } });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to encode to base64: btoa error', {
        id: ENCODING_TOAST_ID,
      });
    });

    globalThis.btoa = btoa;
  });

  it('safeAtob error calls toast.error', async () => {
    const atob = globalThis.atob;
    globalThis.atob = () => {
      throw new Error('atob error');
    };

    searchParams.params = new URLSearchParams('method=GET&url=url&body=body');

    render(<ClientPage />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to decode: atob error', {
        id: ENCODING_TOAST_ID,
      });
    });

    globalThis.atob = atob;
  });

  it('for unauthenticated user renders "You must be logged in." on send button click', async () => {
    (useAuth as Mock).mockReturnValue({ user: null, loading: false });

    render(<ClientPage />);

    const urlInput = screen.getByTestId('url-input');
    fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
    fireEvent.click(await screen.findByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('You must be logged in.');
    });
  });

  it('changing method, url, body causes router.replace call with correct parameters', async () => {
    render(<ClientPage />);

    const methodSelect = screen.getAllByRole('combobox')[0] as HTMLSelectElement;
    fireEvent.change(methodSelect, { target: { value: 'POST' } });

    const urlInput = screen.getByTestId('url-input');
    fireEvent.change(urlInput, { target: { value: 'https://example.com' } });

    const bodyArea = screen.getByLabelText('Request body editor') as HTMLTextAreaElement;
    fireEvent.change(bodyArea, { target: { value: '{"test":"body"}' } });

    await waitFor(() => expect(replaceMock).toHaveBeenCalled());

    const replaceArgs = replaceMock.mock.calls.at(-1);

    const params = new URLSearchParams((replaceArgs?.[0] ?? ('' as string)).split('?')[1]);

    expect(params.get('method')).toBe('POST');
    expect(params.get('url')).toBe(btoa(encodeURIComponent('https://example.com')));
    expect(params.get('body')).toBe(btoa(encodeURIComponent('{"test":"body"}')));
  });

  it('calls forwardRequest with correct payload on successful sending', async () => {
    forwardRequestMock.mockResolvedValue({
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'application/json' },
      body: '',
      error: null,
    });

    render(<ClientPage />);

    const urlInput = screen.getByTestId('url-input');
    fireEvent.change(urlInput, { target: { value: 'https://example.com' } });

    const sendButton = screen.getByRole('button', { name: 'Send' });
    fireEvent.click(sendButton);

    await waitFor(() => expect(forwardRequestMock).toHaveBeenCalledTimes(1));
    const [payload] = forwardRequestMock.mock.calls[0];

    expect(payload).toMatchObject({
      userId: 'user1',
      url: 'https://example.com',
      method: 'GET',
      body: '',
    });
    expect(payload.headers).toMatchObject({ 'Content-Type': 'application/json' });
  });
});
