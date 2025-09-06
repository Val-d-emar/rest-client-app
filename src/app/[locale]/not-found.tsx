import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('NotFoundPage');
  return (
    <div className='centered-container'>
      <h1>404</h1>
      <h2>{t('title')}</h2>
      <p>{t('sorry')}</p>
      <Link href='/'>
        <button type='button'>{t('btn')}</button>
      </Link>
    </div>
  );
}
