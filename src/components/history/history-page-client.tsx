'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { handleGetLogUserById } from '@/lib/client-action/handle-getlog-user';
import { GetLogsResult } from '@/type/type';
import HistoryTable from '@/components/history/history-table';

interface HistoryPageClientProps {
  initialData: GetLogsResult | null;
}

export default function HistoryPageClient({ initialData }: HistoryPageClientProps) {
  const { user } = useAuth();
  const [result, setResult] = useState<GetLogsResult | null>(initialData);
  const [loading, setLoading] = useState(false);

  const refreshLogs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const newResult = await handleGetLogUserById(user.uid);
      setResult(newResult);
    } catch (error) {
      console.error('Error refreshing logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (result?.success && result.data && result.data.length > 0) {
    return (
      <>
        <button onClick={refreshLogs} disabled={loading}>
          {loading ? 'Updating...' : 'Refresh Logs'}
        </button>
        <h3>
          Logs for user ({user?.email}) - {result.count} entries
        </h3>
        <HistoryTable logs={result.data} />
      </>
    );
  }

  return (
    <>
      {user && (
        <button onClick={refreshLogs} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Logs'}
        </button>
      )}
    </>
  );
}
