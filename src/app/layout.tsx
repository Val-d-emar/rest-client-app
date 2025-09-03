import type { Metadata } from 'next';
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = 'en'; // или 'ru', для переключения языка
  return (
    <html lang={lang}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="language" content="en,ru" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${roboto.variable} ${inter.variable}`}>{children}</body>
    </html>
  );
}
