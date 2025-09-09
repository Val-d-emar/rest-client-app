import { addHttpRequestLog } from '@/lib/firebase/firebase-sdk';
import { auth } from '@/lib/firebase/config';
import { HttpRequestLog } from '@/type/type';
import toast from 'react-hot-toast';
import { getCurrentUserId } from '@/lib/firebase/config';

// пример данных для лога
export const currentUserId = getCurrentUserId() || 'anonymous';
export const logData = {
  userId: currentUserId || 'anonymous',
  latency: Math.floor(Math.random() * 1000) + 50,
  statusCode: 200,
  timestamp: new Date(),
  method: 'POST',
  requestSize: 256,
  responseSize: 512,
  url: '/api/example.com/test',
  requestBody: JSON.stringify({ test: 'data', timestamp: new Date().toISOString() }),
  headers: { 'Content-Type': 'application/json', 'User-Agent': 'REST-Client-App' },
  // errorDetails нет
};

const handleRecordLog = async (logData: HttpRequestLog) => {
  try {
    const currentUserId = auth.currentUser?.uid || 'anonymous';
    const recordData = { ...logData, userId: currentUserId };

    const docId = await addHttpRequestLog(recordData);

    const toastId = toast.loading('recording...');
    toast.success('Recorded : ' + docId, { id: toastId });
  } catch (error) {
    toast.error('Error when recording logs: ' + error);
  }
};
export default handleRecordLog;
