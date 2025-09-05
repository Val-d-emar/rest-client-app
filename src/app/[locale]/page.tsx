import { use } from 'react';
import { setRequestLocale } from 'next-intl/server';
import MainPage from '@/components/MainPage/MainPage';

type Props = {
  params: Promise<{ locale: string }>;
};

export default function Home({ params }: Props) {
  const { locale } = use(params);

  setRequestLocale(locale);

  return <MainPage isLoggedIn={false} />;
}
