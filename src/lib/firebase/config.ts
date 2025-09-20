import { err } from '@/log';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  app = {} as FirebaseApp;
  err('Firebase config error:', error);
}

let auth: Auth;
let db: ReturnType<typeof getFirestore>;

try {
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  auth = {} as Auth;
  db = {} as ReturnType<typeof getFirestore>;
  err('Firebase config error:', error);
}

export { app, auth, db };

export const getCurrentUserId = (): string | null => {
  try {
    return auth.currentUser?.uid || null;
  } catch {
    return null;
  }
};
