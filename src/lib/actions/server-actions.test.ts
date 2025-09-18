vi.mock('@/lib/firebase/config', () => ({
  db: vi.fn(),
}));
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  addHistoryLogAction,
  getHistoryByUserAction,
  getCurrentUserIdAction,
} from './server-actions';
import { HttpRequestLog } from '@/type/type';
import { db } from '@/lib/firebase/config';

vi.mock('firebase/firestore');
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/headers', () => ({ cookies: vi.fn() }));

import {
  collection,
  addDoc,
  getDocs,
  Timestamp as MockTimestamp,
  DocumentReference,
  QuerySnapshot,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { cookies } from 'next/headers';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

describe('Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addHistoryLogAction', () => {
    const mockLogData: HttpRequestLog = {
      userId: 'user123',
      timestamp: new Date(),
    } as HttpRequestLog;

    it('should successfully add a log', async () => {
      vi.mocked(addDoc).mockResolvedValue({ id: 'doc123' } as DocumentReference);

      const result = await addHistoryLogAction(mockLogData);

      expect(MockTimestamp.fromDate).toHaveBeenCalledWith(mockLogData.timestamp);

      expect(collection).toHaveBeenCalledWith(db, 'history');

      expect(addDoc).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.id).toBe('doc123');
    });

    it('should return an error if addDoc fails', async () => {
      const testError = new Error('Firestore write failed');
      vi.mocked(addDoc).mockRejectedValue(testError);

      const result = await addHistoryLogAction(mockLogData);

      expect(result.success).toBe(false);
      expect(result.error).toBe(testError.message);
    });
  });

  describe('getHistoryByUserAction', () => {
    it('should return user logs on success', async () => {
      const mockDate = new Date();
      const mockFirestoreDoc = {
        data: () => ({ userId: 'user123', timestamp: { toDate: () => mockDate } }),
      };

      vi.mocked(getDocs).mockResolvedValue({
        docs: [mockFirestoreDoc],

        forEach: (callback: (doc: QueryDocumentSnapshot<DocumentData>) => void) => {
          [mockFirestoreDoc].forEach((doc) =>
            callback(doc as unknown as QueryDocumentSnapshot<DocumentData>),
          );
        },
      } as unknown as QuerySnapshot<DocumentData>);

      const result = await getHistoryByUserAction('user123');

      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
    });

    it('should return an error if getDocs fails', async () => {
      const testError = new Error('Firestore read failed');
      vi.mocked(getDocs).mockRejectedValue(testError);

      const result = await getHistoryByUserAction('user123');

      expect(result.success).toBe(false);
      expect(result.error).toBe(testError.message);
    });
  });

  describe('getCurrentUserIdAction', () => {
    it('should return user ID from cookie', async () => {
      const mockCookieStore = {
        get: vi.fn().mockReturnValue({ value: 'user-from-cookie' }),
      };
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as unknown as ReadonlyRequestCookies);

      const userId = await getCurrentUserIdAction();
      expect(userId).toBe('user-from-cookie');
    });

    it('should return null if cookie does not exist', async () => {
      const mockCookieStore = {
        get: vi.fn().mockReturnValue(undefined),
      };
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as unknown as ReadonlyRequestCookies);

      const userId = await getCurrentUserIdAction();
      expect(userId).toBeNull();
    });
  });
});
