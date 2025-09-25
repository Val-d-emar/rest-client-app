import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import Footer from './footer';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    width,
    height,
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
  }) => <img src={src} alt={alt} width={width} height={height} />,
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({
    children,
    href,
    target,
    rel,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    target?: string;
    rel?: string;
    className?: string;
  }) => (
    <a href={href} target={target} rel={rel} className={className}>
      {children}
    </a>
  ),
}));

const messages = {
  Footer: {
    developedBy: 'Developed by',
  },
};

const messagesRu = {
  Footer: {
    developedBy: 'Разработано',
  },
};

const renderWithIntl = (locale = 'en', customMessages = messages) => {
  return render(
    <NextIntlClientProvider locale={locale} messages={customMessages}>
      <Footer />
    </NextIntlClientProvider>,
  );
};

describe('Footer Component', () => {
  it('renders without crashing', () => {
    renderWithIntl();
    expect(screen.getByText('Developed by')).toBeInTheDocument();
  });

  it('displays "Developed by" text in English', () => {
    renderWithIntl('en', messages);
    expect(screen.getByText('Developed by')).toBeInTheDocument();
  });

  it('displays "Разработано" text in Russian', () => {
    renderWithIntl('ru', messagesRu);
    expect(screen.getByText('Разработано')).toBeInTheDocument();
  });

  it('renders all developer links', () => {
    renderWithIntl();

    const valDemarLink = screen.getByRole('link', { name: 'val-d-emar' });
    const olenawebLink = screen.getByRole('link', { name: 'olenaweb' });
    const binaryAppleLink = screen.getByRole('link', { name: 'binary-apple' });

    expect(valDemarLink).toBeInTheDocument();
    expect(valDemarLink).toHaveAttribute('href', 'https://github.com/Val-d-emar/rest-client-app');
    expect(valDemarLink).toHaveAttribute('target', '_blank');
    expect(valDemarLink).toHaveAttribute('rel', 'noopener noreferrer');

    expect(olenawebLink).toBeInTheDocument();
    expect(olenawebLink).toHaveAttribute('href', 'https://github.com/olenaweb');

    expect(binaryAppleLink).toBeInTheDocument();
    expect(binaryAppleLink).toHaveAttribute('href', 'https://github.com/binary-apple');
  });

  it('renders RS School section correctly', () => {
    renderWithIntl();

    expect(screen.getByText('RS School')).toBeInTheDocument();

    expect(screen.getByText('2025')).toBeInTheDocument();

    const rsSchoolLink = screen.getByRole('link', { name: /rss-logo/ });
    expect(rsSchoolLink).toBeInTheDocument();
    expect(rsSchoolLink).toHaveAttribute('href', 'https://rs.school/courses/reactjs');
    expect(rsSchoolLink).toHaveAttribute('target', '_blank');
    expect(rsSchoolLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders RSS logo image', () => {
    renderWithIntl();

    const rssLogo = screen.getByAltText('rss-logo');
    expect(rssLogo).toBeInTheDocument();
    expect(rssLogo).toHaveAttribute('src', '/rss-logo.svg');
    expect(rssLogo).toHaveAttribute('width', '30');
    expect(rssLogo).toHaveAttribute('height', '30');
  });

  it('has proper CSS classes applied', () => {
    renderWithIntl();

    const developedByText = screen.getByText('Developed by');
    const rsSchoolText = screen.getByText('RS School');
    const yearText = screen.getByText('2025');

    expect(developedByText).toBeInTheDocument();
    expect(rsSchoolText).toBeInTheDocument();
    expect(yearText).toBeInTheDocument();

    expect(developedByText.className).toBeTruthy();
    expect(rsSchoolText.className).toBeTruthy();
    expect(yearText.className).toBeTruthy();
  });

  it('has correct structure with two lines', () => {
    renderWithIntl();

    const developedByText = screen.getByText('Developed by');
    const rsSchoolText = screen.getByText('RS School');

    const line1 = developedByText.closest('div');
    const line2 = rsSchoolText.closest('div');

    expect(line1).not.toBe(line2);
    expect(line1).toBeInTheDocument();
    expect(line2).toBeInTheDocument();

    expect(line1?.className).toBeTruthy();
    expect(line2?.className).toBeTruthy();
  });

  it('all links open in new tab with security attributes', () => {
    renderWithIntl();

    const links = screen.getAllByRole('link');

    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});
