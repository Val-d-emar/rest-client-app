import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import { Roboto, Inter, Ubuntu } from 'next/font/google';
import './index.css';

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin', 'cyrillic'],
  weight: ['100', '300', '400', '500', '700', '900'],
  style: ['normal', 'italic'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'cyrillic'],
  weight: ['100', '300', '400', '500', '700', '900'],
  style: ['normal', 'italic'],
});

const ubuntu = Ubuntu({
  variable: '--font-ubuntu',
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '700'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'REST Client App',
  description: 'Client for working with REST API',
  other: {
    language: 'en,ru',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html>
      <body className={`${roboto.variable} ${inter.variable} ${ubuntu.variable}`}>{children}</body>
    </html>
  );
}
