import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Roboto, Inter } from 'next/font/google';
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

export const metadata: Metadata = {
  title: 'REST Client App',
  description: 'Client for working with REST API',
  viewport: 'width=device-width, initial-scale=1.0',
  other: {
    language: 'en,ru',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html>
      <head></head>
      <body className={`${roboto.variable} ${inter.variable}`}>{children}</body>
    </html>
  );
}
