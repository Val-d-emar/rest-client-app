'use server';

import { collection, addDoc, Timestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { HttpRequestLog, AddLogResult, GetLogsResult } from '@/type/type';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { dbg } from '@/log';

type FirestoreHttpRequestLog = Omit<HttpRequestLog, 'timestamp'> & {
  timestamp: Timestamp;
};

export async function addHistoryLogAction(logData: HttpRequestLog): Promise<AddLogResult> {
  try {
    const cleanedData: FirestoreHttpRequestLog = {
      ...logData,
      timestamp: Timestamp.fromDate(logData.timestamp),
    };

    Object.keys(cleanedData).forEach((key) => {
      const typedKey = key as keyof FirestoreHttpRequestLog;
      if (cleanedData[typedKey] === undefined) {
        delete cleanedData[typedKey];
      }
    });

    const docRef = await addDoc(collection(db, 'history'), cleanedData);
    revalidatePath('/');
    return {
      success: true,
      id: docRef.id,
      message: 'Log successfully added',
      messageCode: 'LOG_ADDED_SUCCESS',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Error adding log',
      messageCode: 'LOG_ADD_ERROR',
    };
  }
}

export async function getHistoryByUserAction(userId: string): Promise<GetLogsResult> {
  try {
    const gettingLogs = query(
      collection(db, 'history'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
    );

    const querySnapshot = await getDocs(gettingLogs);
    const logs: HttpRequestLog[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      logs.push({
        userId: data.userId,
        latency: data.latency,
        statusCode: data.statusCode,
        statusText: data.statusText,
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

    return {
      success: true,
      data: logs,
      count: logs.length,
      message: `Received ${logs.length} entries`,
      messageCode: 'LOGS_RECEIVED',
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Error getting logs',
      messageCode: 'LOGS_GET_ERROR',
    };
  }
}

export async function getCurrentUserIdAction(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('userId');

    if (userIdCookie?.value) {
      return userIdCookie.value;
    }
    return null;
  } catch (error) {
    dbg(error);
    return null;
  }
}
