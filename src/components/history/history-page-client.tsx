'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { handleGetLogUserById } from '@/lib/client-action/handle-getlog-user';
import { GetLogsResult } from '@/type/type';
import HistoryTable from '@/components/history/history-table';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';

interface HistoryPageClientProps {
  initialData: GetLogsResult | null;
}

export default function HistoryPageClient({ initialData }: HistoryPageClientProps) {
  const { user } = useAuth();
  const t = useTranslations('HistoryPage');
  const [result, setResult] = useState<GetLogsResult | null>(initialData);
  const [loading, setLoading] = useState(false);

  const refreshLogs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const newResult = await handleGetLogUserById(user.uid, t);
      if (newResult.success) {
        setResult(newResult);
      } else {
        toast.error(newResult.message || t('refreshError'));
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('refreshError');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (result?.success && result.data && result.data.length > 0) {
    return (
      <>
        <button onClick={refreshLogs} disabled={loading}>
          {loading ? t('refreshing') : t('refreshButton')}
        </button>
        <h3>{t('userLogs', { user: user?.email || 'unknown', count: result.count })}</h3>
        <HistoryTable logs={result.data} />
      </>
    );
  }

  return (
    <>
      {user && (
        <button onClick={refreshLogs} disabled={loading}>
          {loading ? t('loading') : t('refreshButton')}
        </button>
      )}
    </>
  );
}
