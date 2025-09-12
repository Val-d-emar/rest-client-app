import { getHistoryByUserAction } from '@/lib/actions/server-actions';
import { getCurrentUserId } from '@/lib/firebase/config';
import { GetLogsResult } from '@/type/type';

export const handleGetLogUserById = async (
  userId: string,
  t?: (key: string) => string,
): Promise<GetLogsResult> => {
  try {
    const result = await getHistoryByUserAction(userId);

    if (result.success) {
      return {
        success: true,
        data: result.data,
        count: result.count,
        message: result.message,
      };
    } else {
      return {
        success: false,
        data: [],
        count: 0,
        message: result.message,
        error: result.error,
      };
    }
  } catch (error) {
    const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
    const errorMessage =
      isNetworkError && t ? t('networkError') : t ? t('refreshError') : 'Critical error occurred';

    return {
      success: false,
      data: [],
      count: 0,
      message: errorMessage,
      error: String(error),
    };
  }
};

// Функция для получения логов текущего пользователя для тестового примера в style
export const handleGetLogUser = async (): Promise<GetLogsResult> => {
  try {
    const currentUserId = getCurrentUserId() || 'anonymous';
    const result = await getHistoryByUserAction(currentUserId);

    if (result.success) {
      return {
        success: true,
        data: result.data,
        count: result.count,
        message: result.message,
      };
    } else {
      return {
        success: false,
        data: [],
        count: 0,
        message: result.message,
        error: result.error,
      };
    }
  } catch (error) {
    return {
      success: false,
      data: [],
      count: 0,
      message: 'Critical error occurred',
      error: String(error),
    };
  }
};
