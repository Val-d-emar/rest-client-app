import { getHistoryByUserAction, getCurrentUserIdAction } from '@/lib/actions/server-actions';
import HistoryPageClient from '@/components/history/history-page-client';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import './history.css';

export default async function HistoryPage() {
  const t = await getTranslations('HistoryPage');
  const userId = await getCurrentUserIdAction();

  if (!userId) {
    return (
      <div className='history-wrapper'>
        <div className='modal'>
          <h2 className='warn'>{t('notAuthorized')}</h2>
          <Link href='/signin'>{t('signIn')}</Link>
          <p className='error'>{t('authRequired')}</p>
          <HistoryPageClient initialData={null} />
        </div>
      </div>
    );
  }

  try {
    const result = await getHistoryByUserAction(userId);
    if (result.count === 0) {
      const message = result.messageCode
        ? t(`serverMessages.${result.messageCode}`, { count: result.count })
        : result.message;
      return (
        <div className='history-wrapper'>
          <div className='modal'>
            <h2 className='warn'>
              {t('noRequestsYet')} {message}
            </h2>
            <Link href='/client'>{t('createNewRequest')}</Link>
            <HistoryPageClient initialData={null} />
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
            <HistoryPageClient initialData={null} />
          </div>
        </div>
      );
    }
    return (
      <div className='history-wrapper'>
        <HistoryPageClient initialData={result} />
      </div>
    );
  } catch (error) {
    return (
      <div className='history-wrapper'>
        <div className='modal'>
          <h2 className='warn'>{t('serverError')}</h2>
          <Link href='/client'>{t('createNewRequest')}</Link>
          <HistoryPageClient initialData={null} />
        </div>
      </div>
    );
  }
}
