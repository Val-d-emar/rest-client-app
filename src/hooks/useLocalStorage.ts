'use client';

import { useState, useCallback, Dispatch, SetStateAction } from 'react';
import { dbg } from '@/log';

export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      dbg(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  });

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value) => {
      try {
        setStoredValue(value);
        if (typeof window !== 'undefined') {
          if (value instanceof Function) {
            setStoredValue((prev) => {
              const newValue = value(prev);
              window.localStorage.setItem(key, JSON.stringify(newValue));
              return newValue;
            });
          } else {
            window.localStorage.setItem(key, JSON.stringify(value));
          }
        }
      } catch (error) {
        dbg(`Error setting localStorage key “${key}”:`, error);
      }
    },
    [key],
  );

  return [storedValue, setValue];
}
