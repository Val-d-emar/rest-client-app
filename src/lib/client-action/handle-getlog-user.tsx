import { getHttpRequestLogsByUserAction } from '@/lib/actions/server-actions';
import { getCurrentUserId } from '@/lib/firebase/config';
import toast from 'react-hot-toast';
import { GetLogsResult } from '@/type/type';

export const handleGetLogUser = async (): Promise<GetLogsResult> => {
  const toastId = toast.loading("loading the user's logs...");

  try {
    const currentUserId = getCurrentUserId() || 'anonymous';

    console.log('Loading logs for user:', currentUserId);

    const result = await getHttpRequestLogsByUserAction(currentUserId);

    if (result.success) {
      toast.success(`${result.message}`, {
        id: toastId,
        duration: 4000,
        style: {
          background: '#059669',
          color: 'white',
        },
      });
      console.log(` Loaded ${result.count} logs for user ${currentUserId}`);

      return {
        success: true,
        data: result.data,
        count: result.count,
        message: result.message,
      };
    } else {
      toast.error(`${result.message}\n Ошибка: ${result.error}`, {
        id: toastId,
        duration: 5000,
        style: {
          background: '#DC2626',
          color: 'white',
        },
      });

      return {
        success: false,
        data: [],
        count: 0,
        message: result.message,
        error: result.error,
      };
    }
  } catch (error) {
    toast.error(`💥 Critical error: ${error}`, {
      id: toastId,
      duration: 6000,
      style: {
        background: '#B91C1C',
        color: 'white',
      },
    });

    return {
      success: false,
      data: [],
      count: 0,
      message: 'Critical error occurred',
      error: String(error),
    };
  }
};
