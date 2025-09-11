import { getHistoryByUserAction, getCurrentUserIdAction } from '@/lib/actions/server-actions';
import HistoryPageClient from '@/components/history/history-page-client';
import { Link } from '@/i18n/navigation';
import './history.css';

export default async function HistoryPage() {
  const userId = await getCurrentUserIdAction();

  if (!userId) {
    return (
      <div className='history-wrapper'>
        <div className='modal'>
          <h2 className='warn'>You are not authorized.</h2>
          <Link href='/signin'>Sign In</Link>
          <p className='error'>Authorization is necessary to view history.</p>
          <HistoryPageClient initialData={null} />
        </div>
      </div>
    );
  }

  try {
    const result = await getHistoryByUserAction(userId);
    if (result.count === 0) {
      return (
        <div className='history-wrapper'>
          <div className='modal'>
            <h2 className='warn'>You have not made any requests yet. {result.message}</h2>
            <Link href='/client'>Create a new request</Link>
            <HistoryPageClient initialData={null} />
          </div>
        </div>
      );
    }
    if (!result.success) {
      return (
        <div className='history-wrapper'>
          <div className='modal'>
            <h2 className='warn'>No logs available. {result.message}</h2>
            <Link href='/client'>Create a new request</Link>
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
    console.error('Server Error loading logs:', error);
    return (
      <div className='history-wrapper'>
        <div className='modal'>
          <h2 className='warn'>No logs available due to a server error.</h2>
          <Link href='/client'>Create a new request</Link>
          <HistoryPageClient initialData={null} />
        </div>
      </div>
    );
  }
}
