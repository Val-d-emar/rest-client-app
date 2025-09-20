'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onIdTokenChanged,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { UserCookieManager } from '@/lib/utils/cookie-manager';
import { dbg, err } from '@/log';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';

interface AuthError extends Error {
  originalError?: unknown;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: (t?: (key: string) => string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('AuthForm');
  const tAuthFailed = t ? t('AuthFailed') : 'Auth failed. Please try again.';
  const tFirebaseConfigError = t ? t('firebaseConfigError') : 'Firebase config error.';

  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
        dbg('Firebase auth state changed:', firebaseUser);

        setUser(firebaseUser);

        setLoading(false);

        if (firebaseUser) {
          UserCookieManager.setUserId(firebaseUser.uid);
        } else if (isSigningOut) {
          UserCookieManager.removeUserId();
          setIsSigningOut(false);
        }
      });
    } catch (error) {
      dbg('Firebase auth error:', error);
      setLoading(false);
      let translatedError = tAuthFailed;
      if ((error as Error)?.message.includes('is not a function')) {
        err(tFirebaseConfigError, (error as Error)?.message);
        translatedError = tFirebaseConfigError;
      }
      toast.error(translatedError);
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isSigningOut, tAuthFailed, tFirebaseConfigError]);

  const signUp = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      dbg('User signed up successfully:', userCredential.user);
    } catch (error) {
      err('Error signing Up:', error);
      let translatedError: AuthError = new Error(
        t ? t('signUpFailed') + (error as Error)?.message : 'Sign Up failed. Please try again.',
      );
      if ((error as Error)?.message.includes('is not a function')) {
        err(tFirebaseConfigError, (error as Error)?.message);
        translatedError = new Error(tFirebaseConfigError);
      }
      translatedError.originalError = error;
      throw translatedError;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      dbg('User signed in successfully:', userCredential.user);
    } catch (error) {
      err('Error signing in:', error);
      let translatedError: AuthError = new Error(
        t ? t('signInFailed') + (error as Error)?.message : 'Sign in failed. Please try again.',
      );
      if ((error as Error)?.message.includes('is not a function')) {
        err(tFirebaseConfigError, (error as Error)?.message);
        translatedError = new Error(tFirebaseConfigError);
      }
      translatedError.originalError = error;
      throw translatedError;
    }
  };

  const signOut = async () => {
    try {
      setIsSigningOut(true);
      await firebaseSignOut(auth);
      dbg('User signed out successfully');
    } catch (error) {
      err('Error signing out:', error);
      let translatedError: AuthError = new Error(
        t ? t('signInFailed') + (error as Error)?.message : 'Sign in failed. Please try again.',
      );
      if ((error as Error)?.message.includes('is not a function')) {
        err(tFirebaseConfigError, (error as Error)?.message);
        translatedError = new Error(tFirebaseConfigError);
      }
      translatedError.originalError = error;

      setIsSigningOut(false);
      throw translatedError;
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
