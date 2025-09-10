import { addHistoryLogAction } from '@/lib/actions/server-actions';
import { getCurrentUserId } from '@/lib/firebase/config';
import toast from 'react-hot-toast';
import { HttpRequestLog, AddLogResult } from '@/type/type';

export const handleAddLog = async (logData: HttpRequestLog): Promise<AddLogResult> => {
  const toastId = toast.loading('recording...');

  try {
    const currentUserId = getCurrentUserId() || 'anonymous';

    const finalLogData = {
      ...logData,
      userId: currentUserId,
    };

    const result = await addHistoryLogAction(finalLogData);

    if (result.success) {
      toast.success(`${result.message}\n ID: ${result.id}`, {
        id: toastId,
        duration: 4000,
        style: {
          background: '#10B981',
          color: 'white',
        },
      });
    } else {
      toast.error(`${result.message}\n Error: ${result.error}`, {
        id: toastId,
        duration: 5000,
        style: {
          background: '#EF4444',
          color: 'white',
        },
      });
      console.error('Server Action is completed with an error:', result);
    }

    return result;
  } catch (error) {
    toast.error(`💥 Critical error: ${error}`, {
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
