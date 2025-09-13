import { getHistoryByUserAction, getCurrentUserIdAction } from '@/lib/actions/server-actions';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { Suspense, lazy } from 'react';
import { redirect } from 'next/navigation';
import './history.css';
import Spinner from '@/components/Spinner/Spinner';

const HistoryPageClient = lazy(() => import('@/components/history/history-page-client'));
interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export default async function HistoryPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('HistoryPage');
  const userId = await getCurrentUserIdAction();

  if (!userId) {
    redirect(`/${locale}/auth/signin`);
  }

  try {
    const result = await getHistoryByUserAction(userId);
    if (result.count === 0) {
      return (
        <div className='history-wrapper'>
          <div className='modal'>
            <h2 className='warn'>{t('noRequestsYet')}</h2>
            <Link href='/client'>{t('createNewRequest')}</Link>
            <Suspense fallback={<Spinner />}>
              <HistoryPageClient initialData={null} />
            </Suspense>
          </div>
        </div>
      );
    }
    if (!result.success) {
      const message = result.messageCode
        ? t(`serverMessages.${result.messageCode}`)
        : result.message;
      return (
        <div className='history-wrapper'>
          <div className='modal'>
            <h2 className='warn'>
              {t('noLogsAvailable')} {message}
            </h2>
            <Link href='/client'>{t('createNewRequest')}</Link>
            <Suspense fallback={<Spinner />}>
              <HistoryPageClient initialData={null} />
            </Suspense>
          </div>
        </div>
      );
    }
    return (
      <div className='history-wrapper'>
        <Suspense fallback={<Spinner />}>
          <HistoryPageClient initialData={result} />
        </Suspense>
      </div>
    );
  } catch (error) {
    return (
      <div className='history-wrapper'>
        <div className='modal'>
          <h2 className='warn'>{t('serverError')}</h2>
          <Link href='/client'>{t('createNewRequest')}</Link>
          <Suspense fallback={<Spinner />}>
            <HistoryPageClient initialData={null} />
          </Suspense>
        </div>
      </div>
    );
  }
}
