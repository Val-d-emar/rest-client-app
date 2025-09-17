import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import RequestBody from './RequestBody';
import type { Props as BodyPaneProps } from './BodyPane';

const dictionary: Record<string, string> = {
  title: 'Request body',
};

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => dictionary[key] ?? key,
}));

const BodyPaneMock = vi.hoisted(() =>
  vi.fn((_props: BodyPaneProps) => <div data-testid='body-pane' />),
);

vi.mock('./BodyPane', () => ({
  default: (props: BodyPaneProps) => BodyPaneMock(props),
}));

describe('RequestBody', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders title and BodyPane with correct props', () => {
    const setBody = vi.fn();
    render(<RequestBody body='{"test":"body"}' setBody={setBody} />);

    expect(screen.getByRole('heading', { level: 3, name: 'Request body' })).toBeInTheDocument();

    expect(screen.getByTestId('body-pane')).toBeInTheDocument();
    expect(BodyPaneMock).toHaveBeenCalledWith({
      body: '{"test":"body"}',
      setBody,
      readonly: false,
    });
  });
});
