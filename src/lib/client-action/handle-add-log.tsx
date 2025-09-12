import { addHistoryLogAction } from '@/lib/actions/server-actions';
import { getCurrentUserId } from '@/lib/firebase/config';
import toast from 'react-hot-toast';
import { HttpRequestLog, AddLogResult } from '@/type/type';
import { useTranslations } from 'next-intl';

export const handleAddLog = async (
  logData: HttpRequestLog,
  t: ReturnType<typeof useTranslations>,
): Promise<AddLogResult> => {
  const toastId = toast.loading(t('client.recording') || 'recording...');

  try {
    const currentUserId = getCurrentUserId() || 'anonymous';

    const finalLogData = {
      ...logData,
      userId: currentUserId,
    };

    const result = await addHistoryLogAction(finalLogData);

    if (result.success) {
      const message = result.messageCode
        ? t(`serverMessages.${result.messageCode}`) || result.message
        : result.message;

      toast.success(`${message}\n ID: ${result.id}`, {
        id: toastId,
        duration: 4000,
        style: {
          background: '#10B981',
          color: 'white',
        },
      });
    } else {
      const message = result.messageCode
        ? t(`serverMessages.${result.messageCode}`) || result.message
        : result.message;

      toast.error(`${message}\n Error: ${result.error}`, {
        id: toastId,
        duration: 5000,
        style: {
          background: '#EF4444',
          color: 'white',
        },
      });
    }

    return result;
  } catch (error) {
    toast.error(`💥 ${t('client.criticalError') || 'Critical error'}`, {
      id: toastId,
      duration: 6000,
      style: {
        background: '#DC2626',
        color: 'white',
      },
    });
    throw error;
  }
};
