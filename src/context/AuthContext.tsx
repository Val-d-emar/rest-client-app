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
import { dbg, err } from '@/log';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      dbg('Firebase auth state changed:', firebaseUser);
      if (firebaseUser) {
        try {
          await firebaseUser.getIdToken(true);
          setUser(firebaseUser);
          dbg('User session is valid.');
        } catch (error) {
          dbg('User session invalid, signing out:', error);
          toast.error('Your session has expired. Please sign in again.');
          await firebaseSignOut(auth);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // const newUser = userCredential.user;
      // if (newUser) {
      //   const userDocRef = doc(db, 'users', newUser.uid);
      //   await setDoc(userDocRef, {
      //     email: newUser.email,
      //     createdAt: new Date(),
      //     displayName: email.split('@').at(0) ?? 'Anonymous',
      //   });
      //   dbg('User profile created in Firestore for UID:', newUser.uid);
      // }

      dbg('User signed up successfully:', userCredential.user);
    } catch (error) {
      err('Error signing up:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      dbg('User signed in successfully:', userCredential.user);
    } catch (error) {
      err('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      dbg('User signed out successfully');
    } catch (error) {
      err('Error signing out:', error);
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
