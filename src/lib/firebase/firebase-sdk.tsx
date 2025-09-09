import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from './config';

import { HttpRequestLog } from '@/type/type';

export async function addHttpRequestLog(logData: HttpRequestLog) {
  try {
    const cleanedData: any = {
      ...logData,
      timestamp: Timestamp.fromDate(logData.timestamp),
    };

    Object.keys(cleanedData).forEach((key) => {
      if (cleanedData[key] === undefined) {
        delete cleanedData[key];
      }
    });

    const docRef = await addDoc(collection(db, 'requestLogs'), cleanedData);
    return docRef.id;
  } catch (e) {
    console.error('Error adding document: ', e);
    throw e;
  }
}
// не отлажено
export async function getHttpRequestLogsByUser(userId: string): Promise<HttpRequestLog[]> {
  const logs: HttpRequestLog[] = [];
  try {
    const q = query(
      collection(db, 'requestLogs'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      logs.push({
        userId: data.userId,
        latency: data.latency,
        statusCode: data.statusCode,
        timestamp: data.timestamp.toDate(),
        method: data.method,
        requestSize: data.requestSize,
        responseSize: data.responseSize,
        url: data.url,
        requestBody: data.requestBody,
        headers: data.headers,
        errorDetails: data.errorDetails,
      });
    });
  } catch (e) {
    console.error('Error getting documents: ', e);
  }
  return logs;
}
