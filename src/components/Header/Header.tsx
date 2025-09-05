import LocaleSwitcher from '@/components/LocaleSwitcher';
import { useTranslations } from 'next-intl';

export default function Header() {
  const t = useTranslations('HomePage');
  return (
    <header>
      <h1>{t('title')}</h1>
      <LocaleSwitcher />
    </header>
  );
}
