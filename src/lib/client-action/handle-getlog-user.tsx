import { TIMEOUT_DURATION } from '@/constants/constants';
import { getHistoryByUserAction } from '@/lib/actions/server-actions';
import { GetLogsResult } from '@/type/type';
import { TimeoutError, withTimeout } from '../utils/timeout';

export const handleGetLogUserById = async (
  userId: string,
  t?: (key: string) => string,
): Promise<GetLogsResult> => {
  try {
    const result = await withTimeout(getHistoryByUserAction(userId), TIMEOUT_DURATION);

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
    const isTimeoutError = error instanceof TimeoutError;
    const errorMessage =
      isNetworkError && t
        ? t('networkError')
        : isTimeoutError && t
          ? t('timeoutError')
          : t
            ? t('refreshError')
            : 'Critical error occurred';

    return {
      success: false,
      data: [],
      count: 0,
      message: errorMessage,
      error: String(error),
    };
  }
};
