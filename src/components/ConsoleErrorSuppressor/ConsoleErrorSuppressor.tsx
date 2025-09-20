'use client';

import { useEffect } from 'react';

export default function ConsoleErrorSuppressor() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const originalError = console.error;
      const originalWarn = console.warn;

      console.error = (...args: unknown[]) => {
        const message = args.join(' ');

        if (
          message.includes('FirebaseError: Firebase: Error (auth/invalid-api-key)') ||
          message.includes('The above error occurred in the <Lazy> component') ||
          message.includes('The above error occurred in the <AuthProvider> component') ||
          message.includes('It was handled by the <ErrorBoundary> error boundary') ||
          message.includes('auth/invalid-api-key') ||
          message.includes('Firebase: Error') ||
          message.includes('onIdTokenChanged is not a function') ||
          message.includes('getModularInstance') ||
          message.includes('TypeError:')
        ) {
          return;
        }

        originalError.apply(console, args);
      };

      console.warn = (...args: unknown[]) => {
        const message = args.join(' ');

        if (message.includes('Firebase') || message.includes('auth/invalid-api-key')) {
          return;
        }

        originalWarn.apply(console, args);
      };

      return () => {
        console.error = originalError;
        console.warn = originalWarn;
      };
    }
  }, []);

  return null;
}
