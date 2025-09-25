import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LocaleSwitcher from '@/components/LocaleSwitcher';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

const mockedParams = { param: 'rest' };
vi.mock('next/navigation', async () => {
  return {
    useParams: () => mockedParams,
  };
});

const replaceMock = vi.fn();
const PATH = '/path';
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => PATH,
}));

vi.mock('@/i18n/routing', () => ({
  routing: { locales: ['en', 'ru'] },
}));

describe('LocaleSwitcher', () => {
  beforeEach(() => {
    replaceMock.mockClear();
  });

  it('renders select with options for all locales', () => {
    render(<LocaleSwitcher />);

    const select: HTMLSelectElement = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    expect(screen.getByRole('option', { name: 'en' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'ru' })).toBeInTheDocument();
  });

  it('on select change calls router.replace with correct href and locale', () => {
    render(<LocaleSwitcher />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'ru' } });

    expect(replaceMock).toBeCalledTimes(1);

    const [href, locale] = replaceMock.mock.calls[0];
    expect(href).toMatchObject({
      pathname: PATH,
      params: mockedParams,
    });
    expect(locale).toMatchObject({ locale: 'ru' });
  });
});
