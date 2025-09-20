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

interface AuthError extends Error {
  originalError?: unknown;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string, t?: (key: string) => string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
      if (process.env.NODE_ENV === 'development') {
        dbg('Firebase auth not available without .env.local');
        setLoading(false);
        return;
      } else {
        err('Firebase auth initialization error:', error);
        throw error;
      }
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isSigningOut]);

  const signUp = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      dbg('User signed up successfully:', userCredential.user);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        dbg('Sign up not available without Firebase configuration');
        throw new Error('Authentication not available in development mode');
      }
      err('Error signing up:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string, t?: (key: string) => string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      dbg('User signed in successfully:', userCredential.user);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        dbg('Sign in not available without Firebase configuration');
        throw new Error('Authentication not available in development mode');
      }
      err('Error signing in:', error);
      const translatedError: AuthError = new Error(
        t ? t('signInFailed') : 'Sign in failed. Please try again.',
      );
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
      if (process.env.NODE_ENV === 'development') {
        dbg('Sign out not available without Firebase configuration');
        setIsSigningOut(false);
        return;
      }
      err('Error signing out:', error);
      setIsSigningOut(false);
      throw error;
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
