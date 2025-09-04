import { use } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';

type Props = {
  params: Promise<{ locale: string }>;
};

export default function Home({ params }: Props) {
  const { locale } = use(params);

  setRequestLocale(locale);

  const t = useTranslations('HomePage');

  return (
    <main>
      <h1>{t('title')}</h1>
    </main>
  );
}
