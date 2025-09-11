import { getHistoryByUserAction } from '@/lib/actions/server-actions';
import { getCurrentUserId } from '@/lib/firebase/config';
import { GetLogsResult } from '@/type/type';

// Функция для получения логов конкретного пользователя
export const handleGetLogUserById = async (userId: string): Promise<GetLogsResult> => {
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
    return {
      success: false,
      data: [],
      count: 0,
      message: 'Critical error occurred',
      error: String(error),
    };
  }
};

// Функция для получения логов текущего пользователя (использует getCurrentUserId)
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
