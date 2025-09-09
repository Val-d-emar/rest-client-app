'use client';

import { useState, useEffect } from 'react';
import { dbg, warn } from '@/log';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      dbg(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = (value: T) => {
    if (typeof window === 'undefined') {
      warn(`Tried setting localStorage key “${key}” even though environment is not a client`);
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      setStoredValue(value);
    } catch (error) {
      dbg(`Error setting localStorage key “${key}”:`, error);
    }
  };

  useEffect(() => {
    setStoredValue(readValue());
  }, []);

  return [storedValue, setValue];
}
