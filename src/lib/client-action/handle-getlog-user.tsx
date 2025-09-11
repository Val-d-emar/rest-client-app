import { getHistoryByUserAction } from '@/lib/actions/server-actions';
import { getCurrentUserId } from '@/lib/firebase/config';
import { GetLogsResult } from '@/type/type';

// Функция для получения логов конкретного пользователя
export const handleGetLogUserById = async (userId: string): Promise<GetLogsResult> => {
  try {
    console.log('Loading logs for user:', userId);

    const result = await getHistoryByUserAction(userId);

    if (result.success) {
      console.log(`Loaded ${result.count} logs for user ${userId}`);
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
    console.error('Critical error in handleGetLogUserById:', error);
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
    console.log('Loading logs for user:', currentUserId);

    const result = await getHistoryByUserAction(currentUserId);

    if (result.success) {
      console.log(` Loaded ${result.count} logs for user ${currentUserId}`);
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
    console.error('Critical error in handleGetLogUser:', error);
    return {
      success: false,
      data: [],
      count: 0,
      message: 'Critical error occurred',
      error: String(error),
    };
  }
};
